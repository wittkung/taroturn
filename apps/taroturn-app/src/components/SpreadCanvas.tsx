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

  // Determine card dimension and canvas size based on card count to ensure zero visual collision
  const getLayoutConfiguration = () => {
    if (cardCount >= 10) {
      return {
        w: 66,
        h: 112,
        labelMaxW: 84,
        textSize: 'text-[9px]',
        badgeSize: 'text-[7px]',
        canvasHeight: 'h-[680px]',
      };
    }
    if (cardCount >= 7) {
      return {
        w: 72,
        h: 122,
        labelMaxW: 90,
        textSize: 'text-[9px]',
        badgeSize: 'text-[7px]',
        canvasHeight: 'h-[660px]',
      };
    }
    if (cardCount >= 5) {
      return {
        w: 86,
        h: 146,
        labelMaxW: 104,
        textSize: 'text-[10px]',
        badgeSize: 'text-[8px]',
        canvasHeight: 'h-[620px]',
      };
    }
    if (cardCount === 4) {
      return {
        w: 96,
        h: 162,
        labelMaxW: 112,
        textSize: 'text-[11px]',
        badgeSize: 'text-[8px]',
        canvasHeight: 'h-[580px]',
      };
    }
    if (cardCount === 3) {
      return {
        w: 116,
        h: 196,
        labelMaxW: 132,
        textSize: 'text-[12px]',
        badgeSize: 'text-[9px]',
        canvasHeight: 'h-[540px]',
      };
    }
    return {
      w: 148,
      h: 250,
      labelMaxW: 160,
      textSize: 'text-[13px]',
      badgeSize: 'text-[10px]',
      canvasHeight: 'h-[500px]',
    };
  };

  const layout = getLayoutConfiguration();

  // Precise geometric layout positioning engine for all canonical spreads
  const getSlotPosition = (slot: SpreadSlot) => {
    const isCeltic = spread.id === 'celtic_cross' || spread.id === 'celtic-cross' || cardCount === 10;
    const isHexagram = spread.id === 'hexagram_7' || (cardCount === 7 && (spread.id.includes('hexagram') || spread.id.includes('david')));
    const isHorseshoe = spread.id === 'horseshoe_7' || (cardCount === 7 && spread.id.includes('horseshoe'));
    const isTwoChoices = spread.id === 'two_choices' || cardCount === 5;
    const isFourElements = spread.id === 'four_elements' || cardCount === 4;
    const isHolyTriangle = spread.id === 'holy_triangle' || spread.id === 'holy-triangle';
    const isTimeStream = spread.id === 'three_cards_time' || spread.id === 'time-stream' || cardCount === 3;
    const isSingle = cardCount === 1;

    // 1. Classical Celtic Cross (10 Cards)
    if (isCeltic) {
      const celticCoords: Record<number, { top: string; left: string; rotate?: number; zIndex?: number }> = {
        0: { top: '50%', left: '33%', rotate: 0, zIndex: 10 }, // 1. Present Heart
        1: { top: '50%', left: '33%', rotate: 90, zIndex: 25 }, // 2. Cross Obstacle (90deg)
        2: { top: '86%', left: '33%', rotate: 0, zIndex: 5 }, // 3. Root / Subconscious
        3: { top: '50%', left: '14%', rotate: 0, zIndex: 5 }, // 4. Past Influence
        4: { top: '14%', left: '33%', rotate: 0, zIndex: 5 }, // 5. Crown / Goal
        5: { top: '50%', left: '52%', rotate: 0, zIndex: 5 }, // 6. Near Future
        6: { top: '86%', left: '82%', rotate: 0, zIndex: 5 }, // 7. Self Attitude
        7: { top: '62%', left: '82%', rotate: 0, zIndex: 5 }, // 8. Environment
        8: { top: '38%', left: '82%', rotate: 0, zIndex: 5 }, // 9. Hopes & Fears
        9: { top: '14%', left: '82%', rotate: 0, zIndex: 5 }, // 10. Outcome
      };
      return celticCoords[slot.slot_id] || { top: `${slot.y * 100}%`, left: `${slot.x * 100}%`, rotate: slot.rotation_deg || 0, zIndex: slot.z_index || 1 };
    }

    // 2. Star of David / Hexagram (7 Cards: Interlaced Upward & Downward Triangles + Center)
    if (isHexagram) {
      const hexCoords: Record<number, { top: string; left: string; rotate?: number; zIndex?: number }> = {
        0: { top: '12%', left: '50%', rotate: 0, zIndex: 2 }, // 1. Past (Upward Apex)
        1: { top: '74%', left: '80%', rotate: 0, zIndex: 2 }, // 2. Present (Upward Right)
        2: { top: '74%', left: '20%', rotate: 0, zIndex: 2 }, // 3. Future (Upward Left)
        3: { top: '88%', left: '50%', rotate: 0, zIndex: 2 }, // 4. Solution (Downward Bottom Apex)
        4: { top: '26%', left: '20%', rotate: 0, zIndex: 2 }, // 5. Surroundings (Downward Top-Left)
        5: { top: '26%', left: '80%', rotate: 0, zIndex: 2 }, // 6. Hopes & Fears (Downward Top-Right)
        6: { top: '50%', left: '50%', rotate: 0, zIndex: 15 }, // 7. Outcome Synthesis (Center)
      };
      return hexCoords[slot.slot_id] || { top: `${slot.y * 100}%`, left: `${slot.x * 100}%`, rotate: 0, zIndex: 1 };
    }

    // 3. Horseshoe Arch (7 Cards Parabolic Arch)
    if (isHorseshoe) {
      const horseCoords: Record<number, { top: string; left: string; rotate?: number; zIndex?: number }> = {
        0: { top: '76%', left: '16%', rotate: 0, zIndex: 2 }, // 1. Past
        1: { top: '46%', left: '24%', rotate: 0, zIndex: 2 }, // 2. Present
        2: { top: '22%', left: '36%', rotate: 0, zIndex: 2 }, // 3. Hidden Influences
        3: { top: '12%', left: '50%', rotate: 0, zIndex: 2 }, // 4. Obstacles
        4: { top: '22%', left: '64%', rotate: 0, zIndex: 2 }, // 5. External Environment
        5: { top: '46%', left: '76%', rotate: 0, zIndex: 2 }, // 6. Inner Hopes
        6: { top: '76%', left: '84%', rotate: 0, zIndex: 2 }, // 7. Final Outcome
      };
      return horseCoords[slot.slot_id] || { top: `${slot.y * 100}%`, left: `${slot.x * 100}%`, rotate: 0, zIndex: 1 };
    }

    // 4. Two Choices Crossroads (5 Cards)
    if (isTwoChoices) {
      const choiceCoords: Record<number, { top: string; left: string; rotate?: number; zIndex?: number }> = {
        0: { top: '82%', left: '50%', rotate: 0, zIndex: 2 }, // Current Nexus
        1: { top: '50%', left: '26%', rotate: 0, zIndex: 2 }, // Choice A Process
        2: { top: '16%', left: '26%', rotate: 0, zIndex: 2 }, // Choice A Harvest
        3: { top: '50%', left: '74%', rotate: 0, zIndex: 2 }, // Choice B Process
        4: { top: '16%', left: '74%', rotate: 0, zIndex: 2 }, // Choice B Harvest
      };
      return choiceCoords[slot.slot_id] || { top: `${slot.y * 100}%`, left: `${slot.x * 100}%`, rotate: 0, zIndex: 1 };
    }

    // 5. Four Elements Diamond (4 Cards)
    if (isFourElements) {
      const elemCoords: Record<number, { top: string; left: string; rotate?: number; zIndex?: number }> = {
        0: { top: '16%', left: '50%', rotate: 0, zIndex: 2 }, // Fire (Top)
        1: { top: '50%', left: '80%', rotate: 0, zIndex: 2 }, // Water (Right)
        2: { top: '50%', left: '20%', rotate: 0, zIndex: 2 }, // Air (Left)
        3: { top: '84%', left: '50%', rotate: 0, zIndex: 2 }, // Earth (Bottom)
      };
      return elemCoords[slot.slot_id] || { top: `${slot.y * 100}%`, left: `${slot.x * 100}%`, rotate: 0, zIndex: 1 };
    }

    // 6. Holy Triangle (3 Cards)
    if (isHolyTriangle) {
      const triCoords: Record<number, { top: string; left: string; rotate?: number; zIndex?: number }> = {
        0: { top: '74%', left: '26%', rotate: 0, zIndex: 2 }, // Situation (Left)
        1: { top: '74%', left: '74%', rotate: 0, zIndex: 2 }, // Obstacle (Right)
        2: { top: '22%', left: '50%', rotate: 0, zIndex: 2 }, // Advice (Apex)
      };
      return triCoords[slot.slot_id] || { top: `${slot.y * 100}%`, left: `${slot.x * 100}%`, rotate: 0, zIndex: 1 };
    }

    // 7. Time Stream (3 Cards Horizontal)
    if (isTimeStream) {
      const streamCoords: Record<number, { top: string; left: string; rotate?: number; zIndex?: number }> = {
        0: { top: '50%', left: '22%', rotate: 0, zIndex: 1 },
        1: { top: '50%', left: '50%', rotate: 0, zIndex: 1 },
        2: { top: '50%', left: '78%', rotate: 0, zIndex: 1 },
      };
      return streamCoords[slot.slot_id] || { top: `${slot.y * 100}%`, left: `${slot.x * 100}%`, rotate: 0, zIndex: 1 };
    }

    // 8. Single Oracle (1 Card)
    if (isSingle) {
      return { top: '50%', left: '50%', rotate: 0, zIndex: 2 };
    }

    // Fallback: Direct Percentage from Catalog
    return {
      top: `${(slot.y ?? 0.5) * 100}%`,
      left: `${(slot.x ?? 0.5) * 100}%`,
      rotate: slot.rotation_deg || 0,
      zIndex: slot.z_index || 1,
    };
  };

  return (
    <div className="w-full flex-1 flex items-center justify-center relative select-none p-2 md:p-4">
      {session && spread ? (
        /* Explicit Fixed Canvas Workspace to guarantee precise CSS percentage calculations */
        <div className={`w-full max-w-5xl ${layout.canvasHeight} relative mx-auto flex items-center justify-center`}>
          {spread.slots.map((slot: SpreadSlot, idx: number) => {
            const placed = session.placed_cards.find((p: PlacedCard) => p.slot_id === slot.slot_id);
            const card = placed ? cardsCatalog[placed.drawn_card.card_id] : null;
            const isSelected = selectedSlotIndex === idx;
            const isFlipped = revealedSlots.has(idx);
            const pos = getSlotPosition(slot);
            const isCrossedObstacle = pos.rotate === 90;

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
                  zIndex: isSelected ? 45 : (pos.zIndex ?? 1) + 2,
                }}
              >
                {/* For Crossed Card in Celtic Cross, show floating pill badge above to prevent collision */}
                {isCrossedObstacle ? (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/95 dark:bg-black/95 backdrop-blur-md px-2 py-0.5 rounded-full border border-amber-500/40 shadow-lg flex items-center gap-1 z-30 pointer-events-none">
                    <span className="text-[9px] font-editorial font-bold text-amber-300">
                      2. {slot.title_zh}
                    </span>
                    {isFlipped && card && (
                      <>
                        <span className="text-[9px] font-editorial text-slate-100 font-bold">
                          {card.name_zh}
                        </span>
                        <span
                          className={`text-[7px] px-1 rounded font-bold leading-tight ${
                            placed?.drawn_card.orientation === 'Upright'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          }`}
                        >
                          {placed?.drawn_card.orientation === 'Upright' ? '正' : '逆'}
                        </span>
                      </>
                    )}
                  </div>
                ) : null}

                {/* 3D Card Shell */}
                <div
                  className={`relative rounded-2xl transition-all duration-500 card-tactile ${
                    isSelected
                      ? 'ring-2 ring-amber-400 shadow-amber-glow scale-105'
                      : 'shadow-card-float-light dark:shadow-card-float hover:scale-103'
                  }`}
                  style={{
                    width: `${layout.w}px`,
                    height: `${layout.h}px`,
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
                      <div className="absolute top-1 left-1 bg-black/85 text-amber-300 backdrop-blur-md px-1.5 py-0.2 rounded text-[8px] font-mono font-bold border border-amber-500/30 shadow-sm">
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
                      <div className="absolute top-1 left-1 bg-black/85 text-amber-300 backdrop-blur-md px-1.5 py-0.2 rounded text-[8px] font-mono font-bold border border-amber-500/30 shadow-sm">
                        {idx + 1}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Title & Orientation Badge underneath (Only for non-crossed standard slots) */}
                {!isCrossedObstacle && (
                  <div
                    className="mt-1.5 text-center flex flex-col items-center pointer-events-none select-none transition-all"
                    style={{ maxWidth: `${layout.labelMaxW}px` }}
                  >
                    <span className={`${layout.textSize} font-editorial font-medium text-slate-700 dark:text-slate-300 truncate w-full`}>
                      {slot.title_zh}
                    </span>
                    {isFlipped && card && (
                      <div className="flex items-center gap-1 mt-0.5 bg-slate-950/90 dark:bg-black/90 backdrop-blur-md px-1.5 py-0.2 rounded-full border border-amber-500/30 shadow-sm">
                        <span className={`${layout.textSize} font-editorial font-bold text-slate-100 whitespace-nowrap`}>
                          {card.name_zh}
                        </span>
                        <span
                          className={`${layout.badgeSize} px-1 rounded font-editorial font-bold leading-tight ${
                            placed?.drawn_card.orientation === 'Upright'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          }`}
                        >
                          {placed?.drawn_card.orientation === 'Upright' ? '正' : '逆'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Sanctuary Altar State */
        <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-[560px] z-10 p-6 rounded-3xl bg-black/20 dark:bg-white/[0.02] border border-amber-500/20 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
          <div className="w-14 h-14 rounded-full border border-amber-500/40 flex items-center justify-center bg-amber-500/10 shadow-amber-subtle animate-pulse-slow">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-xl font-editorial font-bold tracking-wider text-slate-800 dark:text-slate-100">
                {spread ? spread.name_zh : '每日启示'}
              </h2>
              {spread?.tag && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-editorial font-bold">
                  {spread.tag}
                </span>
              )}
            </div>
            <p className="text-[11px] font-mono text-purple-400">
              {spread ? `${spread.slots.length} 张卡位 · ${spread.difficulty || '标准'}级牌阵` : ''}
            </p>
          </div>

          <div className="space-y-2 text-left bg-black/30 p-4 rounded-2xl border border-white/5 w-full">
            <div className="text-xs text-slate-300 font-editorial leading-relaxed">
              <span className="text-amber-400 font-bold">【牌阵用途】：</span>
              {spread?.description || spread?.purpose || '用于探寻心智与事件的演变规律。'}
            </div>
            {spread?.best_for && (
              <div className="text-[11px] text-slate-400 font-editorial leading-relaxed">
                <span className="text-purple-300 font-bold">【适用场景】：</span>
                {spread.best_for}
              </div>
            )}
            {spread?.structure_explanation && (
              <div className="text-[10px] text-slate-500 font-editorial leading-relaxed border-t border-white/5 pt-2">
                <span className="text-slate-400 font-bold">【卡位拓扑】：</span>
                {spread.structure_explanation}
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-500 font-editorial">
            请在下方输入意图或直接点击「开始密码学抽牌」完成神圣发牌。
          </p>
        </div>
      )}
    </div>
  );
};
