import type { DateKey, LearningMode, StageNumber, Theme, UserState } from '@/types';
import { clampPoints } from './scoring';
import { clampStage, isValidNameId } from './stage';
import { isValidDateKey, normalizeCompletedDates } from './streak';

/** Reducer murni untuk `UserState` — dipakai oleh `useUserStore`. */

export const DEFAULT_TARGET_DAYS = 30;
export const TARGET_DAY_PRESETS = [30, 60, 90] as const;
export const MIN_TARGET_DAYS = 1;
export const MAX_TARGET_DAYS = 3650;

export function createDefaultUserState(today: DateKey): UserState {
  return {
    userName: '',
    learningMode: 'sequential',
    targetDays: DEFAULT_TARGET_DAYS,
    startDate: today,
    onboardingCompleted: false,
    unlockedStage: 1,
    points: {},
    lastPracticedAt: {},
    completedDates: [],
    lastDrillingSummary: null,
    theme: 'system',
  };
}

export function sanitizeUserName(name: string): string {
  return name.replace(/\s+/g, ' ').trim().slice(0, 40);
}

export function normalizeTargetDays(days: number): number {
  if (!Number.isFinite(days)) return DEFAULT_TARGET_DAYS;
  return Math.min(MAX_TARGET_DAYS, Math.max(MIN_TARGET_DAYS, Math.round(days)));
}

export function completeOnboarding(
  state: UserState,
  input: { userName: string; learningMode: LearningMode; targetDays: number; today: DateKey },
): UserState {
  const userName = sanitizeUserName(input.userName);
  if (!userName) throw new Error('Nama wajib diisi');
  return {
    ...state,
    userName,
    learningMode: input.learningMode,
    targetDays: normalizeTargetDays(input.targetDays),
    startDate: input.today,
    onboardingCompleted: true,
  };
}

/** Ganti mode tanpa menyentuh `points` maupun `unlockedStage`. */
export function setLearningMode(state: UserState, mode: LearningMode): UserState {
  return { ...state, learningMode: mode };
}

export function setTheme(state: UserState, theme: Theme): UserState {
  return { ...state, theme };
}

/**
 * Reset progres: poin, `unlockedStage`, streak, riwayat drilling.
 * Nama, mode, target hari, tema, dan status onboarding dipertahankan.
 */
export function resetProgress(state: UserState): UserState {
  return {
    ...state,
    unlockedStage: 1,
    points: {},
    lastPracticedAt: {},
    completedDates: [],
    lastDrillingSummary: null,
  };
}

const MODES: readonly LearningMode[] = ['sequential', 'random'];
const THEMES: readonly Theme[] = ['light', 'dark', 'system'];

/** Pulihkan state dari storage dengan aman (nilai rusak → default). */
export function normalizeUserState(raw: unknown, today: DateKey): UserState {
  const base = createDefaultUserState(today);
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<Record<keyof UserState, unknown>>;

  const points: Record<number, number> = {};
  if (r.points && typeof r.points === 'object') {
    for (const [k, v] of Object.entries(r.points)) {
      const id = Number(k);
      if (isValidNameId(id) && typeof v === 'number') points[id] = clampPoints(v);
    }
  }

  const lastPracticedAt: Record<number, string> = {};
  if (r.lastPracticedAt && typeof r.lastPracticedAt === 'object') {
    for (const [k, v] of Object.entries(r.lastPracticedAt)) {
      const id = Number(k);
      if (isValidNameId(id) && typeof v === 'string') lastPracticedAt[id] = v;
    }
  }

  return {
    userName: typeof r.userName === 'string' ? sanitizeUserName(r.userName) : base.userName,
    learningMode: MODES.includes(r.learningMode as LearningMode) ? (r.learningMode as LearningMode) : base.learningMode,
    targetDays: typeof r.targetDays === 'number' ? normalizeTargetDays(r.targetDays) : base.targetDays,
    startDate: isValidDateKey(r.startDate) ? r.startDate : base.startDate,
    onboardingCompleted: r.onboardingCompleted === true,
    unlockedStage: typeof r.unlockedStage === 'number' ? (clampStage(r.unlockedStage) as StageNumber) : base.unlockedStage,
    points,
    lastPracticedAt,
    completedDates: Array.isArray(r.completedDates) ? normalizeCompletedDates(r.completedDates) : [],
    lastDrillingSummary:
      r.lastDrillingSummary && typeof r.lastDrillingSummary === 'object'
        ? (r.lastDrillingSummary as UserState['lastDrillingSummary'])
        : null,
    theme: THEMES.includes(r.theme as Theme) ? (r.theme as Theme) : base.theme,
  };
}
