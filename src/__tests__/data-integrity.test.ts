import { describe, expect, it } from 'vitest';
import namesJson from '@/data/names.json';
import referencesJson from '@/data/references.json';
import { validateNamesDataset } from '@/domain/validation';

/**
 * Validasi integritas berkas JSON asli di `src/data/`.
 * Meta (bismillah, sourceNote) sudah tersedia sejak Tahap 1; daftar 99 nama
 * dan master referensi diisi pada Tahap 3 — blok kedua aktif otomatis saat itu.
 */

const HARAKAT_RE = /[\u064B-\u0652\u0670]/;

describe('data/names.json — meta', () => {
  it('memuat bismillah berharakat & terjemahan', () => {
    expect(HARAKAT_RE.test(namesJson.bismillah.arabic)).toBe(true);
    expect(namesJson.bismillah.translation.length).toBeGreaterThan(0);
  });

  it('memuat catatan transparansi riwayat at-Tirmidzi', () => {
    expect(namesJson.sourceNote).toMatch(/Tirmidzi/);
  });
});

const datasetReady = namesJson.names.length > 0;

describe.skipIf(!datasetReady)('data/names.json + references.json — integritas penuh (Tahap 3)', () => {
  it('lolos validasi skema tanpa galat', () => {
    expect(validateNamesDataset(namesJson, referencesJson)).toEqual([]);
  });
});
