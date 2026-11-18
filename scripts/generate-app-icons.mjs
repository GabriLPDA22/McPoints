/**
 * Genera icono de launcher y splash nativa a partir de la geometría de marca
 * (src/core/design-system/brandGeometry.js), que comparte con la splash de
 * React para que el paso de una a otra no tenga saltos.
 *
 * Escribe directamente en android/app/src/main/res:
 *  - mipmap-*            icono adaptativo (foreground/background/monochrome),
 *                        legacy y redondo.
 *  - drawable/splash_icon.xml   icono vectorial de la splash de Android 12+.
 *  - values{,-night}/colors.xml  color de fondo de la splash (claro y oscuro iguales:
 *                        la splash es de marca, no sigue el tema).
 *  - drawable-{port,land}-<densidad>/splash.png  splash heredada que usa el plugin en `show()`.
 * Y las fuentes en assets/ para tiendas o @capacitor/assets.
 *
 * No se usa @capacitor/assets: envuelve las capas del icono en un <inset> que
 * lo encoge y no genera el vector de la splash de Android 12+.
 *
 * Uso: node scripts/generate-app-icons.mjs
 */
import sharp from 'sharp';
import { mkdir, readdir, writeFile, access, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  BRACKETS,
  BRACKET_STROKE,
  BRAND_COLORS as C,
  LINE_STROKE,
  TICKET,
  TICKET_LINES,
  TICKET_STROKE,
} from '../src/core/design-system/brandGeometry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'assets');
const resDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

/* ------------------------------------------------------------------ */
/* SVG                                                                 */
/* ------------------------------------------------------------------ */

function markMarkup({ stroke = C.stroke, lines = C.lines } = {}) {
  const brackets = BRACKETS.map(
    (d) =>
      `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${BRACKET_STROKE}" stroke-linecap="round" stroke-linejoin="round"/>`
  ).join('');
  const ticketLines = TICKET_LINES.map(
    ([x1, y1, x2, y2]) =>
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${lines}" stroke-width="${LINE_STROKE}" stroke-linecap="round"/>`
  ).join('');
  return `${brackets}<path d="${TICKET}" fill="none" stroke="${stroke}" stroke-width="${TICKET_STROKE}" stroke-linejoin="round"/>${ticketLines}`;
}

const GRADIENT_DEF = `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="${C.iconTop}"/><stop offset="1" stop-color="${C.iconBottom}"/>
</linearGradient></defs>`;

const svg = (viewBox, body, size = '') =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" ${size}>${body}</svg>`);

const SVG_FOREGROUND = svg('0 0 108 108', markMarkup());
const SVG_BACKGROUND = svg('0 0 108 108', `${GRADIENT_DEF}<rect width="108" height="108" fill="url(#bg)"/>`);
// Android 13+: el launcher tiñe esta capa con el color del tema del usuario.
const SVG_MONOCHROME = svg('0 0 108 108', markMarkup({ stroke: '#FFFFFF', lines: '#FFFFFF' }));

/** Icono completo recortado a la zona visible de 72 dp (18..90). */
function legacyIconSvg(shape) {
  const clip =
    shape === 'round'
      ? '<clipPath id="m"><circle cx="54" cy="54" r="36"/></clipPath>'
      : '<clipPath id="m"><rect x="18" y="18" width="72" height="72" rx="16"/></clipPath>';
  const clipped = shape !== 'square';
  return svg(
    '18 18 72 72',
    `${GRADIENT_DEF}<defs>${clip}</defs><g ${clipped ? 'clip-path="url(#m)"' : ''}>` +
      `<rect x="0" y="0" width="108" height="108" fill="url(#bg)"/>${markMarkup()}</g>`
  );
}

async function rasterize(svgBuffer, width, height, file) {
  await mkdir(path.dirname(file), { recursive: true });
  await sharp(svgBuffer, { density: 384 })
    .resize(width, height)
    .png({ compressionLevel: 9 })
    .toFile(file);
}

/* ------------------------------------------------------------------ */
/* Icono de launcher                                                   */
/* ------------------------------------------------------------------ */

const DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

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

    await rasterize(SVG_FOREGROUND, layer, layer, path.join(dir, 'ic_launcher_foreground.png'));
    await rasterize(SVG_BACKGROUND, layer, layer, path.join(dir, 'ic_launcher_background.png'));
    await rasterize(SVG_MONOCHROME, layer, layer, path.join(dir, 'ic_launcher_monochrome.png'));
    await rasterize(legacyIconSvg('rounded'), legacy, legacy, path.join(dir, 'ic_launcher.png'));
    await rasterize(legacyIconSvg('round'), legacy, legacy, path.join(dir, 'ic_launcher_round.png'));
  }

  const anydpi = path.join(resDir, 'mipmap-anydpi-v26');
  await mkdir(anydpi, { recursive: true });
  await writeFile(path.join(anydpi, 'ic_launcher.xml'), ADAPTIVE_XML);
  await writeFile(path.join(anydpi, 'ic_launcher_round.xml'), ADAPTIVE_XML);

  // Fuentes para tiendas / @capacitor/assets (sin máscara: la tienda la aplica).
  await rasterize(legacyIconSvg('square'), 1024, 1024, path.join(outDir, 'icon-only.png'));
  await rasterize(SVG_FOREGROUND, 1024, 1024, path.join(outDir, 'icon-foreground.png'));
  await rasterize(SVG_BACKGROUND, 1024, 1024, path.join(outDir, 'icon-background.png'));
  await rasterize(legacyIconSvg('square'), 512, 512, path.join(outDir, 'icon-play-store-512.png'));

  console.log('✓ launcher icons');
}

/* ------------------------------------------------------------------ */
/* Splash                                                              */
/* ------------------------------------------------------------------ */

/**
 * Vector de la splash de Android 12+. Sin `windowSplashScreenIconBackgroundColor`
 * distinto del fondo, el sistema dibuja este drawable a 288 dp: con la rejilla
 * de 108 el contenido (48 unidades) mide 128 dp. BrandMark.jsx usa la misma
 * proporción para que el primer fotograma de React sea idéntico.
 */
function splashIconXml() {
  const bracketPaths = BRACKETS.map(
    (d) => `    <path
        android:pathData="${d}"
        android:fillColor="#00000000"
        android:strokeColor="${C.stroke}"
        android:strokeWidth="${BRACKET_STROKE}"
        android:strokeLineCap="round"
        android:strokeLineJoin="round" />`
  ).join('\n');
  const linePaths = TICKET_LINES.map(
    ([x1, y1, x2, y2]) => `    <path
        android:pathData="M ${x1} ${y1} L ${x2} ${y2}"
        android:strokeColor="${C.lines}"
        android:strokeWidth="${LINE_STROKE}"
        android:strokeLineCap="round" />`
  ).join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<!-- Generado por scripts/generate-app-icons.mjs. No editar a mano. -->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
${bracketPaths}
    <path
        android:pathData="${TICKET}"
        android:fillColor="#00000000"
        android:strokeColor="${C.stroke}"
        android:strokeWidth="${TICKET_STROKE}"
        android:strokeLineJoin="round" />
${linePaths}
</vector>
`;
}

const COLORS_XML = `<?xml version="1.0" encoding="utf-8"?>
<!-- Generado por scripts/generate-app-icons.mjs. La splash es de marca: mismo
     rojo en claro y oscuro. -->
<resources>
    <color name="splash_background">${C.splash}</color>
</resources>
`;

/** Splash heredada a pantalla completa: mismo icono, 128 dp a la densidad del bucket. */
function legacySplashSvg(width, height, dpScale) {
  const size = 288 * dpScale; // lado del lienzo de 108 unidades, igual que Android 12+
  const x = (width - size) / 2;
  const y = (height - size) / 2;
  return svg(
    `0 0 ${width} ${height}`,
    `<rect width="${width}" height="${height}" fill="${C.splash}"/>` +
      `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 108 108">${markMarkup()}</svg>`,
    `width="${width}" height="${height}"`
  );
}

const BUCKET_SCALE = { ldpi: 0.75, mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

async function renderSplash() {
  await writeFile(path.join(resDir, 'drawable', 'splash_icon.xml'), splashIconXml());
  for (const dir of ['values', 'values-night']) {
    await mkdir(path.join(resDir, dir), { recursive: true });
    await writeFile(path.join(resDir, dir, 'colors.xml'), COLORS_XML);
  }

  // Se regeneran los PNG que ya existen, con su mismo tamaño.
  const dirs = (await readdir(resDir)).filter((d) => d.startsWith('drawable'));
  for (const dir of dirs) {
    const file = path.join(resDir, dir, 'splash.png');
    try {
      await access(file);
    } catch {
      continue;
    }
    const { width, height } = await sharp(file).metadata();
    const bucket = dir.match(/(ldpi|mdpi|hdpi|xhdpi|xxhdpi|xxxhdpi)$/)?.[1] ?? 'mdpi';
    // Algunos buckets "-night" sin densidad son pequeños: el icono se limita al 60 % del lado corto.
    const scale = Math.min(BUCKET_SCALE[bucket], (Math.min(width, height) * 0.6) / 288);
    await sharp(legacySplashSvg(width, height, scale)).png({ compressionLevel: 9 }).toFile(file + '.tmp');
    await rename(file + '.tmp', file);
  }

  for (const name of ['splash.png', 'splash-dark.png', 'splash-light.png']) {
    await sharp(legacySplashSvg(2732, 2732, 4)).png({ compressionLevel: 9 }).toFile(path.join(outDir, name));
  }

  console.log('✓ splash (vector Android 12+, colors.xml, PNG heredados)');
}

async function main() {
  await mkdir(outDir, { recursive: true });
  await renderLauncherIcons();
  await renderSplash();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
