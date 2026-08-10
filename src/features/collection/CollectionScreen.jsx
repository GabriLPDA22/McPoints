import { useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useAppStore } from '@/core/store/useAppStore.js';
import { DiscoveryCell, EmptyState, Button, TicketMark, TicketIllustration } from '@/core/design-system';
import {
  CollectionFilterSheet,
  DEFAULT_FILTERS,
  UNCLASSIFIED,
  hasActiveFilters,
  matchesDigits,
  compareEntries,
} from './CollectionFilterSheet.jsx';
import { useTranslation } from '@/core/i18n/useTranslation.js';

const COLS = 2;
const ROW_HEIGHT = 192;

export function CollectionScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const entries = useAppStore((s) => s.entries);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState('');
  const parentRef = useRef(null);

  const filtered = useMemo(() => {
    const list = Object.values(entries).filter((entry) => {
      if (search && !entry.key.includes(search)) return false;
      if (!matchesDigits(entry.key, filters.digits)) return false;
      if (filters.source === 'all') return true;
      if (filters.source === UNCLASSIFIED) return Object.keys(entry.sourcesSeen).length === 0;
      return !!entry.sourcesSeen[filters.source];
    });

    return list.sort((a, b) => compareEntries(a, b, filters.sort));
  }, [entries, filters, search]);

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(filtered.length / COLS),
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 4,
  });

  const hasAnything = Object.keys(entries).length > 0;
  const filtersActive = hasActiveFilters(filters);

  if (!hasAnything) {
    return (
      <div className="screen-padding screen-fill flex flex-col">
        <header className="flex items-center gap-2 pt-1 mb-6 flex-shrink-0">
          <TicketMark className="w-6 h-6 text-accent" strokeWidth={7} />
          <h1 className="text-heading-lg text-ink">{t('collection.title')}</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={TicketIllustration}
            title={t('collection.emptyTitle')}
            description={t('collection.emptyDescription')}
            action={
              <Button size="lg" className="w-full" onClick={() => navigate('/scan')}>
                {t('collection.scanCta')}
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-80px-env(safe-area-inset-bottom))]">
      <div className="screen-padding pb-3 space-y-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-heading-lg text-ink">
            {t('collection.title')}{' '}
            <span className="text-muted font-normal tabular-nums">
              · {Object.keys(entries).length}
            </span>
          </h1>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder={t('collection.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value.replace(/\D/g, ''))}
            className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-border bg-surface text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent tabular-nums text-sm"
          />
        </div>

        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent"
        >
          <SlidersHorizontal className="w-4 h-4" strokeWidth={1.75} />
          {t('collection.filterSort')}
          {filtersActive && <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden />}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-5">
          <EmptyState
            title={t('collection.noResultsTitle')}
            description={t('collection.noResultsDescription')}
          />
        </div>
      ) : (
        <div ref={parentRef} className="flex-1 overflow-y-auto px-5 pb-4">
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const start = virtualRow.index * COLS;
              const rowItems = filtered.slice(start, start + COLS);

              return (
                <div
                  key={virtualRow.key}
                  className="absolute left-0 right-0 grid grid-cols-2 gap-3"
                  style={{
                    top: 0,
                    transform: `translateY(${virtualRow.start}px)`,
                    height: `${virtualRow.size}px`,
                  }}
                >
                  {rowItems.map((entry) => (
                    <DiscoveryCell
                      key={entry.key}
                      entry={entry}
                      onClick={() => navigate(`/number/${entry.key}`)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <CollectionFilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
      />
    </div>
  );
}
