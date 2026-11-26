import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, CheckCircle2, Lock, X } from 'lucide-react';
import { NAMES, SOURCE_NOTE, getNameById } from '@/data';
import {
  PAIRS_PER_SESSION,
  QUESTIONS_PER_SESSION,
  TOTAL_STAGES,
  UNLOCK_THRESHOLD,
  calculateOverallAverage,
  calculateStageAverage,
  getPoints,
  getStageRange,
  getStatus,
  isAllStagesMastered,
  isNameUnlocked,
  isSessionComplete,
} from '@/domain';
import { useUserStore } from '@/store/useUserStore';
import { StatusCircle } from '@/components/StatusCircle';
import { ConfirmModal } from '@/components/ConfirmModal';
import type { DrillingSummary, NameId, PairResult, StageNumber } from '@/types';

interface DrillingProps {
  onBack: () => void;
  onSelectName: (id: NameId) => void;
}

const STAGE_NUMBERS: readonly StageNumber[] = [1, 2, 3, 4, 5, 6, 7];

function statusTextClass(points: number): string {
  const status = getStatus(points);
  if (status === 'memorized') return 'text-emerald-700 dark:text-emerald-400';
  if (status === 'almost') return 'text-amber-700 dark:text-amber-400';
  if (status === 'learning') return 'text-primary-700 dark:text-primary-400';
  return 'text-stone-500 dark:text-stone-400';
}

export default function Drilling({ onBack, onSelectName }: DrillingProps) {
  const learningMode = useUserStore((s) => s.learningMode);
  const unlockedStage = useUserStore((s) => s.unlockedStage);
  const points = useUserStore((s) => s.points);
  const session = useUserStore((s) => s.session);
  const startDrilling = useUserStore((s) => s.startDrilling);
  const answerPair = useUserStore((s) => s.answerPair);
  const finishDrilling = useUserStore((s) => s.finishDrilling);
  const abandonDrilling = useUserStore((s) => s.abandonDrilling);

  const [selectedArabic, setSelectedArabic] = useState<NameId | null>(null);
  const [selectedMeaning, setSelectedMeaning] = useState<NameId | null>(null);
  const [wrongFeedback, setWrongFeedback] = useState<PairResult | null>(null);
  const [displayQIndex, setDisplayQIndex] = useState(0);
  const [pendingAdvance, setPendingAdvance] = useState(false);
  const [completedSummary, setCompletedSummary] = useState<DrillingSummary | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [stageFilter, setStageFilter] = useState<'all' | StageNumber>('all');

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleStart = () => {
    setCompletedSummary(null);
    setSelectedArabic(null);
    setSelectedMeaning(null);
    setWrongFeedback(null);
    setDisplayQIndex(0);
    setPendingAdvance(false);
    startDrilling();
  };

  const evaluatePair = (arabicId: NameId, meaningId: NameId) => {
    const result = answerPair(arabicId, meaningId);
    setSelectedArabic(null);
    setSelectedMeaning(null);
    if (!result) return;

    const latest = useUserStore.getState().session;
    if (!latest) return;

    if (!result.correct) {
      setWrongFeedback(result);
      return;
    }

    const questionDone = latest.results.filter((r) => r.questionIndex === displayQIndex).length >= 3;
    if (questionDone) {
      setPendingAdvance(true);
      timerRef.current = window.setTimeout(() => {
        setPendingAdvance(false);
        const current = useUserStore.getState().session;
        if (!current) return;
        if (isSessionComplete(current)) {
          const summary = finishDrilling();
          if (summary) setCompletedSummary(summary);
        } else {
          setDisplayQIndex(current.currentQuestionIndex);
        }
      }, 420);
    }
  };

  const handlePickArabic = (id: NameId) => {
    if (wrongFeedback || pendingAdvance) return;
    if (selectedArabic === id) {
      setSelectedArabic(null);
      return;
    }
    if (selectedMeaning !== null) {
      evaluatePair(id, selectedMeaning);
    } else {
      setSelectedArabic(id);
    }
  };

  const handlePickMeaning = (id: NameId) => {
    if (wrongFeedback || pendingAdvance) return;
    if (selectedMeaning === id) {
      setSelectedMeaning(null);
      return;
    }
    if (selectedArabic !== null) {
      evaluatePair(selectedArabic, id);
    } else {
      setSelectedMeaning(id);
    }
  };

  const handleDismissWrong = () => {
    setWrongFeedback(null);
    const current = useUserStore.getState().session;
    if (!current) return;
    if (isSessionComplete(current)) {
      const summary = finishDrilling();
      if (summary) setCompletedSummary(summary);
    } else {
      setDisplayQIndex(current.currentQuestionIndex);
    }
  };

  // --- SUB-VIEW C: SUMMARY ---
  if (completedSummary) {
    const unlockedRange = completedSummary.unlockedNewStage
      ? getStageRange(completedSummary.unlockedNewStage)
      : null;

    return (
      <main className="animate-page-enter mx-auto flex w-full max-w-lg flex-1 flex-col justify-between px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] lg:justify-center lg:py-12">
        <div className="my-auto text-center lg:rounded-3xl lg:border lg:border-cream-200 lg:bg-white lg:p-8 lg:shadow-xs lg:dark:border-stone-800 lg:dark:bg-stone-900">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-primary-200 bg-primary-50 text-primary-600 dark:border-primary-900 dark:bg-primary-950/50 dark:text-primary-400">
            <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Sesi Drilling Selesai
          </h1>
          <p className="mt-1.5 text-sm text-stone-600 dark:text-stone-300">
            Alhamdulillah, {completedSummary.totalPairs} pasangan nama telah diselesaikan.
          </p>

          {completedSummary.unlockedNewStage && unlockedRange && (
            <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-left dark:border-emerald-900/70 dark:bg-emerald-950/40">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Tahap baru terbuka
              </p>
              <p className="mt-1 text-sm font-bold text-stone-900 dark:text-stone-100">
                Tahap {completedSummary.unlockedNewStage} terbuka (Nama {unlockedRange.start}–{unlockedRange.end})
              </p>
              <p className="mt-0.5 text-xs text-stone-600 dark:text-stone-300">
                Rata-rata poin tahap sebelumnya telah mencapai ≥ {UNLOCK_THRESHOLD}.
              </p>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-cream-200 bg-white p-4 lg:bg-cream-50 dark:border-stone-800 dark:bg-stone-900 lg:dark:bg-stone-950/60">
              <p className="text-xs text-stone-500 dark:text-stone-400">Poin bersih sesi</p>
              <p
                className={`mt-1 text-2xl font-bold ${completedSummary.netPoints >= 0
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-primary-600 dark:text-primary-400'
                  }`}
              >
                {completedSummary.netPoints >= 0 ? '+' : ''}
                {completedSummary.netPoints}
              </p>
            </div>

            <div className="rounded-3xl border border-cream-200 bg-white p-4 lg:bg-cream-50 dark:border-stone-800 dark:bg-stone-900 lg:dark:bg-stone-950/60">
              <p className="text-xs text-stone-500 dark:text-stone-400">Akurasi</p>
              <p className="mt-1 text-2xl font-bold text-stone-900 dark:text-stone-100">
                {completedSummary.accuracyPercent}%
              </p>
              <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                {completedSummary.correctCount}/{completedSummary.totalPairs} benar
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCompletedSummary(null)}
            className="mt-7 hidden min-h-12 w-full rounded-2xl bg-primary-600 px-5 py-3.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-primary-700 lg:block dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            Kembali ke Halaman Latihan
          </button>
        </div>

        <button
          type="button"
          onClick={() => setCompletedSummary(null)}
          className="mt-8 min-h-12 w-full rounded-2xl bg-primary-600 px-5 py-3.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-primary-700 lg:hidden dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          Kembali ke Halaman Drilling
        </button>
      </main>
    );
  }

  // --- SUB-VIEW B: SESI DRILLING AKTIF ---
  if (session) {
    const question = session.questions[displayQIndex];
    const questionResults = session.results.filter((r) => r.questionIndex === displayQIndex);
    const resultByArabicId = new Map<NameId, PairResult>(questionResults.map((r) => [r.arabicId, r]));
    const netPoints = session.results.reduce((sum, r) => sum + r.delta, 0);
    const answeredTotal = session.results.length;
    const progressPct = Math.round((answeredTotal / PAIRS_PER_SESSION) * 100);
    const wrongName = wrongFeedback ? getNameById(wrongFeedback.arabicId) : undefined;

    return (
      <main className="animate-page-enter mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] lg:px-8 lg:py-8">
        {/* Header Progres */}
        <header className="mb-4 flex items-center gap-3 lg:mb-6">
          <button
            type="button"
            onClick={() => setShowExitModal(true)}
            aria-label="Keluar dari sesi latihan"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cream-200 bg-white text-stone-700 transition-colors hover:bg-cream-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="flex-1">
            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold lg:text-sm">
              <span className="text-stone-700 dark:text-stone-200">
                Pertanyaan {displayQIndex + 1} dari {QUESTIONS_PER_SESSION}
              </span>
              <span className="text-primary-700 dark:text-primary-300">
                {netPoints >= 0 ? '+' : ''}
                {netPoints} poin
              </span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-cream-200 dark:bg-stone-800"
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progres sesi latihan"
            >
              <div
                className="h-full rounded-full bg-primary-500 transition-all duration-300 dark:bg-primary-400"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </header>

        <p className="mb-5 text-center text-xs text-stone-600 lg:mb-8 lg:text-sm dark:text-stone-400">
          Pilih satu lafaz Arab, lalu pasangkan dengan artinya yang sesuai.
        </p>

        {question && (
          <div className="flex flex-1 flex-col justify-center gap-6 md:grid md:grid-cols-2 md:items-center md:gap-8">
            {/* 3 Kartu Arab (Atas di Mobile, Kolom Kiri di Desktop/Tablet) */}
            <section aria-label="Pilihan lafaz Arab">
              <h2 className="mb-2.5 text-xs font-semibold text-stone-500 dark:text-stone-400">
                Lafaz Arab
              </h2>
              <div className="grid grid-cols-3 gap-2.5 md:grid-cols-1 md:gap-3">
                {question.arabicOrder.map((id) => {
                  const item = getNameById(id);
                  if (!item) return null;
                  const res = resultByArabicId.get(id);
                  const matched = res !== undefined;
                  const selected = selectedArabic === id;

                  let style =
                    'border-cream-200 bg-white text-stone-900 hover:border-primary-300 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:hover:border-primary-700';
                  if (matched) {
                    style = res.correct
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800 opacity-80 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'border-primary-300 bg-primary-50 text-primary-800 opacity-80 dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-300';
                  } else if (selected) {
                    style =
                      'border-primary-500 bg-primary-50 text-stone-900 ring-2 ring-primary-500/40 dark:border-primary-400 dark:bg-primary-950/50 dark:text-white';
                  }

                  return (
                    <button
                      key={id}
                      type="button"
                      disabled={matched || wrongFeedback !== null || pendingAdvance}
                      aria-pressed={selected}
                      onClick={() => handlePickArabic(id)}
                      className={`relative flex min-h-24 flex-col items-center justify-center rounded-2xl border p-3 shadow-2xs transition-colors disabled:cursor-default md:min-h-22 ${style}`}
                    >
                      {matched && (
                        <span
                          aria-hidden="true"
                          className={`absolute right-2.5 top-2.5 ${res.correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary-600 dark:text-primary-400'
                            }`}
                        >
                          {res.correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        </span>
                      )}
                      <span className="arabic-text text-center text-xl font-bold sm:text-2xl md:text-3xl">
                        {item.arabic}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 3 Kartu Arti (Bawah di Mobile, Kolom Kanan di Desktop/Tablet) */}
            <section aria-label="Pilihan arti nama">
              <h2 className="mb-2.5 text-xs font-semibold text-stone-500 dark:text-stone-400">
                Arti Nama
              </h2>
              <div className="grid grid-cols-1 gap-2.5 md:gap-3">
                {question.meaningOrder.map((id) => {
                  const item = getNameById(id);
                  if (!item) return null;
                  const res = resultByArabicId.get(id);
                  const matched = res !== undefined;
                  const selected = selectedMeaning === id;

                  let style =
                    'border-cream-200 bg-white text-stone-800 hover:border-primary-300 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:hover:border-primary-700';
                  if (matched) {
                    style = res.correct
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800 opacity-80 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'border-cream-200 bg-cream-100 text-stone-500 opacity-70 dark:border-stone-800 dark:bg-stone-900/40 dark:text-stone-500';
                  } else if (selected) {
                    style =
                      'border-primary-500 bg-primary-50 text-stone-900 ring-2 ring-primary-500/40 dark:border-primary-400 dark:bg-primary-950/50 dark:text-white';
                  }

                  return (
                    <button
                      key={id}
                      type="button"
                      disabled={matched || wrongFeedback !== null || pendingAdvance}
                      aria-pressed={selected}
                      onClick={() => handlePickMeaning(id)}
                      className={`flex min-h-13 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left shadow-2xs transition-colors disabled:cursor-default md:min-h-22 md:px-5 ${style}`}
                    >
                      <span className="text-sm font-medium md:text-base">{item.meaning}</span>
                      {matched && (
                        <span
                          className={`shrink-0 text-xs font-semibold ${res.correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-500'
                            }`}
                        >
                          {res.correct ? '+20' : 'Terjawab'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* Umpan Balik Jika Salah */}
        {wrongFeedback && wrongName && (
          <section
            role="alert"
            className="animate-gentle-shake mt-5 rounded-3xl border border-primary-300 bg-primary-50 p-4 md:p-5 dark:border-primary-800 dark:bg-primary-950/55"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-primary-700 dark:text-primary-300">
                  Kurang tepat ({wrongFeedback.delta} poin)
                </p>
                <p className="mt-1 text-xs text-stone-700 md:text-sm dark:text-stone-300">
                  Arti yang benar untuk <strong className="font-semibold">{wrongName.latin}</strong>:
                </p>
              </div>
              <span className="arabic-text shrink-0 text-2xl font-bold text-stone-900 dark:text-stone-100">
                {wrongName.arabic}
              </span>
            </div>

            <div className="mt-2.5 rounded-2xl border border-primary-200 bg-white px-3.5 py-2.5 dark:border-primary-900 dark:bg-stone-900">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                {wrongName.meaning}
              </p>
            </div>

            <button
              type="button"
              onClick={handleDismissWrong}
              className="mt-3 min-h-11 w-full rounded-2xl bg-primary-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-primary-700 md:w-auto md:px-6 dark:bg-primary-500 dark:hover:bg-primary-600"
            >
              Mengerti, Lanjutkan
            </button>
          </section>
        )}

        <ConfirmModal
          open={showExitModal}
          title="Keluar dari sesi drilling?"
          message="Poin dari pasangan yang sudah dijawab tetap tersimpan, namun sesi yang belum selesai tidak dihitung ke dalam streak harian."
          confirmLabel="Keluar Sesi"
          cancelLabel="Lanjut Latihan"
          onCancel={() => setShowExitModal(false)}
          onConfirm={() => {
            setShowExitModal(false);
            abandonDrilling();
          }}
        />
      </main>
    );
  }

  // --- SUB-VIEW A: OVERVIEW & GRID 99 NAMA ---
  const stageAvg = Math.round(calculateStageAverage(unlockedStage, points) * 10) / 10;
  const overallAvg = Math.round(calculateOverallAverage(points) * 10) / 10;
  const memorizedCount = NAMES.filter((n) => getPoints(points, n.id) >= 100).length;
  const allMastered = isAllStagesMastered(unlockedStage, points);
  const visibleStages = stageFilter === 'all' ? STAGE_NUMBERS : [stageFilter];

  return (
    <main className="animate-page-enter flex flex-1 flex-col px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] lg:px-8 lg:py-8">
      {/* Header */}
      <header className="mb-5 flex items-center gap-3 lg:mb-6">
        <button
          type="button"
          onClick={onBack}
          aria-label="Kembali ke Dashboard"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cream-200 bg-white text-stone-700 transition-colors hover:bg-cream-100 lg:hidden dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-stone-900 lg:text-2xl dark:text-stone-100">
            Latihan Hafalan
          </h1>
          <p className="text-xs text-stone-500 lg:text-sm dark:text-stone-400">
            5 pertanyaan, 15 pasangan nama
          </p>
        </div>
      </header>

      {/* Ringkasan Progres Sesuai Mode */}
      <section className="mb-6 rounded-3xl border border-cream-200 bg-white p-5 shadow-2xs lg:flex lg:items-center lg:justify-between lg:gap-8 lg:p-6 dark:border-stone-800 dark:bg-stone-900/80">
        <div className="flex-1">
          {learningMode === 'sequential' ? (
            <>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-primary-700 dark:text-primary-300">
                  Tahap {unlockedStage} dari {TOTAL_STAGES}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  {allMastered ? 'Semua tahap tercapai' : `Target buka tahap ≥ ${UNLOCK_THRESHOLD}`}
                </span>
              </div>
              <div className="mb-2.5 flex items-baseline justify-between gap-2">
                <p className="text-sm text-stone-700 dark:text-stone-300">
                  Rata-rata poin Tahap {unlockedStage}
                </p>
                <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                  {stageAvg} <span className="text-xs font-normal text-stone-500">/ 100</span>
                </p>
              </div>
              <div className="mb-3 h-2.5 w-full overflow-hidden rounded-full bg-cream-200 dark:bg-stone-800">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all duration-300 dark:bg-primary-400"
                  style={{ width: `${Math.min(100, (stageAvg / UNLOCK_THRESHOLD) * 100)}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-primary-700 dark:text-primary-300">
                  Mode Acak (99 Nama Terbuka)
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">{memorizedCount}/99 hafal</span>
              </div>
              <div className="mb-2.5 flex items-baseline justify-between gap-2">
                <p className="text-sm text-stone-700 dark:text-stone-300">Rata-rata poin keseluruhan</p>
                <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                  {overallAvg} <span className="text-xs font-normal text-stone-500">/ 100</span>
                </p>
              </div>
              <div className="mb-3 h-2.5 w-full overflow-hidden rounded-full bg-cream-200 dark:bg-stone-800">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all duration-300 dark:bg-primary-400"
                  style={{ width: `${Math.min(100, overallAvg)}%` }}
                />
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleStart}
          className="mt-4 min-h-12 w-full rounded-2xl bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-primary-700 active:bg-primary-800 lg:mt-0 lg:w-52 lg:shrink-0 dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          Mulai Latihan
        </button>
      </section>

      {/* Grid 99 Nama per Tahap + Filter Tahap */}
      <section aria-label="Daftar 99 Asmaul Husna" className="mb-6 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-stone-900 lg:text-base dark:text-stone-100">
              Daftar 99 Asmaul Husna
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Ketuk kartu mana saja untuk membaca makna dan referensinya.
            </p>
          </div>

          {/* Filter Tahap */}
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter tahap">
            <button
              type="button"
              aria-pressed={stageFilter === 'all'}
              onClick={() => setStageFilter('all')}
              className={`min-h-9 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${stageFilter === 'all'
                ? 'border-primary-600 bg-primary-600 text-white dark:border-primary-500 dark:bg-primary-500'
                : 'border-cream-200 bg-white text-stone-600 hover:border-cream-300 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300'
                }`}
            >
              Semua
            </button>
            {STAGE_NUMBERS.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={stageFilter === s}
                onClick={() => setStageFilter(s)}
                className={`min-h-9 min-w-9 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-colors ${stageFilter === s
                  ? 'border-primary-600 bg-primary-600 text-white dark:border-primary-500 dark:bg-primary-500'
                  : 'border-cream-200 bg-white text-stone-600 hover:border-cream-300 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {visibleStages.map((stage) => {
          const { start, end } = getStageRange(stage);
          const stageNames = NAMES.filter((n) => n.stage === stage);
          const stageLocked = learningMode === 'sequential' && stage > unlockedStage;

          return (
            <div key={stage}>
              <div className="mb-2.5 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-stone-600 lg:text-sm dark:text-stone-400">
                  Tahap {stage} ({start}–{end})
                </h3>
                {stageLocked && (
                  <span className="inline-flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    Terkunci
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-2.5 lg:grid-cols-5 lg:gap-3">
                {stageNames.map((item) => {
                  const pts = getPoints(points, item.id);
                  const unlocked = isNameUnlocked(item.id, learningMode, unlockedStage);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectName(item.id)}
                      aria-label={`${item.id}. ${item.latin}, ${item.meaning}, ${pts} poin${unlocked ? '' : ', terkunci'}`}
                      className={`flex min-h-28 flex-col justify-between rounded-2xl border p-2.5 text-left transition-colors lg:min-h-32 lg:p-3.5 ${unlocked
                        ? 'border-cream-200 bg-white shadow-2xs hover:border-primary-300 dark:border-stone-800 dark:bg-stone-900/80 dark:hover:border-primary-800'
                        : 'border-cream-200/70 bg-cream-100/60 opacity-75 hover:opacity-100 dark:border-stone-800/70 dark:bg-stone-900/40'
                        }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                          {item.id}
                        </span>
                        {unlocked ? (
                          <StatusCircle points={pts} size={15} />
                        ) : (
                          <Lock className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" aria-hidden="true" />
                        )}
                      </div>

                      <p className="arabic-text my-0.5 text-center text-lg font-bold text-stone-900 lg:text-xl dark:text-stone-100">
                        {item.arabic}
                      </p>

                      <div className="w-full text-center">
                        <p className="truncate text-[11px] font-medium text-stone-700 lg:text-xs dark:text-stone-300">
                          {item.meaning}
                        </p>
                        <p className={`mt-0.5 text-[11px] font-semibold ${statusTextClass(pts)}`}>
                          {pts} poin
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* Catatan Transparansi Riwayat Hadis */}
      <footer className="rounded-2xl border border-cream-200 bg-cream-100/90 p-4 dark:border-stone-800 dark:bg-stone-900/60">
        <p className="max-w-prose text-xs leading-relaxed text-stone-600 dark:text-stone-400">
          {SOURCE_NOTE}
        </p>
      </footer>
    </main>
  );
}
