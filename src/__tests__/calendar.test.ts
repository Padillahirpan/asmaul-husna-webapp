import { describe, expect, it } from 'vitest';
import { compareYearMonth, getMonthCalendar, getYearMonth, shiftMonth } from '@/domain/streak';

describe('utilitas bulan', () => {
  it('getYearMonth membaca tahun & bulan dari DateKey', () => {
    expect(getYearMonth('2026-11-23')).toEqual({ year: 2026, month: 11 });
  });

  it('shiftMonth melintasi pergantian tahun', () => {
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
    expect(shiftMonth({ year: 2026, month: 3 }, -14)).toEqual({ year: 2025, month: 1 });
  });

  it('compareYearMonth', () => {
    expect(compareYearMonth({ year: 2026, month: 1 }, { year: 2025, month: 12 })).toBeGreaterThan(0);
    expect(compareYearMonth({ year: 2026, month: 5 }, { year: 2026, month: 5 })).toBe(0);
  });
});

describe('getMonthCalendar', () => {
  const today = '2026-11-23';

  it('grid dimulai Senin, kelipatan 7, dengan sel pengisi di luar bulan', () => {
    // 1 November 2026 = Minggu → 6 sel pengisi (26–31 Oktober).
    const cal = getMonthCalendar([], { year: 2026, month: 11 }, today);
    expect(cal.label).toBe('November 2026');
    expect(cal.days.length % 7).toBe(0);
    expect(cal.days[0]!.dateKey).toBe('2026-10-26');
    expect(cal.days.slice(0, 6).every((d) => !d.inMonth)).toBe(true);
    expect(cal.days[6]).toMatchObject({ dateKey: '2026-11-01', inMonth: true, dayOfMonth: 1 });
    expect(cal.days.filter((d) => d.inMonth)).toHaveLength(30);
  });

  it('bulan yang dimulai Senin tidak punya sel pengisi depan', () => {
    const cal = getMonthCalendar([], { year: 2026, month: 6 }, today); // 1 Juni 2026 = Senin
    expect(cal.days[0]!.dateKey).toBe('2026-06-01');
  });

  it('Februari kabisat berisi 29 hari', () => {
    const cal = getMonthCalendar([], { year: 2024, month: 2 }, today);
    expect(cal.days.filter((d) => d.inMonth)).toHaveLength(29);
  });

  it('status tiap hari: done, missed, today, upcoming', () => {
    const cal = getMonthCalendar(['2026-11-20', '2026-11-23'], { year: 2026, month: 11 }, today);
    const byKey = new Map(cal.days.map((d) => [d.dateKey, d]));
    expect(byKey.get('2026-11-20')!.status).toBe('done');
    expect(byKey.get('2026-11-21')!.status).toBe('missed');
    expect(byKey.get('2026-11-23')).toMatchObject({ status: 'done', isToday: true });
    expect(byKey.get('2026-11-24')!.status).toBe('upcoming');

    const notYet = getMonthCalendar([], { year: 2026, month: 11 }, today);
    expect(notYet.days.find((d) => d.isToday)!.status).toBe('today');
  });

  it('menghitung jumlah hari latihan & streak terpanjang di dalam bulan saja', () => {
    const dates = ['2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-10', '2026-11-11'];
    const cal = getMonthCalendar(dates, { year: 2026, month: 11 }, today);
    expect(cal.completedCount).toBe(5);
    expect(cal.longestStreakInMonth).toBe(3);
  });

  it('bulan tanpa latihan', () => {
    const cal = getMonthCalendar([], { year: 2026, month: 12 }, today);
    expect(cal.completedCount).toBe(0);
    expect(cal.longestStreakInMonth).toBe(0);
    expect(cal.days.filter((d) => d.inMonth).every((d) => d.status === 'upcoming')).toBe(true);
  });
});
