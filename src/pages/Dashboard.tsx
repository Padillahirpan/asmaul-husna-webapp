import { useState } from 'react';
import { ArrowRight, CalendarDays, Check, ChevronRight, Flame, Settings as SettingsIcon } from 'lucide-react';
import {
  ALL_NAME_IDS,
  TOTAL_STAGES,
  UNLOCK_THRESHOLD,
  calculateOverallAverage,
  calculateStageAverage,
  countByStatus,
  getDayNumber,
  getWeeklyStreak,
  toLocalDateKey,
} from '@/domain';
import { useUserStore } from '@/store/useUserStore';
import { StatusCircle } from '@/components/StatusCircle';
import { StreakCalendarModal } from '@/components/StreakCalendarModal';

interface DashboardProps {
  onOpenDrilling: () => void;
  onOpenSettings: () => void;
}

const DAY_STATUS_DESC = {
  done: 'Sudah drilling',
  today: 'Hari ini, belum drilling',
  missed: 'Belum drilling',
  upcoming: 'Belum tiba',
} as const;

export default function Dashboard({ onOpenDrilling, onOpenSettings }: DashboardProps) {
  const userName = useUserStore((s) => s.userName);
  const learningMode = useUserStore((s) => s.learningMode);
  const targetDays = useUserStore((s) => s.targetDays);
  const startDate = useUserStore((s) => s.startDate);
  const unlockedStage = useUserStore((s) => s.unlockedStage);
  const points = useUserStore((s) => s.points);
  const completedDates = useUserStore((s) => s.completedDates);
  const lastSummary = useUserStore((s) => s.lastDrillingSummary);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const todayKey = toLocalDateKey(new Date());
  const { streak, weekDays } = getWeeklyStreak(completedDates, todayKey);
  const dayNumber = getDayNumber(startDate, todayKey);
  const counts = countByStatus(points, ALL_NAME_IDS);
  const practicedToday = completedDates.includes(todayKey);

  const stageAvg = Math.round(calculateStageAverage(unlockedStage, points) * 10) / 10;
  const overallAvg = Math.round(calculateOverallAverage(points) * 10) / 10;
  const progressPercent =
    learningMode === 'sequential'
      ? Math.min(100, Math.round((stageAvg / UNLOCK_THRESHOLD) * 100))
      : Math.min(100, Math.round(overallAvg));

  return (
    <main className="animate-page-enter flex flex-1 flex-col px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] lg:px-8 lg:py-8">
      {/* Header Sapaan */}
      <header className="mb-6 flex items-center justify-between gap-4 lg:mb-8">
        <div className="min-w-0">
          <p className="text-xs font-medium text-stone-500 lg:text-sm dark:text-stone-400">
            Assalamu&apos;alaikum,
          </p>
          <h1 className="truncate text-xl font-bold tracking-tight text-stone-900 lg:text-2xl dark:text-stone-100">
            {userName}
          </h1>
        </div>

        {/* Tombol Pengaturan di Mobile (< lg) */}
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Buka Pengaturan"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cream-200 bg-white text-stone-700 transition-colors hover:border-cream-300 hover:bg-cream-100 lg:hidden dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
        >
          <SettingsIcon className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Tombol Aksi Cepat di Desktop (>= lg) */}
        <button
          type="button"
          onClick={onOpenDrilling}
          className="hidden min-h-11 shrink-0 items-center gap-2 rounded-2xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-primary-700 lg:inline-flex dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          <span>{lastSummary ? 'Buka Halaman Latihan' : 'Mulai Latihan Pertama'}</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </header>

      {/* Grid 2 Kolom di Desktop, 1 Kolom di Mobile */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start lg:gap-6">
        {/* Kolom Kanan di Desktop (Atas di Mobile): Streak Mingguan */}
        <div className="space-y-4 lg:order-2 lg:col-span-5">
          <section
            aria-label="Streak mingguan"
            className="rounded-3xl border border-cream-200 bg-white p-5 shadow-2xs lg:p-6 dark:border-stone-800 dark:bg-stone-900/80"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary-200/80 bg-primary-50 text-primary-600 dark:border-primary-900/60 dark:bg-primary-950/40 dark:text-primary-400">
                <Flame className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {streak} Hari Beruntun
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Hari ke-{dayNumber} dari target {targetDays} hari
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCalendarOpen(true)}
                aria-haspopup="dialog"
                className="group/detail -mr-2 inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-2 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-primary-950/40"
              >
                <CalendarDays
                  className="h-4 w-4 transition-transform group-hover/detail:translate-x-0.5"
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* Kalender Senin–Minggu */}
            <div
              className="grid grid-cols-7 gap-1.5 text-center"
              role="list"
              aria-label="Status latihan pekan ini"
            >
              {weekDays.map((day) => {
                let circleClass =
                  'border-transparent bg-cream-100 text-stone-500 dark:bg-stone-800/80 dark:text-stone-400';
                if (day.status === 'done') {
                  circleClass = 'border-primary-600 bg-primary-600 text-white dark:border-primary-500 dark:bg-primary-500';
                } else if (day.status === 'today') {
                  circleClass =
                    'border-dashed border-primary-500 bg-primary-50 font-bold text-primary-700 dark:border-primary-400 dark:bg-primary-950/40 dark:text-primary-300';
                } else if (day.status === 'missed') {
                  circleClass =
                    'border-cream-200 bg-cream-100/70 text-stone-400 dark:border-stone-700 dark:bg-stone-800/40 dark:text-stone-500';
                }

                return (
                  <div
                    key={day.dateKey}
                    role="listitem"
                    aria-label={`${day.label} tanggal ${day.dayOfMonth}: ${DAY_STATUS_DESC[day.status]}`}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <span
                      className={`text-xs ${day.isToday
                        ? 'font-semibold text-primary-700 dark:text-primary-300'
                        : 'font-medium text-stone-500 dark:text-stone-400'
                        }`}
                    >
                      {day.label}
                    </span>
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs ${circleClass}`}
                    >
                      {day.status === 'done' ? (
                        <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                      ) : (
                        <span>{day.dayOfMonth}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 hidden border-t border-cream-200 pt-3.5 text-xs leading-relaxed text-stone-600 lg:block dark:border-stone-800 dark:text-stone-400">
              {practicedToday
                ? 'Alhamdulillah, sesi latihan hari ini sudah tercatat.'
                : 'Selesaikan satu sesi latihan (15 pasangan) hari ini untuk menjaga ritme harian.'}
            </p>
          </section>

          <StreakCalendarModal
            open={calendarOpen}
            onClose={() => setCalendarOpen(false)}
            completedDates={completedDates}
            today={todayKey}
            startDate={startDate}
            streak={streak}
          />
        </div>

        {/* Kolom Kiri di Desktop (Utama): Recap Progres & 4 Status */}
        <div className="lg:order-1 lg:col-span-7">
          <button
            type="button"
            onClick={onOpenDrilling}
            className="group w-full rounded-3xl border border-cream-200 bg-white p-5 text-left shadow-2xs transition-colors hover:border-primary-300 lg:p-6 dark:border-stone-800 dark:bg-stone-900/80 dark:hover:border-primary-800"
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-primary-700 dark:text-primary-300">
                {learningMode === 'sequential'
                  ? `Mode Bertahap — Tahap ${unlockedStage} dari ${TOTAL_STAGES}`
                  : 'Mode Acak — 99 Nama Terbuka'}
              </span>
              <span className="flex items-center gap-0.5 text-xs font-medium text-stone-500 transition-colors group-hover:text-primary-700 dark:text-stone-400 dark:group-hover:text-primary-300">
                Latihan
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>

            <div className="mb-3 flex items-end justify-between gap-2">
              <div>
                <span className="text-3xl font-bold tracking-tight text-stone-900 lg:text-4xl dark:text-stone-100">
                  {counts.memorized}
                </span>
                <span className="text-sm text-stone-600 dark:text-stone-400"> / 99 nama hafal</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {learningMode === 'sequential' ? `Rata-rata Tahap ${unlockedStage}` : 'Rata-rata Total'}
                </p>
                <p className="text-sm font-bold text-stone-900 lg:text-base dark:text-stone-100">
                  {learningMode === 'sequential' ? `${stageAvg} / ${UNLOCK_THRESHOLD}` : `${overallAvg} / 100`}
                </p>
              </div>
            </div>

            <div
              className="mb-5 h-2.5 w-full overflow-hidden rounded-full bg-cream-200 dark:bg-stone-800"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progres hafalan saat ini"
            >
              <div
                className="h-full rounded-full bg-primary-500 transition-all duration-300 dark:bg-primary-400"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Ringkasan 4 Status */}
            <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2">
              <div className="flex items-center justify-between rounded-2xl border border-cream-200/90 bg-cream-100/70 px-3.5 py-3 dark:border-stone-800 dark:bg-stone-800/50">
                <span className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300">
                  <StatusCircle points={0} size={16} />
                  Belum hafal
                </span>
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {counts.unlearned}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-primary-200/70 bg-primary-50/70 px-3.5 py-3 dark:border-primary-900/50 dark:bg-primary-950/25">
                <span className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300">
                  <StatusCircle points={30} size={16} />
                  Belajar
                </span>
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {counts.learning}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-amber-200/70 bg-amber-50/70 px-3.5 py-3 dark:border-amber-900/50 dark:bg-amber-950/25">
                <span className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300">
                  <StatusCircle points={70} size={16} />
                  Hampir hafal
                </span>
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {counts.almost}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-emerald-200/70 bg-emerald-50/70 px-3.5 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/25">
                <span className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300">
                  <StatusCircle points={100} size={16} />
                  Hafal
                </span>
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {counts.memorized}
                </span>
              </div>
            </div>

            {/* Info Drilling Terakhir / Ajakan Mulai */}
            <div className="border-t border-cream-200 pt-3.5 dark:border-stone-800">
              {lastSummary ? (
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-stone-500 dark:text-stone-400">
                    Latihan terakhir (
                    {new Date(lastSummary.completedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    })}
                    )
                  </span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {lastSummary.netPoints >= 0 ? '+' : ''}
                    {lastSummary.netPoints} poin, akurasi {lastSummary.accuracyPercent}%
                  </span>
                </div>
              ) : (
                <p className="text-center text-xs leading-relaxed text-stone-600 lg:text-left dark:text-stone-400">
                  Belum ada sesi latihan. Mulai sesi pertama Anda hari ini (5 pertanyaan, 15 nama).
                </p>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Tombol Utama di Mobile (< lg) */}
      <button
        type="button"
        onClick={onOpenDrilling}
        className="mt-auto pt-5 lg:hidden"
      >
        <span className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-primary-600 px-5 py-3.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-primary-700 active:bg-primary-800 dark:bg-primary-500 dark:hover:bg-primary-600">
          {lastSummary ? 'Buka Halaman Latihan' : 'Mulai Latihan Pertama'}
        </span>
      </button>
    </main>
  );
}
