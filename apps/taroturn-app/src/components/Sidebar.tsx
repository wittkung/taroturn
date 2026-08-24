import React from 'react';
import { Compass, BookOpen, Lock } from 'lucide-react';
import { Spread } from '../types/tarot';

interface SidebarProps {
  spreads: Spread[];
  selectedSpreadId: string;
  onSelectSpread: (spread: Spread) => void;
  isPro: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  spreads,
  selectedSpreadId,
  onSelectSpread,
  isPro,
}) => {
  return (
    <aside className="w-[190px] flex-shrink-0 h-full border-r border-black/5 dark:border-white/5 bg-white/50 dark:bg-sumiBlack/80 flex flex-col justify-between select-none z-20 transition-colors duration-300">
      <div className="p-3 space-y-5 overflow-y-auto">
        {/* Section: Spreads */}
        <div>
          <div className="px-2 mb-2 flex items-center justify-between text-[10px] font-bold font-editorial uppercase tracking-[1.5px] text-kintsugiGold dark:text-kintsugiGold-light">
            <span>经典牌阵</span>
            <Compass className="w-3 h-3 text-kintsugiGold/80" />
          </div>
          <div className="space-y-0.5">
            {spreads.map((spread) => {
              const isSelected = spread.id === selectedSpreadId;
              return (
                <button
                  key={spread.id}
                  onClick={() => onSelectSpread(spread)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[12px] font-editorial transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-kintsugiGold/15 text-kintsugiGold dark:text-kintsugiGold-light font-bold border-l-2 border-kintsugiGold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="truncate">{spread.name_zh}</span>
                  <span className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                    isSelected ? 'bg-kintsugiGold/20 text-kintsugiGold' : 'text-slate-400 bg-black/5 dark:bg-white/5'
                  }`}>
                    {spread.slots.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section: Pro Archives */}
        <div>
          <div className="px-2 mb-2 flex items-center justify-between text-[10px] font-bold font-editorial uppercase tracking-[1.5px] text-slate-400">
            <span>占卜手记</span>
            <BookOpen className="w-3 h-3 text-slate-400" />
          </div>
          <div className="space-y-0.5">
            <button
              disabled={!isPro}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[12px] font-editorial flex items-center justify-between transition-all ${
                isPro
                  ? 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
                  : 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
              }`}
            >
              <span className="truncate">云端归档</span>
              {!isPro && <Lock className="w-3 h-3 text-kintsugiGold/70" />}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-black/5 dark:border-white/5 text-[9px] font-mono text-slate-400 dark:text-slate-500 space-y-1">
        <div className="flex justify-between items-center">
          <span>Engine</span>
          <span className="text-slate-600 dark:text-slate-300">ChaCha20 Core</span>
        </div>
      </div>
    </aside>
  );
};
