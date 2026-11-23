import { useEffect } from 'react';
import type { Theme } from '@/types';

const LIGHT_THEME_COLOR = '#f8f4f0';
const DARK_THEME_COLOR = '#0c0a09';

/** Sinkronkan kelas `.dark` pada `<html>` & `<meta name="theme-color">` dengan pilihan tema. */
export function useThemeEffect(theme: Theme) {
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const apply = () => {
      const isDark = theme === 'dark' || (theme === 'system' && media.matches);
      root.classList.toggle('dark', isDark);
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', isDark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
    };

    apply();
    if (theme === 'system') {
      media.addEventListener('change', apply);
      return () => media.removeEventListener('change', apply);
    }
    return undefined;
  }, [theme]);
}
