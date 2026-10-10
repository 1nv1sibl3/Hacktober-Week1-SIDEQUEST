export type MissionDuration = 5 | 10 | 15 | 30;

export type MissionMood =
  | 'curious'
  | 'calm'
  | 'adventurous'
  | 'scientific'
  | 'creative'
  | 'observant';

export type MissionEnvironment =
  | 'campus'
  | 'garden'
  | 'neighborhood'
  | 'park'
  | 'anywhere';

export type MissionDifficulty = 'Gentle' | 'Moderate' | 'Deep Focus';

export interface Mission {
  id: string;
  title: string;
  narrativeBriefing: string;
  objective: string;
  clues: [string, string, string];
  duration: MissionDuration;
  difficulty: MissionDifficulty;
  environments: MissionEnvironment[];
  moods: MissionMood[];
  safetyNotice: string;
  reflectionPrompts: string[];
  followUpThemes: string[];
  semanticText: string;
  embedding?: number[]; // 384-dimensional normalized vector
}

export interface UserPreferences {
  duration: MissionDuration;
  mood: MissionMood;
  environment: MissionEnvironment;
  freeformInterests: string;
}

export interface DiscoveryCard {
  id: string;
  observationSummary: string;
  interpretiveInsight: string;
  curiosityQuestion: string;
  suggestedNextMissionId: string;
  suggestedNextMissionTitle: string;
  confidenceScore: number; // 0.0 - 1.0 (cosine similarity or normalized overlap)
  matchedThemes: string[];
  modelAttribution: {
    modelName: string;
    isLocal: boolean;
    inferenceTimeMs: number;
    scoreType: 'semantic_embedding' | 'hybrid_fallback';
  };
}

export interface FieldObservation {
  id: string;
  missionId: string;
  missionTitle: string;
  timestamp: number;
  durationMinutes: MissionDuration;
  actualElapsedSeconds: number;
  environment: MissionEnvironment;
  mood: MissionMood;
  userNotes: string;
  surprisingFinding?: string;
  reflectionAnswers?: Record<string, string>;
  investigateNextIdea?: string;
  photoDataUrl?: string;
  discoveryCard?: DiscoveryCard;
  optInLocation?: {
    label: string;
    approximateArea?: string;
  };
}

export interface ScoredMission {
  mission: Mission;
  totalScore: number;
  semanticSimilarity: number;
  timeFit: number;
  environmentFit: number;
  moodFit: number;
  diversityBonus: number;
  scoreBreakdown: string;
}

export interface ModelStatus {
  loaded: boolean;
  loading: boolean;
  loadingProgress: number; // 0 - 100
  modelName: string;
  license: string;
  isLocal: boolean;
  isFallback: boolean;
  fallbackReason?: string;
  cachedInBrowser: boolean;
  lastInferenceTimeMs?: number;
  deviceBackend: string;
}

export interface CuriosityMilestone {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlockedAt?: number;
  category: 'botany' | 'sound' | 'microclimate' | 'urban' | 'habits';
}
