import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { ALL_NAME_SLUGS } from '@/data';
import { getRouteSeoMeta, renderSeoHeadTags, type RouteSeoMeta } from '@/seo/meta';
import App from './App';

export function getPrerenderRoutes(): string[] {
  return [
    '/',
    ...ALL_NAME_SLUGS.map((slug) => `/nama/${slug}`),
    '/hafalan',
    '/hafalan/latihan',
    '/pengaturan',
  ];
}

export function getSitemapRoutes(): string[] {
  return ['/', '/hafalan/latihan', ...ALL_NAME_SLUGS.map((slug) => `/nama/${slug}`)];
}

export function render(
  url: string,
  siteUrl?: string,
): { html: string; headTags: string; meta: RouteSeoMeta } {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );

  const meta = getRouteSeoMeta(url, siteUrl);
  const headTags = renderSeoHeadTags(meta);

  return { html, headTags, meta };
}
