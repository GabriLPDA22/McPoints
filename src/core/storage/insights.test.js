import { describe, it, expect } from 'vitest';
import {
  classifySightings,
  SIGHTING_KIND,
  localDayKey,
  countNewSince,
  isComplete,
  buildAlbum,
} from './insights.js';

const s = (id, rawNumber, source, capturedAt) => ({
  id,
  rawNumber,
  source: { value: source },
  capturedAt,
});

describe('classifySightings', () => {
  it('marca nuevo, origen nuevo y repetido en orden cronológico', () => {
    const sightings = [
      s('c', '107', 'KIOSK', '2026-11-03T10:00:00Z'),
      s('a', '107', 'COUNTER', '2026-11-01T10:00:00Z'),
      s('b', '107', 'COUNTER', '2026-11-02T10:00:00Z'),
      s('d', '200', 'UNKNOWN', '2026-11-04T10:00:00Z'),
      s('e', '200', 'UNKNOWN', '2026-11-05T10:00:00Z'),
    ];
    const kinds = classifySightings(sightings);
    expect(kinds.get('a')).toBe(SIGHTING_KIND.NEW);
    expect(kinds.get('b')).toBe(SIGHTING_KIND.REPEAT);
    expect(kinds.get('c')).toBe(SIGHTING_KIND.NEW_SOURCE);
    expect(kinds.get('d')).toBe(SIGHTING_KIND.NEW);
    // Un origen desconocido nunca cuenta como origen nuevo.
    expect(kinds.get('e')).toBe(SIGHTING_KIND.REPEAT);
  });
});

describe('localDayKey', () => {
  it('usa la fecha local, no UTC', () => {
    const d = new Date(2026, 10, 18, 0, 30);
    expect(localDayKey(d)).toBe('2026-11-18');
  });
});

describe('countNewSince', () => {
  it('cuenta los descubiertos en la ventana', () => {
    const now = Date.parse('2026-11-18T12:00:00Z');
    const entries = {
      a: { firstSeenAt: '2026-11-17T12:00:00Z' },
      b: { firstSeenAt: '2026-11-01T12:00:00Z' },
    };
    expect(countNewSince(entries, 7, now)).toBe(1);
  });
});

describe('isComplete', () => {
  it('exige los cinco orígenes coleccionables', () => {
    const all = { KIOSK: 1, COUNTER: 1, MOBILE_APP: 1, DRIVE_THRU: 1, DELIVERY: 1 };
    expect(isComplete({ sourcesSeen: all })).toBe(true);
    expect(isComplete({ sourcesSeen: { KIOSK: 1 } })).toBe(false);
  });
});

describe('buildAlbum', () => {
  it('agrupa por bloques de 100 y solo crea los bloques con números', () => {
    const entries = {
      4: { key: '4' },
      '066': { key: '066' },
      66: { key: '66' },
      2326: { key: '2326' },
      2399: { key: '2399' },
    };
    const album = buildAlbum(entries);
    expect(album.map((b) => b.start)).toEqual([0, 2300]);
    expect(album[0].count).toBe(2);
    expect(album[0].slots.get(66).map((e) => e.key).sort()).toEqual(['066', '66']);
    expect(album[1]).toMatchObject({ start: 2300, end: 2399, count: 2 });
  });
});
