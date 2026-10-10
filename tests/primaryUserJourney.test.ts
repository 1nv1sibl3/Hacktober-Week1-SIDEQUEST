import { describe, it, expect, beforeEach } from 'vitest';
import { MISSIONS, MISSION_MAP } from '../src/data/missions';
import { rankMissions } from '../src/services/ai/missionSelector';
import { generateDiscoveryCard } from '../src/services/ai/discoveryEngine';
import { storageService } from '../src/services/storage/indexedDB';
import { UserPreferences, FieldObservation, ScoredMission } from '../src/types';

describe('Complete Primary User Journey: End-to-End Test', () => {
  beforeEach(async () => {
    await storageService.init();
    await storageService.clearAllData();
  });

  it('executes the complete 10-step exploration journey seamlessly without any API key', async () => {
    // ----------------------------------------------------
    // Step 1: User opens the app (Preferences initialized)
    // ----------------------------------------------------
    const userPrefs: UserPreferences = {
      duration: 10,
      mood: 'curious',
      environment: 'campus',
      freeformInterests: 'concrete cracks and wild seedlings'
    };

    // ----------------------------------------------------
    // Step 2 & 3: Local AI mission ranking & selection
    // ----------------------------------------------------
    const completedIds = new Set<string>();
    const rankedMissions: ScoredMission[] = await rankMissions(userPrefs, completedIds);

    expect(rankedMissions.length).toBeGreaterThanOrEqual(30);
    const chosenMission = rankedMissions[0].mission;
    expect(chosenMission).toBeDefined();
    expect(chosenMission.title).toBeDefined();
    expect(chosenMission.objective).toBeDefined();
    expect(chosenMission.safetyNotice.length).toBeGreaterThan(10);

    // ----------------------------------------------------
    // Step 4: Enter Pocket Mode (State persisted for refresh protection)
    // ----------------------------------------------------
    const startedAt = Date.now() - 600000; // Simulated 10 minutes ago
    await storageService.saveActiveQuest({
      mission: chosenMission,
      startedAt,
      durationMinutes: chosenMission.duration
    });

    // Verify recovery after simulated browser refresh during mission
    const activeQuestOnReload = await storageService.getActiveQuest();
    expect(activeQuestOnReload).not.toBeNull();
    expect(activeQuestOnReload!.mission.id).toBe(chosenMission.id);

    // ----------------------------------------------------
    // Step 5: Complete the mission ("I'm back")
    // ----------------------------------------------------
    const simulatedElapsedSeconds = 645; // 10 minutes 45 seconds
    await storageService.saveActiveQuest(null); // Cleared upon return

    // ----------------------------------------------------
    // Step 6: Record field observation in Field Journal
    // ----------------------------------------------------
    const fieldNoteText = 'Observed a hardy yellow flower growing directly out of an asphalt seam near the campus bike racks. Surrounding pavement was hot, but the crack held damp soil.';
    const surprisingObservation = 'Ants were using the plant stem to climb above the hot asphalt.';
    const nextIdea = 'Look for moisture paths leading to that crack.';

    // ----------------------------------------------------
    // Step 7: Local AI Discovery Engine generates Discovery Card
    // ----------------------------------------------------
    completedIds.add(chosenMission.id);
    const discoveryCard = await generateDiscoveryCard(
      fieldNoteText,
      chosenMission,
      surprisingObservation,
      nextIdea,
      completedIds
    );

    expect(discoveryCard).toBeDefined();
    expect(discoveryCard.observationSummary).toContain('Observed a hardy yellow flower');
    expect(discoveryCard.interpretiveInsight).toBeDefined();
    expect(discoveryCard.confidenceScore).toBeGreaterThan(0.6);
    expect(discoveryCard.confidenceScore).toBeLessThanOrEqual(1.0);
    expect(discoveryCard.modelAttribution.isLocal).toBe(true);

    // Save observation into journal
    const expeditionRecord: FieldObservation = {
      id: `exp_${Date.now()}`,
      missionId: chosenMission.id,
      missionTitle: chosenMission.title,
      timestamp: Date.now(),
      durationMinutes: chosenMission.duration,
      actualElapsedSeconds: simulatedElapsedSeconds,
      environment: userPrefs.environment,
      mood: userPrefs.mood,
      userNotes: fieldNoteText,
      surprisingFinding: surprisingObservation,
      investigateNextIdea: nextIdea,
      discoveryCard
    };

    await storageService.saveExpedition(expeditionRecord);

    // ----------------------------------------------------
    // Step 8: Receive a related next mission
    // ----------------------------------------------------
    const nextMissionId = discoveryCard.suggestedNextMissionId;
    expect(nextMissionId).toBeDefined();
    expect(nextMissionId).not.toBe(chosenMission.id);
    const nextMission = MISSION_MAP.get(nextMissionId);
    expect(nextMission).toBeDefined();

    // ----------------------------------------------------
    // Step 9: Simulate full browser refresh and verify journal persistence
    // ----------------------------------------------------
    const persistedExpeditions = await storageService.getExpeditions();
    expect(persistedExpeditions.length).toBe(1);
    expect(persistedExpeditions[0].missionTitle).toBe(chosenMission.title);
    expect(persistedExpeditions[0].discoveryCard?.observationSummary).toBe(discoveryCard.observationSummary);

    // ----------------------------------------------------
    // Step 10: Verify core mission selection works without Gemini API key
    // ----------------------------------------------------
    expect(process.env.GEMINI_API_KEY).toBeUndefined();
    const offlinePrefs: UserPreferences = {
      duration: 5,
      mood: 'observant',
      environment: 'garden',
      freeformInterests: ''
    };
    const offlineRanked = await rankMissions(offlinePrefs, new Set([chosenMission.id]));
    expect(offlineRanked.length).toBe(36);
    expect(offlineRanked[0].totalScore).toBeGreaterThan(0);
    expect(offlineRanked[0].mission.id).not.toBe(chosenMission.id);
  });
});
