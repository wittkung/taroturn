// src/components/ReadingJournalModal.tsx - History & Reading Journal Sanctuary Ledger
import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  X,
  Calendar,
  Sparkles,
  Trash2,
  ExternalLink,
  Flame,
  Droplet,
  Wind,
  Mountain,
} from 'lucide-react';
import { ReadingSession, Card, Spread } from '../types/tarot';
import { JournalStorageService } from '../services/journalStorageService';

interface ReadingJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  spreads: Spread[];
  cardsCatalog: Record<number, Card>;
  onLoadSession: (session: ReadingSession, spread: Spread) => void;
}

export const ReadingJournalModal: React.FC<ReadingJournalModalProps> = ({
  isOpen,
  onClose,
  spreads,
  cardsCatalog,
  onLoadSession,
}) => {
  const [sessions, setSessions] = useState<ReadingSession[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSessions(JournalStorageService.getSavedSessions());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    JournalStorageService.deleteSession(sessionId);
    setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
  };

  const handleSelect = (session: ReadingSession) => {
    const matchedSpread = spreads.find((s) => s.id === session.spread_id) || spreads[0];
    onLoadSession(session, matchedSpread);
    onClose();
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-2xl bg-slate-900/95 border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-950/50 to-slate-900 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-editorial font-bold text-slate-100 flex items-center gap-2">
                <span>圣所历史账本 · 占卜复盘</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {sessions.length} 条记录
                </span>
              </h3>
              <p className="text-[11px] font-editorial text-slate-400">
                记录每一次推演焦点、卡牌阵列与 AI 心理学洞察
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
        <div className="flex-1 p-6 overflow-y-auto space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-16 space-y-3 text-slate-400">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="text-sm font-editorial font-medium text-slate-300">
                暂无历史推演记录
              </p>
              <p className="text-xs font-editorial text-slate-500 max-w-sm mx-auto">
                每一次完成密码学洗牌与 AI 深度推演后，系统均会自动在此建立不可篡改的复盘档案。
              </p>
            </div>
          ) : (
            sessions.map((sess) => {
              const matchedSpread = spreads.find((s) => s.id === sess.spread_id);
              const dateStr = new Date(sess.created_at).toLocaleString('zh-CN', {
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={sess.session_id}
                  onClick={() => handleSelect(sess)}
                  className="p-4 rounded-2xl bg-white/[0.02] hover:bg-purple-500/[0.08] border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer group space-y-3"
                >
                  {/* Item Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-editorial font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          {matchedSpread ? matchedSpread.name_zh : '自选牌阵'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {dateStr}
                        </span>
                        {sess.dignity_summary?.dominant_element && (
                          <span className="text-[10px] font-editorial text-slate-400 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
                            {renderElementIcon(sess.dignity_summary.dominant_element)}
                            <span>主导：{sess.dignity_summary.dominant_element}</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-editorial font-bold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                        {sess.question || '整体运势与自性观照'}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={(e) => handleDelete(e, sess.session_id)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                        title="删除记录"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Drawn Cards Mini Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/5">
                    {sess.placed_cards.map((p, idx) => {
                      const c = cardsCatalog[p.drawn_card.card_id];
                      return (
                        <span
                          key={idx}
                          className="text-[10px] font-editorial px-2 py-0.5 rounded-md bg-black/40 border border-purple-500/20 text-slate-300 flex items-center gap-1"
                        >
                          <span className="text-amber-400 font-mono text-[9px]">#{idx + 1}</span>
                          <span>{c ? c.name_zh : `卡牌 #${p.drawn_card.card_id}`}</span>
                          <span
                            className={`text-[8px] px-1 rounded ${
                              p.drawn_card.orientation === 'Upright'
                                ? 'text-emerald-400 bg-emerald-500/10'
                                : 'text-rose-400 bg-rose-500/10'
                            }`}
                          >
                            {p.drawn_card.orientation === 'Upright' ? '正' : '逆'}
                          </span>
                        </span>
                      );
                    })}
                  </div>

                  {/* Footer hint */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-editorial pt-1">
                    <span className="flex items-center gap-1 text-purple-400 group-hover:text-purple-300">
                      <ExternalLink className="w-3 h-3" />
                      点击载入画布全景复盘与 AI 解构
                    </span>
                    {sess.ai_interpretation && (
                      <span className="flex items-center gap-1 text-amber-400/80">
                        <Sparkles className="w-2.5 h-2.5" />
                        已含 AI 报告
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
