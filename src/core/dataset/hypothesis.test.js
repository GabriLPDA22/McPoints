import { describe, it, expect } from 'vitest';
import {
  splitCandidate,
  checkSequenceMonotonicity,
  checkTerminalStability,
  checkZeroPaddingAnomaly,
  evaluateHypothesis,
  VERDICT,
} from './hypothesis.js';

function record(rawNumber, { at = '2026-08-01T10:00:00.000Z', restaurant = 'R1', terminal = null } = {}) {
  return { rawNumber, capturedAt: at, restaurant, observedTerminal: terminal };
}

describe('splitCandidate', () => {
  it('parte el número según la hipótesis, solo para análisis', () => {
    expect(splitCandidate('2323')).toMatchObject({ terminal: 23, sequence: 23 });
    expect(splitCandidate('352')).toMatchObject({ terminal: 3, sequence: 52 });
    expect(splitCandidate('48')).toMatchObject({ terminal: 0, sequence: 48 });
  });

  it('detecta el relleno con cero a la izquierda', () => {
    expect(splitCandidate('066').padded).toBe(true);
    expect(splitCandidate('166').padded).toBe(false);
  });
});

describe('P1: monotonía de la secuencia', () => {
  it('acepta una secuencia que avanza', () => {
    const result = checkSequenceMonotonicity([
      record('2320', { at: '2026-08-01T10:00:00.000Z' }),
      record('2325', { at: '2026-08-01T10:05:00.000Z' }),
      record('1330', { at: '2026-08-01T10:09:00.000Z' }),
    ]);

    expect(result.violations).toBe(0);
    expect(result.passed).toBe(true);
  });

  it('acepta el paso de 99 a 00 como envolvimiento del contador', () => {
    const result = checkSequenceMonotonicity([
      record('2398', { at: '2026-08-01T10:00:00.000Z' }),
      record('2403', { at: '2026-08-01T10:04:00.000Z' }),
    ]);

    expect(result.violations).toBe(0);
  });

  it('marca como violación un retroceso pequeño', () => {
    const result = checkSequenceMonotonicity([
      record('2350', { at: '2026-08-01T10:00:00.000Z' }),
      record('2340', { at: '2026-08-01T10:03:00.000Z' }),
    ]);

    expect(result.violations).toBe(1);
    expect(result.passed).toBe(false);
  });

  it('no compara entre restaurantes distintos', () => {
    const result = checkSequenceMonotonicity([
      record('2350', { at: '2026-08-01T10:00:00.000Z', restaurant: 'R1' }),
      record('1310', { at: '2026-08-01T10:03:00.000Z', restaurant: 'R2' }),
    ]);

    expect(result.pairs).toBe(0);
  });
});

describe('P2: estabilidad del prefijo por terminal', () => {
  it('pasa cuando cada terminal mantiene su prefijo y no lo comparte', () => {
    const result = checkTerminalStability([
      record('2301', { terminal: 'kiosco-A' }),
      record('2305', { terminal: 'kiosco-A' }),
      record('2309', { terminal: 'kiosco-A' }),
      record('1402', { terminal: 'kiosco-B' }),
    ]);

    expect(result.conflicts).toEqual([]);
    expect(result.passed).toBe(true);
  });

  it('detecta un mismo terminal con dos prefijos distintos', () => {
    const result = checkTerminalStability([
      record('2301', { terminal: 'kiosco-A' }),
      record('1405', { terminal: 'kiosco-A' }),
      record('2309', { terminal: 'kiosco-A' }),
      record('1902', { terminal: 'kiosco-B' }),
    ]);

    expect(result.conflicts[0].type).toBe('UNSTABLE_PREFIX');
    expect(result.passed).toBe(false);
  });

  it('detecta dos terminales compartiendo prefijo', () => {
    const result = checkTerminalStability([
      record('2301', { terminal: 'kiosco-A' }),
      record('2305', { terminal: 'kiosco-A' }),
      record('2308', { terminal: 'kiosco-A' }),
      record('2302', { terminal: 'kiosco-B' }),
    ]);

    expect(result.conflicts[0].type).toBe('SHARED_PREFIX');
  });

  it('ignora los registros sin terminal observado para no razonar en círculo', () => {
    const result = checkTerminalStability([record('2301'), record('1405')]);

    expect(result.observedRecords).toBe(0);
    expect(result.testable).toBe(false);
  });
});

describe('R1: anomalía del cero a la izquierda', () => {
  it('señala el conflicto cuando conviven 48 y 066', () => {
    const result = checkZeroPaddingAnomaly([record('48'), record('066')]);

    expect(result.conflicting).toBe(true);
    expect(result.resolved).toBe(false);
  });

  it('no hay conflicto si no conviven', () => {
    expect(checkZeroPaddingAnomaly([record('48'), record('352')]).resolved).toBe(true);
  });
});

describe('evaluateHypothesis', () => {
  it('con los datos actuales el veredicto es INSUFFICIENT_DATA', () => {
    const result = evaluateHypothesis({ records: [record('2323')] });

    expect(result.verdict).toBe(VERDICT.INSUFFICIENT_DATA);
    expect(result.canActivateNormalization).toBe(false);
  });

  it('un conflicto de prefijo comprobable refuta la hipótesis', () => {
    const result = evaluateHypothesis({
      records: [
        record('2301', { terminal: 'A' }),
        record('2305', { terminal: 'A' }),
        record('1405', { terminal: 'A' }),
        record('1902', { terminal: 'B' }),
      ],
    });

    expect(result.verdict).toBe(VERDICT.REFUTED);
    expect(result.canActivateNormalization).toBe(false);
  });

  it('nunca autoriza la normalización sin cobertura suficiente', () => {
    const records = Array.from({ length: 10 }, (_, i) =>
      record(`23${String(i).padStart(2, '0')}`, {
        at: `2026-08-01T10:${String(i).padStart(2, '0')}:00.000Z`,
        terminal: 'A',
      })
    );

    const result = evaluateHypothesis({ records });

    expect(result.coverage.enoughTickets).toBe(false);
    expect(result.canActivateNormalization).toBe(false);
  });
});
