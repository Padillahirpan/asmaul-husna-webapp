import { getStatus, getStatusLabel } from '@/domain';

interface StatusCircleProps {
  points: number;
  size?: number;
  decorative?: boolean;
}

/**
 * Penanda status 4 tingkat (PRD v0.4 §6.1):
 * 0–19 kosong, 20–59 terisi 1/3, 60–99 terisi 2/3, 100 penuh + centang.
 */
export function StatusCircle({ points, size = 18, decorative = true }: StatusCircleProps) {
  const status = getStatus(points);
  const label = getStatusLabel(points);
  const a11y = decorative ? { 'aria-hidden': true as const } : { role: 'img' as const, 'aria-label': label };

  if (status === 'memorized') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0 text-emerald-600 dark:text-emerald-400" {...a11y}>
        <circle cx="12" cy="12" r="10" fill="currentColor" />
        <path d="M8 12.5L10.5 15L16 9.5" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (status === 'almost') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0 text-amber-600 dark:text-amber-400" {...a11y}>
        <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2" opacity="0.35" />
        <path d="M12 2.5A9.5 9.5 0 1 1 3.77 16.75L12 12V2.5Z" fill="currentColor" />
      </svg>
    );
  }

  if (status === 'learning') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0 text-primary-500 dark:text-primary-400" {...a11y}>
        <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2" opacity="0.35" />
        <path d="M12 2.5A9.5 9.5 0 0 1 20.23 16.75L12 12V2.5Z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0 text-stone-400 dark:text-stone-500" {...a11y}>
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
