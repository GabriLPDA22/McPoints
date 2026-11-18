/**
 * Genera icono y splash de la app.
 *
 * - Icono de launcher: ticket con líneas dentro de las esquinas de escáner,
 *   sobre fondo rojo. Se dibuja en vector sobre la rejilla de 108 dp del icono
 *   adaptativo de Android y se rasteriza a todas las densidades, escribiendo
 *   directamente en android/app/src/main/res/mipmap-*. No se usa
 *   @capacitor/assets para el icono: regenera también la splash (ajustada a
 *   mano) y envuelve las capas en un <inset> que encoge el icono.
 * - Splash: ticket de TicketMark.jsx, se procesa aparte con @capacitor/assets.
 *
 * Uso: node scripts/generate-app-icons.mjs
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'assets');
const resDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

const TICKET_PATH =
  'M 34 22 L 20 22 L 20 68 L 27.5 77 L 35 68 L 42.5 77 L 50 68 L 57.5 77 L 65 68 L 72.5 77 L 80 68 L 80 22 L 66 22';

const PALETTE = {
  bgLight: '#FAFAF8',
  surface: '#FFFFFF',
  ink: '#1C1917',
  primaryLight: '#E54335',
  bgDark: '#141313',
  primaryDark: '#FF5A46',
  textDark: '#F5F1E9',
};

function ticketSvg({ size, color, strokeWidth = 7, background = 'none' }) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      ${background !== 'none' ? `<rect width="100" height="100" fill="${background}" />` : ''}
      <path d="${TICKET_PATH}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;
}

/** Icono centrado sobre un lienzo cuadrado de fondo sólido. */
async function renderIcon({ canvasSize, iconSize, color, bg, file }) {
  const background = await sharp({
    create: { width: canvasSize, height: canvasSize, channels: 4, background: bg },
  })
    .png()
    .toBuffer();

  const icon = Buffer.from(ticketSvg({ size: iconSize, color, strokeWidth: 6.5 }));
  const iconBuffer = await sharp(icon).png().toBuffer();

  const offset = Math.round((canvasSize - iconSize) / 2);

  await sharp(background)
    .composite([{ input: iconBuffer, left: offset, top: offset }])
    .png()
    .toFile(path.join(outDir, file));

  console.log(`✓ ${file}`);
}

async function renderSolid({ canvasSize, bg, file }) {
  await sharp({
    create: { width: canvasSize, height: canvasSize, channels: 4, background: bg },
  })
    .png()
    .toFile(path.join(outDir, file));

  console.log(`✓ ${file}`);
}

/**
 * Splash: icono centrado, sin wordmark. El texto se eliminó a propósito:
 * la pantalla de splash nativa (Theme.SplashScreen de Android 12+) solo debe
 * mostrar el icono para que coincida exactamente con el splash animado de
 * React (`SplashHandler` en src/App.jsx), que tampoco muestra texto. Si el
 * splash nativo y el splash JS tienen composiciones distintas (icono+texto
 * vs. solo icono, en posiciones distintas) se percibe como una transición
 * brusca o un "doble splash" al arrancar la app.
 */
async function renderSplash({ canvasSize, bg, iconColor, file }) {
  await renderIcon({
    canvasSize,
    iconSize: Math.round(canvasSize * 0.16),
    color: iconColor,
    bg,
    file,
  });
}


/* ------------------------------------------------------------------ */
/* Icono de launcher                                                   */
/* ------------------------------------------------------------------ */

const ICON = {
  bgTop: '#D42A22',
  bgBottom: '#A3121A',
  stroke: '#FFFFFF',
  lines: '#F4D6BF',
};

/**
 * Geometría en la rejilla de 108 dp del icono adaptativo. El launcher solo
 * muestra el círculo/squircle central de 72 dp (18..90) y garantiza el de
 * 66 dp: las esquinas de escáner (30..78) y su redondeo quedan dentro incluso
 * con máscara circular.
 */
const BRACKETS = (() => {
  const a = 30; // borde
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

// Ticket con esquinas superiores redondeadas y borde inferior troquelado.
const TICKET =
  'M 41 66 L 41 40 Q 41 36 45 36 L 63 36 Q 67 36 67 40 L 67 66 ' +
  'L 62.7 70.5 L 58.3 66 L 54 70.5 L 49.7 66 L 45.3 70.5 Z';

const TICKET_LINES = [
  [47, 44, 61, 44],
  [47, 50, 61, 50],
  [47, 56, 58, 56],
];

function foregroundMarkup({ stroke = ICON.stroke, lines = ICON.lines, ticketFill = 'none' } = {}) {
  const brackets = BRACKETS.map(
    (d) =>
      `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>`
  ).join('');
  const ticketLines = TICKET_LINES.map(
    ([x1, y1, x2, y2]) =>
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${lines}" stroke-width="3" stroke-linecap="round"/>`
  ).join('');
  return `${brackets}<path d="${TICKET}" fill="${ticketFill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>${ticketLines}`;
}

const GRADIENT_DEF = `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="${ICON.bgTop}"/><stop offset="1" stop-color="${ICON.bgBottom}"/>
</linearGradient></defs>`;

const svg = (viewBox, body) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>`);

const SVG_FOREGROUND = svg('0 0 108 108', foregroundMarkup());
const SVG_BACKGROUND = svg('0 0 108 108', `${GRADIENT_DEF}<rect width="108" height="108" fill="url(#bg)"/>`);
// Android 13+: el launcher tiñe esta capa con el color del tema del usuario.
const SVG_MONOCHROME = svg('0 0 108 108', foregroundMarkup({ stroke: '#FFFFFF', lines: '#FFFFFF' }));

/** Icono completo recortado a la zona visible de 72 dp (18..90). */
function legacySvg(shape) {
  const clip =
    shape === 'round'
      ? '<clipPath id="m"><circle cx="54" cy="54" r="36"/></clipPath>'
      : '<clipPath id="m"><rect x="18" y="18" width="72" height="72" rx="16"/></clipPath>';
  const full = shape === 'square';
  return svg(
    '18 18 72 72',
    `${GRADIENT_DEF}<defs>${clip}</defs><g ${full ? '' : 'clip-path="url(#m)"'}>` +
      `<rect x="0" y="0" width="108" height="108" fill="url(#bg)"/>${foregroundMarkup()}</g>`
  );
}

const DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

async function rasterize(svgBuffer, size, file) {
  await mkdir(path.dirname(file), { recursive: true });
  await sharp(svgBuffer, { density: 72 * Math.ceil(size / 72) * 4 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(file);
}

const ADAPTIVE_XML = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
    <monochrome android:drawable="@mipmap/ic_launcher_monochrome" />
</adaptive-icon>
`;

async function renderLauncherIcons() {
  for (const [density, scale] of Object.entries(DENSITIES)) {
    const dir = path.join(resDir, `mipmap-${density}`);
    const layer = Math.round(108 * scale);
    const legacy = Math.round(48 * scale);

    await rasterize(SVG_FOREGROUND, layer, path.join(dir, 'ic_launcher_foreground.png'));
    await rasterize(SVG_BACKGROUND, layer, path.join(dir, 'ic_launcher_background.png'));
    await rasterize(SVG_MONOCHROME, layer, path.join(dir, 'ic_launcher_monochrome.png'));
    await rasterize(legacySvg('rounded'), legacy, path.join(dir, 'ic_launcher.png'));
    await rasterize(legacySvg('round'), legacy, path.join(dir, 'ic_launcher_round.png'));
  }

  const anydpi = path.join(resDir, 'mipmap-anydpi-v26');
  await mkdir(anydpi, { recursive: true });
  await writeFile(path.join(anydpi, 'ic_launcher.xml'), ADAPTIVE_XML);
  await writeFile(path.join(anydpi, 'ic_launcher_round.xml'), ADAPTIVE_XML);

  // Fuentes para tiendas / @capacitor/assets (sin máscara: la tienda la aplica).
  await rasterize(legacySvg('square'), 1024, path.join(outDir, 'icon-only.png'));
  await rasterize(SVG_FOREGROUND, 1024, path.join(outDir, 'icon-foreground.png'));
  await rasterize(SVG_BACKGROUND, 1024, path.join(outDir, 'icon-background.png'));
  await rasterize(legacySvg('square'), 512, path.join(outDir, 'icon-play-store-512.png'));

  console.log('✓ launcher icons (mipmap-*, anydpi-v26, assets/icon-*)');
}

async function main() {
  await mkdir(outDir, { recursive: true });

  await renderLauncherIcons();

  await renderSplash({
    canvasSize: 2732,
    bg: PALETTE.bgDark,
    iconColor: PALETTE.primaryDark,
    file: 'splash.png',
  });

  await renderSplash({
    canvasSize: 2732,
    bg: PALETTE.bgLight,
    iconColor: PALETTE.primaryLight,
    file: 'splash-light.png',
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
