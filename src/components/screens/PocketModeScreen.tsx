import React, { useState, useEffect } from 'react';
import {
  Compass,
  Volume2,
  Bell,
  Clock,
  ArrowRight,
  Shield,
  Smartphone,
  Eye,
  X
} from 'lucide-react';
import { Mission } from '../../types';
import { pocketAudio } from '../../services/audio/pocketAudio';

interface PocketModeScreenProps {
  mission: Mission;
  startedAt: number;
  durationMinutes: number;
  onFinish: (elapsedSeconds: number) => void;
  onCancel: () => void;
}

export const PocketModeScreen: React.FC<PocketModeScreenProps> = ({
  mission,
  startedAt,
  durationMinutes,
  onFinish,
  onCancel
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [hasPlayedCompletionChime, setHasPlayedCompletionChime] = useState<boolean>(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Update timer using absolute timestamps so lock screen suspension doesn't drift
  useEffect(() => {
    const updateElapsed = () => {
      const now = Date.now();
      const seconds = Math.max(0, Math.floor((now - startedAt) / 1000));
      setElapsedSeconds(seconds);

      // Play completion chime once when target duration is reached
      const targetSeconds = durationMinutes * 60;
      if (seconds >= targetSeconds && !hasPlayedCompletionChime) {
        pocketAudio.playChime(528);
        setHasPlayedCompletionChime(true);
      }
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [startedAt, durationMinutes, hasPlayedCompletionChime]);

  const targetSeconds = durationMinutes * 60;
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / targetSeconds) * 100));

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTestChime = () => {
    pocketAudio.playChime(528);
  };

  const handleReadAloud = () => {
    pocketAudio.speakText(mission.objective);
  };

  return (
    <div className="py-8 sm:py-16 max-w-2xl mx-auto px-4 text-center space-y-10">
      {/* Pocket Mode Zen Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] dark:bg-[#0E1511] text-[#57635C] dark:text-[#A3B5AA] text-xs font-mono-journal border border-[#E7E0D5] dark:border-[#24352B]">
        <Smartphone className="w-3.5 h-3.5 text-[#C87D32]" />
        <span>Pocket Mode Active · Screenless Outdoor Investigation</span>
      </div>

      {/* Elapsed Time & Target Ring */}
      <div className="space-y-3">
        <div className="relative inline-flex items-center justify-center">
          {/* Subtle circular pulse */}
          <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full border border-[#E7E0D5] dark:border-[#24352B] flex flex-col items-center justify-center bg-white dark:bg-[#15201A] shadow-inner">
            <span className="text-[11px] font-mono-journal uppercase tracking-widest text-[#849188]">
              Elapsed Time
            </span>
            <span className="font-mono-journal text-4xl sm:text-5xl font-bold tracking-tight text-[#163324] dark:text-[#E8EDE9] my-1">
              {formatTime(elapsedSeconds)}
            </span>
            <span className="text-xs font-mono-journal text-[#C87D32]">
              Target: {durationMinutes} min ({progressPercent}%)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-48 sm:w-64 mx-auto bg-[#E7E0D5] dark:bg-[#24352B] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#C87D32] h-full transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Single Objective Card */}
      <div className="field-paper-elevated rounded-2xl p-6 sm:p-8 space-y-4 text-left border-t-4 border-[#163324] dark:border-[#2A563C]">
        <div className="flex items-center justify-between text-xs font-mono-journal text-[#849188]">
          <span>Current Mission</span>
          <button
            onClick={handleReadAloud}
            className="flex items-center gap-1 text-[#C87D32] hover:underline cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Listen
          </button>
        </div>

        <h2 className="font-editorial text-2xl font-bold text-[#163324] dark:text-[#E8EDE9]">
          {mission.title}
        </h2>

        <p className="font-editorial text-base sm:text-lg text-[#1C2621] dark:text-[#E8EDE9] leading-relaxed">
          {mission.objective}
        </p>

        {/* Gentle encouragement */}
        <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#0E1511] text-xs text-[#57635C] dark:text-[#A3B5AA] flex items-center gap-2.5">
          <Eye className="w-4 h-4 text-[#C87D32] shrink-0" />
          <span>Lock your screen now. Let your eyes adjust to natural light and notice what draws your attention.</span>
        </div>
      </div>

      {/* Honest Device Limitation Note */}
      <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#0E1511] border border-[#E7E0D5] dark:border-[#24352B] text-xs text-[#57635C] dark:text-[#A3B5AA] text-left space-y-1">
        <strong className="block text-[11px] font-mono-journal uppercase text-[#163324] dark:text-[#E8EDE9]">
          Hardware & Browser Note:
        </strong>
        <p className="leading-relaxed">
          Mobile operating systems suspend background browser timers when locked. Your investigation timer uses actual hardware clock timestamps, so it will accurately reflect your real elapsed time when you unlock.
        </p>
        <button
          onClick={handleTestChime}
          className="inline-flex items-center gap-1 text-[#C87D32] hover:underline mt-1 text-[11px] font-mono-journal cursor-pointer"
        >
          <Bell className="w-3 h-3" />
          Test ambient audio chime
        </button>
      </div>

      {/* Primary Completion Button */}
      <div className="space-y-4 pt-2">
        <button
          onClick={() => onFinish(elapsedSeconds)}
          className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-[#163324] dark:bg-[#2A563C] text-white font-medium hover:bg-[#2E5339] dark:hover:bg-[#3E7352] transition-all text-lg shadow-lg shadow-[#163324]/20 flex items-center justify-center gap-3 mx-auto cursor-pointer"
        >
          <span>I'm Back (Record Field Notes)</span>
          <ArrowRight className="w-5 h-5 text-[#C87D32]" />
        </button>

        <div>
          {showCancelConfirm ? (
            <div className="inline-flex items-center gap-3 p-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-xs text-red-700 dark:text-red-300">
              <span>Abort this investigation?</span>
              <button
                onClick={onCancel}
                className="font-bold underline text-red-800 dark:text-red-200 cursor-pointer"
              >
                Yes, exit
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="text-xs font-mono-journal text-[#849188] hover:text-red-600 transition-colors cursor-pointer"
            >
              Cancel this mission
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
