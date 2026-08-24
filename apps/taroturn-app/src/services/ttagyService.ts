import { Spread, ReadingSession, Card } from '../types/tarot';

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
 * 跨端流式请求 TTAgy 守护服务
 */
export async function streamTtagyChat(
  prompt: string,
  callbacks: StreamEventCallbacks,
  options?: {
    model?: string;
    effort?: 'low' | 'medium' | 'high';
    timeoutSecs?: number;
  }
): Promise<string> {
  const model = options?.model || 'gemini-3.7-flash';
  const effort = options?.effort || 'low';
  const timeoutSecs = options?.timeoutSecs || 35;

  const payload = {
    prompt,
    model,
    effort,
    timeout_secs: timeoutSecs,
  };

  // 优先通过 Vite Proxy (/api/ttagy/stream)，若失败透明回退直连本地 Daemon (http://127.0.0.1:8970/api/v1/stream)
  const endpoints = ['/api/ttagy/stream', 'http://127.0.0.1:8970/api/v1/stream'];
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`TTAgy 服务响应错误 (${res.status}): ${res.statusText}`);
      }

      if (!res.body) {
        throw new Error('未收到 TTAgy 服务的数据流响应');
      }

      const reader = res.body.getReader();
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
    } catch (err: any) {
      lastError = err;
      console.warn(`Endpoint ${endpoint} failed, trying next fallback:`, err);
    }
  }

  const msg = lastError?.message || 'TTAgy 连接失败';
  callbacks.onError?.(msg);
  throw lastError || new Error(msg);
}

/**
 * 构造专业荣格心理学与黄金黎明牌阵推演提示词
 */
export function buildTarotInterpretationPrompt(
  spread: Spread,
  session: ReadingSession,
  cardsCatalog: Record<number, Card>
): string {
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
  - 核心原型词: ${keywords}`;
  });

  return `你是一位兼具古典黄金黎明 (Hermetic Order of the Golden Dawn) 符号体系与荣格深度心理学 (Jungian Archetypal Psychology) 的资深塔罗推演大师。
请针对以下求问者的真实牌阵，提供深度、客观、严谨且富有洞察力的全景推演报告。

【求问焦点意向】：${session.question || '探寻当前人生阶段的深层心智动力与现实发展路径'}
【推演牌阵】：${spread.name_zh} (${spread.slots.length} 张卡位)
【四要素炼金能量分布】：
- 火元素 (意志/开创): ${(session.dignity_summary.fire_ratio * 100).toFixed(0)}%
- 水元素 (情感/直觉): ${(session.dignity_summary.water_ratio * 100).toFixed(0)}%
- 风元素 (心智/策略): ${(session.dignity_summary.air_ratio * 100).toFixed(0)}%
- 土元素 (现实/根基): ${(session.dignity_summary.earth_ratio * 100).toFixed(0)}%
- 主导能量态势: ${session.dignity_summary.dominant_element}

【牌阵各卡位落位详情】：
${placedList.join('\n\n')}

请按以下结构输出推演报告（使用清爽优雅的 Markdown 格式，保持专业、直面本质，拒绝空洞玄学套话）：

### 1. 【潜意识动力机制与宏观格局】
分析主导能量要素与牌阵整体格局，揭示求问者潜意识底层的核心驱动力与内在张力。

### 2. 【核心卡位交互与心智阻抗杠杆】
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
  newQuestion: string
): string {
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
    .map((msg) => `${msg.sender === 'user' ? '求问者' : '推演导师'}: ${msg.text}`)
    .join('\n\n');

  return `你是一位精通塔罗原型与荣格心理学的资深导师。当前求问者正在就其推演结果进行深度对话。

【背景牌阵】：${spread.name_zh}
【焦点议题】：${session.question || '整体发展'}
【落牌概貌】：${cardsSummary}

【对话历史】：
${historyContext}

【求问者的新问题】：
${newQuestion}

请根据牌面要素与心理学洞察，给出直接、真诚、有深度且针对该问题的具体解答。回答请保持凝练清晰，字数控制在 250-400 字以内。`;
}
