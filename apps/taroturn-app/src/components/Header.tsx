// src/components/Header.tsx - TTZip 54pt Header Bar with Kintsugi Gold Line
import React, { useState } from 'react';
import {
  Crown,
  Sun,
  Moon,
  ChevronDown,
  BookOpen,
  User,
} from 'lucide-react';
import { Spread } from '../types/tarot';
import { UserSettings } from '../types/settings';
import { calculateSeekerProfile } from '../services/tarotCalculators';
import { ActiveWorkspaceTab, WORKSPACE_TABS } from '../types/navigation';

interface HeaderProps {
  activeTab: ActiveWorkspaceTab;
  onSelectTab: (tab: ActiveWorkspaceTab) => void;
  spreads: Spread[];
  selectedSpread: Spread;
  onSelectSpread: (spread: Spread) => void;
  isPro: boolean;
  onTogglePro: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenDrawer?: () => void;
  hasDrawnSession?: boolean;
  userSettings?: UserSettings;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  spreads,
  selectedSpread,
  onSelectSpread,
  isPro,
  onTogglePro,
  isDark,
  onToggleTheme,
  onOpenDrawer,
  hasDrawnSession,
  userSettings,
}) => {
  const [spreadMenuOpen, setSpreadMenuOpen] = useState(false);

  const currentTabMeta = WORKSPACE_TABS.find((t) => t.id === activeTab) || WORKSPACE_TABS[0];
  const calc = userSettings
    ? calculateSeekerProfile(userSettings.profile.birthdate)
    : null;

  return (
    <header className="w-full flex-shrink-0 z-40 select-none relative">
      <div className="h-[54px] px-6 flex items-center justify-between glass-header transition-colors duration-300">
        {/* Left: Tab Section Code & Title / Spread Selector */}
        <div className="flex items-center space-x-4">
          <div className="flex flex-col justify-center">
            <span className="text-[9px] font-mono font-bold tracking-[2px] text-amber-500/90 dark:text-amber-400/90 uppercase">
              {currentTabMeta.sectionCode}
            </span>
            <h1 className="text-base font-editorial font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{currentTabMeta.nameZh}</span>
              <span className="text-[10px] font-editorial text-slate-400 font-normal">
                {currentTabMeta.nameEn}
              </span>
            </h1>
          </div>

          {activeTab === 'divination' && (
            <>
              <div className="h-4 w-[1px] bg-purple-500/20" />

              {/* Spread Selector Popover */}
              <div className="relative">
                <button
                  onClick={() => setSpreadMenuOpen(!spreadMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/20 text-[12px] font-editorial font-bold text-slate-900 dark:text-slate-100 transition-all hover:border-purple-500/50"
                >
                  <span>{selectedSpread.name_zh}</span>
                  <span className="text-[10px] font-mono opacity-70 text-purple-700 dark:text-purple-300">
                    ({selectedSpread.slots.length}张)
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-purple-500 transition-transform ${
                      spreadMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {spreadMenuOpen && (
                  <div className="absolute top-full mt-2 left-0 w-[420px] max-h-[80vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-purple-500/25 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2">
                    <div className="flex items-center justify-between px-2.5 py-1 border-b border-purple-500/15">
                      <span className="text-[11px] font-bold font-editorial uppercase tracking-wider text-purple-700 dark:text-purple-300">
                        圣所牌阵图谱 · 架构与用途解析
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        共 {spreads.length} 款牌阵
                      </span>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      {spreads.map((sp) => {
                        const isCurrent = sp.id === selectedSpread.id;
                        return (
                          <button
                            key={sp.id}
                            onClick={() => {
                              onSelectSpread(sp);
                              setSpreadMenuOpen(false);
                            }}
                            className={`w-full text-left p-3 rounded-2xl text-[12px] font-editorial transition-all flex flex-col space-y-1.5 ${
                              isCurrent
                                ? 'bg-purple-500/15 text-slate-900 dark:text-slate-100 font-bold border border-purple-500/40 shadow-sm'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-white/5 hover:border-white/10 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-[13px] text-slate-900 dark:text-slate-100">
                                  {sp.name_zh}
                                </span>
                                {sp.tag && (
                                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                    {sp.tag}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                                {sp.slots.length} 张
                              </span>
                            </div>

                            <div className="text-[11px] font-editorial text-slate-600 dark:text-slate-400 leading-relaxed">
                              {sp.description || sp.purpose}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2.5">
          {/* If cards drawn, highlight Reading Drawer Button */}
          {hasDrawnSession && (
            <button
              onClick={onOpenDrawer}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-[12px] font-editorial font-bold text-purple-700 dark:text-purple-300 transition-all animate-pulse shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-500" />
              <span>全景推演抽屉</span>
            </button>
          )}

          {/* Day / Night Mode Switcher */}
          <button
            onClick={onToggleTheme}
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 border border-purple-500/15 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all hover:border-purple-500/40"
            title={isDark ? '切换至和纸白 (日间模式)' : '切换至午夜紫罗兰 (夜间模式)'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-purple-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Seeker Profile Avatar Pill */}
          {userSettings && (
            <button
              onClick={() => onSelectTab('profiles')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-[11px] font-editorial transition-all ${
                activeTab === 'profiles'
                  ? 'bg-purple-600 text-white font-bold border-purple-400 shadow-sm'
                  : 'bg-purple-500/15 hover:bg-purple-500/25 border-purple-500/30 text-purple-700 dark:text-purple-300'
              }`}
              title="切换至本命神殿"
            >
              <User className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-bold truncate max-w-[100px]">
                {userSettings.profile.name || userSettings.profile.nickname}
              </span>
              {calc && (
                <span className="text-[9px] font-mono opacity-80 bg-purple-500/20 px-1 rounded">
                  #{calc.soulCardId}
                </span>
              )}
            </button>
          )}

          {/* Pro Switcher */}
          <button
            onClick={onTogglePro}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-[11px] font-bold font-editorial transition-all duration-300 ${
              isPro
                ? 'bg-gradient-to-r from-purple-600/30 to-amber-500/20 border-purple-500/60 text-purple-700 dark:text-purple-300 shadow-sm'
                : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-slate-500 dark:text-slate-400'
            }`}
          >
            <Crown className={`w-3.5 h-3.5 ${isPro ? 'text-amber-400' : 'text-slate-400'}`} />
            <span className="hidden md:inline">{isPro ? 'PRO 尊享' : '免费模式'}</span>
          </button>
        </div>
      </div>

      {/* 1.5pt TTZip Kintsugi Gold & Violet Rule Line */}
      <div className="golden-rule-line" />
    </header>
  );
};
