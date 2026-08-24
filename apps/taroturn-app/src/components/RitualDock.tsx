import React from 'react';
import { RefreshCw, Eye, Dna, Compass } from 'lucide-react';

interface RitualDockProps {
  question: string;
  onChangeQuestion: (q: string) => void;
  allowReversals: boolean;
  onToggleReversals: () => void;
  onShuffleAndDraw: () => void;
  isDrawing: boolean;
  hasSession: boolean;
  onRevealAll: () => void;
  unrevealedCount: number;
  rngSeed?: string;
}

export const RitualDock: React.FC<RitualDockProps> = ({
  question,
  onChangeQuestion,
  allowReversals,
  onToggleReversals,
  onShuffleAndDraw,
  isDrawing,
  hasSession,
  onRevealAll,
  unrevealedCount,
  rngSeed,
}) => {
  return (
    <div className="w-full flex flex-col items-center z-30 pointer-events-none select-none pb-5">
      {/* Floating Island Capsule */}
      <div className="pointer-events-auto flex items-center space-x-3 px-5 py-2.5 rounded-full glass-dock shadow-dock dark:shadow-dock transition-all duration-300 max-w-[860px] w-[92%]">
        {/* Intention Input */}
        <div className="flex-1 flex items-center space-x-2">
          <span className="text-[11px] font-cinzel text-amethyst-700 dark:text-amethyst-300 font-bold tracking-wider flex-shrink-0">
            INTENTION //
          </span>
          <input
            type="text"
            value={question}
            onChange={(e) => onChangeQuestion(e.target.value)}
            placeholder="输入您心中的议题、深层心绪或探索愿景..."
            className="w-full bg-transparent text-[13px] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-editorial px-2 py-0.5"
          />
        </div>

        {/* Authentic Tradition Switcher (Discrete: RWS 50/50 vs Marseille Upright) */}
        <button
          onClick={onToggleReversals}
          className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amethyst-500/10 hover:bg-amethyst-500/20 text-amethyst-700 dark:text-amethyst-300 text-[11px] font-editorial border border-amethyst-500/25 transition-all flex-shrink-0"
          title="点击切换推演流派（经典正逆位 vs 马赛全正位）"
        >
          <Compass className="w-3.5 h-3.5 text-amethyst-500" />
          <span>{allowReversals ? '经典正逆位 (RWS)' : '全正位流派 (马赛)'}</span>
        </button>

        {/* Reveal All Cards (if any cards face-down) */}
        {hasSession && unrevealedCount > 0 && (
          <button
            onClick={onRevealAll}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-amethyst-500/20 hover:bg-amethyst-500/30 text-amethyst-700 dark:text-amethyst-300 border border-amethyst-500/40 font-editorial font-bold text-[12px] shadow-sm transition-all flex-shrink-0"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>揭示余牌 ({unrevealedCount})</span>
          </button>
        )}

        {/* Primary Action Button */}
        <button
          onClick={onShuffleAndDraw}
          disabled={isDrawing}
          className="flex items-center space-x-2 px-5 py-2 rounded-full bg-gradient-to-r from-amethyst-600 via-purple-600 to-gold text-white font-editorial font-bold text-[13px] shadow-amethyst-glow hover:brightness-110 active:scale-95 transition-all flex-shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isDrawing ? 'animate-spin' : ''}`} />
          <span>{hasSession ? '重新洗牌 (↵)' : '开始密码学抽牌 (↵)'}</span>
        </button>
      </div>

      {/* Subtle Bottom Entropy Footnote */}
      {rngSeed && (
        <div className="mt-2 flex items-center space-x-2 text-[10px] font-mono text-slate-600 dark:text-slate-400 pointer-events-auto">
          <Dna className="w-3.5 h-3.5 text-amethyst-500" />
          <span>ChaCha20 种子指纹:</span>
          <span className="truncate max-w-[280px] font-semibold text-amethyst-800 dark:text-amethyst-300">{rngSeed}</span>
          <span>· 100% 确定性回放验证</span>
        </div>
      )}
    </div>
  );
};
