import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeTicket } from './engine.js';

const FIXTURES_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../../../fixtures/tickets');

function readJson(relativePath) {
  return JSON.parse(readFileSync(resolve(FIXTURES_DIR, relativePath), 'utf8'));
}

const catalog = readJson('catalog.json');

/**
 * El catálogo de tickets es ejecutable: cada entrada declara lo que el motor
 * debe producir hoy. Cuando `groundTruth` tiene un valor y `expected` dice
 * UNKNOWN, es un hueco conocido de las reglas y está documentado como tal, no
 * un fallo silencioso.
 */
describe('catálogo de tickets', () => {
  for (const entry of catalog.entries) {
    describe(entry.id, () => {
      const { blocks } = readJson(entry.ocrFixture);
      const analysis = analyzeTicket(blocks);

      it('detecta el número esperado', () => {
        expect(analysis.top?.value).toBe(entry.expected.rawNumber);
      });

      it('clasifica el origen esperado', () => {
        expect(analysis.source.value).toBe(entry.expected.source);
      });

      it('clasifica la entrega esperada', () => {
        expect(analysis.fulfillment.value).toBe(entry.expected.fulfillment);
      });

      it('clasifica el pago esperado', () => {
        expect(analysis.payment.value).toBe(entry.expected.payment);
      });

      it('no produce interpretación terminal/secuencia', () => {
        expect(analysis.top?.interpretation).toBeUndefined();
      });

      if (entry.expected.mustNotDetect?.length) {
        it('descarta los números que no son de pedido', () => {
          const values = analysis.candidates.map((c) => c.value);
          for (const forbidden of entry.expected.mustNotDetect) {
            expect(values).not.toContain(forbidden);
          }
        });
      }
    });
  }
});

describe('cobertura del catálogo', () => {
  it('documenta los huecos entre lo que ocurrió y lo que el motor puede saber', () => {
    const gaps = catalog.entries.filter(
      (entry) =>
        entry.groundTruth.orderSource !== 'UNKNOWN' && entry.expected.source === 'UNKNOWN'
    );

    // No es un fallo: es la lista de tickets cuyo canal no es deducible del
    // texto impreso. Sirve para saber qué pistas faltan en las reglas.
    expect(gaps.map((g) => g.id)).toEqual(['sim-kiosk-042', 'sim-counter-156']);
  });

  it('ninguna entrada afirma un terminal sin haberlo observado', () => {
    for (const entry of catalog.entries) {
      if (entry.groundTruth.observedTerminal !== null) {
        expect(entry.groundTruth.verifiedByUser).toBe(true);
      }
    }
  });
});
