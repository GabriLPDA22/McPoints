import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Ellipsis, Tag, Trash2 } from 'lucide-react';
import { useAppStore } from '@/core/store/useAppStore.js';
import { Button, BottomSheet, EmptyState, SectionLabel } from '@/core/design-system';
import { getSourceMeta, getFulfillmentMeta, listCollectibleSources } from '@/core/taxonomy/registry.js';
import { ORDER_SOURCE } from '@/core/taxonomy/constants.js';
import { classifySightings, SIGHTING_KIND } from '@/core/storage/insights.js';
import { SourcePickerSheet } from '@/features/classification/SourcePickerSheet.jsx';
import { useTranslation } from '@/core/i18n/useTranslation.js';

// Cada sello "estampado" con su propio ángulo, fijo por posición, para que no
// baile entre renders.
const STAMP_ROTATION = [-10, 8, -6, 11, -8];

function numberSize(length) {
  if (length <= 3) return 'text-[150px]';
  if (length === 4) return 'text-[118px]';
  return 'text-[88px]';
}

export function NumberDetailScreen() {
  const { key } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const entry = useAppStore((s) => s.entries[key]);
  const allSightings = useAppStore((s) => s.sightings);
  const getSightingsFor = useAppStore((s) => s.getSightingsFor);
  const reclassify = useAppStore((s) => s.reclassifySighting);
  const removeEntry = useAppStore((s) => s.removeEntry);
  const projection = useAppStore((s) => s.getProjection());

  const [classifying, setClassifying] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const kinds = useMemo(
    () => classifySightings(allSightings, projection.keyStrategy),
    [allSightings, projection.keyStrategy]
  );

  const shortDate = (iso) =>
    new Date(iso).toLocaleDateString(t('locale'), { day: '2-digit', month: '2-digit', year: '2-digit' });
  // Formato de ticket fijo («30/10 01:18»): toLocaleString mete una coma y parte la columna.
  const stamp = (iso) => {
    const d = new Date(iso);
    const p2 = (n) => String(n).padStart(2, '0');
    return `${p2(d.getDate())}/${p2(d.getMonth() + 1)} ${p2(d.getHours())}:${p2(d.getMinutes())}`;
  };

  if (!entry) {
    return (
      <div className="screen-padding screen-fill flex items-center justify-center">
        <EmptyState
          title={t('detail.notFoundTitle')}
          description={t('detail.notFoundDescription')}
          action={<Button onClick={() => navigate('/collection')}>{t('detail.backToCollection')}</Button>}
        />
      </div>
    );
  }

  // Más reciente primero: es lo que se acaba de escanear.
  const sightings = [...getSightingsFor(key)].reverse();
  const sources = listCollectibleSources(t);
  const gotCount = sources.filter(({ value }) => entry.sourcesSeen[value]).length;

  const handleClassify = async (source) => {
    if (source !== ORDER_SOURCE.UNKNOWN) await reclassify(classifying, { source });
    setClassifying(null);
  };

  const handleDelete = async () => {
    await removeEntry(key);
    navigate('/collection', { replace: true });
  };

  return (
    <div className="pb-6">
      <section className="paper-torn relative mb-[10px] bg-accent px-5 pb-6 pt-2 text-on-accent [--surface:var(--primary)]">
        <div className="flex items-center justify-between py-1.5">
          <HeaderButton icon={ArrowLeft} label={t('detail.backAria')} onClick={() => navigate(-1)} />
          <HeaderButton icon={Ellipsis} label={t('detail.moreAria')} onClick={() => setMenuOpen(true)} />
        </div>
        <p className="mt-1 text-receipt-sm opacity-80 tracking-[0.2em]">{t('detail.orderNo')}</p>
        <h1
          className={`font-mono font-semibold leading-[0.95] tracking-[-0.06em] tabular-nums ${numberSize(entry.key.length)}`}
        >
          {entry.key}
        </h1>
        <div className="mt-3 flex justify-between text-receipt-sm opacity-90">
          <span>{t('detail.firstSeen', shortDate(entry.firstSeenAt))}</span>
          <span>{t('detail.seenTimes', entry.sightingCount)}</span>
        </div>
      </section>

      <div className="screen-padding pt-6">
        <SectionLabel aside={`${gotCount} / ${sources.length}`}>{t('detail.stamps')}</SectionLabel>
        <ul className="mb-7 grid grid-cols-5 gap-2">
          {sources.map(({ value, icon: Icon, shortLabel }, i) => {
            const got = entry.sourcesSeen[value];
            return (
              <li
                key={value}
                aria-label={got ? t('sourceChecklist.gotTimesAria', shortLabel, got) : `${shortLabel}: ${t('sourceChecklist.pendingAria')}`}
                style={got ? { transform: `rotate(${STAMP_ROTATION[i]}deg)` } : undefined}
                className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-full ${
                  got
                    ? 'border-[2.5px] border-accent text-accent shadow-[inset_0_0_0_3px_rgb(var(--bg)),inset_0_0_0_4.5px_rgb(var(--primary))]'
                    : 'border-[1.5px] border-dashed border-border text-subtle'
                }`}
              >
                <Icon className="h-[22px] w-[22px]" strokeWidth={got ? 2 : 1.6} aria-hidden />
                <span className="max-w-full truncate px-0.5 font-mono text-[7.5px] font-semibold uppercase tracking-[0.04em]">
                  {shortLabel}
                </span>
              </li>
            );
          })}
        </ul>

        <SectionLabel>{t('detail.log')}</SectionLabel>
        <ol className="paper rounded-[4px] px-4 py-1.5">
          {sightings.map((sighting) => {
            const sourceMeta = getSourceMeta(sighting.source.value, t);
            const unknown = sighting.source.value === ORDER_SOURCE.UNKNOWN;
            const kind = kinds.get(sighting.id);
            const fulfillment = sighting.fulfillment?.value;

            return (
              <li
                key={sighting.id}
                className="grid grid-cols-[104px_1fr_auto] items-center gap-2 border-b-[1.5px] border-dashed border-border py-2.5 font-mono text-[13px] text-ink last:border-b-0"
              >
                <span className="tabular-nums">{stamp(sighting.capturedAt)}</span>
                <span className="min-w-0 truncate uppercase">
                  {unknown ? '—' : sourceMeta.shortLabel}
                  {fulfillment && fulfillment !== 'UNKNOWN' && (
                    <span className="text-muted"> · {getFulfillmentMeta(fulfillment, t).shortLabel}</span>
                  )}
                </span>
                {unknown ? (
                  <button
                    type="button"
                    onClick={() => setClassifying(sighting.id)}
                    aria-label={t('detail.classifySightingAria', sighting.rawNumber)}
                    className="inline-flex items-center gap-1 rounded-[4px] bg-ink px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-surface"
                  >
                    <Tag className="h-3 w-3" aria-hidden />
                    {t('detail.classify')}
                  </button>
                ) : (
                  <KindLabel kind={kind} />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <BottomSheet open={menuOpen} onClose={() => { setMenuOpen(false); setConfirmDelete(false); }} title={entry.key}>
        {confirmDelete ? (
          <div className="space-y-3">
            <p className="text-sm text-ink">
              {entry.sightingCount === 1 ? t('detail.deleteConfirmOne') : t('detail.deleteConfirmMany', entry.sightingCount)}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(false)}>
                {t('common.cancel')}
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleDelete}>
                {t('detail.delete')}
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="flex w-full items-center gap-3 py-3.5 text-left text-danger"
          >
            <Trash2 className="h-[18px] w-[18px]" aria-hidden />
            <span className="text-sm font-medium">{t('detail.deleteFromCollection')}</span>
          </button>
        )}
      </BottomSheet>

      <SourcePickerSheet open={!!classifying} onClose={() => setClassifying(null)} onSelect={handleClassify} />
    </div>
  );
}

function HeaderButton({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-white/60 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      <Icon className="h-[22px] w-[22px]" strokeWidth={2} aria-hidden />
    </button>
  );
}

function KindLabel({ kind }) {
  const { t } = useTranslation();
  if (kind === SIGHTING_KIND.NEW)
    return <b className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-accent">{t('detail.kindNew')}</b>;
  if (kind === SIGHTING_KIND.NEW_SOURCE)
    return <b className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-gold-ink">{t('detail.kindNewSource')}</b>;
  return <span className="text-[11.5px] uppercase tracking-[0.06em] text-muted">{t('detail.kindRepeat')}</span>;
}
