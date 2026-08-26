// src/services/ttagyService.ts - Multi-Provider AI Sanctuary Engine & Custom Persona Prompts

import { Spread, ReadingSession, Card } from '../types/tarot';
import { UserSettingsService } from './userSettingsService';
import { AiPersona, UserSettings } from '../types/settings';
import { calculateSeekerProfile } from './tarotCalculators';
import { AdaptiveNodeResolver } from './adaptiveNodeResolver';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  thinking?: string;
  timestamp: number;
}

export interface StreamEventCallbacks {
  onInit?: (model: string) => void;
  onThinkingDelta?: (delta: string) => void;
  onContentDelta?: (delta: string, accumulated: string) => void;
  onDone?: (fullContent: string, thinkingContent?: string) => void;
  onError?: (errMessage: string) => void;
}

/**
 * 统一多引擎流式分发器
 */
export async function streamTarotAi(
  prompt: string,
  callbacks: StreamEventCallbacks,
  customSettings?: UserSettings
): Promise<string> {
  const settings = customSettings || UserSettingsService.getSettings();
  const provider = settings.ai.providerMode;

  switch (provider) {
    case 'ttagy_remote':
      return streamTtagyRemote(prompt, callbacks, settings);
    case 'byok_gemini':
      return streamByokGemini(prompt, callbacks, settings);
    case 'byok_openai':
      return streamByokOpenAi(prompt, callbacks, settings);
    case 'ttagy_local':
    case 'official_cloud':
    default:
      return streamTtagyLocal(prompt, callbacks, settings);
  }
}

/**
 * 1. TTAgy 本地守护进程直连
 */
async function streamTtagyLocal(
  prompt: string,
  callbacks: StreamEventCallbacks,
  settings: UserSettings
): Promise<string> {
  const { model, effort, timeoutSecs, authToken } = settings.ai.ttagy;
  const payload = { prompt, model, effort, timeout_secs: timeoutSecs };

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken && authToken.trim()) {
    headers['Authorization'] = `Bearer ${authToken.trim()}`;
  }

  const endpoints = ['/api/ttagy/stream', 'http://127.0.0.1:8970/api/v1/stream'];
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`本地 TTAgy 响应异常 (${res.status}): ${res.statusText}`);
      }
      if (!res.body) throw new Error('未收到流式数据流');

      return await parseTtagySseStream(res.body, callbacks);
    } catch (err: any) {
      lastError = err;
    }
  }

  const msg = lastError?.message || '无法连接本地 TTAgy 守护进程 (127.0.0.1:8970)';
  callbacks.onError?.(msg);
  throw lastError || new Error(msg);
}

/**
 * 2. TTAgy 远程私有节点自愈直连 (支持 IPv6 / Tailscale / Sovereign Beacon 自动重试)
 */
async function streamTtagyRemote(
  prompt: string,
  callbacks: StreamEventCallbacks,
  settings: UserSettings
): Promise<string> {
  const { model, effort, timeoutSecs } = settings.ai.ttagy;
  const payload = { prompt, model, effort, timeout_secs: timeoutSecs };

  try {
    const res = await AdaptiveNodeResolver.getInstance().resolveAndStream(
      settings.ai.ttagy,
      payload
    );

    if (!res.body) throw new Error('未收到远程节点数据流');
    return await parseTtagySseStream(res.body, callbacks);
  } catch (err: any) {
    const msg = `远程 TTAgy 连接失败 (信标自愈穷尽): ${err.message || err}`;
    callbacks.onError?.(msg);
    throw err;
  }
}

/**
 * 3. BYOK: Google Gemini 原生 API 流式调用
 */
async function streamByokGemini(
  prompt: string,
  callbacks: StreamEventCallbacks,
  settings: UserSettings
): Promise<string> {
  const { geminiApiKey, geminiModel, geminiEndpoint } = settings.ai.byok;
  if (!geminiApiKey) {
    const msg = '请在设置中填入 Google Gemini API Key';
    callbacks.onError?.(msg);
    throw new Error(msg);
  }

  const endpointBase = geminiEndpoint || 'https://generativelanguage.googleapis.com/v1beta';
  const model = geminiModel || 'gemini-2.5-flash';
  const url = `${endpointBase}/models/${model}:streamGenerateContent?alt=sse&key=${geminiApiKey}`;

  callbacks.onInit?.(model);

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errTxt = await res.text();
      throw new Error(`Gemini API 错误 (${res.status}): ${errTxt}`);
    }
    if (!res.body) throw new Error('未收到 Gemini API 数据流');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let accumulatedContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data:')) {
          const jsonStr = trimmed.slice(5).trim();
          if (jsonStr) {
            try {
              const data = JSON.parse(jsonStr);
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (text) {
                accumulatedContent += text;
                callbacks.onContentDelta?.(text, accumulatedContent);
              }
            } catch (err) {
              // Ignore partial JSON chunks
            }
          }
        }
      }
    }

    callbacks.onDone?.(accumulatedContent);
    return accumulatedContent;
  } catch (err: any) {
    const msg = `Gemini API 调用异常: ${err.message || err}`;
    callbacks.onError?.(msg);
    throw err;
  }
}

/**
 * 4. BYOK: OpenAI / DeepSeek / 兼容接口流式调用
 */
async function streamByokOpenAi(
  prompt: string,
  callbacks: StreamEventCallbacks,
  settings: UserSettings
): Promise<string> {
  const { openaiApiKey, openaiBaseUrl, openaiModel } = settings.ai.byok;
  if (!openaiApiKey) {
    const msg = '请在设置中填入 API Key';
    callbacks.onError?.(msg);
    throw new Error(msg);
  }

  const baseUrl = (openaiBaseUrl || 'https://api.deepseek.com/v1').replace(/\/+$/, '');
  const model = openaiModel || 'deepseek-chat';
  const url = `${baseUrl}/chat/completions`;

  callbacks.onInit?.(model);

  const payload = {
    model,
    stream: true,
    messages: [{ role: 'user', content: prompt }],
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey.trim()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errTxt = await res.text();
      throw new Error(`API 响应错误 (${res.status}): ${errTxt}`);
    }
    if (!res.body) throw new Error('未收到流式数据');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let accumulatedContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data:')) {
          const jsonStr = trimmed.slice(5).trim();
          if (jsonStr === '[DONE]') break;
          if (jsonStr) {
            try {
              const data = JSON.parse(jsonStr);
              const delta = data.choices?.[0]?.delta?.content || '';
              if (delta) {
                accumulatedContent += delta;
                callbacks.onContentDelta?.(delta, accumulatedContent);
              }
            } catch (err) {
              // Ignore partial JSON chunks
            }
          }
        }
      }
    }

    callbacks.onDone?.(accumulatedContent);
    return accumulatedContent;
  } catch (err: any) {
    const msg = `OpenAI/DeepSeek API 调用异常: ${err.message || err}`;
    callbacks.onError?.(msg);
    throw err;
  }
}

/**
 * 解析 TTAgy 标准 SSE 协议包
 */
async function parseTtagySseStream(
  body: ReadableStream<Uint8Array>,
  callbacks: StreamEventCallbacks
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let accumulatedContent = '';
  let accumulatedThinking = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data:')) {
        const dataStr = trimmed.slice(5).trim();
        if (dataStr) {
          try {
            const ev = JSON.parse(dataStr);
            const evType = ev.type;

            if (evType === 'agy:init') {
              callbacks.onInit?.(ev.model);
            } else if (evType === 'agy:thinking_delta') {
              const delta = ev.textDelta ?? ev.text_delta ?? '';
              accumulatedThinking += delta;
              callbacks.onThinkingDelta?.(delta);
            } else if (evType === 'agy:content_delta') {
              const delta = ev.textDelta ?? ev.text_delta ?? '';
              accumulatedContent += delta;
              callbacks.onContentDelta?.(delta, accumulatedContent);
            } else if (evType === 'agy:done') {
              const finalContent = ev.fullContent ?? ev.full_content ?? accumulatedContent;
              const finalThinking = ev.thinkingContent ?? ev.thinking_content ?? accumulatedThinking;
              callbacks.onDone?.(finalContent, finalThinking);
              return finalContent;
            } else if (evType === 'agy:error') {
              const errMessage = ev.errorMessage ?? ev.error_message ?? '推演执行异常';
              callbacks.onError?.(errMessage);
              throw new Error(errMessage);
            }
          } catch (err) {
            if (err instanceof Error && err.message !== 'Unexpected end of JSON input') {
              console.warn('[ttagy stream parse warning]', err);
            }
          }
        }
      }
    }
  }

  callbacks.onDone?.(accumulatedContent, accumulatedThinking);
  return accumulatedContent;
}

// 兼容老调用
export const streamTtagyChat = streamTarotAi;

/**
 * 构造流派与求问者本命专属全景推演提示词
 */
export function buildTarotInterpretationPrompt(
  spread: Spread,
  session: ReadingSession,
  cardsCatalog: Record<number, Card>,
  overridePersona?: AiPersona
): string {
  const settings = UserSettingsService.getSettings();
  const persona = overridePersona || settings.ai.persona || 'jungian';
  const profile = settings.profile;
  const calc = calculateSeekerProfile(profile.birthdate);

  const placedList = spread.slots.map((slot, idx) => {
    const placed = session.placed_cards.find((p) => p.slot_id === slot.slot_id);
    const card = placed ? cardsCatalog[placed.drawn_card.card_id] : null;
    const orientation = placed?.drawn_card.orientation === 'Upright' ? '正位' : '逆位';
    const cardName = card ? `${card.name_zh} (${card.name_en})` : '未知卡牌';
    const element = card ? card.element : '未知';
    const keywords = card
      ? (placed?.drawn_card.orientation === 'Upright'
          ? card.facets.general_upright
          : card.facets.general_reversed
        ).join('、')
      : '';

    return `卡位 [${idx + 1}] ${slot.title_zh} (${slot.meaning_prompt}):
  - 卡牌: ${cardName} [${orientation}] (元素: ${element})
  - 原型词: ${keywords}`;
  });

  const personaInstructions = getPersonaInstructions(persona);

  return `${personaInstructions}

【求问者心智底色与本命先验】：
- 称谓/昵称：${profile.nickname} · ${profile.title}
- 本命灵魂守护牌：${calc.soulCardNameZh} (${calc.soulCardNameEn}) · ${calc.archetypeTitle}
- 本命黄道与主导元素：${calc.dominantZodiac} (主导：${calc.dominantElement})
- 灵魂箴言：${calc.soulMotto}

【推演焦点议题】：${session.question || '探寻当前人生阶段的深层心智动力与显化路径'}
【推演牌阵】：${spread.name_zh} (${spread.slots.length} 张卡位)
【四要素炼金能量分布】：
- 火元素 (意志/开创): ${(session.dignity_summary.fire_ratio * 100).toFixed(0)}%
- 水元素 (情感/直觉): ${(session.dignity_summary.water_ratio * 100).toFixed(0)}%
- 风元素 (心智/策略): ${(session.dignity_summary.air_ratio * 100).toFixed(0)}%
- 土元素 (现实/根基): ${(session.dignity_summary.earth_ratio * 100).toFixed(0)}%
- 主导能量态势: ${session.dignity_summary.dominant_element}

【牌阵各卡位落位详情】：
${placedList.join('\n\n')}

请按以下三段式结构输出推演报告（清爽优雅的 Markdown，直面本质，拒绝空洞玄学套话）：

### 1. 【潜意识动力机制与宏观格局】
分析主导能量要素与牌阵整体格局，结合求问者本命特质，揭示潜意识底层的核心驱动力与内在张力。

### 2. 【核心卡位交互与认知阴影盲区】
针对核心冲突位、障碍位与关键显化位进行联动交叉解读，指出阻碍产生的认知盲区（阴影面）及破局杠杆。

### 3. 【炼金演化趋势与落地行动纲领】
结合终局走向牌与要素平衡，给出清晰、可落地、具备指导性的实操建议。`;
}

/**
 * 构造多轮追问对话提示词
 */
export function buildTarotDialoguePrompt(
  spread: Spread,
  session: ReadingSession,
  cardsCatalog: Record<number, Card>,
  history: ChatMessage[],
  newQuestion: string,
  overridePersona?: AiPersona
): string {
  const settings = UserSettingsService.getSettings();
  const persona = overridePersona || settings.ai.persona || 'jungian';
  const profile = settings.profile;

  const cardsSummary = spread.slots
    .map((slot, idx) => {
      const placed = session.placed_cards.find((p) => p.slot_id === slot.slot_id);
      const card = placed ? cardsCatalog[placed.drawn_card.card_id] : null;
      const orientation = placed?.drawn_card.orientation === 'Upright' ? '正位' : '逆位';
      return `[#${idx + 1} ${slot.title_zh}: ${card?.name_zh ?? ''} (${orientation})]`;
    })
    .join(' ');

  const historyContext = history
    .slice(-6)
    .map((msg) => `${msg.sender === 'user' ? '求问者' : '导师'}: ${msg.text}`)
    .join('\n\n');

  const personaDialogueStyle = getPersonaDialogueStyle(persona);

  return `${personaDialogueStyle}

【求问者】：${profile.nickname}
【背景牌阵】：${spread.name_zh}
【焦点议题】：${session.question || '整体发展'}
【落牌概貌】：${cardsSummary}

【对话历史】：
${historyContext}

【求问者的新问题】：
${newQuestion}

请根据牌面要素与流派理念，给出真诚、有深度且针对该问题的具体解答（字数控制在 250-400 字以内）。`;
}

function getPersonaInstructions(persona: AiPersona): string {
  switch (persona) {
    case 'hermetic':
      return `你是一位古典西方秘传黄金黎明（Hermetic Order of the Golden Dawn）与卡巴拉生命之树的精深学者。
你精通 22 条大阿尔卡那希伯来字母路径、36 黄道旬度（Decans）与四要素炼金克合律。你的推演严谨、深邃、结构清晰，注重宇宙秩序与时机推演。`;
    case 'socratic':
      return `你是一位温和而敏锐的苏格拉底式心智觉察导师。
你坚信求问者内在早已具备所有答案。你不做主观宣判，而是通过深刻的澄清式提问、反思镜头与认知换位，引导求问者看清自身盲区，唤醒自我决断力。`;
    case 'pragmatic':
      return `你是一位务实、敏锐的现实决策与战略顾问。
你将塔罗符号转化为现实世界的资源配置、风险控制、时机窗口与执行步骤。你拒绝模糊玄学，直指关键痛点，提供落地可执行的行动纲领。`;
    case 'jungian':
    default:
      return `你是一位精通荣格深度心理学（Jungian Archetypal Psychology）的资深塔罗推演大师。
你将塔罗牌阵视为求问者潜意识心智与自性化（Individuation）历程的投射。你注重阴影整合、对立面融合与共时性觉察，温和而直击本质。`;
  }
}

function getPersonaDialogueStyle(persona: AiPersona): string {
  switch (persona) {
    case 'hermetic':
      return `你以黄金黎明秘传学者的视角，结合卡巴拉路径与占星元素克合进行解惑。`;
    case 'socratic':
      return `你以苏格拉底觉察导师的身份，多用启发式反诘帮助求问者梳理内心。`;
    case 'pragmatic':
      return `你以务实战略顾问的身份，针对问题给出清晰的现实利弊分析与行动建议。`;
    case 'jungian':
    default:
      return `你以荣格深度心理学导师的身份，从潜意识动力与阴影整合角度深入回答。`;
  }
}
