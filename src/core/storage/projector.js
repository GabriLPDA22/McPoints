import {
  ORDER_SOURCE,
  FULFILLMENT_TYPE,
  COLLECTION_KEY_STRATEGY,
  COLLECTIBLE_SOURCES,
  DISCOVERY_OUTCOME,
  isKnownSource,
  isKnownFulfillment,
} from '../taxonomy/constants.js';
import { DEFAULT_PROJECTION } from './schema.js';

/**
 * Proyección de la colección a partir de los avistamientos.
 *
 * La colección NO se persiste: se calcula. Cambiar la estrategia de clave o la
 * versión de reglas y volver a proyectar es todo lo que hace falta para adoptar
 * una interpretación nueva del número, sin migrar ni perder nada.
 * Ver Docs/design/number-model.md.
 */

/**
 * Clave de colección de un avistamiento.
 *
 * Con `RAW` la clave es el número tal cual, conservando ceros a la izquierda:
 * `066` y `66` se tratan como números distintos porque no sabemos si lo son.
 * Ver la anomalía del cero en Docs/research/domain-findings.md §1.8.
 */
export function collectionKeyFor(sighting, keyStrategy = COLLECTION_KEY_STRATEGY.RAW) {
  if (keyStrategy === COLLECTION_KEY_STRATEGY.SEQUENCE) {
    const sequence = sighting.interpretation?.sequence;
    if (sequence != null) return String(sequence).padStart(2, '0');
  }
  return sighting.rawNumber;
}

function touchTally(tally, value, timestamp) {
  const current = tally[value];
  if (!current) {
    tally[value] = { count: 1, firstAt: timestamp, lastAt: timestamp };
    return;
  }
  current.count += 1;
  if (timestamp < current.firstAt) current.firstAt = timestamp;
  if (timestamp > current.lastAt) current.lastAt = timestamp;
}

function createEntry(key, keyStrategy, sighting) {
  return {
    key,
    keyStrategy,
    firstSeenAt: sighting.capturedAt,
    lastSeenAt: sighting.capturedAt,
    sightingCount: 0,
    sightingIds: [],
    sourcesSeen: {},
    fulfillmentsSeen: {},
    rawNumbersSeen: [],
  };
}

function applySighting(entry, sighting) {
  entry.sightingCount += 1;
  entry.sightingIds.push(sighting.id);

  if (sighting.capturedAt < entry.firstSeenAt) entry.firstSeenAt = sighting.capturedAt;
  if (sighting.capturedAt > entry.lastSeenAt) entry.lastSeenAt = sighting.capturedAt;

  if (!entry.rawNumbersSeen.includes(sighting.rawNumber)) {
    entry.rawNumbersSeen.push(sighting.rawNumber);
  }

  const source = sighting.source?.value ?? ORDER_SOURCE.UNKNOWN;
  if (isKnownSource(source)) {
    touchTally(entry.sourcesSeen, source, sighting.capturedAt);
  }

  const fulfillment = sighting.fulfillment?.value ?? FULFILLMENT_TYPE.UNKNOWN;
  if (isKnownFulfillment(fulfillment)) {
    touchTally(entry.fulfillmentsSeen, fulfillment, sighting.capturedAt);
  }
}

/**
 * Reconstruye todas las entradas de colección desde cero.
 * Es una función pura: mismos avistamientos y misma configuración, mismo resultado.
 */
export function projectCollection(sightings = [], projection = DEFAULT_PROJECTION) {
  const keyStrategy = projection.keyStrategy ?? COLLECTION_KEY_STRATEGY.RAW;
  const entries = {};

  for (const sighting of sightings) {
    if (!sighting?.rawNumber) continue;

    const key = collectionKeyFor(sighting, keyStrategy);
    if (!key) continue;

    if (!entries[key]) entries[key] = createEntry(key, keyStrategy, sighting);
    applySighting(entries[key], sighting);
  }

  return entries;
}

/**
 * Qué significa este avistamiento respecto a lo que ya había. Se evalúa CONTRA
 * el estado previo, así que hay que llamarlo antes de añadir el avistamiento.
 */
export function evaluateDiscovery(previousEntry, sighting) {
  const source = sighting.source?.value ?? ORDER_SOURCE.UNKNOWN;
  const sourceIsKnown = isKnownSource(source);

  if (!previousEntry) {
    return {
      outcome: DISCOVERY_OUTCOME.NEW_NUMBER,
      isNewNumber: true,
      isNewSource: sourceIsKnown,
      source,
      sourceIsKnown,
      previousCount: 0,
    };
  }

  const isNewSource = sourceIsKnown && !previousEntry.sourcesSeen[source];

  return {
    outcome: isNewSource ? DISCOVERY_OUTCOME.NEW_SOURCE : DISCOVERY_OUTCOME.DUPLICATE,
    isNewNumber: false,
    isNewSource,
    source,
    sourceIsKnown,
    previousCount: previousEntry.sightingCount,
  };
}

/** Orígenes coleccionables que aún faltan en una entrada. Alimenta la UI de "te faltan". */
export function missingSourcesFor(entry) {
  if (!entry) return [...COLLECTIBLE_SOURCES];
  return COLLECTIBLE_SOURCES.filter((source) => !entry.sourcesSeen[source]);
}

/** Origen principal de una entrada: el primero que se consiguió. */
export function primarySourceOf(entry) {
  const seen = Object.entries(entry?.sourcesSeen ?? {});
  if (seen.length === 0) return ORDER_SOURCE.UNKNOWN;
  return seen.sort(([, a], [, b]) => a.firstAt.localeCompare(b.firstAt))[0][0];
}

/** Recuento por origen sobre toda la colección, para la home y las estadísticas. */
export function tallyBySource(entries) {
  const totals = {};
  let unclassified = 0;

  for (const entry of Object.values(entries)) {
    const sources = Object.keys(entry.sourcesSeen);
    if (sources.length === 0) {
      unclassified += 1;
      continue;
    }
    for (const source of sources) {
      totals[source] = (totals[source] ?? 0) + 1;
    }
  }

  return { totals, unclassified };
}
