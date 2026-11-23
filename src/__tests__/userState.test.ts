import { describe, expect, it } from 'vitest';
import {
  DEFAULT_TARGET_DAYS,
  completeOnboarding,
  createDefaultUserState,
  normalizeTargetDays,
  normalizeUserState,
  resetProgress,
  sanitizeUserName,
  setLearningMode,
  setTheme,
} from '@/domain/userState';
import type { UserState } from '@/types';

const TODAY = '2026-11-22';

function progressed(): UserState {
  return {
    ...createDefaultUserState('2026-11-01'),
    userName: 'Aisyah',
    learningMode: 'random',
    targetDays: 60,
    onboardingCompleted: true,
    theme: 'dark',
    unlockedStage: 4,
    points: { 1: 100, 2: 60, 50: 20 },
    lastPracticedAt: { 1: '2026-11-21T10:00:00.000Z' },
    completedDates: ['2026-11-20', '2026-11-21'],
    lastDrillingSummary: {
      completedAt: '2026-11-21T10:00:00.000Z',
      mode: 'random',
      netPoints: 120,
      correctCount: 9,
      totalPairs: 15,
      accuracyPercent: 60,
      unlockedNewStage: null,
    },
  };
}

describe('createDefaultUserState', () => {
  it('default: mode Bertahap, tahap 1, poin kosong, tema sistem, belum onboarding', () => {
    expect(createDefaultUserState(TODAY)).toEqual({
      userName: '',
      learningMode: 'sequential',
      targetDays: DEFAULT_TARGET_DAYS,
      startDate: TODAY,
      onboardingCompleted: false,
      unlockedStage: 1,
      points: {},
      lastPracticedAt: {},
      completedDates: [],
      lastDrillingSummary: null,
      theme: 'system',
    });
  });
});

describe('completeOnboarding', () => {
  it('menyimpan nama (dirapikan), mode, target hari, tanggal mulai', () => {
    const s = completeOnboarding(createDefaultUserState('2026-01-01'), {
      userName: '  Abdullah   bin  Umar ',
      learningMode: 'random',
      targetDays: 90,
      today: TODAY,
    });
    expect(s).toMatchObject({
      userName: 'Abdullah bin Umar',
      learningMode: 'random',
      targetDays: 90,
      startDate: TODAY,
      onboardingCompleted: true,
    });
  });

  it('nama wajib diisi', () => {
    expect(() =>
      completeOnboarding(createDefaultUserState(TODAY), { userName: '   ', learningMode: 'sequential', targetDays: 30, today: TODAY }),
    ).toThrow();
  });

  it('target hari kustom dinormalkan', () => {
    expect(normalizeTargetDays(45.6)).toBe(46);
    expect(normalizeTargetDays(0)).toBe(1);
    expect(normalizeTargetDays(Number.NaN)).toBe(DEFAULT_TARGET_DAYS);
    expect(sanitizeUserName('x'.repeat(60))).toHaveLength(40);
  });
});

describe('setLearningMode & setTheme', () => {
  it('ganti mode tidak menyentuh poin, unlockedStage, maupun riwayat', () => {
    const before = progressed();
    const after = setLearningMode(before, 'sequential');
    expect(after.learningMode).toBe('sequential');
    expect({ ...after, learningMode: before.learningMode }).toEqual(before);
  });

  it('ganti tema', () => {
    expect(setTheme(progressed(), 'light').theme).toBe('light');
  });
});

describe('resetProgress', () => {
  it('menghapus poin, unlockedStage → 1, streak, riwayat; mempertahankan nama, mode, target, tema, onboarding', () => {
    const s = resetProgress(progressed());
    expect(s).toMatchObject({
      points: {},
      lastPracticedAt: {},
      unlockedStage: 1,
      completedDates: [],
      lastDrillingSummary: null,
      userName: 'Aisyah',
      learningMode: 'random',
      targetDays: 60,
      theme: 'dark',
      onboardingCompleted: true,
      startDate: '2026-11-01',
    });
  });
});

describe('normalizeUserState — pemulihan dari localStorage', () => {
  it('state valid dipulihkan apa adanya', () => {
    const s = progressed();
    expect(normalizeUserState(JSON.parse(JSON.stringify(s)), TODAY)).toEqual(s);
  });

  it('nilai rusak diganti default & dibatasi', () => {
    const s = normalizeUserState(
      {
        userName: 42,
        learningMode: 'bebas',
        theme: 'neon',
        unlockedStage: 12,
        points: { 1: 250, 2: -4, 0: 50, 100: 50, abc: 10, 3: 'x' },
        completedDates: ['2026-11-21', 'rusak', '2026-11-21'],
        startDate: 'kemarin',
      },
      TODAY,
    );
    expect(s.userName).toBe('');
    expect(s.learningMode).toBe('sequential');
    expect(s.theme).toBe('system');
    expect(s.unlockedStage).toBe(7);
    expect(s.points).toEqual({ 1: 100, 2: 0 });
    expect(s.completedDates).toEqual(['2026-11-21']);
    expect(s.startDate).toBe(TODAY);
    expect(s.onboardingCompleted).toBe(false);
  });

  it('input bukan objek → default', () => {
    expect(normalizeUserState(null, TODAY)).toEqual(createDefaultUserState(TODAY));
    expect(normalizeUserState('rusak', TODAY)).toEqual(createDefaultUserState(TODAY));
  });
});
