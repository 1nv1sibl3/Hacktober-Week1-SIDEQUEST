import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Download,
  Trash2,
  HardDrive,
  WifiOff,
  Key,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Moon,
  Sun
} from 'lucide-react';
import { ModelStatus, FieldObservation } from '../../types';
import { storageService } from '../../services/storage/indexedDB';

interface SettingsScreenProps {
  modelStatus: ModelStatus;
  expeditions: FieldObservation[];
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onDataCleared: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  modelStatus,
  expeditions,
  isDarkMode,
  onToggleDarkMode,
  onDataCleared
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem('sidequest_gemini_key') || '';
  });
  const [isSavedGemini, setIsSavedGemini] = useState(false);

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(
      {
        application: 'SIDEQUEST',
        exportedAt: new Date().toISOString(),
        expeditions
      },
      null,
      2
    );
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sidequest_field_journal_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAll = async () => {
    await storageService.clearAllData();
    setShowClearConfirm(false);
    onDataCleared();
  };

  const handleSaveGeminiKey = () => {
    if (geminiApiKey.trim()) {
      localStorage.setItem('sidequest_gemini_key', geminiApiKey.trim());
    } else {
      localStorage.removeItem('sidequest_gemini_key');
    }
    setIsSavedGemini(true);
    setTimeout(() => setIsSavedGemini(false), 2000);
  };

  return (
    <div className="space-y-10 py-4 sm:py-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-mono-journal text-[#C87D32] uppercase tracking-wider font-semibold">
          <Settings className="w-3.5 h-3.5" />
          System Preferences & Transparency
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#163324] dark:text-[#E8EDE9]">
          Settings & Local Privacy
        </h1>
        <p className="text-xs sm:text-sm text-[#57635C] dark:text-[#A3B5AA]">
          Control local storage, inspect zero-cloud guarantees, and configure optional developer assistants.
        </p>
      </div>

      {/* Visual Theme Card */}
      <div className="field-paper-elevated rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-editorial text-xl font-bold text-[#163324] dark:text-[#E8EDE9]">
              Visual Field Journal Theme
            </h2>
            <p className="text-xs text-[#57635C] dark:text-[#A3B5AA]">
              Switch between daytime botanical parchment and nocturnal campfire ink.
            </p>
          </div>
          <button
            onClick={onToggleDarkMode}
            className="px-4 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#0E1511] border border-[#E7E0D5] dark:border-[#24352B] text-xs font-medium flex items-center gap-2 cursor-pointer hover:bg-[#EBF2EC] dark:hover:bg-[#1A2820] transition-colors"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-[#C87D32]" />
                <span>Warm Parchment</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                <span>Nocturnal Ink</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Privacy Guarantee Panel */}
      <div className="field-paper-elevated rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2 text-[#2E5339] dark:text-[#A3B5AA]">
          <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="font-editorial text-xl font-bold text-[#163324] dark:text-[#E8EDE9]">
            Zero-Cloud Privacy Guarantee
          </h2>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-[#57635C] dark:text-[#A3B5AA]">
          <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#0E1511] border border-[#E7E0D5] dark:border-[#24352B] space-y-1">
            <strong className="text-[#163324] dark:text-[#E8EDE9] font-mono-journal text-[11px] uppercase block">
              1. What stays strictly on your machine?
            </strong>
            <p>
              Your field notes, written observations, reflection answers, optional photographs, and milestone badges never leave your device. Everything is saved directly inside your browser's local IndexedDB.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#0E1511] border border-[#E7E0D5] dark:border-[#24352B] space-y-1">
            <strong className="text-[#163324] dark:text-[#E8EDE9] font-mono-journal text-[11px] uppercase block">
              2. When are network requests made?
            </strong>
            <p>
              Only once: upon your first model execution to download the quantized open-weight <code className="font-mono-journal text-[#C87D32]">all-MiniLM-L6-v2</code> ONNX weights from the Hugging Face CDN (~23 MB). Once downloaded, the weights are stored in the browser Cache API.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#0E1511] border border-[#E7E0D5] dark:border-[#24352B] space-y-1">
            <strong className="text-[#163324] dark:text-[#E8EDE9] font-mono-journal text-[11px] uppercase block">
              3. Offline Behavior
            </strong>
            <p>
              After the initial model setup, all semantic embeddings, mission matching, pocket mode clocks, and journal storage work completely offline without an internet connection. If offline prior to model download, transparent deterministic fallback scoring is automatically active.
            </p>
          </div>
        </div>
      </div>

      {/* Storage Management & Data Export */}
      <div className="field-paper-elevated rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-[#C87D32]" />
          <h2 className="font-editorial text-xl font-bold text-[#163324] dark:text-[#E8EDE9]">
            Local Data & Storage Management
          </h2>
        </div>

        <div className="text-xs text-[#57635C] dark:text-[#A3B5AA] space-y-1">
          <p>
            Current records: <strong>{expeditions.length}</strong> outdoor investigations stored in IndexedDB.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportJSON}
            disabled={expeditions.length === 0}
            className="px-4 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#0E1511] border border-[#E7E0D5] dark:border-[#24352B] text-xs font-mono-journal font-medium hover:bg-[#EBF2EC] dark:hover:bg-[#1A2820] text-[#163324] dark:text-[#E8EDE9] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-40"
          >
            <Download className="w-4 h-4 text-[#C87D32]" />
            <span>Export Field Notes (JSON)</span>
          </button>

          {showClearConfirm ? (
            <div className="inline-flex items-center gap-2 p-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-xs">
              <span className="text-red-700 dark:text-red-300">Permanently delete all field data?</span>
              <button
                onClick={handleClearAll}
                className="px-2.5 py-1 rounded bg-red-600 text-white font-bold hover:bg-red-700 cursor-pointer"
              >
                Yes, delete
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-1 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs font-mono-journal font-medium hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Local Data</span>
            </button>
          )}
        </div>
      </div>

      {/* Optional Gemini Developer API Key */}
      <div className="field-paper-elevated rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-[#849188]" />
              <h2 className="font-editorial text-lg font-bold text-[#163324] dark:text-[#E8EDE9]">
                Optional Remote AI Assist (Gemini API)
              </h2>
            </div>
            <p className="text-xs text-[#57635C] dark:text-[#A3B5AA]">
              Optional developer integration. Not required for core game play.
            </p>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono-journal bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            Proprietary / Optional
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <strong>Transparency Notice:</strong>
          <p>
            Gemini is a proprietary cloud model and is <strong>never required</strong> for SIDEQUEST. All core mission selection, vector embeddings, and discovery synthesis run locally and anonymously via open-weight sentence transformers.
          </p>
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="AIzaSy... (Optional API key)"
              className="flex-1 text-xs sm:text-sm p-3 rounded-lg border border-[#E7E0D5] dark:border-[#24352B] bg-[#FAF7F2] dark:bg-[#0E1511] text-[#1C2621] dark:text-[#E8EDE9] font-mono-journal"
            />
            <button
              onClick={handleSaveGeminiKey}
              className="px-4 py-3 rounded-lg bg-[#163324] dark:bg-[#2A563C] text-white text-xs font-mono-journal font-medium hover:bg-[#2E5339] transition-colors cursor-pointer shrink-0"
            >
              {isSavedGemini ? 'Saved!' : 'Save Key'}
            </button>
          </div>
          <p className="text-[11px] text-[#849188]">
            Key is stored solely in your personal browser's localStorage and is never logged.
          </p>
        </div>
      </div>
    </div>
  );
};
