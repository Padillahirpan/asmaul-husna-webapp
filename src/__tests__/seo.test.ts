import { describe, expect, it } from 'vitest';
import { getRouteSeoMeta, normalizeSiteUrl, renderSeoHeadTags } from '@/seo/meta';

describe('seo/meta', () => {
  it('menormalisasi VITE_SITE_URL dengan aman', () => {
    expect(normalizeSiteUrl('https://asmaulhusna.id/')).toBe('https://asmaulhusna.id');
    expect(normalizeSiteUrl('  https://asmaulhusna.id///  ')).toBe('https://asmaulhusna.id');
    expect(normalizeSiteUrl('')).toBeUndefined();
    expect(normalizeSiteUrl(undefined)).toBeUndefined();
    expect(normalizeSiteUrl('asmaulhusna.id')).toBeUndefined();
  });

  it('menghasilkan metadata lengkap dan JSON-LD ItemList + FAQPage untuk halaman utama /', () => {
    const meta = getRouteSeoMeta('/', 'https://asmaulhusna.id');
    expect(meta.title).toContain('99 Asmaul Husna');
    expect(meta.robots).toBe('index, follow');
    expect(meta.canonical).toBe('https://asmaulhusna.id/');
    expect(meta.jsonLd).toHaveLength(2);
    expect(meta.jsonLd[0]?.['@type']).toBe('ItemList');
    expect(meta.jsonLd[0]?.['numberOfItems']).toBe(99);
    expect(meta.jsonLd[1]?.['@type']).toBe('FAQPage');
  });

  it('menghasilkan metadata & BreadcrumbList + DefinedTerm untuk /nama/:slug', () => {
    const meta = getRouteSeoMeta('/nama/ar-rahman', 'https://asmaulhusna.id');
    expect(meta.title).toContain('Ar-Rahman');
    expect(meta.description).toContain('Yang Maha Pengasih');
    expect(meta.ogType).toBe('article');
    expect(meta.robots).toBe('index, follow');
    expect(meta.canonical).toBe('https://asmaulhusna.id/nama/ar-rahman');
    expect(meta.jsonLd[0]?.['@type']).toBe('BreadcrumbList');
    expect(meta.jsonLd[1]?.['@type']).toBe('DefinedTerm');
  });

  it('mengatur noindex pada halaman personal (/hafalan, /pengaturan) dan index pada /latihan', () => {
    expect(getRouteSeoMeta('/latihan').robots).toBe('index, follow');
    expect(getRouteSeoMeta('/hafalan').robots).toBe('noindex, follow');
    expect(getRouteSeoMeta('/pengaturan').robots).toBe('noindex, follow');
    expect(getRouteSeoMeta('/nama/tidak-ada').robots).toBe('noindex, follow');
  });

  it('merender tag head HTML dengan escaping yang aman dan canonical opsional', () => {
    const withoutDomain = renderSeoHeadTags(getRouteSeoMeta('/'));
    expect(withoutDomain).toContain('<title>');
    expect(withoutDomain).toContain('application/ld+json');
    expect(withoutDomain).not.toContain('rel="canonical"');

    const withDomain = renderSeoHeadTags(getRouteSeoMeta('/', 'https://asmaulhusna.id'));
    expect(withDomain).toContain('<link rel="canonical" href="https://asmaulhusna.id/" />');
  });
});
