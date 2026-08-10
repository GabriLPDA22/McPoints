import { MACHINE_ORIGINS, CLASSIFICATION_ORIGIN } from '../taxonomy/constants.js';
import { RULES_VERSION } from '../detection/rules.js';

export const DATASET_VERSION = 1;

/**
 * Exportación del dataset de investigación.
 *
 * Sirve para validar o refutar la hipótesis terminal|secuencia con tickets
 * reales. Ver Docs/research/hypothesis-validation.md.
 *
 * No incluye fotografías. El texto OCR se sanea antes de salir: importes,
 * números largos y datos fiscales se eliminan, porque el ticket contiene
 * información que no hace ninguna falta para esta investigación.
 */

const SENSITIVE_LINE_PATTERNS = [
  /\d+[,.]\d{2}/, // importes
  /€|EUR/i,
  /\b\d{5,}\b/, // números de ticket, tarjetas, identificadores
  /\b[A-Z]\d{7}[A-Z0-9]\b/i, // NIF/CIF
  /\bIVA\b|\bTOTAL\b|\bTEL\b|\bCIF\b|\bNIF\b/i,
  /\*{2,}/, // tarjeta enmascarada
];

export function sanitizeOcrText(text) {
  if (!text) return null;

  return text
    .split('\n')
    .filter((line) => line.trim() && !SENSITIVE_LINE_PATTERNS.some((p) => p.test(line)))
    .join('\n');
}

function attributeToRecord(attribute) {
  return {
    value: attribute.value,
    origin: attribute.origin,
    confidence: attribute.confidence,
  };
}

function sightingToRecord(sighting, { country }) {
  const sourceOrigin = sighting.source.origin;

  return {
    id: sighting.id,
    rawNumber: sighting.rawNumber,
    digits: sighting.digits,
    capturedAt: sighting.capturedAt,
    detectionMethod: sighting.detectionMethod,
    country,
    restaurant: sighting.evidence.restaurantHint ?? null,

    source: attributeToRecord(sighting.source),
    fulfillment: attributeToRecord(sighting.fulfillment),
    payment: attributeToRecord(sighting.payment),
    orderNumberConfidence: sighting.orderNumberConfidence,

    // En v1 siempre null. Cuando la hipótesis se valide, aquí aparecerá la
    // interpretación calculada y el dataset permitirá contrastarla.
    interpretation: sighting.interpretation,

    // Solo lo observado o confirmado por la persona cuenta como verificado.
    // Una etiqueta puesta a mano no valida al motor, pero sí vale como verdad
    // para comprobar la hipótesis del número.
    verifiedByUser: sourceOrigin === CLASSIFICATION_ORIGIN.USER_SELECTED ||
      sourceOrigin === CLASSIFICATION_ORIGIN.USER_CONFIRMED,
    autoClassified: MACHINE_ORIGINS.includes(sourceOrigin),

    evidenceKeywords: sighting.evidence.keywords,
    rulesVersion: sighting.evidence.rulesVersion ?? null,
    ocrText: sanitizeOcrText(sighting.evidence.ocrText),
  };
}

export function buildDatasetExport(sightings = [], { country = 'ES' } = {}) {
  const records = sightings.map((sighting) => sightingToRecord(sighting, { country }));

  return {
    datasetVersion: DATASET_VERSION,
    rulesVersion: RULES_VERSION,
    exportedAt: new Date().toISOString(),
    country,
    containsImages: false,
    hypothesis: 'terminal*100+sequence',
    hypothesisApplied: false,
    counts: {
      total: records.length,
      verifiedByUser: records.filter((r) => r.verifiedByUser).length,
      autoClassified: records.filter((r) => r.autoClassified).length,
    },
    records,
  };
}
