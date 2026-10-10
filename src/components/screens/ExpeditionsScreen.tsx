import React, { useState } from 'react';
import {
  Compass,
  Award,
  Calendar,
  Clock,
  MapPin,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  ArrowRight,
  Sprout,
  Ear,
  ThermometerSun,
  Hourglass,
  Moon,
  Search
} from 'lucide-react';
import { FieldObservation, CuriosityMilestone } from '../../types';
import { CURIOSITY_MILESTONES } from '../../data/milestones';

interface ExpeditionsScreenProps {
  expeditions: FieldObservation[];
  unlockedMilestoneIds: string[];
  onStartNewQuest: () => void;
  onDeleteExpedition: (id: string) => void;
}

export const ExpeditionsScreen: React.FC<ExpeditionsScreenProps> = ({
  expeditions,
  unlockedMilestoneIds,
  onStartNewQuest,
  onDeleteExpedition
}) => {
  const [filterEnvironment, setFilterEnvironment] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalMinutesExplored = expeditions.reduce(
    (acc, exp) => acc + Math.round(exp.actualElapsedSeconds / 60),
    0
  );

  const filtered = expeditions.filter((exp) => {
    if (filterEnvironment === 'all') return true;
    return exp.environment === filterEnvironment;
  });

  // Calculate distinct themes explored
  const allThemes = new Set<string>();
  expeditions.forEach((exp) => {
    if (exp.discoveryCard?.matchedThemes) {
      exp.discoveryCard.matchedThemes.forEach((t) => allThemes.add(t));
    }
  });

  const getMilestoneIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass':
        return <Compass className="w-5 h-5 text-[#C87D32]" />;
      case 'Sprout':
        return <Sprout className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'Ear':
        return <Ear className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />;
      case 'ThermometerSun':
        return <ThermometerSun className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'Hourglass':
        return <Hourglass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-[#C87D32]" />;
      case 'Moon':
        return <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      default:
        return <Award className="w-5 h-5 text-[#C87D32]" />;
    }
  };

  return (
    <div className="space-y-10 py-4 sm:py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono-journal text-[#C87D32] uppercase tracking-wider font-semibold">
            <Compass className="w-3.5 h-3.5" />
            Exploration Memory · Personal Field Archives
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#163324] dark:text-[#E8EDE9]">
            My Expeditions
          </h1>
          <p className="text-xs sm:text-sm text-[#57635C] dark:text-[#A3B5AA]">
            A permanent record of what you noticed in the wild. Stored entirely in your browser.
          </p>
        </div>

        <button
          onClick={onStartNewQuest}
          className="px-5 py-3 rounded-xl bg-[#163324] dark:bg-[#2A563C] text-white font-medium hover:bg-[#2E5339] dark:hover:bg-[#3E7352] transition-colors flex items-center gap-2 text-xs sm:text-sm shrink-0 self-start sm:self-center cursor-pointer"
        >
          <Compass className="w-4 h-4 text-[#C87D32]" />
          <span>New Expedition</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="field-paper p-4 rounded-xl space-y-1 text-center">
          <span className="text-[11px] font-mono-journal uppercase text-[#849188]">
            Investigations
          </span>
          <div className="font-editorial text-2xl sm:text-3xl font-bold text-[#163324] dark:text-[#E8EDE9]">
            {expeditions.length}
          </div>
          <span className="text-[10px] text-[#57635C] dark:text-[#A3B5AA]">Completed</span>
        </div>

        <div className="field-paper p-4 rounded-xl space-y-1 text-center">
          <span className="text-[11px] font-mono-journal uppercase text-[#849188]">
            Off-Screen Time
          </span>
          <div className="font-editorial text-2xl sm:text-3xl font-bold text-[#C87D32]">
            {totalMinutesExplored}
          </div>
          <span className="text-[10px] text-[#57635C] dark:text-[#A3B5AA]">Minutes outside</span>
        </div>

        <div className="field-paper p-4 rounded-xl space-y-1 text-center">
          <span className="text-[11px] font-mono-journal uppercase text-[#849188]">
            Curiosity Themes
          </span>
          <div className="font-editorial text-2xl sm:text-3xl font-bold text-[#2E5339] dark:text-[#A3B5AA]">
            {allThemes.size}
          </div>
          <span className="text-[10px] text-[#57635C] dark:text-[#A3B5AA]">Distinct domains</span>
        </div>

        <div className="field-paper p-4 rounded-xl space-y-1 text-center">
          <span className="text-[11px] font-mono-journal uppercase text-[#849188]">
            Milestones
          </span>
          <div className="font-editorial text-2xl sm:text-3xl font-bold text-[#163324] dark:text-[#E8EDE9]">
            {unlockedMilestoneIds.length} / {CURIOSITY_MILESTONES.length}
          </div>
          <span className="text-[10px] text-[#57635C] dark:text-[#A3B5AA]">Badges unlocked</span>
        </div>
      </div>

      {/* Curiosity Milestones Showcase */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono-journal uppercase tracking-wider font-bold text-[#163324] dark:text-[#E8EDE9] flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#C87D32]" />
          Curiosity Milestones & Badges
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CURIOSITY_MILESTONES.map((badge) => {
            const isUnlocked = unlockedMilestoneIds.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-xl border transition-all text-center space-y-1.5 ${
                  isUnlocked
                    ? 'bg-white dark:bg-[#15201A] border-[#C87D32]/40 shadow-sm'
                    : 'bg-[#FAF7F2]/60 dark:bg-[#0E1511]/40 border-[#E7E0D5]/50 dark:border-[#24352B]/50 opacity-50 grayscale'
                }`}
              >
                <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center bg-[#FAF7F2] dark:bg-[#0E1511] border border-[#E7E0D5] dark:border-[#24352B]">
                  {getMilestoneIcon(badge.iconName)}
                </div>
                <div className="font-editorial font-bold text-xs sm:text-sm text-[#163324] dark:text-[#E8EDE9]">
                  {badge.title}
                </div>
                <p className="text-[11px] text-[#57635C] dark:text-[#A3B5AA] line-clamp-2">
                  {badge.description}
                </p>
                {isUnlocked && (
                  <span className="inline-block text-[10px] font-mono-journal text-[#C87D32] font-semibold">
                    ★ Unlocked
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Exploration Timeline */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-xs font-mono-journal uppercase tracking-wider font-bold text-[#163324] dark:text-[#E8EDE9] flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#C87D32]" />
            Discovery Timeline ({filtered.length})
          </h2>

          {/* Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <span className="text-[#849188] font-mono-journal text-[11px] mr-1">Filter:</span>
            {['all', 'campus', 'garden', 'neighborhood', 'park', 'anywhere'].map((env) => (
              <button
                key={env}
                onClick={() => setFilterEnvironment(env)}
                className={`px-2.5 py-1 rounded-md capitalize font-mono-journal text-xs transition-colors cursor-pointer ${
                  filterEnvironment === env
                    ? 'bg-[#163324] text-white dark:bg-[#2A563C]'
                    : 'bg-[#FAF7F2] dark:bg-[#0E1511] text-[#57635C] dark:text-[#A3B5AA] hover:bg-[#E7E0D5]'
                }`}
              >
                {env}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="field-paper rounded-2xl p-10 text-center space-y-4">
            <Compass className="w-10 h-10 text-[#C87D32] mx-auto opacity-70" />
            <div className="space-y-1">
              <h3 className="font-editorial text-lg font-bold text-[#163324] dark:text-[#E8EDE9]">
                No field notes recorded yet
              </h3>
              <p className="text-xs text-[#57635C] dark:text-[#A3B5AA] max-w-sm mx-auto">
                Step outside for 5–10 minutes and capture your first observation to unlock discovery cards.
              </p>
            </div>
            <button
              onClick={onStartNewQuest}
              className="px-5 py-2.5 rounded-xl bg-[#163324] dark:bg-[#2A563C] text-white font-medium text-xs sm:text-sm hover:bg-[#2E5339] transition-colors cursor-pointer"
            >
              Start First Investigation
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((exp) => {
              const isExpanded = expandedId === exp.id;
              const dateStr = new Date(exp.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={exp.id}
                  className="field-paper-elevated rounded-xl p-5 sm:p-6 space-y-4 transition-all"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7E0D5] dark:border-[#24352B] pb-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono-journal font-semibold bg-[#EBF2EC] dark:bg-[#1A2820] text-[#2E5339] dark:text-[#A3B5AA]">
                          {exp.environment}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono-journal bg-[#F9EFE6] dark:bg-[#281D14] text-[#C87D32]">
                          {Math.round(exp.actualElapsedSeconds / 60)} min explored
                        </span>
                        {exp.optInLocation?.label && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono-journal bg-white dark:bg-[#15201A] text-[#57635C] dark:text-[#A3B5AA] border border-[#E7E0D5] flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" />
                            {exp.optInLocation.label}
                          </span>
                        )}
                      </div>
                      <h3 className="font-editorial text-xl font-bold text-[#163324] dark:text-[#E8EDE9]">
                        {exp.missionTitle}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono-journal text-[#849188]">
                      <span>{dateStr}</span>
                      <button
                        onClick={() => onDeleteExpedition(exp.id)}
                        className="p-1 rounded text-[#849188] hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete this observation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* User Notes Column */}
                    <div className={`space-y-3 ${exp.photoDataUrl ? 'md:col-span-3' : 'md:col-span-4'}`}>
                      <div>
                        <span className="text-[11px] font-mono-journal uppercase text-[#849188] font-semibold block mb-1">
                          Field Observation
                        </span>
                        <p className="text-xs sm:text-sm text-[#1C2621] dark:text-[#E8EDE9] leading-relaxed font-editorial italic bg-[#FAF7F2] dark:bg-[#0E1511] p-3.5 rounded-lg border border-[#E7E0D5] dark:border-[#24352B]">
                          "{exp.userNotes}"
                        </p>
                      </div>

                      {/* Surprising finding if present */}
                      {exp.surprisingFinding && (
                        <div className="text-xs text-[#57635C] dark:text-[#A3B5AA]">
                          <strong className="font-mono-journal text-[10px] uppercase text-[#163324] dark:text-[#E8EDE9] block">
                            Surprise:
                          </strong>
                          <span>{exp.surprisingFinding}</span>
                        </div>
                      )}
                    </div>

                    {/* Photo thumbnail if present */}
                    {exp.photoDataUrl && (
                      <div className="md:col-span-1">
                        <img
                          src={exp.photoDataUrl}
                          alt="Field photograph"
                          className="w-full h-32 rounded-lg object-cover border border-[#E7E0D5] dark:border-[#24352B]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Discovery Card Accordion Preview */}
                  {exp.discoveryCard && (
                    <div className="border-t border-[#E7E0D5] dark:border-[#24352B] pt-3">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                        className="w-full flex items-center justify-between text-xs font-mono-journal text-[#C87D32] hover:text-[#b06a28] cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5 font-semibold">
                          <Sparkles className="w-3.5 h-3.5" />
                          {isExpanded ? 'Hide Discovery Card' : 'View AI Discovery Card & Interpretation'}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-3 p-4 rounded-xl bg-[#EBF2EC]/40 dark:bg-[#1A2820]/40 border border-[#2E5339]/20 space-y-3 text-xs">
                          <div>
                            <strong className="block font-mono-journal text-[10px] uppercase text-[#2E5339] dark:text-[#A3B5AA] mb-0.5">
                              Ecological Context:
                            </strong>
                            <p className="text-[#1C2621] dark:text-[#E8EDE9] leading-relaxed">
                              {exp.discoveryCard.interpretiveInsight}
                            </p>
                          </div>

                          <div>
                            <strong className="block font-mono-journal text-[10px] uppercase text-[#C87D32] mb-0.5">
                              Inquiry Question:
                            </strong>
                            <p className="font-editorial italic text-[#1C2621] dark:text-[#E8EDE9]">
                              "{exp.discoveryCard.curiosityQuestion}"
                            </p>
                          </div>

                          <div className="text-[10px] font-mono-journal text-[#849188] pt-1 flex items-center justify-between">
                            <span>Synthesized via: {exp.discoveryCard.modelAttribution.modelName}</span>
                            <span>Match: {(exp.discoveryCard.confidenceScore * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
