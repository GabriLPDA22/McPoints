import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { AppRouter } from './app/AppRouter.jsx';
import { useAppStore } from './core/store/useAppStore.js';
import { useTheme } from './core/hooks/useTheme.js';
import { TicketMark } from './core/design-system/TicketMark.jsx';
import './index.css';

const STEP = { ICON: 'icon', SCAN: 'scan', PULSE: 'pulse', DONE: 'done' };

/**
 * Guion del splash: 1) aparece el símbolo (Opción A), 2) una línea de escaneo
 * lo recorre, 3) destello de confirmación ("detectado"), 4) todo se desvanece
 * hacia Home. Breve y con personalidad, no un logo estático.
 *
 * Deliberadamente NO se muestra ningún número: sería un dato inventado en
 * cada arranque, y McPoints nunca muestra información que no proviene de un
 * ticket real.
 *
 * Con prefers-reduced-motion se recorta a una aparición simple, sin barrido ni
 * destello, y se mantiene la misma duración mínima total.
 */
function useSplashSequence() {
  const [step, setStep] = useState(STEP.ICON);

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      const t = window.setTimeout(() => setStep(STEP.DONE), 420);
      return () => window.clearTimeout(t);
    }

    const timers = [
      window.setTimeout(() => setStep(STEP.SCAN), 300),
      window.setTimeout(() => setStep(STEP.PULSE), 750),
      window.setTimeout(() => setStep(STEP.DONE), 1080),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  return step;
}

function SplashHandler({ children }) {
  const hydrated = useAppStore((s) => s.hydrated);
  const hydrate = useAppStore((s) => s.hydrate);
  const step = useSplashSequence();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const ready = hydrated && step === STEP.DONE;

  useEffect(() => {
    if (!ready) return;
    if (Capacitor.isNativePlatform()) {
      import('@capacitor/splash-screen').then(({ SplashScreen }) => {
        SplashScreen.hide();
      });
    }
  }, [ready]);

  if (!ready) {
    const pulsing = step === STEP.PULSE;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg">
        <div className="relative flex items-center justify-center">
          <span
            className={`absolute w-24 h-24 rounded-full bg-accent/15 transition-all duration-300 ease-out ${
              pulsing ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
            }`}
            aria-hidden
          />
          <TicketMark
            className={`relative w-14 h-14 text-accent animate-pop transition-transform duration-300 ease-out ${
              pulsing ? 'scale-110' : 'scale-100'
            }`}
            strokeWidth={7}
          />
          {step === STEP.SCAN && (
            <div className="absolute h-14 w-14 overflow-hidden" aria-hidden>
              <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-accent animate-splash-sweep" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return <div className="animate-fade-in">{children}</div>;
}

export default function App() {
  useTheme();

  return (
    <SplashHandler>
      <AppRouter />
    </SplashHandler>
  );
}
