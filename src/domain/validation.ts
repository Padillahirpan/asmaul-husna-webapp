import type { AsmaName, NamesDataset, Reference } from '@/types';
import { TOTAL_NAMES, getStageForName } from './stage';

/** Validasi skema & integritas dataset statis. Mengembalikan daftar pesan galat (kosong = valid). */

const ARABIC_LETTER_RE = /[\u0621-\u064A\u0671]/;
/** Harakat: fathatan..sukun, dan alif khanjariyah. */
const HARAKAT_RE = /[\u064B-\u0652\u0670]/;

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

export function validateReferences(references: unknown): string[] {
  const errors: string[] = [];
  if (!Array.isArray(references)) return ['references harus berupa array'];
  if (references.length === 0) errors.push('references tidak boleh kosong');
  const seen = new Set<string>();
  references.forEach((ref: Partial<Reference>, i) => {
    const at = `references[${i}]`;
    if (!ref || typeof ref !== 'object') {
      errors.push(`${at}: harus berupa objek`);
      return;
    }
    if (!isNonEmptyString(ref.id)) errors.push(`${at}: id wajib diisi`);
    else if (seen.has(ref.id)) errors.push(`${at}: id duplikat "${ref.id}"`);
    else seen.add(ref.id);
    if (!isNonEmptyString(ref.title)) errors.push(`${at}: title wajib diisi`);
    if (!isNonEmptyString(ref.authorOrSource)) errors.push(`${at}: authorOrSource wajib diisi`);
    if (ref.url !== undefined && !(isNonEmptyString(ref.url) && /^https?:\/\//.test(ref.url))) {
      errors.push(`${at}: url harus diawali http(s)://`);
    }
  });
  return errors;
}

function validateName(name: Partial<AsmaName>, index: number, refIds: Set<string>): string[] {
  const errors: string[] = [];
  const at = `names[${index}]`;
  const expectedId = index + 1;
  if (name.id !== expectedId) errors.push(`${at}: id harus ${expectedId}, diterima ${String(name.id)}`);
  if (typeof name.id === 'number' && name.id >= 1 && name.id <= TOTAL_NAMES && name.stage !== getStageForName(name.id)) {
    errors.push(`${at}: stage harus ${getStageForName(name.id)}, diterima ${String(name.stage)}`);
  }
  if (!isNonEmptyString(name.arabic)) errors.push(`${at}: arabic wajib diisi`);
  else {
    if (!ARABIC_LETTER_RE.test(name.arabic)) errors.push(`${at}: arabic harus memuat huruf Arab`);
    if (!HARAKAT_RE.test(name.arabic)) errors.push(`${at}: arabic harus berharakat`);
  }
  if (!isNonEmptyString(name.latin)) errors.push(`${at}: latin wajib diisi`);
  if (!isNonEmptyString(name.meaning)) errors.push(`${at}: meaning wajib diisi`);
  if (!isNonEmptyString(name.explanation)) errors.push(`${at}: explanation wajib diisi`);
  if (!Array.isArray(name.citations) || name.citations.length === 0) {
    errors.push(`${at}: citations minimal 1`);
  } else {
    name.citations.forEach((c, ci) => {
      if (!c || !isNonEmptyString(c.referenceId)) errors.push(`${at}.citations[${ci}]: referenceId wajib diisi`);
      else if (!refIds.has(c.referenceId)) errors.push(`${at}.citations[${ci}]: referenceId "${c.referenceId}" tidak ditemukan`);
      if (!c || !isNonEmptyString(c.location)) errors.push(`${at}.citations[${ci}]: location wajib diisi`);
    });
  }
  return errors;
}

export function validateNamesDataset(dataset: unknown, references: unknown): string[] {
  const errors = validateReferences(references);
  const refIds = new Set(Array.isArray(references) ? references.map((r: Reference) => r?.id).filter(isNonEmptyString) : []);

  if (!dataset || typeof dataset !== 'object') return [...errors, 'dataset harus berupa objek'];
  const d = dataset as Partial<NamesDataset>;

  if (!isNonEmptyString(d.sourceNote)) errors.push('sourceNote wajib diisi');
  if (!d.bismillah || !isNonEmptyString(d.bismillah.arabic) || !isNonEmptyString(d.bismillah.translation)) {
    errors.push('bismillah.arabic dan bismillah.translation wajib diisi');
  } else if (!HARAKAT_RE.test(d.bismillah.arabic)) {
    errors.push('bismillah.arabic harus berharakat');
  }

  if (!Array.isArray(d.names)) return [...errors, 'names harus berupa array'];
  if (d.names.length !== TOTAL_NAMES) errors.push(`names harus berisi ${TOTAL_NAMES} nama, diterima ${d.names.length}`);

  d.names.forEach((n, i) => errors.push(...validateName(n ?? {}, i, refIds)));

  // Keunikan: arti & tulisan Arab tidak boleh kembar agar pasangan drilling tidak ambigu.
  for (const field of ['arabic', 'latin', 'meaning'] as const) {
    const seen = new Map<string, number>();
    d.names.forEach((n, i) => {
      const v = n?.[field];
      if (!isNonEmptyString(v)) return;
      const key = v.trim().toLowerCase();
      if (seen.has(key)) errors.push(`names[${i}]: ${field} kembar dengan names[${seen.get(key)}] ("${v}")`);
      else seen.set(key, i);
    });
  }
  return errors;
}
