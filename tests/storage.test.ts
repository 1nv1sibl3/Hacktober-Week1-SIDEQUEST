import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../src/services/storage/indexedDB';
import { MISSIONS } from '../src/data/missions';
import { FieldObservation } from '../src/types';

describe('Storage Service & Session Persistence', () => {
  beforeEach(async () => {
    await storageService.init();
    await storageService.clearAllData();
  });

  it('persists and retrieves field observations reliably', async () => {
    const obs: FieldObservation = {
      id: 'test_exp_1',
      missionId: 'survivor',
      missionTitle: 'The Survivor',
      timestamp: Date.now(),
      durationMinutes: 10,
      actualElapsedSeconds: 612,
      environment: 'campus',
      mood: 'curious',
      userNotes: 'Observed yellow weed in concrete join.'
    };

    await storageService.saveExpedition(obs);
    const list = await storageService.getExpeditions();

    expect(list.length).toBe(1);
    expect(list[0].id).toBe('test_exp_1');
    expect(list[0].missionTitle).toBe('The Survivor');
  });

  it('retains active in-progress quest state across browser refreshes', async () => {
    const questData = {
      mission: MISSIONS[0],
      startedAt: Date.now() - 120000, // 2 minutes ago
      durationMinutes: 10
    };

    await storageService.saveActiveQuest(questData);
    const restored = await storageService.getActiveQuest();

    expect(restored).not.toBeNull();
    expect(restored!.mission.id).toBe(MISSIONS[0].id);
    expect(restored!.startedAt).toBe(questData.startedAt);

    // After finishing mission, clears active quest
    await storageService.saveActiveQuest(null);
    const cleared = await storageService.getActiveQuest();
    expect(cleared).toBeNull();
  });

  it('clears all user data completely upon request', async () => {
    const obs: FieldObservation = {
      id: 'test_exp_2',
      missionId: 'invisible-city',
      missionTitle: 'The Invisible City',
      timestamp: Date.now(),
      durationMinutes: 5,
      actualElapsedSeconds: 300,
      environment: 'park',
      mood: 'calm',
      userNotes: 'Listened to leaf flutter.'
    };

    await storageService.saveExpedition(obs);
    await storageService.saveUnlockedMilestones(['first-bloom']);

    // Clear everything
    await storageService.clearAllData();

    const expeditions = await storageService.getExpeditions();
    const active = await storageService.getActiveQuest();
    const milestones = await storageService.getUnlockedMilestones();

    expect(expeditions.length).toBe(0);
    expect(active).toBeNull();
    expect(milestones.length).toBe(0);
  });
});
