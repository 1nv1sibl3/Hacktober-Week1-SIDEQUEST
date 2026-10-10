import React from 'react';
import { Compass, BookOpen, Cpu, Settings, Moon, Sun, ShieldCheck } from 'lucide-react';
import { ModelStatus } from '../types';

interface NavbarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  modelStatus: ModelStatus;
  activeQuestTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  isDarkMode,
  onToggleDarkMode,
  modelStatus,
  activeQuestTitle
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E7E0D5] dark:border-[#24352B] bg-[#FAF7F2]/95 dark:bg-[#0E1511]/95 backdrop-blur-md transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => onNavigate('welcome')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#163324] dark:bg-[#2A563C] text-[#FAF7F2] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-[#C87D32]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-editorial text-xl font-bold tracking-tight text-[#163324] dark:text-[#E8EDE9]">
                SIDEQUEST
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono-journal uppercase tracking-wider font-semibold rounded bg-[#EBF2EC] dark:bg-[#1A2820] text-[#2E5339] dark:text-[#A3B5AA] border border-[#2E5339]/20">
                Touch Grass
              </span>
            </div>
            <p className="text-[11px] text-[#57635C] dark:text-[#A3B5AA] hidden sm:block">
              Open-Source AI Outdoor Exploration
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onNavigate(activeQuestTitle ? 'pocket' : 'setup')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${
              currentScreen === 'setup' || currentScreen === 'briefing' || currentScreen === 'pocket'
                ? 'bg-[#163324] text-white dark:bg-[#2A563C]'
                : 'text-[#57635C] dark:text-[#A3B5AA] hover:bg-[#EBF2EC] dark:hover:bg-[#1A2820]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="hidden xs:inline">
              {activeQuestTitle ? 'Active Quest' : 'Explore'}
            </span>
          </button>

          <button
            onClick={() => onNavigate('expeditions')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${
              currentScreen === 'expeditions' || currentScreen === 'journal' || currentScreen === 'discovery'
                ? 'bg-[#163324] text-white dark:bg-[#2A563C]'
                : 'text-[#57635C] dark:text-[#A3B5AA] hover:bg-[#EBF2EC] dark:hover:bg-[#1A2820]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden xs:inline">Journal</span>
          </button>

          <button
            onClick={() => onNavigate('ailab')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${
              currentScreen === 'ailab'
                ? 'bg-[#163324] text-white dark:bg-[#2A563C]'
                : 'text-[#57635C] dark:text-[#A3B5AA] hover:bg-[#EBF2EC] dark:hover:bg-[#1A2820]'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span className="hidden xs:inline">AI Lab</span>
            {modelStatus.loaded && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block" />
            )}
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className={`p-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              currentScreen === 'settings'
                ? 'bg-[#163324] text-white dark:bg-[#2A563C]'
                : 'text-[#57635C] dark:text-[#A3B5AA] hover:bg-[#EBF2EC] dark:hover:bg-[#1A2820]'
            }`}
            title="Settings & Privacy"
          >
            <Settings className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-[#E7E0D5] dark:bg-[#24352B] mx-1" />

          {/* Dark mode toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-[#57635C] dark:text-[#A3B5AA] hover:bg-[#EBF2EC] dark:hover:bg-[#1A2820] transition-colors"
            title={isDarkMode ? 'Switch to Warm Parchment' : 'Switch to Nocturnal Ink'}
            aria-label="Toggle visual theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-[#C87D32]" /> : <Moon className="w-4 h-4" />}
          </button>
        </nav>
      </div>

      {/* Active Quest Bar if running */}
      {activeQuestTitle && currentScreen !== 'pocket' && (
        <div
          onClick={() => onNavigate('pocket')}
          className="bg-[#C87D32] text-white text-xs py-1 px-4 text-center cursor-pointer hover:bg-[#b06a28] transition-colors flex items-center justify-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>Investigation in progress: <strong>{activeQuestTitle}</strong>. Tap to return to Pocket Mode.</span>
        </div>
      )}
    </header>
  );
};
