import { Check } from 'lucide-react';
import { listCollectibleSources } from '@/core/taxonomy/registry.js';
import { useTranslation } from '@/core/i18n/useTranslation.js';

/**
 * Los orígenes por los que se puede conseguir un número, con los ya obtenidos
 * marcados. Es la mecánica de variantes: un mismo número conseguido por kiosco y
 * por McAuto no son dos números, es un número con dos orígenes.
 *
 * El estado se comunica con un círculo lleno + check además del contraste,
 * nunca solo con color.
 */
export function SourceChecklist({ sourcesSeen = {}, compact = false }) {
  const { t } = useTranslation();

  return (
    <ul className="divide-y divide-border">
      {listCollectibleSources(t).map(({ value, icon: Icon, label }) => {
        const seen = sourcesSeen[value];

        return (
          <li
            key={value}
            aria-label={
              seen ? t('sourceChecklist.gotTimesAria', label, seen.count) : `${label}: ${t('sourceChecklist.pendingAria')}`
            }
            className={`flex items-center gap-3 ${compact ? 'py-2' : 'py-3'} ${
              seen ? 'text-ink' : 'text-muted'
            }`}
          >
            <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="flex-1 text-sm">{label}</span>
            {seen && !compact && (
              <span className="text-xs text-muted tabular-nums" aria-hidden>
                {seen.count}
              </span>
            )}
            <span
              className={`flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 ${
                seen ? 'bg-accent text-on-accent' : 'border border-border'
              }`}
              aria-hidden
            >
              {seen && <Check className="w-3 h-3" strokeWidth={3} />}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
