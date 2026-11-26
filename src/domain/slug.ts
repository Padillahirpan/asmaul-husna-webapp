import type { AsmaName } from '@/types';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Mengubah transliterasi Latin Asmaul Husna menjadi slug URL deterministik.
 * Contoh:
 * - "Ar-Rahman" -> "ar-rahman"
 * - "Al-Mu'min" -> "al-mumin"
 * - "Dzul-Jalali wal-Ikram" -> "dzul-jalali-wal-ikram"
 */
export function toNameSlug(latin: string): string {
  return latin
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’‘`ʻʾʿ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getNameSlug(name: Pick<AsmaName, 'latin'>): string {
  return toNameSlug(name.latin);
}

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}
