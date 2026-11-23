import type { MemorizationStatus, NameId, PointsMap } from '@/types';

/** Aturan poin hafalan (PRD v0.4 §6.1). */
export const POINTS_MIN = 0;
export const POINTS_MAX = 100;
export const POINTS_INITIAL = 0;
export const CORRECT_DELTA = 20;
export const WRONG_DELTA = -5;

export const STATUS_LABELS: Record<MemorizationStatus, string> = {
  unlearned: 'Belum hafal',
  learning: 'Belajar',
  almost: 'Hampir hafal',
  memorized: 'Hafal',
};

/** Urutan status dari terlemah ke terkuat (untuk tampilan ringkasan). */
export const STATUS_ORDER: readonly MemorizationStatus[] = ['unlearned', 'learning', 'almost', 'memorized'];

/** Batasi poin ke rentang 0..100. Nilai non-finite dianggap 0. */
export function clampPoints(points: number): number {
  if (!Number.isFinite(points)) return POINTS_MIN;
  return Math.min(POINTS_MAX, Math.max(POINTS_MIN, points));
}

/** Ambil poin sebuah nama; nama yang belum pernah dilatih bernilai 0. */
export function getPoints(points: PointsMap, id: NameId): number {
  return clampPoints(points[id] ?? POINTS_INITIAL);
}

export interface ScoreChange {
  before: number;
  after: number;
  /** Perubahan aktual setelah pembatasan 0..100 (mis. 95 + 20 → delta 5). */
  delta: number;
}

/** Hitung poin baru setelah satu pasangan dijawab: benar +20, salah -5. */
export function applyAnswer(currentPoints: number, correct: boolean): ScoreChange {
  const before = clampPoints(currentPoints);
  const after = clampPoints(before + (correct ? CORRECT_DELTA : WRONG_DELTA));
  return { before, after, delta: after - before };
}

/** Pemetaan poin → status: 0–19, 20–59, 60–99, 100. */
export function getStatus(points: number): MemorizationStatus {
  const p = clampPoints(points);
  if (p >= 100) return 'memorized';
  if (p >= 60) return 'almost';
  if (p >= 20) return 'learning';
  return 'unlearned';
}

export function getStatusLabel(points: number): string {
  return STATUS_LABELS[getStatus(points)];
}

/** Hitung jumlah nama per status untuk daftar `ids`. */
export function countByStatus(points: PointsMap, ids: readonly NameId[]): Record<MemorizationStatus, number> {
  const counts: Record<MemorizationStatus, number> = { unlearned: 0, learning: 0, almost: 0, memorized: 0 };
  for (const id of ids) counts[getStatus(getPoints(points, id))] += 1;
  return counts;
}
