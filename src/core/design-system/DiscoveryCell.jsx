import { getSourceMeta } from '@/core/taxonomy/registry.js';
import { primarySourceOf } from '@/core/storage/projector.js';
import { isComplete } from '@/core/storage/insights.js';
import { COLLECTIBLE_SOURCES } from '@/core/taxonomy/constants.js';
import { useTranslation } from '@/core/i18n/useTranslation.js';
import { Award } from 'lucide-react';

/** Alto fijo: la lista virtualizada calcula las filas a partir de él. */
export const DISCOVERY_CELL_HEIGHT = 96;

function numberSizeClass(length) {
  if (length <= 3) return 'text-[28px]';
  if (length === 4) return 'text-[24px]';
  return 'text-[19px]';
}

/**
 * Celda de la vista lista: número grande, icono del origen principal y cinco
 * puntos con los orígenes conseguidos. Dorada cuando tiene los cinco.
 */
export function DiscoveryCell({ entry, onClick }) {
  const { t } = useTranslation();
  const meta = getSourceMeta(primarySourceOf(entry), t);
  const Icon = meta.icon;
  const sourceCount = Object.keys(entry.sourcesSeen).length;
  const complete = isComplete(entry);

  const label =
    sourceCount > 1
      ? t('discoveryCell.ariaMulti', entry.key, meta.label, sourceCount)
      : t('discoveryCell.ariaSingle', entry.key, meta.label);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{ height: DISCOVERY_CELL_HEIGHT }}
      className={`flex w-full flex-col justify-between rounded-[12px] px-3 pb-3 pt-3.5 text-left transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        complete ? 'bg-gold text-[#1b1406]' : 'bg-surface text-ink shadow-[0_1px_0_rgb(var(--border))]'
      }`}
    >
      <span className="flex items-start justify-between gap-1">
        <span className={`font-mono font-semibold leading-none tracking-[-0.03em] tabular-nums ${numberSizeClass(entry.key.length)}`}>
          {entry.key}
        </span>
        {complete && <Award className="h-4 w-4 flex-shrink-0" strokeWidth={2.2} aria-hidden />}
      </span>
      <span className="flex items-center justify-between">
        <Icon className={`h-4 w-4 ${complete ? '' : 'text-muted'}`} strokeWidth={2} aria-hidden />
        <span className="flex gap-[3px]" aria-hidden>
          {COLLECTIBLE_SOURCES.map((source) => (
            <i
              key={source}
              className={`block h-1.5 w-1.5 rounded-full border ${
                entry.sourcesSeen[source]
                  ? complete
                    ? 'border-[#1b1406] bg-[#1b1406]'
                    : 'border-ink bg-ink'
                  : complete
                    ? 'border-[#1b1406]/40'
                    : 'border-border'
              }`}
            />
          ))}
        </span>
      </span>
    </button>
  );
}
