import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { QuestSetupScreen } from './components/screens/QuestSetupScreen';
import { MissionBriefingScreen } from './components/screens/MissionBriefingScreen';
import { PocketModeScreen } from './components/screens/PocketModeScreen';
import { FieldJournalScreen } from './components/screens/FieldJournalScreen';
import { DiscoveryCardScreen } from './components/screens/DiscoveryCardScreen';
import { ExpeditionsScreen } from './components/screens/ExpeditionsScreen';
import { AILabScreen } from './components/screens/AILabScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';

import {
  Mission,
  ScoredMission,
  UserPreferences,
  FieldObservation,
  DiscoveryCard,
  ModelStatus
} from './types';
import { MISSIONS, MISSION_MAP } from './data/missions';
import { modelManager } from './services/ai/modelManager';
import { generateDiscoveryCard } from './services/ai/discoveryEngine';
import { storageService } from './services/storage/indexedDB';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<string>('welcome');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('sidequest_theme') === 'dark';
  });

  const [modelStatus, setModelStatus] = useState<ModelStatus>(modelManager.getStatus());
  const [expeditions, setExpeditions] = useState<FieldObservation[]>([]);
  const [unlockedMilestoneIds, setUnlockedMilestoneIds] = useState<string[]>([]);

  const [preferences, setPreferences] = useState<UserPreferences>({
    duration: 10,
    mood: 'curious',
    environment: 'campus',
    freeformInterests: ''
  });

  const [selectedMission, setSelectedMission] = useState<Mission>(MISSIONS[0]);
  const [activeQuest, setActiveQuest] = useState<{
    mission: Mission;
    startedAt: number;
    durationMinutes: number;
  } | null>(null);

  const [lastElapsedSeconds, setLastElapsedSeconds] = useState<number>(0);
  const [lastDiscoveryCard, setLastDiscoveryCard] = useState<DiscoveryCard | null>(null);
  const [isSynthesizingDiscovery, setIsSynthesizingDiscovery] = useState(false);

  // Initialize theme class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sidequest_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sidequest_theme', 'light');
    }
  }, [isDarkMode]);

  // Subscribe to model status
  useEffect(() => {
    const unsub = modelManager.subscribe((st) => setModelStatus(st));
    return unsub;
  }, []);

  // Initialize storage and check for active in-progress quest (refresh recovery)
  useEffect(() => {
    const loadData = async () => {
      await storageService.init();

      const [storedExpeditions, storedActive, storedPrefs, storedMilestones] =
        await Promise.all([
          storageService.getExpeditions(),
          storageService.getActiveQuest(),
          storageService.getPreferences(),
          storageService.getUnlockedMilestones()
        ]);

      setExpeditions(storedExpeditions);
      if (storedPrefs) setPreferences(storedPrefs);
      if (storedMilestones) setUnlockedMilestoneIds(storedMilestones);

      if (storedActive) {
        setActiveQuest(storedActive);
        setSelectedMission(storedActive.mission);
      }
    };

    loadData();
  }, []);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleSelectMissionFromSetup = (
    scored: ScoredMission,
    prefs: UserPreferences
  ) => {
    setSelectedMission(scored.mission);
    setPreferences(prefs);
    storageService.savePreferences(prefs);
    setCurrentScreen('briefing');
  };

  const handleEnterPocketMode = async () => {
    const questData = {
      mission: selectedMission,
      startedAt: Date.now(),
      durationMinutes: selectedMission.duration
    };
    setActiveQuest(questData);
    await storageService.saveActiveQuest(questData);
    setCurrentScreen('pocket');
  };

  const handleFinishPocketMode = (elapsedSeconds: number) => {
    setLastElapsedSeconds(elapsedSeconds);
    setCurrentScreen('journal');
  };

  const handleCancelPocketMode = async () => {
    setActiveQuest(null);
    await storageService.saveActiveQuest(null);
    setCurrentScreen('setup');
  };

  const handleAcceptNextMission = (missionId: string) => {
    const nextM = MISSION_MAP.get(missionId);
    if (nextM) {
      setSelectedMission(nextM);
      setCurrentScreen('briefing');
    } else {
      setCurrentScreen('setup');
    }
  };

  const evaluateMilestones = async (
    obs: FieldObservation,
    totalExpeditionsCount: number
  ) => {
    const currentUnlocked = new Set(unlockedMilestoneIds);
    let newlyUnlocked = false;

    // First Bloom
    if (totalExpeditionsCount >= 1 && !currentUnlocked.has('first-bloom')) {
      currentUnlocked.add('first-bloom');
      newlyUnlocked = true;
    }

    // Pavement Pioneer
    const text = (obs.userNotes + ' ' + obs.missionTitle).toLowerCase();
    if (
      (text.includes('crack') ||
        text.includes('concrete') ||
        text.includes('pavement') ||
        text.includes('brick') ||
        obs.missionId === 'survivor') &&
      !currentUnlocked.has('pavement-pioneer')
    ) {
      currentUnlocked.add('pavement-pioneer');
      newlyUnlocked = true;
    }

    // Acoustic Cartographer
    if (
      (text.includes('sound') ||
        text.includes('bird') ||
        text.includes('acoustic') ||
        text.includes('hear') ||
        obs.missionId === 'invisible-city' ||
        obs.missionId === 'birdsong-triangulation') &&
      !currentUnlocked.has('acoustic-cartographer')
    ) {
      currentUnlocked.add('acoustic-cartographer');
      newlyUnlocked = true;
    }

    // Microclimate Sleuth
    if (
      (text.includes('shade') ||
        text.includes('temperature') ||
        text.includes('thermal') ||
        text.includes('breeze') ||
        text.includes('heat') ||
        obs.missionId === 'shade-experiment' ||
        obs.missionId === 'microclimate-mystery') &&
      !currentUnlocked.has('microclimate-sleuth')
    ) {
      currentUnlocked.add('microclimate-sleuth');
      newlyUnlocked = true;
    }

    // Five-minute anchor
    if (obs.actualElapsedSeconds >= 300 && !currentUnlocked.has('five-minute-anchor')) {
      currentUnlocked.add('five-minute-anchor');
      newlyUnlocked = true;
    }

    // Pattern Hunter / Biomimicry
    if (
      (text.includes('pattern') ||
        text.includes('spiral') ||
        text.includes('fractal') ||
        obs.missionId === 'pattern-hunter' ||
        obs.missionId === 'geometric-echoes') &&
      !currentUnlocked.has('biomimicry-scholar')
    ) {
      currentUnlocked.add('biomimicry-scholar');
      newlyUnlocked = true;
    }

    // Veteran Naturalist
    if (totalExpeditionsCount >= 5 && !currentUnlocked.has('expedition-veteran')) {
      currentUnlocked.add('expedition-veteran');
      newlyUnlocked = true;
    }

    if (newlyUnlocked) {
      const updatedList = Array.from(currentUnlocked);
      setUnlockedMilestoneIds(updatedList);
      await storageService.saveUnlockedMilestones(updatedList);
    }
  };

  const handleSubmitFieldJournal = async (data: {
    userNotes: string;
    surprisingFinding: string;
    reflectionAnswers: Record<string, string>;
    investigateNextIdea: string;
    photoDataUrl?: string;
    optInLocationLabel?: string;
  }) => {
    setIsSynthesizingDiscovery(true);

    try {
      const completedIds = new Set(expeditions.map((e) => e.missionId));
      completedIds.add(selectedMission.id);

      // Run local AI Discovery Engine
      const discoveryCard = await generateDiscoveryCard(
        data.userNotes,
        selectedMission,
        data.surprisingFinding,
        data.investigateNextIdea,
        completedIds
      );

      const observation: FieldObservation = {
        id: `exp_${Date.now()}`,
        missionId: selectedMission.id,
        missionTitle: selectedMission.title,
        timestamp: Date.now(),
        durationMinutes: selectedMission.duration,
        actualElapsedSeconds: lastElapsedSeconds,
        environment: preferences.environment,
        mood: preferences.mood,
        userNotes: data.userNotes,
        surprisingFinding: data.surprisingFinding || undefined,
        reflectionAnswers: data.reflectionAnswers,
        investigateNextIdea: data.investigateNextIdea || undefined,
        photoDataUrl: data.photoDataUrl,
        discoveryCard,
        optInLocation: data.optInLocationLabel
          ? { label: data.optInLocationLabel }
          : undefined
      };

      // Persist in IndexedDB
      await storageService.saveExpedition(observation);
      await storageService.saveActiveQuest(null);

      const updatedExpeditions = [observation, ...expeditions];
      setExpeditions(updatedExpeditions);
      setActiveQuest(null);
      setLastDiscoveryCard(discoveryCard);

      // Check milestones
      await evaluateMilestones(observation, updatedExpeditions.length);

      // Navigate to Discovery Screen
      setCurrentScreen('discovery');
    } catch (err) {
      console.error('Discovery synthesis error:', err);
    } finally {
      setIsSynthesizingDiscovery(false);
    }
  };

  const handleDataCleared = () => {
    setExpeditions([]);
    setActiveQuest(null);
    setUnlockedMilestoneIds([]);
    setCurrentScreen('welcome');
  };

  const completedIds = new Set(expeditions.map((e) => e.missionId));

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] dark:bg-[#0E1511] text-[#1C2621] dark:text-[#E8EDE9] transition-colors selection:bg-[#C87D32]/20">
      {/* Top Navigation */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        modelStatus={modelStatus}
        activeQuestTitle={activeQuest?.mission.title}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pb-16">
        {currentScreen === 'welcome' && (
          <WelcomeScreen
            onStartQuest={() => setCurrentScreen('setup')}
            onResumeQuest={() => setCurrentScreen('pocket')}
            onOpenJournal={() => setCurrentScreen('expeditions')}
            onOpenAILab={() => setCurrentScreen('ailab')}
            activeQuestTitle={activeQuest?.mission.title}
            expeditionCount={expeditions.length}
            modelStatus={modelStatus}
          />
        )}

        {currentScreen === 'setup' && (
          <QuestSetupScreen
            initialPreferences={preferences}
            completedMissionIds={completedIds}
            onSelectMission={handleSelectMissionFromSetup}
            modelStatus={modelStatus}
          />
        )}

        {currentScreen === 'briefing' && (
          <MissionBriefingScreen
            mission={selectedMission}
            preferences={preferences}
            onEnterPocketMode={handleEnterPocketMode}
            onBack={() => setCurrentScreen('setup')}
          />
        )}

        {currentScreen === 'pocket' && activeQuest && (
          <PocketModeScreen
            mission={activeQuest.mission}
            startedAt={activeQuest.startedAt}
            durationMinutes={activeQuest.durationMinutes}
            onFinish={handleFinishPocketMode}
            onCancel={handleCancelPocketMode}
          />
        )}

        {currentScreen === 'journal' && (
          <FieldJournalScreen
            mission={selectedMission}
            preferences={preferences}
            elapsedSeconds={lastElapsedSeconds}
            onSubmitNotes={handleSubmitFieldJournal}
            isSynthesizing={isSynthesizingDiscovery}
          />
        )}

        {currentScreen === 'discovery' && lastDiscoveryCard && (
          <DiscoveryCardScreen
            card={lastDiscoveryCard}
            onAcceptNextMission={handleAcceptNextMission}
            onViewJournal={() => setCurrentScreen('expeditions')}
          />
        )}

        {currentScreen === 'expeditions' && (
          <ExpeditionsScreen
            expeditions={expeditions}
            unlockedMilestoneIds={unlockedMilestoneIds}
            onStartNewQuest={() => setCurrentScreen('setup')}
            onDeleteExpedition={async (id) => {
              const updated = expeditions.filter((e) => e.id !== id);
              setExpeditions(updated);
              // Re-save or clear
              if (updated.length === 0) {
                await storageService.clearAllData();
              } else {
                localStorage.setItem(
                  'sidequest_expeditions',
                  JSON.stringify(updated)
                );
              }
            }}
          />
        )}

        {currentScreen === 'ailab' && (
          <AILabScreen
            modelStatus={modelStatus}
            onRefreshModelStatus={() => setModelStatus(modelManager.getStatus())}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            modelStatus={modelStatus}
            expeditions={expeditions}
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
            onDataCleared={handleDataCleared}
          />
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-[#E7E0D5] dark:border-[#24352B] py-6 text-center text-xs font-mono-journal text-[#849188]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SIDEQUEST · MLH/Hacktoberfest 2026 Open-Source AI Challenge</span>
          <span>Open-weight sentence transformer · Zero cloud tracking</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
