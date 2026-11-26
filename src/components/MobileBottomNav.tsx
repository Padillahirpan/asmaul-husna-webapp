import { NavLink, useLocation } from 'react-router';
import { BookOpen, Flame, ListChecks, Settings } from 'lucide-react';

const MOBILE_NAV_ITEMS = [
  { to: '/', label: '99 Nama', Icon: BookOpen, matchPrefix: '/nama' },
  { to: '/hafalan', label: 'Progres', Icon: Flame },
  { to: '/latihan', label: 'Latihan', Icon: ListChecks },
  { to: '/pengaturan', label: 'Pengaturan', Icon: Settings },
] as const;

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav
      aria-label="Navigasi bawah"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-cream-200 bg-cream-50/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden dark:border-stone-800 dark:bg-stone-900/95"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 px-2 py-1 md:max-w-2xl">
        {MOBILE_NAV_ITEMS.map(({ to, label, Icon, ...rest }) => {
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
                return `flex min-h-13 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 text-[11px] font-semibold transition-colors ${
                  active
                    ? 'text-primary-700 dark:text-primary-300'
                    : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                }`;
              }}
            >
              <Icon className="h-4.5 w-4.5" aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
