import { describe, expect, it } from 'vitest';
import {
  ALL_NAME_IDS,
  TOTAL_STAGES,
  UNLOCK_THRESHOLD,
  calculateOverallAverage,
  calculateStageAverage,
  clampStage,
  evaluateStageUnlock,
  getNameIdsInStage,
  getStageForName,
  getStageRange,
  getUnlockedNameIds,
  isAllStagesMastered,
  isNameUnlocked,
} from '@/domain/stage';
import type { StageNumber } from '@/types';
import { pointsFor, range } from './helpers';

const STAGES: StageNumber[] = [1, 2, 3, 4, 5, 6, 7];

describe('pembagian 99 nama ke 7 tahap', () => {
  it('tahap 1–6 berisi 15 nama, tahap 7 berisi 9 nama, total 99', () => {
    expect(TOTAL_STAGES).toBe(7);
    const sizes = STAGES.map((s) => getNameIdsInStage(s).length);
    expect(sizes).toEqual([15, 15, 15, 15, 15, 15, 9]);
    expect(sizes.reduce((a, b) => a + b, 0)).toBe(99);
    expect(ALL_NAME_IDS).toEqual(range(1, 99));
  });

  it.each([
    [1, 1, 15],
    [2, 16, 30],
    [3, 31, 45],
    [4, 46, 60],
    [5, 61, 75],
    [6, 76, 90],
    [7, 91, 99],
  ] as const)('tahap %i = nama %i–%i', (stage, start, end) => {
    expect(getStageRange(stage)).toEqual({ start, end });
  });

  it.each([
    [1, 1],
    [15, 1],
    [16, 2],
    [30, 2],
    [31, 3],
    [75, 5],
    [76, 6],
    [90, 6],
    [91, 7],
    [99, 7],
  ])('nama %i berada di tahap %i', (id, stage) => {
    expect(getStageForName(id)).toBe(stage);
  });

  it.each([0, 100, -1, 1.5])('id tidak valid (%s) ditolak', (id) => {
    expect(() => getStageForName(id)).toThrow(RangeError);
  });

  it('clampStage menormalkan nilai ke 1..7', () => {
    expect(clampStage(0)).toBe(1);
    expect(clampStage(9)).toBe(7);
    expect(clampStage(3.7)).toBe(3);
    expect(clampStage(Number.NaN)).toBe(1);
  });
});

describe('nama terbuka (unlocked)', () => {
  it('getUnlockedNameIds mencakup tahap 1 s.d. unlockedStage', () => {
    expect(getUnlockedNameIds(1)).toEqual(range(1, 15));
    expect(getUnlockedNameIds(3)).toEqual(range(1, 45));
    expect(getUnlockedNameIds(7)).toEqual(range(1, 99));
  });

  it('mode Bertahap: hanya tahap <= unlockedStage yang terbuka', () => {
    expect(isNameUnlocked(15, 'sequential', 1)).toBe(true);
    expect(isNameUnlocked(16, 'sequential', 1)).toBe(false);
    expect(isNameUnlocked(30, 'sequential', 2)).toBe(true);
    expect(isNameUnlocked(99, 'sequential', 6)).toBe(false);
    expect(isNameUnlocked(99, 'sequential', 7)).toBe(true);
  });

  it('mode Acak: seluruh 99 nama terbuka berapa pun unlockedStage', () => {
    expect(ALL_NAME_IDS.every((id) => isNameUnlocked(id, 'random', 1))).toBe(true);
  });
});

describe('rata-rata poin', () => {
  it('rata-rata tahap hanya menghitung nama di tahap tersebut; nama tanpa poin = 0', () => {
    const points = { ...pointsFor(range(1, 15), 100), 16: 60 };
    expect(calculateStageAverage(1, points)).toBe(100);
    expect(calculateStageAverage(2, points)).toBe(4);
  });

  it('rata-rata tahap 7 dihitung dari 9 nama', () => {
    expect(calculateStageAverage(7, pointsFor(range(91, 99), 90))).toBe(90);
    expect(calculateStageAverage(7, pointsFor(range(91, 95), 90))).toBe(50);
  });

  it('rata-rata keseluruhan dari 99 nama', () => {
    expect(calculateOverallAverage({})).toBe(0);
    expect(calculateOverallAverage(pointsFor(ALL_NAME_IDS, 100))).toBe(100);
    expect(calculateOverallAverage(pointsFor(range(1, 33), 30))).toBeCloseTo(10);
  });
});

describe('evaluateStageUnlock — ambang >= 80', () => {
  it(`ambang adalah ${UNLOCK_THRESHOLD}`, () => {
    expect(UNLOCK_THRESHOLD).toBe(80);
  });

  it('rata-rata tepat 80 membuka tahap berikutnya', () => {
    const points = pointsFor(range(1, 15), 80);
    expect(calculateStageAverage(1, points)).toBe(80);
    expect(evaluateStageUnlock({ mode: 'sequential', unlockedStage: 1, points })).toEqual({
      unlockedStage: 2,
      newlyUnlocked: 2,
    });
  });

  it('rata-rata tepat 79 belum membuka tahap', () => {
    // 14 × 80 + 65 = 1185 → 1185 / 15 = 79
    const points = { ...pointsFor(range(1, 14), 80), 15: 65 };
    expect(calculateStageAverage(1, points)).toBe(79);
    expect(evaluateStageUnlock({ mode: 'sequential', unlockedStage: 1, points })).toEqual({
      unlockedStage: 1,
      newlyUnlocked: null,
    });
  });

  it('rata-rata pecahan sedikit di bawah 80 (79.67) tidak dibulatkan ke atas', () => {
    // 14 × 80 + 75 = 1195 → 79.666…
    const points = { ...pointsFor(range(1, 14), 80), 15: 75 };
    expect(evaluateStageUnlock({ mode: 'sequential', unlockedStage: 1, points }).newlyUnlocked).toBeNull();
  });

  it('hanya tahap terbaru (unlockedStage) yang dievaluasi, bukan tahap lama', () => {
    const points = pointsFor(range(1, 15), 100); // tahap 1 sempurna, tahap 2 masih 0
    expect(evaluateStageUnlock({ mode: 'sequential', unlockedStage: 2, points })).toEqual({
      unlockedStage: 2,
      newlyUnlocked: null,
    });
    const stage2Ready = { ...pointsFor(range(1, 15), 0), ...pointsFor(range(16, 30), 80) };
    expect(evaluateStageUnlock({ mode: 'sequential', unlockedStage: 2, points: stage2Ready }).newlyUnlocked).toBe(3);
  });

  it('hanya naik satu tahap per evaluasi meskipun tahap berikutnya juga sudah tinggi', () => {
    const points = pointsFor(ALL_NAME_IDS, 100);
    expect(evaluateStageUnlock({ mode: 'sequential', unlockedStage: 1, points }).unlockedStage).toBe(2);
  });

  it('tahap 6 → 7 memakai rata-rata 15 nama tahap 6', () => {
    const points = pointsFor(range(76, 90), 80);
    expect(evaluateStageUnlock({ mode: 'sequential', unlockedStage: 6, points }).newlyUnlocked).toBe(7);
  });

  it('di tahap 7 tidak ada tahap baru meski rata-rata >= 80', () => {
    const points = pointsFor(range(91, 99), 100);
    expect(evaluateStageUnlock({ mode: 'sequential', unlockedStage: 7, points })).toEqual({
      unlockedStage: 7,
      newlyUnlocked: null,
    });
    expect(isAllStagesMastered(7, points)).toBe(true);
    expect(isAllStagesMastered(7, pointsFor(range(91, 99), 79))).toBe(false);
    expect(isAllStagesMastered(6, points)).toBe(false);
  });

  it('mode Acak tidak pernah mengubah unlockedStage', () => {
    const points = pointsFor(ALL_NAME_IDS, 100);
    expect(evaluateStageUnlock({ mode: 'random', unlockedStage: 2, points })).toEqual({
      unlockedStage: 2,
      newlyUnlocked: null,
    });
  });
});
