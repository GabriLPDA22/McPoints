import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { Search, X, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/core/store/useAppStore.js';
import { DiscoveryCell, DISCOVERY_CELL_HEIGHT } from '@/core/design-system/DiscoveryCell.jsx';
import { EmptyState, Masthead, MastheadButton, Paper, Rule, Barcode } from '@/core/design-system';
import { buildAlbum, isComplete, ALBUM_BLOCK_SIZE } from '@/core/storage/insights.js';
import {
  CollectionFilterSheet,
  DEFAULT_FILTERS,
  UNCLASSIFIED,
  hasActiveFilters,
  matchesDigits,
  compareEntries,
} from './CollectionFilterSheet.jsx';
import { useTranslation } from '@/core/i18n/useTranslation.js';

const COLS = 3;
const GAP = 8;
const ROW_HEIGHT = DISCOVERY_CELL_HEIGHT + GAP;
const FRESH_MS = 24 * 60 * 60 * 1000;

const VIEW = { ALBUM: 'album', LIST: 'list' };

export function CollectionScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const entries = useAppStore((s) => s.entries);
  const sightings = useAppStore((s) => s.sightings);
  const [view, setView] = useState(VIEW.ALBUM);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);

  const total = Object.keys(entries).length;
  const searching = search.length > 0;

  if (total === 0) {
    return (
      <div className="screen-padding screen-fill flex flex-col">
        <Masthead title={t('collection.title')} />
        <div className="flex flex-1 items-center justify-center">
          <EmptyState title={t('collection.emptyTitle')} description={t('collection.emptyDescription')} />
        </div>
      </div>
    );
  }

  const lastKey = sightings[sightings.length - 1]?.rawNumber;

  return (
    <div className="screen-padding pb-6">
      <Masthead
        title={t('collection.title')}
        action={
          <MastheadButton
            icon={searchOpen ? X : Search}
            label={searchOpen ? t('common.close') : t('collection.searchAria')}
            active={searchOpen}
            onClick={() => {
              setSearchOpen((v) => !v);
              setSearch('');
            }}
          />
        }
      />

      {searchOpen && (
        <input
          autoFocus
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder={t('collection.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value.replace(/\D/g, ''))}
          className="mb-4 h-12 w-full rounded-full border-[1.5px] border-ink bg-surface px-5 font-mono text-base text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent tabular-nums"
        />
      )}

      {!searching && (
        <div className="mb-4 flex items-center gap-5 px-1" role="tablist">
          {[
            [VIEW.ALBUM, t('collection.viewAlbum')],
            [VIEW.LIST, t('collection.viewList')],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={view === id}
              onClick={() => setView(id)}
              className={`pb-1 text-receipt focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                view === id ? 'border-b-[2.5px] border-accent text-ink' : 'text-muted'
              }`}
            >
              {label}
            </button>
          ))}
          <span className="flex-1" />
          {view === VIEW.LIST ? (
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="inline-flex items-center gap-1.5 text-receipt-sm font-semibold text-ink"
            >
              <SlidersHorizontal className="h-4 w-4" strokeWidth={2} aria-hidden />
              {t('collection.filterShort')}
              {hasActiveFilters(filters) && <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />}
            </button>
          ) : (
            <span className="text-receipt-sm text-muted tabular-nums">{t('collection.uniqueCount', total)}</span>
          )}
        </div>
      )}

      {view === VIEW.ALBUM && !searching ? (
        <AlbumView entries={entries} lastKey={lastKey} onOpen={(key) => navigate(`/number/${key}`)} />
      ) : (
        <ListView
          entries={entries}
          search={search}
          filters={searching ? DEFAULT_FILTERS : filters}
          onOpen={(key) => navigate(`/number/${key}`)}
        />
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

/* ------------------------------------------------------------------ */
/* Álbum                                                               */
/* ------------------------------------------------------------------ */

function blockLabel(block) {
  return `${block.start}–${block.end}`;
}

function AlbumView({ entries, lastKey, onOpen }) {
  const { t } = useTranslation();
  const album = useMemo(() => buildAlbum(entries), [entries]);
  const stripRef = useRef(null);

  // Se abre por el bloque del último número escaneado: es el que el usuario
  // acaba de tocar y quiere ver dónde ha caído.
  const initialIndex = useMemo(() => {
    if (!lastKey || !/^\d+$/.test(lastKey)) return 0;
    const start = Math.floor(Number(lastKey) / ALBUM_BLOCK_SIZE) * ALBUM_BLOCK_SIZE;
    return Math.max(0, album.findIndex((b) => b.start === start));
    // Solo al montar: luego manda la selección del usuario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [index, setIndex] = useState(initialIndex);
  const safeIndex = Math.min(index, Math.max(album.length - 1, 0));
  const block = album[safeIndex];

  useEffect(() => {
    stripRef.current
      ?.querySelector(`[data-block="${safeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [safeIndex]);

  if (!block) {
    return <p className="px-1 text-sm text-muted">{t('collection.albumNoNumeric')}</p>;
  }

  const now = Date.now();
  const percent = Math.round((block.count / ALBUM_BLOCK_SIZE) * 100);
  const cells = Array.from({ length: ALBUM_BLOCK_SIZE }, (_, i) => block.start + i);

  return (
    <div>
      {album.length > 1 && (
        <div ref={stripRef} className="-mx-5 mb-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
          {album.map((b, i) => (
            <button
              key={b.start}
              type="button"
              data-block={i}
              onClick={() => setIndex(i)}
              aria-pressed={i === safeIndex}
              className={`flex-shrink-0 rounded-[8px] border px-3 py-1.5 font-mono text-[12px] font-semibold tabular-nums transition-colors ${
                i === safeIndex ? 'border-transparent bg-ink text-surface' : 'border-border text-muted'
              }`}
            >
              {blockLabel(b)} <span className="opacity-60">·{b.count}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between rounded-[10px] bg-surface px-3.5 py-3">
        <button
          type="button"
          onClick={() => setIndex(safeIndex - 1)}
          disabled={safeIndex === 0}
          aria-label={t('collection.prevBlock')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-bg text-ink disabled:opacity-30"
        >
          <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>
        <div className="text-center">
          <p className="font-mono text-[20px] font-semibold tracking-[0.04em] text-ink tabular-nums">
            {block.start} — {block.end}
          </p>
          <p className="mt-0.5 text-receipt-sm text-muted tabular-nums">
            {t('collection.blockProgress', block.count, ALBUM_BLOCK_SIZE, percent)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIndex(safeIndex + 1)}
          disabled={safeIndex === album.length - 1}
          aria-label={t('collection.nextBlock')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-bg text-ink disabled:opacity-30"
        >
          <ChevronRight className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>
      </div>

      <div className="mx-0.5 mb-3.5 mt-2.5 h-1 rounded-full bg-border" aria-hidden>
        <div className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {cells.map((n) => {
          const slot = block.slots.get(n);
          if (!slot) {
            return (
              <span
                key={n}
                className="flex h-[46px] items-center justify-center rounded-[8px] border-[1.5px] border-dashed border-border font-mono text-[15px] font-semibold text-border tabular-nums"
                aria-hidden
              >
                {n}
              </span>
            );
          }

          const entry = slot[0];
          const fresh = slot.some((e) => now - new Date(e.firstSeenAt).getTime() < FRESH_MS);
          const complete = slot.some(isComplete);
          const tone = fresh
            ? 'bg-accent text-on-accent'
            : complete
              ? 'bg-gold text-[#1b1406]'
              : 'bg-surface text-ink shadow-[0_1px_0_rgb(var(--border))]';

          return (
            <button
              key={n}
              type="button"
              onClick={() => onOpen(entry.key)}
              aria-label={t('collection.albumCellAria', entry.key)}
              className={`relative flex h-[46px] items-center justify-center rounded-[8px] font-mono text-[15px] font-semibold tabular-nums focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${tone}`}
            >
              {entry.key}
              {slot.length > 1 && (
                <span className="absolute right-1 top-0.5 text-[9px] font-semibold opacity-70">×{slot.length}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3.5 flex flex-wrap justify-between gap-2 px-0.5 text-receipt-sm text-muted">
        <Legend className="bg-surface shadow-[0_0_0_1px_rgb(var(--border))]" label={t('collection.legendHave')} />
        <Legend className="border-[1.5px] border-dashed border-border" label={t('collection.legendMissing')} />
        <Legend className="bg-gold" label={t('collection.legendComplete')} />
        <Legend className="bg-accent" label={t('collection.legendNew')} />
      </div>

      <Paper torn className="mt-6 px-5 py-4">
        <p className="text-receipt-sm leading-relaxed text-muted normal-case tracking-normal font-sans text-[13px]">
          {t('collection.albumNote')}
        </p>
        <Rule className="my-3" />
        <Barcode value={`album-${block.start}`} height={22} caption={`${blockLabel(block)} · ${block.count}/${ALBUM_BLOCK_SIZE}`} />
      </Paper>
    </div>
  );
}

function Legend({ className, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <i className={`block h-3 w-3 rounded-[3px] ${className}`} aria-hidden />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Lista                                                               */
/* ------------------------------------------------------------------ */

function ListView({ entries, search, filters, onOpen }) {
  const { t } = useTranslation();
  const listRef = useRef(null);
  const [scrollMargin, setScrollMargin] = useState(0);

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

  useLayoutEffect(() => {
    setScrollMargin(listRef.current?.getBoundingClientRect().top + window.scrollY || 0);
  }, [search]);

  const rowVirtualizer = useWindowVirtualizer({
    count: Math.ceil(filtered.length / COLS),
    estimateSize: () => ROW_HEIGHT,
    overscan: 4,
    scrollMargin,
  });

  if (filtered.length === 0) {
    return (
      <div className="py-16">
        <EmptyState title={t('collection.noResultsTitle')} description={t('collection.noResultsDescription')} />
      </div>
    );
  }

  return (
    <div ref={listRef} style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
      {rowVirtualizer.getVirtualItems().map((row) => {
        const start = row.index * COLS;
        return (
          <div
            key={row.key}
            className="absolute inset-x-0 top-0 grid grid-cols-3"
            style={{
              gap: GAP,
              height: DISCOVERY_CELL_HEIGHT,
              transform: `translateY(${row.start - rowVirtualizer.options.scrollMargin}px)`,
            }}
          >
            {filtered.slice(start, start + COLS).map((entry) => (
              <DiscoveryCell key={entry.key} entry={entry} onClick={() => onOpen(entry.key)} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
