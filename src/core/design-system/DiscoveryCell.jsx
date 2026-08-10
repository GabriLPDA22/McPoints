import { getSourceMeta } from '@/core/taxonomy/registry.js';
import { primarySourceOf } from '@/core/storage/projector.js';
import { useTranslation } from '@/core/i18n/useTranslation.js';

/**
 * Discovery Card: la celda de la galería de descubrimientos.
 *
 * El número es siempre el elemento más grande de la card. El icono de
 * origen y el contador de variantes son secundarios y viven abajo. Nada de
 * texto adicional: la cuadrícula tiene que poder leerse de un vistazo.
 */
function numberSizeClass(length) {
  if (length <= 2) return 'text-[32px]';
  if (length <= 4) return 'text-[28px]';
  if (length === 5) return 'text-[23px]';
  return 'text-[19px]';
}

export function DiscoveryCell({ entry, onClick }) {
  const { t } = useTranslation();
  const primarySource = primarySourceOf(entry);
  const meta = getSourceMeta(primarySource, t);
  const Icon = meta.icon;

  const sourceCount = Object.keys(entry.sourcesSeen).length;
  const hasVariants = sourceCount > 1;

  const label = hasVariants
    ? t('discoveryCell.ariaMulti', entry.key, meta.label, sourceCount)
    : t('discoveryCell.ariaSingle', entry.key, meta.label);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="ticket-notch relative flex w-full flex-col justify-between gap-3 rounded-md border border-border bg-surface p-4 text-left transition-colors duration-150 hover:border-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      style={{ aspectRatio: '4 / 3' }}
    >
      <span
        className={`font-mono font-medium tabular-nums text-ink leading-none ${numberSizeClass(
          entry.key.length
        )}`}
      >
        {entry.key}
      </span>
      <span className="flex items-center gap-1.5 text-muted">
        <Icon className="w-7 h-7 flex-shrink-0" strokeWidth={2} aria-hidden />
        {hasVariants && (
          <span className="text-xs font-medium tabular-nums leading-none" aria-hidden>
            ·{sourceCount}
          </span>
        )}
      </span>
    </button>
  );
}
