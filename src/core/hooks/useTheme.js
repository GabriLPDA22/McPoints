import { useEffect } from 'react';
import { useAppStore } from '@/core/store/useAppStore.js';

export function useTheme() {
  const preferences = useAppStore((s) => s.preferences);
  const setPreferences = useAppStore((s) => s.setPreferences);

  useEffect(() => {
    const root = document.documentElement;
    const theme = preferences.theme || 'system';

    // La identidad clara vive en :root (tema principal); .dark es la
    // traducción fiel para quien prefiere oscuro, no una app distinta.
    const apply = (dark) => {
      root.classList.toggle('dark', dark);
    };

    if (theme === 'dark') {
      apply(true);
    } else if (theme === 'light') {
      apply(false);
    } else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches);
      const handler = (e) => apply(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [preferences.theme]);

  const setTheme = (theme) => setPreferences({ theme });

  return { theme: preferences.theme || 'system', setTheme };
}
