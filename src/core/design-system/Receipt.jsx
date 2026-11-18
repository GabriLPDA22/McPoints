import { useId } from 'react';

/**
 * Primitivas del lenguaje «Recibo» (dirección de diseño 2.1).
 *
 * Todo lo que parece impreso (papel, líneas discontinuas, puntos guía, código
 * de barras, sellos de goma) sale de aquí para que las pantallas no reinventen
 * cada detalle. Las clases base viven en index.css (`.paper`, `.rule-dashed`,
 * `.leader`, `.text-receipt`).
 */

/** Hoja de ticket. `torn` añade el borde inferior troquelado. */
export function Paper({ as: Tag = 'section', torn = false, className = '', children, ...props }) {
  return (
    <Tag className={`paper ${torn ? 'paper-torn' : ''} ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export function Rule({ variant = 'dashed', className = '' }) {
  return <div className={`${variant === 'double' ? 'rule-double' : 'rule-dashed'} ${className}`} aria-hidden />;
}

/** Cabecera de bloque de ticket: «TÍTULO ............ DATO». */
export function PaperHeader({ title, aside }) {
  return (
    <div className="flex items-center justify-between gap-3 text-receipt text-ink">
      <span>{title}</span>
      {aside != null && <span className="tabular-nums">{aside}</span>}
    </div>
  );
}

/** Fila clave/valor con puntos guía. */
export function KeyValue({ label, value, tone = 'ink', onClick }) {
  const toneClass = tone === 'accent' ? 'text-accent' : 'text-ink';
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      {...(onClick ? { type: 'button', onClick } : {})}
      className={`flex w-full items-baseline gap-1.5 py-[3px] font-mono text-[13.5px] uppercase text-left ${toneClass} ${
        onClick ? 'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm' : ''
      }`}
    >
      <span className="font-medium">{label}</span>
      <span className="leader" aria-hidden />
      <span className="font-semibold tabular-nums">{value}</span>
    </Tag>
  );
}

/** Etiqueta de sección fuera del papel. */
export function SectionLabel({ children, aside, className = '' }) {
  return (
    <div className={`flex items-center justify-between px-1 mb-2.5 text-receipt text-muted ${className}`}>
      <h2>{children}</h2>
      {aside != null && <span className="text-accent tabular-nums">{aside}</span>}
    </div>
  );
}

/**
 * Código de barras decorativo y determinista: el mismo `value` produce siempre
 * las mismas barras, así cada ticket tiene "su" código.
 */
export function Barcode({ value = '', width = 240, height = 30, caption, className = '' }) {
  let seed = 7;
  for (const ch of String(value)) seed = (seed * 31 + ch.charCodeAt(0)) % 233280;

  const bars = [];
  let x = 0;
  let s = seed || 1;
  while (x < width) {
    s = (s * 9301 + 49297) % 233280;
    const w = 1 + (s % 3);
    if (s % 2) bars.push(<rect key={x} x={x} y={0} width={w} height={height} />);
    x += w + 1;
  }

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`} aria-hidden>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="currentColor" className="text-ink max-w-full">
        {bars}
      </svg>
      {caption && <span className="text-receipt-sm text-ink tabular-nums">{caption}</span>}
    </div>
  );
}

/**
 * Sello de goma circular: texto en el anillo y valor en el centro.
 * Se rota ligeramente para que parezca estampado a mano.
 */
export function RubberStamp({ value, ring, size = 104, rotate = -12, className = '' }) {
  const id = `stamp-ring-${useId().replace(/:/g, '')}`;
  const c = size / 2;
  const r = c - 4;
  const textR = r - 9;
  // SVG no aplica text-transform de forma fiable: las mayúsculas se fuerzan aquí.
  const ringLabel = String(ring).toLocaleUpperCase();
  const ringText = `${ringLabel} · ${ringLabel} · ${ringLabel} ·`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`text-accent flex-shrink-0 ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden
    >
      <defs>
        <path
          id={id}
          d={`M ${c} ${c} m -${textR} 0 a ${textR} ${textR} 0 1 1 ${2 * textR} 0 a ${textR} ${textR} 0 1 1 -${2 * textR} 0`}
        />
      </defs>
      <circle cx={c} cy={c} r={r} fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx={c} cy={c} r={r - 18} fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text
        className="font-mono"
        fontWeight="600"
        fontSize={size * 0.095}
        letterSpacing="2"
        fill="currentColor"
      >
        <textPath href={`#${id}`} textLength={2 * Math.PI * textR - 6} lengthAdjust="spacing">
          {ringText}
        </textPath>
      </text>
      <text
        x="50%"
        y="52%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-mono"
        fontWeight="600"
        fontSize={size * (String(value).length > 4 ? 0.13 : 0.17)}
        fill="currentColor"
      >
        {String(value).toLocaleUpperCase()}
      </text>
    </svg>
  );
}

/** Sello rectangular inclinado: «NUEVO», «+ ORIGEN»… */
export function StampTag({ children, tone = 'accent', rotate = -10, size = 'md', className = '' }) {
  const toneClass = tone === 'gold' ? 'text-gold-ink border-gold-ink' : 'text-accent border-accent';
  const sizeClass = size === 'sm' ? 'text-[11px] px-1.5 py-0.5 border-[1.5px]' : 'text-[15px] px-2.5 py-1 border-[2.5px]';
  return (
    <span
      className={`inline-block font-mono font-semibold uppercase tracking-[0.14em] rounded-[5px] ${toneClass} ${sizeClass} ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}

/** Etiqueta impresa en negativo (tinta sobre papel). */
export function InkTag({ icon: Icon, children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[4px] bg-ink px-2 py-1 font-mono text-[12px] font-semibold uppercase tracking-[0.08em] text-surface ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2} aria-hidden />}
      {children}
    </span>
  );
}

/** Barra de matriz de puntos: `value` de `max` celdas encendidas. */
export function DotMatrixBar({ value, max, cells = 14, highlight = false }) {
  const on = value > 0 ? Math.max(1, Math.round((value / Math.max(max, 1)) * cells)) : 0;
  return (
    <span className="flex flex-1 gap-[3px]" aria-hidden>
      {Array.from({ length: cells }, (_, i) => (
        <i
          key={i}
          className={`block h-3.5 flex-1 rounded-[2px] ${
            i < on ? (highlight ? 'bg-accent' : 'bg-ink') : 'bg-border/60'
          }`}
        />
      ))}
    </span>
  );
}
