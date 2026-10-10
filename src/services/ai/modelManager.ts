import { ModelStatus } from '../../types';

export type StatusListener = (status: ModelStatus) => void;

let transformersModule: any = null;

async function getTransformers() {
  if (!transformersModule) {
    // Dynamic import prevents Vite from stalling startup bundling
    transformersModule = await import('@xenova/transformers');
    if (typeof window !== 'undefined' && transformersModule?.env) {
      transformersModule.env.allowLocalModels = false;
      transformersModule.env.useBrowserCache = true;
    }
  }
  return transformersModule;
}

class ModelManager {
  private extractor: any = null;
  private listeners: Set<StatusListener> = new Set();
  private cache: Map<string, number[]> = new Map();

  private status: ModelStatus = {
    loaded: false,
    loading: false,
    loadingProgress: 0,
    modelName: 'Xenova/all-MiniLM-L6-v2',
    license: 'Apache 2.0 (Open-Weight / Open-Source)',
    isLocal: true,
    isFallback: false,
    cachedInBrowser: false,
    deviceBackend: 'WebAssembly / ONNX Runtime Web'
  };

  constructor() {
    this.checkBrowserCache();
  }

  public getStatus(): ModelStatus {
    return { ...this.status };
  }

  public subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const current = this.getStatus();
    this.listeners.forEach((cb) => cb(current));
  }

  private async checkBrowserCache() {
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cacheKeys = await window.caches.keys();
        const hasTransformersCache = cacheKeys.some(
          (k) => k.includes('transformers') || k.includes('xenova')
        );
        if (hasTransformersCache) {
          this.status.cachedInBrowser = true;
          this.notify();
        }
      } catch (_) {}
    }
  }

  public async loadModel(): Promise<boolean> {
    if (this.status.loaded && this.extractor) {
      return true;
    }

    if (this.status.loading) {
      return false;
    }

    this.status.loading = true;
    this.status.isFallback = false;
    this.status.fallbackReason = undefined;
    this.status.loadingProgress = 10;
    this.notify();

    try {
      const { pipeline } = await getTransformers();

      const progressCallback = (info: any) => {
        if (info.status === 'progress' && typeof info.progress === 'number') {
          this.status.loadingProgress = Math.min(99, Math.round(info.progress));
          this.notify();
        }
      };

      this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true,
        progress_callback: progressCallback
      });

      this.status.loaded = true;
      this.status.loading = false;
      this.status.loadingProgress = 100;
      this.status.cachedInBrowser = true;
      this.status.isFallback = false;
      this.notify();
      return true;
    } catch (err: any) {
      console.warn(
        'Local Transformers.js model loading failed, operating in transparent fallback mode:',
        err
      );
      this.status.loading = false;
      this.status.loaded = false;
      this.status.isFallback = true;
      this.status.fallbackReason =
        err?.message ||
        'WebAssembly ONNX initialization failed or offline before initial download';
      this.notify();
      return false;
    }
  }

  public toggleFallbackMode(forceFallback: boolean) {
    this.status.isFallback = forceFallback;
    this.notify();
  }

  public async embedText(
    text: string
  ): Promise<{ embedding: number[]; latencyMs: number; isFallback: boolean }> {
    const trimmed = text.trim();
    if (!trimmed) {
      return {
        embedding: new Array(384).fill(0),
        latencyMs: 0,
        isFallback: this.status.isFallback
      };
    }

    // Check fast cache
    if (this.cache.has(trimmed)) {
      return {
        embedding: this.cache.get(trimmed)!,
        latencyMs: 1,
        isFallback: this.status.isFallback
      };
    }

    // If model not loaded and not forced to fallback, attempt to load
    if (!this.extractor && !this.status.isFallback && !this.status.loading) {
      await this.loadModel();
    }

    if (this.extractor && !this.status.isFallback) {
      const start = performance.now();
      try {
        const output = await this.extractor(trimmed, { pooling: 'mean', normalize: true });
        const latencyMs = Math.round(performance.now() - start);
        const embedding = Array.from(output.data as Float32Array);
        this.cache.set(trimmed, embedding);
        this.status.lastInferenceTimeMs = latencyMs;
        this.notify();
        return { embedding, latencyMs, isFallback: false };
      } catch (err) {
        console.warn('Inference error, reverting to fallback scoring:', err);
      }
    }

    // Fallback: Return empty to signal fallback scorer
    return {
      embedding: [],
      latencyMs: 2,
      isFallback: true
    };
  }
}

export const modelManager = new ModelManager();
