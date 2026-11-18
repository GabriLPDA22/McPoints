import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { House, LayoutGrid, ReceiptText, Settings2, ScanLine } from 'lucide-react';
import { useTranslation } from '@/core/i18n/useTranslation.js';

/**
 * Navegación «dock»: píldora flotante con las 4 secciones y, pegado a su
 * derecha, el botón rojo de escanear (la acción principal, siempre a mano).
 *
 * El dock usa la tinta como fondo (negro en claro, crema en oscuro) para que
 * destaque sobre el papel sin depender de sombras.
 */
export function AppShell() {
  const location = useLocation();
  const { t } = useTranslation();
  const hideNav = location.pathname === '/scan';

  const tabs = [
    { to: '/', icon: House, label: t('nav.home') },
    { to: '/collection', icon: LayoutGrid, label: t('nav.collection') },
    { to: '/history', icon: ReceiptText, label: t('nav.history') },
    { to: '/settings', icon: Settings2, label: t('nav.settings') },
  ];

  if (hideNav) {
    return <Outlet />;
  }

  return (
    <div className="app-shell">
      <main className="flex-1">
        <Outlet />
      </main>

      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto max-w-lg px-4"
        style={{ paddingBottom: 'calc(20px + var(--safe-bottom))' }}
      >
        <div className="pointer-events-auto flex items-center gap-2.5">
          <nav
            aria-label={t('nav.mainNavAria')}
            className="flex h-16 flex-1 items-center justify-around rounded-full bg-ink px-2 shadow-[0_14px_30px_-12px_rgb(0_0_0/0.5)]"
          >
            {tabs.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                aria-label={label}
                title={label}
                className={({ isActive }) =>
                  `flex h-12 w-14 items-center justify-center rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isActive ? 'bg-bg text-ink' : 'text-bg/60 hover:text-bg'
                  }`
                }
              >
                {({ isActive }) => <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.2 : 1.8} aria-hidden />}
              </NavLink>
            ))}
          </nav>

          <NavLink
            to="/scan"
            aria-label={t('nav.scanAria')}
            className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-accent text-on-accent shadow-[0_14px_30px_-10px_rgb(var(--primary)/0.7)] transition-transform duration-150 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            <ScanLine className="h-[26px] w-[26px]" strokeWidth={2.2} aria-hidden />
          </NavLink>
        </div>
      </div>
    </div>
  );
}
