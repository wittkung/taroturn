import React, { useState } from 'react';
import { Card } from '../types/tarot';
import { Sparkles, X, Search } from 'lucide-react';

export interface CardDeckCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardsCatalog: Record<number, Card>;
  onSelectCardPreview: (card: Card) => void;
}

export const CardDeckCatalogModal: React.FC<CardDeckCatalogModalProps> = ({
  isOpen,
  onClose,
  cardsCatalog,
  onSelectCardPreview,
}) => {
  const [filter, setFilter] = useState<'all' | 'major' | 'wands' | 'cups' | 'swords' | 'pentacles'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

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

  const filterTabs: Array<'all' | 'major' | 'wands' | 'cups' | 'swords' | 'pentacles'> = [
    'all',
    'major',
    'wands',
    'cups',
    'swords',
    'pentacles',
  ];

  const labelMap: Record<string, string> = {
    all: '全部 78 张',
    major: '大阿卡纳 (22)',
    wands: '权杖 (14)',
    cups: '圣杯 (14)',
    swords: '宝剑 (14)',
    pentacles: '星币 (14)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#120B20] border border-black/10 dark:border-amethyst-500/30 rounded-3xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full border border-gold/40 flex items-center justify-center bg-gold/10">
              <Sparkles className="w-4 h-4 text-gold" />
            </div>
            <div>
              <h2 className="text-lg font-editorial font-bold text-slate-900 dark:text-slate-100">
                1909 莱德·伟特·史密斯 (RWS) 78 张全景卡牌图鉴
              </h2>
              <p className="text-xs font-editorial text-slate-500">
                Pamela Colman Smith 原版公有领域高清扫描档案库
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="px-6 py-3 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center space-x-1 text-xs font-editorial">
            {filterTabs.map((tab) => {
              const active = filter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1 rounded-full transition-all ${
                    active
                      ? 'bg-gold/20 text-gold border border-gold/40 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {labelMap[tab]}
                </button>
              );
            })}
          </div>

          <div className="relative w-52">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索卡牌名称..."
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full pl-8 pr-3 py-1 text-[12px] font-editorial text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-gold/50"
            />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="flex-1 p-6 overflow-y-auto grid grid-cols-6 gap-4 bg-sanctuary-light dark:bg-sanctuary-dark">
          {filteredCards.map((card: Card) => (
            <div
              key={card.id}
              onClick={() => {
                onSelectCardPreview(card);
                onClose();
              }}
              className="flex flex-col items-center cursor-pointer group card-tactile"
            >
              <div className="w-[115px] h-[190px] rounded-xl overflow-hidden border border-black/10 dark:border-white/10 group-hover:border-gold/80 relative bg-black transition-all shadow-md">
                <img
                  src={`/cards/${card.id}.jpg`}
                  alt={card.name_zh}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.currentTarget.src = '/cards/card_back.svg'; }}
                />
                <div className="absolute top-1.5 left-1.5 bg-white/90 dark:bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-purple-950 dark:text-gold border border-purple-200/80 dark:border-white/10 shadow-sm">
                  #{card.id}
                </div>
              </div>
              <div className="mt-1.5 text-center">
                <span className="text-[12px] font-editorial font-bold text-slate-800 dark:text-slate-200 block group-hover:text-gold transition-colors">
                  {card.name_zh}
                </span>
                <span className="text-[10px] font-editorial text-slate-500 italic block line-clamp-1">
                  {card.name_en}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
