import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const SSR_DIR = path.join(ROOT_DIR, 'dist-ssr');

async function loadEnvSiteUrl() {
  if (process.env.VITE_SITE_URL) return process.env.VITE_SITE_URL;

  for (const envFile of ['.env.production.local', '.env.local', '.env.production', '.env']) {
    const filePath = path.join(ROOT_DIR, envFile);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const match = /^VITE_SITE_URL\s*=\s*(.*)$/.exec(trimmed);
        if (match) {
          return match[1].trim().replace(/^['"]|['"]$/g, '');
        }
      }
    } catch {
      // Abaikan jika berkas env tidak ada
    }
  }
  return '';
}

function normalizeSiteUrl(raw) {
  if (!raw) return '';
  const trimmed = raw.trim().replace(/\/+$/, '');
  return /^https?:\/\//i.test(trimmed) ? trimmed : '';
}

function injectRouteHtml(template, headTags, appHtml) {
  const withHead = template.replace(
    /<!--seo-head-start-->[\s\S]*?<!--seo-head-end-->/,
    headTags,
  );
  return withHead.replace('<!--app-html-->', appHtml);
}

function buildSitemapXml(routes, siteUrl) {
  const baseUrl = siteUrl || 'https://example.com';
  const lastmod = new Date().toISOString().slice(0, 10);
  const note = siteUrl
    ? ''
    : '<!-- Setel VITE_SITE_URL di environment saat build setelah domain produksi aktif -->\n';

  const entries = routes
    .map((route) => {
      const loc = route === '/' ? `${baseUrl}/` : `${baseUrl}${route}`;
      const priority = route === '/' ? '1.0' : route === '/hafalan/latihan' ? '0.9' : '0.8';
      return [
        '  <url>',
        `    <loc>${loc}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n${note}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

function buildRobotsTxt(siteUrl) {
  const lines = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /pengaturan',
  ];
  if (siteUrl) {
    lines.push('', `Sitemap: ${siteUrl}/sitemap.xml`);
  }
  return `${lines.join('\n')}\n`;
}

async function run() {
  const rawSiteUrl = await loadEnvSiteUrl();
  const siteUrl = normalizeSiteUrl(rawSiteUrl);

  const templatePath = path.join(DIST_DIR, 'index.html');
  const template = await fs.readFile(templatePath, 'utf-8');

  const ssrEntryPath = path.join(SSR_DIR, 'entry-server.js');
  const { render, getPrerenderRoutes, getSitemapRoutes } = await import(
    pathToFileURL(ssrEntryPath).href
  );

  const routes = getPrerenderRoutes();
  for (const route of routes) {
    const { html, headTags } = render(route, siteUrl || undefined);
    const fullHtml = injectRouteHtml(template, headTags, html);

    const outFile =
      route === '/'
        ? templatePath
        : path.join(DIST_DIR, route.replace(/^\/+/, ''), 'index.html');

    await fs.mkdir(path.dirname(outFile), { recursive: true });
    await fs.writeFile(outFile, fullHtml, 'utf-8');
  }

  const sitemapRoutes = getSitemapRoutes();
  await fs.writeFile(
    path.join(DIST_DIR, 'sitemap.xml'),
    buildSitemapXml(sitemapRoutes, siteUrl),
    'utf-8',
  );
  await fs.writeFile(path.join(DIST_DIR, 'robots.txt'), buildRobotsTxt(siteUrl), 'utf-8');

  // Hapus folder sementara SSR
  await fs.rm(SSR_DIR, { recursive: true, force: true });

  console.log(
    `[prerender] Berhasil merender ${routes.length} halaman statis, sitemap.xml (${sitemapRoutes.length} URL), dan robots.txt.${
      siteUrl
        ? ` Domain aktif: ${siteUrl}`
        : ' (VITE_SITE_URL belum disetel; canonical akan aktif otomatis setelah disetel)'
    }`,
  );
}

run().catch((err) => {
  console.error('[prerender] Gagal:', err);
  process.exit(1);
});
