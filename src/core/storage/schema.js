import {
  ORDER_SOURCE,
  FULFILLMENT_TYPE,
  PAYMENT_METHOD,
  CLASSIFICATION_ORIGIN,
  DETECTION_METHOD,
  COLLECTION_KEY_STRATEGY,
} from '../taxonomy/constants.js';

export const SCHEMA_VERSION = 4;

/**
 * Configuración de proyección. Cambiar `keyStrategy` reconstruye la colección
 * entera desde los avistamientos, sin tocarlos. Ver Docs/design/number-model.md.
 */
export const DEFAULT_PROJECTION = {
  keyStrategy: COLLECTION_KEY_STRATEGY.RAW,
};

function clamp01(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return Math.min(1, Math.max(0, value));
}

function newId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Un atributo clasificado lleva siempre su valor, quién lo decidió y con qué
 * confianza. Acepta tanto la forma completa como un string suelto, para que las
 * llamadas antiguas y los datos importados sigan funcionando.
 */
export function createAttribute(input, unknownValue) {
  const raw = input && typeof input === 'object' ? input : { value: input };
  const value = typeof raw.value === 'string' && raw.value ? raw.value : unknownValue;
  const defaultOrigin =
    value === unknownValue ? CLASSIFICATION_ORIGIN.UNKNOWN : CLASSIFICATION_ORIGIN.AUTO_DETECTED;

  return {
    value,
    origin: raw.origin ?? defaultOrigin,
    confidence: clamp01(raw.confidence),
  };
}

/**
 * Avistamiento: un hecho observado, inmutable salvo reclasificación manual
 * explícita. `rawNumber` se guarda exactamente como se leyó, sin rellenar ni
 * recortar nunca — es la garantía de que cualquier interpretación futura es
 * reversible.
 */
export function createSighting(input = {}) {
  const rawNumber = String(input.rawNumber ?? '').replace(/\D/g, '');

  return {
    id: input.id ?? newId(),
    rawNumber,
    digits: rawNumber.length,
    capturedAt: input.capturedAt ?? new Date().toISOString(),
    detectionMethod: input.detectionMethod ?? DETECTION_METHOD.MANUAL,

    orderNumberConfidence: clamp01(input.orderNumberConfidence),
    source: createAttribute(input.source, ORDER_SOURCE.UNKNOWN),
    fulfillment: createAttribute(input.fulfillment, FULFILLMENT_TYPE.UNKNOWN),
    payment: createAttribute(input.payment, PAYMENT_METHOD.UNKNOWN),

    // En v1 siempre null: la hipótesis terminal|secuencia no está validada.
    // Ver Docs/research/hypothesis-validation.md.
    interpretation: input.interpretation ?? null,

    evidence: {
      keywords: input.evidence?.keywords ?? [],
      rulesVersion: input.evidence?.rulesVersion ?? null,
      ocrText: input.evidence?.ocrText ?? null,
      restaurantHint: input.evidence?.restaurantHint ?? null,
    },
  };
}

/** Reclasificación manual. Devuelve un avistamiento nuevo, no muta el original. */
export function reclassifySighting(sighting, { source, fulfillment }) {
  const next = { ...sighting };
  if (source) {
    next.source = {
      value: source,
      origin: CLASSIFICATION_ORIGIN.USER_SELECTED,
      confidence: null,
    };
  }
  if (fulfillment) {
    next.fulfillment = {
      value: fulfillment,
      origin: CLASSIFICATION_ORIGIN.USER_SELECTED,
      confidence: null,
    };
  }
  return next;
}

export function createPreferences(input = {}) {
  return {
    theme: input.theme ?? 'system',
    language: input.language ?? 'es',
    disclaimerAccepted: input.disclaimerAccepted ?? false,
  };
}

export { clamp01, newId };
