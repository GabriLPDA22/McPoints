import { describe, it, expect } from 'vitest';
import {
  normalizeRawNumber,
  rankCandidates,
  classifyDimension,
  analyzeTicket,
  getConfidenceTier,
  isExcludedBlock,
} from './engine.js';
import { DEFAULT_DOMAIN, SOURCE_KEYWORDS, FULFILLMENT_KEYWORDS, RULES_VERSION } from './rules.js';
import { ORDER_SOURCE, FULFILLMENT_TYPE } from '../taxonomy/constants.js';

function block(text, { top = 0.5, height = 0.03, left = 0.1, width = 0.3 } = {}) {
  return { text, boundingBox: { top, left, width, height } };
}

describe('normalizeRawNumber', () => {
  it('devuelve el número tal cual, sin rellenar', () => {
    expect(normalizeRawNumber('48', DEFAULT_DOMAIN)).toBe('48');
    expect(normalizeRawNumber('2323', DEFAULT_DOMAIN)).toBe('2323');
  });

  it('conserva los ceros a la izquierda', () => {
    expect(normalizeRawNumber('066', DEFAULT_DOMAIN)).toBe('066');
    expect(normalizeRawNumber('0090', DEFAULT_DOMAIN)).toBe('0090');
  });

  it('acepta 2323, que la v1 rechazaba por estar fuera del dominio 0-999', () => {
    expect(normalizeRawNumber('2323', DEFAULT_DOMAIN)).toBe('2323');
  });

  it('rechaza lo que excede los 4 dígitos', () => {
    expect(normalizeRawNumber('12345', DEFAULT_DOMAIN)).toBeNull();
  });

  it('rechaza texto sin dígitos', () => {
    expect(normalizeRawNumber('PEDIDO', DEFAULT_DOMAIN)).toBeNull();
    expect(normalizeRawNumber('', DEFAULT_DOMAIN)).toBeNull();
  });
});

describe('isExcludedBlock', () => {
  it('excluye importes, fechas y horas', () => {
    expect(isExcludedBlock('12,50 €')).toBe(true);
    expect(isExcludedBlock('09/08/2026')).toBe(true);
    expect(isExcludedBlock('14:32')).toBe(true);
  });

  it('excluye el número de ticket fiscal y el código de la app', () => {
    expect(isExcludedBlock('N. TICKET 883021')).toBe(true);
    expect(isExcludedBlock('CODIGO 4821')).toBe(true);
  });

  it('excluye las líneas de artículo (cantidad + producto)', () => {
    expect(isExcludedBlock('1 PATATAS GR')).toBe(true);
    expect(isExcludedBlock('2 COCA-COLA GR')).toBe(true);
    expect(isExcludedBlock('PEDIDO 156')).toBe(false);
  });

  it('no excluye un número de pedido suelto', () => {
    expect(isExcludedBlock('2323')).toBe(false);
  });
});

describe('rankCandidates', () => {
  it('prioriza el número cercano a la etiqueta PEDIDO', () => {
    const blocks = [
      block('McDonalds', { top: 0.05 }),
      block('PEDIDO', { top: 0.2 }),
      block('2323', { top: 0.26, height: 0.09 }),
      block('156', { top: 0.8 }),
    ];

    const [best] = rankCandidates(blocks, DEFAULT_DOMAIN);

    expect(best.value).toBe('2323');
  });

  it('descarta el código de la app aunque esté impreso en grande', () => {
    const blocks = [
      block('CODIGO APP', { top: 0.3 }),
      block('4821', { top: 0.3, height: 0.1 }),
      block('PEDIDO', { top: 0.6 }),
      block('62', { top: 0.64, height: 0.05 }),
    ];

    const values = rankCandidates(blocks, DEFAULT_DOMAIN).map((c) => c.value);

    expect(values).not.toContain('4821');
    expect(values).toContain('62');
  });

  it('no propone importes como número de pedido', () => {
    const blocks = [block('PEDIDO', { top: 0.2 }), block('12,50 €', { top: 0.22 })];

    expect(rankCandidates(blocks, DEFAULT_DOMAIN)).toHaveLength(0);
  });
});

describe('classifyDimension', () => {
  it('clasifica con una pista específica', () => {
    const result = classifyDimension(
      'KIOSCO 3\nPEDIDO\n2323',
      SOURCE_KEYWORDS,
      ORDER_SOURCE.UNKNOWN
    );

    expect(result.value).toBe(ORDER_SOURCE.KIOSK);
    expect(result.confidence).toBeGreaterThan(0.45);
  });

  it('ignora acentos y mayúsculas', () => {
    const result = classifyDimension('Comer aquí', FULFILLMENT_KEYWORDS, FULFILLMENT_TYPE.UNKNOWN);

    expect(result.value).toBe(FULFILLMENT_TYPE.EAT_IN);
  });

  it('devuelve UNKNOWN con una sola pista ambigua', () => {
    // "MESA" sola no basta para afirmar servicio a mesa.
    const result = classifyDimension('MESA', FULFILLMENT_KEYWORDS, FULFILLMENT_TYPE.UNKNOWN);

    expect(result.value).toBe(FULFILLMENT_TYPE.UNKNOWN);
  });

  it('devuelve UNKNOWN cuando dos dimensiones empatan', () => {
    const result = classifyDimension('KIOSCO CAJA', SOURCE_KEYWORDS, ORDER_SOURCE.UNKNOWN);

    expect(result.value).toBe(ORDER_SOURCE.UNKNOWN);
  });

  it('devuelve UNKNOWN sin ninguna pista, con confianza nula', () => {
    const result = classifyDimension('2323', SOURCE_KEYWORDS, ORDER_SOURCE.UNKNOWN);

    expect(result.value).toBe(ORDER_SOURCE.UNKNOWN);
    expect(result.confidence).toBeNull();
  });
});

describe('analyzeTicket', () => {
  it('separa número, origen y entrega con confianza independiente', () => {
    const blocks = [
      block('McDonalds Gran Via', { top: 0.04 }),
      block('KIOSCO 3', { top: 0.1 }),
      block('AUTOSERVICIO', { top: 0.13 }),
      block('PEDIDO', { top: 0.2 }),
      block('2323', { top: 0.26, height: 0.1 }),
      block('COMER AQUI', { top: 0.4 }),
      block('TARJETA', { top: 0.75 }),
      block('12,50 €', { top: 0.85 }),
    ];

    const result = analyzeTicket(blocks);

    expect(result.top.value).toBe('2323');
    expect(result.source.value).toBe(ORDER_SOURCE.KIOSK);
    expect(result.fulfillment.value).toBe(FULFILLMENT_TYPE.EAT_IN);
    expect(result.payment.value).toBe('CARD');
    // Cada dimensión mide su propia evidencia: el origen tiene dos pistas y la
    // entrega una, así que la confianza del origen debe ser mayor.
    expect(result.source.confidence).toBeGreaterThan(result.fulfillment.confidence);
  });

  it('nunca deduce el origen a partir del número', () => {
    const blocks = [block('PEDIDO', { top: 0.2 }), block('2323', { top: 0.26, height: 0.1 })];

    const result = analyzeTicket(blocks);

    expect(result.top.value).toBe('2323');
    expect(result.source.value).toBe(ORDER_SOURCE.UNKNOWN);
    expect(result.fulfillment.value).toBe(FULFILLMENT_TYPE.UNKNOWN);
  });

  it('no produce interpretación terminal/secuencia mientras la hipótesis no esté validada', () => {
    const result = analyzeTicket([block('PEDIDO', { top: 0.2 }), block('2323', { top: 0.26 })]);

    expect(result.interpretation).toBeUndefined();
  });

  it('registra la versión de reglas usada', () => {
    const result = analyzeTicket([block('2323', { top: 0.2 })]);

    expect(result.evidence.rulesVersion).toBe(RULES_VERSION);
  });
});

describe('getConfidenceTier', () => {
  it('reparte por umbrales', () => {
    expect(getConfidenceTier(0.9)).toBe('high');
    expect(getConfidenceTier(0.6)).toBe('medium');
    expect(getConfidenceTier(0.35)).toBe('low');
    expect(getConfidenceTier(0.1)).toBe('very_low');
  });
});

describe('códigos alfanuméricos', () => {
  it('ignora los dígitos del código de encuesta', () => {
    const values = rankCandidates([{ text: 'MJTHM6-FMWCM-C37PP4' }]).map((c) => c.value);
    expect(values).toEqual([]);
  });

  it('acepta el prefijo N o # delante del número', () => {
    expect(rankCandidates([{ text: 'N123' }]).map((c) => c.value)).toEqual(['123']);
    expect(rankCandidates([{ text: '#45' }]).map((c) => c.value)).toEqual(['45']);
  });
});
