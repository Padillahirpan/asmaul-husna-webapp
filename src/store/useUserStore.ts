import { useEffect } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { DrillingSession, DrillingSummary, LearningMode, NameId, PairResult, Theme, UserState } from '@/types';
import {
  answerPair as answerPairDomain,
  completeOnboarding as completeOnboardingDomain,
  createDefaultUserState,
  createDrillingSession,
  finalizeSession,
  isSessionComplete,
  normalizeTargetDays,
  normalizeUserState,
  resetProgress as resetProgressDomain,
  sanitizeUserName,
  setLearningMode as setLearningModeDomain,
  setTheme as setThemeDomain,
  toLocalDateKey,
} from '@/domain';

export const STORAGE_KEY = 'asmaul-husna:user-state';
export const STORAGE_VERSION = 1;

const today = () => toLocalDateKey(new Date());

interface UserStoreActions {
  completeOnboarding: (input: { userName: string; learningMode: LearningMode; targetDays: number }) => void;
  setUserName: (name: string) => void;
  setLearningMode: (mode: LearningMode) => void;
  setTargetDays: (days: number) => void;
  setTheme: (theme: Theme) => void;
  resetProgress: () => void;

  /** Mulai sesi drilling baru sesuai mode aktif. */
  startDrilling: () => void;
  /** Jawab satu pasangan; poin langsung disimpan. */
  answerPair: (arabicId: NameId, meaningId: NameId) => PairResult | null;
  /** Finalisasi sesi lengkap; mengembalikan ringkasan. */
  finishDrilling: () => DrillingSummary | null;
  abandonDrilling: () => void;
}

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

const safeStorage = createJSONStorage(() =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
    ? window.localStorage
    : noopStorage,
);

export interface UserStore extends UserState, UserStoreActions {
  /** Sesi aktif — transien, tidak dipersist. */
  session: DrillingSession | null;
  /** Menandai apakah state dari localStorage sudah direhidrasi di sisi klien. */
  hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
}

const pickState = (s: UserStore): UserState => ({
  userName: s.userName,
  learningMode: s.learningMode,
  targetDays: s.targetDays,
  startDate: s.startDate,
  onboardingCompleted: s.onboardingCompleted,
  unlockedStage: s.unlockedStage,
  points: s.points,
  lastPracticedAt: s.lastPracticedAt,
  completedDates: s.completedDates,
  lastDrillingSummary: s.lastDrillingSummary,
  theme: s.theme,
});

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...createDefaultUserState(today()),
      session: null,
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      completeOnboarding: (input) => set(completeOnboardingDomain(pickState(get()), { ...input, today: today() })),
      setUserName: (name) => {
        const userName = sanitizeUserName(name);
        if (userName) set({ userName });
      },
      setLearningMode: (mode) => set({ ...setLearningModeDomain(pickState(get()), mode), session: null }),
      setTargetDays: (days) => set({ targetDays: normalizeTargetDays(days) }),
      setTheme: (theme) => set(setThemeDomain(pickState(get()), theme)),
      resetProgress: () => set({ ...resetProgressDomain(pickState(get())), session: null }),

      startDrilling: () => {
        const s = get();
        set({ session: createDrillingSession({ mode: s.learningMode, unlockedStage: s.unlockedStage, points: s.points }) });
      },
      answerPair: (arabicId, meaningId) => {
        const { session, points } = get();
        if (!session) return null;
        const out = answerPairDomain(session, points, arabicId, meaningId);
        set({ session: out.session, points: out.points });
        return out.result;
      },
      finishDrilling: () => {
        const s = get();
        if (!s.session || !isSessionComplete(s.session)) return null;
        const out = finalizeSession(pickState(s), s.session, { today: today(), nowIso: new Date().toISOString() });
        set({ ...out.state, session: null });
        return out.summary;
      },
      abandonDrilling: () => set({ session: null }),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: safeStorage,
      skipHydration: true,
      partialize: (s) => pickState(s),
      merge: (persisted, current) => ({ ...current, ...normalizeUserState(persisted, today()) }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

/**
 * Menghidrasi state dari localStorage setelah mount di sisi klien.
 * Menggunakan `skipHydration: true` memastikan render pertama klien selalu identik
 * dengan HTML statis hasil pre-render (bebas hydration mismatch).
 */
export function useHydrateUserStore() {
  useEffect(() => {
    void useUserStore.persist.rehydrate();
  }, []);
}
