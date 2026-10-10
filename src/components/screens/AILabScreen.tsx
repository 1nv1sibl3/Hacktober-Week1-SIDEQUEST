import React, { useState, useEffect } from 'react';
import {
  Cpu,
  ShieldCheck,
  Zap,
  Clock,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  FileCode,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import { ModelStatus, Mission } from '../../types';
import { modelManager } from '../../services/ai/modelManager';
import { MISSIONS } from '../../data/missions';
import { cosineSimilarity } from '../../services/ai/vectorMath';
import { fallbackTFIDF } from '../../services/ai/fallbackScorer';

interface AILabScreenProps {
  modelStatus: ModelStatus;
  onRefreshModelStatus: () => void;
}

export const AILabScreen: React.FC<AILabScreenProps> = ({
  modelStatus,
  onRefreshModelStatus
}) => {
  const [testQuery, setTestQuery] = useState('plants surviving in concrete cracks');
  const [rankedResults, setRankedResults] = useState<{ mission: Mission; score: number; type: string }[]>([]);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [vectorPreview, setVectorPreview] = useState<number[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [forceFallback, setForceFallback] = useState(modelStatus.isFallback);

  const sampleQueries = [
    'plants surviving in concrete cracks',
    'quiet bird songs in the morning breeze',
    'measuring temperature between sun and shade',
    'tracing rainwater runoff channels on sidewalk',
    'ant columns navigating paving stones',
    'rust and peeling paint on metal gates'
  ];

  const runEvaluation = async (queryText: string) => {
    setIsEvaluating(true);
    const start = performance.now();

    try {
      if (forceFallback || !modelStatus.loaded) {
        // Fallback evaluation
        const results = MISSIONS.map((m) => {
          const sim = fallbackTFIDF.getSimilarity(queryText, m.id);
          return { mission: m, score: sim, type: 'Deterministic TF-IDF' };
        }).sort((a, b) => b.score - a.score);

        const duration = Math.round(performance.now() - start);
        setLatencyMs(duration);
        setRankedResults(results.slice(0, 5));
        setVectorPreview(fallbackTFIDF.vectorizeText(queryText).slice(0, 8));
      } else {
        // Real local neural embedding evaluation
        const { embedding, latencyMs: inferLatency } = await modelManager.embedText(queryText);
        setVectorPreview(embedding.slice(0, 8));

        const results = MISSIONS.map((m) => {
          let sim = 0;
          if (m.embedding && m.embedding.length > 0) {
            sim = cosineSimilarity(embedding, m.embedding);
          }
          return { mission: m, score: sim, type: 'all-MiniLM-L6-v2 Cosine' };
        }).sort((a, b) => b.score - a.score);

        setLatencyMs(inferLatency);
        setRankedResults(results.slice(0, 5));
      }
    } catch (err) {
      console.error('Diagnostic inference error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  useEffect(() => {
    runEvaluation(testQuery);
  }, [forceFallback]);

  const handleToggleFallback = (val: boolean) => {
    setForceFallback(val);
    modelManager.toggleFallbackMode(val);
  };

  const handleInitializeModel = async () => {
    await modelManager.loadModel();
    onRefreshModelStatus();
  };

  return (
    <div className="space-y-10 py-4 sm:py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-mono-journal text-[#C87D32] uppercase tracking-wider font-semibold">
          <Cpu className="w-3.5 h-3.5" />
          Model Transparency & Diagnostics Lab
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#163324] dark:text-[#E8EDE9]">
          Verifiable Local AI Engine
        </h1>
        <p className="text-xs sm:text-sm text-[#57635C] dark:text-[#A3B5AA]">
          Inspect real-time inference telemetry, verify open-weight model provenance, and test semantic vector matching.
        </p>
      </div>

      {/* Model Spec Card */}
      <div className="field-paper-elevated rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E0D5] dark:border-[#24352B] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-editorial text-2xl font-bold text-[#163324] dark:text-[#E8EDE9]">
                {modelStatus.modelName}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-journal font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Open-Weight
              </span>
            </div>
            <p className="text-xs text-[#57635C] dark:text-[#A3B5AA]">
              Distilled MiniLM Sentence Transformer by Microsoft & Hugging Face · Quantized ONNX
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {modelStatus.loaded ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-mono-journal font-medium border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Model Loaded & Active</span>
              </div>
            ) : modelStatus.loading ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-mono-journal font-medium border border-amber-200">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Downloading ({modelStatus.loadingProgress}%)</span>
              </div>
            ) : (
              <button
                onClick={handleInitializeModel}
                className="px-4 py-2 rounded-lg bg-[#163324] dark:bg-[#2A563C] text-white text-xs font-mono-journal font-medium hover:bg-[#2E5339] transition-colors cursor-pointer"
              >
                Load Model In Browser
              </button>
            )}
          </div>
        </div>

        {/* Spec Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-[#FAF7F2] dark:bg-[#0E1511] border border-[#E7E0D5] dark:border-[#24352B] space-y-1">
            <span className="text-[10px] font-mono-journal text-[#849188] uppercase block">License</span>
            <strong className="text-[#163324] dark:text-[#E8EDE9] font-medium block">
              Apache 2.0 (Permissive)
            </strong>
          </div>

          <div className="p-3 rounded-lg bg-[#FAF7F2] dark:bg-[#0E1511] border border-[#E7E0D5] dark:border-[#24352B] space-y-1">
            <span className="text-[10px] font-mono-journal text-[#849188] uppercase block">Inference Location</span>
            <strong className="text-emerald-700 dark:text-emerald-400 font-medium block">
              100% Client-Side Local
            </strong>
          </div>

          <div className="p-3 rounded-lg bg-[#FAF7F2] dark:bg-[#0E1511] border border-[#E7E0D5] dark:border-[#24352B] space-y-1">
            <span className="text-[10px] font-mono-journal text-[#849188] uppercase block">Vector Dimension</span>
            <strong className="text-[#163324] dark:text-[#E8EDE9] font-medium block">
              384 Floats (Normalized)
            </strong>
          </div>

          <div className="p-3 rounded-lg bg-[#FAF7F2] dark:bg-[#0E1511] border border-[#E7E0D5] dark:border-[#24352B] space-y-1">
            <span className="text-[10px] font-mono-journal text-[#849188] uppercase block">Browser Cache</span>
            <strong className="text-[#163324] dark:text-[#E8EDE9] font-medium block">
              {modelStatus.cachedInBrowser ? 'Cached (Offline Ready)' : 'Initial Download Pending'}
            </strong>
          </div>
        </div>

        {/* Runtime Mode Selector */}
        <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#0E1511] border border-[#E7E0D5] dark:border-[#24352B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <strong className="font-mono-journal uppercase text-[#163324] dark:text-[#E8EDE9] block">
              Execution Mode Toggle:
            </strong>
            <span className="text-[#57635C] dark:text-[#A3B5AA]">
              Switch between local neural vector embeddings and the deterministic TF-IDF fallback engine.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleToggleFallback(false)}
              className={`px-3 py-1.5 rounded-lg font-mono-journal text-xs transition-colors cursor-pointer ${
                !forceFallback
                  ? 'bg-[#163324] text-white dark:bg-[#2A563C]'
                  : 'bg-white dark:bg-[#15201A] text-[#57635C] dark:text-[#A3B5AA] border border-[#E7E0D5]'
              }`}
            >
              Neural (all-MiniLM)
            </button>
            <button
              onClick={() => handleToggleFallback(true)}
              className={`px-3 py-1.5 rounded-lg font-mono-journal text-xs transition-colors cursor-pointer ${
                forceFallback
                  ? 'bg-[#C87D32] text-white'
                  : 'bg-white dark:bg-[#15201A] text-[#57635C] dark:text-[#A3B5AA] border border-[#E7E0D5]'
              }`}
            >
              Deterministic Fallback
            </button>
          </div>
        </div>
      </div>

      {/* Live Semantic Search Playground */}
      <div className="field-paper-elevated rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="font-editorial text-xl font-bold text-[#163324] dark:text-[#E8EDE9] flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#C87D32]" />
            Live Semantic Inference Playground
          </h2>
          <p className="text-xs text-[#57635C] dark:text-[#A3B5AA]">
            Type an observation to run real-time vector embedding inference and cosine similarity scoring against the 36 missions.
          </p>
        </div>

        {/* Query Input */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#849188] absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="Type an outdoor observation to test..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E7E0D5] dark:border-[#24352B] bg-[#FAF7F2] dark:bg-[#0E1511] text-xs sm:text-sm text-[#1C2621] dark:text-[#E8EDE9] focus:outline-none focus:ring-2 focus:ring-[#C87D32]/50"
              />
            </div>
            <button
              onClick={() => runEvaluation(testQuery)}
              disabled={isEvaluating}
              className="px-5 py-3 rounded-xl bg-[#163324] dark:bg-[#2A563C] text-white text-xs sm:text-sm font-medium hover:bg-[#2E5339] transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isEvaluating ? 'Inferring...' : 'Evaluate'}
            </button>
          </div>

          {/* Preset Prompts */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono-journal text-[#849188]">Try:</span>
            {sampleQueries.map((q, i) => (
              <button
                key={i}
                onClick={() => {
                  setTestQuery(q);
                  runEvaluation(q);
                }}
                className="px-2 py-0.5 rounded text-[11px] font-mono-journal bg-[#FAF7F2] dark:bg-[#0E1511] text-[#57635C] dark:text-[#A3B5AA] hover:bg-[#EBF2EC] border border-[#E7E0D5] dark:border-[#24352B] cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Vector Preview Bar */}
        {vectorPreview.length > 0 && (
          <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#0E1511] border border-[#E7E0D5] dark:border-[#24352B] space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono-journal text-[#849188]">
              <span>Vector Preview (first 8 dimensions of 384):</span>
              <span>Inference Time: {latencyMs !== null ? `${latencyMs}ms` : '--'}</span>
            </div>
            <div className="font-mono-journal text-xs text-[#2E5339] dark:text-[#A3B5AA] overflow-x-auto whitespace-nowrap p-1 bg-white dark:bg-[#15201A] rounded border border-[#E7E0D5] dark:border-[#24352B]">
              [ {vectorPreview.map((v) => v.toFixed(4)).join(', ')} ... ]
            </div>
          </div>
        )}

        {/* Top 5 Matches Result List */}
        <div className="space-y-3">
          <span className="text-xs font-mono-journal uppercase tracking-wider font-semibold text-[#163324] dark:text-[#E8EDE9] block">
            Ranked Semantic Matches:
          </span>

          <div className="space-y-2">
            {rankedResults.map((res, index) => (
              <div
                key={res.mission.id}
                className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#0E1511] border border-[#E7E0D5] dark:border-[#24352B] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-journal text-xs font-bold text-[#849188]">
                      #{index + 1}
                    </span>
                    <strong className="font-editorial text-sm font-bold text-[#163324] dark:text-[#E8EDE9]">
                      {res.mission.title}
                    </strong>
                    <span className="text-[10px] font-mono-journal text-[#57635C] dark:text-[#A3B5AA]">
                      ({res.mission.duration} min · {res.mission.environments.join(', ')})
                    </span>
                  </div>
                  <p className="text-xs text-[#57635C] dark:text-[#A3B5AA] line-clamp-1">
                    {res.mission.objective}
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <div className="font-mono-journal text-xs font-bold text-[#C87D32]">
                    {(res.score * 100).toFixed(1)}% Match
                  </div>
                  <span className="text-[10px] font-mono-journal text-[#849188]">
                    {res.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transparency Guarantee Card */}
      <div className="p-5 rounded-2xl bg-[#EBF2EC]/40 dark:bg-[#1A2820]/40 border border-[#2E5339]/20 space-y-3 text-xs text-[#1C2621] dark:text-[#E8EDE9]">
        <div className="flex items-center gap-2 text-[#2E5339] dark:text-[#A3B5AA] font-mono-journal font-bold uppercase text-[11px]">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Open AI Integrity Policy</span>
        </div>
        <p className="leading-relaxed">
          SIDEQUEST runs real sentence embeddings directly inside your browser via Transformers.js and ONNX Runtime Web. We never fake AI with random number generators or simulate embeddings. If WebAssembly fails or network is offline before first cache, transparent deterministic fallback scoring is clearly announced.
        </p>
      </div>
    </div>
  );
};
