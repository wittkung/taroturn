import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Flame,
  Droplet,
  Wind,
  Mountain,
  Moon,
  Lock,
  BrainCircuit,
  BookOpen,
  Send,
  MessageSquare,
  FileText,
  Loader2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Radio,
} from 'lucide-react';
import { Spread, ReadingSession, Card } from '../types/tarot';
import { MarkdownRenderer } from './MarkdownRenderer';
import { JournalStorageService } from '../services/journalStorageService';
import {
  ChatMessage,
  streamTarotAi,
  buildTarotInterpretationPrompt,
  buildTarotDialoguePrompt,
} from '../services/ttagyService';
import { UserSettingsService } from '../services/userSettingsService';
import { AiPersona, CANONICAL_AI_PERSONAS } from '../types/settings';

interface ReadingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  spread: Spread;
  session: ReadingSession | null;
  selectedSlotIndex: number;
  onSelectSlot: (index: number) => void;
  cardsCatalog: Record<number, Card>;
  isPro: boolean;
  onTogglePro: () => void;
  onOpenSettings?: () => void;
}

export const ReadingDrawer: React.FC<ReadingDrawerProps> = ({
  isOpen,
  onClose,
  spread,
  session,
  selectedSlotIndex,
  onSelectSlot,
  cardsCatalog,
  isPro,
  onTogglePro,
  onOpenSettings,
}) => {
  const [activeSection, setActiveSection] = useState<'card' | 'elements' | 'ai'>('card');
  const [aiSubTab, setAiSubTab] = useState<'report' | 'chat'>('report');

  const [settings, setSettings] = useState(UserSettingsService.getSettings());
  const [selectedPersona, setSelectedPersona] = useState<AiPersona>(settings.ai.persona || 'jungian');

  // AI Report State
  const [aiReport, setAiReport] = useState<string>('');
  const [isReportGenerating, setIsReportGenerating] = useState<boolean>(false);
  const [reportThinking, setReportThinking] = useState<string>('');
  const [showThinking, setShowThinking] = useState<boolean>(settings.ai.showThinking ?? true);

  // AI Chat Dialogue State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isChatStreaming, setIsChatStreaming] = useState<boolean>(false);

  // Copy to clipboard state
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current = UserSettingsService.getSettings();
      setSettings(current);
      setSelectedPersona(current.ai.persona || 'jungian');
      setShowThinking(current.ai.showThinking ?? true);
    }
  }, [isOpen]);

  const handleCopyText = async (text: string, isReport: boolean = true, msgId?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isReport) {
        setCopiedReport(true);
        setTimeout(() => setCopiedReport(false), 2000);
      } else if (msgId) {
        setCopiedMsgId(msgId);
        setTimeout(() => setCopiedMsgId(null), 2000);
      }
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatStreaming]);

  if (!isOpen || !session) return null;

  const slot = spread.slots[selectedSlotIndex];
  const placed = session.placed_cards.find((p) => p.slot_id === slot?.slot_id);
  const card = placed ? cardsCatalog[placed.drawn_card.card_id] : null;

  const currentPersonaMeta =
    CANONICAL_AI_PERSONAS.find((p) => p.id === selectedPersona) || CANONICAL_AI_PERSONAS[0];

  const getProviderBadgeLabel = () => {
    switch (settings.ai.providerMode) {
      case 'ttagy_remote':
        return 'TTAgy 远程节点 (IPv6)';
      case 'byok_gemini':
        return 'Google Gemini API';
      case 'byok_openai':
        return 'OpenAI / DeepSeek';
      case 'ttagy_local':
      default:
        return 'TTAgy 本地守护进程';
    }
  };

  // 1. 发起 AI 全景推演报告流式生成
  const handleGenerateReport = async () => {
    if (!isPro) {
      onTogglePro();
      return;
    }
    setIsReportGenerating(true);
    setAiReport('');
    setReportThinking('');

    const prompt = buildTarotInterpretationPrompt(
      spread,
      session,
      cardsCatalog,
      selectedPersona
    );

    try {
      await streamTarotAi(
        prompt,
        {
          onThinkingDelta: (delta) => {
            setReportThinking((prev) => prev + delta);
          },
          onContentDelta: (_delta, accumulated) => {
            setAiReport(accumulated);
          },
          onDone: (finalContent, fullThinking) => {
            setAiReport(finalContent);
            if (fullThinking) setReportThinking(fullThinking);
            setIsReportGenerating(false);
            if (session) {
              JournalStorageService.updateSessionAiInterpretation(session.session_id, finalContent);
            }
          },
          onError: (err) => {
            setAiReport(`[推演异常]: ${err}`);
            setIsReportGenerating(false);
          },
        },
        settings
      );
    } catch (_err) {
      setIsReportGenerating(false);
    }
  };

  // 2. 发送追问并获取流式多轮回答
  const handleSendChatMessage = async (overrideText?: string) => {
    const textToSend = overrideText || inputQuery;
    if (!textToSend.trim() || isChatStreaming) return;

    if (!isPro) {
      onTogglePro();
      return;
    }

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: Date.now(),
    };

    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    setInputQuery('');
    setIsChatStreaming(true);

    const aiMsgId = `ai_${Date.now()}`;
    const aiPlaceholder: ChatMessage = {
      id: aiMsgId,
      sender: 'ai',
      text: '',
      timestamp: Date.now(),
    };
    setChatMessages((prev) => [...prev, aiPlaceholder]);

    const prompt = buildTarotDialoguePrompt(
      spread,
      session,
      cardsCatalog,
      newHistory,
      textToSend,
      selectedPersona
    );

    try {
      await streamTarotAi(
        prompt,
        {
          onContentDelta: (_delta, accumulated) => {
            setChatMessages((prev) =>
              prev.map((m) => (m.id === aiMsgId ? { ...m, text: accumulated } : m))
            );
          },
          onDone: (finalContent) => {
            setChatMessages((prev) =>
              prev.map((m) => (m.id === aiMsgId ? { ...m, text: finalContent } : m))
            );
            setIsChatStreaming(false);
          },
          onError: (err) => {
            setChatMessages((prev) =>
              prev.map((m) =>
                m.id === aiMsgId ? { ...m, text: `[交互异常]: ${err}` } : m
              )
            );
            setIsChatStreaming(false);
          },
        },
        settings
      );
    } catch (_err) {
      setIsChatStreaming(false);
    }
  };

  const quickQuestions = [
    '这张牌对我目前的决策意味着什么？',
    '逆位牌暴露了哪些潜在阻力？',
    '如何平衡我当前的元素能量？',
    '终局走向牌提示我优先采取什么行动？',
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="w-[540px] max-w-[94vw] h-full glass-drawer flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-amethyst-500/15 flex items-center justify-between bg-black/2 dark:bg-black/40 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-4 h-4 text-amethyst-500" />
            <div>
              <h3 className="text-[15px] font-editorial font-bold text-slate-900 dark:text-slate-100">
                {spread.name_zh} · 全景多维解构
              </h3>
              <p className="text-[11px] font-editorial text-slate-600 dark:text-slate-400">
                {session.question ? `焦点：${session.question}` : '整体运势与心智图谱推演'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-amethyst-500/10 hover:bg-amethyst-500/20 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Slot Mini Thumbnails Bar */}
        <div className="px-6 py-2.5 border-b border-amethyst-500/10 flex items-center space-x-2 overflow-x-auto flex-shrink-0 bg-amethyst-500/5">
          {spread.slots.map((sl, idx) => {
            const p = session.placed_cards.find((x) => x.slot_id === sl.slot_id);
            const c = p ? cardsCatalog[p.drawn_card.card_id] : null;
            const isSelected = selectedSlotIndex === idx;

            return (
              <button
                key={sl.slot_id}
                onClick={() => {
                  onSelectSlot(idx);
                  setActiveSection('card');
                }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-editorial flex items-center space-x-1.5 transition-all ${
                  isSelected
                    ? 'bg-amethyst-500/25 text-amethyst-800 dark:text-amethyst-200 border border-amethyst-500/50 font-bold shadow-sm'
                    : 'bg-black/5 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-transparent'
                }`}
              >
                <span className="font-mono text-[9px] opacity-70">#{idx + 1}</span>
                <span className="truncate max-w-[80px]">{c ? c.name_zh : sl.title_zh}</span>
              </button>
            );
          })}
        </div>

        {/* Primary Section Tabs */}
        <div className="flex border-b border-amethyst-500/10 text-[12px] font-editorial font-bold flex-shrink-0">
          <button
            onClick={() => setActiveSection('card')}
            className={`flex-1 py-2.5 text-center transition-all ${
              activeSection === 'card'
                ? 'text-amethyst-700 dark:text-amethyst-300 border-b-2 border-amethyst-500 bg-amethyst-500/10'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            单牌意象
          </button>
          <button
            onClick={() => setActiveSection('elements')}
            className={`flex-1 py-2.5 text-center transition-all ${
              activeSection === 'elements'
                ? 'text-amethyst-700 dark:text-amethyst-300 border-b-2 border-amethyst-500 bg-amethyst-500/10'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            四要素与灵数
          </button>
          <button
            onClick={() => setActiveSection('ai')}
            className={`flex-1 py-2.5 text-center transition-all flex items-center justify-center space-x-1 ${
              activeSection === 'ai'
                ? 'text-amethyst-700 dark:text-amethyst-300 border-b-2 border-amethyst-500 bg-amethyst-500/10'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amethyst-500" />
            <span>AI 认知推演</span>
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {/* ── 1. CARD SECTION ── */}
          {activeSection === 'card' && (
            <div className="space-y-4">
              {card ? (
                <>
                  {/* Position Header */}
                  <div className="p-3.5 rounded-xl border border-amethyst-500/20 bg-amethyst-500/5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-amethyst-700 dark:text-amethyst-300 font-bold">
                      <span>POSITION [{selectedSlotIndex + 1}]</span>
                      <span>{card.element} 元素</span>
                    </div>
                    <h4 className="text-[15px] font-editorial font-bold text-slate-900 dark:text-slate-100">
                      {slot.title_zh} ({slot.title_en})
                    </h4>
                    <p className="text-[12px] font-editorial text-slate-700 dark:text-slate-300 leading-relaxed">
                      {slot.meaning_prompt}
                    </p>
                  </div>

                  {/* Artwork & Metadata */}
                  <div className="flex space-x-4 p-4 rounded-2xl border border-amethyst-500/30 bg-amethyst-500/10 items-center">
                    <div className="w-20 h-34 rounded-xl overflow-hidden border border-amethyst-500/50 shadow-md flex-shrink-0 bg-black">
                      <img
                        src={`/cards/${card.id}.jpg`}
                        alt={card.name_zh}
                        className="w-full h-full object-cover rounded-xl"
                        style={{
                          transform:
                            placed?.drawn_card.orientation === 'Reversed'
                              ? 'rotate(180deg)'
                              : 'none',
                        }}
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div>
                        <h3 className="text-[18px] font-editorial font-bold text-slate-900 dark:text-slate-100">
                          {card.name_zh}
                        </h3>
                        <p className="text-[12px] font-editorial text-slate-500 italic">
                          {card.name_en}
                        </p>
                      </div>

                      <div className="text-[11px] font-editorial text-slate-700 dark:text-slate-300 space-y-0.5">
                        {card.astrology && <div>✨ {card.astrology}</div>}
                        {card.hebrew_letter && <div>📜 {card.hebrew_letter}</div>}
                      </div>

                      <div>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block font-editorial ${
                            placed?.drawn_card.orientation === 'Upright'
                              ? 'bg-bamboo/20 text-bamboo dark:text-bamboo-light border border-bamboo/40'
                              : 'bg-cinnabar/20 text-cinnabar dark:text-cinnabar-light border border-cinnabar/40'
                          }`}
                        >
                          {placed?.drawn_card.orientation === 'Upright'
                            ? '正位 (Upright)'
                            : '逆位 (Reversed)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5 font-bold">
                      原型关键词:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(placed?.drawn_card.orientation === 'Upright'
                        ? card.facets.general_upright
                        : card.facets.general_reversed
                      ).map((kw, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-full bg-amethyst-500/10 border border-amethyst-500/20 text-[11px] font-editorial font-medium text-slate-800 dark:text-slate-200"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Facet Insights */}
                  <div className="space-y-3 pt-2">
                    <div className="p-3.5 rounded-xl border border-amethyst-500/15 bg-black/3 dark:bg-white/5">
                      <span className="text-[11px] font-bold font-editorial text-amethyst-700 dark:text-amethyst-300 block mb-1">
                        情感与关系洞见:
                      </span>
                      <p className="text-[12px] font-editorial text-slate-800 dark:text-slate-200 leading-relaxed">
                        {placed?.drawn_card.orientation === 'Upright'
                          ? card.facets.love_upright
                          : card.facets.love_reversed}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-amethyst-500/15 bg-black/3 dark:bg-white/5">
                      <span className="text-[11px] font-bold font-editorial text-amethyst-700 dark:text-amethyst-300 block mb-1">
                        事业与成长指引:
                      </span>
                      <p className="text-[12px] font-editorial text-slate-800 dark:text-slate-200 leading-relaxed">
                        {placed?.drawn_card.orientation === 'Upright'
                          ? card.facets.career_upright
                          : card.facets.career_reversed}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-amethyst-500/15 bg-black/3 dark:bg-white/5">
                      <span className="text-[11px] font-bold font-editorial text-cinnabar dark:text-cinnabar-light block mb-1">
                        阴影盲区与警示:
                      </span>
                      <p className="text-[12px] font-editorial text-slate-800 dark:text-slate-200 leading-relaxed">
                        {card.facets.shadow_aspect}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 text-slate-400 font-editorial text-[13px]">
                  请选择一张卡牌查看原型意象。
                </div>
              )}
            </div>
          )}

          {/* ── 2. ELEMENTS SECTION ── */}
          {activeSection === 'elements' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-amethyst-500/20 bg-amethyst-500/5 space-y-3">
                <span className="text-[11px] font-bold font-editorial uppercase tracking-wider text-amethyst-700 dark:text-amethyst-300 block">
                  四要素炼金能量流转
                </span>

                <div className="space-y-2.5 text-[12px] font-mono">
                  {/* Fire */}
                  <div className="flex items-center justify-between text-cinnabar dark:text-cinnabar-light font-editorial">
                    <div className="flex items-center space-x-1.5">
                      <Flame className="w-4 h-4" />
                      <span className="font-bold">火 (意志 / 开创):</span>
                    </div>
                    <span className="font-bold font-mono">
                      {(session.dignity_summary.fire_ratio * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cinnabar h-full rounded-full transition-all duration-700"
                      style={{ width: `${session.dignity_summary.fire_ratio * 100}%` }}
                    />
                  </div>

                  {/* Water */}
                  <div className="flex items-center justify-between text-azure dark:text-azure-light font-editorial pt-1.5">
                    <div className="flex items-center space-x-1.5">
                      <Droplet className="w-4 h-4" />
                      <span className="font-bold">水 (情感 / 直觉):</span>
                    </div>
                    <span className="font-bold font-mono">
                      {(session.dignity_summary.water_ratio * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-azure h-full rounded-full transition-all duration-700"
                      style={{ width: `${session.dignity_summary.water_ratio * 100}%` }}
                    />
                  </div>

                  {/* Air */}
                  <div className="flex items-center justify-between text-yellow-600 dark:text-yellow-400 font-editorial pt-1.5">
                    <div className="flex items-center space-x-1.5">
                      <Wind className="w-4 h-4" />
                      <span className="font-bold">风 (心智 / 策略):</span>
                    </div>
                    <span className="font-bold font-mono">
                      {(session.dignity_summary.air_ratio * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-yellow-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${session.dignity_summary.air_ratio * 100}%` }}
                    />
                  </div>

                  {/* Earth */}
                  <div className="flex items-center justify-between text-bamboo dark:text-bamboo-light font-editorial pt-1.5">
                    <div className="flex items-center space-x-1.5">
                      <Mountain className="w-4 h-4" />
                      <span className="font-bold">土 (现实 / 根基):</span>
                    </div>
                    <span className="font-bold font-mono">
                      {(session.dignity_summary.earth_ratio * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-bamboo h-full rounded-full transition-all duration-700"
                      style={{ width: `${session.dignity_summary.earth_ratio * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Dominant Element & Shadow Card */}
              <div className="p-4 rounded-xl border border-amethyst-500/20 bg-amethyst-500/5 space-y-2">
                <div className="flex justify-between items-center text-[12px] font-editorial">
                  <span className="text-slate-600 dark:text-slate-400">主导态势:</span>
                  <span className="font-bold text-amethyst-700 dark:text-amethyst-300">
                    {session.dignity_summary.dominant_element}
                  </span>
                </div>
                {session.dignity_summary.shadow_card_id !== undefined && (
                  <div className="pt-2 border-t border-amethyst-500/10 flex justify-between items-center text-[12px] font-editorial">
                    <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
                      <Moon className="w-4 h-4 text-amethyst-500" />
                      <span>灵数底牌 (隐秘根基):</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {cardsCatalog[session.dignity_summary.shadow_card_id ?? 0]?.name_zh ?? '愚者'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── 3. AI SECTION ── */}
          {activeSection === 'ai' && (
            <div className="space-y-4">
              {!isPro ? (
                <div className="p-6 text-center space-y-3 rounded-2xl border border-amethyst-500/40 bg-amethyst-500/10">
                  <div className="w-12 h-12 rounded-full bg-amethyst-500/20 flex items-center justify-center mx-auto shadow-amethyst-subtle">
                    <Lock className="w-5 h-5 text-amethyst-500" />
                  </div>
                  <h4 className="text-[15px] font-editorial font-bold text-slate-900 dark:text-slate-100">
                    AI 深度推演与圣所对话 (PRO 专享)
                  </h4>
                  <p className="text-[12px] font-editorial text-slate-700 dark:text-slate-300 leading-relaxed">
                    支持自建 TTAgy 私有节点、公网 IPv6 电脑直连与四大流派多维报告推演。
                  </p>
                  <button
                    onClick={onTogglePro}
                    className="w-full py-2.5 rounded-full bg-gradient-to-r from-amethyst-600 to-purple-700 text-white font-bold text-[12px] font-editorial shadow-amethyst-glow transform active:scale-95 transition-all"
                  >
                    免费解锁 PRO 模式
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Persona Selector & Provider Node Status Bar */}
                  <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold font-editorial text-purple-300 uppercase">
                          当前推演流派:
                        </span>
                        <select
                          value={selectedPersona}
                          onChange={(e) => {
                            const p = e.target.value as AiPersona;
                            setSelectedPersona(p);
                            UserSettingsService.setAiPersona(p);
                          }}
                          className="px-2 py-0.5 rounded-full bg-black/40 border border-purple-500/30 text-[11px] font-editorial font-bold text-slate-100 focus:outline-none"
                        >
                          {CANONICAL_AI_PERSONAS.map((cp) => (
                            <option key={cp.id} value={cp.id} className="bg-slate-900">
                              {cp.nameZh}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={onOpenSettings}
                        className="text-[10px] font-editorial text-purple-400 hover:text-purple-300 transition-colors flex items-center space-x-1"
                      >
                        <Radio className="w-3 h-3" />
                        <span>{getProviderBadgeLabel()}</span>
                      </button>
                    </div>

                    <p className="text-[10px] font-editorial text-slate-400">
                      {currentPersonaMeta.taglineZh}
                    </p>
                  </div>

                  {/* AI Sub-navigation Tabs */}
                  <div className="flex items-center justify-between border-b border-amethyst-500/15 pb-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setAiSubTab('report')}
                        className={`px-3 py-1 rounded-full text-[11px] font-editorial flex items-center space-x-1.5 transition-all ${
                          aiSubTab === 'report'
                            ? 'bg-amethyst-500/20 text-amethyst-700 dark:text-amethyst-200 border border-amethyst-500/40 font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        <FileText className="w-3 h-3" />
                        <span>全景推演报告</span>
                      </button>
                      <button
                        onClick={() => setAiSubTab('chat')}
                        className={`px-3 py-1 rounded-full text-[11px] font-editorial flex items-center space-x-1.5 transition-all ${
                          aiSubTab === 'chat'
                            ? 'bg-amethyst-500/20 text-amethyst-700 dark:text-amethyst-200 border border-amethyst-500/40 font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>圣所追问对话</span>
                        {chatMessages.length > 0 && (
                          <span className="w-4 h-4 rounded-full bg-amethyst-500 text-white text-[9px] font-mono flex items-center justify-center">
                            {chatMessages.length}
                          </span>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center space-x-1 text-[10px] font-mono text-purple-400">
                      <BrainCircuit className="w-3.5 h-3.5" />
                      <span>{currentPersonaMeta.nameZh.slice(0, 4)}</span>
                    </div>
                  </div>

                  {/* ─── 1. SubTab: 多维推演报告 ─── */}
                  {aiSubTab === 'report' && (
                    <div className="space-y-3.5">
                      <button
                        onClick={handleGenerateReport}
                        disabled={isReportGenerating}
                        className="w-full py-2.5 rounded-full bg-gradient-to-r from-amethyst-600 to-purple-700 text-white font-bold text-[12px] font-editorial shadow-amethyst-glow hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        {isReportGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>AI 认知节点流式推演中...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>{aiReport ? '重新生成推演报告' : '生成全景推演报告 (↵)'}</span>
                          </>
                        )}
                      </button>

                      {/* Thinking Chain Accordion */}
                      {reportThinking && (
                        <div className="rounded-xl border border-amethyst-500/20 bg-black/5 dark:bg-white/5 overflow-hidden text-[11px]">
                          <button
                            onClick={() => setShowThinking(!showThinking)}
                            className="w-full px-3 py-2 flex items-center justify-between text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                          >
                            <span className="flex items-center space-x-1.5">
                              <BrainCircuit className="w-3.5 h-3.5 text-amethyst-500" />
                              <span>深度推演心智链</span>
                            </span>
                            {showThinking ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                          {showThinking && (
                            <div className="px-3 py-2 border-t border-amethyst-500/10 font-mono text-[10px] text-slate-500 dark:text-slate-400 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                              {reportThinking}
                            </div>
                          )}
                        </div>
                      )}

                      {aiReport ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[11px] font-editorial font-bold text-amethyst-700 dark:text-amethyst-300">
                              {currentPersonaMeta.nameZh} · 推演报告
                            </span>
                            <button
                              onClick={() => handleCopyText(aiReport, true)}
                              className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amethyst-500/10 hover:bg-amethyst-500/20 text-amethyst-700 dark:text-amethyst-300 border border-amethyst-500/25 text-[11px] font-editorial transition-all"
                              title="复制完整推演报告"
                            >
                              {copiedReport ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400 font-bold">已复制</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>复制报告</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="p-4 rounded-2xl border border-amethyst-500/25 bg-amethyst-500/5 shadow-sm select-text">
                            <MarkdownRenderer content={aiReport} />
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 text-center text-slate-500 dark:text-slate-400 font-editorial text-[12px] border border-dashed border-amethyst-500/20 rounded-2xl">
                          点击上方按钮，以【{currentPersonaMeta.nameZh}】视角对当前 {spread.slots.length} 张牌面、DAG 空间连线与四要素分布进行深度心理学解构。
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─── 2. SubTab: 圣所追问对话 ─── */}
                  {aiSubTab === 'chat' && (
                    <div className="flex flex-col h-[420px] rounded-2xl border border-amethyst-500/20 bg-black/[0.02] dark:bg-white/[0.02] overflow-hidden">
                      {/* Messages Area */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-3">
                        {chatMessages.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 space-y-3">
                            <HelpCircle className="w-8 h-8 text-amethyst-400/60" />
                            <div>
                              <p className="text-[13px] font-editorial font-bold text-slate-800 dark:text-slate-200">
                                开启连续多轮追问
                              </p>
                              <p className="text-[11px] font-editorial text-slate-500 mt-1 max-w-[280px]">
                                就具体卡位关系、行动时机、个人困惑向【{currentPersonaMeta.nameZh}】导师自由提问。
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1.5 justify-center max-w-[340px] pt-1">
                              {quickQuestions.map((q, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleSendChatMessage(q)}
                                  className="text-[10px] font-editorial px-2.5 py-1 rounded-full bg-amethyst-500/10 hover:bg-amethyst-500/20 text-amethyst-700 dark:text-amethyst-300 border border-amethyst-500/20 transition-all text-left truncate max-w-[300px]"
                                >
                                  {q}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <>
                            {chatMessages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex flex-col ${
                                  msg.sender === 'user' ? 'items-end' : 'items-start'
                                }`}
                              >
                                <div className="flex items-center justify-between w-full max-w-[88%] mb-1 px-1">
                                  <span className="text-[9px] font-mono text-slate-400">
                                    {msg.sender === 'user' ? '求问者' : `${currentPersonaMeta.nameZh.slice(0, 4)}导师`}
                                  </span>
                                  {msg.sender === 'ai' && msg.text && (
                                    <button
                                      onClick={() => handleCopyText(msg.text, false, msg.id)}
                                      className="text-slate-400 hover:text-amethyst-400 transition-colors p-0.5"
                                      title="复制此回答"
                                    >
                                      {copiedMsgId === msg.id ? (
                                        <Check className="w-3 h-3 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  )}
                                </div>
                                <div
                                  className={`max-w-[88%] p-3.5 rounded-2xl text-[12px] font-editorial leading-relaxed select-text ${
                                    msg.sender === 'user'
                                      ? 'bg-amethyst-600 text-white rounded-tr-sm shadow-md'
                                      : 'bg-white dark:bg-[#1A122B] text-slate-800 dark:text-slate-100 border border-amethyst-500/20 rounded-tl-sm shadow-sm'
                                  }`}
                                >
                                  {msg.text ? (
                                    <MarkdownRenderer content={msg.text} />
                                  ) : (
                                    <span className="flex items-center space-x-1.5 text-amethyst-400">
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      <span>正在沉思...</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                            <div ref={chatEndRef} />
                          </>
                        )}
                      </div>

                      {/* Chat Input Bar */}
                      <div className="p-2.5 border-t border-amethyst-500/15 bg-white/60 dark:bg-black/40 flex items-center space-x-2">
                        <input
                          type="text"
                          value={inputQuery}
                          onChange={(e) => setInputQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendChatMessage();
                            }
                          }}
                          placeholder="向推演导师提出你的困惑与追问 (↵)..."
                          disabled={isChatStreaming}
                          className="flex-1 bg-transparent border-0 text-[12px] font-editorial text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none px-2"
                        />
                        <button
                          onClick={() => handleSendChatMessage()}
                          disabled={!inputQuery.trim() || isChatStreaming}
                          className="w-8 h-8 rounded-full bg-amethyst-600 text-white flex items-center justify-center hover:bg-amethyst-700 active:scale-95 transition-all disabled:opacity-40 shadow-sm"
                        >
                          {isChatStreaming ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
