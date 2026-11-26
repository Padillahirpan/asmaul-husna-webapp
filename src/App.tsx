import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import { getSlugByNameId } from '@/data';
import { useThemeEffect } from '@/hooks/useThemeEffect';
import { useRouteSeo } from '@/seo/useRouteSeo';
import { useHydrateUserStore, useUserStore } from '@/store/useUserStore';
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { Toast } from '@/components/Toast';
import Directory from '@/pages/Directory';
import Onboarding from '@/pages/Onboarding';
import Dashboard from '@/pages/Dashboard';
import Drilling from '@/pages/Drilling';
import NameDetail from '@/pages/NameDetail';
import Settings from '@/pages/Settings';
import type { NameId } from '@/types';

export default function App() {
  useHydrateUserStore();
  useRouteSeo();

  const onboardingCompleted = useUserStore((s) => s.onboardingCompleted);
  const theme = useUserStore((s) => s.theme);
  const hasActiveSession = useUserStore((s) => s.session !== null);

  useThemeEffect(theme);

  const location = useLocation();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  const isOnboardingRoute =
    !onboardingCompleted &&
    (location.pathname === '/hafalan' || location.pathname === '/hafalan/latihan');

  const showNav = !hasActiveSession && !isOnboardingRoute;

  const openNameFromLatihan = useCallback(
    (id: NameId) => {
      const slug = getSlugByNameId(id);
      if (slug) navigate(`/nama/${slug}`, { state: { from: '/hafalan/latihan' } });
    },
    [navigate],
  );

  if (isOnboardingRoute) {
    return (
      <div className="min-h-dvh bg-cream-100 text-stone-800 transition-colors dark:bg-stone-950 dark:text-stone-100">
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-cream-50 lg:max-w-5xl lg:justify-center lg:bg-transparent lg:px-8 lg:py-10 dark:bg-stone-900 lg:dark:bg-transparent">
          <Onboarding onComplete={() => navigate(location.pathname, { replace: true })} />
        </div>
        <Toast message={toast} />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-cream-100 text-stone-800 transition-colors dark:bg-stone-950 dark:text-stone-100">
      {showNav && <DesktopSidebar />}
      <div className={`flex min-h-dvh min-w-0 flex-1 flex-col ${showNav ? 'pb-16 lg:pb-0' : ''}`}>
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col border-x border-cream-200/80 bg-cream-50 md:max-w-2xl lg:max-w-5xl lg:border-x-0 lg:bg-transparent dark:border-stone-800/80 dark:bg-stone-900 lg:dark:bg-transparent">
          <Routes>
            <Route path="/" element={<Directory onToast={showToast} />} />
            <Route path="/nama/:slug" element={<NameDetail onToast={showToast} />} />
            <Route
              path="/hafalan"
              element={
                <Dashboard
                  onOpenDrilling={() => navigate('/hafalan/latihan')}
                  onOpenSettings={() => navigate('/pengaturan')}
                />
              }
            />
            <Route
              path="/hafalan/latihan"
              element={<Drilling onBack={() => navigate('/hafalan')} onSelectName={openNameFromLatihan} />}
            />
            <Route path="/latihan" element={<Navigate to="/hafalan/latihan" replace />} />
            <Route
              path="/pengaturan"
              element={
                <Settings
                  onBack={() => navigate(onboardingCompleted ? '/hafalan' : '/')}
                  onToast={showToast}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
      {showNav && <MobileBottomNav />}
      <Toast message={toast} />
    </div>
  );
}
