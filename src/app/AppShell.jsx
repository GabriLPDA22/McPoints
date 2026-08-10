import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, Grid3X3, Camera, Clock, Settings } from 'lucide-react';
import { useTranslation } from '@/core/i18n/useTranslation.js';

export function AppShell() {
  const location = useLocation();
  const { t } = useTranslation();
  const hideNav = location.pathname === '/scan';

  const tabs = [
    { to: '/', icon: Home, label: t('nav.home') },
    { to: '/collection', icon: Grid3X3, label: t('nav.collection') },
    { to: '/scan', icon: Camera, label: t('nav.scanAria'), center: true },
    { to: '/history', icon: Clock, label: t('nav.history') },
    { to: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  if (hideNav) {
    return <Outlet />;
  }

  return (
    <div className="app-shell">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <nav
        className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-surface border-t border-border z-30"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label={t('nav.mainNavAria')}
      >
        <ul className="flex items-center justify-around h-16 px-1">
          {tabs.map(({ to, icon: Icon, label, center }) => (
            <li key={to} className="flex-1 flex items-center justify-center h-full">
              {center ? (
                <NavLink
                  to={to}
                  aria-label={label}
                  className="flex items-center justify-center h-full"
                >
                  <span className="flex items-center justify-center w-12 h-12 -translate-y-1 rounded-full bg-accent text-on-accent shadow-glow transition-transform duration-150 active:scale-95">
                    <Icon className="w-6 h-6" strokeWidth={2} />
                  </span>
                </NavLink>
              ) : (
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center gap-1 min-w-[48px] min-h-[48px] px-2 text-[11px] font-medium transition-colors duration-150 ${
                      isActive ? 'text-accent' : 'text-muted'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className="w-5 h-5" strokeWidth={1.75} />
                      <span>{label}</span>
                      <span
                        className={`w-1 h-1 rounded-full bg-accent transition-opacity duration-150 ${
                          isActive ? 'opacity-100' : 'opacity-0'
                        }`}
                        aria-hidden
                      />
                    </>
                  )}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
