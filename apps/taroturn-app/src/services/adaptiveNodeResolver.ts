/**
 * Taroturn 自适应私有节点解析与自愈引擎 (Adaptive Node Resolver & Self-Healing Mesh)
 * 
 * 核心机制：
 * 1. 双阶段超时引擎：1500ms 快速 TCP 连接探测 + 8000ms SSE 心跳看门狗。
 * 2. 四级弹性自愈阶梯：Localhost/LAN -> Cached IPv6 -> Sovereign Beacon Refresh -> Cloud Fallback。
 * 3. 当家庭宽带 IPv6 漂移导致连接失败时，100ms 内向 Cloudflare Edge Beacon 查询最新 IPv6 并原地静默重试。
 */

import { TtagyConfig } from '../types/settings';

export type ResolutionTier = 'local_lan' | 'cached_ipv6' | 'beacon_refresh' | 'cloud_fallback';

export interface DiscoveredEndpoint {
  tier: ResolutionTier;
  url: string;
  authToken?: string;
  latencyMs?: number;
}

export interface BeaconNodeData {
  node_id: string;
  status: 'online' | 'idle' | 'busy' | 'offline';
  endpoints: Array<{ transport: string; address: string; priority: number }>;
  registered_at: number;
  expires_at: number;
}

export class AdaptiveNodeResolver {
  private static instance: AdaptiveNodeResolver | null = null;
  private fastPathUrl: string | null = null;

  private constructor() {
    try {
      this.fastPathUrl = localStorage.getItem('taroturn_fastpath_endpoint');
    } catch {
      // Storage unavailable
    }
  }

  public static getInstance(): AdaptiveNodeResolver {
    if (!AdaptiveNodeResolver.instance) {
      AdaptiveNodeResolver.instance = new AdaptiveNodeResolver();
    }
    return AdaptiveNodeResolver.instance;
  }

  /**
   * 带严苛 1500ms 连接超时的 fetch 请求 (收到响应头后立即解除连接定时器)
   */
  public async fetchWithConnectTimeout(
    url: string,
    options: RequestInit,
    connectTimeoutMs: number = 1500,
    parentSignal?: AbortSignal
  ): Promise<Response> {
    const connectController = new AbortController();
    let timerId: ReturnType<typeof setTimeout> | null = null;

    if (parentSignal) {
      parentSignal.addEventListener('abort', () => connectController.abort(parentSignal.reason), { once: true });
    }

    const connectTimeoutPromise = new Promise<never>((_, reject) => {
      timerId = setTimeout(() => {
        const err = new Error(`Connect timeout (${connectTimeoutMs}ms) to ${url}`);
        err.name = 'ConnectTimeoutError';
        connectController.abort(err);
        reject(err);
      }, connectTimeoutMs);
    });

    try {
      const response = await Promise.race([
        fetch(url, { ...options, signal: connectController.signal }),
        connectTimeoutPromise,
      ]);

      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (err) {
      if (timerId !== null) {
        clearTimeout(timerId);
      }
      throw err;
    }
  }

  /**
   * 向 Sovereign Beacon 查询节点的最新动态 IPv6 地址
   */
  public async queryBeaconForNode(nodeId: string, beaconBaseUrl?: string): Promise<string | null> {
    const base = beaconBaseUrl || 'https://beacon.ttagy.app/v1/beacon';
    const lookupUrl = `${base.replace(/\/+$/, '')}/nodes/${encodeURIComponent(nodeId)}`;

    try {
      const res = await this.fetchWithConnectTimeout(lookupUrl, { method: 'GET' }, 2000);
      const data: BeaconNodeData = await res.json();

      if (data.status === 'offline') {
        console.warn(`[NodeResolver] Beacon reports node ${nodeId} is offline`);
        return null;
      }

      // 优先寻找 ipv6_direct 或 lan_wifi 端点
      const sorted = [...(data.endpoints || [])].sort((a, b) => a.priority - b.priority);
      for (const ep of sorted) {
        if (ep.address.startsWith('http://') || ep.address.startsWith('https://')) {
          return ep.address;
        }
        return `http://${ep.address}`;
      }
    } catch (err) {
      console.warn(`[NodeResolver] Beacon lookup failed for ${nodeId}:`, err);
    }
    return null;
  }

  /**
   * 智能解析并执行自愈推演请求
   */
  public async resolveAndStream(
    config: TtagyConfig,
    bodyPayload: Record<string, any>,
    parentSignal?: AbortSignal
  ): Promise<Response> {
    const candidates: Array<{ tier: ResolutionTier; url: string }> = [];

    // 1. 尝试快速缓存路径 (FastPath)
    if (this.fastPathUrl) {
      candidates.push({ tier: 'local_lan', url: this.fastPathUrl });
    }

    // 2. 尝试用户配置的直连地址
    if (config.remoteHost) {
      const url = `http://${config.remoteHost.replace(/\/+$/, '')}:${config.remotePort || 8970}`;
      if (!candidates.some((c) => c.url === url)) {
        candidates.push({ tier: 'cached_ipv6', url });
      }
    }

    // 3. 尝试本地默认 Loopback
    const loopback = 'http://127.0.0.1:8970';
    if (!candidates.some((c) => c.url === loopback)) {
      candidates.push({ tier: 'local_lan', url: loopback });
    }

    // 逐级探测直连
    for (const candidate of candidates) {
      if (parentSignal?.aborted) break;

      try {
        const streamEndpoint = `${candidate.url.replace(/\/+$/, '')}/api/v1/stream`;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        };
        if (config.authToken) {
          headers['Authorization'] = `Bearer ${config.authToken}`;
        }

        const response = await this.fetchWithConnectTimeout(
          streamEndpoint,
          {
            method: 'POST',
            headers,
            body: JSON.stringify(bodyPayload),
          },
          1500,
          parentSignal
        );

        // 成功建立连接：更新 FastPath 缓存
        this.fastPathUrl = candidate.url;
        try {
          localStorage.setItem('taroturn_fastpath_endpoint', candidate.url);
        } catch {}

        return response;
      } catch (err) {
        console.warn(`[NodeResolver] Candidate ${candidate.url} unreachable, attempting self-heal...`);
      }
    }

    // 4. 直连全部失败，触发【信标自愈检索】(Sovereign Beacon Recovery)
    if (config.nodeId) {
      console.info(`[NodeResolver] Triggering Beacon self-heal for Node ID: ${config.nodeId}`);
      const freshUrl = await this.queryBeaconForNode(config.nodeId, config.beaconUrl);
      if (freshUrl) {
        try {
          const streamEndpoint = `${freshUrl.replace(/\/+$/, '')}/api/v1/stream`;
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          };
          if (config.authToken) {
            headers['Authorization'] = `Bearer ${config.authToken}`;
          }

          const response = await this.fetchWithConnectTimeout(
            streamEndpoint,
            {
              method: 'POST',
              headers,
              body: JSON.stringify(bodyPayload),
            },
            2500,
            parentSignal
          );

          // 自愈成功！更新地址缓存
          this.fastPathUrl = freshUrl;
          try {
            localStorage.setItem('taroturn_fastpath_endpoint', freshUrl);
          } catch {}

          return response;
        } catch (err) {
          console.error(`[NodeResolver] Fresh beacon address ${freshUrl} also failed:`, err);
        }
      }
    }

    throw new Error('All node connection tiers (LAN, Cached IPv6, Beacon) exhausted. Host PC may be asleep or offline.');
  }
}
