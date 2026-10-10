import React, { useState } from 'react';
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  Clock,
  ArrowRight,
  ArrowLeft,
  Compass,
  CheckCircle,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { Mission, UserPreferences } from '../../types';
import { pocketAudio } from '../../services/audio/pocketAudio';

interface MissionBriefingScreenProps {
  mission: Mission;
  preferences: UserPreferences;
  onEnterPocketMode: () => void;
  onBack: () => void;
}

export const MissionBriefingScreen: React.FC<MissionBriefingScreenProps> = ({
  mission,
  preferences,
  onEnterPocketMode,
  onBack
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      pocketAudio.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const textToRead = `Mission: ${mission.title}. Objective: ${mission.objective}. First clue: ${mission.clues[0]}. Second clue: ${mission.clues[1]}. Third clue: ${mission.clues[2]}. Safety note: ${mission.safetyNotice}.`;
      pocketAudio.speakText(textToRead, () => setIsSpeaking(false));
    }
  };

  const handleStart = () => {
    pocketAudio.stopSpeaking();
    pocketAudio.playChime(528); // Play gentle departure chime
    onEnterPocketMode();
  };

  return (
    <div className="space-y-8 py-4 sm:py-8 max-w-3xl mx-auto">
      {/* Top Navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-mono-journal text-[#57635C] dark:text-[#A3B5AA] hover:text-[#163324] dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Configuration
      </button>

      {/* Main Briefing Card */}
      <div className="field-paper-elevated rounded-2xl p-6 sm:p-10 space-y-8 relative overflow-hidden">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7E0D5] dark:border-[#24352B] pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono-journal font-semibold bg-[#EBF2EC] dark:bg-[#1A2820] text-[#2E5339] dark:text-[#A3B5AA]">
              {mission.duration} Minutes
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono-journal bg-[#FAF7F2] dark:bg-[#0E1511] text-[#57635C] dark:text-[#A3B5AA] border border-[#E7E0D5] dark:border-[#24352B]">
              Difficulty: {mission.difficulty}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono-journal bg-[#F9EFE6] dark:bg-[#281D14] text-[#C87D32]">
              Environment: {preferences.environment}
            </span>
          </div>

          {/* Audio Read-Aloud Button */}
          <button
            onClick={handleToggleSpeech}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono-journal flex items-center gap-1.5 transition-colors cursor-pointer ${
              isSpeaking
                ? 'bg-[#C87D32] text-white animate-pulse'
                : 'bg-[#FAF7F2] dark:bg-[#0E1511] text-[#57635C] dark:text-[#A3B5AA] hover:bg-[#EBF2EC] border border-[#E7E0D5] dark:border-[#24352B]'
            }`}
            title="Read mission briefing aloud"
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isSpeaking ? 'Stop Audio' : 'Read Aloud'}</span>
          </button>
        </div>

        {/* Title & Lore Briefing */}
        <div className="space-y-4">
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#163324] dark:text-[#E8EDE9]">
            {mission.title}
          </h1>

          <div className="p-4 sm:p-5 rounded-xl bg-[#FAF7F2] dark:bg-[#0E1511] border-l-4 border-[#C87D32] text-sm text-[#1C2621] dark:text-[#E8EDE9] leading-relaxed font-editorial italic">
            "{mission.narrativeBriefing}"
          </div>
        </div>

        {/* Main Objective */}
        <div className="space-y-2 bg-[#EBF2EC]/40 dark:bg-[#1A2820]/40 p-5 rounded-xl border border-[#2E5339]/20">
          <div className="text-xs font-mono-journal uppercase tracking-wider font-bold text-[#2E5339] dark:text-[#A3B5AA] flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#C87D32]" />
            Core Investigation Objective
          </div>
          <p className="font-editorial text-lg sm:text-xl font-bold text-[#163324] dark:text-[#E8EDE9] leading-snug">
            {mission.objective}
          </p>
        </div>

        {/* Three Observable Clues */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono-journal uppercase tracking-wider font-semibold text-[#163324] dark:text-[#E8EDE9] flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-[#C87D32]" />
            Three Observable Clues to Guide You
          </h2>
          <div className="space-y-2.5">
            {mission.clues.map((clue, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-[#FAF7F2] dark:bg-[#0E1511] border border-[#E7E0D5] dark:border-[#24352B] flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-[#163324] dark:bg-[#2A563C] text-white flex items-center justify-center font-mono-journal text-[11px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs sm:text-sm text-[#1C2621] dark:text-[#E8EDE9] leading-relaxed">
                  {clue}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Prominent Safety Shield Notice */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-[#281D14] border border-amber-200 dark:border-amber-900/50 flex items-start gap-3 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-5 h-5 text-[#C87D32] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-semibold block text-xs font-mono-journal uppercase tracking-wider">
              Safety & Outdoor Ethics
            </strong>
            <p className="text-xs leading-relaxed opacity-90">
              {mission.safetyNotice} Never touch unknown organisms, ingest wild flora, trespass on private property, or step into vehicle lanes.
            </p>
          </div>
        </div>

        {/* Launch Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#57635C] dark:text-[#A3B5AA] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#C87D32]" />
            <span>Target exploration duration: {mission.duration} minutes</span>
          </div>

          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#163324] dark:bg-[#2A563C] text-white font-medium hover:bg-[#2E5339] dark:hover:bg-[#3E7352] transition-all flex items-center justify-center gap-3 shadow-md shadow-[#163324]/20 text-base cursor-pointer"
          >
            <span>Enter Pocket Mode</span>
            <ArrowRight className="w-5 h-5 text-[#C87D32]" />
          </button>
        </div>
      </div>
    </div>
  );
};
