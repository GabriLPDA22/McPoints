import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownRight, CircleHelp } from 'lucide-react';
import { useAppStore } from '@/core/store/useAppStore.js';
import {
  Paper,
  PaperHeader,
  Rule,
  KeyValue,
  SectionLabel,
  Barcode,
  RubberStamp,
  StampTag,
  InkTag,
  DotMatrixBar,
  Masthead,
} from '@/core/design-system';
import { getSourceMeta, listCollectibleSources } from '@/core/taxonomy/registry.js';
import { collectionKeyFor } from '@/core/storage/projector.js';
import { classifySightings, countComplete, countNewSince, SIGHTING_KIND } from '@/core/storage/insights.js';
import { useTranslation } from '@/core/i18n/useTranslation.js';

const pad = (n, width = 2) => String(n).padStart(width, '0');

export function HomeScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const entries = useAppStore((s) => s.entries);
  const sightings = useAppStore((s) => s.sightings);
  const getSourceStats = useAppStore((s) => s.getSourceStats);
  const projection = useAppStore((s) => s.getProjection());

  const uniqueCount = Object.keys(entries).length;
  const lastSighting = sightings[sightings.length - 1];
  const { totals, unclassified } = getSourceStats();

  const today = new Date().toLocaleDateString(t('locale'), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const stats = useMemo(
    () => ({
      newThisWeek: countNewSince(entries, 7),
      complete: countComplete(entries),
      lastKind: lastSighting
        ? classifySightings(sightings, projection.keyStrategy).get(lastSighting.id)
        : null,
    }),
    [entries, sightings, lastSighting, projection.keyStrategy]
  );

  const sourceRows = useMemo(
    () =>
      listCollectibleSources(t).map(({ value, ...meta }) => ({ value, meta, count: totals[value] ?? 0 })),
    [totals, t]
  );
  const maxSource = Math.max(0, ...sourceRows.map((r) => r.count));
  const hasClassified = maxSource > 0;
  // Solo se resalta un origen (el primero con más números), no todos los empatados.
  const leaderSource = sourceRows.find((r) => r.count === maxSource)?.value;

  function relativeTime(iso) {
    const diffMinutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (diffMinutes < 1) return t('time.justNow');
    if (diffMinutes < 60) return t('time.minutesAgo', diffMinutes);
    const hours = Math.round(diffMinutes / 60);
    if (hours < 24) return t('time.today');
    const days = Math.round(hours / 24);
    return days === 1 ? t('time.yesterday') : t('time.daysAgo', days);
  }

  if (uniqueCount === 0) {
    return (
      <div className="screen-padding screen-fill relative flex flex-col">
        <Masthead brand aside={today} />
        <Paper torn className="px-5 pt-5 pb-5">
          <PaperHeader title={t('home.summaryTitle')} aside="Nº 0000" />
          <Rule className="my-3" />
          <div className="flex items-center justify-between py-2">
            <span className="font-mono text-[88px] font-semibold leading-none tracking-[-0.05em] text-border">
              000
            </span>
            <RubberStamp value={t('home.emptyStampValue')} ring={t('home.emptyStampRing')} rotate={10} size={108} />
          </div>
          <Rule className="my-3" />
          <p className="text-body-md text-muted leading-relaxed">{t('home.emptyText')}</p>
          <Rule className="my-3" />
          <Barcode value="0000" caption={t('home.emptyBarcode')} />
        </Paper>

        <button
          type="button"
          className="mt-5 self-center font-mono text-sm font-semibold uppercase tracking-[0.08em] text-ink underline underline-offset-4"
          onClick={() => navigate('/scan', { state: { openManual: true } })}
        >
          {t('home.manualEntry')}
        </button>

        <p className="mt-auto flex items-center justify-end gap-1.5 pt-6 text-receipt-sm font-semibold text-accent" aria-hidden>
          {t('home.scanHint')}
          <ArrowDownRight className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </p>
      </div>
    );
  }

  const lastMeta = lastSighting ? getSourceMeta(lastSighting.source.value, t) : null;

  return (
    <div className="screen-padding pb-6">
      <Masthead brand aside={today} />

      <Paper torn className="px-5 pt-5 pb-5">
        <PaperHeader title={t('home.summaryTitle')} aside={`Nº ${pad(uniqueCount, 4)}`} />
        <Rule className="my-3" />
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono font-semibold tabular-nums leading-[0.9] tracking-[-0.05em] text-ink text-[clamp(64px,24vw,96px)]">
              {uniqueCount}
            </p>
            <p className="mt-2 text-receipt-sm text-ink">
              {uniqueCount === 1 ? t('home.uniqueSingular') : t('home.uniquePlural')}
            </p>
          </div>
          {stats.newThisWeek > 0 && (
            <RubberStamp value={`+${stats.newThisWeek}`} ring={t('home.weekStampRing')} rotate={-14} />
          )}
        </div>
        <Rule className="my-3" />
        <KeyValue label={t('home.scans')} value={pad(sightings.length)} />
        <KeyValue label={t('home.completeOrigins')} value={pad(stats.complete)} />
        {unclassified > 0 && (
          <KeyValue
            label={t('home.unclassified')}
            value={pad(unclassified)}
            tone="accent"
            onClick={() => navigate('/history', { state: { filter: 'unclassified' } })}
          />
        )}
        <Rule className="my-3" />
        <Barcode
          value={`${uniqueCount}-${sightings.length}`}
          caption={`${pad(uniqueCount, 4)}·${pad(sightings.length, 4)}·${pad(stats.complete, 4)}`}
        />
      </Paper>

      {lastSighting && (
        <section className="mt-6">
          <SectionLabel>{t('home.last')}</SectionLabel>
          <button
            type="button"
            onClick={() => navigate(`/number/${collectionKeyFor(lastSighting, projection.keyStrategy)}`)}
            className="relative flex w-full items-center gap-4 rounded-[14px] border-2 border-ink px-4 py-3.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="font-mono text-[46px] font-semibold leading-none tracking-[-0.04em] text-ink tabular-nums">
              {lastSighting.rawNumber}
            </span>
            <span className="flex min-w-0 flex-col items-start gap-1.5">
              <InkTag icon={lastMeta.icon}>{lastMeta.shortLabel}</InkTag>
              <span className="text-receipt-sm text-muted">{relativeTime(lastSighting.capturedAt)}</span>
            </span>
            {stats.lastKind !== SIGHTING_KIND.REPEAT && (
              <StampTag
                tone={stats.lastKind === SIGHTING_KIND.NEW ? 'accent' : 'gold'}
                className="absolute -top-3.5 right-3 bg-bg"
              >
                {stats.lastKind === SIGHTING_KIND.NEW ? t('home.newStamp') : t('home.newSourceStamp')}
              </StampTag>
            )}
          </button>
        </section>
      )}

      <section className="mt-6">
        <SectionLabel>{t('home.byOrigin')}</SectionLabel>
        {hasClassified ? (
          <ul className="flex flex-col gap-2.5 px-1">
            {sourceRows.map(({ value, meta, count }) => {
              const Icon = meta.icon;
              return (
                <li key={value} className="flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.06em] text-ink">
                  <span className="flex w-[104px] flex-shrink-0 items-center gap-1.5 font-semibold">
                    <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={2} aria-hidden />
                    <span className="truncate">{meta.shortLabel}</span>
                  </span>
                  <DotMatrixBar value={count} max={maxSource} highlight={value === leaderSource} />
                  <b className="w-6 text-right text-[14px] font-semibold tabular-nums">{pad(count)}</b>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="flex items-center gap-2 px-1 text-sm text-muted">
            <CircleHelp className="h-4 w-4" aria-hidden />
            {t('home.byOriginEmpty')}
          </p>
        )}
      </section>
    </div>
  );
}
