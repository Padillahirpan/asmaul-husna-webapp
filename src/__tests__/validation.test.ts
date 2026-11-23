import { describe, expect, it } from 'vitest';
import { validateNamesDataset, validateReferences } from '@/domain/validation';
import { getStageForName } from '@/domain/stage';
import type { AsmaName, NamesDataset, Reference, StageNumber } from '@/types';

const REFS: Reference[] = [
  { id: 'quran', title: "Al-Qur'an al-Karim", authorOrSource: 'Kalamullah' },
  { id: 'ghazali', title: 'Al-Maqsad al-Asna', authorOrSource: 'Al-Ghazali', url: 'https://example.org' },
];

/** Bangun dataset sintetis valid berisi 99 nama unik. */
function makeDataset(): NamesDataset {
  const names: AsmaName[] = Array.from({ length: 99 }, (_, i) => {
    const id = i + 1;
    return {
      id,
      stage: getStageForName(id) as StageNumber,
      arabic: `ٱسْمٌ ${id}`,
      latin: `Nama-${id}`,
      meaning: `Arti ${id}`,
      explanation: `Penjelasan ${id}`,
      citations: [{ referenceId: 'quran', location: `QS. ${id}` }],
    };
  });
  return {
    sourceNote: 'Riwayat at-Tirmidzi',
    bismillah: { arabic: 'بِسْمِ ٱللَّٰهِ', translation: 'Dengan nama Allah' },
    names,
  };
}

function withName(patch: Partial<AsmaName>, index = 0): NamesDataset {
  const d = makeDataset();
  d.names[index] = { ...d.names[index]!, ...patch };
  return d;
}

describe('validateReferences', () => {
  it('referensi valid', () => {
    expect(validateReferences(REFS)).toEqual([]);
  });

  it('menolak bukan array, kosong, id duplikat, field wajib kosong, url tidak valid', () => {
    expect(validateReferences({})).toEqual(['references harus berupa array']);
    expect(validateReferences([])).toContain('references tidak boleh kosong');
    const errs = validateReferences([
      REFS[0],
      { ...REFS[0], title: '' },
      { id: 'x', title: 'T', authorOrSource: ' ', url: 'ftp://a' },
    ]);
    expect(errs.some((e) => e.includes('id duplikat'))).toBe(true);
    expect(errs.some((e) => e.includes('title wajib'))).toBe(true);
    expect(errs.some((e) => e.includes('authorOrSource wajib'))).toBe(true);
    expect(errs.some((e) => e.includes('url'))).toBe(true);
  });
});

describe('validateNamesDataset', () => {
  it('dataset sintetis 99 nama valid', () => {
    expect(validateNamesDataset(makeDataset(), REFS)).toEqual([]);
  });

  it('harus tepat 99 nama', () => {
    const d = makeDataset();
    d.names.pop();
    expect(validateNamesDataset(d, REFS)).toContain('names harus berisi 99 nama, diterima 98');
  });

  it('id harus berurutan 1..99', () => {
    const d = makeDataset();
    [d.names[3], d.names[4]] = [d.names[4]!, d.names[3]!];
    const errs = validateNamesDataset(d, REFS);
    expect(errs).toContain('names[3]: id harus 4, diterima 5');
  });

  it('stage harus sesuai pembagian tahap', () => {
    expect(validateNamesDataset(withName({ stage: 1 }, 15), REFS)).toContain('names[15]: stage harus 2, diterima 1');
  });

  it('tulisan Arab wajib berhuruf Arab dan berharakat', () => {
    expect(validateNamesDataset(withName({ arabic: 'الرحمن' }), REFS)).toContain('names[0]: arabic harus berharakat');
    expect(validateNamesDataset(withName({ arabic: 'Ar-Rahman' }), REFS)).toContain('names[0]: arabic harus memuat huruf Arab');
  });

  it('field teks wajib tidak boleh kosong', () => {
    const errs = validateNamesDataset(withName({ latin: '', meaning: ' ', explanation: '' }), REFS);
    expect(errs).toEqual(
      expect.arrayContaining([
        'names[0]: latin wajib diisi',
        'names[0]: meaning wajib diisi',
        'names[0]: explanation wajib diisi',
      ]),
    );
  });

  it('citations minimal 1 dan referenceId harus ada di master referensi', () => {
    expect(validateNamesDataset(withName({ citations: [] }), REFS)).toContain('names[0]: citations minimal 1');
    const errs = validateNamesDataset(withName({ citations: [{ referenceId: 'tidak-ada', location: '' }] }), REFS);
    expect(errs).toContain('names[0].citations[0]: referenceId "tidak-ada" tidak ditemukan');
    expect(errs).toContain('names[0].citations[0]: location wajib diisi');
  });

  it('arti, tulisan Arab, dan transliterasi tidak boleh kembar (pasangan drilling harus tidak ambigu)', () => {
    const d = makeDataset();
    d.names[10] = { ...d.names[10]!, meaning: 'arti 1', arabic: d.names[0]!.arabic, latin: 'NAMA-1' };
    const errs = validateNamesDataset(d, REFS);
    expect(errs.some((e) => e.startsWith('names[10]: meaning kembar dengan names[0]'))).toBe(true);
    expect(errs.some((e) => e.startsWith('names[10]: arabic kembar dengan names[0]'))).toBe(true);
    expect(errs.some((e) => e.startsWith('names[10]: latin kembar dengan names[0]'))).toBe(true);
  });

  it('sourceNote dan bismillah (berharakat) wajib ada', () => {
    const d = makeDataset();
    const errs = validateNamesDataset({ ...d, sourceNote: '', bismillah: { arabic: 'بسم الله', translation: 'x' } }, REFS);
    expect(errs).toContain('sourceNote wajib diisi');
    expect(errs).toContain('bismillah.arabic harus berharakat');
    expect(validateNamesDataset({ ...d, bismillah: undefined }, REFS)).toContain(
      'bismillah.arabic dan bismillah.translation wajib diisi',
    );
  });

  it('bentuk dataset yang salah ditolak', () => {
    expect(validateNamesDataset(null, REFS)).toContain('dataset harus berupa objek');
    expect(validateNamesDataset({ ...makeDataset(), names: 'x' }, REFS)).toContain('names harus berupa array');
  });
});
