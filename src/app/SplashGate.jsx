import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAppStore } from '@/core/store/useAppStore.js';
import { BrandMark } from '@/core/design-system/BrandMark.jsx';
import { BRAND_COLORS } from '@/core/design-system/brandGeometry.js';
import { enterSplashBars, exitSplashBars } from '@/core/platform/systemBars.js';

/**
 * Splash animada que releva a la nativa sin que se note el cambio.
 *
 * 1. La splash nativa (Android 12+) sigue visible hasta que este componente
 *    pinta su primer fotograma, que es idéntico: mismo rojo, mismo icono, mismo
 *    tamaño (288 dp de lienzo) y misma posición (WebView bajo la barra de
 *    estado). Entonces se oculta la nativa con un fundido de 200 ms.
 * 2. Animación (≈0,9 s): una línea de escaneo recorre el encuadre y las
 *    esquinas "enfocan" sobre el ticket, la metáfora de la app.
 * 3. Salida, cuando además el store está hidratado: el icono se desvanece,
 *    la barra de estado vuelve a su sitio con el color del tema y el rojo se
 *    funde hacia la app, que ya está renderizada debajo.
 *
 * La app se monta en cuanto hay datos, no al acabar la animación, para que la
 * salida revele contenido real y no una pantalla vacía.
 */

const PHASE = { INTRO: 'intro', MARK_OUT: 'mark-out', FADE_OUT: 'fade-out', DONE: 'done' };

const MIN_VISIBLE_MS = 900;
const MIN_VISIBLE_REDUCED_MS = 300;
const MARK_OUT_MS = 180;
const FADE_OUT_MS = 280;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

async function hideNativeSplash() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide();
  } catch (e) {
    console.warn('SplashScreen.hide failed', e);
  }
}

export function SplashGate({ children }) {
  const hydrated = useAppStore((s) => s.hydrated);
  const hydrate = useAppStore((s) => s.hydrate);

  const [phase, setPhase] = useState(PHASE.INTRO);
  const [minElapsed, setMinElapsed] = useState(false);
  const reducedMotion = useRef(prefersReducedMotion()).current;

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Relevo de la splash nativa: primero la WebView a pantalla completa, luego
  // esperar a que el navegador pinte el primer fotograma y solo entonces
  // ocultar la nativa.
  useEffect(() => {
    let cancelled = false;
    let raf1;
    let raf2;

    (async () => {
      await enterSplashBars();
      if (cancelled) return;
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          if (!cancelled) hideNativeSplash();
        });
      });
    })();

    const timer = window.setTimeout(
      () => setMinElapsed(true),
      reducedMotion ? MIN_VISIBLE_REDUCED_MS : MIN_VISIBLE_MS
    );

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.clearTimeout(timer);
    };
  }, [reducedMotion]);

  // Salida en dos tiempos: el icono desaparece con el rojo aún opaco, y solo
  // entonces se recoloca la WebView (el cambio de layout queda oculto bajo un
  // rojo liso) y se funde el fondo.
  // Cada transición en su propio efecto: si el efecto que cambia de fase
  // también programara la siguiente, su limpieza (que corre al cambiar
  // `phase`) cancelaría el temporizador y la splash se quedaría en rojo.
  useEffect(() => {
    if (phase === PHASE.INTRO && hydrated && minElapsed) setPhase(PHASE.MARK_OUT);
  }, [phase, hydrated, minElapsed]);

  useEffect(() => {
    if (phase !== PHASE.MARK_OUT) return undefined;

    let cancelled = false;
    const t = window.setTimeout(async () => {
      await exitSplashBars();
      if (!cancelled) setPhase(PHASE.FADE_OUT);
    }, MARK_OUT_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== PHASE.FADE_OUT) return undefined;
    const t = window.setTimeout(() => setPhase(PHASE.DONE), FADE_OUT_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  return (
    <>
      {hydrated && children}

      {phase !== PHASE.DONE && (
        <div
          className="splash-gate fixed inset-0 z-[100] flex items-center justify-center"
          data-phase={phase}
          data-reduced-motion={reducedMotion || undefined}
          style={{
            backgroundColor: BRAND_COLORS.splash,
            transitionDuration: `${FADE_OUT_MS}ms`,
          }}
          role="presentation"
        >
          <BrandMark
            size={288}
            animated={!reducedMotion}
            className="splash-mark"
          />
        </div>
      )}
    </>
  );
}
