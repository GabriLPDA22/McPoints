import { useState } from 'react';
import { Sparkles, CircleCheck, Layers, RotateCcw } from 'lucide-react';
import { Button, TaxonomyBadge, SourceChecklist } from '@/core/design-system';
import { getSourceMeta, getFulfillmentMeta } from '@/core/taxonomy/registry.js';
import { missingSourcesFor } from '@/core/storage/projector.js';
import {
  DISCOVERY_OUTCOME,
  ORDER_SOURCE,
  FULFILLMENT_TYPE,
} from '@/core/taxonomy/constants.js';
import { SourcePickerSheet } from '@/features/classification/SourcePickerSheet.jsx';
import { useTranslation } from '@/core/i18n/useTranslation.js';

const HEADLINE_KEYS = {
  [DISCOVERY_OUTCOME.NEW_NUMBER]: 'scanResult.newDiscovery',
  [DISCOVERY_OUTCOME.NEW_SOURCE]: 'scanResult.newVariant',
  [DISCOVERY_OUTCOME.DUPLICATE]: 'scanResult.alreadyHad',
};

export function ScanResultScreen({ result, onClassify, onDone, onScanAgain }) {
  const { t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);
  const { outcome, entry, sighting } = result;

  const isNew = outcome === DISCOVERY_OUTCOME.NEW_NUMBER;
  const isNewSource = outcome === DISCOVERY_OUTCOME.NEW_SOURCE;
  const celebrate = isNew || isNewSource;

  const sourceUnknown = sighting.source.value === ORDER_SOURCE.UNKNOWN;
  const hasFulfillment = sighting.fulfillment.value !== FULFILLMENT_TYPE.UNKNOWN;
  const missing = missingSourcesFor(entry);

  const handleSelect = async (source) => {
    setPickerOpen(false);
    if (source !== ORDER_SOURCE.UNKNOWN) await onClassify(source);
  };

  return (
    <div className="fixed inset-0 z-50 bg-bg overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-center p-6 gap-5 text-center">
        {isNew && <Sparkles className="w-7 h-7 text-gold animate-pop" aria-hidden />}
        {isNewSource && <Layers className="w-7 h-7 text-accent animate-pop" aria-hidden />}
        {!celebrate && <CircleCheck className="w-7 h-7 text-muted" aria-hidden />}

        <p
          className={`text-label ${celebrate ? (isNew ? 'text-gold-ink' : 'text-accent') : 'text-muted'}`}
        >
          {t(HEADLINE_KEYS[outcome])}
        </p>

        <div>
          <p className="text-number-hero text-ink animate-pop">{entry.key}</p>
          <div className="mx-auto mt-3 h-px w-10 bg-accent" aria-hidden />
        </div>

        <div className="flex items-center justify-center gap-2">
          <TaxonomyBadge meta={getSourceMeta(sighting.source.value, t)} />
          {hasFulfillment && (
            <>
              <span className="text-muted">·</span>
              <TaxonomyBadge meta={getFulfillmentMeta(sighting.fulfillment.value, t)} />
            </>
          )}
        </div>

        {isNewSource && <p className="text-sm text-muted max-w-xs">{t('scanResult.newSourceHint')}</p>}

        {!isNew && !isNewSource && (
          <p className="text-sm text-muted max-w-xs">
            {entry.sightingCount === 1 ? t('scanResult.gotOnce') : t('scanResult.gotTimes', entry.sightingCount)}
          </p>
        )}

        {sourceUnknown && (
          <div className="space-y-2">
            <p className="text-sm text-muted max-w-xs">{t('scanResult.unknownSourceHint')}</p>
            <Button variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
              {t('scanResult.classify')}
            </Button>
          </div>
        )}

        {(isNewSource || (!isNew && missing.length > 0)) && (
          <div className="w-full max-w-xs text-left pt-2">
            <SourceChecklist sourcesSeen={entry.sourcesSeen} compact />
          </div>
        )}

        {sighting.rawNumber !== entry.key && (
          <p className="text-xs text-muted tabular-nums">{t('scanResult.ticketLabel', sighting.rawNumber)}</p>
        )}

        <div className="flex flex-col gap-3 w-full max-w-sm pt-2">
          <Button size="lg" className="w-full" onClick={onDone}>
            {t('scanResult.viewNumber')}
          </Button>
          <Button variant="ghost" className="w-full" onClick={onScanAgain}>
            <RotateCcw className="w-4 h-4" />
            {t('scanResult.scanAnother')}
          </Button>
        </div>
      </div>

      <SourcePickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelect}
      />
    </div>
  );
}
