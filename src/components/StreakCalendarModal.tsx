import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  WEEKDAY_LABELS,
  compareYearMonth,
  getMonthCalendar,
  getYearMonth,
  isValidDateKey,
  shiftMonth,
  type MonthCalendarDay,
  type YearMonth,
} from '@/domain';
import type { DateKey } from '@/types';

interface StreakCalendarModalProps {
  open: boolean;
  onClose: () => void;
  completedDates: readonly DateKey[];
  today: DateKey;
  startDate: DateKey;
  streak: number;
}

const STATUS_DESC: Record<MonthCalendarDay['status'], string> = {
  done: 'sudah drilling',
  today: 'hari ini, belum drilling',
  missed: 'belum drilling',
  upcoming: 'belum tiba',
};

function cellClass(day: MonthCalendarDay): string {
  if (!day.inMonth) return 'text-stone-300 dark:text-stone-700';
  switch (day.status) {
    case 'done':
      return 'bg-primary-600 text-white dark:bg-primary-500';
    case 'today':
      return 'border border-dashed border-primary-500 bg-primary-50 font-bold text-primary-700 dark:border-primary-400 dark:bg-primary-950/40 dark:text-primary-300';
    case 'missed':
      return 'bg-cream-100 text-stone-500 dark:bg-stone-800/60 dark:text-stone-400';
    default:
      return 'text-stone-400 dark:text-stone-500';
  }
}

export function StreakCalendarModal({
  open,
  onClose,
  completedDates,
  today,
  startDate,
  streak,
}: StreakCalendarModalProps) {
  const currentMonth = getYearMonth(today);
  const [viewMonth, setViewMonth] = useState<YearMonth>(currentMonth);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Batas navigasi: bulan mulai (atau bulan latihan paling awal) s.d. bulan berjalan.
  const earliestKey = [startDate, ...completedDates].filter(isValidDateKey).sort()[0] ?? today;
  const minMonth = getYearMonth(earliestKey);
  const canPrev = compareYearMonth(viewMonth, minMonth) > 0;
  const canNext = compareYearMonth(viewMonth, currentMonth) < 0;

  useEffect(() => {
    if (!open) return;
    setViewMonth(getYearMonth(today));
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open, today]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && canPrev) setViewMonth((m) => shiftMonth(m, -1));
      else if (e.key === 'ArrowRight' && canNext) setViewMonth((m) => shiftMonth(m, 1));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose, canPrev, canNext]);

  if (!open || typeof document === 'undefined') return null;

  const calendar = getMonthCalendar(completedDates, viewMonth, today);
  const isCurrent = compareYearMonth(viewMonth, currentMonth) === 0;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/55 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="streak-calendar-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="animate-page-enter max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-cream-200 bg-cream-50 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 shadow-xl sm:max-w-md sm:rounded-3xl sm:p-6 dark:border-stone-800 dark:bg-stone-900">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="streak-calendar-title" className="text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Riwayat Latihan
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Tutup kalender"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cream-200 bg-white text-stone-700 transition-colors hover:bg-cream-100 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Ringkasan */}
        <dl className="mt-5 grid grid-cols-3 divide-x divide-cream-200 rounded-2xl border border-cream-200 bg-white py-3 text-center dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-950/50">
          <div className="px-2">
            <dt className="text-[11px] text-stone-500 dark:text-stone-400">Streak saat ini</dt>
            <dd className="mt-0.5 text-lg font-bold text-stone-900 dark:text-stone-100">{streak} hari</dd>
          </div>
          <div className="px-2">
            <dt className="text-[11px] text-stone-500 dark:text-stone-400">Latihan bulan ini</dt>
            <dd className="mt-0.5 text-lg font-bold text-stone-900 dark:text-stone-100">
              {calendar.completedCount} hari
            </dd>
          </div>
          <div className="px-2">
            <dt className="text-[11px] text-stone-500 dark:text-stone-400">Terpanjang</dt>
            <dd className="mt-0.5 text-lg font-bold text-stone-900 dark:text-stone-100">
              {calendar.longestStreakInMonth} hari
            </dd>
          </div>
        </dl>

        {/* Navigasi Bulan */}
        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setViewMonth((m) => shiftMonth(m, -1))}
            disabled={!canPrev}
            aria-label="Bulan sebelumnya"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cream-200 bg-white text-stone-700 transition-colors hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-35 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="text-center">
            <p aria-live="polite" className="text-sm font-bold text-stone-900 dark:text-stone-100">
              {calendar.label}
            </p>
            {!isCurrent && (
              <button
                type="button"
                onClick={() => setViewMonth(currentMonth)}
                className="mt-0.5 text-xs font-semibold text-primary-700 underline-offset-2 hover:underline dark:text-primary-300"
              >
                Kembali ke bulan ini
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setViewMonth((m) => shiftMonth(m, 1))}
            disabled={!canNext}
            aria-label="Bulan berikutnya"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cream-200 bg-white text-stone-700 transition-colors hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-35 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Grid Kalender */}
        <div className="mt-4" role="grid" aria-label={`Kalender latihan ${calendar.label}`}>
          <div className="grid grid-cols-7 gap-1 text-center" role="row">
            {WEEKDAY_LABELS.map((label) => (
              <span key={label} role="columnheader" className="py-1 text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                {label}
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {calendar.days.map((day) => (
              <div
                key={day.dateKey}
                role="gridcell"
                aria-label={day.inMonth ? `${day.dayOfMonth} ${calendar.label}: ${STATUS_DESC[day.status]}` : undefined}
                aria-hidden={day.inMonth ? undefined : true}
                className="flex aspect-square items-center justify-center"
              >
                <span
                  className={`flex h-full max-h-11 w-full max-w-11 items-center justify-center rounded-full text-xs ${cellClass(day)}`}
                >
                  {day.inMonth && day.status === 'done' ? (
                    <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                  ) : (
                    day.dayOfMonth
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
