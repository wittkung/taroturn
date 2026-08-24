// src/components/DeckSelector.tsx - Multi-Deck Switcher & OTP Importer Component
import React from "react";
import { CANONICAL_DECK_SYSTEMS, DeckSystemMeta } from "../types/deck";

interface DeckSelectorProps {
  activeDeckId: string;
  onSelectDeck: (deck: DeckSystemMeta) => void;
}

export const DeckSelector: React.FC<DeckSelectorProps> = ({
  activeDeckId,
  onSelectDeck
}) => {
  return (
    <div className="flex items-center gap-2 bg-slate-900/80 border border-amber-500/30 rounded-xl px-3 py-1.5 backdrop-blur-md">
      <span className="text-xs text-amber-400 font-medium">牌系:</span>
      <select
        value={activeDeckId}
        onChange={(e) => {
          const selected = CANONICAL_DECK_SYSTEMS.find((d) => d.deckId === e.target.value);
          if (selected) onSelectDeck(selected);
        }}
        className="bg-transparent text-xs text-slate-200 border-none outline-none cursor-pointer pr-2"
      >
        {CANONICAL_DECK_SYSTEMS.map((deck) => (
          <option key={deck.deckId} value={deck.deckId} className="bg-slate-900 text-slate-200">
            {deck.displayNameZh}
          </option>
        ))}
      </select>
    </div>
  );
};
