// src/components/SpreadCanvas.tsx - Universal Topological Spread Matrix Canvas
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
  const cardCount = spread?.slots?.length || 0;

  // Determine card dimension based on card density
  const getCardSize = () => {
    if (cardCount >= 10) return { w: 84, h: 142, labelMaxW: 100, textSize: 'text-[10px]', badgeSize: 'text-[8px]' };
    if (cardCount >= 7) return { w: 96, h: 162, labelMaxW: 110, textSize: 'text-[11px]', badgeSize: 'text-[8px]' };
    if (cardCount >= 4) return { w: 115, h: 194, labelMaxW: 130, textSize: 'text-[12px]', badgeSize: 'text-[9px]' };
    if (cardCount === 3) return { w: 140, h: 236, labelMaxW: 150, textSize: 'text-[13px]', badgeSize: 'text-[9px]' };
    return { w: 170, h: 285, labelMaxW: 180, textSize: 'text-[14px]', badgeSize: 'text-[10px]' };
  };

  const cardDim = getCardSize();

  // Compute layout coordinates for each slot
  const getSlotPosition = (slot: SpreadSlot) => {
    const isCelticCross = spread.id === 'celtic-cross' || cardCount === 10;
    const isTimeStream = spread.id === 'time-stream' || (cardCount === 3 && spread.id.includes('time'));
    const isHolyTriangle = spread.id === 'holy-triangle' || (cardCount === 3 && spread.id.includes('triangle'));

    if (isCelticCross) {
      const celticCoords: Record<number, { top: string; left: string; rotate?: number; zIndex?: number }> = {
        0: { top: '50%', left: '35%', rotate: 0, zIndex: 5 }, // 1. Center
        1: { top: '50%', left: '35%', rotate: 90, zIndex: 15 }, // 2. Cross Obstacle
        2: { top: '78%', left: '35%', rotate: 0, zIndex: 4 }, // 3. Subconscious Root
        3: { top: '50%', left: '18%', rotate: 0, zIndex: 4 }, // 4. Past
        4: { top: '22%', left: '35%', rotate: 0, zIndex: 4 }, // 5. Crown
        5: { top: '50%', left: '52%', rotate: 0, zIndex: 4 }, // 6. Near Future
        6: { top: '80%', left: '76%', rotate: 0, zIndex: 4 }, // 7. Self
        7: { top: '60%', left: '76%', rotate: 0, zIndex: 4 }, // 8. Environment
        8: { top: '40%', left: '76%', rotate: 0, zIndex: 4 }, // 9. Hopes/Fears
        9: { top: '20%', left: '76%', rotate: 0, zIndex: 4 }, // 10. Outcome
      };
      return celticCoords[slot.slot_id] || { top: '50%', left: '50%' };
    }

    if (isTimeStream) {
      const streamCoords: Record<number, { top: string; left: string; rotate?: number; zIndex?: number }> = {
        0: { top: '50%', left: '22%', rotate: 0, zIndex: 1 },
        1: { top: '50%', left: '50%', rotate: 0, zIndex: 1 },
        2: { top: '50%', left: '78%', rotate: 0, zIndex: 1 },
      };
      return streamCoords[slot.slot_id] || { top: '50%', left: '50%', rotate: 0, zIndex: 1 };
    }

    if (isHolyTriangle) {
      const triCoords: Record<number, { top: string; left: string; rotate?: number; zIndex?: number }> = {
        0: { top: '68%', left: '30%', rotate: 0, zIndex: 1 },
        1: { top: '68%', left: '70%', rotate: 0, zIndex: 1 },
        2: { top: '26%', left: '50%', rotate: 0, zIndex: 1 },
      };
      return triCoords[slot.slot_id] || { top: '50%', left: '50%', rotate: 0, zIndex: 1 };
    }

    // Default Universal Normalized Mathematical Projection (slot.x in [-1, 1], slot.y in [-1, 1])
    const xRatio = typeof slot.x === 'number' ? slot.x : 0;
    const yRatio = typeof slot.y === 'number' ? slot.y : 0;
    const leftPct = 50 + xRatio * 38;
    const topPct = 50 + yRatio * 36;
    const rot = slot.rotation_deg || 0;

    return {
      top: `${topPct}%`,
      left: `${leftPct}%`,
      rotate: rot,
      zIndex: slot.z_index || 1,
    };
  };

  return (
    <main className="flex-1 w-full h-full relative flex items-center justify-center overflow-hidden select-none p-4 md:p-6 z-10 min-h-[560px]">
      {session && spread ? (
        <div className="w-full h-full max-w-6xl max-h-[820px] relative flex items-center justify-center">
          {/* Render Spread Cards Matrix */}
          <div className="w-full h-full relative flex items-center justify-center">
            {spread.slots.map((slot: SpreadSlot, idx: number) => {
              const placed = session.placed_cards.find((p: PlacedCard) => p.slot_id === slot.slot_id);
              const card = placed ? cardsCatalog[placed.drawn_card.card_id] : null;
              const isSelected = selectedSlotIndex === idx;
              const isFlipped = revealedSlots.has(idx);
              const pos = getSlotPosition(slot);

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
                    zIndex: isSelected ? 35 : (pos.zIndex ?? 1) + 2,
                  }}
                >
                  {/* 3D Card Shell */}
                  <div
                    className={`relative rounded-2xl transition-all duration-500 card-tactile ${
                      isSelected
                        ? 'ring-2 ring-amber-400 shadow-amber-glow scale-105'
                        : 'shadow-card-float-light dark:shadow-card-float hover:scale-103'
                    }`}
                    style={{
                      width: `${cardDim.w}px`,
                      height: `${cardDim.h}px`,
                      transform: `rotate(${pos.rotate ?? 0}deg)`,
                    }}
                  >
                    <div className={`w-full h-full relative card-container-3d ${isFlipped ? 'flipped' : ''}`}>
                      {/* Card Back Face */}
                      <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden card-face card-back-face border border-amber-500/30 bg-sanctuary-dark shadow-md">
                        <img
                          src="/cards/card_back.svg"
                          alt="Card Back"
                          className="w-full h-full object-cover rounded-2xl"
                        />
                        <div className="absolute top-1.5 left-1.5 bg-black/80 text-amber-300 backdrop-blur-md px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border border-amber-500/30 shadow-sm">
                          {idx + 1}
                        </div>
                      </div>

                      {/* Card Front Face */}
                      <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden card-face card-front-face border border-amber-500/40 bg-black shadow-md">
                        <img
                          src={`/cards/${card?.id ?? idx}.jpg`}
                          alt={card?.name_zh ?? ''}
                          className="w-full h-full object-cover rounded-2xl transition-transform duration-300"
                          style={{
                            transform: placed?.drawn_card.orientation === 'Reversed' ? 'rotate(180deg)' : 'none',
                          }}
                          onError={(e) => {
                            e.currentTarget.src = '/cards/card_back.svg';
                          }}
                        />
                        <div className="absolute top-1.5 left-1.5 bg-black/80 text-amber-300 backdrop-blur-md px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border border-amber-500/30 shadow-sm">
                          {idx + 1}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Title & Orientation Label Underneath */}
                  <div
                    className="mt-2 text-center flex flex-col items-center pointer-events-none select-none transition-all"
                    style={{ maxWidth: `${cardDim.labelMaxW}px` }}
                  >
                    <span className={`${cardDim.textSize} font-editorial font-medium text-slate-700 dark:text-slate-300 truncate w-full`}>
                      {slot.title_zh}
                    </span>
                    {isFlipped && card && (
                      <div className="flex items-center gap-1 mt-0.5 bg-slate-950/80 dark:bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-amber-500/30 shadow-sm">
                        <span className={`${cardDim.textSize} font-editorial font-bold text-slate-100 whitespace-nowrap`}>
                          {card.name_zh}
                        </span>
                        <span
                          className={`${cardDim.badgeSize} px-1.5 py-0.2 rounded font-editorial font-bold leading-tight ${
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
        </div>
      ) : (
        /* Empty Sanctuary Altar State */
        <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-[480px] z-10">
          <div className="w-16 h-16 rounded-full border border-amber-500/40 flex items-center justify-center bg-amber-500/10 shadow-amber-subtle animate-pulse-slow">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="text-xl font-editorial font-bold tracking-wider text-slate-800 dark:text-slate-100">
            静心凝神 · 开启圣所推演
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-editorial leading-relaxed max-w-[380px]">
            当前牌阵：{spread ? spread.name_zh : '时间之流 (过去-现在-未来)'}（{spread ? spread.slots.length : 3}张卡位）。请点击下方「开始密码学抽牌」确立焦点议题并完成发牌仪式。
          </p>
        </div>
      )}
    </main>
  );
};
