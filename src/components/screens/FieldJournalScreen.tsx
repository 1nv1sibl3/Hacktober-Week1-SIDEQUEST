import React, { useState } from 'react';
import {
  BookOpen,
  Camera,
  Sparkles,
  ArrowRight,
  Clock,
  Compass,
  MapPin,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Mission, UserPreferences, FieldObservation } from '../../types';

interface FieldJournalScreenProps {
  mission: Mission;
  preferences: UserPreferences;
  elapsedSeconds: number;
  onSubmitNotes: (data: {
    userNotes: string;
    surprisingFinding: string;
    reflectionAnswers: Record<string, string>;
    investigateNextIdea: string;
    photoDataUrl?: string;
    optInLocationLabel?: string;
  }) => void;
  isSynthesizing: boolean;
}

export const FieldJournalScreen: React.FC<FieldJournalScreenProps> = ({
  mission,
  preferences,
  elapsedSeconds,
  onSubmitNotes,
  isSynthesizing
}) => {
  const [userNotes, setUserNotes] = useState('');
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string>>({});
  const [surprisingFinding, setSurprisingFinding] = useState('');
  const [investigateNextIdea, setInvestigateNextIdea] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(undefined);
  const [optInLocationLabel, setOptInLocationLabel] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleReflectionChange = (promptIdx: number, val: string) => {
    setReflectionAnswers((prev) => ({
      ...prev,
      [`q_${promptIdx}`]: val
    }));
  };

  // Compress and handle client-side photo locally
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 900;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setPhotoDataUrl(compressed);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userNotes.trim()) {
      setValidationError('Please record at least a brief sentence of what you observed outdoors.');
      return;
    }

    setValidationError(null);
    onSubmitNotes({
      userNotes: userNotes.trim(),
      surprisingFinding: surprisingFinding.trim(),
      reflectionAnswers,
      investigateNextIdea: investigateNextIdea.trim(),
      photoDataUrl,
      optInLocationLabel: optInLocationLabel.trim() || undefined
    });
  };

  const elapsedMins = Math.max(1, Math.round(elapsedSeconds / 60));

  return (
    <div className="space-y-8 py-4 sm:py-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-mono-journal text-[#C87D32] uppercase tracking-wider font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          Field Journal Entry · Log Investigation
        </div>
        <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-[#163324] dark:text-[#E8EDE9]">
          Record Your Outdoor Discoveries
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#57635C] dark:text-[#A3B5AA]">
          <span className="font-medium text-[#163324] dark:text-white">Mission: {mission.title}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {elapsedMins} min explored
          </span>
          <span>·</span>
          <span>Environment: {preferences.environment}</span>
        </div>
      </div>

      {/* Main Journal Form */}
      <form onSubmit={handleSubmit} className="field-paper-elevated rounded-2xl p-6 sm:p-10 space-y-8">
        {/* Validation Alert */}
        {validationError && (
          <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Primary Field Notes */}
        <div className="space-y-2">
          <label
            htmlFor="userNotes"
            className="block text-xs font-mono-journal uppercase tracking-wider font-semibold text-[#163324] dark:text-[#E8EDE9]"
          >
            What did you observe? <span className="text-[#C87D32]">*</span>
          </label>
          <textarea
            id="userNotes"
            rows={4}
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            placeholder="Describe what caught your attention: the physical textures, light patterns, sound shifts, or living things you noticed..."
            className="w-full text-sm p-4 rounded-xl border border-[#E7E0D5] dark:border-[#24352B] bg-[#FAF7F2] dark:bg-[#0E1511] text-[#1C2621] dark:text-[#E8EDE9] placeholder-[#849188] focus:outline-none focus:ring-2 focus:ring-[#C87D32]/50 transition-all resize-y journal-ruled"
          />
          <p className="text-[11px] text-[#57635C] dark:text-[#A3B5AA]">
            This text will be parsed by your local sentence embedding model to generate your Discovery Card.
          </p>
        </div>

        {/* Reflection Prompts from the Mission */}
        {mission.reflectionPrompts.length > 0 && (
          <div className="space-y-4 pt-2 border-t border-[#E7E0D5] dark:border-[#24352B]">
            <h2 className="text-xs font-mono-journal uppercase tracking-wider font-semibold text-[#163324] dark:text-[#E8EDE9]">
              Field Reflection Prompts
            </h2>
            <div className="space-y-4">
              {mission.reflectionPrompts.map((prompt, idx) => (
                <div key={idx} className="space-y-1.5">
                  <label
                    htmlFor={`prompt-${idx}`}
                    className="block text-xs text-[#57635C] dark:text-[#A3B5AA] font-editorial italic"
                  >
                    {idx + 1}. {prompt}
                  </label>
                  <input
                    id={`prompt-${idx}`}
                    type="text"
                    value={reflectionAnswers[`q_${idx}`] || ''}
                    onChange={(e) => handleReflectionChange(idx, e.target.value)}
                    placeholder="Your reflection..."
                    className="w-full text-xs sm:text-sm p-3 rounded-lg border border-[#E7E0D5] dark:border-[#24352B] bg-[#FAF7F2] dark:bg-[#0E1511] text-[#1C2621] dark:text-[#E8EDE9] placeholder-[#849188] focus:outline-none focus:ring-1 focus:ring-[#C87D32]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Surprising Finding & Next Idea */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E7E0D5] dark:border-[#24352B]">
          <div className="space-y-1.5">
            <label
              htmlFor="surprisingFinding"
              className="block text-xs font-mono-journal uppercase tracking-wider text-[#163324] dark:text-[#E8EDE9] font-medium"
            >
              Something surprising:
            </label>
            <input
              id="surprisingFinding"
              type="text"
              value={surprisingFinding}
              onChange={(e) => setSurprisingFinding(e.target.value)}
              placeholder="e.g. A beetle walking along telephone wire..."
              className="w-full text-xs sm:text-sm p-3 rounded-lg border border-[#E7E0D5] dark:border-[#24352B] bg-[#FAF7F2] dark:bg-[#0E1511] text-[#1C2621] dark:text-[#E8EDE9] placeholder-[#849188] focus:outline-none focus:ring-1 focus:ring-[#C87D32]"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="investigateNextIdea"
              className="block text-xs font-mono-journal uppercase tracking-wider text-[#163324] dark:text-[#E8EDE9] font-medium"
            >
              What to investigate next?
            </label>
            <input
              id="investigateNextIdea"
              type="text"
              value={investigateNextIdea}
              onChange={(e) => setInvestigateNextIdea(e.target.value)}
              placeholder="e.g. Check where rooftop downspouts lead..."
              className="w-full text-xs sm:text-sm p-3 rounded-lg border border-[#E7E0D5] dark:border-[#24352B] bg-[#FAF7F2] dark:bg-[#0E1511] text-[#1C2621] dark:text-[#E8EDE9] placeholder-[#849188] focus:outline-none focus:ring-1 focus:ring-[#C87D32]"
            />
          </div>
        </div>

        {/* Optional Local Photo Attachment */}
        <div className="space-y-3 pt-2 border-t border-[#E7E0D5] dark:border-[#24352B]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono-journal uppercase tracking-wider text-[#163324] dark:text-[#E8EDE9] font-semibold flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#C87D32]" />
              Attach Field Photo (Optional)
            </label>
            <span className="text-[10px] text-[#849188]">Stored locally in IndexedDB</span>
          </div>

          {photoDataUrl ? (
            <div className="relative inline-block rounded-xl overflow-hidden border border-[#E7E0D5] dark:border-[#24352B] max-w-sm">
              <img src={photoDataUrl} alt="Field observation" className="max-h-48 rounded-xl object-cover" />
              <button
                type="button"
                onClick={() => setPhotoDataUrl(undefined)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                title="Remove photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-[#E7E0D5] dark:border-[#24352B] hover:border-[#C87D32] rounded-xl p-4 text-center cursor-pointer block transition-colors bg-[#FAF7F2]/50 dark:bg-[#0E1511]/50">
              <Camera className="w-6 h-6 text-[#849188] mx-auto mb-1" />
              <span className="text-xs text-[#57635C] dark:text-[#A3B5AA] block">
                Tap to select or capture a photo from your camera
              </span>
              <span className="text-[10px] text-[#849188] block mt-0.5">
                (Images are resized client-side and never leave your browser)
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Optional Location label (privacy-first, opt-in) */}
        <div className="space-y-1.5 pt-2 border-t border-[#E7E0D5] dark:border-[#24352B]">
          <label
            htmlFor="optInLocationLabel"
            className="block text-xs font-mono-journal uppercase tracking-wider text-[#163324] dark:text-[#E8EDE9] font-medium flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-[#C87D32]" />
            Location or Landmark Label (Optional)
          </label>
          <input
            id="optInLocationLabel"
            type="text"
            value={optInLocationLabel}
            onChange={(e) => setOptInLocationLabel(e.target.value)}
            placeholder="e.g. Engineering Quad steps, North Balcony, Park Lotus Pond"
            className="w-full text-xs sm:text-sm p-3 rounded-lg border border-[#E7E0D5] dark:border-[#24352B] bg-[#FAF7F2] dark:bg-[#0E1511] text-[#1C2621] dark:text-[#E8EDE9] placeholder-[#849188] focus:outline-none focus:ring-1 focus:ring-[#C87D32]"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSynthesizing}
            className="w-full py-4 rounded-xl bg-[#163324] dark:bg-[#2A563C] text-white font-medium hover:bg-[#2E5339] dark:hover:bg-[#3E7352] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#163324]/20 text-base cursor-pointer disabled:opacity-50"
          >
            {isSynthesizing ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin text-[#C87D32]" />
                <span>Running Local Discovery Engine...</span>
              </>
            ) : (
              <>
                <span>Save Notes & Generate Discovery Card</span>
                <ArrowRight className="w-5 h-5 text-[#C87D32]" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
