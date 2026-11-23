import type { DateKey } from '@/types';

/**
 * Streak harian & kalender mingguan (PRD v0.4 §7.2).
 * Semua fungsi murni: "hari ini" selalu diberikan sebagai parameter `DateKey`.
 * Aritmetika tanggal memakai UTC agar bebas dari pergeseran DST/zona waktu.
 */

const DATE_KEY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const WEEKDAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'] as const;

export type WeekDayStatus = 'done' | 'missed' | 'today' | 'upcoming';

export interface WeekDay {
  dateKey: DateKey;
  label: (typeof WEEKDAY_LABELS)[number];
  dayOfMonth: number;
  isToday: boolean;
  /** done = sudah drilling, missed = belum drilling (lewat), today = hari ini belum drilling, upcoming = belum tiba. */
  status: WeekDayStatus;
}

export function isValidDateKey(value: unknown): value is DateKey {
  if (typeof value !== 'string') return false;
  const m = DATE_KEY_RE.exec(value);
  if (!m) return false;
  const [, y, mo, d] = m;
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  return date.getUTCFullYear() === Number(y) && date.getUTCMonth() === Number(mo) - 1 && date.getUTCDate() === Number(d);
}

function toUtcMs(key: DateKey): number {
  if (!isValidDateKey(key)) throw new RangeError(`DateKey tidak valid: ${key}`);
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  return Date.UTC(y, m - 1, d);
}

function fromUtcMs(ms: number): DateKey {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Format `Date` ke `YYYY-MM-DD` menurut waktu lokal perangkat. */
export function toLocalDateKey(date: Date): DateKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(key: DateKey, days: number): DateKey {
  return fromUtcMs(toUtcMs(key) + days * MS_PER_DAY);
}

/** Selisih hari `to - from`. */
export function diffInDays(from: DateKey, to: DateKey): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / MS_PER_DAY);
}

/** Hari dalam pekan, 0 = Senin … 6 = Minggu. */
export function getIsoWeekdayIndex(key: DateKey): number {
  return (new Date(toUtcMs(key)).getUTCDay() + 6) % 7;
}

/** Tanggal Senin pada pekan yang memuat `key`. */
export function getMondayOf(key: DateKey): DateKey {
  return addDays(key, -getIsoWeekdayIndex(key));
}

/** Normalisasi: buang nilai tak valid & duplikat, urutkan naik. */
export function normalizeCompletedDates(dates: readonly unknown[]): DateKey[] {
  return [...new Set(dates.filter(isValidDateKey))].sort();
}

/** Tambahkan tanggal selesai tanpa duplikasi. */
export function addCompletedDate(dates: readonly DateKey[], key: DateKey): DateKey[] {
  if (!isValidDateKey(key)) throw new RangeError(`DateKey tidak valid: ${key}`);
  return normalizeCompletedDates([...dates, key]);
}

/**
 * Hitung streak berturut-turut.
 * Jika hari ini sudah drilling, hitung mundur dari hari ini; jika belum,
 * hitung mundur dari kemarin (streak belum putus sampai hari ini berakhir).
 */
export function calculateStreak(completedDates: readonly DateKey[], today: DateKey): number {
  const set = new Set(normalizeCompletedDates(completedDates));
  let cursor = set.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (set.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Deretan Senin–Minggu pekan berjalan beserta status tiap hari. */
export function getWeekDays(completedDates: readonly DateKey[], today: DateKey): WeekDay[] {
  const set = new Set(normalizeCompletedDates(completedDates));
  const monday = getMondayOf(today);
  return WEEKDAY_LABELS.map((label, i) => {
    const dateKey = addDays(monday, i);
    const isToday = dateKey === today;
    let status: WeekDayStatus;
    if (set.has(dateKey)) status = 'done';
    else if (isToday) status = 'today';
    else if (dateKey < today) status = 'missed';
    else status = 'upcoming';
    return { dateKey, label, dayOfMonth: Number(dateKey.slice(8, 10)), isToday, status };
  });
}

export function getWeeklyStreak(completedDates: readonly DateKey[], today: DateKey): { streak: number; weekDays: WeekDay[] } {
  return { streak: calculateStreak(completedDates, today), weekDays: getWeekDays(completedDates, today) };
}

/** Hari ke-X sejak `startDate` (hari mulai = hari ke-1, minimal 1). */
export function getDayNumber(startDate: DateKey, today: DateKey): number {
  if (!isValidDateKey(startDate)) return 1;
  return Math.max(1, diffInDays(startDate, today) + 1);
}

// ---------------------------------------------------------------------------
// Kalender bulanan (popup detail streak)
// ---------------------------------------------------------------------------

export const MONTH_LABELS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

/** Bulan kalender; `month` 1..12. */
export interface YearMonth {
  year: number;
  month: number;
}

export interface MonthCalendarDay {
  dateKey: DateKey;
  dayOfMonth: number;
  /** `false` untuk sel pengisi dari bulan sebelum/sesudah. */
  inMonth: boolean;
  isToday: boolean;
  status: WeekDayStatus;
}

export interface MonthCalendar extends YearMonth {
  label: string;
  /** Kelipatan 7 hari, dimulai Senin. */
  days: MonthCalendarDay[];
  /** Jumlah hari drilling selesai di bulan ini. */
  completedCount: number;
  /** Streak terpanjang yang seluruh harinya berada di bulan ini. */
  longestStreakInMonth: number;
}

export function getYearMonth(key: DateKey): YearMonth {
  return { year: Number(key.slice(0, 4)), month: Number(key.slice(5, 7)) };
}

export function shiftMonth({ year, month }: YearMonth, delta: number): YearMonth {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

/** Bandingkan dua bulan: negatif bila `a` lebih awal. */
export function compareYearMonth(a: YearMonth, b: YearMonth): number {
  return a.year * 12 + a.month - (b.year * 12 + b.month);
}

function firstOfMonth({ year, month }: YearMonth): DateKey {
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

function daysInMonth({ year, month }: YearMonth): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Grid kalender Senin–Minggu untuk satu bulan beserta status latihan tiap hari. */
export function getMonthCalendar(completedDates: readonly DateKey[], ym: YearMonth, today: DateKey): MonthCalendar {
  const set = new Set(normalizeCompletedDates(completedDates));
  const first = firstOfMonth(ym);
  const total = daysInMonth(ym);
  const leading = getIsoWeekdayIndex(first);
  const cellCount = Math.ceil((leading + total) / 7) * 7;
  const start = addDays(first, -leading);

  const days: MonthCalendarDay[] = [];
  let completedCount = 0;
  let run = 0;
  let longest = 0;

  for (let i = 0; i < cellCount; i++) {
    const dateKey = addDays(start, i);
    const inMonth = i >= leading && i < leading + total;
    const isToday = dateKey === today;
    let status: WeekDayStatus;
    if (set.has(dateKey)) status = 'done';
    else if (isToday) status = 'today';
    else if (dateKey < today) status = 'missed';
    else status = 'upcoming';

    if (inMonth) {
      if (status === 'done') {
        completedCount += 1;
        run += 1;
        longest = Math.max(longest, run);
      } else {
        run = 0;
      }
    }

    days.push({ dateKey, dayOfMonth: Number(dateKey.slice(8, 10)), inMonth, isToday, status });
  }

  return {
    ...ym,
    label: `${MONTH_LABELS[ym.month - 1]} ${ym.year}`,
    days,
    completedCount,
    longestStreakInMonth: longest,
  };
}
