import type { AsmaName, NameId, NamesDataset, Reference } from '@/types';
import { getNameSlug } from '@/domain/slug';
import namesJson from './names.json';
import referencesJson from './references.json';

/** Akses bertipe ke dataset statis. */
export const namesDataset = namesJson as NamesDataset;
export const references = referencesJson as Reference[];

export const NAMES: readonly AsmaName[] = namesDataset.names;
export const BISMILLAH = namesDataset.bismillah;
export const SOURCE_NOTE = namesDataset.sourceNote;

const nameById = new Map<NameId, AsmaName>(NAMES.map((n) => [n.id, n]));
const nameBySlug = new Map<string, AsmaName>(NAMES.map((n) => [getNameSlug(n), n]));
const slugById = new Map<NameId, string>(NAMES.map((n) => [n.id, getNameSlug(n)]));
const referenceById = new Map<string, Reference>(references.map((r) => [r.id, r]));

export const ALL_NAME_SLUGS: readonly string[] = NAMES.map((n) => getNameSlug(n));

export function getNameById(id: NameId): AsmaName | undefined {
  return nameById.get(id);
}

export function getNameBySlug(slug: string): AsmaName | undefined {
  return nameBySlug.get(slug.trim().toLowerCase());
}

export function getSlugByNameId(id: NameId): string | undefined {
  return slugById.get(id);
}

export function getReferenceById(id: string): Reference | undefined {
  return referenceById.get(id);
}

export { getNameSlug };

export const APP_VERSION = { number: '0.1.0', label: 'Beta' } as const;
