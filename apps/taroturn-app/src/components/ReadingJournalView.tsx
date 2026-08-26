// src/components/ReadingJournalView.tsx - Fullscreen Archival Journal Workspace
import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Sparkles,
  Trash2,
  ExternalLink,
  Flame,
  Droplet,
  Wind,
  Mountain,
  History,
  RotateCcw,
} from 'lucide-react';
import { ReadingSession, Card, Spread } from '../types/tarot';
import { JournalStorageService } from '../services/journalStorageService';

export interface ReadingJournalViewProps {
  spreads: Spread[];
  cardsCatalog: Record<number, Card>;
  onLoadSession: (session: ReadingSession, spread: Spread) => void;
}

export const ReadingJournalView: React.FC<ReadingJournalViewProps> = ({
  spreads,
  cardsCatalog,
  onLoadSession,
}) => {
  const [sessions, setSessions] = useState<ReadingSession[]>([]);

  useEffect(() => {
    setSessions(JournalStorageService.getSavedSessions());
  }, []);

  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (confirm('确认删除此条推演记录？')) {
      JournalStorageService.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
    }
  };

  const handleSelect = (session: ReadingSession) => {
    const matchedSpread = spreads.find((s) => s.id === session.spread_id) || spreads[0];
    onLoadSession(session, matchedSpread);
  };

  const renderElementIcon = (elem: string) => {
    switch (elem) {
      case 'Fire':
        return <Flame className="w-3 h-3 text-rose-500" />;
      case 'Water':
        return <Droplet className="w-3 h-3 text-sky-400" />;
      case 'Air':
        return <Wind className="w-3 h-3 text-amber-400" />;
      case 'Earth':
        return <Mountain className="w-3 h-3 text-emerald-400" />;
      default:
        return null;
    }
  };

  // Compute elemental distribution across all sessions
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

  const count = sessions.length || 1;
  const avgFire = Math.round((totalFire / count) * 100);
  const avgWater = Math.round((totalWater / count) * 100);
  const avgAir = Math.round((totalAir / count) * 100);
  const avgEarth = Math.round((totalEarth / count) * 100);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-slate-900/40 border border-purple-500/20 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-sm flex-shrink-0">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-editorial font-bold text-slate-100 flex items-center gap-2">
              <span>圣所历史账本 · 占卜复盘中枢</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {sessions.length} 次推演
              </span>
            </h2>
            <p className="text-xs font-editorial text-slate-400 mt-0.5">
              长期记录每一次占卜焦点、卡牌阵列、四要素心智轨迹与 AI 导师复盘
            </p>
          </div>
        </div>

        {/* 4-Element Telemetry Pill Box */}
        <div className="grid grid-cols-4 gap-2 bg-black/40 p-2.5 rounded-2xl border border-purple-500/20">
          <div className="px-2 text-center text-[10px] font-editorial">
            <div className="flex items-center justify-center gap-0.5 text-rose-400 font-bold">
              <Flame className="w-3 h-3" />
              <span>火</span>
            </div>
            <span className="font-mono text-xs text-rose-300">{avgFire || 25}%</span>
          </div>
          <div className="px-2 text-center text-[10px] font-editorial border-l border-white/5">
            <div className="flex items-center justify-center gap-0.5 text-sky-400 font-bold">
              <Droplet className="w-3 h-3" />
              <span>水</span>
            </div>
            <span className="font-mono text-xs text-sky-300">{avgWater || 25}%</span>
          </div>
          <div className="px-2 text-center text-[10px] font-editorial border-l border-white/5">
            <div className="flex items-center justify-center gap-0.5 text-amber-400 font-bold">
              <Wind className="w-3 h-3" />
              <span>风</span>
            </div>
            <span className="font-mono text-xs text-amber-300">{avgAir || 25}%</span>
          </div>
          <div className="px-2 text-center text-[10px] font-editorial border-l border-white/5">
            <div className="flex items-center justify-center gap-0.5 text-emerald-400 font-bold">
              <Mountain className="w-3 h-3" />
              <span>土</span>
            </div>
            <span className="font-mono text-xs text-emerald-300">{avgEarth || 25}%</span>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {sessions.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-white/[0.02] border border-white/5 rounded-3xl">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto stroke-1" />
          <p className="text-sm font-editorial text-slate-400">
            暂无历史推演记录，请在「圣所推演」中开启您的第一场占卜仪式
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => {
            const spread = spreads.find((s) => s.id === session.spread_id);
            const dateStr = new Date(session.timestamp).toLocaleString('zh-CN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={session.session_id}
                onClick={() => handleSelect(session)}
                className="group p-5 rounded-3xl bg-black/25 hover:bg-purple-950/20 border border-white/5 hover:border-purple-500/40 backdrop-blur-xl transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-xl hover:scale-[1.01]"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-editorial font-bold text-amber-300 group-hover:text-amber-200">
                        {spread?.name_zh || session.spread_id}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {dateStr}
                      </span>
                    </div>

                    <h4 className="text-sm font-editorial font-bold text-slate-100 line-clamp-1">
                      {session.question ? `“${session.question}”` : '自由冥想探索'}
                    </h4>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, session.session_id)}
                    className="w-7 h-7 rounded-full bg-white/5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 flex items-center justify-center transition-colors flex-shrink-0"
                    title="删除记录"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Placed Cards Strip */}
                <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
                  {session.placed_cards.map((pc, idx) => {
                    const card = cardsCatalog[pc.card_id];
                    return (
                      <div
                        key={idx}
                        className="flex-shrink-0 w-12 h-18 rounded-xl overflow-hidden border border-purple-500/30 bg-black shadow-md relative group-hover:border-amber-400/50 transition-colors"
                        title={`${card?.name_zh || pc.card_id} (${pc.is_reversed ? '逆位' : '正位'})`}
                      >
                        <img
                          src={`/cards/${pc.card_id}.jpg`}
                          alt={card?.name_zh}
                          className={`w-full h-full object-cover ${pc.is_reversed ? 'rotate-180' : ''}`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Footer Action */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-editorial">
                  <span className="text-[10px] font-mono text-slate-500">
                    Seed: {session.rng_seed ? session.rng_seed.slice(0, 10) + '...' : 'ChaCha20'}
                  </span>

                  <div className="flex items-center space-x-1 text-purple-400 group-hover:text-amber-300 font-bold transition-colors">
                    <RotateCcw className="w-3 h-3" />
                    <span>重放推演 →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
