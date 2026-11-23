import { describe, expect, it } from 'vitest';
import {
  addCompletedDate,
  addDays,
  calculateStreak,
  diffInDays,
  getDayNumber,
  getMondayOf,
  getWeekDays,
  getWeeklyStreak,
  isValidDateKey,
  normalizeCompletedDates,
  toLocalDateKey,
} from '@/domain/streak';

describe('utilitas tanggal', () => {
  it('toLocalDateKey memakai tanggal lokal berformat YYYY-MM-DD', () => {
    expect(toLocalDateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(toLocalDateKey(new Date(2026, 10, 22, 0, 0))).toBe('2026-11-22');
  });

  it('isValidDateKey menolak format atau tanggal tidak valid', () => {
    expect(isValidDateKey('2024-02-29')).toBe(true);
    expect(isValidDateKey('2023-02-29')).toBe(false);
    expect(isValidDateKey('2024-13-01')).toBe(false);
    expect(isValidDateKey('2024-1-01')).toBe(false);
    expect(isValidDateKey(20240101)).toBe(false);
  });

  it('addDays melintasi bulan, tahun, dan tahun kabisat', () => {
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDays('2024-02-29', 1)).toBe('2024-03-01');
    expect(addDays('2025-12-31', 1)).toBe('2026-01-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(diffInDays('2026-01-01', '2026-03-01')).toBe(59);
  });

  it('getMondayOf mengembalikan Senin pada pekan yang sama', () => {
    expect(getMondayOf('2026-11-16')).toBe('2026-11-16'); // Senin
    expect(getMondayOf('2026-11-18')).toBe('2026-11-16'); // Rabu
    expect(getMondayOf('2026-11-22')).toBe('2026-11-16'); // Minggu
    expect(getMondayOf('2026-12-01')).toBe('2026-11-30'); // Selasa, lintas bulan
  });

  it('normalizeCompletedDates membuang duplikat & nilai rusak lalu mengurutkan', () => {
    expect(normalizeCompletedDates(['2026-11-20', 'x', '2026-11-18', '2026-11-20', null])).toEqual([
      '2026-11-18',
      '2026-11-20',
    ]);
  });

  it('addCompletedDate tidak menduplikasi tanggal yang sama', () => {
    const once = addCompletedDate([], '2026-11-22');
    expect(addCompletedDate(once, '2026-11-22')).toEqual(['2026-11-22']);
    expect(() => addCompletedDate([], 'kemarin')).toThrow();
  });
});

describe('calculateStreak', () => {
  const today = '2026-11-22';

  it('tanpa riwayat = 0', () => {
    expect(calculateStreak([], today)).toBe(0);
  });

  it('hanya hari ini = 1', () => {
    expect(calculateStreak([today], today)).toBe(1);
  });

  it('hari berturut-turut sampai hari ini', () => {
    expect(calculateStreak(['2026-11-20', '2026-11-21', '2026-11-22'], today)).toBe(3);
  });

  it('belum drilling hari ini tetapi kemarin ya → streak masih berjalan', () => {
    expect(calculateStreak(['2026-11-19', '2026-11-20', '2026-11-21'], today)).toBe(3);
  });

  it('terlewat satu hari memutus streak', () => {
    expect(calculateStreak(['2026-11-18', '2026-11-19', '2026-11-21', '2026-11-22'], today)).toBe(2);
    expect(calculateStreak(['2026-11-19', '2026-11-20'], today)).toBe(0);
  });

  it('urutan input & duplikat tidak memengaruhi hasil', () => {
    expect(calculateStreak(['2026-11-22', '2026-11-20', '2026-11-21', '2026-11-22'], today)).toBe(3);
  });

  it('streak melintasi pergantian bulan & tahun', () => {
    expect(calculateStreak(['2025-12-30', '2025-12-31', '2026-01-01'], '2026-01-01')).toBe(3);
  });
});

describe('getWeekDays — kalender Senin–Minggu', () => {
  it('menghasilkan 7 hari Senin–Minggu dengan label', () => {
    const days = getWeekDays([], '2026-11-18');
    expect(days.map((d) => d.label)).toEqual(['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']);
    expect(days.map((d) => d.dateKey)).toEqual([
      '2026-11-16',
      '2026-11-17',
      '2026-11-18',
      '2026-11-19',
      '2026-11-20',
      '2026-11-21',
      '2026-11-22',
    ]);
    expect(days.map((d) => d.dayOfMonth)).toEqual([16, 17, 18, 19, 20, 21, 22]);
  });

  it('status: done, missed, today, upcoming', () => {
    const days = getWeekDays(['2026-11-16'], '2026-11-18');
    expect(days.map((d) => d.status)).toEqual(['done', 'missed', 'today', 'upcoming', 'upcoming', 'upcoming', 'upcoming']);
    expect(days.filter((d) => d.isToday).map((d) => d.dateKey)).toEqual(['2026-11-18']);
  });

  it('hari ini yang sudah drilling berstatus done dan tetap ditandai isToday', () => {
    const today = getWeekDays(['2026-11-18'], '2026-11-18')[2]!;
    expect(today.status).toBe('done');
    expect(today.isToday).toBe(true);
  });

  it('hari Minggu: seluruh hari sebelumnya sudah lewat', () => {
    const days = getWeekDays(['2026-11-20'], '2026-11-22');
    expect(days.map((d) => d.status)).toEqual(['missed', 'missed', 'missed', 'missed', 'done', 'missed', 'today']);
  });

  it('pekan lintas bulan', () => {
    const days = getWeekDays([], '2026-12-01');
    expect(days[0]!.dateKey).toBe('2026-11-30');
    expect(days[6]!.dateKey).toBe('2026-12-06');
  });

  it('getWeeklyStreak menggabungkan streak & kalender', () => {
    const r = getWeeklyStreak(['2026-11-21', '2026-11-22'], '2026-11-22');
    expect(r.streak).toBe(2);
    expect(r.weekDays).toHaveLength(7);
  });
});

describe('getDayNumber — progres target hari', () => {
  it('hari mulai = hari ke-1', () => {
    expect(getDayNumber('2026-11-22', '2026-11-22')).toBe(1);
    expect(getDayNumber('2026-11-01', '2026-11-22')).toBe(22);
  });
  it('tidak pernah kurang dari 1 & tahan input rusak', () => {
    expect(getDayNumber('2026-12-01', '2026-11-22')).toBe(1);
    expect(getDayNumber('bukan-tanggal', '2026-11-22')).toBe(1);
  });
});
