import { create } from 'zustand';
import {
  loadRepository,
  saveSightings,
  savePreferences,
  saveMeta,
  exportData,
  importData,
  resetAll,
} from '../storage/repository.js';
import { createSighting, reclassifySighting, DEFAULT_PROJECTION } from '../storage/schema.js';
import {
  projectCollection,
  collectionKeyFor,
  evaluateDiscovery,
  tallyBySource,
} from '../storage/projector.js';
import { DEFAULT_DOMAIN } from '../detection/rules.js';

function sortByCapture(sightings) {
  return [...sightings].sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
}

export const useAppStore = create((set, get) => ({
  hydrated: false,
  meta: null,
  /** Hechos persistidos. Fuente de verdad. */
  sightings: [],
  /** Colección derivada de `sightings`. Nunca se persiste. */
  entries: {},
  preferences: { theme: 'system', language: 'es', disclaimerAccepted: false },

  hydrate: async () => {
    const data = await loadRepository();
    const projection = data.meta?.projection ?? DEFAULT_PROJECTION;

    set({
      hydrated: true,
      meta: data.meta,
      sightings: data.sightings,
      entries: projectCollection(data.sightings, projection),
      preferences: data.preferences,
    });
  },

  getProjection: () => get().meta?.projection ?? DEFAULT_PROJECTION,
  getDomain: () => get().meta?.domain ?? DEFAULT_DOMAIN,

  getEntry: (key) => get().entries[key],
  getEntryCount: () => Object.keys(get().entries).length,
  getSightingCount: () => get().sightings.length,

  /** Avistamientos de una entrada, del más reciente al más antiguo. */
  getSightingsFor: (key) => {
    const { entries, sightings } = get();
    const ids = new Set(entries[key]?.sightingIds ?? []);
    return sightings.filter((s) => ids.has(s.id)).reverse();
  },

  getSourceStats: () => tallyBySource(get().entries),

  /**
   * Registra un avistamiento. Devuelve qué significa respecto a la colección
   * previa (número nuevo, origen nuevo o duplicado) para que la UI de
   * descubrimiento pueda reaccionar.
   */
  addSighting: async (input) => {
    const state = get();
    const projection = state.meta?.projection ?? DEFAULT_PROJECTION;

    const sighting = createSighting(input);
    if (!sighting.rawNumber) return null;

    const key = collectionKeyFor(sighting, projection.keyStrategy);
    const discovery = evaluateDiscovery(state.entries[key], sighting);

    const sightings = sortByCapture([...state.sightings, sighting]);
    const entries = projectCollection(sightings, projection);

    await saveSightings(sightings);
    set({ sightings, entries });

    return { ...discovery, key, sighting, entry: entries[key] };
  },

  /**
   * Clasificación manual. Se marca como USER_SELECTED para no contaminar la
   * evaluación del motor con etiquetas puestas a mano.
   */
  reclassifySighting: async (sightingId, classification) => {
    const state = get();
    const projection = state.meta?.projection ?? DEFAULT_PROJECTION;

    const sightings = state.sightings.map((sighting) =>
      sighting.id === sightingId ? reclassifySighting(sighting, classification) : sighting
    );

    await saveSightings(sightings);
    set({ sightings, entries: projectCollection(sightings, projection) });
  },

  /** Elimina una entrada y todos los avistamientos que la componen. */
  removeEntry: async (key) => {
    const state = get();
    const projection = state.meta?.projection ?? DEFAULT_PROJECTION;
    const ids = new Set(state.entries[key]?.sightingIds ?? []);
    if (ids.size === 0) return;

    const sightings = state.sightings.filter((sighting) => !ids.has(sighting.id));

    await saveSightings(sightings);
    set({ sightings, entries: projectCollection(sightings, projection) });
  },

  /**
   * Reconstruye la colección con otra estrategia de clave. Es el mecanismo que
   * permitirá adoptar la interpretación terminal|secuencia el día que se valide,
   * sin migrar ni perder datos. Ver Docs/research/hypothesis-validation.md.
   */
  reproject: async (projection) => {
    const state = get();
    const nextProjection = { ...(state.meta?.projection ?? DEFAULT_PROJECTION), ...projection };
    const meta = { ...state.meta, projection: nextProjection };

    await saveMeta(meta);
    set({ meta, entries: projectCollection(state.sightings, nextProjection) });
  },

  setPreferences: async (prefs) => {
    const preferences = { ...get().preferences, ...prefs };
    await savePreferences(preferences);
    set({ preferences });
  },

  exportCollection: () => exportData(get()),

  importCollection: async (parsed) => {
    const state = get();
    const projection = state.meta?.projection ?? DEFAULT_PROJECTION;
    const sightings = importData(parsed, state);

    await saveSightings(sightings);
    set({ sightings, entries: projectCollection(sightings, projection) });
  },

  resetCollection: async () => {
    await resetAll();
    set({ sightings: [], entries: {} });
  },
}));
