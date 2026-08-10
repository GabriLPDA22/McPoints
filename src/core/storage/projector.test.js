import { describe, it, expect } from 'vitest';
import { createSighting } from './schema.js';
import {
  projectCollection,
  collectionKeyFor,
  evaluateDiscovery,
  missingSourcesFor,
  primarySourceOf,
  tallyBySource,
} from './projector.js';
import { COLLECTION_KEY_STRATEGY, DISCOVERY_OUTCOME } from '../taxonomy/constants.js';

function sighting(rawNumber, source, capturedAt) {
  return createSighting({
    rawNumber,
    capturedAt,
    source: source ? { value: source, confidence: 0.9 } : undefined,
  });
}

describe('collectionKeyFor', () => {
  it('usa el número tal cual con la estrategia RAW', () => {
    const s = sighting('2323', 'KIOSK', '2026-08-01T10:00:00.000Z');
    expect(collectionKeyFor(s, COLLECTION_KEY_STRATEGY.RAW)).toBe('2323');
  });

  it('conserva los ceros a la izquierda: 066 no es 66', () => {
    const withZero = sighting('066', null, '2026-08-01T10:00:00.000Z');
    const without = sighting('66', null, '2026-08-01T10:00:00.000Z');

    expect(collectionKeyFor(withZero)).toBe('066');
    expect(collectionKeyFor(without)).toBe('66');
  });

  it('cae a RAW si se pide SEQUENCE pero no hay interpretación', () => {
    const s = sighting('2323', 'KIOSK', '2026-08-01T10:00:00.000Z');
    expect(collectionKeyFor(s, COLLECTION_KEY_STRATEGY.SEQUENCE)).toBe('2323');
  });

  it('usa la secuencia cuando la interpretación existe', () => {
    const s = createSighting({
      rawNumber: '2323',
      interpretation: { terminal: 23, sequence: 23 },
    });
    expect(collectionKeyFor(s, COLLECTION_KEY_STRATEGY.SEQUENCE)).toBe('23');
  });
});

describe('projectCollection', () => {
  it('agrupa avistamientos del mismo número y acumula sus orígenes', () => {
    const entries = projectCollection([
      sighting('2323', 'KIOSK', '2026-08-01T10:00:00.000Z'),
      sighting('2323', 'DRIVE_THRU', '2026-08-03T10:00:00.000Z'),
      sighting('48', 'KIOSK', '2026-08-02T10:00:00.000Z'),
    ]);

    expect(Object.keys(entries).sort()).toEqual(['2323', '48']);
    expect(entries['2323'].sightingCount).toBe(2);
    expect(Object.keys(entries['2323'].sourcesSeen).sort()).toEqual(['DRIVE_THRU', 'KIOSK']);
    expect(entries['2323'].firstSeenAt).toBe('2026-08-01T10:00:00.000Z');
    expect(entries['2323'].lastSeenAt).toBe('2026-08-03T10:00:00.000Z');
  });

  it('no registra UNKNOWN como origen conseguido', () => {
    const entries = projectCollection([sighting('2323', null, '2026-08-01T10:00:00.000Z')]);

    expect(entries['2323'].sourcesSeen).toEqual({});
    expect(entries['2323'].sightingCount).toBe(1);
  });

  it('es pura: los mismos avistamientos producen el mismo resultado', () => {
    const input = [
      sighting('2323', 'KIOSK', '2026-08-01T10:00:00.000Z'),
      sighting('48', 'COUNTER', '2026-08-02T10:00:00.000Z'),
    ];

    expect(projectCollection(input)).toEqual(projectCollection(input));
  });

  it('reproyectar con SEQUENCE colapsa números distintos sin tocar los avistamientos', () => {
    const input = [
      createSighting({
        rawNumber: '2323',
        capturedAt: '2026-08-01T10:00:00.000Z',
        source: { value: 'KIOSK' },
        interpretation: { terminal: 23, sequence: 23 },
      }),
      createSighting({
        rawNumber: '1323',
        capturedAt: '2026-08-02T10:00:00.000Z',
        source: { value: 'COUNTER' },
        interpretation: { terminal: 13, sequence: 23 },
      }),
    ];

    const raw = projectCollection(input, { keyStrategy: COLLECTION_KEY_STRATEGY.RAW });
    const sequence = projectCollection(input, { keyStrategy: COLLECTION_KEY_STRATEGY.SEQUENCE });

    expect(Object.keys(raw)).toHaveLength(2);
    expect(Object.keys(sequence)).toEqual(['23']);
    expect(sequence['23'].rawNumbersSeen.sort()).toEqual(['1323', '2323']);
    // los avistamientos originales siguen intactos
    expect(input[0].rawNumber).toBe('2323');
  });
});

describe('evaluateDiscovery', () => {
  it('marca NEW_NUMBER cuando la clave no existía', () => {
    const result = evaluateDiscovery(undefined, sighting('2323', 'KIOSK'));

    expect(result.outcome).toBe(DISCOVERY_OUTCOME.NEW_NUMBER);
    expect(result.isNewNumber).toBe(true);
  });

  it('marca NEW_SOURCE cuando el número ya estaba pero el origen no', () => {
    const entries = projectCollection([sighting('2323', 'KIOSK', '2026-08-01T10:00:00.000Z')]);
    const result = evaluateDiscovery(entries['2323'], sighting('2323', 'DRIVE_THRU'));

    expect(result.outcome).toBe(DISCOVERY_OUTCOME.NEW_SOURCE);
    expect(result.isNewSource).toBe(true);
  });

  it('marca DUPLICATE cuando número y origen ya estaban', () => {
    const entries = projectCollection([sighting('2323', 'KIOSK', '2026-08-01T10:00:00.000Z')]);
    const result = evaluateDiscovery(entries['2323'], sighting('2323', 'KIOSK'));

    expect(result.outcome).toBe(DISCOVERY_OUTCOME.DUPLICATE);
    expect(result.previousCount).toBe(1);
  });

  it('un origen desconocido sobre un número existente no cuenta como variante nueva', () => {
    const entries = projectCollection([sighting('2323', 'KIOSK', '2026-08-01T10:00:00.000Z')]);
    const result = evaluateDiscovery(entries['2323'], sighting('2323', null));

    expect(result.outcome).toBe(DISCOVERY_OUTCOME.DUPLICATE);
    expect(result.isNewSource).toBe(false);
  });
});

describe('ayudas de colección', () => {
  it('missingSourcesFor lista los orígenes que faltan', () => {
    const entries = projectCollection([sighting('2323', 'KIOSK', '2026-08-01T10:00:00.000Z')]);

    expect(missingSourcesFor(entries['2323'])).toEqual([
      'COUNTER',
      'MOBILE_APP',
      'DRIVE_THRU',
      'DELIVERY',
    ]);
  });

  it('primarySourceOf devuelve el primero conseguido, no el último', () => {
    const entries = projectCollection([
      sighting('2323', 'DRIVE_THRU', '2026-08-03T10:00:00.000Z'),
      sighting('2323', 'KIOSK', '2026-08-01T10:00:00.000Z'),
    ]);

    expect(primarySourceOf(entries['2323'])).toBe('KIOSK');
  });

  it('tallyBySource cuenta números por origen y los sin clasificar aparte', () => {
    const entries = projectCollection([
      sighting('2323', 'KIOSK', '2026-08-01T10:00:00.000Z'),
      sighting('2323', 'COUNTER', '2026-08-02T10:00:00.000Z'),
      sighting('48', 'KIOSK', '2026-08-02T10:00:00.000Z'),
      sighting('66', null, '2026-08-02T10:00:00.000Z'),
    ]);

    const { totals, unclassified } = tallyBySource(entries);

    expect(totals.KIOSK).toBe(2);
    expect(totals.COUNTER).toBe(1);
    expect(unclassified).toBe(1);
  });
});
