import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/core/store/useAppStore.js';
import { EmptyState, Masthead, Paper, PaperHeader, Rule, KeyValue } from '@/core/design-system';
import { getSourceMeta } from '@/core/taxonomy/registry.js';
import { collectionKeyFor } from '@/core/storage/projector.js';
import { classifySightings, localDayKey, SIGHTING_KIND } from '@/core/storage/insights.js';
import { ORDER_SOURCE } from '@/core/taxonomy/constants.js';
import { useTranslation } from '@/core/i18n/useTranslation.js';

const FILTER_IDS = ['all', 'classified', 'unclassified'];

export function HistoryScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const sightings = useAppStore((s) => s.sightings);
  const projection = useAppStore((s) => s.getProjection());
  const [filter, setFilter] = useState(() =>
    FILTER_IDS.includes(location.state?.filter) ? location.state.filter : 'all'
  );

  const filterLabels = {
    all: t('history.filterAll'),
    classified: t('history.filterClassified'),
    unclassified: t('history.filterUnclassified'),
  };

  const kinds = useMemo(
    () => classifySightings(sightings, projection.keyStrategy),
    [sightings, projection.keyStrategy]
  );

  const grouped = useMemo(() => {
    const groups = {};
    for (const sighting of sightings) {
      const known = sighting.source.value !== ORDER_SOURCE.UNKNOWN;
      if (filter === 'classified' && !known) continue;
      if (filter === 'unclassified' && known) continue;
      (groups[localDayKey(sighting.capturedAt)] ??= []).push(sighting);
    }
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([day, items]) => [day, [...items].sort((a, b) => b.capturedAt.localeCompare(a.capturedAt))]);
  }, [sightings, filter]);

  const weekNew = useMemo(() => {
    const since = Date.now() - 7 * 86400000;
    return sightings.filter(
      (s) => kinds.get(s.id) === SIGHTING_KIND.NEW && new Date(s.capturedAt).getTime() >= since
    ).length;
  }, [sightings, kinds]);

  function dayLabel(day) {
    const today = localDayKey(new Date());
    const yesterday = localDayKey(Date.now() - 86400000);
    const date = new Date(`${day}T12:00:00`);
    const weekday = date.toLocaleDateString(t('locale'), { weekday: 'short', day: 'numeric', month: 'short' });
    if (day === today) return `${t('history.today')} · ${weekday}`;
    if (day === yesterday) return `${t('history.yesterday')} · ${weekday}`;
    return weekday;
  }

  const time = (iso) =>
    new Date(iso).toLocaleTimeString(t('locale'), { hour: '2-digit', minute: '2-digit' });

  if (sightings.length === 0) {
    return (
      <div className="screen-padding screen-fill flex flex-col">
        <Masthead title={t('history.title')} />
        <div className="flex flex-1 items-center justify-center">
          <EmptyState title={t('history.emptyTitle')} description={t('history.emptyDescription')} />
        </div>
      </div>
    );
  }

  return (
    <div className="screen-padding pb-6">
      <Masthead title={t('history.title')} />

      <div className="mb-4 flex gap-5 px-1" role="tablist">
        {FILTER_IDS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={filter === id}
            onClick={() => setFilter(id)}
            className={`pb-1 text-receipt focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              filter === id ? 'border-b-[2.5px] border-accent text-ink' : 'text-muted'
            }`}
          >
            {filterLabels[id]}
          </button>
        ))}
      </div>

      <Paper torn className="px-5 pb-4 pt-5">
        <PaperHeader title={t('history.receiptTitle')} aside={t('history.scanCount', sightings.length)} />
        <Rule variant="double" className="my-3" />

        {grouped.length === 0 && <p className="py-6 text-center text-sm text-muted">{t('history.noneForFilter')}</p>}

        {grouped.map(([day, items], gi) => (
          <div key={day}>
            {gi > 0 && <Rule className="my-3" />}
            <div className="mb-1.5 flex justify-between text-receipt-sm font-semibold text-muted">
              <span>{dayLabel(day)}</span>
              <span>{t('history.scanCount', items.length)}</span>
            </div>
            <ul>
              {items.map((sighting) => {
                const meta = getSourceMeta(sighting.source.value, t);
                const unknown = sighting.source.value === ORDER_SOURCE.UNKNOWN;
                const kind = kinds.get(sighting.id);
                return (
                  <li key={sighting.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/number/${collectionKeyFor(sighting, projection.keyStrategy)}`)}
                      className="grid w-full grid-cols-[50px_60px_1fr_auto] items-center py-1.5 text-left font-mono text-[14px] text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                    >
                      <span className="text-muted tabular-nums">{time(sighting.capturedAt)}</span>
                      <b className="text-[18px] font-semibold tabular-nums">{sighting.rawNumber}</b>
                      <span className="truncate text-[12px] uppercase tracking-[0.08em]">
                        {unknown ? '—' : meta.shortLabel}
                      </span>
                      {kind === SIGHTING_KIND.NEW && (
                        <em className="rounded-[3px] bg-accent px-1.5 py-0.5 text-[11px] font-semibold not-italic uppercase tracking-[0.06em] text-on-accent">
                          ★ {t('history.newBadge')}
                        </em>
                      )}
                      {kind === SIGHTING_KIND.NEW_SOURCE && (
                        <em className="rounded-[3px] border-[1.5px] border-gold-ink px-1.5 py-[1px] text-[11px] font-semibold not-italic uppercase tracking-[0.06em] text-gold-ink">
                          + {t('history.newSourceBadge')}
                        </em>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <Rule className="my-3" />
        <KeyValue label={t('history.weekTotal')} value={t('history.weekNew', weekNew)} />
      </Paper>
    </div>
  );
}
