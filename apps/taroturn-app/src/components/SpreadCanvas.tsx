import React from 'react';
import { Spread, ReadingSession, Card, SpreadSlot, PlacedCard } from '../types/tarot';
import { Sparkles } from 'lucide-react';

export interface SpreadCanvasProps {
  spread: Spread;
  session: ReadingSession | null;
  cardsCatalog: Record<number, Card>;
  selectedSlotIndex: number | null;
  revealedSlots: Set<number>;
  onFlipCard: (slotIndex: number) => void;
  onSelectSlot: (idx: number) => void;
}

export const SpreadCanvas: React.FC<SpreadCanvasProps> = ({
  spread,
  session,
  cardsCatalog,
  selectedSlotIndex,
  revealedSlots,
  onFlipCard,
  onSelectSlot,
}) => {
  const isCelticCross = spread?.slots.length === 10;
  const isHolyTriangle = spread?.slots.length === 3 && spread.id === 'holy-triangle';
  const isTimeStream = spread?.slots.length === 3 && spread.id === 'time-stream';

  return (
    <main className="flex-1 w-full h-full relative flex items-center justify-center overflow-hidden select-none p-6 z-10">
      {session && spread ? (
        <div className="w-full h-full max-w-6xl max-h-[850px] relative flex items-center justify-center">
          {isCelticCross ? (
            /* Celtic Cross 10-Card Sacred Geometry Layout */
            <div className="w-full h-full relative flex items-center justify-center">
              {spread.slots.map((slot: SpreadSlot, idx: number) => {
                const placed = session.placed_cards.find((p: PlacedCard) => p.slot_id === slot.slot_id);
                const card = placed ? cardsCatalog[placed.drawn_card.card_id] : null;
                const isSelected = selectedSlotIndex === idx;
                const isFlipped = revealedSlots.has(idx);

                // Precise Celtic Cross layout coordinates with clear vertical rhythm
                const coords: Record<
                  number,
                  { top: string; left: string; rotate?: number; zIndex?: number }
                > = {
                  0: { top: '50%', left: '38%', rotate: 0, zIndex: 5 }, // 1. Central Core
                  1: { top: '50%', left: '38%', rotate: 90, zIndex: 15 }, // 2. Cross Obstacle (Rotated)
                  2: { top: '76%', left: '38%', rotate: 0, zIndex: 4 }, // 3. Subconscious Root
                  3: { top: '50%', left: '23%', rotate: 0, zIndex: 4 }, // 4. Past Foundation
                  4: { top: '24%', left: '38%', rotate: 0, zIndex: 4 }, // 5. Crown Goal
                  5: { top: '50%', left: '53%', rotate: 0, zIndex: 4 }, // 6. Near Future
                  6: { top: '78%', left: '76%', rotate: 0, zIndex: 4 }, // 7. Self Attitude
                  7: { top: '58%', left: '76%', rotate: 0, zIndex: 4 }, // 8. Environment
                  8: { top: '38%', left: '76%', rotate: 0, zIndex: 4 }, // 9. Hopes and Fears
                  9: { top: '18%', left: '76%', rotate: 0, zIndex: 4 }, // 10. Ultimate Outcome
                };

                const pos = coords[slot.slot_id] || { top: '50%', left: '50%' };

                return (
                  <div
                    key={slot.slot_id}
                    onClick={() => {
                      if (!isFlipped) onFlipCard(idx);
                      onSelectSlot(idx);
                    }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 flex flex-col items-center perspective-1000"
                    style={{
                      top: pos.top,
                      left: pos.left,
                      zIndex: isSelected ? 30 : pos.zIndex ?? 1,
                    }}
                  >
                    <div
                      className={`w-[80px] h-[134px] relative rounded-xl transition-all duration-500 card-tactile ${
                        isSelected
                          ? 'ring-2 ring-amethyst-400 shadow-amethyst-glow scale-105'
                          : 'shadow-card-float-light dark:shadow-card-float hover:scale-103'
                      }`}
                      style={{
                        transform: `rotate(${pos.rotate ?? 0}deg)`,
                      }}
                    >
                      {/* 3D Card Flipper */}
                      <div className={`w-full h-full relative card-container-3d ${isFlipped ? 'flipped' : ''}`}>
                        {/* Card Back Face */}
                        <div className="absolute inset-0 w-full h-full rounded-xl overflow-hidden card-face card-back-face border border-amethyst-500/30 bg-sanctuary-dark shadow-md">
                          <img
                            src="/cards/card_back.svg"
                            alt="Card Back"
                            className="w-full h-full object-cover rounded-xl"
                          />
                          <div className="absolute top-1 left-1 bg-white/90 dark:bg-black/75 text-purple-950 dark:text-amethyst-300 backdrop-blur-md px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border border-purple-200/80 dark:border-amethyst-500/30 shadow-sm">
                            {idx + 1}
                          </div>
                        </div>

                        {/* Card Front Face */}
                        <div className="absolute inset-0 w-full h-full rounded-xl overflow-hidden card-face card-front-face border border-purple-200/80 dark:border-amethyst-500/50 bg-white dark:bg-black shadow-md">
                          <img
                            src={`/cards/${card?.id ?? idx}.jpg`}
                            alt={card?.name_zh ?? ''}
                            className="w-full h-full object-cover rounded-xl transition-transform duration-300"
                            style={{
                              transform: placed?.drawn_card.orientation === 'Reversed' ? 'rotate(180deg)' : 'none',
                            }}
                            onError={(e) => { e.currentTarget.src = '/cards/card_back.svg'; }}
                          />
                          <div className="absolute top-1 left-1 bg-white/90 dark:bg-black/75 text-purple-950 dark:text-amethyst-300 backdrop-blur-md px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border border-purple-200/80 dark:border-amethyst-500/30 shadow-sm">
                            {idx + 1}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Celtic Cross Compact Card & Slot Label */}
                    <div className="mt-1 text-center flex flex-col items-center pointer-events-none max-w-[110px] select-none">
                      <span className="text-[10px] font-editorial font-medium text-slate-700 dark:text-slate-300 truncate w-full">
                        {slot.title_zh}
                      </span>
                      {isFlipped && card && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[11px] font-editorial font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                            {card.name_zh}
                          </span>
                          <span
                            className={`text-[8px] px-1 py-0.2 rounded font-editorial font-bold leading-tight ${
                              placed?.drawn_card.orientation === 'Upright'
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {placed?.drawn_card.orientation === 'Upright' ? '正位' : '逆位'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : isHolyTriangle ? (
            /* Holy Triangle Sacred Layout */
            <div className="w-full h-full relative flex items-center justify-center">
              {spread.slots.map((slot: SpreadSlot, idx: number) => {
                const placed = session.placed_cards.find((p: PlacedCard) => p.slot_id === slot.slot_id);
                const card = placed ? cardsCatalog[placed.drawn_card.card_id] : null;
                const isSelected = selectedSlotIndex === idx;
                const isFlipped = revealedSlots.has(idx);

                const coords: Record<number, { top: string; left: string }> = {
                  0: { top: '68%', left: '32%' },
                  1: { top: '68%', left: '68%' },
                  2: { top: '26%', left: '50%' },
                };
                const pos = coords[slot.slot_id] || { top: '50%', left: '50%' };

                return (
                  <div
                    key={slot.slot_id}
                    onClick={() => {
                      if (!isFlipped) onFlipCard(idx);
                      onSelectSlot(idx);
                    }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 flex flex-col items-center perspective-1000"
                    style={{ top: pos.top, left: pos.left, zIndex: isSelected ? 30 : 10 }}
                  >
                    <div
                      className={`w-[130px] h-[218px] relative rounded-2xl transition-all duration-500 card-tactile ${
                        isSelected
                          ? 'ring-2 ring-amethyst-400 shadow-amethyst-glow scale-105'
                          : 'shadow-card-float-light dark:shadow-card-float hover:scale-103'
                      }`}
                    >
                      <div className={`w-full h-full relative card-container-3d ${isFlipped ? 'flipped' : ''}`}>
                        {/* Back */}
                        <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden card-face card-back-face border border-amethyst-500/30 bg-sanctuary-dark shadow-md">
                          <img src="/cards/card_back.svg" alt="Card Back" className="w-full h-full object-cover rounded-2xl" />
                          <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/75 text-purple-950 dark:text-amethyst-300 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-purple-200/80 dark:border-amethyst-500/30 shadow-sm">
                            {idx + 1}
                          </div>
                        </div>

                        {/* Front */}
                        <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden card-face card-front-face border border-purple-200/80 dark:border-amethyst-500/50 bg-white dark:bg-black shadow-md">
                          <img
                            src={`/cards/${card?.id ?? idx}.jpg`}
                            alt={card?.name_zh ?? ''}
                            className="w-full h-full object-cover rounded-2xl transition-transform duration-300"
                            style={{
                              transform: placed?.drawn_card.orientation === 'Reversed' ? 'rotate(180deg)' : 'none',
                            }}
                            onError={(e) => { e.currentTarget.src = '/cards/card_back.svg'; }}
                          />
                          <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/75 text-purple-950 dark:text-amethyst-300 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-purple-200/80 dark:border-amethyst-500/30 shadow-sm">
                            {idx + 1}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-center flex flex-col items-center select-none">
                      <span className="text-[13px] font-editorial font-medium text-slate-700 dark:text-slate-300 block">
                        {slot.title_zh}
                      </span>
                      {isFlipped && card && (
                        <div className="flex items-center gap-1.5 mt-1 bg-slate-900/60 dark:bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-purple-500/30">
                          <span className="text-[13px] font-editorial font-bold text-slate-900 dark:text-slate-100">
                            {card.name_zh}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-full font-editorial font-bold ${
                              placed?.drawn_card.orientation === 'Upright'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            }`}
                          >
                            {placed?.drawn_card.orientation === 'Upright' ? '正位' : '逆位'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : isTimeStream ? (
            /* Time Stream (Past - Present - Future) */
            <div className="w-full h-full flex items-center justify-center gap-10 flex-wrap relative">
              {spread.slots.map((slot: SpreadSlot, idx: number) => {
                const placed = session.placed_cards.find((p: PlacedCard) => p.slot_id === slot.slot_id);
                const card = placed ? cardsCatalog[placed.drawn_card.card_id] : null;
                const isSelected = selectedSlotIndex === idx;
                const isFlipped = revealedSlots.has(idx);

                return (
                  <div
                    key={slot.slot_id}
                    onClick={() => {
                      if (!isFlipped) onFlipCard(idx);
                      onSelectSlot(idx);
                    }}
                    className="flex flex-col items-center cursor-pointer transition-all duration-300 perspective-1000"
                  >
                    <div
                      className={`w-[145px] h-[245px] relative rounded-2xl transition-all duration-500 card-tactile ${
                        isSelected
                          ? 'ring-2 ring-amethyst-400 shadow-amethyst-glow scale-105 z-20'
                          : 'shadow-card-float-light dark:shadow-card-float hover:scale-103 z-10'
                      }`}
                    >
                      <div className={`w-full h-full relative card-container-3d ${isFlipped ? 'flipped' : ''}`}>
                        {/* Back */}
                        <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden card-face card-back-face border border-amethyst-500/30 bg-sanctuary-dark shadow-md">
                          <img src="/cards/card_back.svg" alt="Card Back" className="w-full h-full object-cover rounded-2xl" />
                          <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/75 text-purple-950 dark:text-amethyst-300 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-purple-200/80 dark:border-amethyst-500/30 shadow-sm">
                            {idx + 1}
                          </div>
                        </div>

                        {/* Front */}
                        <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden card-face card-front-face border border-purple-200/80 dark:border-amethyst-500/50 bg-white dark:bg-black shadow-md">
                          <img
                            src={`/cards/${card?.id ?? idx}.jpg`}
                            alt={card?.name_zh ?? ''}
                            className="w-full h-full object-cover rounded-2xl shadow-inner transition-transform duration-300"
                            style={{
                              transform: placed?.drawn_card.orientation === 'Reversed' ? 'rotate(180deg)' : 'none',
                            }}
                            onError={(e) => { e.currentTarget.src = '/cards/card_back.svg'; }}
                          />
                          <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/75 text-purple-950 dark:text-amethyst-300 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-purple-200/80 dark:border-amethyst-500/30 shadow-sm">
                            {idx + 1}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-center flex flex-col items-center select-none">
                      <span className="text-[13px] font-editorial font-medium text-slate-700 dark:text-slate-300 block">
                        {slot.title_zh}
                      </span>
                      {isFlipped && card && (
                        <div className="flex items-center gap-1.5 mt-1 bg-slate-900/60 dark:bg-black/60 backdrop-blur-md px-3 py-0.5 rounded-full border border-purple-500/30">
                          <span className="text-[13px] font-editorial font-bold text-slate-900 dark:text-slate-100">
                            {card.name_zh}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-full font-editorial font-bold ${
                              placed?.drawn_card.orientation === 'Upright'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            }`}
                          >
                            {placed?.drawn_card.orientation === 'Upright' ? '正位' : '逆位'}
                          </span>
                        </div>
                      )}
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-editorial line-clamp-1 max-w-[140px] mt-0.5">
                        {slot.meaning_prompt}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Single Card Oracle */
            <div className="w-full h-full flex items-center justify-center relative">
              {spread.slots.map((slot: SpreadSlot, idx: number) => {
                const placed = session.placed_cards.find((p: PlacedCard) => p.slot_id === slot.slot_id);
                const card = placed ? cardsCatalog[placed.drawn_card.card_id] : null;
                const isSelected = selectedSlotIndex === idx;
                const isFlipped = revealedSlots.has(idx);

                return (
                  <div
                    key={slot.slot_id}
                    onClick={() => {
                      if (!isFlipped) onFlipCard(idx);
                      onSelectSlot(idx);
                    }}
                    className="flex flex-col items-center cursor-pointer transition-all duration-300 perspective-1000"
                  >
                    <div
                      className={`w-[170px] h-[285px] relative rounded-2xl transition-all duration-500 card-tactile ring-2 ring-amethyst-500/40 ${
                        isSelected
                          ? 'ring-2 ring-amethyst-400 shadow-amethyst-glow scale-105'
                          : 'shadow-card-float-light dark:shadow-card-float hover:scale-103'
                      }`}
                    >
                      <div className={`w-full h-full relative card-container-3d ${isFlipped ? 'flipped' : ''}`}>
                        {/* Back */}
                        <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden card-face card-back-face border border-amethyst-500/30 bg-sanctuary-dark shadow-md">
                          <img src="/cards/card_back.svg" alt="Card Back" className="w-full h-full object-cover rounded-2xl" />
                        </div>

                        {/* Front */}
                        <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden card-face card-front-face border border-purple-200/80 dark:border-amethyst-500/50 bg-white dark:bg-black shadow-md">
                          <img
                            src={`/cards/${card?.id ?? idx}.jpg`}
                            alt={card?.name_zh ?? ''}
                            className="w-full h-full object-cover rounded-2xl transition-transform duration-300"
                            style={{
                              transform: placed?.drawn_card.orientation === 'Reversed' ? 'rotate(180deg)' : 'none',
                            }}
                            onError={(e) => { e.currentTarget.src = '/cards/card_back.svg'; }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-center flex flex-col items-center select-none">
                      <span className="text-[14px] font-editorial font-medium text-slate-700 dark:text-slate-300 block">
                        {slot.title_zh}
                      </span>
                      {isFlipped && card && (
                        <div className="flex items-center gap-2 mt-1.5 bg-slate-900/60 dark:bg-black/60 backdrop-blur-md px-3.5 py-1 rounded-full border border-purple-500/30">
                          <span className="text-[15px] font-editorial font-bold text-slate-900 dark:text-slate-100">
                            {card.name_zh}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-editorial font-bold ${
                              placed?.drawn_card.orientation === 'Upright'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            }`}
                          >
                            {placed?.drawn_card.orientation === 'Upright' ? '正位' : '逆位'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Empty Sanctuary Altar State */
        <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-[480px] z-10">
          <div className="w-16 h-16 rounded-full border border-amethyst-500/40 flex items-center justify-center bg-amethyst-500/10 shadow-amethyst-subtle animate-pulse-slow">
            <Sparkles className="w-6 h-6 text-amethyst-500" />
          </div>
          <h2 className="text-xl font-editorial font-bold tracking-wider text-slate-800 dark:text-slate-100">
            静心凝神 · 开启圣所推演
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-editorial leading-relaxed max-w-[380px]">
            当前牌阵：{spread ? spread.name_zh : '时间之流 (过去-现在-未来)'}（{spread ? spread.slots.length : 3}张卡位）。请在底部输入心中的焦点，点击「开始密码学抽牌」完成洗切发牌仪式。
          </p>
        </div>
      )}
    </main>
  );
};
