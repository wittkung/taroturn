import React, { useState } from 'react';
import { Sparkles, Flame, Droplet, Wind, Mountain, Moon, Lock, BrainCircuit } from 'lucide-react';
import { Spread, ReadingSession, Card } from '../types/tarot';

interface InspectorProps {
  spread: Spread;
  session: ReadingSession | null;
  selectedSlotIndex: number;
  cardsCatalog: Record<number, Card>;
  isPro: boolean;
  onTriggerAiReading: () => void;
  aiLoading: boolean;
  aiReport: string | null;
}

export const Inspector: React.FC<InspectorProps> = ({
  spread,
  session,
  selectedSlotIndex,
  cardsCatalog,
  isPro,
  onTriggerAiReading,
  aiLoading,
  aiReport,
}) => {
  const [activeTab, setActiveTab] = useState<'card' | 'dignity' | 'ai'>('card');

  const slot = spread.slots[selectedSlotIndex];
  const placed = session?.placed_cards.find((p) => p.slot_id === slot?.slot_id);
  const card = placed ? cardsCatalog[placed.drawn_card.card_id] : null;

  return (
    <aside className="w-[280px] flex-shrink-0 h-full border-l border-black/5 dark:border-white/5 bg-white/50 dark:bg-sumiBlack/85 flex flex-col justify-between select-none z-20 transition-colors duration-300">
      {/* Top Segmented Tabs */}
      <div className="flex border-b border-black/5 dark:border-white/5 text-[11px] font-editorial font-bold">
        <button
          onClick={() => setActiveTab('card')}
          className={`flex-1 py-2.5 text-center transition-all ${
            activeTab === 'card'
              ? 'text-kintsugiGold dark:text-kintsugiGold-light border-b-2 border-kintsugiGold bg-kintsugiGold/5'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          单牌原型
        </button>
        <button
          onClick={() => setActiveTab('dignity')}
          className={`flex-1 py-2.5 text-center transition-all ${
            activeTab === 'dignity'
              ? 'text-kintsugiGold dark:text-kintsugiGold-light border-b-2 border-kintsugiGold bg-kintsugiGold/5'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          四要素
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-2.5 text-center transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'ai'
              ? 'text-kintsugiGold dark:text-kintsugiGold-light border-b-2 border-kintsugiGold bg-kintsugiGold/5'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3 h-3 text-kintsugiGold" />
          <span>AI 解读</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {activeTab === 'card' && (
          <div className="space-y-3">
            {card ? (
              <>
                {/* Position & Card Header */}
                <div className="border-b border-black/5 dark:border-white/5 pb-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-kintsugiGold font-bold">
                    <span>POSITION {selectedSlotIndex + 1}</span>
                    <span>{card.element}</span>
                  </div>
                  <h4 className="text-[14px] font-editorial font-bold text-slate-800 dark:text-slate-100">
                    {slot.title_zh} ({slot.title_en})
                  </h4>
                  <p className="text-[11px] font-editorial text-slate-500 dark:text-slate-400 leading-relaxed">
                    {slot.meaning_prompt}
                  </p>
                </div>

                {/* Card Artwork & Details */}
                <div className="flex space-x-3 items-center">
                  <div className="w-14 h-24 rounded-lg overflow-hidden border border-kintsugiGold/40 flex-shrink-0 shadow-sm bg-black">
                    <img
                      src={`/cards/${card.id}.jpg`}
                      alt={card.name_zh}
                      className="w-full h-full object-cover rounded-md"
                      style={{
                        transform: placed?.drawn_card.orientation === 'Reversed' ? 'rotate(180deg)' : 'none',
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div>
                      <h3 className="text-[15px] font-editorial font-bold text-slate-900 dark:text-slate-100">
                        {card.name_zh}
                      </h3>
                      <p className="text-[10px] font-editorial text-slate-500 italic">
                        {card.name_en}
                      </p>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.2 rounded-full inline-block font-editorial ${
                        placed?.drawn_card.orientation === 'Upright'
                          ? 'bg-bambooGreen/15 text-bambooGreen'
                          : 'bg-cinnabarRed/15 text-cinnabarRed'
                      }`}
                    >
                      {placed?.drawn_card.orientation === 'Upright' ? '正位' : '逆位'}
                    </span>
                  </div>
                </div>

                {/* Facets / Reading */}
                <div className="space-y-2 text-[11px] font-editorial">
                  <div>
                    <span className="font-bold text-kintsugiGold block mb-0.5">情感洞见</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {placed?.drawn_card.orientation === 'Upright'
                        ? card.facets.love_upright
                        : card.facets.love_reversed}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-kintsugiGold block mb-0.5">事业与成长</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {placed?.drawn_card.orientation === 'Upright'
                        ? card.facets.career_upright
                        : card.facets.career_reversed}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-cinnabarRed block mb-0.5">阴影盲区</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {card.facets.shadow_aspect}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-slate-400 font-editorial text-[12px]">
                点击牌阵中的卡牌以查看单牌原型。
              </div>
            )}
          </div>
        )}

        {activeTab === 'dignity' && (
          <div className="space-y-3">
            {session ? (
              <>
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="flex items-center justify-between text-cinnabarRed font-editorial">
                    <div className="flex items-center space-x-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span>火 (行动):</span>
                    </div>
                    <span className="font-bold font-mono">{(session.dignity_summary.fire_ratio * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cinnabarRed h-full rounded-full" style={{ width: `${session.dignity_summary.fire_ratio * 100}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-blue-500 font-editorial pt-1">
                    <div className="flex items-center space-x-1">
                      <Droplet className="w-3.5 h-3.5" />
                      <span>水 (情感):</span>
                    </div>
                    <span className="font-bold font-mono">{(session.dignity_summary.water_ratio * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${session.dignity_summary.water_ratio * 100}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-yellow-600 dark:text-yellow-400 font-editorial pt-1">
                    <div className="flex items-center space-x-1">
                      <Wind className="w-3.5 h-3.5" />
                      <span>风 (策略):</span>
                    </div>
                    <span className="font-bold font-mono">{(session.dignity_summary.air_ratio * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${session.dignity_summary.air_ratio * 100}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-bambooGreen font-editorial pt-1">
                    <div className="flex items-center space-x-1">
                      <Mountain className="w-3.5 h-3.5" />
                      <span>土 (根基):</span>
                    </div>
                    <span className="font-bold font-mono">{(session.dignity_summary.earth_ratio * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-bambooGreen h-full rounded-full" style={{ width: `${session.dignity_summary.earth_ratio * 100}%` }} />
                  </div>
                </div>

                <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-1.5 text-[11px] font-editorial">
                  <div className="flex justify-between">
                    <span className="text-slate-500">主导态势:</span>
                    <span className="font-bold text-kintsugiGold">{session.dignity_summary.dominant_element}</span>
                  </div>
                  {session.dignity_summary.shadow_card_id !== undefined && (
                    <div className="flex justify-between">
                      <div className="flex items-center space-x-1 text-slate-500">
                        <Moon className="w-3 h-3 text-kintsugiGold" />
                        <span>灵数底牌:</span>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {cardsCatalog[session.dignity_summary.shadow_card_id ?? 0]?.name_zh ?? '愚者'}
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-slate-400 font-editorial text-[12px]">
                请先完成抽牌以生成四要素报告。
              </div>
            )}
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-3">
            {!isPro ? (
              <div className="p-4 text-center space-y-2.5 border border-black/5 dark:border-white/5 rounded-xl bg-black/2 dark:bg-white/2">
                <div className="w-10 h-10 rounded-full bg-kintsugiGold/10 flex items-center justify-center mx-auto">
                  <Lock className="w-4 h-4 text-kintsugiGold" />
                </div>
                <h4 className="text-[13px] font-bold font-editorial text-slate-800 dark:text-slate-100">
                  AI 深度多维解读
                </h4>
                <p className="text-[11px] font-editorial text-slate-500 dark:text-slate-400 leading-relaxed">
                  当前处于免费体验模式。开通 PRO 即可体验长程心理学模型深度推演。
                </p>
                <button
                  onClick={onTriggerAiReading}
                  className="w-full py-2 rounded-full bg-kintsugiGold text-black font-bold text-[11px] font-editorial shadow-sm transform active:scale-95 transition-all"
                >
                  解锁 PRO 体验
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-kintsugiGold text-[12px] font-bold font-editorial">
                  <div className="flex items-center space-x-1">
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>PRO AI 引擎</span>
                  </div>
                </div>
                <button
                  onClick={onTriggerAiReading}
                  disabled={aiLoading || !session}
                  className="w-full py-1.5 rounded-full bg-kintsugiGold text-black font-bold text-[11px] font-editorial shadow-sm hover:bg-kintsugiGold-light active:scale-95 transition-all disabled:opacity-50"
                >
                  {aiLoading ? '正在深度推演...' : '生成多维解读报告'}
                </button>

                {aiReport && (
                  <div className="p-2.5 rounded-xl text-[11px] font-editorial text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line border border-kintsugiGold/20 bg-black/2 dark:bg-white/2">
                    {aiReport}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Pro Badge */}
      <div className="p-2.5 border-t border-black/5 dark:border-white/5 text-[10px] font-editorial text-slate-400 text-center">
        {isPro ? (
          <span className="text-kintsugiGold font-bold">PRO 会员特权已激活</span>
        ) : (
          <span>免费模式 · 即走即失</span>
        )}
      </div>
    </aside>
  );
};
