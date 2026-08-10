import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('localforage', () => {
  const store = new Map();
  return {
    default: {
      config: vi.fn(),
      getItem: vi.fn((key) => Promise.resolve(store.get(key) ?? null)),
      setItem: vi.fn((key, val) => {
        store.set(key, val);
        return Promise.resolve(val);
      }),
      removeItem: vi.fn((key) => {
        store.delete(key);
        return Promise.resolve();
      }),
      clear: vi.fn(() => {
        store.clear();
        return Promise.resolve();
      }),
      _store: store,
    },
  };
});

import localforage from 'localforage';
import { migrateToV4, buildLegacyRawIndex, importData, exportData } from './repository.js';
import { SCHEMA_VERSION } from './schema.js';

function v3Number(value, overrides = {}) {
  return {
    id: `n-${value}`,
    value,
    firstCollectedAt: '2026-08-01T10:00:00.000Z',
    lastSeenAt: '2026-08-01T10:00:00.000Z',
    collectionCount: 1,
    firstMethod: 'unknown',
    migrated: true,
    sourcesSeen: [],
    ...overrides,
  };
}

function v3Event(value, overrides = {}) {
  return {
    id: `e-${value}`,
    numberValue: value,
    timestamp: '2026-08-01T10:00:00.000Z',
    method: 'unknown',
    outcome: 'new',
    confidence: { overall: null, orderNumber: null, source: null, fulfillment: null },
    rawNumber: value,
    source: 'UNKNOWN',
    fulfillment: 'UNKNOWN',
    interpretation: null,
    classificationOrigin: 'UNKNOWN',
    evidenceKeywords: [],
    ...overrides,
  };
}

beforeEach(() => {
  localforage._store.clear();
  vi.clearAllMocks();
});

describe('buildLegacyRawIndex', () => {
  it('mapea el valor truncado por la v1 de vuelta al número original', () => {
    const index = buildLegacyRawIndex({ '0090': true, 2323: true, 48: true });

    expect(index['090']).toBe('0090');
    expect(index['323']).toBe('2323');
    expect(index['048']).toBe('48');
  });

  it('descarta la recuperación cuando es ambigua en vez de elegir al azar', () => {
    // '0090' y '090' colapsaban ambos en '090': no se puede saber cuál era.
    const index = buildLegacyRawIndex({ '0090': true, '090': true });

    expect(index['090']).toBeUndefined();
  });

  it('ignora las entradas no coleccionadas', () => {
    const index = buildLegacyRawIndex({ '0090': false, 2323: true });

    expect(index['090']).toBeUndefined();
    expect(index['323']).toBe('2323');
  });
});

describe('migración a v4', () => {
  it('recupera los números originales que la v1 había truncado', async () => {
    await localforage.setItem('meta', { schemaVersion: 3 });
    await localforage.setItem('collectedNumbers_backup_v1', { '0090': true, 2323: true });
    await localforage.setItem('numbers', {
      '090': v3Number('090'),
      323: v3Number('323'),
    });
    await localforage.setItem('events', [v3Event('090'), v3Event('323')]);

    const { migrated, sightings } = await migrateToV4();

    expect(migrated).toBe(true);
    const raws = sightings.map((s) => s.rawNumber).sort();
    expect(raws).toEqual(['0090', '2323']);
  });

  it('no inventa un original cuando no hay respaldo del que recuperarlo', async () => {
    await localforage.setItem('meta', { schemaVersion: 3 });
    await localforage.setItem('numbers', { '042': v3Number('042') });
    await localforage.setItem('events', [v3Event('042')]);

    const { sightings } = await migrateToV4();

    expect(sightings).toHaveLength(1);
    expect(sightings[0].rawNumber).toBe('042');
  });

  it('conserva el rawNumber que la v3 ya había capturado del ticket', async () => {
    await localforage.setItem('meta', { schemaVersion: 3 });
    await localforage.setItem('events', [v3Event('323', { rawNumber: '2323', method: 'scan' })]);

    const { sightings } = await migrateToV4();

    expect(sightings[0].rawNumber).toBe('2323');
    expect(sightings[0].detectionMethod).toBe('OCR');
  });

  it('deja todo lo migrado como UNKNOWN, sin reinterpretar con reglas no verificadas', async () => {
    await localforage.setItem('meta', { schemaVersion: 3 });
    await localforage.setItem('events', [v3Event('2323', { rawNumber: '2323' })]);

    const { sightings } = await migrateToV4();
    const [sighting] = sightings;

    expect(sighting.source.value).toBe('UNKNOWN');
    expect(sighting.source.origin).toBe('UNKNOWN');
    expect(sighting.fulfillment.value).toBe('UNKNOWN');
    expect(sighting.interpretation).toBeNull();
  });

  it('migra una instalación v1 pura que nunca pasó por v3', async () => {
    await localforage.setItem('collectedNumbers', { 2323: true, 48: true });

    const { migrated, sightings } = await migrateToV4();

    expect(migrated).toBe(true);
    expect(sightings.map((s) => s.rawNumber).sort()).toEqual(['2323', '48']);
    // el respaldo se escribe para poder volver atrás
    expect(await localforage.getItem('collectedNumbers_backup_v1')).toEqual({
      2323: true,
      48: true,
    });
  });

  it('conserva los números que existían sin ningún evento asociado', async () => {
    await localforage.setItem('meta', { schemaVersion: 3 });
    await localforage.setItem('numbers', { '042': v3Number('042'), 156: v3Number('156') });
    await localforage.setItem('events', [v3Event('042')]);

    const { sightings } = await migrateToV4();

    expect(sightings.map((s) => s.rawNumber).sort()).toEqual(['042', '156']);
  });

  it('es idempotente', async () => {
    await localforage.setItem('collectedNumbers', { 2323: true });

    const first = await migrateToV4();
    const second = await migrateToV4();

    expect(first.migrated).toBe(true);
    expect(second.migrated).toBe(false);
    expect(await localforage.getItem('sightings')).toHaveLength(1);
  });

  it('no borra las claves v3, por si hay que volver atrás', async () => {
    await localforage.setItem('meta', { schemaVersion: 3 });
    await localforage.setItem('numbers', { '042': v3Number('042') });

    await migrateToV4();

    expect(await localforage.getItem('numbers')).not.toBeNull();
  });
});

describe('exportación e importación', () => {
  it('reimportar la misma copia no duplica avistamientos', () => {
    const current = {
      meta: { schemaVersion: SCHEMA_VERSION },
      sightings: [
        {
          id: 'a',
          rawNumber: '2323',
          capturedAt: '2026-08-01T10:00:00.000Z',
          source: { value: 'KIOSK' },
        },
      ],
    };

    const backup = exportData(current);
    const merged = importData(backup, current);

    expect(merged).toHaveLength(1);
  });

  it('importa el formato plano v1 conservando el número tal cual', () => {
    const merged = importData({ 2323: true, '0090': true }, { sightings: [] });

    expect(merged.map((s) => s.rawNumber).sort()).toEqual(['0090', '2323']);
    expect(merged.every((s) => s.detectionMethod === 'IMPORTED')).toBe(true);
  });
});
