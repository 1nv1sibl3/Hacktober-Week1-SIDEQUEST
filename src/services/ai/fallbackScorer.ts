import { Mission, UserPreferences } from '../../types';
import { MISSIONS } from '../../data/missions';
import { cosineSimilarity } from './vectorMath';

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can\'t', 'cannot', 'could',
  'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each', 'few', 'for',
  'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s',
  'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m',
  'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t',
  'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours',
  'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t',
  'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there',
  'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t',
  'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s',
  'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself',
  'yourselves'
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

// Build TF-IDF index across mission texts
class FallbackTFIDFIndex {
  private vocab: Map<string, number> = new Map();
  private docFrequencies: Map<string, number> = new Map();
  private missionVectors: Map<string, number[]> = new Map();
  private docCount: number = 0;

  constructor(missions: Mission[]) {
    this.buildIndex(missions);
  }

  private buildIndex(missions: Mission[]) {
    this.docCount = missions.length;
    const docTokenSets: string[][] = [];

    // Step 1: Collect doc frequencies
    for (const m of missions) {
      const tokens = tokenize(`${m.title} ${m.objective} ${m.semanticText} ${m.followUpThemes.join(' ')}`);
      const uniqueTokens = Array.from(new Set(tokens));
      docTokenSets.push(tokens);

      for (const t of uniqueTokens) {
        this.docFrequencies.set(t, (this.docFrequencies.get(t) || 0) + 1);
        if (!this.vocab.has(t)) {
          this.vocab.set(t, this.vocab.size);
        }
      }
    }

    // Step 2: Build vector for each mission
    for (let i = 0; i < missions.length; i++) {
      const tokens = docTokenSets[i];
      const vec = this.vectorizeTokens(tokens);
      this.missionVectors.set(missions[i].id, vec);
    }
  }

  public vectorizeText(text: string): number[] {
    const tokens = tokenize(text);
    return this.vectorizeTokens(tokens);
  }

  private vectorizeTokens(tokens: string[]): number[] {
    const termCounts = new Map<string, number>();
    for (const t of tokens) {
      termCounts.set(t, (termCounts.get(t) || 0) + 1);
    }

    const vec = new Array(this.vocab.size).fill(0);
    for (const [term, count] of termCounts.entries()) {
      const idx = this.vocab.get(term);
      if (idx !== undefined) {
        const df = this.docFrequencies.get(term) || 1;
        const idf = Math.log(1 + this.docCount / df);
        const tf = Math.log(1 + count);
        vec[idx] = tf * idf;
      }
    }

    return vec;
  }

  public getSimilarity(queryText: string, missionId: string): number {
    const queryVec = this.vectorizeText(queryText);
    const missionVec = this.missionVectors.get(missionId);
    if (!missionVec) return 0;
    return cosineSimilarity(queryVec, missionVec);
  }
}

export const fallbackTFIDF = new FallbackTFIDFIndex(MISSIONS);

/**
 * Transparent fallback scoring formula
 */
export function scoreMissionFallback(
  mission: Mission,
  prefs: UserPreferences,
  completedIds: Set<string>
): {
  totalScore: number;
  semanticSimilarity: number;
  timeFit: number;
  environmentFit: number;
  moodFit: number;
  diversityBonus: number;
  explanation: string;
} {
  // 1. Text Similarity (TF-IDF vector cosine match against interests or mood)
  const query = prefs.freeformInterests ? `${prefs.freeformInterests} ${prefs.mood}` : prefs.mood;
  const semanticSimilarity = fallbackTFIDF.getSimilarity(query, mission.id);

  // 2. Duration Fit (exact = 1.0, 1 step = 0.6, 2 steps = 0.3)
  const diff = Math.abs(mission.duration - prefs.duration);
  const timeFit = diff === 0 ? 1.0 : diff <= 5 ? 0.7 : diff <= 10 ? 0.4 : 0.2;

  // 3. Environment Fit
  const environmentFit =
    mission.environments.includes(prefs.environment) || mission.environments.includes('anywhere')
      ? 1.0
      : 0.2;

  // 4. Mood Fit
  const moodFit = mission.moods.includes(prefs.mood) ? 1.0 : 0.3;

  // 5. Diversity bonus (penalize if already done)
  const isCompleted = completedIds.has(mission.id);
  const diversityBonus = isCompleted ? -0.5 : 0.2;

  // Weighted sum
  const weighted =
    0.35 * semanticSimilarity +
    0.25 * timeFit +
    0.20 * environmentFit +
    0.15 * moodFit +
    0.05 * (diversityBonus > 0 ? diversityBonus : 0);

  const totalScore = Math.max(0, isCompleted ? weighted * 0.3 : weighted);

  const explanation = `Fallback Scorer (TF-IDF + Metadata): Sim: ${(semanticSimilarity * 100).toFixed(0)}%, Time: ${(timeFit * 100).toFixed(0)}%, Env: ${(environmentFit * 100).toFixed(0)}%, Mood: ${(moodFit * 100).toFixed(0)}%`;

  return {
    totalScore,
    semanticSimilarity,
    timeFit,
    environmentFit,
    moodFit,
    diversityBonus,
    explanation
  };
}
