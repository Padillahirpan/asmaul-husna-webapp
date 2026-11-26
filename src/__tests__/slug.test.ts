import { describe, expect, it } from 'vitest';
import { ALL_NAME_SLUGS, NAMES, getNameBySlug, getNameSlug, getSlugByNameId } from '@/data';
import { isValidSlug, toNameSlug } from '@/domain/slug';

describe('domain/slug', () => {
  it('menghasilkan slug ASCII huruf kecil yang bersih dari transliterasi Latin', () => {
    expect(toNameSlug('Ar-Rahman')).toBe('ar-rahman');
    expect(toNameSlug("Al-Mu'min")).toBe('al-mumin');
    expect(toNameSlug("Al-'Aziz")).toBe('al-aziz');
    expect(toNameSlug('Dzul-Jalali wal-Ikram')).toBe('dzul-jalali-wal-ikram');
    expect(toNameSlug('  Al-Quddūs  ')).toBe('al-quddus');
  });

  it('menghasilkan tepat 99 slug yang unik dan valid untuk seluruh dataset', () => {
    expect(NAMES.length).toBe(99);
    expect(ALL_NAME_SLUGS.length).toBe(99);

    const unique = new Set(ALL_NAME_SLUGS);
    expect(unique.size).toBe(99);

    for (const slug of ALL_NAME_SLUGS) {
      expect(isValidSlug(slug)).toBe(true);
    }
  });

  it('mendukung pencarian dua arah (id <-> slug) untuk seluruh 99 nama', () => {
    for (const item of NAMES) {
      const slug = getNameSlug(item);
      expect(getSlugByNameId(item.id)).toBe(slug);
      expect(getNameBySlug(slug)).toEqual(item);
      expect(getNameBySlug(slug.toUpperCase())).toEqual(item);
    }
  });

  it('mengembalikan undefined untuk slug tidak dikenal', () => {
    expect(getNameBySlug('tidak-ada')).toBeUndefined();
    expect(getNameBySlug('')).toBeUndefined();
  });
});
