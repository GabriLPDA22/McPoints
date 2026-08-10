/**
 * Genera los assets fuente de icono/splash para @capacitor/assets a partir del
 * mismo path SVG que TicketMark.jsx (Opción A: ticket + esquinas de escáner).
 * Uso: node scripts/generate-app-icons.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'assets');

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

async function main() {
  await mkdir(outDir, { recursive: true });

  await renderIcon({
    canvasSize: 1024,
    iconSize: 560,
    color: PALETTE.primaryLight,
    bg: PALETTE.bgDark,
    file: 'icon-only.png',
  });

  // Foreground del adaptive icon: ticket sobre transparente (el fondo va aparte).
  await renderIcon({
    canvasSize: 1024,
    iconSize: 470,
    color: PALETTE.primaryLight,
    bg: { r: 0, g: 0, b: 0, alpha: 0 },
    file: 'icon-foreground.png',
  });

  await renderSolid({
    canvasSize: 1024,
    bg: PALETTE.bgDark,
    file: 'icon-background.png',
  });

  await renderSplash({
    canvasSize: 2732,
    bg: PALETTE.bgLight,
    iconColor: PALETTE.primaryLight,
    file: 'splash.png',
  });

  await renderSplash({
    canvasSize: 2732,
    bg: PALETTE.bgDark,
    iconColor: PALETTE.primaryDark,
    file: 'splash-dark.png',
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
