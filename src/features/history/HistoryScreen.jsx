import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useAppStore } from '@/core/store/useAppStore.js';
import { EmptyState, Chip, TicketMark } from '@/core/design-system';
import { getSourceMeta } from '@/core/taxonomy/registry.js';
import { collectionKeyFor } from '@/core/storage/projector.js';
import { ORDER_SOURCE } from '@/core/taxonomy/constants.js';
import { useTranslation } from '@/core/i18n/useTranslation.js';

export function HistoryScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const sightings = useAppStore((s) => s.sightings);
  const entries = useAppStore((s) => s.entries);
  const projection = useAppStore((s) => s.getProjection());
  const [filter, setFilter] = useState('all');

  const FILTERS = [
    { id: 'all', label: t('history.filterAll') },
    { id: 'classified', label: t('history.filterClassified') },
    { id: 'unclassified', label: t('history.filterUnclassified') },
  ];

  function groupLabel(day) {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (day === today) return t('history.today');
    if (day === yesterday) return t('history.yesterday');
    return new Date(`${day}T12:00:00`).toLocaleDateString(t('locale'), {
      day: 'numeric',
      month: 'long',
    });
  }

  const firstSightingIds = useMemo(() => {
    const ids = new Set();
    for (const entry of Object.values(entries)) {
      if (entry.sightingIds[0]) ids.add(entry.sightingIds[0]);
    }
    return ids;
  }, [entries]);

  const grouped = useMemo(() => {
    const filtered = sightings.filter((sighting) => {
      const known = sighting.source.value !== ORDER_SOURCE.UNKNOWN;
      if (filter === 'classified') return known;
      if (filter === 'unclassified') return !known;
      return true;
    });

    const groups = {};
    for (const sighting of filtered) {
      const day = sighting.capturedAt.slice(0, 10);
      (groups[day] ??= []).push(sighting);
    }

    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([day, items]) => [
        day,
        [...items].sort((a, b) => b.capturedAt.localeCompare(a.capturedAt)),
      ]);
  }, [sightings, filter]);

  if (sightings.length === 0) {
    return (
      <div className="screen-padding screen-fill flex flex-col">
        <header className="flex items-center gap-2 pt-1 mb-6 flex-shrink-0">
          <TicketMark className="w-6 h-6 text-accent" strokeWidth={7} />
          <h1 className="text-heading-lg text-ink">{t('history.title')}</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={Clock}
            iconClassName="w-[5.5rem] h-[5.5rem] text-ink/70"
            iconStrokeWidth={1.75}
            iconProps={{ absoluteStrokeWidth: true }}
            title={t('history.emptyTitle')}
            description={t('history.emptyDescription')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="screen-padding pb-6">
      <header className="flex items-center gap-2 pt-1 mb-5">
        <TicketMark className="w-6 h-6 text-accent" strokeWidth={7} />
        <h1 className="text-heading-lg text-ink">{t('history.title')}</h1>
      </header>

      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTERS.map(({ id, label }) => (
          <Chip key={id} active={filter === id} onClick={() => setFilter(id)}>
            {label}
          </Chip>
        ))}
      </div>

      <div className="space-y-5">
        {grouped.map(([day, items]) => (
          <div key={day}>
            <p className="text-label text-muted mb-1">{groupLabel(day)}</p>

            <ul className="divide-y divide-border">
              {items.map((sighting) => {
                const meta = getSourceMeta(sighting.source.value, t);
                const Icon = meta.icon;
                const isNew = firstSightingIds.has(sighting.id);

                return (
                  <li key={sighting.id}>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/number/${collectionKeyFor(sighting, projection.keyStrategy)}`)
                      }
                      className="w-full flex items-center gap-3 py-3 text-left hover:bg-accent/5 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                    >
                      <span className="text-number-sm text-ink flex-shrink-0 w-16">
                        {sighting.rawNumber}
                      </span>
                      <Icon className="w-4 h-4 text-muted flex-shrink-0" strokeWidth={1.75} aria-hidden />
                      <span className="flex-1 min-w-0 text-sm text-ink truncate">{meta.label}</span>
                      {isNew && (
                        <span className="text-xs font-semibold text-accent flex-shrink-0">
                          {t('history.newBadge')}
                        </span>
                      )}
                      <span className="text-xs text-muted tabular-nums flex-shrink-0">
                        {new Date(sighting.capturedAt).toLocaleTimeString(t('locale'), {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
