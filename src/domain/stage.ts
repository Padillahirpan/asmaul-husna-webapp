import type { LearningMode, NameId, PointsMap, StageNumber } from '@/types';
import { getPoints } from './scoring';

/** Pembagian tahap (PRD v0.4 §6.3.A). */
export const TOTAL_NAMES = 99;
export const STAGE_SIZE = 15;
export const TOTAL_STAGES = 7;
export const FIRST_STAGE: StageNumber = 1;
export const LAST_STAGE: StageNumber = 7;
/** Ambang buka tahap berikutnya: rata-rata tahap terbaru `>= 80`. */
export const UNLOCK_THRESHOLD = 80;

/** Semua id 1..99. */
export const ALL_NAME_IDS: readonly NameId[] = Object.freeze(
  Array.from({ length: TOTAL_NAMES }, (_, i) => i + 1),
);

export function isValidNameId(id: number): boolean {
  return Number.isInteger(id) && id >= 1 && id <= TOTAL_NAMES;
}

/** Normalisasi angka apa pun menjadi tahap valid 1..7. */
export function clampStage(stage: number): StageNumber {
  if (!Number.isFinite(stage)) return FIRST_STAGE;
  return Math.min(LAST_STAGE, Math.max(FIRST_STAGE, Math.floor(stage))) as StageNumber;
}

/** Tahap dari sebuah nama: 1–15 → 1, 16–30 → 2, …, 91–99 → 7. */
export function getStageForName(id: NameId): StageNumber {
  if (!isValidNameId(id)) throw new RangeError(`NameId tidak valid: ${id}`);
  return Math.ceil(id / STAGE_SIZE) as StageNumber;
}

/** Rentang id (inklusif) dari sebuah tahap. */
export function getStageRange(stage: StageNumber): { start: NameId; end: NameId } {
  const s = clampStage(stage);
  const start = (s - 1) * STAGE_SIZE + 1;
  const end = Math.min(s * STAGE_SIZE, TOTAL_NAMES);
  return { start, end };
}

export function getNameIdsInStage(stage: StageNumber): NameId[] {
  const { start, end } = getStageRange(stage);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/** Seluruh id pada tahap 1 s.d. `unlockedStage`. */
export function getUnlockedNameIds(unlockedStage: StageNumber): NameId[] {
  const lastId = getStageRange(clampStage(unlockedStage)).end;
  return Array.from({ length: lastId }, (_, i) => i + 1);
}

/**
 * Status buka sebuah nama di grid.
 * Mode Acak: semua terbuka. Mode Bertahap: terbuka bila tahapnya <= `unlockedStage`.
 */
export function isNameUnlocked(id: NameId, mode: LearningMode, unlockedStage: StageNumber): boolean {
  if (mode === 'random') return true;
  return getStageForName(id) <= clampStage(unlockedStage);
}

function average(points: PointsMap, ids: readonly NameId[]): number {
  if (ids.length === 0) return 0;
  return ids.reduce((sum, id) => sum + getPoints(points, id), 0) / ids.length;
}

/** Rata-rata poin (tanpa pembulatan) seluruh nama di satu tahap. */
export function calculateStageAverage(stage: StageNumber, points: PointsMap): number {
  return average(points, getNameIdsInStage(stage));
}

/** Rata-rata poin (tanpa pembulatan) dari seluruh 99 nama. */
export function calculateOverallAverage(points: PointsMap): number {
  return average(points, ALL_NAME_IDS);
}

export interface StageUnlockResult {
  unlockedStage: StageNumber;
  /** Tahap yang baru terbuka, atau `null` bila tidak ada perubahan. */
  newlyUnlocked: StageNumber | null;
}

/**
 * Dipanggil setelah sesi drilling selesai.
 * Hanya berlaku di mode Bertahap: bila rata-rata tahap `unlockedStage` >= 80
 * dan tahap < 7, buka tahap berikutnya. Mode Acak tidak mengubah `unlockedStage`.
 */
export function evaluateStageUnlock(params: {
  mode: LearningMode;
  unlockedStage: StageNumber;
  points: PointsMap;
}): StageUnlockResult {
  const current = clampStage(params.unlockedStage);
  if (params.mode !== 'sequential' || current >= LAST_STAGE) {
    return { unlockedStage: current, newlyUnlocked: null };
  }
  if (calculateStageAverage(current, params.points) >= UNLOCK_THRESHOLD) {
    const next = (current + 1) as StageNumber;
    return { unlockedStage: next, newlyUnlocked: next };
  }
  return { unlockedStage: current, newlyUnlocked: null };
}

/** Apakah seluruh 99 nama sudah terbuka di mode Bertahap (tahap 7 tercapai rata-rata >= 80). */
export function isAllStagesMastered(unlockedStage: StageNumber, points: PointsMap): boolean {
  return clampStage(unlockedStage) === LAST_STAGE && calculateStageAverage(LAST_STAGE, points) >= UNLOCK_THRESHOLD;
}
