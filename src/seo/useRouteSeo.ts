import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { getRouteSeoMeta } from './meta';

/**
 * Menjaga `<title>` dan `<meta name="description">` selalu sinkron
 * saat pengguna berpindah halaman di sisi klien.
 */
export function useRouteSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const siteUrl = import.meta.env.VITE_SITE_URL as string | undefined;
    const meta = getRouteSeoMeta(pathname, siteUrl);

    document.title = meta.title;

    let descTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!descTag) {
      descTag = document.createElement('meta');
      descTag.name = 'description';
      document.head.appendChild(descTag);
    }
    descTag.content = meta.description;
  }, [pathname]);
}
