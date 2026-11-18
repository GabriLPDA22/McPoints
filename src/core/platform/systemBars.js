import { Capacitor } from '@capacitor/core';

/**
 * Barra de estado de Android.
 *
 * Mientras dura la splash, la WebView se extiende por debajo de la barra de
 * estado (overlay) para que la splash de React ocupe exactamente la misma
 * superficie que la nativa: el icono queda en la misma posición y el relevo no
 * se nota. Al salir se vuelve al modo normal con el color del tema.
 *
 * Mientras la splash está activa, los cambios de tema se guardan y se aplican
 * al terminar; si no, el tema pintaría la barra encima del rojo de la splash.
 */

const THEME_BAR = Object.freeze({
  light: { color: '#FAFAF8', style: 'LIGHT' }, // iconos oscuros
  dark: { color: '#141313', style: 'DARK' }, // iconos claros
});

let splashActive = true;
let pendingDark = null;
let pluginPromise = null;

function loadPlugin() {
  if (!Capacitor.isNativePlatform()) return Promise.resolve(null);
  pluginPromise ??= import('@capacitor/status-bar').catch((e) => {
    console.warn('StatusBar plugin not available', e);
    return null;
  });
  return pluginPromise;
}

async function apply(dark) {
  const mod = await loadPlugin();
  if (!mod) return;
  const { StatusBar, Style } = mod;
  const bar = dark ? THEME_BAR.dark : THEME_BAR.light;
  try {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setBackgroundColor({ color: bar.color });
    await StatusBar.setStyle({ style: Style[bar.style === 'DARK' ? 'Dark' : 'Light'] });
  } catch (e) {
    console.warn('StatusBar theme failed', e);
  }
}

/** Splash a pantalla completa: WebView bajo la barra y iconos claros sobre el rojo. */
export async function enterSplashBars() {
  splashActive = true;
  const mod = await loadPlugin();
  if (!mod) return;
  const { StatusBar, Style } = mod;
  try {
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setStyle({ style: Style.Dark });
  } catch (e) {
    console.warn('StatusBar splash failed', e);
  }
}

/** Fin de la splash: vuelve al layout normal con el último tema pedido. */
export async function exitSplashBars() {
  splashActive = false;
  const dark =
    pendingDark ?? document.documentElement.classList.contains('dark');
  pendingDark = null;
  await apply(dark);
}

/** Llamado por useTheme en cada cambio de tema. */
export function applyThemeBars(dark) {
  if (splashActive) {
    pendingDark = dark;
    return;
  }
  apply(dark);
}
