import { useAppStore } from '@/core/store/useAppStore.js';
import { translations } from './translations/index.js';

function resolve(dict, key) {
  return key.split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), dict);
}

/**
 * i18n mínimo y sin dependencias: cada pantalla pide sus textos con
 * `t('namespace.clave')`. Las cadenas con datos variables (contadores,
 * fechas, plurales) son funciones en el diccionario, p. ej.
 * `t('detail.discoveredTimes', 3)`.
 *
 * Español es el idioma por defecto y también el fallback: si una clave
 * faltara en otro idioma, no se rompe la UI, se ve en español.
 */
export function useTranslation() {
  const language = useAppStore((s) => s.preferences.language) || 'es';
  const setPreferences = useAppStore((s) => s.setPreferences);

  const dict = translations[language] ?? translations.es;

  function t(key, ...args) {
    let value = resolve(dict, key);
    if (value === undefined) value = resolve(translations.es, key);
    if (typeof value === 'function') return value(...args);
    return value ?? key;
  }

  return { t, language, setLanguage: (lang) => setPreferences({ language: lang }) };
}
