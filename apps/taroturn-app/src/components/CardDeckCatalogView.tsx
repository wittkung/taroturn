// src/components/CardDeckCatalogView.tsx - Fullscreen Deck Catalog & Lore Gallery
import React, { useState } from 'react';
import { Card } from '../types/tarot';
import { Sparkles, Search, Layers, Flame, Droplet, Wind, Mountain } from 'lucide-react';

export interface CardDeckCatalogViewProps {
  cardsCatalog: Record<number, Card>;
  onSelectCardPreview?: (card: Card) => void;
}

export const CardDeckCatalogView: React.FC<CardDeckCatalogViewProps> = ({
  cardsCatalog,
  onSelectCardPreview,
}) => {
  const [filter, setFilter] = useState<'all' | 'major' | 'wands' | 'cups' | 'swords' | 'pentacles'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const allCards = Object.values(cardsCatalog);

  const filteredCards = allCards.filter((card: Card) => {
    // 1. Filter by category
    if (filter === 'major' && card.arcana !== 'Major') return false;
    if (filter === 'wands' && card.suit !== 'Wands') return false;
    if (filter === 'cups' && card.suit !== 'Cups') return false;
    if (filter === 'swords' && card.suit !== 'Swords') return false;
    if (filter === 'pentacles' && card.suit !== 'Pentacles') return false;

    // 2. Search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        card.name_zh.toLowerCase().includes(q) ||
        card.name_en.toLowerCase().includes(q) ||
        String(card.id).includes(q)
      );
    }
    return true;
  });

  const filterTabs: Array<{ id: 'all' | 'major' | 'wands' | 'cups' | 'swords' | 'pentacles'; label: string; icon?: any }> = [
    { id: 'all', label: '全部 78 张' },
    { id: 'major', label: '大阿卡纳 (22)', icon: Sparkles },
    { id: 'wands', label: '权杖 (火 14)', icon: Flame },
    { id: 'cups', label: '圣杯 (水 14)', icon: Droplet },
    { id: 'swords', label: '宝剑 (风 14)', icon: Wind },
    { id: 'pentacles', label: '星币 (土 14)', icon: Mountain },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-slate-900/40 border border-purple-500/20 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 shadow-sm flex-shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-editorial font-bold text-slate-100 flex items-center gap-2">
              <span>1909 莱德·伟特·史密斯 (RWS) 典籍图谱</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                78 张完整原典
              </span>
            </h2>
            <p className="text-xs font-editorial text-slate-400 mt-0.5">
              Pamela Colman Smith 原作高保真数字化扫描档案，卡巴拉秘传与四要素符号全景
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索牌名、编号或英文..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-black/40 border border-purple-500/20 text-xs font-editorial text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
        {filterTabs.map((tab) => {
          const active = filter === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-editorial font-bold transition-all flex items-center space-x-1.5 flex-shrink-0 ${
                active
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'bg-white/[0.02] hover:bg-white/5 text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Cards Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredCards.map((card) => {
          const isCurrentSelected = selectedCard?.id === card.id;
          return (
            <div
              key={card.id}
              onClick={() => {
                setSelectedCard(card);
                onSelectCardPreview?.(card);
              }}
              className={`group rounded-2xl p-2.5 border transition-all cursor-pointer flex flex-col justify-between bg-black/20 backdrop-blur-md ${
                isCurrentSelected
                  ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-xl bg-purple-950/40'
                  : 'border-white/5 hover:border-purple-500/40 hover:bg-purple-950/20 hover:scale-[1.02]'
              }`}
            >
              {/* Card Image Thumbnail */}
              <div className="aspect-[2/3] w-full rounded-xl overflow-hidden border border-white/10 bg-black shadow-md relative">
                <img
                  src={`/cards/${card.id}.jpg`}
                  alt={card.name_zh}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-1.5 right-1.5 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-black/70 text-amber-300 border border-amber-400/30 backdrop-blur-sm">
                  #{card.id}
                </span>
              </div>

              {/* Card Meta */}
              <div className="pt-2 text-center space-y-0.5">
                <div className="text-xs font-editorial font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                  {card.name_zh}
                </div>
                <div className="text-[10px] font-editorial text-slate-400 truncate italic">
                  {card.name_en}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Card Deep Lore Drawer / Preview Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-purple-500/40 rounded-3xl shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-28 h-44 rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-xl flex-shrink-0 bg-black">
                <img
                  src={`/cards/${selectedCard.id}.jpg`}
                  alt={selectedCard.name_zh}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                    #{selectedCard.id} {selectedCard.arcana}
                  </span>
                  {selectedCard.suit && (
                    <span className="text-[10px] font-mono text-purple-300">
                      {selectedCard.suit}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-editorial font-bold text-slate-100">
                  {selectedCard.name_zh}
                </h3>
                <p className="text-xs font-editorial text-slate-400 italic">
                  {selectedCard.name_en}
                </p>

                {selectedCard.element && (
                  <div className="text-xs font-editorial text-amber-300 font-medium pt-1">
                    对应要素：{selectedCard.element}
                  </div>
                )}
              </div>
            </div>

            {/* Meanings */}
            <div className="space-y-2 pt-2 border-t border-purple-500/20 text-xs font-editorial">
              {selectedCard.facets?.general_upright && (
                <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-300 space-y-1">
                  <span className="font-bold block">正位关键词与核心启示：</span>
                  <p className="text-slate-300 leading-relaxed">
                    {Array.isArray(selectedCard.facets.general_upright)
                      ? selectedCard.facets.general_upright.join(' · ')
                      : selectedCard.facets.general_upright}
                  </p>
                </div>
              )}

              {selectedCard.facets?.general_reversed && (
                <div className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-rose-300 space-y-1">
                  <span className="font-bold block">逆位潜意识阻抗与转化功课：</span>
                  <p className="text-slate-300 leading-relaxed">
                    {Array.isArray(selectedCard.facets.general_reversed)
                      ? selectedCard.facets.general_reversed.join(' · ')
                      : selectedCard.facets.general_reversed}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCard(null)}
                className="px-5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-editorial transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
