import { useState, useEffect } from 'react';
import { Spread, ReadingSession, Card } from './types/tarot';
import { tarotCoreService } from './services/tarotCoreService';
import { Header } from './components/Header';
import { SpreadCanvas } from './components/SpreadCanvas';
import { RitualDock } from './components/RitualDock';
import { ReadingDrawer } from './components/ReadingDrawer';
import { CardDeckCatalogModal } from './components/CardDeckCatalogModal';
import { LiquidFluidBackground } from './components/LiquidFluidBackground';

const CANONICAL_SPREADS: Spread[] = tarotCoreService.listCanonicalSpreads();
const ALL_CARDS: Card[] = tarotCoreService.listAllCards();

const CARDS_MAP: Record<number, Card> = ALL_CARDS.reduce<Record<number, Card>>((acc, card) => {
  acc[card.id] = card;
  return acc;
}, {});

export function App() {
  const [selectedSpread, setSelectedSpread] = useState<Spread>(CANONICAL_SPREADS[0]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const [session, setSession] = useState<ReadingSession | null>(null);
  const [revealedSlots, setRevealedSlots] = useState<Set<number>>(new Set());
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [question, setQuestion] = useState<string>('新项目全平台开源架构与商业模式发展路径');
  const [allowReversals, setAllowReversals] = useState<boolean>(true);
  const [isPro, setIsPro] = useState<boolean>(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isDeckCatalogOpen, setIsDeckCatalogOpen] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(true);

  // Sync theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Shuffling & Dealing with Core SSOT CSP solver
  const handleShuffleAndDraw = () => {
    setIsDrawing(true);
    setRevealedSlots(new Set());
    setIsDrawerOpen(false);

    setTimeout(() => {
      try {
        const newSession = tarotCoreService.drawReadingSession(
          selectedSpread.id,
          question.trim() || null,
          null,
          allowReversals ? 0.3 : 0.0
        );

        setSession(newSession);
        setIsDrawing(false);

        // Automatically reveal cards with a staggered sweep for delightful ritual
        newSession.placed_cards.forEach((_, i) => {
          setTimeout(() => {
            setRevealedSlots((prev) => new Set([...prev, i]));
          }, (i + 1) * 200);
        });
      } catch (err) {
        console.error('Failed to draw reading session:', err);
        setIsDrawing(false);
      }
    }, 450);
  };

  const handleFlipCard = (index: number) => {
    setRevealedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleRevealAll = () => {
    if (session) {
      const allSlots = new Set<number>(session.placed_cards.map((_, idx) => idx));
      setRevealedSlots(allSlots);
    }
  };

  const handleSelectSlot = (index: number) => {
    setSelectedSlotIndex(index);
    setIsDrawerOpen(true);
  };

  const handleSelectSpread = (spread: Spread) => {
    setSelectedSpread(spread);
    setSession(null);
    setRevealedSlots(new Set());
    setSelectedSlotIndex(0);
  };

  const unrevealedCount = session ? session.placed_cards.length - revealedSlots.size : 0;

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#0A0512] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-500 overflow-x-hidden">
      {/* Dynamic Zen Background Canvas */}
      <LiquidFluidBackground isDark={isDark} />

      {/* Main Header */}
      <Header
        spreads={CANONICAL_SPREADS}
        selectedSpread={selectedSpread}
        onSelectSpread={handleSelectSpread}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        isPro={isPro}
        onTogglePro={() => setIsPro(!isPro)}
        onOpenDeckCatalog={() => setIsDeckCatalogOpen(true)}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        hasDrawnSession={!!session}
      />

      {/* Primary Interaction Workspace */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-between p-4 md:p-8 max-w-7xl w-full mx-auto pb-36">
        {/* Canvas for Interactive Spread Matrix */}
        <SpreadCanvas
          spread={selectedSpread}
          session={session}
          revealedSlots={revealedSlots}
          selectedSlotIndex={selectedSlotIndex}
          onSelectSlot={handleSelectSlot}
          onFlipCard={handleFlipCard}
          cardsCatalog={CARDS_MAP}
        />
      </main>

      {/* Bottom Ritual Dock */}
      <RitualDock
        question={question}
        onChangeQuestion={setQuestion}
        allowReversals={allowReversals}
        onToggleReversals={() => setAllowReversals(!allowReversals)}
        isDrawing={isDrawing}
        onShuffleAndDraw={handleShuffleAndDraw}
        hasSession={!!session}
        onRevealAll={handleRevealAll}
        unrevealedCount={unrevealedCount}
        rngSeed={session?.rng_seed}
      />

      {/* Detailed Reading Drawer */}
      <ReadingDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        spread={selectedSpread}
        session={session}
        selectedSlotIndex={selectedSlotIndex}
        onSelectSlot={setSelectedSlotIndex}
        cardsCatalog={CARDS_MAP}
        isPro={isPro}
        onTogglePro={() => setIsPro(!isPro)}
      />

      {/* 78-Card Full Arcana RWS Gallery Catalog */}
      <CardDeckCatalogModal
        isOpen={isDeckCatalogOpen}
        onClose={() => setIsDeckCatalogOpen(false)}
        cardsCatalog={CARDS_MAP}
        onSelectCardPreview={(_card) => {
          // Preview card
        }}
      />
    </div>
  );
}
