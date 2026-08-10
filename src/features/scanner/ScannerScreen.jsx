import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Keyboard, Loader2 } from 'lucide-react';
import { useAppStore } from '@/core/store/useAppStore.js';
import { Button, BottomSheet, TaxonomyBadge } from '@/core/design-system';
import { captureAndRecognize, triggerHaptic } from './scannerService.js';
import { normalizeRawNumber } from '@/core/detection/engine.js';
import { DEFAULT_RULES } from '@/core/detection/rules.js';
import { getSourceMeta } from '@/core/taxonomy/registry.js';
import { DETECTION_METHOD, DISCOVERY_OUTCOME } from '@/core/taxonomy/constants.js';
import { ScanResultScreen } from './ScanResultScreen.jsx';
import { useTranslation } from '@/core/i18n/useTranslation.js';

export function ScannerScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const addSighting = useAppStore((s) => s.addSighting);
  const reclassify = useAppStore((s) => s.reclassifySighting);
  const domain = useAppStore((s) => s.getDomain());

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [manualOpen, setManualOpen] = useState(!!location.state?.openManual);
  const [manualValue, setManualValue] = useState('');
  const [result, setResult] = useState(null);

  // Desde Home, "Introducir manualmente" salta directo aquí sin pasar por
  // la cámara.
  useEffect(() => {
    if (location.state?.openManual) {
      setManualOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  /**
   * Registra el avistamiento. El origen y la entrega vienen del contexto del
   * ticket, no del número: si el motor no encontró pistas, quedan en UNKNOWN.
   */
  const record = useCallback(
    async (rawNumber, { detectionMethod, orderNumberConfidence = null, context = null }) => {
      const discovery = await addSighting({
        rawNumber,
        detectionMethod,
        orderNumberConfidence,
        source: context?.source,
        fulfillment: context?.fulfillment,
        payment: context?.payment,
        evidence: context?.evidence,
      });

      if (!discovery) {
        setError(t('scanner.errorInvalidNumber'));
        return;
      }

      await triggerHaptic(
        discovery.outcome === DISCOVERY_OUTCOME.DUPLICATE ? 'light' : 'success'
      );
      setAnalysis(null);
      setResult(discovery);
    },
    [addSighting]
  );

  const handleScan = useCallback(async () => {
    setProcessing(true);
    setError('');

    try {
      const scan = await captureAndRecognize(domain, DEFAULT_RULES);

      if (scan.candidates.length === 0) {
        setError(t('scanner.errorNoDetection'));
        setProcessing(false);
        return;
      }

      // Autoconfirmación solo cuando hay un único candidato y la lectura es
      // buena. Con varios candidatos siempre decide la persona.
      if (scan.tier === 'high' && scan.candidates.length === 1) {
        await record(scan.top.value, {
          detectionMethod: DETECTION_METHOD.OCR,
          orderNumberConfidence: scan.top.score,
          context: scan,
        });
      } else {
        setAnalysis(scan);
      }
    } catch (e) {
      setError(
        e.message === 'PERMISSION_DENIED' ? t('scanner.errorPermission') : t('scanner.errorGeneric')
      );
    }

    setProcessing(false);
  }, [domain, record]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const value = normalizeRawNumber(manualValue, domain);

    if (!value) {
      setError(t('scanner.errorManualRange', domain.minDigits, domain.maxDigits));
      return;
    }

    setManualOpen(false);
    setManualValue('');
    await record(value, { detectionMethod: DETECTION_METHOD.MANUAL });
  };

  // `result` es una foto fija del avistamiento en el momento del escaneo. Tras
  // clasificar a mano hay que refrescarla con lo que quedó en el store, o esta
  // pantalla seguiría mostrando "Desconocido" aunque el dato ya se guardó.
  const handleClassify = useCallback(
    async (source) => {
      await reclassify(result.sighting.id, { source });
      const state = useAppStore.getState();
      const updatedSighting = state.sightings.find((s) => s.id === result.sighting.id);
      setResult((prev) =>
        prev
          ? {
              ...prev,
              sighting: updatedSighting ?? prev.sighting,
              entry: state.entries[prev.key] ?? prev.entry,
            }
          : prev
      );
    },
    [reclassify, result]
  );

  if (result) {
    return (
      <ScanResultScreen
        result={result}
        onClassify={handleClassify}
        // `replace` para que /scan no quede apilado en el historial: al volver
        // atrás desde el detalle del número se sale hacia donde estabas antes
        // de escanear (normalmente Inicio), no de vuelta a la cámara.
        onDone={() => navigate(`/number/${result.key}`, { replace: true })}
        onScanAgain={() => {
          setResult(null);
          setError('');
        }}
      />
    );
  }

  const detectedSource = analysis ? getSourceMeta(analysis.source.value, t) : null;

  return (
    <div className="fixed inset-0 z-40 bg-black flex flex-col text-white">
      <div
        className="flex items-center justify-between px-2"
        style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label={t('scanner.closeAria')}
          className="w-11 h-11 flex items-center justify-center text-white"
        >
          <X className="w-6 h-6" />
        </button>
        <p className="text-sm font-medium">{t('scanner.frameTicket')}</p>
        <span className="w-11 h-11" aria-hidden />
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        <div className="absolute inset-10 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-white rounded-tl-sm" />
          <div className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-white rounded-tr-sm" />
          <div className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-white rounded-bl-sm" />
          <div className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-white rounded-br-sm" />
          {!processing && (
            <div
              className="absolute left-0 right-0 top-1/2 h-[2px] bg-accent shadow-[0_0_10px_2px_rgb(var(--primary)/0.6)] animate-scan-drift"
              aria-hidden
            />
          )}
        </div>

        {/* Se pide el ticket entero, no un primer plano del número: las palabras
            que lo rodean son las que permiten clasificar el origen. */}
        <p className="text-white/50 text-xs text-center px-10 absolute bottom-8">
          {t('scanner.readingHint')}
        </p>

        {processing && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-9 h-9 text-accent animate-spin" aria-hidden />
            <p className="text-white text-sm">{t('scanner.processing')}</p>
          </div>
        )}
      </div>

      <div
        className="px-6 pt-4 space-y-4"
        style={{ paddingBottom: 'calc(1.75rem + env(safe-area-inset-bottom))' }}
      >
        {error && (
          <p className="text-danger text-sm text-center" role="alert">
            {error}
          </p>
        )}
        <div className="relative flex items-center justify-center h-16">
          <button
            type="button"
            onClick={handleScan}
            disabled={processing}
            aria-label={t('scanner.captureAria')}
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center transition-transform duration-150 active:scale-95 disabled:opacity-60"
          >
            {processing && <Loader2 className="w-6 h-6 text-ink animate-spin" aria-hidden />}
          </button>
          <button
            type="button"
            onClick={() => setManualOpen(true)}
            aria-label={t('scanner.manualEntryAria')}
            className="absolute right-2 w-11 h-11 rounded-full flex items-center justify-center text-white/85"
          >
            <Keyboard className="w-5 h-5" />
          </button>
        </div>
      </div>

      <BottomSheet
        open={!!analysis}
        onClose={() => setAnalysis(null)}
        title={t('scanner.whichNumber')}
      >
        <div className="space-y-2">
          {analysis?.candidates.slice(0, 5).map((candidate, index) => (
            <button
              key={candidate.value}
              type="button"
              onClick={() =>
                record(candidate.value, {
                  detectionMethod: DETECTION_METHOD.OCR,
                  orderNumberConfidence: candidate.score,
                  context: analysis,
                })
              }
              className="w-full flex items-center justify-between gap-3 p-4 rounded-lg bg-surface hover:bg-accent/10 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span className="font-display text-2xl font-medium tabular-nums text-ink">
                {candidate.value}
              </span>
              <span className="flex items-center gap-3">
                {index === 0 && detectedSource && (
                  <TaxonomyBadge meta={detectedSource} size="sm" short />
                )}
                <span className="text-xs text-muted tabular-nums">
                  {Math.round(candidate.score * 100)}%
                </span>
              </span>
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet open={manualOpen} onClose={() => setManualOpen(false)} title={t('scanner.manualNumberTitle')}>
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={domain.maxDigits}
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value.replace(/\D/g, ''))}
            placeholder="2323"
            className="w-full text-center font-display text-3xl font-medium tabular-nums py-4 rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            autoFocus
          />
          <p className="text-xs text-muted text-center">{t('scanner.manualHint')}</p>
          <Button type="submit" className="w-full" disabled={!manualValue}>
            {t('scanner.confirm')}
          </Button>
        </form>
      </BottomSheet>
    </div>
  );
}
