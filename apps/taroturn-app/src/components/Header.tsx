import React, { useState } from 'react';
import { Crown, Layers, Sun, Moon, ChevronDown, BookOpen, Sparkles, History } from 'lucide-react';
import { Spread } from '../types/tarot';

interface HeaderProps {
  spreads: Spread[];
  selectedSpread: Spread;
  onSelectSpread: (spread: Spread) => void;
  isPro: boolean;
  onTogglePro: () => void;
  onOpenDeckCatalog: () => void;
  onOpenJournal: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenDrawer?: () => void;
  hasDrawnSession?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  spreads,
  selectedSpread,
  onSelectSpread,
  isPro,
  onTogglePro,
  onOpenDeckCatalog,
  onOpenJournal,
  isDark,
  onToggleTheme,
  onOpenDrawer,
  hasDrawnSession,
}) => {
  const [spreadMenuOpen, setSpreadMenuOpen] = useState(false);

  return (
    <header className="w-full flex-shrink-0 z-40 select-none relative">
      <div className="h-[52px] px-6 flex items-center justify-between glass-header transition-colors duration-300">
        {/* Left: Brand & Spread Selector */}
        <div className="flex items-center space-x-5">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amethyst-500 animate-pulse" />
            <span className="font-cinzel text-[16px] font-bold tracking-[4px] violet-foil-text">
              TAROTURN
            </span>
          </div>

          <div className="h-4 w-[1px] bg-amethyst-500/20" />

          {/* Spread Selector Popover */}
          <div className="relative">
            <button
              onClick={() => setSpreadMenuOpen(!spreadMenuOpen)}
              className="flex items-center space-x-2 px-3 py-1 rounded-full bg-amethyst-500/10 hover:bg-amethyst-500/15 border border-amethyst-500/20 text-[12px] font-editorial font-bold text-slate-900 dark:text-slate-100 transition-all hover:border-amethyst-500/50"
            >
              <span>{selectedSpread.name_zh}</span>
              <span className="text-[10px] font-mono opacity-70 text-amethyst-700 dark:text-amethyst-300">({selectedSpread.slots.length}张)</span>
              <ChevronDown className={`w-3.5 h-3.5 text-amethyst-500 transition-transform ${spreadMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {spreadMenuOpen && (
              <div className="absolute top-full mt-2 left-0 w-64 bg-white/95 dark:bg-sanctuary-cardDark/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-amethyst-500/20 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[10px] font-bold font-editorial uppercase tracking-wider text-amethyst-700 dark:text-amethyst-300 px-2.5 py-1 mb-1">
                  选择占卜牌阵
                </div>
                <div className="space-y-1">
                  {spreads.map((sp) => {
                    const isCurrent = sp.id === selectedSpread.id;
                    return (
                      <button
                        key={sp.id}
                        onClick={() => {
                          onSelectSpread(sp);
                          setSpreadMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-xl text-[12px] font-editorial transition-all flex items-center justify-between ${
                          isCurrent
                            ? 'bg-amethyst-500/20 text-amethyst-700 dark:text-amethyst-300 font-bold border border-amethyst-500/30'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-amethyst-500/10'
                        }`}
                      >
                        <div>
                          <div className="font-bold">{sp.name_zh}</div>
                          <div className="text-[10px] text-slate-500 line-clamp-1">{sp.description}</div>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 text-slate-500">
                          {sp.slots.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-3">
          {/* If cards drawn, highlight Reading Drawer Button */}
          {hasDrawnSession && (
            <button
              onClick={onOpenDrawer}
              className="flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-amethyst-500/20 hover:bg-amethyst-500/30 border border-amethyst-500/40 text-[12px] font-editorial font-bold text-amethyst-700 dark:text-amethyst-300 shadow-amethyst-subtle transition-all animate-pulse"
            >
              <BookOpen className="w-3.5 h-3.5 text-amethyst-500" />
              <span>全景深度解读</span>
            </button>
          )}

          {/* 78-Card Deck Catalog */}
          <button
            onClick={onOpenDeckCatalog}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 border border-amethyst-500/15 text-[12px] font-editorial text-slate-700 dark:text-slate-300 transition-all hover:border-amethyst-500/40"
            title="浏览 78 张 1909 莱德·伟特原版卡牌图鉴"
          >
            <Layers className="w-3.5 h-3.5 text-amethyst-500" />
            <span>78 牌图鉴</span>
          </button>

          {/* Reading History & Journal */}
          <button
            onClick={onOpenJournal}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 border border-amethyst-500/15 text-[12px] font-editorial text-slate-700 dark:text-slate-300 transition-all hover:border-amethyst-500/40"
            title="查看历史推演记录与占卜复盘"
          >
            <History className="w-3.5 h-3.5 text-amber-500" />
            <span>历史账本</span>
          </button>

          {/* Day / Night Mode Switcher */}
          <button
            onClick={onToggleTheme}
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 border border-amethyst-500/15 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all hover:border-amethyst-500/40"
            title={isDark ? '切换至和纸薰衣草 (日间模式)' : '切换至午夜紫罗兰 (夜间模式)'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-gold hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-amethyst-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Pro Membership Switcher */}
          <button
            onClick={onTogglePro}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-[11px] font-bold font-editorial transition-all duration-300 ${
              isPro
                ? 'bg-gradient-to-r from-amethyst-600/30 to-gold/20 border-amethyst-500/60 text-amethyst-700 dark:text-amethyst-300 shadow-amethyst-subtle'
                : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Crown className={`w-3.5 h-3.5 ${isPro ? 'text-gold' : 'text-slate-400'}`} />
            <span>{isPro ? 'PRO 尊享' : '免费模式'}</span>
          </button>
        </div>
      </div>

      {/* 1.5pt TTZip Kintsugi Gold & Violet Rule Line */}
      <div className="golden-rule-line" />
    </header>
  );
};
