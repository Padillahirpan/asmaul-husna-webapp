import { Link, NavLink, useLocation } from 'react-router';
import { BookOpen, Flame, Settings } from 'lucide-react';
import { APP_VERSION } from '@/data';
import { ALL_NAME_IDS, countByStatus, getWeeklyStreak, toLocalDateKey } from '@/domain';
import { useUserStore } from '@/store/useUserStore';

const NAV_ITEMS = [
  { to: '/', label: '99 Asmaul Husna', Icon: BookOpen, matchPrefix: '/nama' },
  { to: '/hafalan', label: 'Progres & Streak', Icon: Flame },
  { to: '/pengaturan', label: 'Pengaturan', Icon: Settings },
] as const;

export function DesktopSidebar() {
  const location = useLocation();
  const onboardingCompleted = useUserStore((s) => s.onboardingCompleted);
  const userName = useUserStore((s) => s.userName);
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
        <Link to="/" className="mb-7 block rounded-2xl px-2 py-1">
          <p className="mt-0.5 text-sm font-bold tracking-tight text-stone-900 dark:text-stone-100">
            99 Asmaul Husna
          </p>
        </Link>

        {/* Menu Navigasi */}
        <nav className="space-y-1">
          {NAV_ITEMS.map(({ to, label, Icon, ...rest }) => {
            const matchPrefix = 'matchPrefix' in rest ? rest.matchPrefix : undefined;
            const isExtraActive =
              matchPrefix !== undefined && location.pathname.startsWith(matchPrefix);

            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => {
                  const active = isActive || isExtraActive;
                  return `flex min-h-11 w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-200 dark:bg-primary-950/45 dark:text-primary-300 dark:ring-primary-900/70'
                      : 'text-stone-600 hover:bg-cream-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/70 dark:hover:text-stone-100'
                  }`;
                }}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Ringkasan Singkat / Ajakan, Versi & Kredit */}
      <div className="space-y-3">
        {onboardingCompleted ? (
          <Link
            to="/hafalan"
            className="block rounded-2xl border border-cream-200 bg-cream-100/80 p-3.5 transition-colors hover:border-primary-300 dark:border-stone-800 dark:bg-stone-800/50 dark:hover:border-primary-800"
          >
            <p className="truncate text-xs font-semibold text-stone-800 dark:text-stone-200">
              {userName}
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Flame
                  className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400"
                  aria-hidden="true"
                />
                {streak} hari
              </span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                {memorized}/99 hafal
              </span>
            </div>
          </Link>
        ) : (
          <div className="rounded-2xl border border-primary-200/80 bg-primary-50/70 p-3.5 dark:border-primary-900/60 dark:bg-primary-950/30">
            <p className="text-xs font-bold text-stone-900 dark:text-stone-100">Mulai Catat Hafalan</p>
            <p className="mt-1 text-[11px] leading-relaxed text-stone-600 dark:text-stone-300">
              Latih 99 Asmaul Husna per 15 nama dan pantau progres harian Anda.
            </p>
            <Link
              to="/hafalan/latihan"
              className="mt-3 inline-flex min-h-9 w-full items-center justify-center rounded-xl bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
            >
              Mulai Latihan
            </Link>
          </div>
        )}
        <div className="space-y-1 px-2 text-[11px] text-stone-500 dark:text-stone-500">
          <p>
            Versi {APP_VERSION.number} {APP_VERSION.label}
          </p>
          <p>
            Made with love and coffee by{' '}
            <a
              href="https://www.ipadillah.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-stone-700 underline decoration-stone-300 underline-offset-2 transition-colors hover:text-primary-700 dark:text-stone-300 dark:decoration-stone-700 dark:hover:text-primary-300"
            >
              ipadillah
            </a>
          </p>
        </div>
      </div>
    </aside>
  );
}
