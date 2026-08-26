// src/components/Sidebar.tsx - TTZip-style Zen Sidebar Navigation
import React from 'react';
import {
  Sparkles,
  History,
  Layers,
  User,
  Sliders,
  Crown,
  ShieldCheck,
} from 'lucide-react';
import { ActiveWorkspaceTab, WORKSPACE_TABS } from '../types/navigation';
import { UserSettings } from '../types/settings';

interface SidebarProps {
  activeTab: ActiveWorkspaceTab;
  onSelectTab: (tab: ActiveWorkspaceTab) => void;
  userSettings?: UserSettings;
  isPro: boolean;
  onTogglePro: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userSettings,
  isPro,
  onTogglePro,
}) => {
  const renderIcon = (iconName: string, isSelected: boolean) => {
    const cls = `w-4 h-4 transition-transform group-hover:scale-110 ${
      isSelected ? 'text-amber-400 dark:text-amber-300' : 'text-slate-400 dark:text-slate-500'
    }`;
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className={cls} />;
      case 'History':
        return <History className={cls} />;
      case 'Layers':
        return <Layers className={cls} />;
      case 'User':
        return <User className={cls} />;
      case 'Sliders':
        return <Sliders className={cls} />;
      default:
        return <Sparkles className={cls} />;
    }
  };

  const currentProfile = userSettings?.profile;

  return (
    <aside className="w-[220px] flex-shrink-0 h-full border-r border-purple-500/15 bg-white/70 dark:bg-slate-950/80 backdrop-blur-2xl flex flex-col justify-between select-none z-30 transition-colors duration-300">
      <div className="p-3.5 space-y-5 overflow-y-auto">
        {/* Brand Header */}
        <div className="px-2 pt-1 pb-2 flex items-center space-x-2.5 border-b border-purple-500/10">
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-sm">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          </div>
          <div>
            <div className="font-cinzel text-[14px] font-bold tracking-[3px] violet-foil-text">
              TAROTURN
            </div>
            <div className="text-[9px] font-mono tracking-wider text-slate-400 dark:text-slate-500">
              ZEN ARCANUM v1.2
            </div>
          </div>
        </div>

        {/* Workspace Navigation Tabs */}
        <div>
          <div className="px-2 mb-2 flex items-center justify-between text-[10px] font-bold font-editorial uppercase tracking-[1.5px] text-purple-400/90 dark:text-purple-300/80">
            <span>核心工作区</span>
            <span className="text-[9px] font-mono opacity-60">WORKSPACES</span>
          </div>

          <div className="space-y-1">
            {WORKSPACE_TABS.map((tab) => {
              const isSelected = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-editorial transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-purple-500/20 text-slate-900 dark:text-slate-100 font-bold border-l-2 border-amber-400 dark:border-amber-400 shadow-sm ring-1 ring-purple-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    {renderIcon(tab.iconName, isSelected)}
                    <span className="truncate">{tab.nameZh}</span>
                  </div>

                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar Footer: Active Profile & License Info */}
      <div className="p-3 border-t border-purple-500/15 bg-black/5 dark:bg-black/30 space-y-2.5">
        {/* Active Seeker Quick Pill */}
        {currentProfile && (
          <button
            onClick={() => onSelectTab('profiles')}
            className="w-full p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 transition-all text-left flex items-center space-x-2 group"
            title="点击切换求问者档案"
          >
            <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 flex-shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-editorial font-bold text-slate-200 truncate group-hover:text-amber-300 transition-colors">
                {currentProfile.name || currentProfile.nickname}
              </div>
              <div className="text-[9px] font-mono text-purple-400 truncate">
                灵魂牌 #{currentProfile.soulCardId} · 灵数 {currentProfile.lifePathNumber}
              </div>
            </div>
          </button>
        )}

        {/* Pro Switcher & System Telemetry */}
        <div className="flex items-center justify-between text-[10px] font-editorial pt-1">
          <button
            onClick={onTogglePro}
            className={`flex items-center space-x-1 px-2 py-1 rounded-full border transition-all ${
              isPro
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 font-bold'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crown className="w-3 h-3 text-amber-400" />
            <span>{isPro ? 'PRO 尊享' : '免费版'}</span>
          </button>

          <div className="flex items-center space-x-1 text-slate-500 font-mono text-[9px]">
            <ShieldCheck className="w-3 h-3 text-emerald-400/80" />
            <span>Core SSOT</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
