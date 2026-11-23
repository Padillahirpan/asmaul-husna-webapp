import type { AsmaName, NameId, NamesDataset, Reference } from '@/types';
import namesJson from './names.json';
import referencesJson from './references.json';

/** Akses bertipe ke dataset statis. Isi lengkap disusun pada Tahap 3. */
export const namesDataset = namesJson as NamesDataset;
export const references = referencesJson as Reference[];

export const NAMES: readonly AsmaName[] = namesDataset.names;
export const BISMILLAH = namesDataset.bismillah;
export const SOURCE_NOTE = namesDataset.sourceNote;

const nameById = new Map<NameId, AsmaName>(NAMES.map((n) => [n.id, n]));
const referenceById = new Map<string, Reference>(references.map((r) => [r.id, r]));

export function getNameById(id: NameId): AsmaName | undefined {
  return nameById.get(id);
}

export function getReferenceById(id: string): Reference | undefined {
  return referenceById.get(id);
}

export const APP_VERSION = { number: '0.1.0', label: 'Beta' } as const;
