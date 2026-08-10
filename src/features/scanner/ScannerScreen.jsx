import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Keyboard, Loader2, CameraOff } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useAppStore } from '@/core/store/useAppStore.js';
import { Button, BottomSheet, TaxonomyBadge } from '@/core/design-system';
import {
  captureAndRecognize,
  captureFromPreview,
  ensureCameraPermission,
  startCameraPreview,
  stopCameraPreview,
  triggerHaptic,
} from './scannerService.js';
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
  // 'starting' hasta que el preview responde; 'denied' si el usuario rechaza el
  // permiso; 'unavailable' en navegador o si el plugin falla, donde se recurre
  // a la cámara del sistema al pulsar el disparador.
  const [cameraState, setCameraState] = useState('starting');

  // Desde Home, "Introducir manualmente" salta directo aquí sin pasar por
  // la cámara.
  useEffect(() => {
    if (location.state?.openManual) {
      setManualOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  // La cámara se abre (y pide permiso) al entrar en la pantalla, no al pulsar
  // el disparador: un visor en negro que no reacciona se lee como una app rota.
  // Se apaga al salir y mientras se muestra el resultado del escaneo.
  const cameraVisible = !result;

  useEffect(() => {
    if (!cameraVisible) return undefined;

    let cancelled = false;

    (async () => {
      if (!Capacitor.isNativePlatform()) {
        setCameraState('unavailable');
        return;
      }

      setCameraState('starting');

      if (!(await ensureCameraPermission())) {
        if (!cancelled) setCameraState('denied');
        return;
      }

      try {
        await startCameraPreview();
        if (cancelled) {
          await stopCameraPreview();
          return;
        }
        // El preview se dibuja por detrás del WebView, así que el fondo de la
        // página tiene que dejar de pintar para que se vea.
        document.body.classList.add('camera-active');
        setCameraState('ready');
      } catch (e) {
        console.warn('Camera preview failed', e);
        if (!cancelled) setCameraState('unavailable');
      }
    })();

    return () => {
      cancelled = true;
      document.body.classList.remove('camera-active');
      stopCameraPreview();
    };
  }, [cameraVisible]);

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
      const scan =
        cameraState === 'ready'
          ? await captureFromPreview(domain, DEFAULT_RULES)
          : await captureAndRecognize(domain, DEFAULT_RULES);

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
  }, [cameraState, domain, record, t]);

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

  const cameraDenied = cameraState === 'denied';

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col text-white ${
        cameraState === 'ready' ? 'bg-transparent' : 'bg-black'
      }`}
    >
      <div
        className="flex items-center justify-between px-2 bg-gradient-to-b from-black/55 to-transparent pb-3"
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
        {!cameraDenied && (
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
        )}

        {cameraState === 'starting' && (
          <Loader2 className="w-8 h-8 text-white/70 animate-spin" aria-hidden />
        )}

        {cameraDenied && (
          <div className="px-10 text-center space-y-3">
            <CameraOff className="w-10 h-10 mx-auto text-white/70" aria-hidden />
            <p className="text-sm text-white/85">{t('scanner.errorPermission')}</p>
          </div>
        )}

        {processing && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-9 h-9 text-accent animate-spin" aria-hidden />
            <p className="text-white text-sm">{t('scanner.processing')}</p>
          </div>
        )}
      </div>

      <div
        className="px-6 pt-6 space-y-4 bg-gradient-to-t from-black/70 via-black/55 to-transparent"
        style={{ paddingBottom: 'calc(1.75rem + env(safe-area-inset-bottom))' }}
      >
        {/* Se pide el ticket entero, no un primer plano del número: las palabras
            que lo rodean son las que permiten clasificar el origen. Va bajo el
            visor, no dentro: encima del encuadre se solapaba con las esquinas. */}
        {!cameraDenied && !error && (
          <p className="text-white/80 text-xs text-center">{t('scanner.readingHint')}</p>
        )}
        {error && (
          <p className="text-sm text-center text-white bg-danger/90 rounded-lg py-2 px-3" role="alert">
            {error}
          </p>
        )}
        <div className="relative flex items-center justify-center h-16">
          <button
            type="button"
            onClick={handleScan}
            disabled={processing || cameraDenied}
            aria-label={t('scanner.captureAria')}
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center transition-transform duration-150 active:scale-95 disabled:opacity-40"
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
