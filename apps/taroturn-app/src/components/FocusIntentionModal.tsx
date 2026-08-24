import React, { useState } from 'react';
import { Sparkles, X, Compass, Heart, Briefcase, Moon } from 'lucide-react';
import { Spread } from '../types/tarot';

interface FocusIntentionModalProps {
  isOpen: boolean;
  onClose: () => void;
  spread: Spread;
  currentQuestion: string;
  onConfirmDraw: (question: string) => void;
}

const PRESET_TOPICS = [
  {
    icon: Briefcase,
    category: '事业与决策',
    presets: [
      '近期新项目的商业推进节奏与关键破局点？',
      '当前面临的职业转型方向与潜在风险为何？',
      '如何化解团队协作中的资源瓶颈与认知分歧？',
    ],
  },
  {
    icon: Heart,
    category: '情感与人际',
    presets: [
      '双方当前关系的真实潜意识连接与发展走向？',
      '如何突破彼此沟通中的隐性壁垒与情感盲区？',
      '在当前人际互动中，我需要照见并疗愈什么？',
    ],
  },
  {
    icon: Compass,
    category: '全局运势与两难',
    presets: [
      '面对当下重大抉择，潜意识给出的最优路径指引？',
      '近期最需要重点关注并防范的黑天鹅隐患？',
      '未来三个月的核心机遇与内在能量流向？',
    ],
  },
  {
    icon: Moon,
    category: '灵性自性化',
    presets: [
      '当下生命阶段宇宙给予我的核心课题与启示？',
      '如何整合内在被压抑的阴影面以重获创造力？',
      '今日静心冥想最适宜观照的内在能量状态？',
    ],
  },
];

export const FocusIntentionModal: React.FC<FocusIntentionModalProps> = ({
  isOpen,
  onClose,
  spread,
  currentQuestion,
  onConfirmDraw,
}) => {
  const [questionText, setQuestionText] = useState(currentQuestion || '');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg bg-slate-900/95 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-amber-500/20 bg-gradient-to-r from-purple-950/40 to-slate-900 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-editorial font-bold text-slate-100">
                凝神静思 · 确立推演焦点
              </h3>
              <p className="text-[11px] font-editorial text-amber-400/80">
                当前牌阵：{spread.name_zh}（{spread.slots.length} 张牌）
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Question Text Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-editorial font-medium text-slate-300 flex items-center justify-between">
              <span>心中焦点议题 (Question / Focus Intent):</span>
              <span className="text-[10px] text-slate-500">AI 将严格基于此议题深度解构</span>
            </label>
            <div className="relative">
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="请写下此时此刻令你困惑、需要潜意识与理性协同剖析的具体事件或方向..."
                rows={3}
                className="w-full bg-black/40 border border-amber-500/30 focus:border-amber-400 rounded-2xl p-3.5 text-xs font-editorial text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all resize-none"
              />
            </div>
          </div>

          {/* Quick Preset Selector */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-editorial font-bold text-amber-400/90 block">
              或直接选取经典情境预设：
            </span>
            <div className="space-y-2.5">
              {PRESET_TOPICS.map((topic, i) => {
                const Icon = topic.icon;
                return (
                  <div key={i} className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-300">
                      <Icon className="w-3.5 h-3.5 text-amber-400" />
                      <span>{topic.category}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      {topic.presets.map((p, j) => (
                        <button
                          key={j}
                          onClick={() => setQuestionText(p)}
                          className={`text-left text-[11px] font-editorial px-2.5 py-1.5 rounded-xl transition-all ${
                            questionText === p
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                              : 'bg-black/20 hover:bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent'
                          }`}
                        >
                          ✦ {p}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-amber-500/20 bg-black/40 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onConfirmDraw('整体心智运势与自性潜能观照');
            }}
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-editorial transition-colors"
          >
            心中默念，直接抽牌
          </button>
          <button
            onClick={() => {
              onConfirmDraw(questionText.trim() || '当前焦点议题洞察');
            }}
            className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs font-editorial shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>确立焦点 · 启动密码学抽牌 (↵)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
