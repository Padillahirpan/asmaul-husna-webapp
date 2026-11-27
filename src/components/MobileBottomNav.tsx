import { NavLink, useLocation } from 'react-router';
import { BookOpen, Flame, Settings } from 'lucide-react';

const MOBILE_NAV_ITEMS = [
  { to: '/', label: '99 Nama', Icon: BookOpen, matchPrefix: '/nama' },
  { to: '/hafalan', label: 'Hafalan', Icon: Flame },
  { to: '/pengaturan', label: 'Pengaturan', Icon: Settings },
] as const;

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
      <nav
        aria-label="Navigasi bawah"
        className="pointer-events-auto mx-auto grid max-w-sm grid-cols-3 gap-1 rounded-3xl border border-white/70 bg-white/55 p-1.5 shadow-[0_10px_32px_-8px_rgba(28,25,23,0.18),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(28,25,23,0.06)] backdrop-blur-xl backdrop-saturate-180 dark:border-white/15 dark:bg-stone-900/55 dark:shadow-[0_12px_36px_-8px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.45)]"
      >
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
                return `flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-3xl px-2 py-1.5 text-[11px] font-semibold transition-all duration-150 active:scale-[0.97] ${active
                  ? 'bg-white/75 text-primary-700 shadow-[0_2px_10px_-2px_rgba(3,97,68,0.16),inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-white/80 dark:bg-white/12 dark:text-primary-300 dark:shadow-[0_2px_10px_-2px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.18)] dark:ring-white/15'
                  : 'text-stone-700/80 hover:bg-white/40 hover:text-stone-900 dark:text-stone-300/80 dark:hover:bg-white/8 dark:hover:text-stone-100'
                  }`;
              }}
            >
              {({ isActive }) => {
                const active = isActive || isExtraActive;
                return (
                  <>
                    <Icon
                      className="h-4.5 w-4.5"
                      strokeWidth={active ? 2.25 : 1.9}
                      aria-hidden="true"
                    />
                    <span>{label}</span>
                  </>
                );
              }}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
