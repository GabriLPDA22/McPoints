import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2, Tag } from 'lucide-react';
import { useAppStore } from '@/core/store/useAppStore.js';
import { Card, Button, EmptyState, TaxonomyBadge, SourceChecklist } from '@/core/design-system';
import { getSourceMeta, getFulfillmentMeta } from '@/core/taxonomy/registry.js';
import { missingSourcesFor, primarySourceOf } from '@/core/storage/projector.js';
import { ORDER_SOURCE, DETECTION_METHOD } from '@/core/taxonomy/constants.js';
import { SourcePickerSheet } from '@/features/classification/SourcePickerSheet.jsx';
import { useTranslation } from '@/core/i18n/useTranslation.js';

const METHOD_KEYS = {
  [DETECTION_METHOD.OCR]: 'taxonomy.method.ocr',
  [DETECTION_METHOD.MANUAL]: 'taxonomy.method.manual',
  [DETECTION_METHOD.MIGRATED]: 'taxonomy.method.migrated',
  [DETECTION_METHOD.IMPORTED]: 'taxonomy.method.imported',
};

export function NumberDetailScreen() {
  const { key } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const entry = useAppStore((s) => s.entries[key]);
  const getSightingsFor = useAppStore((s) => s.getSightingsFor);
  const reclassify = useAppStore((s) => s.reclassifySighting);
  const removeEntry = useAppStore((s) => s.removeEntry);

  const [classifying, setClassifying] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString(t('locale'), {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  }

  function formatDateTime(iso) {
    return new Date(iso).toLocaleString(t('locale'), {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

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

  const sightings = getSightingsFor(key);
  const missing = missingSourcesFor(entry);
  const primaryMeta = getSourceMeta(primarySourceOf(entry), t);

  const handleClassify = async (source) => {
    if (source !== ORDER_SOURCE.UNKNOWN) {
      await reclassify(classifying, { source });
    }
    setClassifying(null);
  };

  const handleDelete = async () => {
    await removeEntry(key);
    navigate('/collection');
  };

  return (
    <div className="screen-padding space-y-6 pb-6">
      <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label={t('detail.backAria')}>
        <ArrowLeft className="w-5 h-5" />
      </Button>

      <header className="text-center">
        <p className="text-number-hero text-ink">{entry.key}</p>
        <div className="mx-auto mt-3 h-px w-10 bg-accent" aria-hidden />
        <div className="flex items-center justify-center gap-2 mt-3">
          <TaxonomyBadge meta={primaryMeta} />
          <span className="text-muted">·</span>
          <span className="text-sm text-muted">{formatDate(entry.lastSeenAt)}</span>
        </div>
        <p className="text-sm text-muted mt-1.5">
          {entry.sightingCount === 1 ? t('detail.discoveredOnce') : t('detail.discoveredTimes', entry.sightingCount)}
        </p>
        {entry.sightingCount > 1 && (
          <p className="text-xs text-muted mt-0.5">{t('detail.firstTimeOn', formatDate(entry.firstSeenAt))}</p>
        )}
      </header>

      <section>
        <h2 className="text-label text-muted mb-1">{t('detail.origins')}</h2>
        <SourceChecklist sourcesSeen={entry.sourcesSeen} />
        {missing.length > 0 && (
          <p className="text-xs text-muted mt-2">
            {missing.length === 1 ? t('detail.missingOne') : t('detail.missingMany', missing.length)}
          </p>
        )}
      </section>

      <section>
        <h2 className="text-label text-muted mb-2.5">{t('detail.history')}</h2>
        <div className="space-y-2">
          {sightings.map((sighting) => {
            const sourceMeta = getSourceMeta(sighting.source.value, t);
            const isUnclassified = sighting.source.value === ORDER_SOURCE.UNKNOWN;

            return (
              <Card key={sighting.id} className="p-3.5">
                <div className="flex items-start gap-3.5">
                  <span className="text-number-sm text-ink leading-tight">
                    {sighting.rawNumber}
                  </span>
                  <div className="flex-1 min-w-0">
                    <TaxonomyBadge meta={sourceMeta} size="sm" />
                    {sighting.fulfillment.value !== 'UNKNOWN' && (
                      <TaxonomyBadge
                        meta={getFulfillmentMeta(sighting.fulfillment.value, t)}
                        size="sm"
                        className="ml-3"
                      />
                    )}
                    <p className="text-xs text-muted mt-1">
                      {formatDateTime(sighting.capturedAt)}
                      {' · '}
                      {METHOD_KEYS[sighting.detectionMethod]
                        ? t(METHOD_KEYS[sighting.detectionMethod])
                        : sighting.detectionMethod}
                    </p>
                  </div>
                  {isUnclassified && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setClassifying(sighting.id)}
                      aria-label={t('detail.classifySightingAria', sighting.rawNumber)}
                    >
                      <Tag className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="pt-2">
        {confirmDelete ? (
          <div className="space-y-2">
            <p className="text-sm text-muted text-center">
              {entry.sightingCount === 1
                ? t('detail.deleteConfirmOne')
                : t('detail.deleteConfirmMany', entry.sightingCount)}
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
          <Button variant="ghost" className="w-full text-muted" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="w-4 h-4" />
            {t('detail.deleteFromCollection')}
          </Button>
        )}
      </div>

      <SourcePickerSheet
        open={!!classifying}
        onClose={() => setClassifying(null)}
        onSelect={handleClassify}
      />
    </div>
  );
}
