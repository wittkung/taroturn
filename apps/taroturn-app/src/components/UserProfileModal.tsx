// src/components/UserProfileModal.tsx - Seeker Archetypal Sanctuary Profile
import React, { useState, useEffect } from 'react';
import {
  X,
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
} from 'lucide-react';
import { UserSettings, SeekerProfile } from '../types/settings';
import { UserSettingsService } from '../services/userSettingsService';
import { calculateSeekerProfile } from '../services/tarotCalculators';
import { JournalStorageService } from '../services/journalStorageService';
import { ReadingSession } from '../types/tarot';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
}) => {
  const [settings, setSettings] = useState<UserSettings>(UserSettingsService.getSettings());
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTitle, setNewTitle] = useState('自性化求问者');
  const [newBirthdate, setNewBirthdate] = useState('1998-08-08');

  useEffect(() => {
    if (isOpen) {
      setSettings(UserSettingsService.getSettings());
      setSessions(JournalStorageService.getSavedSessions());
      setShowQuickAdd(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-xl bg-slate-900/95 border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-950/40 to-slate-900 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-editorial font-bold text-slate-100 flex items-center gap-2">
                <span>{currentProfile.name || currentProfile.nickname} · 求问者神殿</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {currentProfile.title}
                </span>
              </h3>
              <p className="text-[11px] font-editorial text-slate-400">
                本命灵魂塔罗牌 · 生命灵数与多求问者心智图谱
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

        {/* Profile Switcher Ribbon */}
        <div className="px-6 py-2.5 bg-black/30 border-b border-purple-500/15 flex items-center space-x-2 overflow-x-auto no-scrollbar flex-shrink-0">
          <span className="text-[10px] font-editorial uppercase tracking-wider text-purple-400 font-bold flex-shrink-0">
            求问者切换:
          </span>
          <div className="flex items-center space-x-2 flex-1">
            {settings.profiles.map((p) => {
              const isSelected = p.id === settings.activeProfileId;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectProfile(p.id)}
                  className={`px-3 py-1 rounded-full text-xs font-editorial flex items-center space-x-1.5 transition-all flex-shrink-0 ${
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
              className="px-2.5 py-1 rounded-full bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 hover:text-purple-200 text-xs font-editorial flex items-center space-x-1 transition-all flex-shrink-0"
              title="快速新增求问者档案"
            >
              <UserPlus className="w-3 h-3" />
              <span>新增</span>
            </button>
          </div>
        </div>

        {/* Quick Add Form Drawer */}
        {showQuickAdd && (
          <form
            onSubmit={handleCreateProfile}
            className="p-4 bg-purple-950/40 border-b border-purple-500/30 animate-in slide-in-from-top-2 duration-200 flex-shrink-0 space-y-3"
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10px] font-editorial text-slate-300 block mb-1">
                  姓名 / 备注
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="例如: 林澈 (伴侣)"
                  className="w-full px-2.5 py-1.5 rounded-xl bg-black/50 border border-purple-500/30 text-xs font-editorial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-editorial text-slate-300 block mb-1">
                  身份称号
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例如: 星轨观测者"
                  className="w-full px-2.5 py-1.5 rounded-xl bg-black/50 border border-purple-500/30 text-xs font-editorial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-editorial text-slate-300 block mb-1">
                  公历出生日期
                </label>
                <input
                  type="date"
                  required
                  value={newBirthdate}
                  onChange={(e) => setNewBirthdate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-black/50 border border-purple-500/30 text-xs font-mono text-slate-100 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-editorial flex items-center space-x-1 transition-colors shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>保存并切换</span>
              </button>
            </div>
          </form>
        )}

        {/* Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {/* Soul Card Hero */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-950/40 via-purple-900/20 to-black border border-purple-500/30 flex items-center space-x-5 shadow-inner">
            <div className="w-24 h-38 rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-xl flex-shrink-0 bg-black">
              <img
                src={`/cards/${calc.soulCardId}.jpg`}
                alt={calc.soulCardNameZh}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  灵魂本命牌 #{calc.soulCardId}
                </span>
                <span className="text-[10px] font-mono text-purple-300">
                  灵数 {calc.lifePathNumber}
                </span>
              </div>

              <h3 className="text-xl font-editorial font-bold text-slate-100">
                {calc.soulCardNameZh}{' '}
                <span className="text-xs font-editorial text-slate-400 font-normal italic">
                  ({calc.soulCardNameEn})
                </span>
              </h3>

              <div className="text-xs font-editorial text-amber-300/90 font-medium">
                {calc.archetypeTitle}
              </div>

              <p className="text-[11px] font-editorial text-slate-300 italic leading-relaxed pt-1">
                “{calc.soulMotto}”
              </p>
            </div>
          </div>

          {/* Archetypal Badges */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[10px] font-editorial text-slate-400 block">生命灵数</span>
              <span className="text-base font-mono font-bold text-purple-300">
                {calc.lifePathNumber} 数
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[10px] font-editorial text-slate-400 block">黄道星座</span>
              <span className="text-xs font-editorial font-bold text-amber-300">
                {calc.dominantZodiac.split(' ')[0]}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[10px] font-editorial text-slate-400 block">主导元素</span>
              <span className="text-xs font-editorial font-bold text-emerald-300">
                {calc.dominantElement} 元素
              </span>
            </div>
          </div>

          {/* Core Strengths & Shadows */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
              <span className="text-xs font-bold font-editorial text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>灵魂本命优势禀赋:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {calc.coreStrengths.map((s, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-editorial px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-1.5">
              <span className="text-xs font-bold font-editorial text-rose-400 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>潜意识阴影盲区与转化课题:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {calc.shadowChallenges.map((s, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-editorial px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Historical Elemental Journey */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-editorial text-purple-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>历史推演心智能量沉淀 ({sessions.length} 次占卜)</span>
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-editorial">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-0.5">
                <div className="flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3" />
                  <span>火</span>
                </div>
                <span className="font-mono font-bold text-xs">{avgFire || 25}%</span>
              </div>

              <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 space-y-0.5">
                <div className="flex items-center justify-center gap-1">
                  <Droplet className="w-3 h-3" />
                  <span>水</span>
                </div>
                <span className="font-mono font-bold text-xs">{avgWater || 25}%</span>
              </div>

              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-0.5">
                <div className="flex items-center justify-center gap-1">
                  <Wind className="w-3 h-3" />
                  <span>风</span>
                </div>
                <span className="font-mono font-bold text-xs">{avgAir || 25}%</span>
              </div>

              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-0.5">
                <div className="flex items-center justify-center gap-1">
                  <Mountain className="w-3 h-3" />
                  <span>土</span>
                </div>
                <span className="font-mono font-bold text-xs">{avgEarth || 25}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-purple-500/15 bg-black/20 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="text-xs font-editorial text-purple-400 hover:text-purple-300 transition-colors flex items-center space-x-1"
          >
            <span>管理全部求问者档案库 →</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-editorial transition-colors shadow-sm"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
