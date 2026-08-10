import { CircleHelp } from 'lucide-react';
import { BottomSheet } from '@/core/design-system';
import { listCollectibleSources } from '@/core/taxonomy/registry.js';
import { ORDER_SOURCE } from '@/core/taxonomy/constants.js';
import { useTranslation } from '@/core/i18n/useTranslation.js';

/**
 * Clasificación manual del origen.
 *
 * Lo que se elija aquí se guarda como USER_SELECTED, nunca como AUTO_DETECTED:
 * una etiqueta puesta a mano no es una predicción del motor y no puede contarse
 * como acierto suyo. Ver Docs/design/number-model.md §3.2.
 */
export function SourcePickerSheet({ open, onClose, onSelect }) {
  const { t } = useTranslation();
  const options = [
    ...listCollectibleSources(t),
    { value: ORDER_SOURCE.UNKNOWN, icon: CircleHelp, label: t('taxonomy.dontKnow') },
  ];

  return (
    <BottomSheet open={open} onClose={onClose} title={t('sourcePicker.title')}>
      <ul className="space-y-2">
        {options.map(({ value, icon: Icon, label }) => (
          <li key={value}>
            <button
              type="button"
              onClick={() => onSelect(value)}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-lg bg-surface text-ink hover:bg-accent/10 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Icon className="w-5 h-5 text-muted flex-shrink-0" aria-hidden />
              <span className="text-sm">{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
}
