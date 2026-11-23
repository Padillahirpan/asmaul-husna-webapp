import { useCallback, useEffect, useRef, useState } from 'react';
import { useThemeEffect } from '@/hooks/useThemeEffect';
import { useUserStore } from '@/store/useUserStore';
import { DesktopSidebar, type NavSection } from '@/components/DesktopSidebar';
import { Toast } from '@/components/Toast';
import Onboarding from '@/pages/Onboarding';
import Dashboard from '@/pages/Dashboard';
import Drilling from '@/pages/Drilling';
import NameDetail from '@/pages/NameDetail';
import Settings from '@/pages/Settings';
import type { NameId } from '@/types';

type Route =
  | { name: 'dashboard' }
  | { name: 'drilling' }
  | { name: 'detail'; id: NameId }
  | { name: 'settings' };

export default function App() {
  const onboardingCompleted = useUserStore((s) => s.onboardingCompleted);
  const theme = useUserStore((s) => s.theme);
  const hasActiveSession = useUserStore((s) => s.session !== null);

  useThemeEffect(theme);

  const [route, setRoute] = useState<Route>({ name: 'dashboard' });
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const navigate = useCallback((next: Route) => {
    setRoute(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleSidebarNav = useCallback(
    (section: NavSection) => {
      navigate({ name: section });
    },
    [navigate],
  );

  if (!onboardingCompleted) {
    return (
      <div className="min-h-dvh bg-cream-100 text-stone-800 transition-colors dark:bg-stone-950 dark:text-stone-100">
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-cream-50 lg:max-w-5xl lg:justify-center lg:bg-transparent lg:px-8 lg:py-10 dark:bg-stone-900 lg:dark:bg-transparent">
          <Onboarding onComplete={() => navigate({ name: 'dashboard' })} />
        </div>
        <Toast message={toast} />
      </div>
    );
  }

  const activeNav: NavSection =
    route.name === 'detail' ? 'drilling' : route.name === 'settings' ? 'settings' : route.name;

  const showSidebar = !hasActiveSession;

  const renderPage = () => {
    switch (route.name) {
      case 'dashboard':
        return (
          <Dashboard
            onOpenDrilling={() => navigate({ name: 'drilling' })}
            onOpenSettings={() => navigate({ name: 'settings' })}
          />
        );
      case 'drilling':
        return (
          <Drilling
            onBack={() => navigate({ name: 'dashboard' })}
            onSelectName={(id) => navigate({ name: 'detail', id })}
          />
        );
      case 'detail':
        return (
          <NameDetail
            nameId={route.id}
            onBack={() => navigate({ name: 'drilling' })}
            onSelectName={(id) => navigate({ name: 'detail', id })}
          />
        );
      case 'settings':
        return <Settings onBack={() => navigate({ name: 'dashboard' })} onToast={showToast} />;
    }
  };

  return (
    <div className="flex min-h-dvh bg-cream-100 text-stone-800 transition-colors dark:bg-stone-950 dark:text-stone-100">
      {showSidebar && <DesktopSidebar active={activeNav} onNavigate={handleSidebarNav} />}
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col border-x border-cream-200/80 bg-cream-50 md:max-w-2xl lg:max-w-5xl lg:border-x-0 lg:bg-transparent dark:border-stone-800/80 dark:bg-stone-900 lg:dark:bg-transparent">
          {renderPage()}
        </div>
      </div>
      <Toast message={toast} />
    </div>
  );
}
