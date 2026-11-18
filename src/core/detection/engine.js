import { ORDER_SOURCE, FULFILLMENT_TYPE, PAYMENT_METHOD } from '../taxonomy/constants.js';
import {
  DEFAULT_DOMAIN,
  DEFAULT_RULES,
  RULES_VERSION,
  ORDER_LABELS,
  DISQUALIFYING_LABELS,
  SOURCE_KEYWORDS,
  FULFILLMENT_KEYWORDS,
  PAYMENT_KEYWORDS,
  AMBIGUOUS_KEYWORDS,
} from './rules.js';

/**
 * Motor de detección v2.
 *
 * Dos responsabilidades separadas:
 *   1. Encontrar el número de pedido entre el texto del ticket.
 *   2. Clasificar origen y entrega a partir del CONTEXTO textual.
 *
 * El número nunca participa en la clasificación: que un valor empiece por 23 no
 * es evidencia de nada. Ver Docs/research/domain-findings.md §1.5.
 */

/** Mayúsculas sin diacríticos, para comparar contra las tablas de pistas. */
export function normalizeText(text) {
  return String(text ?? '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ºª]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Valida un número leído y lo devuelve tal cual, sin rellenar ni recortar.
 * Los ceros a la izquierda se conservan: `066` no es `66` mientras no sepamos
 * si son el mismo número.
 */
export function normalizeRawNumber(raw, domain = DEFAULT_DOMAIN) {
  const digits = String(raw ?? '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length < domain.minDigits || digits.length > domain.maxDigits) return null;
  return digits;
}

function containsAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

/** Bloques que nunca contienen el número de pedido: importes, fechas, fiscales. */
export function isExcludedBlock(text) {
  const upper = normalizeText(text);
  if (containsAny(upper, DISQUALIFYING_LABELS)) return true;
  if (/€|EUR|\d+[,.]\d{2}/.test(text)) return true;
  if (/\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}/.test(text)) return true;
  if (/\d{1,2}:\d{2}/.test(text)) return true;
  if (/\d{5,}/.test(text.replace(/\s/g, ''))) return true;
  if (isItemLine(upper)) return true;
  return false;
}

/**
 * Línea de artículo: cantidad seguida del producto («1 PATATAS GR»,
 * «2 COCA-COLA»). El número es una cantidad, no un pedido. Observado en el
 * ticket real de fixtures/tickets/real/es-mahon-counter-004.
 */
function isItemLine(upper) {
  if (containsAny(upper, ORDER_LABELS)) return false;
  return /^\d{1,2} [A-Z][A-Z-]{2,}/.test(upper);
}

/**
 * Dígitos pegados a letras dentro del mismo token («MJTHM6-FMWCM-C37PP4», el
 * código de encuesta): no son un número de pedido. Se admite un prefijo «N»,
 * «NO» o «#» delante (`N123`, `#123`).
 */
function isEmbeddedInCode(text, index, length) {
  const before = text.slice(0, index);
  const after = text.slice(index + length);
  const letterAfter = /^[A-Za-z]/.test(after);
  const prefix = before.match(/[A-Za-zº#]+$/)?.[0] ?? '';
  const allowedPrefix = /^(N|NO|Nº|#)$/i.test(prefix);
  return letterAfter || (prefix.length > 0 && !allowedPrefix);
}

function boxOf(block) {
  return block.boundingBox ?? { top: 0.5, left: 0.5, width: 0.1, height: 0.03 };
}

function verticalCenter(block) {
  const box = boxOf(block);
  return box.top + box.height / 2;
}

/** Cercanía a una etiqueta de pedido. Es la señal más informativa que tenemos. */
function proximityToLabel(block, blocks, radius) {
  const center = verticalCenter(block);
  let best = 0;

  for (const other of blocks) {
    if (other === block) continue;
    if (!containsAny(normalizeText(other.text), ORDER_LABELS)) continue;

    const distance = Math.abs(center - verticalCenter(other));
    if (distance < radius) {
      best = Math.max(best, 1 - distance / radius);
    }
  }

  return best;
}

/**
 * Un número que comparte línea con una etiqueta descalificadora es de esa
 * etiqueta, no un número de pedido. Cubre el caso del código de la app.
 */
function sharesLineWithDisqualifier(block, blocks) {
  const box = boxOf(block);
  const center = verticalCenter(block);

  return blocks.some((other) => {
    if (other === block) return false;
    if (!containsAny(normalizeText(other.text), DISQUALIFYING_LABELS)) return false;
    return Math.abs(center - verticalCenter(other)) < Math.max(box.height, 0.02);
  });
}

/** Tamaño relativo. El número de pedido se imprime deliberadamente grande. */
function relativeFontSize(block, blocks) {
  const height = boxOf(block).height;
  const maxHeight = Math.max(...blocks.map((b) => boxOf(b).height), 0.001);
  return Math.min(1, height / maxHeight);
}

function positionScore(block) {
  const top = boxOf(block).top;
  if (top < 0.35) return 1;
  if (top < 0.55) return 0.7;
  return 0.3;
}

function isolationScore(block, match) {
  const stripped = String(block.text).replace(/\D/g, '');
  return stripped === match ? 1 : 0.5;
}

function formatScore(match) {
  return match.length >= 2 ? 1 : 0.6;
}

/** Extrae candidatos a número de pedido y los ordena por puntuación. */
export function rankCandidates(blocks = [], domain = DEFAULT_DOMAIN, rules = DEFAULT_RULES) {
  const weights = rules.signalWeights ?? DEFAULT_RULES.signalWeights;
  const radius = rules.labelProximityRadius ?? DEFAULT_RULES.labelProximityRadius;
  const candidates = new Map();

  for (const block of blocks) {
    if (isExcludedBlock(block.text)) continue;
    if (sharesLineWithDisqualifier(block, blocks)) continue;

    for (const found of block.text.matchAll(/\d+/g)) {
      const match = found[0];
      if (isEmbeddedInCode(block.text, found.index, match.length)) continue;

      const value = normalizeRawNumber(match, domain);
      if (!value) continue;

      const signals = {
        proximityLabel: proximityToLabel(block, blocks, radius),
        fontSize: relativeFontSize(block, blocks),
        isolation: isolationScore(block, match),
        position: positionScore(block),
        format: formatScore(match),
      };

      const score = Object.entries(weights).reduce(
        (total, [signal, weight]) => total + weight * (signals[signal] ?? 0),
        0
      );

      const existing = candidates.get(value);
      if (!existing || score > existing.score) {
        candidates.set(value, { value, rawText: match, score, signals });
      }
    }
  }

  return [...candidates.values()].sort((a, b) => b.score - a.score);
}

export function getConfidenceTier(score, tiers = DEFAULT_RULES.confidenceTiers) {
  if (score >= tiers.high) return 'high';
  if (score >= tiers.medium) return 'medium';
  if (score >= tiers.low) return 'low';
  return 'very_low';
}

/**
 * Clasifica una dimensión a partir de las pistas textuales del ticket.
 *
 * La confianza combina cuánta evidencia hay (`strength`) con cuán separada está
 * del segundo candidato (`margin`). Una sola pista ambigua o dos pistas en
 * conflicto se quedan por debajo del umbral y devuelven UNKNOWN, que es
 * preferible a una etiqueta incorrecta.
 */
export function classifyDimension(text, keywordMap, unknownValue, rules = DEFAULT_RULES) {
  const upper = normalizeText(text);
  const scored = [];

  for (const [value, keywords] of Object.entries(keywordMap)) {
    const hits = keywords.filter((keyword) => upper.includes(keyword));
    if (hits.length === 0) continue;

    const score = hits.reduce(
      (total, keyword) => total + (AMBIGUOUS_KEYWORDS.includes(keyword) ? 0.6 : 1),
      0
    );
    scored.push({ value, score, hits });
  }

  if (scored.length === 0) {
    return { value: unknownValue, confidence: null, keywords: [] };
  }

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  const runnerUp = scored[1]?.score ?? 0;

  const strength = Math.min(1, best.score / 2);
  const margin = (best.score - runnerUp) / best.score;
  const confidence = Math.min(0.95, strength * (0.5 + 0.5 * margin));

  const threshold = rules.classificationThreshold ?? DEFAULT_RULES.classificationThreshold;
  if (confidence < threshold) {
    return { value: unknownValue, confidence, keywords: best.hits };
  }

  return { value: best.value, confidence, keywords: best.hits };
}

/**
 * Analiza un ticket completo: número candidato y contexto.
 * Origen, entrega y pago se clasifican por separado y con su propia confianza.
 */
export function analyzeTicket(blocks = [], domain = DEFAULT_DOMAIN, rules = DEFAULT_RULES) {
  const candidates = rankCandidates(blocks, domain, rules);
  const top = candidates[0] ?? null;
  const tier = top ? getConfidenceTier(top.score, rules.confidenceTiers) : 'very_low';

  const fullText = blocks.map((block) => block.text).join('\n');

  const source = classifyDimension(fullText, SOURCE_KEYWORDS, ORDER_SOURCE.UNKNOWN, rules);
  const fulfillment = classifyDimension(
    fullText,
    FULFILLMENT_KEYWORDS,
    FULFILLMENT_TYPE.UNKNOWN,
    rules
  );
  const payment = classifyDimension(fullText, PAYMENT_KEYWORDS, PAYMENT_METHOD.UNKNOWN, rules);

  return {
    candidates,
    top,
    tier,
    source,
    fulfillment,
    payment,
    evidence: {
      keywords: [...source.keywords, ...fulfillment.keywords, ...payment.keywords],
      rulesVersion: rules.version ?? RULES_VERSION,
      ocrText: fullText,
    },
  };
}

export { DEFAULT_DOMAIN, DEFAULT_RULES, RULES_VERSION };
