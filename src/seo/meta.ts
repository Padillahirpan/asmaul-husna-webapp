import { NAMES, getNameBySlug, getNameSlug } from '@/data';
import { ASMAUL_HUSNA_FAQ } from '@/data/faq';

export interface RouteSeoMeta {
  title: string;
  description: string;
  pathname: string;
  canonical?: string;
  robots: 'index, follow' | 'noindex, follow';
  ogType: 'website' | 'article';
  jsonLd: readonly Record<string, unknown>[];
}

const SITE_NAME = 'Asmaul Husna';

export function normalizeSiteUrl(raw?: string): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (!trimmed) return undefined;
  if (!/^https?:\/\//i.test(trimmed)) return undefined;
  return trimmed;
}

function buildUrl(siteUrl: string | undefined, pathname: string): string | undefined {
  if (!siteUrl) return undefined;
  return pathname === '/' ? `${siteUrl}/` : `${siteUrl}${pathname}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function serializeJsonLd(payload: Record<string, unknown>): string {
  return JSON.stringify(payload).replace(/</g, '\\u003c');
}

function truncateDescription(text: string, maxLen = 158): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen - 1).trimEnd()}…`;
}

export function getRouteSeoMeta(rawPathname: string, rawSiteUrl?: string): RouteSeoMeta {
  const pathname = rawPathname === '/' ? '/' : rawPathname.replace(/\/+$/, '') || '/';
  const siteUrl = normalizeSiteUrl(rawSiteUrl);
  const canonical = buildUrl(siteUrl, pathname);

  // Halaman Detail 99 Nama: /nama/:slug
  if (pathname.startsWith('/nama/')) {
    const slug = pathname.slice('/nama/'.length);
    const item = getNameBySlug(slug);

    if (item) {
      const title = `${item.latin} (${item.arabic}) — Arti, Penjelasan & Dalil | 99 Asmaul Husna`;
      const description = truncateDescription(
        `${item.latin} (${item.arabic}) artinya ${item.meaning}. ${item.explanation}`,
      );

      const breadcrumbItems: Record<string, unknown>[] = [
        {
          '@type': 'ListItem',
          position: 1,
          name: '99 Asmaul Husna',
          ...(siteUrl ? { item: `${siteUrl}/` } : {}),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: item.latin,
          ...(canonical ? { item: canonical } : {}),
        },
      ];

      const jsonLd: Record<string, unknown>[] = [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbItems,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'DefinedTerm',
          name: item.latin,
          alternateName: item.arabic,
          description: `${item.meaning}. ${item.explanation}`,
          inDefinedTermSet: {
            '@type': 'DefinedTermSet',
            name: '99 Asmaul Husna',
            ...(siteUrl ? { url: `${siteUrl}/` } : {}),
          },
          ...(canonical ? { url: canonical } : {}),
        },
      ];

      return {
        title,
        description,
        pathname,
        canonical,
        robots: 'index, follow',
        ogType: 'article',
        jsonLd,
      };
    }

    return {
      title: 'Nama Tidak Ditemukan — 99 Asmaul Husna',
      description: 'Halaman yang Anda cari tidak cocok dengan salah satu dari 99 Asmaul Husna.',
      pathname,
      canonical,
      robots: 'noindex, follow',
      ogType: 'website',
      jsonLd: [],
    };
  }

  // Halaman Latihan (publik, cocok untuk keyword "latihan / kuis asmaul husna")
  if (pathname === '/latihan') {
    return {
      title: 'Latihan Hafalan 99 Asmaul Husna Interaktif — Asmaul Husna',
      description:
        'Uji dan latih hafalan 99 Asmaul Husna beserta artinya lewat sesi singkat 5 pertanyaan (15 nama) dengan metode bertahap atau acak.',
      pathname,
      canonical,
      robots: 'index, follow',
      ogType: 'website',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Latihan Hafalan 99 Asmaul Husna',
          applicationCategory: 'EducationalApplication',
          operatingSystem: 'All',
          inLanguage: 'id',
          ...(canonical ? { url: canonical } : {}),
        },
      ],
    };
  }

  // Halaman Progres & Streak (personal/localStorage)
  if (pathname === '/hafalan') {
    return {
      title: 'Progres & Streak Hafalan — Asmaul Husna',
      description:
        'Pantau progres hafalan 99 Asmaul Husna, streak harian, dan target penyelesaian hafalan Anda secara lokal di perangkat.',
      pathname,
      canonical,
      robots: 'noindex, follow',
      ogType: 'website',
      jsonLd: [],
    };
  }

  // Halaman Pengaturan (utilitas)
  if (pathname === '/pengaturan') {
    return {
      title: 'Pengaturan — Asmaul Husna',
      description: 'Sesuaikan tema tampilan, metode hafalan bertahap atau acak, dan target hari hafalan.',
      pathname,
      canonical,
      robots: 'noindex, follow',
      ogType: 'website',
      jsonLd: [],
    };
  }

  // Halaman Utama Publik: /
  const itemListElements = NAMES.map((item) => {
    const slug = getNameSlug(item);
    const itemUrl = buildUrl(siteUrl, `/nama/${slug}`);
    return {
      '@type': 'ListItem',
      position: item.id,
      name: `${item.latin} (${item.arabic}) — ${item.meaning}`,
      ...(itemUrl ? { url: itemUrl } : {}),
    };
  });

  const faqEntities = ASMAUL_HUSNA_FAQ.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  }));

  return {
    title: '99 Asmaul Husna: Arab, Latin, Arti & Latihan Hafalan',
    description:
      'Daftar lengkap 99 Asmaul Husna dengan tulisan Arab berharakat, transliterasi Latin, arti bahasa Indonesia, penjelasan berreferensi, dan latihan hafalan interaktif.',
    pathname: '/',
    canonical: buildUrl(siteUrl, '/'),
    robots: 'index, follow',
    ogType: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: '99 Asmaul Husna: Arab, Latin, dan Artinya',
        numberOfItems: NAMES.length,
        itemListElement: itemListElements,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqEntities,
      },
    ],
  };
}

export function renderSeoHeadTags(meta: RouteSeoMeta): string {
  const tags: string[] = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="robots" content="${escapeHtml(meta.robots)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta property="og:locale" content="id_ID" />`,
    `<meta property="og:type" content="${escapeHtml(meta.ogType)}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
  ];

  if (meta.canonical) {
    tags.push(`<link rel="canonical" href="${escapeHtml(meta.canonical)}" />`);
    tags.push(`<meta property="og:url" content="${escapeHtml(meta.canonical)}" />`);
  }

  for (const schema of meta.jsonLd) {
    tags.push(`<script type="application/ld+json">${serializeJsonLd(schema)}</script>`);
  }

  return tags.join('\n    ');
}
