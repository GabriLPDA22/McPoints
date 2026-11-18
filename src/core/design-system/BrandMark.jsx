import {
  BRACKETS,
  BRACKET_STROKE,
  BRAND_COLORS,
  BRAND_VIEWBOX,
  FRAME,
  LINE_STROKE,
  TICKET,
  TICKET_LINES,
  TICKET_STROKE,
} from './brandGeometry.js';

/**
 * Marca de la app (ticket dentro de esquinas de escáner) en SVG, con las
 * mismas coordenadas que el icono de launcher y la splash nativa.
 *
 * `animated` añade la línea de escaneo y los ganchos de clase que anima la
 * splash (`brand-beam`, `brand-brackets`, `brand-ticket`, ver index.css).
 */
export function BrandMark({ size = 288, animated = false, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${BRAND_VIEWBOX} ${BRAND_VIEWBOX}`}
      fill="none"
      className={className}
      aria-hidden
    >
      {animated && (
        <defs>
          <linearGradient id="brand-beam-glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>
      )}

      <g className="brand-brackets">
        {BRACKETS.map((d) => (
          <path
            key={d}
            d={d}
            stroke={BRAND_COLORS.stroke}
            strokeWidth={BRACKET_STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </g>

      <g className="brand-ticket">
        <path
          d={TICKET}
          stroke={BRAND_COLORS.stroke}
          strokeWidth={TICKET_STROKE}
          strokeLinejoin="round"
        />
        {TICKET_LINES.map(([x1, y1, x2, y2]) => (
          <line
            key={`${y1}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={BRAND_COLORS.lines}
            strokeWidth={LINE_STROKE}
            strokeLinecap="round"
          />
        ))}
      </g>

      {animated && (
        // Dibujado en y=0 y desplazado por CSS de FRAME.top a FRAME.bottom.
        <g className="brand-beam">
          <rect
            x={FRAME.left - 4}
            y={-5}
            width={FRAME.right - FRAME.left + 8}
            height={10}
            fill="url(#brand-beam-glow)"
          />
          <line
            x1={FRAME.left - 4}
            x2={FRAME.right + 4}
            y1={0}
            y2={0}
            stroke="#FFFFFF"
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
}
