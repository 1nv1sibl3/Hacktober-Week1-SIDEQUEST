import { describe, it, expect } from 'vitest';
import { MISSIONS } from '../src/data/missions';

describe('Safety Considerations & Outdoor Ethics Compliance', () => {
  it('ensures every single mission contains an explicit safety notice', () => {
    MISSIONS.forEach((m) => {
      expect(m.safetyNotice).toBeDefined();
      expect(m.safetyNotice.trim().length).toBeGreaterThan(15);
    });
  });

  it('verifies no mission instructs unsafe actions (eating wild flora, touching organisms, trespassing, traffic)', () => {
    // Regex checking whole word imperatives that would violate safety
    const forbiddenPatterns = [
      /\b(eat|ingest|taste|swallow)\b/i,
      /\b(trespass)\b/i,
      /\b(touch the spider|pick up snake|touch unknown)\b/i,
      /\b(step into traffic|cross moving traffic)\b/i
    ];

    MISSIONS.forEach((m) => {
      // Check title, objective, and clues (which tell the user what to do)
      const actionText = `${m.title} ${m.objective} ${m.clues.join(' ')}`;
      forbiddenPatterns.forEach((pattern) => {
        const match = pattern.test(actionText);
        expect(match, `Forbidden instruction pattern ${pattern} found in mission ${m.id}`).toBe(false);
      });
    });
  });

  it('ensures every mission contains 3 clues and 2 reflection prompts', () => {
    MISSIONS.forEach((m) => {
      expect(m.clues.length).toBe(3);
      m.clues.forEach((c) => expect(c.trim().length).toBeGreaterThan(10));
      expect(m.reflectionPrompts.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('ensures missions support accessible urban environments (campus, garden, neighborhood, anywhere)', () => {
    const accessibleEnvironments = new Set(['campus', 'garden', 'neighborhood', 'park', 'anywhere']);
    MISSIONS.forEach((m) => {
      expect(m.environments.length).toBeGreaterThan(0);
      m.environments.forEach((env) => {
        expect(accessibleEnvironments.has(env)).toBe(true);
      });
    });
  });
});
