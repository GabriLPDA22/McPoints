import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Star, CircleHelp } from 'lucide-react';
import { useAppStore } from '@/core/store/useAppStore.js';
import { Card, Button, EmptyState, TaxonomyBadge, TicketMark, TicketIllustration } from '@/core/design-system';
import { getSourceMeta, listCollectibleSources } from '@/core/taxonomy/registry.js';
import { collectionKeyFor } from '@/core/storage/projector.js';
import { useTranslation } from '@/core/i18n/useTranslation.js';

function isThisMonth(iso) {
  const d = new Date(iso);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export function HomeScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const entries = useAppStore((s) => s.entries);
  const sightings = useAppStore((s) => s.sightings);
  const getSourceStats = useAppStore((s) => s.getSourceStats);
  const projection = useAppStore((s) => s.getProjection());

  const entryList = Object.values(entries);
  const lastSighting = sightings[sightings.length - 1];
  const { totals, unclassified } = getSourceStats();

  function relativeTime(iso) {
    const diffMinutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (diffMinutes < 1) return t('time.justNow');
    if (diffMinutes < 60) return t('time.minutesAgo', diffMinutes);

    const hours = Math.round(diffMinutes / 60);
    if (hours < 24) return t('time.today');

    const days = Math.round(hours / 24);
    return days === 1 ? t('time.yesterday') : t('time.daysAgo', days);
  }

  const newThisMonth = useMemo(
    () => entryList.filter((e) => isThisMonth(e.firstSeenAt)).length,
    [entryList]
  );

  // Con una colección recién migrada todo es UNKNOWN: una lista de una sola fila
  // no aporta nada, así que el desglose solo aparece cuando hay algo que comparar.
  const sourceBreakdown = useMemo(() => {
    const rows = listCollectibleSources(t)
      .filter(({ value }) => totals[value])
      .map(({ value, ...meta }) => ({ value, meta, count: totals[value] }));

    return rows.length >= 2 ? rows : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totals, t]);

  const hasAnything = entryList.length > 0;

  return (
    <div className="screen-padding pb-8 screen-fill flex flex-col">
      <header className="flex items-center gap-2 pt-1 flex-shrink-0">
        <TicketMark className="w-6 h-6 text-accent" strokeWidth={7} />
        <h1 className="text-heading-lg text-ink">McPoints</h1>
      </header>

      {!hasAnything ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={TicketIllustration}
            title={t('home.emptyTitle')}
            action={
              <div className="w-full space-y-3">
                <Button size="lg" className="w-full" onClick={() => navigate('/scan')}>
                  <Camera className="w-5 h-5" />
                  {t('home.scanCta')}
                </Button>
                <button
                  type="button"
                  className="w-full text-center text-sm text-muted underline underline-offset-2"
                  onClick={() => navigate('/scan', { state: { openManual: true } })}
                >
                  {t('home.manualEntry')}
                </button>
              </div>
            }
          />
        </div>
      ) : (
        <div className="space-y-7 mt-7">
          <div>
            <p className="text-number-hero text-ink">{entryList.length}</p>
            <p className="text-body-md text-muted mt-1">
              {entryList.length === 1 ? t('home.uniqueSingular') : t('home.uniquePlural')}
            </p>
            {newThisMonth > 0 && (
              <p className="flex items-center gap-1.5 text-sm font-medium text-gold-ink mt-2">
                <Star className="w-3.5 h-3.5 fill-gold text-gold" aria-hidden />
                {t('home.newThisMonth', newThisMonth)}
              </p>
            )}
          </div>

          <Button size="lg" className="w-full" onClick={() => navigate('/scan')}>
            <Camera className="w-5 h-5" />
            {t('home.scanButton')}
          </Button>

          {lastSighting && (
            <section>
              <h2 className="text-label text-muted mb-2.5">{t('home.lastDiscovery')}</h2>
              {(() => {
                const lastMeta = getSourceMeta(lastSighting.source.value, t);
                const LargeIcon = lastMeta.illustration ?? lastMeta.icon;
                return (
                  <Card
                    as="button"
                    className="ticket-notch p-4 w-full text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent flex items-center justify-between gap-3"
                    onClick={() =>
                      navigate(`/number/${collectionKeyFor(lastSighting, projection.keyStrategy)}`)
                    }
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-number-lg text-ink">{lastSighting.rawNumber}</p>
                      <div className="flex items-center gap-2 mt-2.5">
                        <TaxonomyBadge meta={lastMeta} size="sm" />
                        <span className="text-caption text-muted">·</span>
                        <span className="text-caption text-muted">
                          {relativeTime(lastSighting.capturedAt)}
                        </span>
                      </div>
                    </div>
                    <LargeIcon
                      className="w-16 h-16 text-ink/55 flex-shrink-0"
                      strokeWidth={1.5}
                      absoluteStrokeWidth
                    />
                  </Card>
                );
              })()}
            </section>
          )}

          {sourceBreakdown.length > 0 && (
            <section>
              <h2 className="text-label text-muted mb-2.5">{t('home.byOrigin')}</h2>
              <ul className="divide-y divide-border">
                {sourceBreakdown.map(({ value, meta, count }) => (
                  <li key={value} className="flex items-center justify-between py-2.5">
                    <TaxonomyBadge meta={meta} />
                    <span className="font-mono font-medium tabular-nums text-ink text-sm">
                      {count}
                    </span>
                  </li>
                ))}
                {unclassified > 0 && (
                  <li className="flex items-center justify-between py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                      <CircleHelp className="w-3.5 h-3.5" aria-hidden />
                      {t('home.noOrigin')}
                    </span>
                    <span className="font-mono font-medium tabular-nums text-ink text-sm">
                      {unclassified}
                    </span>
                  </li>
                )}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
