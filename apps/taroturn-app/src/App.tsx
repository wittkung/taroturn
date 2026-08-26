// src/App.tsx - TTZip Zen Architecture Root Layout
import { useState, useEffect } from 'react';
import { Spread, ReadingSession, Card } from './types/tarot';
import { tarotCoreService } from './services/tarotCoreService';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SpreadCanvas } from './components/SpreadCanvas';
import { RitualDock } from './components/RitualDock';
import { ReadingDrawer } from './components/ReadingDrawer';
import { FocusIntentionModal } from './components/FocusIntentionModal';
import { CardDeckCatalogView } from './components/CardDeckCatalogView';
import { ReadingJournalView } from './components/ReadingJournalView';
import { UserProfileView } from './components/UserProfileView';
import { SettingsView } from './components/SettingsView';
import { LiquidFluidBackground } from './components/LiquidFluidBackground';
import { JournalStorageService } from './services/journalStorageService';
import { UserSettingsService } from './services/userSettingsService';
import { UserSettings } from './types/settings';
import { ActiveWorkspaceTab } from './types/navigation';

const CANONICAL_SPREADS: Spread[] = tarotCoreService.listCanonicalSpreads();
const ALL_CARDS: Card[] = tarotCoreService.listAllCards();

const CARDS_MAP: Record<number, Card> = ALL_CARDS.reduce<Record<number, Card>>((acc, card) => {
  acc[card.id] = card;
  return acc;
}, {});

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveWorkspaceTab>('divination');
  const [userSettings, setUserSettings] = useState<UserSettings>(UserSettingsService.getSettings());
  const [selectedSpread, setSelectedSpread] = useState<Spread>(CANONICAL_SPREADS[0]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const [session, setSession] = useState<ReadingSession | null>(null);
  const [revealedSlots, setRevealedSlots] = useState<Set<number>>(new Set());
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [question, setQuestion] = useState<string>('');
  const [allowReversals, setAllowReversals] = useState<boolean>(
    userSettings.ritual.reversalProbability > 0
  );
  const [isPro, setIsPro] = useState<boolean>(userSettings.isPro ?? true);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(userSettings.theme === 'dark');

  // Subscribe to settings changes
  useEffect(() => {
    const unsub = UserSettingsService.subscribe((updated) => {
      setUserSettings(updated);
      setIsDark(updated.theme === 'dark');
      setIsPro(updated.isPro ?? true);
      setAllowReversals(updated.ritual.reversalProbability > 0);
    });
    return () => unsub();
  }, []);

  // Sync theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Prompt intention modal when clicking shuffle
  const handleOpenFocusModal = () => {
    setIsFocusModalOpen(true);
  };

  // Shuffling & Dealing
  const handleExecuteDrawWithQuestion = (targetQuestion: string) => {
    setIsFocusModalOpen(false);
    setQuestion(targetQuestion);
    setIsDrawing(true);
    setRevealedSlots(new Set());
    setIsDrawerOpen(false);

    const prob = allowReversals
      ? userSettings.ritual.reversalProbability || 0.3
      : 0.0;
    const delay = userSettings.ritual.autoRevealDelayMs || 200;

    setTimeout(() => {
      try {
        const newSession = tarotCoreService.drawReadingSession(
          selectedSpread.id,
          targetQuestion.trim() || null,
          null,
          prob
        );

        setSession(newSession);
        setIsDrawing(false);

        // Auto-save to reading journal
        JournalStorageService.saveSession(newSession);

        // Automatically reveal cards with staggered sweep for delightful ritual
        newSession.placed_cards.forEach((_, i) => {
          setTimeout(() => {
            setRevealedSlots((prev) => new Set([...prev, i]));
          }, (i + 1) * delay);
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

  const handleLoadPastSession = (pastSession: ReadingSession, pastSpread: Spread) => {
    setSelectedSpread(pastSpread);
    setSession(pastSession);
    setQuestion(pastSession.question || '');
    const allSlots = new Set<number>(pastSession.placed_cards.map((_, idx) => idx));
    setRevealedSlots(allSlots);
    setSelectedSlotIndex(0);
    setActiveTab('divination');
    setIsDrawerOpen(true);
  };

  const unrevealedCount = session ? session.placed_cards.length - revealedSlots.size : 0;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#0A0512] text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-500 select-none">
      {/* Dynamic Zen Liquid Background */}
      <LiquidFluidBackground isDark={isDark} />

      {/* 1. Fixed TTZip Zen Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        userSettings={userSettings}
        isPro={isPro}
        onTogglePro={() => {
          const next = !isPro;
          setIsPro(next);
          UserSettingsService.saveSettings({
            ...userSettings,
            isPro: next,
          });
        }}
      />

      {/* 2. Main Content Container (Header + Active Workspace) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Unified 54pt Header with Kintsugi Gold Line */}
        <Header
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          spreads={CANONICAL_SPREADS}
          selectedSpread={selectedSpread}
          onSelectSpread={handleSelectSpread}
          isDark={isDark}
          onToggleTheme={() => {
            const next = !isDark;
            setIsDark(next);
            UserSettingsService.saveSettings({
              ...userSettings,
              theme: next ? 'dark' : 'light',
            });
          }}
          isPro={isPro}
          onTogglePro={() => {
            const next = !isPro;
            setIsPro(next);
            UserSettingsService.saveSettings({
              ...userSettings,
              isPro: next,
            });
          }}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          hasDrawnSession={!!session}
          userSettings={userSettings}
        />

        {/* Dynamic Workspace Router View */}
        <main className="flex-1 overflow-y-auto relative">
          {/* TAB 1: 圣所推演 / 牌阵仪式 */}
          {activeTab === 'divination' && (
            <div className="min-h-full flex flex-col justify-between p-4 md:p-8 max-w-7xl w-full mx-auto pb-36 animate-in fade-in duration-200">
              <SpreadCanvas
                spread={selectedSpread}
                session={session}
                revealedSlots={revealedSlots}
                selectedSlotIndex={selectedSlotIndex}
                onSelectSlot={handleSelectSlot}
                onFlipCard={handleFlipCard}
                cardsCatalog={CARDS_MAP}
              />
            </div>
          )}

          {/* TAB 2: 历史账本 / 占卜复盘 */}
          {activeTab === 'journal' && (
            <ReadingJournalView
              spreads={CANONICAL_SPREADS}
              cardsCatalog={CARDS_MAP}
              onLoadSession={handleLoadPastSession}
            />
          )}

          {/* TAB 3: 牌典图谱 / 78 卡牌画廊 */}
          {activeTab === 'catalog' && (
            <CardDeckCatalogView
              cardsCatalog={CARDS_MAP}
            />
          )}

          {/* TAB 4: 本命神殿 / 多求问者图谱 */}
          {activeTab === 'profiles' && (
            <UserProfileView
              onOpenSettingsTab={() => setActiveTab('settings')}
            />
          )}

          {/* TAB 5: 认知中枢 / 系统设置 */}
          {activeTab === 'settings' && (
            <SettingsView
              onSettingsChange={(newSettings) => setUserSettings(newSettings)}
            />
          )}
        </main>

        {/* Bottom Ritual Dock (Fixed when on Divination Tab) */}
        {activeTab === 'divination' && (
          <RitualDock
            question={question}
            onChangeQuestion={setQuestion}
            allowReversals={allowReversals}
            onToggleReversals={() => {
              const next = !allowReversals;
              setAllowReversals(next);
              UserSettingsService.saveSettings({
                ...userSettings,
                ritual: {
                  ...userSettings.ritual,
                  reversalProbability: next ? 0.3 : 0.0,
                },
              });
            }}
            isDrawing={isDrawing}
            onShuffleAndDraw={handleOpenFocusModal}
            hasSession={!!session}
            onRevealAll={handleRevealAll}
            unrevealedCount={unrevealedCount}
            rngSeed={session?.rng_seed}
          />
        )}
      </div>

      {/* Detailed Reading Drawer (Right Slide-over) */}
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
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Pre-Draw Focus Intention Modal (Transient Modal) */}
      <FocusIntentionModal
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
        spread={selectedSpread}
        currentQuestion={question}
        onConfirmDraw={handleExecuteDrawWithQuestion}
      />
    </div>
  );
}
