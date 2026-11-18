/** Chip de filtro «Recibo»: activo en negativo (tinta), inactivo con borde. */
export function Chip({ active, children, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-[40px] items-center gap-1.5 whitespace-nowrap rounded-[10px] border px-3.5 text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        active ? 'border-transparent bg-ink font-semibold text-surface' : 'border-border bg-surface text-muted hover:text-ink'
      } ${className}`}
    >
      {children}
    </button>
  );
}
