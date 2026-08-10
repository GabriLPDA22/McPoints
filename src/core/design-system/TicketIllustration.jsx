// Ilustración de ticket — referencia exacta aprobada por el usuario.
// Distinta del símbolo de marca (TicketMark, "ticket + scan corners"): esto es
// una ILUSTRACIÓN, no un logo. Cuerpo rectangular con esquinas rectas,
// inclinado -24°, con una muesca semicircular hacia dentro en cada lateral y
// una línea de perforación discontinua cerca del extremo derecho. Sin
// relleno, sin scan corners, sin texto/número dentro.
export function TicketIllustration({ className = 'w-24 h-24', strokeWidth = 2.5 }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden>
      <g transform="rotate(-24 50 50)">
        <path
          d="M 20 37 L 80 37 L 80 44
             A 6 6 0 0 0 80 56 L 80 63
             L 20 63 L 20 56
             A 6 6 0 0 0 20 44 Z"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          strokeLinejoin="miter"
        />
        <line
          x1="64"
          y1="37"
          x2="64"
          y2="63"
          stroke="currentColor"
          strokeWidth={strokeWidth * 0.7}
          strokeDasharray="4 4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
