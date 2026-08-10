// Marca de la app — concepto aprobado "A: Ticket + scan corners".
// Dos esquinas de visor de escáner (abiertas arriba) enmarcan los lados de
// un ticket cuyo borde inferior está cortado en zigzag, como un recibo real.
// Sin depender de fuentes web: debe ser legible incluso antes de que carguen.
export function TicketMark({ className = 'w-8 h-8', strokeWidth = 7 }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden>
      <path
        d="M 34 22 L 20 22 L 20 68
           L 27.5 77 L 35 68 L 42.5 77 L 50 68 L 57.5 77 L 65 68 L 72.5 77 L 80 68
           L 80 22 L 66 22"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
