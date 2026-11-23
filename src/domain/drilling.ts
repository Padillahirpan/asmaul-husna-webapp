import type {
  DateKey,
  DrillingQuestion,
  DrillingSession,
  DrillingSummary,
  LearningMode,
  NameId,
  PairResult,
  PointsMap,
  StageNumber,
  UserState,
} from '@/types';
import { applyAnswer, getPoints } from './scoring';
import { ALL_NAME_IDS, evaluateStageUnlock, getUnlockedNameIds } from './stage';
import { addCompletedDate } from './streak';

/** Struktur sesi (PRD v0.4 §6.2). */
export const QUESTIONS_PER_SESSION = 5;
export const PAIRS_PER_QUESTION = 3;
export const PAIRS_PER_SESSION = QUESTIONS_PER_SESSION * PAIRS_PER_QUESTION; // 15

/** Sumber angka acak [0, 1). Disuntikkan agar fungsi tetap murni & dapat diuji. */
export type Rng = () => number;

/** Fisher–Yates; mengembalikan array baru. */
export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

/** Kumpulan kandidat soal sesuai mode aktif. */
export function getDrillingPool(mode: LearningMode, unlockedStage: StageNumber): NameId[] {
  return mode === 'random' ? [...ALL_NAME_IDS] : getUnlockedNameIds(unlockedStage);
}

/**
 * Pilih 15 nama unik dengan prioritas poin terendah (poin sama → acak).
 * - `random`: dari seluruh 99 nama.
 * - `sequential`: dari seluruh nama pada tahap 1..`unlockedStage`.
 * Hasil terurut dari poin terlemah.
 */
export function selectDrillingNames(params: {
  mode: LearningMode;
  unlockedStage: StageNumber;
  points: PointsMap;
  rng?: Rng;
  count?: number;
}): NameId[] {
  const { mode, unlockedStage, points, rng = Math.random, count = PAIRS_PER_SESSION } = params;
  const pool = shuffle(getDrillingPool(mode, unlockedStage), rng);
  // Array.prototype.sort stabil → urutan acak dipertahankan di antara poin yang sama.
  pool.sort((a, b) => getPoints(points, a) - getPoints(points, b));
  return pool.slice(0, count);
}

/** Bagi 15 nama menjadi 5 pertanyaan berisi 3 nama, kartu Arab & arti diacak terpisah. */
export function buildQuestions(nameIds: readonly NameId[], rng: Rng = Math.random): DrillingQuestion[] {
  if (nameIds.length !== PAIRS_PER_SESSION) {
    throw new RangeError(`Sesi membutuhkan ${PAIRS_PER_SESSION} nama, diterima ${nameIds.length}`);
  }
  if (new Set(nameIds).size !== nameIds.length) throw new Error('Nama dalam satu sesi harus unik');
  const questions: DrillingQuestion[] = [];
  for (let q = 0; q < QUESTIONS_PER_SESSION; q++) {
    const ids = nameIds.slice(q * PAIRS_PER_QUESTION, (q + 1) * PAIRS_PER_QUESTION);
    questions.push({ nameIds: ids, arabicOrder: shuffle(ids, rng), meaningOrder: shuffle(ids, rng) });
  }
  return questions;
}

export function createDrillingSession(params: {
  mode: LearningMode;
  unlockedStage: StageNumber;
  points: PointsMap;
  rng?: Rng;
}): DrillingSession {
  const rng = params.rng ?? Math.random;
  const nameIds = selectDrillingNames({ ...params, rng });
  return { mode: params.mode, questions: buildQuestions(nameIds, rng), currentQuestionIndex: 0, results: [] };
}

export function getCurrentQuestion(session: DrillingSession): DrillingQuestion | undefined {
  return session.questions[session.currentQuestionIndex];
}

/** Id kartu Arab yang sudah dijawab pada pertanyaan tertentu. */
export function getAnsweredIds(session: DrillingSession, questionIndex = session.currentQuestionIndex): NameId[] {
  return session.results.filter((r) => r.questionIndex === questionIndex).map((r) => r.arabicId);
}

/** Id yang kartunya (Arab maupun arti) masih tersedia pada pertanyaan aktif. */
export function getRemainingIds(session: DrillingSession): NameId[] {
  const q = getCurrentQuestion(session);
  if (!q) return [];
  const answered = new Set(getAnsweredIds(session));
  return q.nameIds.filter((id) => !answered.has(id));
}

export function isSessionComplete(session: DrillingSession): boolean {
  return session.results.length >= PAIRS_PER_SESSION;
}

export interface AnswerPairResult {
  session: DrillingSession;
  points: PointsMap;
  result: PairResult;
}

/**
 * Jawab satu pasangan (satu kesempatan per pasangan).
 * Benar: poin nama +20. Salah: poin nama pada kartu Arab -5, dan arti yang benar
 * dianggap terungkap (kartu Arab & arti benarnya selesai). Setelah 3 pasangan,
 * pertanyaan maju otomatis.
 */
export function answerPair(
  session: DrillingSession,
  points: PointsMap,
  arabicId: NameId,
  chosenMeaningId: NameId,
): AnswerPairResult {
  if (isSessionComplete(session)) throw new Error('Sesi sudah selesai');
  const remaining = getRemainingIds(session);
  if (!remaining.includes(arabicId)) throw new Error(`Kartu Arab ${arabicId} tidak tersedia`);
  if (!remaining.includes(chosenMeaningId)) throw new Error(`Kartu arti ${chosenMeaningId} tidak tersedia`);

  const correct = arabicId === chosenMeaningId;
  const change = applyAnswer(getPoints(points, arabicId), correct);
  const result: PairResult = {
    questionIndex: session.currentQuestionIndex,
    arabicId,
    chosenMeaningId,
    correct,
    pointsBefore: change.before,
    pointsAfter: change.after,
    delta: change.delta,
  };

  const results = [...session.results, result];
  const answeredInQuestion = results.filter((r) => r.questionIndex === session.currentQuestionIndex).length;
  const questionDone = answeredInQuestion >= PAIRS_PER_QUESTION;
  const nextIndex =
    questionDone && session.currentQuestionIndex < QUESTIONS_PER_SESSION - 1
      ? session.currentQuestionIndex + 1
      : session.currentQuestionIndex;

  return {
    session: { ...session, results, currentQuestionIndex: nextIndex },
    points: { ...points, [arabicId]: change.after },
    result,
  };
}

/** Poin bersih, jumlah benar, dan akurasi sesi. */
export function summarizeSession(session: DrillingSession): {
  netPoints: number;
  correctCount: number;
  totalPairs: number;
  accuracyPercent: number;
} {
  const correctCount = session.results.filter((r) => r.correct).length;
  const netPoints = session.results.reduce((sum, r) => sum + r.delta, 0);
  return {
    netPoints,
    correctCount,
    totalPairs: PAIRS_PER_SESSION,
    accuracyPercent: Math.round((correctCount / PAIRS_PER_SESSION) * 100),
  };
}

/**
 * Finalisasi sesi yang sudah lengkap: catat tanggal streak, evaluasi buka tahap
 * (mode Bertahap), simpan `lastPracticedAt` dan ringkasan. Poin per pasangan
 * diasumsikan sudah tersimpan lewat `answerPair` (PRD: disimpan tiap pasangan).
 */
export function finalizeSession(
  state: UserState,
  session: DrillingSession,
  clock: { today: DateKey; nowIso: string },
): { state: UserState; summary: DrillingSummary } {
  if (!isSessionComplete(session)) throw new Error('Sesi belum lengkap (15 pasangan)');

  const unlock = evaluateStageUnlock({ mode: session.mode, unlockedStage: state.unlockedStage, points: state.points });
  const lastPracticedAt = { ...state.lastPracticedAt };
  for (const r of session.results) lastPracticedAt[r.arabicId] = clock.nowIso;

  const summary: DrillingSummary = {
    completedAt: clock.nowIso,
    mode: session.mode,
    ...summarizeSession(session),
    unlockedNewStage: unlock.newlyUnlocked,
  };

  return {
    summary,
    state: {
      ...state,
      unlockedStage: unlock.unlockedStage,
      lastPracticedAt,
      completedDates: addCompletedDate(state.completedDates, clock.today),
      lastDrillingSummary: summary,
    },
  };
}
