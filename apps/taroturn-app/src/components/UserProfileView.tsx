// src/components/UserProfileView.tsx - Fullscreen Seeker Archetypal Sanctuary & Multi-Profile Workspace
import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  User,
  Flame,
  Droplet,
  Wind,
  Mountain,
  Award,
  BookOpen,
  Plus,
  Check,
  UserPlus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { UserSettings, SeekerProfile } from '../types/settings';
import { UserSettingsService } from '../services/userSettingsService';
import { calculateSeekerProfile } from '../services/tarotCalculators';
import { JournalStorageService } from '../services/journalStorageService';
import { ReadingSession } from '../types/tarot';

export interface UserProfileViewProps {
  onOpenSettingsTab?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ onOpenSettingsTab }) => {
  const [settings, setSettings] = useState<UserSettings>(UserSettingsService.getSettings());
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTitle, setNewTitle] = useState('自性化求问者');
  const [newBirthdate, setNewBirthdate] = useState('1998-08-08');

  useEffect(() => {
    setSettings(UserSettingsService.getSettings());
    setSessions(JournalStorageService.getSavedSessions());
  }, []);

  const currentProfile: SeekerProfile = settings.profile;
  const calc = calculateSeekerProfile(currentProfile.birthdate);

  const handleSelectProfile = (profileId: string) => {
    UserSettingsService.setActiveProfile(profileId);
    setSettings(UserSettingsService.getSettings());
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newBirthdate) return;

    UserSettingsService.createProfile({
      name: newName.trim(),
      title: newTitle.trim() || '自性化求问者',
      birthdate: newBirthdate,
    });
    setSettings(UserSettingsService.getSettings());
    setShowQuickAdd(false);
    setNewName('');
  };

  // Compute element stats from past readings
  let totalFire = 0;
  let totalWater = 0;
  let totalAir = 0;
  let totalEarth = 0;

  sessions.forEach((s) => {
    if (s.dignity_summary) {
      totalFire += s.dignity_summary.fire_ratio || 0;
      totalWater += s.dignity_summary.water_ratio || 0;
      totalAir += s.dignity_summary.air_ratio || 0;
      totalEarth += s.dignity_summary.earth_ratio || 0;
    }
  });

  const sessionCount = sessions.length || 1;
  const avgFire = Math.round((totalFire / sessionCount) * 100);
  const avgWater = Math.round((totalWater / sessionCount) * 100);
  const avgAir = Math.round((totalAir / sessionCount) * 100);
  const avgEarth = Math.round((totalEarth / sessionCount) * 100);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-slate-900/40 border border-purple-500/20 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-sm flex-shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-editorial font-bold text-slate-100 flex items-center gap-2">
              <span>{currentProfile.name || currentProfile.nickname} · 求问者神殿</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {currentProfile.title}
              </span>
            </h2>
            <p className="text-xs font-editorial text-slate-400 mt-0.5">
              多求问者本命灵魂塔罗牌 · 生命灵数与长期心智轨迹图谱
            </p>
          </div>
        </div>

        {/* Profile Switcher Pill List */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
          {settings.profiles.map((p) => {
            const isSelected = p.id === settings.activeProfileId;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectProfile(p.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-editorial flex items-center space-x-1.5 transition-all flex-shrink-0 ${
                  isSelected
                    ? 'bg-purple-600 text-white font-bold shadow-md ring-1 ring-purple-400'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <span className="truncate max-w-[100px]">{p.name || p.nickname}</span>
                <span
                  className={`text-[9px] font-mono px-1 rounded ${
                    isSelected ? 'bg-purple-800 text-purple-200' : 'bg-black/30 text-slate-400'
                  }`}
                >
                  #{p.soulCardId}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="px-3 py-1.5 rounded-full bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 hover:text-purple-200 text-xs font-editorial flex items-center space-x-1 transition-all flex-shrink-0"
            title="新建求问者档案"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>新建档案</span>
          </button>
        </div>
      </div>

      {/* Quick Add Form Drawer */}
      {showQuickAdd && (
        <form
          onSubmit={handleCreateProfile}
          className="p-5 bg-purple-950/40 border border-purple-500/30 rounded-3xl animate-in slide-in-from-top-2 duration-200 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-editorial text-purple-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>新建求问者本命档案</span>
            </span>
            <button
              type="button"
              onClick={() => setShowQuickAdd(false)}
              className="text-[11px] font-editorial text-slate-400 hover:text-slate-200"
            >
              取消
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-editorial text-slate-300 block mb-1">
                姓名 / 备注
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="例如: 林澈 (伴侣)"
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-xs font-editorial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-editorial text-slate-300 block mb-1">
                身份称号
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="例如: 星轨观测者"
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-xs font-editorial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-editorial text-slate-300 block mb-1">
                公历出生日期
              </label>
              <input
                type="date"
                required
                value={newBirthdate}
                onChange={(e) => setNewBirthdate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-xs font-mono text-slate-100 focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-editorial flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>保存并切换</span>
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: Soul Card Hero + Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Big Soul Card Showcase */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-gradient-to-b from-purple-950/50 via-purple-900/20 to-black/60 border border-purple-500/30 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center space-y-4">
          <div className="w-44 h-72 rounded-3xl overflow-hidden border-2 border-amber-400/50 shadow-2xl bg-black flex-shrink-0">
            <img
              src={`/cards/${calc.soulCardId}.jpg`}
              alt={calc.soulCardNameZh}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                灵魂本命牌 #{calc.soulCardId}
              </span>
              <span className="text-[11px] font-mono text-purple-300">
                灵数 {calc.lifePathNumber}
              </span>
            </div>

            <h3 className="text-2xl font-editorial font-bold text-slate-100">
              {calc.soulCardNameZh}
            </h3>
            <p className="text-xs font-editorial text-slate-400 italic">
              ({calc.soulCardNameEn})
            </p>
            <div className="text-xs font-editorial text-amber-300/90 font-medium pt-1">
              {calc.archetypeTitle}
            </div>
            <p className="text-xs font-editorial text-slate-300 italic leading-relaxed pt-2">
              “{calc.soulMotto}”
            </p>
          </div>
        </div>

        {/* Right: Archetypal Insights & Elemental Journey */}
        <div className="lg:col-span-2 space-y-5">
          {/* Numerology Badges */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-xs font-editorial text-slate-400 block">生命灵数</span>
              <span className="text-xl font-mono font-bold text-purple-300">
                {calc.lifePathNumber} 数
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-xs font-editorial text-slate-400 block">黄道星座</span>
              <span className="text-sm font-editorial font-bold text-amber-300">
                {calc.dominantZodiac.split(' ')[0]}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-xs font-editorial text-slate-400 block">主导元素</span>
              <span className="text-sm font-editorial font-bold text-emerald-300">
                {calc.dominantElement} 元素
              </span>
            </div>
          </div>

          {/* Core Strengths & Shadows */}
          <div className="space-y-3.5">
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
              <span className="text-xs font-bold font-editorial text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>灵魂本命优势与心智潜能:</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {calc.coreStrengths.map((s, i) => (
                  <span
                    key={i}
                    className="text-xs font-editorial px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
              <span className="text-xs font-bold font-editorial text-rose-400 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>潜意识阴影盲区与转化功课:</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {calc.shadowChallenges.map((s, i) => (
                  <span
                    key={i}
                    className="text-xs font-editorial px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Historical Elemental Journey */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3.5">
            <span className="text-xs font-bold font-editorial text-purple-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>历史推演心智能量沉淀 ({sessions.length} 次占卜)</span>
            </span>

            <div className="grid grid-cols-4 gap-3 text-center text-xs font-editorial">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>火</span>
                </div>
                <span className="font-mono font-bold text-sm">{avgFire || 25}%</span>
              </div>

              <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-300 space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Droplet className="w-3.5 h-3.5" />
                  <span>水</span>
                </div>
                <span className="font-mono font-bold text-sm">{avgWater || 25}%</span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Wind className="w-3.5 h-3.5" />
                  <span>风</span>
                </div>
                <span className="font-mono font-bold text-sm">{avgAir || 25}%</span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Mountain className="w-3.5 h-3.5" />
                  <span>土</span>
                </div>
                <span className="font-mono font-bold text-sm">{avgEarth || 25}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
