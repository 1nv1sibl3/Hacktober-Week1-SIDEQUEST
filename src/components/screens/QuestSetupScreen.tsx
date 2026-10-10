import React, { useState, useEffect } from 'react';
import {
  Clock,
  Compass,
  MapPin,
  Sparkles,
  ArrowRight,
  Sliders,
  CheckCircle2,
  ChevronRight,
  Flame,
  Brain
} from 'lucide-react';
import {
  MissionDuration,
  MissionMood,
  MissionEnvironment,
  UserPreferences,
  ScoredMission,
  ModelStatus
} from '../../types';
import { rankMissions } from '../../services/ai/missionSelector';

interface QuestSetupScreenProps {
  initialPreferences: UserPreferences;
  completedMissionIds: Set<string>;
  onSelectMission: (mission: ScoredMission, prefs: UserPreferences) => void;
  modelStatus: ModelStatus;
}

export const QuestSetupScreen: React.FC<QuestSetupScreenProps> = ({
  initialPreferences,
  completedMissionIds,
  onSelectMission,
  modelStatus
}) => {
  const [duration, setDuration] = useState<MissionDuration>(initialPreferences.duration);
  const [mood, setMood] = useState<MissionMood>(initialPreferences.mood);
  const [environment, setEnvironment] = useState<MissionEnvironment>(initialPreferences.environment);
  const [freeformInterests, setFreeformInterests] = useState(initialPreferences.freeformInterests);

  const [rankedResults, setRankedResults] = useState<ScoredMission[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  // Re-rank whenever preferences change
  useEffect(() => {
    let isCancelled = false;
    const compute = async () => {
      setIsSearching(true);
      try {
        const prefs: UserPreferences = {
          duration,
          mood,
          environment,
          freeformInterests
        };
        const results = await rankMissions(prefs, completedMissionIds);
        if (!isCancelled) {
          setRankedResults(results);
          setSelectedIdx(0);
        }
      } catch (err) {
        console.error('Ranking error:', err);
      } finally {
        if (!isCancelled) setIsSearching(false);
      }
    };

    const timer = setTimeout(compute, 250);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [duration, mood, environment, freeformInterests, completedMissionIds]);

  const durations: { value: MissionDuration; label: string; desc: string }[] = [
    { value: 5, label: '5 min', desc: 'Micro-break' },
    { value: 10, label: '10 min', desc: 'Quick survey' },
    { value: 15, label: '15 min', desc: 'Standard walk' },
    { value: 30, label: '30 min', desc: 'Deep focus' }
  ];

  const moods: { value: MissionMood; label: string; emoji: string }[] = [
    { value: 'curious', label: 'Curious', emoji: '🔍' },
    { value: 'calm', label: 'Calm', emoji: '🍃' },
    { value: 'adventurous', label: 'Adventurous', emoji: '🧭' },
    { value: 'scientific', label: 'Scientific', emoji: '🔬' },
    { value: 'creative', label: 'Creative', emoji: '🎨' },
    { value: 'observant', label: 'Observant', emoji: '👁️' }
  ];

  const environments: { value: MissionEnvironment; label: string; desc: string }[] = [
    { value: 'campus', label: 'Campus', desc: 'Academic quads, corridors, paving' },
    { value: 'garden', label: 'Garden', desc: 'Flowerbeds, pots, lawn corners' },
    { value: 'neighborhood', label: 'Neighborhood', desc: 'Streets, curbs, boundary walls' },
    { value: 'park', label: 'Park', desc: 'Trees, lawns, public benches' },
    { value: 'anywhere', label: 'Anywhere', desc: 'Balcony, porch, or immediate sidewalk' }
  ];

  const currentPrefs: UserPreferences = {
    duration,
    mood,
    environment,
    freeformInterests
  };

  const topMission = rankedResults[selectedIdx] || rankedResults[0];

  return (
    <div className="space-y-8 py-4 sm:py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-xs font-mono-journal text-[#C87D32] uppercase tracking-wider font-semibold">
            <Sliders className="w-3.5 h-3.5" />
            Step 1 · Tailor Your Investigation
          </div>
          <div className="text-[11px] font-mono-journal text-[#57635C] dark:text-[#A3B5AA] flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{modelStatus.isFallback ? 'Deterministic Scorer' : 'Local all-MiniLM-L6-v2'}</span>
          </div>
        </div>
        <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-[#163324] dark:text-[#E8EDE9]">
          Configure Your Mission Parameters
        </h1>
        <p className="text-sm text-[#57635C] dark:text-[#A3B5AA]">
          Tell your local AI companion how much time you have and what kind of attention you want to cultivate.
        </p>
      </div>

      {/* Preferences Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Duration & Environment */}
        <div className="space-y-6">
          {/* Duration */}
          <div className="field-paper p-5 rounded-xl space-y-3">
            <label className="block text-xs font-mono-journal uppercase tracking-wider font-semibold text-[#163324] dark:text-[#E8EDE9] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C87D32]" />
              How much time do you have?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {durations.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDuration(d.value)}
                  className={`p-3 rounded-lg text-center transition-all cursor-pointer ${
                    duration === d.value
                      ? 'bg-[#163324] dark:bg-[#2A563C] text-white shadow-sm ring-2 ring-[#C87D32]/40'
                      : 'bg-[#FAF7F2] dark:bg-[#0E1511] text-[#1C2621] dark:text-[#E8EDE9] hover:bg-[#EBF2EC] dark:hover:bg-[#1A2820]'
                  }`}
                >
                  <div className="font-editorial text-base font-bold">{d.label}</div>
                  <div className="text-[10px] opacity-75">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Environment */}
          <div className="field-paper p-5 rounded-xl space-y-3">
            <label className="block text-xs font-mono-journal uppercase tracking-wider font-semibold text-[#163324] dark:text-[#E8EDE9] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C87D32]" />
              Where are you exploring?
            </label>
            <div className="space-y-2">
              {environments.map((env) => (
                <button
                  key={env.value}
                  type="button"
                  onClick={() => setEnvironment(env.value)}
                  className={`w-full p-2.5 rounded-lg text-left flex items-center justify-between transition-all cursor-pointer ${
                    environment === env.value
                      ? 'bg-[#163324] dark:bg-[#2A563C] text-white shadow-sm ring-1 ring-[#C87D32]/40'
                      : 'bg-[#FAF7F2] dark:bg-[#0E1511] text-[#1C2621] dark:text-[#E8EDE9] hover:bg-[#EBF2EC] dark:hover:bg-[#1A2820]'
                  }`}
                >
                  <div>
                    <span className="font-medium text-xs sm:text-sm">{env.label}</span>
                    <span className="text-[11px] block opacity-75">{env.desc}</span>
                  </div>
                  {environment === env.value && <CheckCircle2 className="w-4 h-4 text-[#C87D32] shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Mood & Freeform Interests */}
        <div className="space-y-6">
          {/* Mood */}
          <div className="field-paper p-5 rounded-xl space-y-3">
            <label className="block text-xs font-mono-journal uppercase tracking-wider font-semibold text-[#163324] dark:text-[#E8EDE9] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#C87D32]" />
              What kind of experience do you want?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {moods.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value)}
                  className={`p-3 rounded-lg text-left transition-all cursor-pointer ${
                    mood === m.value
                      ? 'bg-[#163324] dark:bg-[#2A563C] text-white shadow-sm ring-2 ring-[#C87D32]/40'
                      : 'bg-[#FAF7F2] dark:bg-[#0E1511] text-[#1C2621] dark:text-[#E8EDE9] hover:bg-[#EBF2EC] dark:hover:bg-[#1A2820]'
                  }`}
                >
                  <div className="text-lg">{m.emoji}</div>
                  <div className="font-medium text-xs sm:text-sm mt-1">{m.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Free-text Interest / Observation */}
          <div className="field-paper p-5 rounded-xl space-y-2">
            <label
              htmlFor="recent-noticing"
              className="block text-xs font-mono-journal uppercase tracking-wider font-semibold text-[#163324] dark:text-[#E8EDE9] flex items-center justify-between"
            >
              <span>What have you noticed recently?</span>
              <span className="text-[10px] text-[#849188] font-normal normal-case">(Optional free-text)</span>
            </label>
            <textarea
              id="recent-noticing"
              rows={3}
              value={freeformInterests}
              onChange={(e) => setFreeformInterests(e.target.value)}
              placeholder="e.g. Yellow weeds in asphalt seams, wind rattling loose gates, wet soil smells after morning spray..."
              className="w-full text-xs sm:text-sm p-3 rounded-lg border border-[#E7E0D5] dark:border-[#24352B] bg-[#FAF7F2] dark:bg-[#0E1511] text-[#1C2621] dark:text-[#E8EDE9] placeholder-[#849188] focus:outline-none focus:ring-2 focus:ring-[#C87D32]/50 transition-all resize-none"
            />
            <p className="text-[11px] text-[#57635C] dark:text-[#A3B5AA]">
              Your text is embedded locally to calculate cosine similarity with all 36 missions in real time.
            </p>
          </div>
        </div>
      </div>

      {/* Ranked Mission Preview Card */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#163324] dark:text-[#E8EDE9] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C87D32]" />
            AI-Ranked Mission Selection
            {isSearching && <span className="text-xs font-mono-journal text-[#849188] animate-pulse">(Re-ranking...)</span>}
          </h2>
          <span className="text-xs font-mono-journal text-[#57635C] dark:text-[#A3B5AA]">
            {rankedResults.length} missions scored
          </span>
        </div>

        {topMission ? (
          <div className="field-paper-elevated rounded-2xl p-6 sm:p-8 space-y-6 border-l-4 border-[#C87D32]">
            {/* Mission Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7E0D5] dark:border-[#24352B] pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono-journal font-semibold bg-[#F9EFE6] dark:bg-[#281D14] text-[#C87D32]">
                    Match Rank #{selectedIdx + 1}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono-journal bg-[#EBF2EC] dark:bg-[#1A2820] text-[#2E5339] dark:text-[#A3B5AA]">
                    {topMission.mission.duration} mins
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono-journal bg-[#FAF7F2] dark:bg-[#0E1511] text-[#57635C] dark:text-[#A3B5AA] border border-[#E7E0D5] dark:border-[#24352B]">
                    {topMission.mission.difficulty}
                  </span>
                </div>
                <h3 className="font-editorial text-2xl font-bold text-[#163324] dark:text-[#E8EDE9]">
                  {topMission.mission.title}
                </h3>
              </div>

              {/* Semantic Score Pill */}
              <div className="text-left sm:text-right shrink-0">
                <div className="text-xs font-mono-journal text-[#57635C] dark:text-[#A3B5AA]">
                  Composite Fit
                </div>
                <div className="font-editorial text-2xl font-bold text-[#C87D32]">
                  {(topMission.totalScore * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Narrative Briefing Quote */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#0E1511] text-xs sm:text-sm text-[#57635C] dark:text-[#A3B5AA] italic font-editorial leading-relaxed border-l-2 border-[#163324] dark:border-[#2A563C]">
              "{topMission.mission.narrativeBriefing}"
            </div>

            {/* Objective Preview */}
            <div className="space-y-1">
              <span className="text-xs font-mono-journal uppercase tracking-wider text-[#163324] dark:text-[#E8EDE9] font-semibold">
                Objective:
              </span>
              <p className="text-sm font-medium text-[#1C2621] dark:text-[#E8EDE9]">
                {topMission.mission.objective}
              </p>
            </div>

            {/* Transparent Score Breakdown */}
            <div className="p-3 rounded-lg bg-[#EBF2EC]/50 dark:bg-[#1A2820]/40 text-[11px] font-mono-journal text-[#2E5339] dark:text-[#A3B5AA]">
              {topMission.scoreBreakdown}
            </div>

            {/* Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
              {/* Other Options tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs font-mono-journal text-[#849188] shrink-0">Other matches:</span>
                {rankedResults.slice(0, 4).map((res, i) => (
                  <button
                    key={res.mission.id}
                    onClick={() => setSelectedIdx(i)}
                    className={`px-2.5 py-1 rounded text-xs font-mono-journal shrink-0 transition-colors cursor-pointer ${
                      selectedIdx === i
                        ? 'bg-[#163324] text-white dark:bg-[#2A563C]'
                        : 'bg-[#FAF7F2] dark:bg-[#0E1511] text-[#57635C] dark:text-[#A3B5AA] hover:bg-[#E7E0D5]'
                    }`}
                  >
                    #{i + 1} {res.mission.title.split(' ')[0]}
                  </button>
                ))}
              </div>

              <button
                onClick={() => onSelectMission(topMission, currentPrefs)}
                className="px-6 py-3 rounded-xl bg-[#163324] dark:bg-[#2A563C] text-white font-medium hover:bg-[#2E5339] dark:hover:bg-[#3E7352] transition-all flex items-center justify-center gap-2 shadow-sm text-sm shrink-0 cursor-pointer"
              >
                Accept This Mission
                <ArrowRight className="w-4 h-4 ml-1 text-[#C87D32]" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-[#57635C]">
            Ranking missions...
          </div>
        )}
      </div>
    </div>
  );
};
