import { describe, expect, it } from 'vitest';
import {
  CORRECT_DELTA,
  POINTS_INITIAL,
  POINTS_MAX,
  POINTS_MIN,
  WRONG_DELTA,
  applyAnswer,
  clampPoints,
  countByStatus,
  getPoints,
  getStatus,
  getStatusLabel,
} from '@/domain/scoring';

describe('scoring — konstanta PRD', () => {
  it('poin awal 0, rentang 0..100, benar +20, salah -5', () => {
    expect(POINTS_INITIAL).toBe(0);
    expect(POINTS_MIN).toBe(0);
    expect(POINTS_MAX).toBe(100);
    expect(CORRECT_DELTA).toBe(20);
    expect(WRONG_DELTA).toBe(-5);
  });
});

describe('clampPoints', () => {
  it.each([
    [-50, 0],
    [-1, 0],
    [0, 0],
    [55, 55],
    [100, 100],
    [101, 100],
    [500, 100],
    [Number.NaN, 0],
    [Number.POSITIVE_INFINITY, 0],
  ])('clampPoints(%s) = %s', (input, expected) => {
    expect(clampPoints(input)).toBe(expected);
  });
});

describe('getPoints', () => {
  it('nama yang belum pernah dilatih bernilai 0', () => {
    expect(getPoints({}, 7)).toBe(0);
  });
  it('nilai tersimpan di luar rentang tetap dibatasi', () => {
    expect(getPoints({ 1: 140, 2: -9 }, 1)).toBe(100);
    expect(getPoints({ 1: 140, 2: -9 }, 2)).toBe(0);
  });
});

describe('applyAnswer', () => {
  it('benar menambah +20', () => {
    expect(applyAnswer(0, true)).toEqual({ before: 0, after: 20, delta: 20 });
    expect(applyAnswer(40, true)).toEqual({ before: 40, after: 60, delta: 20 });
  });

  it('salah mengurangi -5', () => {
    expect(applyAnswer(50, false)).toEqual({ before: 50, after: 45, delta: -5 });
  });

  it('tidak pernah di bawah 0 (delta aktual dilaporkan)', () => {
    expect(applyAnswer(0, false)).toEqual({ before: 0, after: 0, delta: 0 });
    expect(applyAnswer(3, false)).toEqual({ before: 3, after: 0, delta: -3 });
  });

  it('tidak pernah di atas 100 (delta aktual dilaporkan)', () => {
    expect(applyAnswer(95, true)).toEqual({ before: 95, after: 100, delta: 5 });
    expect(applyAnswer(100, true)).toEqual({ before: 100, after: 100, delta: 0 });
  });

  it('5 jawaban benar beruntun dari 0 mencapai tepat 100, jawaban ke-6 tetap 100', () => {
    let p = 0;
    for (let i = 0; i < 5; i++) p = applyAnswer(p, true).after;
    expect(p).toBe(100);
    expect(applyAnswer(p, true).after).toBe(100);
  });

  it('banyak jawaban salah beruntun tetap di 0', () => {
    let p = 20;
    for (let i = 0; i < 10; i++) p = applyAnswer(p, false).after;
    expect(p).toBe(0);
  });
});

describe('getStatus — pemetaan poin ke status', () => {
  it.each([
    [0, 'unlearned'],
    [5, 'unlearned'],
    [19, 'unlearned'],
    [20, 'learning'],
    [45, 'learning'],
    [59, 'learning'],
    [60, 'almost'],
    [80, 'almost'],
    [99, 'almost'],
    [100, 'memorized'],
  ] as const)('poin %i → %s', (points, status) => {
    expect(getStatus(points)).toBe(status);
  });

  it('label bahasa Indonesia sesuai PRD', () => {
    expect(getStatusLabel(0)).toBe('Belum hafal');
    expect(getStatusLabel(20)).toBe('Belajar');
    expect(getStatusLabel(60)).toBe('Hampir hafal');
    expect(getStatusLabel(100)).toBe('Hafal');
  });

  it('nilai di luar rentang dibatasi lebih dulu', () => {
    expect(getStatus(-10)).toBe('unlearned');
    expect(getStatus(150)).toBe('memorized');
  });
});

describe('countByStatus', () => {
  it('menghitung jumlah nama per status, nama tanpa poin = Belum hafal', () => {
    const counts = countByStatus({ 1: 100, 2: 60, 3: 59, 4: 20, 5: 19 }, [1, 2, 3, 4, 5, 6]);
    expect(counts).toEqual({ memorized: 1, almost: 1, learning: 2, unlearned: 2 });
  });
});
