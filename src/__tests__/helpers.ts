import type { Rng } from '@/domain/drilling';

/** RNG deterministik (mulberry32) agar test acak tetap reprodusibel. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Buat PointsMap: semua id pada `ids` bernilai `value`. */
export function pointsFor(ids: readonly number[], value: number): Record<number, number> {
  return Object.fromEntries(ids.map((id) => [id, value]));
}

export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
