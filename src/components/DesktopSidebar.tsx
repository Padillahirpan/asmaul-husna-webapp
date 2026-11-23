import { BookOpen, Flame, Home, Settings } from 'lucide-react';
import { APP_VERSION } from '@/data';
import { ALL_NAME_IDS, countByStatus, getWeeklyStreak, toLocalDateKey } from '@/domain';
import { useUserStore } from '@/store/useUserStore';

export type NavSection = 'dashboard' | 'drilling' | 'settings';

interface DesktopSidebarProps {
  active: NavSection;
  onNavigate: (section: NavSection) => void;
}

const NAV_ITEMS: readonly { key: NavSection; label: string; Icon: typeof Home }[] = [
  { key: 'dashboard', label: 'Beranda', Icon: Home },
  { key: 'drilling', label: 'Drilling & 99 Nama', Icon: BookOpen },
  { key: 'settings', label: 'Pengaturan', Icon: Settings },
];

export function DesktopSidebar({ active, onNavigate }: DesktopSidebarProps) {
  const userName = useUserStore((s) => s.userName);
  const learningMode = useUserStore((s) => s.learningMode);
  const unlockedStage = useUserStore((s) => s.unlockedStage);
  const points = useUserStore((s) => s.points);
  const completedDates = useUserStore((s) => s.completedDates);

  const { streak } = getWeeklyStreak(completedDates, toLocalDateKey(new Date()));
  const { memorized } = countByStatus(points, ALL_NAME_IDS);

  return (
    <aside
      aria-label="Navigasi utama"
      className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col justify-between border-r border-cream-200 bg-cream-50 px-4 py-6 lg:flex dark:border-stone-800 dark:bg-stone-900"
    >
      <div>
        {/* Identitas Aplikasi */}
        <div className="mb-7 px-2">
          <p className="arabic-text text-xl font-bold text-stone-900 dark:text-stone-100">
            أَسْمَاءُ ٱللَّٰهِ ٱلْحُسْنَىٰ
          </p>
          <p className="mt-0.5 text-sm font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Asmaul Husna
          </p>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            {learningMode === 'sequential'
              ? `Mode Bertahap — Tahap ${unlockedStage}/7`
              : 'Mode Acak — 99 Nama'}
          </p>
        </div>

        {/* Menu Navigasi */}
        <nav className="space-y-1">
          {NAV_ITEMS.map(({ key, label, Icon }) => {
            const isCurrent = active === key;
            return (
              <button
                key={key}
                type="button"
                aria-current={isCurrent ? 'page' : undefined}
                onClick={() => onNavigate(key)}
                className={`flex min-h-11 w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-sm font-semibold transition-colors ${
                  isCurrent
                    ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-200 dark:bg-primary-950/45 dark:text-primary-300 dark:ring-primary-900/70'
                    : 'text-stone-600 hover:bg-cream-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/70 dark:hover:text-stone-100'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Ringkasan Singkat & Versi */}
      <div className="space-y-3">
        <div className="rounded-2xl border border-cream-200 bg-cream-100/80 p-3.5 dark:border-stone-800 dark:bg-stone-800/50">
          <p className="truncate text-xs font-semibold text-stone-800 dark:text-stone-200">{userName}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Flame className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
              {streak} hari
            </span>
            <span className="font-semibold text-stone-800 dark:text-stone-200">{memorized}/99 hafal</span>
          </div>
        </div>
        <p className="px-2 text-[11px] text-stone-500 dark:text-stone-500">
          Versi {APP_VERSION.number} {APP_VERSION.label}
        </p>
      </div>
    </aside>
  );
}
