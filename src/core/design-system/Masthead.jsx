import { BrandMark } from './BrandMark.jsx';

/**
 * Cabecera de pantalla «Recibo».
 *
 * - Con `brand`: logotipo + «McPOINTS» y la fecha de hoy, como la cabecera
 *   de un ticket (pantalla de Inicio).
 * - Sin `brand`: título de pantalla en mono mayúsculas.
 * `action` va a la derecha (botón redondo con borde de tinta).
 */
export function Masthead({ title, brand = false, aside, action }) {
  return (
    <header className="flex items-center justify-between gap-3 px-1 pt-2 pb-4">
      {brand ? (
        <div className="flex items-center gap-2.5 text-accent">
          <BrandMark size={24} crop color="currentColor" lineColor="currentColor" />
          <span className="font-mono text-[18px] font-semibold tracking-[0.12em] text-ink">McPOINTS</span>
        </div>
      ) : (
        <h1 className="text-masthead">{title}</h1>
      )}
      {aside && <span className="font-mono text-[13px] font-medium text-ink tabular-nums">{aside}</span>}
      {action}
    </header>
  );
}

/** Botón circular con borde de tinta, para las acciones de cabecera. */
export function MastheadButton({ icon: Icon, label, onClick, active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        active ? 'bg-ink text-surface' : 'text-ink'
      }`}
    >
      <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
    </button>
  );
}
