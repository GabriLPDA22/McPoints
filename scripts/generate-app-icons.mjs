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

/** Splash: icono pequeño centrado + wordmark "McPoints" debajo. */
async function renderSplash({ canvasSize, bg, iconColor, textColor, file }) {
  const iconSize = Math.round(canvasSize * 0.16);
  const iconTop = Math.round(canvasSize * 0.42);
  const iconLeft = Math.round((canvasSize - iconSize) / 2);
  const fontSize = Math.round(canvasSize * 0.052);
  const textY = iconTop + iconSize + Math.round(canvasSize * 0.075);

  const background = await sharp({
    create: { width: canvasSize, height: canvasSize, channels: 4, background: bg },
  })
    .png()
    .toBuffer();

  const iconBuffer = await sharp(
    Buffer.from(ticketSvg({ size: iconSize, color: iconColor, strokeWidth: 6.5 }))
  )
    .png()
    .toBuffer();

  const textSvg = Buffer.from(`
    <svg width="${canvasSize}" height="${canvasSize}" xmlns="http://www.w3.org/2000/svg">
      <text x="50%" y="${textY}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
        font-weight="700" font-size="${fontSize}" fill="${textColor}">McPoints</text>
    </svg>
  `);

  await sharp(background)
    .composite([
      { input: iconBuffer, left: iconLeft, top: iconTop },
      { input: textSvg, left: 0, top: 0 },
    ])
    .png()
    .toFile(path.join(outDir, file));

  console.log(`✓ ${file}`);
}

async function main() {
  await mkdir(outDir, { recursive: true });

  await renderIcon({
    canvasSize: 1024,
    iconSize: 560,
    color: PALETTE.primaryLight,
    bg: PALETTE.surface,
    file: 'icon-only.png',
  });

  await renderIcon({
    canvasSize: 1024,
    iconSize: 470,
    color: PALETTE.primaryLight,
    bg: PALETTE.surface,
    file: 'icon-foreground.png',
  });

  await renderSolid({
    canvasSize: 1024,
    bg: PALETTE.surface,
    file: 'icon-background.png',
  });

  await renderSplash({
    canvasSize: 2732,
    bg: PALETTE.bgLight,
    iconColor: PALETTE.primaryLight,
    textColor: PALETTE.ink,
    file: 'splash.png',
  });

  await renderSplash({
    canvasSize: 2732,
    bg: PALETTE.bgDark,
    iconColor: PALETTE.primaryDark,
    textColor: PALETTE.textDark,
    file: 'splash-dark.png',
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
