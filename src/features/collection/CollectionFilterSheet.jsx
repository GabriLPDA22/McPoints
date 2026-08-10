import { useEffect, useState } from 'react';
import { Chip, Button, BottomSheet } from '@/core/design-system';
import { listCollectibleSources } from '@/core/taxonomy/registry.js';
import { useTranslation } from '@/core/i18n/useTranslation.js';

export const UNCLASSIFIED = 'UNCLASSIFIED';

export const DEFAULT_FILTERS = {
  source: 'all',
  digits: 'all',
  sort: 'asc',
};

const DIGIT_VALUES = ['all', '1-2', '3', '4', '5+'];
const SORT_VALUES = ['recent', 'oldest', 'asc', 'mostFound'];

const SORT_LABEL_KEYS = {
  recent: 'filters.sortRecent',
  oldest: 'filters.sortOldest',
  asc: 'filters.sortAsc',
  mostFound: 'filters.sortMostFound',
};

export function hasActiveFilters(filters) {
  return (
    filters.source !== DEFAULT_FILTERS.source ||
    filters.digits !== DEFAULT_FILTERS.digits ||
    filters.sort !== DEFAULT_FILTERS.sort
  );
}

export function matchesDigits(key, digits) {
  if (digits === 'all') return true;
  if (digits === '1-2') return key.length <= 2;
  if (digits === '5+') return key.length >= 5;
  return key.length === Number(digits);
}

export function compareEntries(a, b, sort) {
  if (sort === 'recent') return new Date(b.lastSeenAt) - new Date(a.lastSeenAt);
  if (sort === 'oldest') return new Date(a.firstSeenAt) - new Date(b.firstSeenAt);
  if (sort === 'mostFound') return b.sightingCount - a.sightingCount;
  return a.key.localeCompare(b.key, undefined, { numeric: true });
}

/**
 * Bottom sheet de "Filtrar y ordenar". Nada de fila permanente de chips en
 * la pantalla: los filtros viven aquí, agrupados, con Aplicar/Limpiar.
 */
export function CollectionFilterSheet({ open, onClose, filters, onApply }) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const handleClear = () => {
    onApply(DEFAULT_FILTERS);
    onClose();
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={t('filters.title')} showCancel={false}>
      <div className="space-y-5">
        <div>
          <h3 className="text-label text-muted mb-2.5">{t('filters.origin')}</h3>
          <div className="flex flex-wrap gap-2">
            <Chip active={draft.source === 'all'} onClick={() => setDraft((d) => ({ ...d, source: 'all' }))}>
              {t('filters.all')}
            </Chip>
            {listCollectibleSources(t).map(({ value, shortLabel }) => (
              <Chip
                key={value}
                active={draft.source === value}
                onClick={() => setDraft((d) => ({ ...d, source: value }))}
              >
                {shortLabel}
              </Chip>
            ))}
            <Chip
              active={draft.source === UNCLASSIFIED}
              onClick={() => setDraft((d) => ({ ...d, source: UNCLASSIFIED }))}
            >
              {t('filters.unknown')}
            </Chip>
          </div>
        </div>

        <div>
          <h3 className="text-label text-muted mb-2.5">{t('filters.digits')}</h3>
          <div className="flex flex-wrap gap-2">
            {DIGIT_VALUES.map((value) => (
              <Chip
                key={value}
                active={draft.digits === value}
                onClick={() => setDraft((d) => ({ ...d, digits: value }))}
              >
                {value === 'all' ? t('filters.all') : value}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-label text-muted mb-2.5">{t('filters.order')}</h3>
          <div className="flex flex-wrap gap-2">
            {SORT_VALUES.map((value) => (
              <Chip
                key={value}
                active={draft.sort === value}
                onClick={() => setDraft((d) => ({ ...d, sort: value }))}
              >
                {t(SORT_LABEL_KEYS[value])}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="ghost" className="flex-1" onClick={handleClear}>
            {t('filters.clear')}
          </Button>
          <Button className="flex-1" onClick={handleApply}>
            {t('filters.apply')}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
