import { describe, it, expect } from 'vitest';
import { MISSIONS } from '../src/data/missions';
import { generateDiscoveryCard } from '../src/services/ai/discoveryEngine';

describe('Discovery Engine and Semantic Synthesis', () => {
  it('synthesizes a valid Discovery Card for urban botanical resilience observation', async () => {
    const currentMission = MISSIONS.find((m) => m.id === 'survivor') || MISSIONS[0];
    const userNotes = 'Found a small green dandelion sprout growing through an expansion joint in the concrete pathway.';
    const surprisingFinding = 'The mortar had cracked into fine sand where its roots anchored.';
    const investigateNext = 'Check if water pools there during rain.';

    const card = await generateDiscoveryCard(
      userNotes,
      currentMission,
      surprisingFinding,
      investigateNext,
      new Set([currentMission.id])
    );

    expect(card.id).toBeDefined();
    expect(card.observationSummary).toContain('Found a small green dandelion sprout');
    expect(card.interpretiveInsight.length).toBeGreaterThan(20);
    expect(card.curiosityQuestion.length).toBeGreaterThan(10);
    expect(card.suggestedNextMissionId).not.toBe(currentMission.id);
    expect(card.confidenceScore).toBeGreaterThanOrEqual(0.6);
    expect(card.confidenceScore).toBeLessThanOrEqual(1.0);
    expect(card.matchedThemes.length).toBeGreaterThan(0);
    expect(card.modelAttribution.isLocal).toBe(true);
  });

  it('handles empty, whitespace-only, and malformed notes gracefully without throwing', async () => {
    const currentMission = MISSIONS[0];

    const cardEmpty = await generateDiscoveryCard('', currentMission, '', '', new Set());
    expect(cardEmpty).toBeDefined();
    expect(cardEmpty.observationSummary).toBeDefined();

    const cardWhitespace = await generateDiscoveryCard('     ', currentMission, '   ', ' ', new Set());
    expect(cardWhitespace).toBeDefined();
    expect(cardWhitespace.interpretiveInsight).toBeDefined();

    const cardSymbols = await generateDiscoveryCard('!@#$%^&*()_+~`|}{[]:;?><,./', currentMission, '', '', new Set());
    expect(cardSymbols).toBeDefined();
    expect(cardSymbols.suggestedNextMissionId).not.toBe(currentMission.id);
  });

  it('suggests a distinct next mission that was not completed in the session', async () => {
    const currentMission = MISSIONS[1];
    const completed = new Set(['survivor', 'invisible-city', 'pattern-hunter']);

    const card = await generateDiscoveryCard(
      'Noticed loud crows calling from the transformer pole.',
      currentMission,
      '',
      '',
      completed
    );

    expect(completed.has(card.suggestedNextMissionId)).toBe(false);
    expect(card.suggestedNextMissionId).not.toBe(currentMission.id);
  });
});
