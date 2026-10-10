import { Mission, UserPreferences, ScoredMission } from '../../types';
import { MISSIONS } from '../../data/missions';
import { modelManager } from './modelManager';
import { cosineSimilarity } from './vectorMath';
import { scoreMissionFallback } from './fallbackScorer';

export async function rankMissions(
  prefs: UserPreferences,
  completedIds: Set<string>
): Promise<ScoredMission[]> {
  const queryText = prefs.freeformInterests.trim()
    ? `${prefs.freeformInterests} ${prefs.mood} exploration ${prefs.environment}`
    : `${prefs.mood} exploration outdoors in ${prefs.environment}`;

  const { embedding: queryEmbedding, isFallback, latencyMs } = await modelManager.embedText(queryText);

  // If fallback is active or embedding returned empty
  if (isFallback || queryEmbedding.length === 0) {
    return MISSIONS.map((mission) => {
      const scored = scoreMissionFallback(mission, prefs, completedIds);
      return {
        mission,
        totalScore: scored.totalScore,
        semanticSimilarity: scored.semanticSimilarity,
        timeFit: scored.timeFit,
        environmentFit: scored.environmentFit,
        moodFit: scored.moodFit,
        diversityBonus: scored.diversityBonus,
        scoreBreakdown: `[Deterministic Fallback Scorer] ${scored.explanation}`
      };
    }).sort((a, b) => b.totalScore - a.totalScore);
  }

  // Real local neural embedding ranking
  const scoredMissions: ScoredMission[] = MISSIONS.map((mission) => {
    // 1. Semantic Similarity
    let sim = 0.5;
    if (mission.embedding && mission.embedding.length > 0) {
      sim = cosineSimilarity(queryEmbedding, mission.embedding);
    }

    // 2. Duration Fit
    const diff = Math.abs(mission.duration - prefs.duration);
    const timeFit = diff === 0 ? 1.0 : diff <= 5 ? 0.7 : diff <= 10 ? 0.4 : 0.2;

    // 3. Environment Fit
    const environmentFit =
      mission.environments.includes(prefs.environment) || mission.environments.includes('anywhere')
        ? 1.0
        : 0.25;

    // 4. Mood Fit
    const moodFit = mission.moods.includes(prefs.mood) ? 1.0 : 0.35;

    // 5. Diversity bonus / repetition penalty
    const isCompleted = completedIds.has(mission.id);
    const diversityBonus = isCompleted ? -0.4 : 0.2;

    // Weighted composite
    const baseScore =
      0.45 * sim +
      0.20 * timeFit +
      0.15 * environmentFit +
      0.10 * moodFit +
      0.10 * (diversityBonus > 0 ? diversityBonus : 0);

    const totalScore = Math.max(0, isCompleted ? baseScore * 0.25 : baseScore);

    const scoreBreakdown = `[Local all-MiniLM-L6-v2 Neural Match (${latencyMs}ms)] Cosine: ${(sim * 100).toFixed(1)}% | Time: ${(timeFit * 100).toFixed(0)}% | Env: ${(environmentFit * 100).toFixed(0)}% | Mood: ${(moodFit * 100).toFixed(0)}%${isCompleted ? ' (Previously completed - deprioritized)' : ''}`;

    return {
      mission,
      totalScore,
      semanticSimilarity: sim,
      timeFit,
      environmentFit,
      moodFit,
      diversityBonus,
      scoreBreakdown
    };
  });

  return scoredMissions.sort((a, b) => b.totalScore - a.totalScore);
}
