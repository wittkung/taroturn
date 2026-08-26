// src/components/TtagyNodeControlModal.tsx - TTAgy Self-Hosted Node Control Studio
import React, { useState, useEffect } from 'react';
import {
  X,
  Radio,
  Cpu,
  RefreshCw,
  Copy,
  Check,
  QrCode,
  Shield,
  Send,
  Loader2,
  Terminal,
  Layers,
  Sparkles,
  Zap,
  Globe,
  Key,
} from 'lucide-react';
import { UserSettings } from '../types/settings';
import { UserSettingsService } from '../services/userSettingsService';
import { streamTarotAi } from '../services/ttagyService';
import { generatePairingQrSvg } from '../utils/qrCodeHelper';

interface TtagyNodeControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: (newSettings: UserSettings) => void;
}

export const TtagyNodeControlModal: React.FC<TtagyNodeControlModalProps> = ({
  isOpen,
  onClose,
  onSettingsChange,
}) => {
  const [activeTab, setActiveTab] = useState<'network' | 'pair' | 'engine' | 'sandbox'>('network');
  const [settings, setSettings] = useState<UserSettings>(UserSettingsService.getSettings());

  // Ping states
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<{
    success: boolean;
    latencyMs: number;
    message: string;
    details?: string;
  } | null>(null);

  // Copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sandbox Live Test State
  const [testPrompt, setTestPrompt] = useState<string>(
    '以荣格深度心理学视角，简析【愚者正位】与【宝剑十逆位】在面对职业转变时的心智张力与突破口。'
  );
  const [isTestStreaming, setIsTestStreaming] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string>('');
  const [testThinking, setTestThinking] = useState<string>('');
  const [testMetrics, setTestMetrics] = useState<{ ttftMs: number; totalMs: number; chars: number } | null>(
    null
  );

  // Logs stream
  const [logEntries, setLogEntries] = useState<Array<{ time: string; event: string; status: 'ok' | 'warn' | 'err' }>>([
    { time: '22:50:12', event: 'Daemon 启动：监听端口 8970 [::]:8970', status: 'ok' },
    { time: '22:51:04', event: 'IPv6 路由广播已就绪：240e:3b7:30b0:1234::1', status: 'ok' },
    { time: '22:52:30', event: 'SSE 心跳守护周期：15s 保活激活', status: 'ok' },
  ]);

  useEffect(() => {
    if (isOpen) {
      setSettings(UserSettingsService.getSettings());
      setPingResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleUpdate = (updater: (prev: UserSettings) => UserSettings) => {
    setSettings((prev) => {
      const next = updater(prev);
      UserSettingsService.saveSettings(next);
      onSettingsChange?.(next);
      return next;
    });
  };

  const handlePingTest = async (endpointToTest?: string) => {
    setIsPinging(true);
    setPingResult(null);
    const target =
      endpointToTest ||
      (settings.ai.providerMode === 'ttagy_remote'
        ? settings.ai.ttagy.remoteEndpoint
        : settings.ai.ttagy.localEndpoint);
    const token = settings.ai.ttagy.authToken;

    const res = await UserSettingsService.pingTtagyNode(target, token);
    setIsPinging(false);
    setPingResult(res);

    const now = new Date().toTimeString().slice(0, 8);
    setLogEntries((prev) => [
      {
        time: now,
        event: `Ping 探测 [${target}]: ${res.message}`,
        status: res.success ? 'ok' : 'err',
      },
      ...prev.slice(0, 15),
    ]);
  };

  const generateRandomToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = 'ttagy_sec_';
    for (let i = 0; i < 24; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    handleUpdate((prev) => ({
      ...prev,
      ai: {
        ...prev.ai,
        ttagy: { ...prev.ai.ttagy, authToken: token },
      },
    }));
  };

  // Run live test in Sandbox
  const handleExecuteLiveTest = async () => {
    if (!testPrompt.trim() || isTestStreaming) return;
    setIsTestStreaming(true);
    setTestResult('');
    setTestThinking('');
    setTestMetrics(null);

    const startTime = performance.now();
    let ttft = 0;

    try {
      await streamTarotAi(
        testPrompt,
        {
          onThinkingDelta: (delta) => {
            if (!ttft) ttft = Math.round(performance.now() - startTime);
            setTestThinking((prev) => prev + delta);
          },
          onContentDelta: (_delta, acc) => {
            if (!ttft) ttft = Math.round(performance.now() - startTime);
            setTestResult(acc);
          },
          onDone: (finalContent, finalThinking) => {
            const total = Math.round(performance.now() - startTime);
            setTestResult(finalContent);
            if (finalThinking) setTestThinking(finalThinking);
            setTestMetrics({
              ttftMs: ttft || total,
              totalMs: total,
              chars: finalContent.length,
            });
            setIsTestStreaming(false);

            const now = new Date().toTimeString().slice(0, 8);
            setLogEntries((prev) => [
              {
                time: now,
                event: `推演完成: 耗时 ${total}ms (TTFT: ${ttft || total}ms) · ${finalContent.length} 字`,
                status: 'ok',
              },
              ...prev.slice(0, 15),
            ]);
          },
          onError: (err) => {
            setTestResult(`[测试异常]: ${err}`);
            setIsTestStreaming(false);
          },
        },
        settings
      );
    } catch (_err) {
      setIsTestStreaming(false);
    }
  };

  // Build Pairing Config Payload
  const pairingPayload = {
    ttagy_node: '1.2.0',
    endpoint: settings.ai.ttagy.remoteEndpoint || 'http://127.0.0.1:8970',
    token: settings.ai.ttagy.authToken,
    model: settings.ai.ttagy.model,
    effort: settings.ai.ttagy.effort,
    persona: settings.ai.persona,
  };
  const pairingString = JSON.stringify(pairingPayload);
  const qrSvg = generatePairingQrSvg(pairingString, 160);

  const candidateInterfaces = [
    {
      name: '本地回路 (Localhost)',
      type: 'Local Loopback',
      url: 'http://127.0.0.1:8970',
      desc: '本机浏览器或本地应用直连',
      badge: '127.0.0.1',
    },
    {
      name: '局域网 Wi-Fi (LAN)',
      type: 'Local Area Network',
      url: 'http://192.168.1.188:8970',
      desc: '同 Wi-Fi 下手机/平板快速直连',
      badge: '192.168.x.x',
    },
    {
      name: '公网 IPv6 节点 (WAN IPv6)',
      type: 'Public IPv6 WAN',
      url: settings.ai.ttagy.remoteEndpoint || 'http://[240e:3b7:30b0:1234::1]:8970',
      desc: '跨公网 5G/外网随时随地直连电脑算力',
      badge: '🌟 推荐手机直连',
      isPublic: true,
    },
    {
      name: 'Tailscale 虚拟专网',
      type: 'Tailscale Mesh VPN',
      url: 'http://my-macbook-pro.tailscale.net:8970',
      desc: '加密虚拟局域网零配置穿透',
      badge: 'Tailscale',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-4xl bg-[#0C0618]/95 border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[92vh]">
        {/* Top Control Bar */}
        <div className="px-6 py-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-950/60 via-slate-900 to-purple-950/40 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-amethyst-glow">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-editorial font-bold text-slate-100">
                  TTAgy 守护节点控制台
                </h3>
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Daemon 在线 (:8970)</span>
                </span>
              </div>
              <p className="text-[11px] font-editorial text-slate-400">
                管理本地算力网关、IPv6 远程穿透、移动端扫码配对与推演沙盒
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePingTest()}
              disabled={isPinging}
              className="px-3 py-1.5 rounded-full bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-editorial font-bold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{isPinging ? '探测中...' : '节点测通'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-purple-500/15 text-xs font-editorial font-bold bg-black/30 flex-shrink-0">
          <button
            onClick={() => setActiveTab('network')}
            className={`flex-1 py-3 flex items-center justify-center space-x-1.5 transition-all border-b-2 ${
              activeTab === 'network'
                ? 'text-purple-300 border-purple-500 bg-purple-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>网络监听与 IPv6 广播</span>
          </button>

          <button
            onClick={() => setActiveTab('pair')}
            className={`flex-1 py-3 flex items-center justify-center space-x-1.5 transition-all border-b-2 ${
              activeTab === 'pair'
                ? 'text-purple-300 border-purple-500 bg-purple-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>手机扫码配对中心</span>
          </button>

          <button
            onClick={() => setActiveTab('engine')}
            className={`flex-1 py-3 flex items-center justify-center space-x-1.5 transition-all border-b-2 ${
              activeTab === 'engine'
                ? 'text-purple-300 border-purple-500 bg-purple-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>模型引擎与思考深度</span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex-1 py-3 flex items-center justify-center space-x-1.5 transition-all border-b-2 ${
              activeTab === 'sandbox'
                ? 'text-purple-300 border-purple-500 bg-purple-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>推演沙盒与日志流</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* ══════════ TAB 1: 网络监听与 IPv6 广播 ══════════ */}
          {activeTab === 'network' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-editorial font-bold text-slate-100">
                    本机多网卡监听与远程可达地址
                  </h4>
                  <p className="text-xs font-editorial text-slate-400">
                    TTAgy 守护进程已自动绑定 `0.0.0.0:8970` 及 `[::]:8970`
                  </p>
                </div>
                {pingResult && (
                  <span
                    className={`text-xs font-editorial px-3 py-1 rounded-full border ${
                      pingResult.success
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {pingResult.message}
                  </span>
                )}
              </div>

              {/* Interface Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {candidateInterfaces.map((iface, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      iface.isPublic
                        ? 'bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-transparent border-amber-500/40 shadow-sm ring-1 ring-amber-500/30'
                        : 'bg-white/[0.02] border-white/5 hover:border-purple-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className={`w-4 h-4 ${iface.isPublic ? 'text-amber-400' : 'text-purple-400'}`} />
                        <span className="text-xs font-editorial font-bold text-slate-100">
                          {iface.name}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                          iface.isPublic
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        }`}
                      >
                        {iface.badge}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="p-2 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-purple-200 flex items-center justify-between">
                        <span className="truncate max-w-[240px]">{iface.url}</span>
                        <button
                          onClick={() => handleCopy(iface.url, `url_${idx}`)}
                          className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                          title="复制 URL"
                        >
                          {copiedKey === `url_${idx}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] font-editorial text-slate-400">{iface.desc}</p>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <button
                        onClick={() => handlePingTest(iface.url)}
                        className="text-[11px] font-editorial text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>快速测速</span>
                      </button>
                      <button
                        onClick={() => {
                          handleUpdate((prev) => ({
                            ...prev,
                            ai: {
                              ...prev.ai,
                              providerMode: iface.isPublic ? 'ttagy_remote' : 'ttagy_local',
                              ttagy: {
                                ...prev.ai.ttagy,
                                [iface.isPublic ? 'remoteEndpoint' : 'localEndpoint']: iface.url,
                              },
                            },
                          }));
                          handleCopy(iface.url, `applied_${idx}`);
                        }}
                        className="text-[11px] font-editorial text-amber-400 hover:text-amber-300"
                      >
                        {copiedKey === `applied_${idx}` ? '已设为当前节点 ✓' : '设为默认节点 →'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Security Token Manager */}
              <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-editorial text-purple-300 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span>节点访问鉴权令牌 (Daemon Security Token)</span>
                  </span>
                  <button
                    onClick={generateRandomToken}
                    className="px-2.5 py-1 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[11px] font-editorial border border-purple-500/30 transition-colors flex items-center space-x-1"
                  >
                    <Key className="w-3 h-3" />
                    <span>生成新密钥</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={settings.ai.ttagy.authToken}
                    onChange={(e) =>
                      handleUpdate((prev) => ({
                        ...prev,
                        ai: {
                          ...prev.ai,
                          ttagy: { ...prev.ai.ttagy, authToken: e.target.value },
                        },
                      }))
                    }
                    placeholder="例如: ttagy_sec_9F8k2x..."
                    className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-purple-500/30 text-xs font-mono text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={() => handleCopy(settings.ai.ttagy.authToken, 'token')}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-editorial text-slate-300 flex items-center space-x-1 border border-white/10 transition-colors"
                  >
                    {copiedKey === 'token' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === 'token' ? '已复制' : '复制 Token'}</span>
                  </button>
                </div>
                <p className="text-[11px] font-editorial text-slate-400">
                  开启公网 IPv6 监听时，建议配置 Token 以防未知 IP 恶意消耗您的 Gemini / 本地算力配额。
                </p>
              </div>
            </div>
          )}

          {/* ══════════ TAB 2: 手机扫码配对中心 ══════════ */}
          {activeTab === 'pair' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/40 via-black to-purple-950/20 border border-purple-500/30 flex flex-col md:flex-row items-center gap-6 shadow-inner">
                {/* SVG QR Code */}
                <div className="p-3 rounded-2xl bg-black/80 border-2 border-purple-500/40 shadow-2xl flex-shrink-0 flex items-center justify-center">
                  <div dangerouslySetInnerHTML={{ __html: qrSvg }} />
                </div>

                {/* Pairing Guide */}
                <div className="space-y-3 flex-1 text-left">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase">
                    <Sparkles className="w-3 h-3" />
                    <span>跨端秒级配对</span>
                  </div>

                  <h3 className="text-lg font-editorial font-bold text-slate-100">
                    使用手机连接电脑端 TTAgy 算力
                  </h3>

                  <ol className="text-xs font-editorial text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>手机打开 Taroturn 应用 / 小程序 / 手机浏览器。</li>
                    <li>
                      进入设置中心 $\to$ 【AI 接入与自建节点】 $\to$ 选择【TTAgy 远程私有节点】。
                    </li>
                    <li>
                      扫描左侧二维码，或点击下方【复制配对密钥】，即可一键载入全部连接参数。
                    </li>
                  </ol>

                  <div className="pt-2 flex flex-wrap gap-2.5">
                    <button
                      onClick={() => handleCopy(pairingString, 'pair_json')}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold text-xs font-editorial flex items-center space-x-1.5 transition-all shadow-md"
                    >
                      {copiedKey === 'pair_json' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedKey === 'pair_json' ? '已复制配对 JSON' : '复制配对 JSON 档案'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Current Payload Preview */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-xs font-bold font-editorial text-purple-300 block">
                  配对数据载荷预览 (Payload Schema)
                </span>
                <pre className="p-3 rounded-xl bg-black/60 border border-purple-500/20 text-[11px] font-mono text-purple-300 overflow-x-auto">
                  {JSON.stringify(pairingPayload, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* ══════════ TAB 3: 模型引擎与思考深度 ══════════ */}
          {activeTab === 'engine' && (
            <div className="space-y-5">
              {/* Model Picker */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <span className="text-xs font-bold font-editorial text-purple-300 block">
                  底层推理驱动模型 (Underlying Model)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {[
                    { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', desc: '极速 CoT 思考推演 (推荐)' },
                    { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', desc: '文学感与古典哲学深度' },
                    { id: 'deepseek-v3', name: 'DeepSeek V3 / R1', desc: '深度逻辑链与高性价比' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() =>
                        handleUpdate((prev) => ({
                          ...prev,
                          ai: {
                            ...prev.ai,
                            ttagy: { ...prev.ai.ttagy, model: m.id },
                          },
                        }))
                      }
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        settings.ai.ttagy.model === m.id
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold shadow-sm'
                          : 'bg-black/30 border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-editorial">{m.name}</div>
                      <div className="text-[10px] font-editorial opacity-70 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Thinking Effort */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <span className="text-xs font-bold font-editorial text-purple-300 block">
                  思考预算与推理强度 (Reasoning Effort)
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'low', name: '低 (Low)', desc: '极速响应 $<300ms$' },
                    { id: 'medium', name: '中 (Medium)', desc: '平衡推演深度' },
                    { id: 'high', name: '高 (High)', desc: '完整荣格原型 CoT 链' },
                  ].map((eff) => (
                    <button
                      key={eff.id}
                      onClick={() =>
                        handleUpdate((prev) => ({
                          ...prev,
                          ai: {
                            ...prev.ai,
                            ttagy: { ...prev.ai.ttagy, effort: eff.id as any },
                          },
                        }))
                      }
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        settings.ai.ttagy.effort === eff.id
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold shadow-sm'
                          : 'bg-black/30 border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-editorial">{eff.name}</div>
                      <div className="text-[10px] font-editorial opacity-70 mt-0.5">{eff.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ TAB 4: 推演沙盒与日志流 ══════════ */}
          {activeTab === 'sandbox' && (
            <div className="space-y-4">
              {/* Live Sandbox Test Input */}
              <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-editorial text-purple-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    <span>实时推演沙盒测试 (Live Test Sandbox)</span>
                  </span>
                  {testMetrics && (
                    <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-2">
                      <span>TTFT: {testMetrics.ttftMs}ms</span>
                      <span>总耗时: {testMetrics.totalMs}ms</span>
                      <span>字数: {testMetrics.chars}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleExecuteLiveTest();
                    }}
                    placeholder="输入测试意向或提示词..."
                    disabled={isTestStreaming}
                    className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-purple-500/20 text-xs font-editorial text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleExecuteLiveTest}
                    disabled={!testPrompt.trim() || isTestStreaming}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-editorial font-bold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                  >
                    {isTestStreaming ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{isTestStreaming ? '推演中' : '执行测试'}</span>
                  </button>
                </div>

                {/* Output Stream */}
                {(testResult || testThinking) && (
                  <div className="space-y-2 pt-2">
                    {testThinking && (
                      <div className="p-3 rounded-xl bg-black/60 border border-purple-500/20 text-[10px] font-mono text-slate-400 whitespace-pre-wrap max-h-32 overflow-y-auto">
                        <span className="text-purple-400 font-bold block mb-1">
                          [CoT 思考心智链]:
                        </span>
                        {testThinking}
                      </div>
                    )}

                    {testResult && (
                      <div className="p-3.5 rounded-xl bg-black/40 border border-purple-500/30 text-xs font-editorial text-slate-100 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                        {testResult}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Event Logs Stream */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <span className="text-xs font-bold font-editorial text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Daemon 实时日志流 (Event Stream)</span>
                </span>
                <div className="space-y-1 font-mono text-[10px] max-h-36 overflow-y-auto text-slate-400">
                  {logEntries.map((l, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <span className="text-slate-600">{l.time}</span>
                      <span
                        className={
                          l.status === 'ok'
                            ? 'text-emerald-400'
                            : l.status === 'warn'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }
                      >
                        [{l.status.toUpperCase()}]
                      </span>
                      <span className="text-slate-300">{l.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
