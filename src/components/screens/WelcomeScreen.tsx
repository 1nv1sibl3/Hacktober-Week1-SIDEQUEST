import React from 'react';
import { Compass, Sparkles, Shield, ArrowRight, Eye, Radio, Smartphone, Award } from 'lucide-react';
import { ModelStatus } from '../../types';

interface WelcomeScreenProps {
  onStartQuest: () => void;
  onResumeQuest?: () => void;
  onOpenJournal: () => void;
  onOpenAILab: () => void;
  activeQuestTitle?: string;
  expeditionCount: number;
  modelStatus: ModelStatus;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartQuest,
  onResumeQuest,
  onOpenJournal,
  onOpenAILab,
  activeQuestTitle,
  expeditionCount,
  modelStatus
}) => {
  return (
    <div className="space-y-10 py-6 sm:py-10 max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="field-paper-elevated rounded-2xl p-6 sm:p-10 relative overflow-hidden bg-gradient-to-br from-white to-[#F9EFE6]/40 dark:from-[#15201A] dark:to-[#1A2820]/60">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C87D32]/5 dark:bg-[#C87D32]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2EC] dark:bg-[#1A2820] text-[#163324] dark:text-[#A3B5AA] text-xs font-mono-journal font-semibold border border-[#2E5339]/20">
            <Sparkles className="w-3.5 h-3.5 text-[#C87D32]" />
            MLH / Hacktoberfest 2026 · Week 1: "Touch Grass"
          </div>

          <div className="space-y-3">
            <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-[#163324] dark:text-[#E8EDE9] leading-tight">
              Leave your screen behind. <br />
              <span className="text-[#C87D32] italic font-normal">Observe what is already here.</span>
            </h1>
            <p className="text-base sm:text-lg text-[#57635C] dark:text-[#A3B5AA] max-w-2xl leading-relaxed">
              SIDEQUEST is a real-world outdoor exploration game. Receive an investigation tailored by open-weight AI, put your phone in your pocket, explore your surroundings, and return to record field notes.
            </p>
          </div>

          {/* Philosophy Card */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#0E1511] border-l-4 border-[#C87D32] text-sm text-[#1C2621] dark:text-[#E8EDE9] italic font-editorial">
            "The screen should help someone enter the world, not compete with it."
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {activeQuestTitle && onResumeQuest ? (
              <button
                onClick={onResumeQuest}
                className="px-6 py-3.5 rounded-xl bg-[#C87D32] text-white font-medium hover:bg-[#b06a28] transition-all flex items-center gap-2 shadow-sm shadow-[#C87D32]/30 text-sm sm:text-base"
              >
                <Compass className="w-5 h-5 animate-spin" />
                Resume Quest: {activeQuestTitle}
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                onClick={onStartQuest}
                className="px-6 py-3.5 rounded-xl bg-[#163324] dark:bg-[#2A563C] text-white font-medium hover:bg-[#2E5339] dark:hover:bg-[#3E7352] transition-all flex items-center gap-2 shadow-sm text-sm sm:text-base cursor-pointer"
              >
                <Compass className="w-5 h-5 text-[#C87D32]" />
                Begin New Expedition
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            )}

            {expeditionCount > 0 && (
              <button
                onClick={onOpenJournal}
                className="px-5 py-3.5 rounded-xl bg-white dark:bg-[#15201A] border border-[#E7E0D5] dark:border-[#24352B] text-[#1C2621] dark:text-[#E8EDE9] font-medium hover:bg-[#FAF7F2] dark:hover:bg-[#1A2820] transition-colors text-sm flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-[#C87D32]" />
                Field Journal ({expeditionCount})
              </button>
            )}

            <button
              onClick={onOpenAILab}
              className="px-4 py-3.5 rounded-xl text-xs sm:text-sm text-[#57635C] dark:text-[#A3B5AA] hover:text-[#163324] dark:hover:text-white transition-colors"
            >
              Inspect Model Diagnostics →
            </button>
          </div>
        </div>
      </div>

      {/* The Evolving Exploration Loop */}
      <div className="space-y-4">
        <h2 className="font-editorial text-xl font-bold text-[#163324] dark:text-[#E8EDE9]">
          The Evolving Exploration Loop
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="field-paper p-5 rounded-xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#EBF2EC] dark:bg-[#1A2820] flex items-center justify-center text-[#163324] dark:text-[#A3B5AA] font-mono-journal text-xs font-bold">
              01
            </div>
            <h3 className="font-editorial font-bold text-base text-[#163324] dark:text-[#E8EDE9]">
              Set Intent & Local AI Matching
            </h3>
            <p className="text-xs text-[#57635C] dark:text-[#A3B5AA] leading-relaxed">
              Choose your time (5–30 min), mood, and environment. A local open-weight sentence transformer computes embeddings in your browser to rank 36+ curated investigations.
            </p>
          </div>

          <div className="field-paper p-5 rounded-xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#F9EFE6] dark:bg-[#281D14] flex items-center justify-center text-[#C87D32] font-mono-journal text-xs font-bold">
              02
            </div>
            <h3 className="font-editorial font-bold text-base text-[#163324] dark:text-[#E8EDE9]">
              Pocket Mode: Off-Screen Focus
            </h3>
            <p className="text-xs text-[#57635C] dark:text-[#A3B5AA] leading-relaxed">
              Read or listen to your briefing once, then lock your device and put it away. No maps, no feeds, and no notifications. Just pure, unmediated observation.
            </p>
          </div>

          <div className="field-paper p-5 rounded-xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#EBF2EC] dark:bg-[#1A2820] flex items-center justify-center text-[#163324] dark:text-[#A3B5AA] font-mono-journal text-xs font-bold">
              03
            </div>
            <h3 className="font-editorial font-bold text-base text-[#163324] dark:text-[#E8EDE9]">
              Field Notes & Discovery Insight
            </h3>
            <p className="text-xs text-[#57635C] dark:text-[#A3B5AA] leading-relaxed">
              Return and record what you noticed. The local Discovery Engine connects your observation to ecological phenomena and suggests a personalized follow-up quest.
            </p>
          </div>
        </div>
      </div>

      {/* Trust & Open-Source AI Badges */}
      <div className="field-paper p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#57635C] dark:text-[#A3B5AA]">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong>100% Client-Side Privacy:</strong> Zero telemetry, no cloud backend required. Your field notes and photos stay strictly in IndexedDB.
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono-journal text-[11px] shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Model: Xenova/all-MiniLM-L6-v2 (Apache 2.0)</span>
        </div>
      </div>
    </div>
  );
};
