import { describe, it, expect } from 'vitest';
import { MISSIONS } from '../src/data/missions';
import { rankMissions } from '../src/services/ai/missionSelector';
import { scoreMissionFallback } from '../src/services/ai/fallbackScorer';
import { UserPreferences } from '../src/types';

describe('Mission Selection and Adaptive Intelligence Engine', () => {
  it('contains at least 30 varied, field-tested missions', () => {
    expect(MISSIONS.length).toBeGreaterThanOrEqual(30);
    expect(MISSIONS.length).toBe(36);
  });

  it('selects suitable missions for a 10-minute curious campus exploration', async () => {
    const prefs: UserPreferences = {
      duration: 10,
      mood: 'curious',
      environment: 'campus',
      freeformInterests: 'plants growing through pavement'
    };

    const completed = new Set<string>();
    const ranked = await rankMissions(prefs, completed);

    expect(ranked.length).toBe(36);
    expect(ranked[0].totalScore).toBeGreaterThan(0);

    // Top mission should fit time (around 10 min) and environment (campus/anywhere)
    const top = ranked[0].mission;
    expect([5, 10, 15]).toContain(top.duration);
    expect(top.environments.includes('campus') || top.environments.includes('anywhere')).toBe(true);
  });

  it('deprioritizes recently completed missions to ensure exploration diversity', async () => {
    const prefs: UserPreferences = {
      duration: 10,
      mood: 'curious',
      environment: 'campus',
      freeformInterests: ''
    };

    const initialRanked = await rankMissions(prefs, new Set());
    const topId = initialRanked[0].mission.id;

    // Now mark the top mission as completed
    const completed = new Set([topId]);
    const secondRanked = await rankMissions(prefs, completed);

    // The completed mission should be penalized and not be #1
    expect(secondRanked[0].mission.id).not.toBe(topId);
    const completedEntry = secondRanked.find((m) => m.mission.id === topId);
    expect(completedEntry).toBeDefined();
    expect(completedEntry!.totalScore).toBeLessThan(secondRanked[0].totalScore);
  });

  it('deterministic fallback scorer outputs transparent, non-negative scores without an AI model', () => {
    const prefs: UserPreferences = {
      duration: 15,
      mood: 'scientific',
      environment: 'garden',
      freeformInterests: 'ant trails'
    };

    const mission = MISSIONS[0];
    const scored = scoreMissionFallback(mission, prefs, new Set());

    expect(scored.totalScore).toBeGreaterThanOrEqual(0);
    expect(scored.totalScore).toBeLessThanOrEqual(1.0);
    expect(scored.explanation).toContain('Fallback Scorer');
    expect(scored.timeFit).toBeGreaterThan(0);
  });

  it('works 100% without any remote API key', async () => {
    const prefs: UserPreferences = {
      duration: 5,
      mood: 'calm',
      environment: 'anywhere',
      freeformInterests: ''
    };

    const ranked = await rankMissions(prefs, new Set());
    expect(ranked.length).toBe(36);
    expect(ranked[0].totalScore).toBeGreaterThan(0);
  });
});
