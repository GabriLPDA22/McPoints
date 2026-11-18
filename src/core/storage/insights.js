import { COLLECTIBLE_SOURCES } from '../taxonomy/constants.js';
import { collectionKeyFor } from './projector.js';

/**
 * Lecturas derivadas de la colección para la UI. Funciones puras: no tocan el
 * store ni el almacenamiento, así se pueden probar sin React.
 */

export const SIGHTING_KIND = Object.freeze({
  /** Primer avistamiento del número. */
  NEW: 'NEW',
  /** Número ya conocido, pero por un origen coleccionable que no tenía. */
  NEW_SOURCE: 'NEW_SOURCE',
  /** Nada nuevo. */
  REPEAT: 'REPEAT',
});

/**
 * Qué aportó cada avistamiento en el momento en que se hizo.
 * Se recorre en orden cronológico, así que el resultado es estable aunque el
 * array de entrada no venga ordenado.
 *
 * @returns {Map<string, keyof SIGHTING_KIND>} id de avistamiento → tipo
 */
export function classifySightings(sightings, keyStrategy) {
  const ordered = [...sightings].sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
  const seenSources = new Map();
  const result = new Map();

  for (const sighting of ordered) {
    const key = collectionKeyFor(sighting, keyStrategy);
    const source = sighting.source?.value;
    const known = seenSources.get(key);

    if (!known) {
      seenSources.set(key, new Set(COLLECTIBLE_SOURCES.includes(source) ? [source] : []));
      result.set(sighting.id, SIGHTING_KIND.NEW);
    } else if (COLLECTIBLE_SOURCES.includes(source) && !known.has(source)) {
      known.add(source);
      result.set(sighting.id, SIGHTING_KIND.NEW_SOURCE);
    } else {
      result.set(sighting.id, SIGHTING_KIND.REPEAT);
    }
  }

  return result;
}

/**
 * Día natural en la zona horaria del dispositivo (YYYY-MM-DD).
 * `toISOString().slice(0, 10)` usa UTC: en España, un pedido a las 00:30 caía
 * en el día anterior.
 */
export function localDayKey(dateLike) {
  const d = new Date(dateLike);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Números descubiertos (primer avistamiento) en los últimos `days` días. */
export function countNewSince(entries, days, now = Date.now()) {
  const since = now - days * 86400000;
  return Object.values(entries).filter((e) => new Date(e.firstSeenAt).getTime() >= since).length;
}

/** Tiene los cinco orígenes coleccionables. */
export function isComplete(entry) {
  return COLLECTIBLE_SOURCES.every((source) => !!entry?.sourcesSeen?.[source]);
}

export function countComplete(entries) {
  return Object.values(entries).filter(isComplete).length;
}

export const ALBUM_BLOCK_SIZE = 100;

/**
 * Álbum por bloques de 100 (0–99, 100–199, …, 2300–2399).
 *
 * No hay un rango "oficial" de números (ver Docs/research/domain-findings.md),
 * así que solo existen los bloques donde hay al menos un número. Si la
 * hipótesis terminal*100 + secuencia es cierta, cada bloque es una caja o un
 * kiosco concreto.
 *
 * `066` y `66` caen en la misma casilla (66): la casilla guarda todas las
 * claves que la ocupan para no perder ninguna.
 *
 * @returns {{ start: number, end: number, count: number, slots: Map<number, object[]> }[]}
 */
export function buildAlbum(entries) {
  const blocks = new Map();

  for (const entry of Object.values(entries)) {
    if (!/^\d+$/.test(entry.key)) continue;
    const n = Number(entry.key);
    const start = Math.floor(n / ALBUM_BLOCK_SIZE) * ALBUM_BLOCK_SIZE;

    if (!blocks.has(start)) blocks.set(start, new Map());
    const slots = blocks.get(start);
    if (!slots.has(n)) slots.set(n, []);
    slots.get(n).push(entry);
  }

  return [...blocks.entries()]
    .sort(([a], [b]) => a - b)
    .map(([start, slots]) => ({
      start,
      end: start + ALBUM_BLOCK_SIZE - 1,
      count: slots.size,
      slots,
    }));
}
