import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Compass,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { DiscoveryCard, Mission } from '../../types';
import { MISSION_MAP } from '../../data/missions';

interface DiscoveryCardScreenProps {
  card: DiscoveryCard;
  onAcceptNextMission: (missionId: string) => void;
  onViewJournal: () => void;
}

export const DiscoveryCardScreen: React.FC<DiscoveryCardScreenProps> = ({
  card,
  onAcceptNextMission,
  onViewJournal
}) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#163324', '#C87D32', '#2E5339', '#FAF7F2']
      });
    } catch (_) {}
  }, []);

  const nextMission = MISSION_MAP.get(card.suggestedNextMissionId);

  return (
    <div className="space-y-8 py-4 sm:py-8 max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2EC] dark:bg-[#1A2820] text-[#2E5339] dark:text-[#A3B5AA] text-xs font-mono-journal font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#C87D32]" />
          <span>Local AI Synthesis Complete</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#163324] dark:text-[#E8EDE9]">
          Discovery Card
        </h1>
        <p className="text-xs sm:text-sm text-[#57635C] dark:text-[#A3B5AA]">
          Grounded pattern interpretation based on your outdoor field notes.
        </p>
      </div>

      {/* The Physical-feeling Deckled Discovery Card */}
      <div className="field-paper-elevated rounded-2xl p-6 sm:p-10 space-y-8 relative overflow-hidden border-2 border-[#C4B9A7] dark:border-[#3D5546]">
        {/* Card Header Stamp */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-[#E7E0D5] dark:border-[#24352B] pb-5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#163324] text-white flex items-center justify-center font-mono-journal text-xs font-bold">
              SQ
            </span>
            <div>
              <span className="text-xs font-mono-journal uppercase tracking-widest text-[#163324] dark:text-[#E8EDE9] font-bold block">
                Field Intelligence Card
              </span>
              <span className="text-[10px] text-[#849188] font-mono-journal">
                ID: {card.id.substring(0, 14)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-mono-journal font-semibold bg-[#F9EFE6] dark:bg-[#281D14] text-[#C87D32]">
              Semantic Match: {(card.confidenceScore * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Section 1: What You Observed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono-journal uppercase tracking-wider font-bold text-[#163324] dark:text-[#E8EDE9] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#C87D32]" />
              What You Observed
            </h2>
            <span className="text-[10px] font-mono-journal text-[#849188] italic">
              (Primary field notes)
            </span>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#0E1511] border border-[#E7E0D5] dark:border-[#24352B] text-sm text-[#1C2621] dark:text-[#E8EDE9] leading-relaxed font-editorial">
            "{card.observationSummary}"
          </div>
        </div>

        {/* Section 2: Why It May Be Interesting */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono-journal uppercase tracking-wider font-bold text-[#2E5339] dark:text-[#A3B5AA] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C87D32]" />
              Ecological Context & Interpretive Insight
            </h2>
            <span className="text-[10px] font-mono-journal text-[#849188] italic">
              (Model interpretation · Not scientifically verified)
            </span>
          </div>
          <div className="p-4 sm:p-5 rounded-xl bg-[#EBF2EC]/40 dark:bg-[#1A2820]/40 border border-[#2E5339]/20 text-xs sm:text-sm text-[#1C2621] dark:text-[#E8EDE9] leading-relaxed space-y-3">
            <p>{card.interpretiveInsight}</p>
            {card.matchedThemes.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {card.matchedThemes.map((theme, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-[10px] font-mono-journal bg-white dark:bg-[#15201A] text-[#2E5339] dark:text-[#A3B5AA] border border-[#2E5339]/20"
                  >
                    #{theme}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Follow-Up Inquiry Question */}
        <div className="space-y-2">
          <h2 className="text-xs font-mono-journal uppercase tracking-wider font-bold text-[#C87D32] flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            Follow-Up Curiosity Question
          </h2>
          <div className="p-4 rounded-xl bg-[#F9EFE6]/50 dark:bg-[#281D14]/50 border border-[#C87D32]/20 text-xs sm:text-sm text-[#1C2621] dark:text-[#E8EDE9] font-editorial italic leading-relaxed">
            "{card.curiosityQuestion}"
          </div>
        </div>

        {/* Section 4: Suggested Next Mission */}
        {nextMission && (
          <div className="space-y-3 pt-2 border-t border-[#E7E0D5] dark:border-[#24352B]">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono-journal uppercase tracking-wider font-bold text-[#163324] dark:text-[#E8EDE9] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#C87D32]" />
                Personalized Next Mission
              </h2>
              <span className="text-[11px] font-mono-journal text-[#C87D32]">
                Evolved from your notes
              </span>
            </div>

            <div className="p-5 rounded-xl bg-[#FAF7F2] dark:bg-[#0E1511] border border-[#E7E0D5] dark:border-[#24352B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono-journal bg-[#EBF2EC] dark:bg-[#1A2820] text-[#2E5339] dark:text-[#A3B5AA]">
                    {nextMission.duration} min
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono-journal bg-white dark:bg-[#15201A] text-[#57635C] dark:text-[#A3B5AA] border border-[#E7E0D5] dark:border-[#24352B]">
                    {nextMission.difficulty}
                  </span>
                </div>
                <h3 className="font-editorial text-lg font-bold text-[#163324] dark:text-[#E8EDE9]">
                  {nextMission.title}
                </h3>
                <p className="text-xs text-[#57635C] dark:text-[#A3B5AA] line-clamp-2">
                  {nextMission.objective}
                </p>
              </div>

              <button
                onClick={() => onAcceptNextMission(nextMission.id)}
                className="px-5 py-3 rounded-xl bg-[#163324] dark:bg-[#2A563C] text-white font-medium hover:bg-[#2E5339] dark:hover:bg-[#3E7352] transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm shrink-0 cursor-pointer"
              >
                <span>Accept Mission</span>
                <ArrowRight className="w-4 h-4 text-[#C87D32]" />
              </button>
            </div>
          </div>
        )}

        {/* Section 5: Model Transparency Footnote */}
        <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#0E1511] text-[11px] font-mono-journal text-[#849188] flex flex-wrap items-center justify-between gap-2 border border-[#E7E0D5] dark:border-[#24352B]">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Model: {card.modelAttribution.modelName}</span>
          </div>
          <div>
            <span>Inference: {card.modelAttribution.inferenceTimeMs}ms (Local WebAssembly)</span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onViewJournal}
          className="px-5 py-2.5 rounded-xl border border-[#E7E0D5] dark:border-[#24352B] bg-white dark:bg-[#15201A] text-xs sm:text-sm font-medium text-[#1C2621] dark:text-[#E8EDE9] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
        >
          View All Expeditions & Badges
        </button>

        {nextMission && (
          <button
            onClick={() => onAcceptNextMission(nextMission.id)}
            className="px-5 py-2.5 rounded-xl bg-[#C87D32] text-white text-xs sm:text-sm font-medium hover:bg-[#b06a28] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Start Next Mission Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
