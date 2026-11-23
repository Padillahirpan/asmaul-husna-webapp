import { describe, expect, it } from 'vitest';
import {
  PAIRS_PER_SESSION,
  QUESTIONS_PER_SESSION,
  answerPair,
  buildQuestions,
  createDrillingSession,
  finalizeSession,
  getCurrentQuestion,
  getDrillingPool,
  getRemainingIds,
  isSessionComplete,
  selectDrillingNames,
  shuffle,
  summarizeSession,
} from '@/domain/drilling';
import { getPoints } from '@/domain/scoring';
import { ALL_NAME_IDS, getStageForName, isNameUnlocked } from '@/domain/stage';
import { completeOnboarding, createDefaultUserState, setLearningMode } from '@/domain/userState';
import type { DrillingSession, PointsMap, UserState } from '@/types';
import { pointsFor, range, seededRng } from './helpers';

const CLOCK = { today: '2026-11-22', nowIso: '2026-11-22T09:00:00.000Z' };

/** Jawab seluruh sesi; `isCorrect(id)` menentukan pasangan benar/salah. */
function playSession(
  session: DrillingSession,
  points: PointsMap,
  isCorrect: (arabicId: number) => boolean = () => true,
): { session: DrillingSession; points: PointsMap } {
  let s = session;
  let p = points;
  while (!isSessionComplete(s)) {
    const remaining = getRemainingIds(s);
    const arabicId = remaining[0]!;
    const meaningId = isCorrect(arabicId) || remaining.length === 1 ? arabicId : remaining[1]!;
    ({ session: s, points: p } = answerPair(s, p, arabicId, meaningId));
  }
  return { session: s, points: p };
}

/** Jalankan satu sesi lengkap di atas `UserState` (mirip alur store). */
function runFullSession(state: UserState, seed: number, isCorrect?: (id: number) => boolean) {
  const session = createDrillingSession({
    mode: state.learningMode,
    unlockedStage: state.unlockedStage,
    points: state.points,
    rng: seededRng(seed),
  });
  const played = playSession(session, state.points, isCorrect);
  return finalizeSession({ ...state, points: played.points }, played.session, CLOCK);
}

function onboarded(mode: UserState['learningMode']): UserState {
  return completeOnboarding(createDefaultUserState(CLOCK.today), {
    userName: 'Fulan',
    learningMode: mode,
    targetDays: 30,
    today: CLOCK.today,
  });
}

describe('konstanta sesi', () => {
  it('1 sesi = 5 pertanyaan = 15 pasangan', () => {
    expect(QUESTIONS_PER_SESSION).toBe(5);
    expect(PAIRS_PER_SESSION).toBe(15);
  });
});

describe('shuffle', () => {
  it('menghasilkan permutasi tanpa memutasi input & deterministik dengan seed', () => {
    const input = range(1, 10);
    const a = shuffle(input, seededRng(1));
    expect([...a].sort((x, y) => x - y)).toEqual(input);
    expect(input).toEqual(range(1, 10));
    expect(shuffle(input, seededRng(1))).toEqual(a);
  });
});

describe('selectDrillingNames — mode Bertahap (sequential)', () => {
  it('tahap 1: seluruh 15 nama tahap 1 dipakai', () => {
    const ids = selectDrillingNames({ mode: 'sequential', unlockedStage: 1, points: {}, rng: seededRng(3) });
    expect([...ids].sort((a, b) => a - b)).toEqual(range(1, 15));
  });

  it('tahap 1: tetap ke-15 nama meskipun sebagian sudah 100', () => {
    const ids = selectDrillingNames({ mode: 'sequential', unlockedStage: 1, points: pointsFor(range(1, 10), 100) });
    expect(new Set(ids)).toEqual(new Set(range(1, 15)));
  });

  it('mengambil dari seluruh tahap yang sudah terbuka, bukan hanya tahap terbaru', () => {
    // Tahap 1–3 terbuka. Nama tahap lama yang turun ikut terlatih.
    const points = { ...pointsFor(range(1, 45), 100), 2: 40, 7: 0, 20: 60, 33: 20 };
    const ids = selectDrillingNames({ mode: 'sequential', unlockedStage: 3, points, rng: seededRng(9) });
    expect(ids).toHaveLength(15);
    expect(ids.slice(0, 4)).toEqual([7, 33, 2, 20]); // poin terendah lebih dulu
    expect(ids.every((id) => id <= 45)).toBe(true);
  });

  it('tidak pernah memasukkan nama dari tahap terkunci walau poinnya lebih rendah', () => {
    const points = pointsFor(range(1, 30), 100); // tahap 1–2 sempurna, sisanya 0
    const ids = selectDrillingNames({ mode: 'sequential', unlockedStage: 2, points, rng: seededRng(5) });
    expect(ids.every((id) => getStageForName(id) <= 2)).toBe(true);
    expect(new Set(ids).size).toBe(15);
  });

  it('prioritas poin terendah: tidak ada nama terlewat yang poinnya lebih rendah dari yang terpilih', () => {
    const rng = seededRng(11);
    const points: PointsMap = Object.fromEntries(range(1, 60).map((id) => [id, Math.floor(rng() * 6) * 20]));
    const ids = selectDrillingNames({ mode: 'sequential', unlockedStage: 4, points, rng: seededRng(12) });
    const chosenMax = Math.max(...ids.map((id) => getPoints(points, id)));
    const leftoverMin = Math.min(...range(1, 60).filter((id) => !ids.includes(id)).map((id) => getPoints(points, id)));
    expect(chosenMax).toBeLessThanOrEqual(leftoverMin);
    const sortedPoints = ids.map((id) => getPoints(points, id));
    expect(sortedPoints).toEqual([...sortedPoints].sort((a, b) => a - b));
  });
});

describe('selectDrillingNames — mode Acak (random)', () => {
  it('kandidat adalah seluruh 99 nama', () => {
    expect(getDrillingPool('random', 1)).toEqual([...ALL_NAME_IDS]);
    expect(getDrillingPool('sequential', 2)).toEqual(range(1, 30));
  });

  it('memilih 15 nama berpoin terendah dari seluruh 99, termasuk tahap yang terkunci di mode Bertahap', () => {
    const weakest = range(85, 99);
    const points = { ...pointsFor(ALL_NAME_IDS, 100), ...pointsFor(weakest, 0) };
    const ids = selectDrillingNames({ mode: 'random', unlockedStage: 1, points, rng: seededRng(2) });
    expect(new Set(ids)).toEqual(new Set(weakest));
  });

  it('nama dengan poin sama dipilih acak (seed berbeda → pilihan berbeda)', () => {
    const a = selectDrillingNames({ mode: 'random', unlockedStage: 1, points: {}, rng: seededRng(1) });
    const b = selectDrillingNames({ mode: 'random', unlockedStage: 1, points: {}, rng: seededRng(2) });
    expect(new Set(a).size).toBe(15);
    expect(a).not.toEqual(b);
  });

  it('dalam banyak sesi, setiap nama berpoin sama berpeluang terpilih', () => {
    const seen = new Set<number>();
    for (let seed = 1; seed <= 200; seed++) {
      selectDrillingNames({ mode: 'random', unlockedStage: 1, points: {}, rng: seededRng(seed) }).forEach((id) =>
        seen.add(id),
      );
    }
    expect(seen.size).toBe(99);
  });
});

describe('buildQuestions', () => {
  const ids = range(1, 15);

  it('5 pertanyaan × 3 nama unik; kartu Arab & arti adalah permutasi nama yang sama', () => {
    const qs = buildQuestions(ids, seededRng(4));
    expect(qs).toHaveLength(5);
    expect(qs.flatMap((q) => q.nameIds)).toEqual(ids);
    for (const q of qs) {
      expect(q.nameIds).toHaveLength(3);
      expect([...q.arabicOrder].sort((a, b) => a - b)).toEqual([...q.nameIds].sort((a, b) => a - b));
      expect([...q.meaningOrder].sort((a, b) => a - b)).toEqual([...q.nameIds].sort((a, b) => a - b));
    }
  });

  it('nama terlemah muncul di pertanyaan pertama', () => {
    const qs = buildQuestions([9, 4, 1, ...range(20, 31)], seededRng(4));
    expect(qs[0]!.nameIds).toEqual([9, 4, 1]);
  });

  it('urutan kartu diacak (tidak selalu sama dengan urutan nama)', () => {
    const shuffledSomewhere = range(1, 20).some((seed) =>
      buildQuestions(ids, seededRng(seed)).some(
        (q) => q.arabicOrder.join() !== q.nameIds.join() || q.meaningOrder.join() !== q.nameIds.join(),
      ),
    );
    expect(shuffledSomewhere).toBe(true);
  });

  it('menolak jumlah nama ≠ 15 atau nama duplikat', () => {
    expect(() => buildQuestions(range(1, 14))).toThrow();
    expect(() => buildQuestions([...range(1, 14), 1])).toThrow();
  });
});

describe('answerPair — satu kesempatan per pasangan', () => {
  const base = () => createDrillingSession({ mode: 'sequential', unlockedStage: 1, points: {}, rng: seededRng(7) });

  it('pasangan benar: poin nama +20', () => {
    const s = base();
    const id = getCurrentQuestion(s)!.nameIds[0]!;
    const out = answerPair(s, {}, id, id);
    expect(out.result).toMatchObject({ correct: true, delta: 20, pointsAfter: 20 });
    expect(out.points[id]).toBe(20);
  });

  it('pasangan salah: poin nama pada kartu Arab -5, nama pemilik arti tidak berubah', () => {
    const s = base();
    const [a, b] = getCurrentQuestion(s)!.nameIds as [number, number];
    const out = answerPair(s, { [a]: 40, [b]: 40 }, a, b);
    expect(out.result).toMatchObject({ correct: false, arabicId: a, chosenMeaningId: b, delta: -5, pointsAfter: 35 });
    expect(out.points[a]).toBe(35);
    expect(out.points[b]).toBe(40);
  });

  it('kartu Arab yang sudah dijawab (benar maupun salah) tidak bisa dijawab ulang', () => {
    const s = base();
    const [a, b] = getCurrentQuestion(s)!.nameIds as [number, number];
    const out = answerPair(s, {}, a, b);
    expect(() => answerPair(out.session, out.points, a, a)).toThrow();
    // Arti milik `a` sudah terungkap sehingga tidak tersedia lagi.
    expect(() => answerPair(out.session, out.points, b, a)).toThrow();
    expect(getRemainingIds(out.session)).not.toContain(a);
  });

  it('kartu dari pertanyaan lain ditolak', () => {
    const s = base();
    const otherId = s.questions[1]!.nameIds[0]!;
    const id = getCurrentQuestion(s)!.nameIds[0]!;
    expect(() => answerPair(s, {}, otherId, otherId)).toThrow();
    expect(() => answerPair(s, {}, id, otherId)).toThrow();
  });

  it('pertanyaan maju setelah 3 pasangan; sesi lengkap setelah 15 pasangan', () => {
    let s = base();
    let p: PointsMap = {};
    for (let i = 0; i < 3; i++) {
      const id = getRemainingIds(s)[0]!;
      ({ session: s, points: p } = answerPair(s, p, id, id));
    }
    expect(s.currentQuestionIndex).toBe(1);
    const done = playSession(s, p);
    expect(isSessionComplete(done.session)).toBe(true);
    expect(done.session.results).toHaveLength(15);
    expect(new Set(done.session.results.map((r) => r.arabicId)).size).toBe(15);
    expect(() => answerPair(done.session, done.points, 1, 1)).toThrow('Sesi sudah selesai');
  });

  it('tidak memutasi sesi & poin sebelumnya (pure)', () => {
    const s = base();
    const p: PointsMap = {};
    const id = getCurrentQuestion(s)!.nameIds[0]!;
    answerPair(s, p, id, id);
    expect(s.results).toHaveLength(0);
    expect(p).toEqual({});
  });
});

describe('summarizeSession', () => {
  it('sesi sempurna dari 0: +300, akurasi 100%', () => {
    const s = createDrillingSession({ mode: 'sequential', unlockedStage: 1, points: {}, rng: seededRng(1) });
    const done = playSession(s, {});
    expect(summarizeSession(done.session)).toEqual({ netPoints: 300, correctCount: 15, totalPairs: 15, accuracyPercent: 100 });
  });

  it('poin bersih memakai delta aktual (terbatas 0..100)', () => {
    const points = pointsFor(range(1, 15), 95);
    const s = createDrillingSession({ mode: 'sequential', unlockedStage: 1, points, rng: seededRng(1) });
    const done = playSession(s, points);
    expect(summarizeSession(done.session).netPoints).toBe(75); // 15 × 5
  });

  it('salah sebanyak mungkin dari 0: 10 salah (tertahan di 0) + 5 benar paksa → +100, akurasi 33%', () => {
    const s = createDrillingSession({ mode: 'sequential', unlockedStage: 1, points: {}, rng: seededRng(1) });
    // Strategi salah sebanyak mungkin: pasangan ke-3 tiap soal pasti benar (hanya tersisa 1 kartu).
    const done = playSession(s, {}, () => false);
    const summary = summarizeSession(done.session);
    expect(summary.correctCount).toBe(5);
    expect(summary.accuracyPercent).toBe(33);
    expect(summary.netPoints).toBe(100);
  });
});

describe('finalizeSession', () => {
  it('menolak sesi yang belum lengkap', () => {
    const state = onboarded('sequential');
    const s = createDrillingSession({ mode: 'sequential', unlockedStage: 1, points: {}, rng: seededRng(1) });
    expect(() => finalizeSession(state, s, CLOCK)).toThrow();
  });

  it('mencatat tanggal streak (unik), lastPracticedAt, dan ringkasan', () => {
    const first = runFullSession(onboarded('sequential'), 1);
    expect(first.state.completedDates).toEqual(['2026-11-22']);
    expect(Object.keys(first.state.lastPracticedAt)).toHaveLength(15);
    expect(first.state.lastDrillingSummary).toEqual(first.summary);
    expect(first.summary).toMatchObject({ mode: 'sequential', netPoints: 300, accuracyPercent: 100, unlockedNewStage: null });

    const second = runFullSession(first.state, 2);
    expect(second.state.completedDates).toEqual(['2026-11-22']);
  });

  it('mode Bertahap: tahap 2 terbuka tepat setelah sesi sempurna ke-4 (rata-rata 80), bukan ke-3 (60)', () => {
    let state = onboarded('sequential');
    for (let i = 1; i <= 3; i++) {
      const out = runFullSession(state, i);
      expect(out.summary.unlockedNewStage).toBeNull();
      state = out.state;
    }
    expect(state.unlockedStage).toBe(1);
    const fourth = runFullSession(state, 4);
    expect(fourth.summary.unlockedNewStage).toBe(2);
    expect(fourth.state.unlockedStage).toBe(2);
  });

  it('setelah tahap 2 terbuka, soal diambil dari gabungan tahap 1–2 (poin terendah = tahap 2)', () => {
    let state = onboarded('sequential');
    for (let i = 1; i <= 4; i++) state = runFullSession(state, i).state;
    const s = createDrillingSession({ mode: 'sequential', unlockedStage: state.unlockedStage, points: state.points, rng: seededRng(99) });
    const ids = s.questions.flatMap((q) => q.nameIds);
    expect(new Set(ids)).toEqual(new Set(range(16, 30)));
  });
});

describe('pergantian mode sequential ↔ random', () => {
  it('poin & unlockedStage tidak terhapus saat berganti mode', () => {
    let state = onboarded('sequential');
    for (let i = 1; i <= 4; i++) state = runFullSession(state, i).state;
    expect(state.unlockedStage).toBe(2);
    const pointsBefore = { ...state.points };

    const random = setLearningMode(state, 'random');
    expect(random.points).toEqual(pointsBefore);
    expect(random.unlockedStage).toBe(2);

    const back = setLearningMode(random, 'sequential');
    expect(back.points).toEqual(pointsBefore);
    expect(back.unlockedStage).toBe(2);
  });

  it('mode Acak: sesi memakai 99 nama & tidak mengubah unlockedStage walau rata-rata tahap >= 80', () => {
    const start: UserState = {
      ...setLearningMode(onboarded('sequential'), 'random'),
      unlockedStage: 2,
      points: { ...pointsFor(ALL_NAME_IDS, 100), ...pointsFor(range(16, 30), 80) },
    };
    const out = runFullSession(start, 5);
    expect(out.state.unlockedStage).toBe(2);
    expect(out.summary.unlockedNewStage).toBeNull();
    expect(out.summary.mode).toBe('random');
  });

  it('mode Acak bisa melatih nama tahap terkunci; poinnya tetap tersimpan saat kembali ke Bertahap', () => {
    const start = setLearningMode(onboarded('sequential'), 'random');
    // Hanya nama 85–99 yang lemah → sesi acak pasti memilih mereka.
    const seeded: UserState = { ...start, points: { ...pointsFor(range(1, 84), 100) } };
    const out = runFullSession(seeded, 6);
    for (const id of range(85, 99)) expect(out.state.points[id]).toBe(20);

    const back = setLearningMode(out.state, 'sequential');
    expect(back.unlockedStage).toBe(1);
    expect(isNameUnlocked(90, back.learningMode, back.unlockedStage)).toBe(false); // gembok kembali
    expect(back.points[90]).toBe(20); // poin tetap utuh
    const next = createDrillingSession({ mode: back.learningMode, unlockedStage: back.unlockedStage, points: back.points, rng: seededRng(1) });
    expect(next.questions.flatMap((q) => q.nameIds).every((id) => id <= 15)).toBe(true);
  });

  it('isNameUnlocked mengikuti mode aktif tanpa mengubah state', () => {
    const state: UserState = { ...onboarded('sequential'), unlockedStage: 3 };
    expect(isNameUnlocked(46, state.learningMode, state.unlockedStage)).toBe(false);
    const random = setLearningMode(state, 'random');
    expect(isNameUnlocked(46, random.learningMode, random.unlockedStage)).toBe(true);
    const back = setLearningMode(random, 'sequential');
    expect(isNameUnlocked(46, back.learningMode, back.unlockedStage)).toBe(false);
    expect(isNameUnlocked(45, back.learningMode, back.unlockedStage)).toBe(true);
  });
});
