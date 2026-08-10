import localforage from 'localforage';
import { DETECTION_METHOD, ORDER_SOURCE, FULFILLMENT_TYPE } from '../taxonomy/constants.js';
import { SCHEMA_VERSION, DEFAULT_PROJECTION, createSighting, createPreferences } from './schema.js';
import { DEFAULT_DOMAIN } from '../detection/rules.js';

const STORAGE_NAME = 'McPoints';
const STORE_NAME = 'mcpoints_data_v2';

localforage.config({
  name: STORAGE_NAME,
  storeName: STORE_NAME,
  description: 'McPoints storage',
});

export const LEGACY_KEY = 'collectedNumbers';
export const BACKUP_KEY = 'collectedNumbers_backup_v1';

const KEYS = {
  meta: 'meta',
  sightings: 'sightings',
  preferences: 'preferences',
  // Claves v3. Se leen para migrar y no se borran, por si hay que volver atrás.
  legacyNumbers: 'numbers',
  legacyEvents: 'events',
};

export async function getItem(key) {
  try {
    return await localforage.getItem(key);
  } catch (e) {
    console.error('Storage getItem error', key, e);
    return null;
  }
}

export async function setItem(key, value) {
  try {
    await localforage.setItem(key, value);
    return true;
  } catch (e) {
    console.error('Storage setItem error', key, e);
    return false;
  }
}

const V3_METHOD_MAP = {
  scan: DETECTION_METHOD.OCR,
  manual: DETECTION_METHOD.MANUAL,
  unknown: DETECTION_METHOD.MIGRATED,
};

/**
 * Reproduce exactamente la normalización que aplicaba la v1 al migrar desde
 * `collectedNumbers`. Se usa para invertirla: sabiendo qué valor v3 produjo cada
 * clave original, podemos devolver el número tal y como estaba impreso.
 */
function replayV1Normalization(key) {
  const digits = String(key).replace(/\D/g, '');
  if (!digits) return null;

  let value = parseInt(digits, 10);
  if (Number.isNaN(value)) return null;

  if (digits.length === 4 && value > 999) {
    value = parseInt(digits.slice(-3), 10);
  }
  if (value < 0 || value > 999) return null;

  return String(value).padStart(3, '0');
}

/**
 * Índice { valorV3 -> numeroOriginal } a partir del respaldo v1.
 *
 * La v1 guardaba `0090` como `090` y `2323` como `323`, perdiendo el original.
 * Si dos claves originales colapsaron en el mismo valor v3, la recuperación es
 * ambigua y se descarta: preferimos conservar el dato imperfecto antes que
 * elegir uno de los dos al azar.
 */
export function buildLegacyRawIndex(legacyMap) {
  if (!legacyMap || typeof legacyMap !== 'object') return {};

  const index = {};
  const ambiguous = new Set();

  for (const [key, collected] of Object.entries(legacyMap)) {
    if (!collected) continue;

    const digits = String(key).replace(/\D/g, '');
    const normalized = replayV1Normalization(key);
    if (!digits || !normalized) continue;

    if (index[normalized] && index[normalized] !== digits) {
      ambiguous.add(normalized);
      continue;
    }
    index[normalized] = digits;
  }

  for (const key of ambiguous) delete index[key];
  return index;
}

function resolveRawNumber(storedValue, explicitRaw, legacyIndex) {
  const explicit = String(explicitRaw ?? '').replace(/\D/g, '');
  const stored = String(storedValue ?? '').replace(/\D/g, '');

  // Un rawNumber que difiere del valor almacenado es información real: la v3 ya
  // lo había capturado del ticket.
  if (explicit && explicit !== stored) return explicit;

  return legacyIndex[stored] ?? stored;
}

function sightingFromV3Event(event, legacyIndex) {
  const confidence = event.confidence ?? {};

  return createSighting({
    id: event.id,
    rawNumber: resolveRawNumber(event.numberValue, event.rawNumber, legacyIndex),
    capturedAt: event.timestamp,
    detectionMethod: V3_METHOD_MAP[event.method] ?? DETECTION_METHOD.MIGRATED,
    orderNumberConfidence: confidence.orderNumber ?? confidence.overall ?? null,
    source: {
      value: event.source ?? ORDER_SOURCE.UNKNOWN,
      origin: event.classificationOrigin,
      confidence: confidence.source ?? null,
    },
    fulfillment: {
      value: event.fulfillment ?? FULFILLMENT_TYPE.UNKNOWN,
      confidence: confidence.fulfillment ?? null,
    },
    evidence: { keywords: event.evidenceKeywords ?? [] },
  });
}

function sightingFromV3Number(number, legacyIndex) {
  return createSighting({
    rawNumber: resolveRawNumber(number.value, null, legacyIndex),
    capturedAt: number.firstCollectedAt,
    detectionMethod: V3_METHOD_MAP[number.firstMethod] ?? DETECTION_METHOD.MIGRATED,
  });
}

/**
 * Migración a v4. Es aditiva: convierte lo que había en avistamientos y, de
 * paso, recupera los números originales que la v1 había truncado. No reinterpreta
 * nada con reglas no verificadas — todo lo migrado queda con origen UNKNOWN.
 */
export async function migrateToV4() {
  const meta = await getItem(KEYS.meta);
  if (meta?.schemaVersion >= SCHEMA_VERSION) {
    return { migrated: false, meta };
  }

  const [legacyV1, backupV1, v3Numbers, v3Events] = await Promise.all([
    getItem(LEGACY_KEY),
    getItem(BACKUP_KEY),
    getItem(KEYS.legacyNumbers),
    getItem(KEYS.legacyEvents),
  ]);

  // El respaldo es la fuente preferida: si ya se migró a v3, la clave legacy
  // original pudo quedar intacta pero el respaldo es el que se escribió a propósito.
  const legacySource = backupV1 ?? legacyV1;
  if (legacyV1 && !backupV1) await setItem(BACKUP_KEY, legacyV1);

  const legacyIndex = buildLegacyRawIndex(legacySource);
  const sightings = [];
  const numbersWithEvents = new Set();

  for (const event of v3Events ?? []) {
    if (!event?.numberValue) continue;
    sightings.push(sightingFromV3Event(event, legacyIndex));
    numbersWithEvents.add(event.numberValue);
  }

  // Un número sin ningún evento asociado sigue siendo un hecho: se conserva con
  // un avistamiento sintético en su fecha de alta.
  for (const number of Object.values(v3Numbers ?? {})) {
    if (!number?.value || numbersWithEvents.has(number.value)) continue;
    sightings.push(sightingFromV3Number(number, legacyIndex));
  }

  // Caso de una instalación v1 pura que nunca llegó a migrar a v3.
  if (sightings.length === 0 && legacySource) {
    for (const [key, collected] of Object.entries(legacySource)) {
      const digits = String(key).replace(/\D/g, '');
      if (!collected || !digits) continue;
      sightings.push(
        createSighting({ rawNumber: digits, detectionMethod: DETECTION_METHOD.MIGRATED })
      );
    }
  }

  sightings.sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));

  const newMeta = {
    schemaVersion: SCHEMA_VERSION,
    domain: DEFAULT_DOMAIN,
    projection: DEFAULT_PROJECTION,
    migratedFrom: meta?.schemaVersion ? `v${meta.schemaVersion}` : legacySource ? 'v1' : null,
    migratedAt: new Date().toISOString(),
    recoveredRawNumbers: Object.keys(legacyIndex).length,
  };

  await setItem(KEYS.sightings, sightings);
  await setItem(KEYS.meta, newMeta);

  return { migrated: true, meta: newMeta, sightings };
}

export async function loadRepository() {
  await migrateToV4();

  const [meta, sightings, preferences] = await Promise.all([
    getItem(KEYS.meta),
    getItem(KEYS.sightings),
    getItem(KEYS.preferences),
  ]);

  return {
    meta: meta ?? {
      schemaVersion: SCHEMA_VERSION,
      domain: DEFAULT_DOMAIN,
      projection: DEFAULT_PROJECTION,
    },
    sightings: sightings ?? [],
    preferences: createPreferences(preferences ?? {}),
  };
}

export async function saveSightings(sightings) {
  return setItem(KEYS.sightings, sightings);
}

export async function savePreferences(preferences) {
  return setItem(KEYS.preferences, preferences);
}

export async function saveMeta(meta) {
  return setItem(KEYS.meta, meta);
}

export function exportData({ meta, sightings }) {
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    domain: meta?.domain ?? DEFAULT_DOMAIN,
    projection: meta?.projection ?? DEFAULT_PROJECTION,
    sightings,
  };
}

/**
 * Importa una copia. Acepta v4, v3 y el formato plano v1, y deduplica por id
 * para que reimportar el mismo archivo no multiplique los avistamientos.
 */
export function importData(parsed, current) {
  const existing = current.sightings ?? [];
  const byId = new Map(existing.map((sighting) => [sighting.id, sighting]));

  const incoming = [];

  if (Array.isArray(parsed?.sightings)) {
    incoming.push(...parsed.sightings.map((sighting) => createSighting(sighting)));
  } else if (Array.isArray(parsed?.events) || Array.isArray(parsed?.numbers)) {
    const legacyIndex = {};
    for (const event of parsed.events ?? []) {
      if (event?.numberValue) incoming.push(sightingFromV3Event(event, legacyIndex));
    }
    const seen = new Set(incoming.map((s) => s.rawNumber));
    for (const number of parsed.numbers ?? []) {
      if (number?.value && !seen.has(number.value)) {
        incoming.push(sightingFromV3Number(number, legacyIndex));
      }
    }
  } else if (parsed && typeof parsed === 'object') {
    for (const [key, collected] of Object.entries(parsed)) {
      const digits = String(key).replace(/\D/g, '');
      if (!collected || !digits) continue;
      incoming.push(
        createSighting({ rawNumber: digits, detectionMethod: DETECTION_METHOD.IMPORTED })
      );
    }
  }

  for (const sighting of incoming) {
    if (!byId.has(sighting.id)) byId.set(sighting.id, sighting);
  }

  return [...byId.values()].sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
}

export async function resetAll() {
  await setItem(KEYS.sightings, []);
}

export { SCHEMA_VERSION, KEYS };
