/**
 * High-performance vector math operations for semantic similarity calculations.
 */

export function dotProduct(a: number[] | Float32Array, b: number[] | Float32Array): number {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
  }
  return dot;
}

export function magnitude(vec: number[] | Float32Array): number {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) {
    sum += vec[i] * vec[i];
  }
  return Math.sqrt(sum);
}

export function cosineSimilarity(a: number[] | Float32Array, b: number[] | Float32Array): number {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;
  const dot = dotProduct(a, b);
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) return 0;
  const sim = dot / (magA * magB);
  // Clamp between -1 and 1, then scale to [0, 1] for intuitive display
  const clamped = Math.max(-1, Math.min(1, sim));
  return (clamped + 1) / 2;
}

export function normalizeVector(vec: number[]): number[] {
  const mag = magnitude(vec);
  if (mag === 0) return vec;
  return vec.map(v => v / mag);
}
