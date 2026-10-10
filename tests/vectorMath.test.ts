import { describe, it, expect } from 'vitest';
import { dotProduct, magnitude, cosineSimilarity, normalizeVector } from '../src/services/ai/vectorMath';

describe('Vector Math Utilities', () => {
  it('calculates dot product correctly', () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];
    expect(dotProduct(a, b)).toBe(1 * 4 + 2 * 5 + 3 * 6); // 32
  });

  it('calculates magnitude correctly', () => {
    const a = [3, 4];
    expect(magnitude(a)).toBe(5);
  });

  it('calculates cosine similarity for identical vectors as 1.0', () => {
    const a = [1, 2, 3];
    const b = [1, 2, 3];
    const sim = cosineSimilarity(a, b);
    expect(sim).toBeCloseTo(1.0, 4);
  });

  it('calculates cosine similarity for orthogonal vectors as 0.5 (scaled [0,1])', () => {
    const a = [1, 0];
    const b = [0, 1];
    const sim = cosineSimilarity(a, b);
    expect(sim).toBeCloseTo(0.5, 4);
  });

  it('handles empty or zero magnitude vectors gracefully without throwing', () => {
    expect(cosineSimilarity([], [])).toBe(0);
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0);
  });

  it('normalizes vector to unit magnitude', () => {
    const a = [3, 4];
    const norm = normalizeVector(a);
    expect(norm[0]).toBeCloseTo(0.6, 4);
    expect(norm[1]).toBeCloseTo(0.8, 4);
    expect(magnitude(norm)).toBeCloseTo(1.0, 4);
  });
});
