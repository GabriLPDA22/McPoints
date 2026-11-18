/**
 * Geometría y colores de la marca (ticket dentro de esquinas de escáner).
 *
 * Fuente única para:
 *  - el icono de launcher y la splash nativa (scripts/generate-app-icons.mjs),
 *  - la splash animada de React (BrandMark.jsx).
 * Si las tres no comparten coordenadas exactas, el paso de la splash nativa a
 * la de React se ve como un salto.
 *
 * Todo está en la rejilla de 108 unidades del icono adaptativo de Android.
 * El contenido ocupa 30..78 para caber en el círculo de 66 dp que garantiza el
 * launcher y en el de 192 dp de la splash de Android 12+.
 *
 * Módulo JS puro (sin JSX ni alias `@/`): lo importa también Node.
 */

export const BRAND_VIEWBOX = 108;

export const BRAND_COLORS = Object.freeze({
  /** Degradado del icono de launcher. */
  iconTop: '#D42A22',
  iconBottom: '#A3121A',
  /** Fondo plano de la splash: Android 12+ no admite degradados ahí. */
  splash: '#BC1E1E',
  stroke: '#FFFFFF',
  lines: '#F4D6BF',
});

export const BRACKET_STROKE = 4.2;
export const TICKET_STROKE = 4;
export const LINE_STROKE = 3;

/** Esquinas de escáner, en orden: sup-izq, sup-der, inf-der, inf-izq. */
export const BRACKETS = (() => {
  const a = 30;
  const b = 78;
  const arm = 10;
  const r = 5;
  return [
    `M ${a} ${a + arm} L ${a} ${a + r} Q ${a} ${a} ${a + r} ${a} L ${a + arm} ${a}`,
    `M ${b - arm} ${a} L ${b - r} ${a} Q ${b} ${a} ${b} ${a + r} L ${b} ${a + arm}`,
    `M ${b} ${b - arm} L ${b} ${b - r} Q ${b} ${b} ${b - r} ${b} L ${b - arm} ${b}`,
    `M ${a + arm} ${b} L ${a + r} ${b} Q ${a} ${b} ${a} ${b - r} L ${a} ${b - arm}`,
  ];
})();

/** Límites verticales del encuadre, para el barrido de la línea de escaneo. */
export const FRAME = Object.freeze({ top: 30, bottom: 78, left: 30, right: 78 });

/** Ticket con esquinas superiores redondeadas y borde inferior troquelado. */
export const TICKET =
  'M 41 66 L 41 40 Q 41 36 45 36 L 63 36 Q 67 36 67 40 L 67 66 ' +
  'L 62.7 70.5 L 58.3 66 L 54 70.5 L 49.7 66 L 45.3 70.5 Z';

/** Líneas de texto del ticket: [x1, y1, x2, y2]. */
export const TICKET_LINES = Object.freeze([
  [47, 44, 61, 44],
  [47, 50, 61, 50],
  [47, 56, 58, 56],
]);
