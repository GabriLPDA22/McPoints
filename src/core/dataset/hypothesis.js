/**
 * Herramientas de análisis de la hipótesis `valor = terminal * 100 + secuencia`.
 *
 * IMPORTANTE: nada de este módulo se usa en la app. Solo analiza un dataset
 * exportado para decidir si la hipótesis puede activarse algún día. Mientras el
 * veredicto no sea SUPPORTED, la app sigue guardando el número tal cual.
 *
 * El criterio está fijado por adelantado en Docs/research/hypothesis-validation.md
 * precisamente para no poder ajustarlo después de ver los resultados.
 */

export const MIN_REQUIREMENTS = {
  totalTickets: 40,
  restaurants: 3,
  sameTerminalTickets: 3,
  distinctTerminals: 2,
  monotonicRatio: 0.9,
};

export const VERDICT = {
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA',
  REFUTED: 'REFUTED',
  SUPPORTED: 'SUPPORTED',
};

/** Partición hipotética del número. Solo para análisis, nunca se persiste. */
export function splitCandidate(rawNumber) {
  const digits = String(rawNumber ?? '').replace(/\D/g, '');
  if (digits.length < 2) return null;

  const value = parseInt(digits, 10);
  return {
    terminal: Math.floor(value / 100),
    sequence: value % 100,
    padded: digits.length > 1 && digits.startsWith('0'),
    digits: digits.length,
  };
}

function groupBy(records, keyFn) {
  const groups = new Map();
  for (const record of records) {
    const key = keyFn(record);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  }
  return groups;
}

function sessionKey(record) {
  return `${record.restaurant ?? 'unknown'}|${record.capturedAt.slice(0, 10)}`;
}

/**
 * P1 — La secuencia debe avanzar con el tiempo dentro de un mismo restaurante y
 * día. Un retroceso grande se interpreta como que el contador pasó de 99 a 00;
 * un retroceso pequeño es una violación.
 */
export function checkSequenceMonotonicity(records) {
  let pairs = 0;
  let violations = 0;
  const examples = [];

  for (const [, group] of groupBy(records, sessionKey)) {
    const ordered = [...group].sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));

    for (let i = 1; i < ordered.length; i += 1) {
      const previous = splitCandidate(ordered[i - 1].rawNumber);
      const current = splitCandidate(ordered[i].rawNumber);
      if (!previous || !current) continue;

      pairs += 1;
      const delta = current.sequence - previous.sequence;
      const isWrap = delta < -50;

      if (delta < 0 && !isWrap) {
        violations += 1;
        if (examples.length < 5) {
          examples.push({ from: ordered[i - 1].rawNumber, to: ordered[i].rawNumber });
        }
      }
    }
  }

  const ratio = pairs === 0 ? null : (pairs - violations) / pairs;

  return {
    id: 'P1',
    pairs,
    violations,
    ratio,
    examples,
    passed: ratio !== null && ratio >= MIN_REQUIREMENTS.monotonicRatio,
  };
}

/**
 * P2 — El prefijo debe ser estable por terminal físico y distinto entre
 * terminales. Es la predicción decisiva y no admite excepciones.
 *
 * Solo se consideran registros con `observedTerminal`, es decir, aquellos en los
 * que la persona anotó qué máquina usó. Deducir el terminal del número y luego
 * comprobar que coincide con lo deducido sería circular.
 */
export function checkTerminalStability(records) {
  const observed = records.filter((r) => r.observedTerminal != null);
  const byTerminal = groupBy(observed, (r) => `${r.restaurant ?? 'unknown'}|${r.observedTerminal}`);

  const conflicts = [];
  const prefixOwners = new Map();

  for (const [key, group] of byTerminal) {
    const prefixes = new Set();

    for (const record of group) {
      const split = splitCandidate(record.rawNumber);
      if (split) prefixes.add(split.terminal);
    }

    // Un mismo terminal con dos prefijos distintos refuta la hipótesis.
    if (prefixes.size > 1) {
      conflicts.push({ type: 'UNSTABLE_PREFIX', terminal: key, prefixes: [...prefixes] });
      continue;
    }

    const [prefix] = [...prefixes];
    if (prefix === undefined) continue;

    // Dos terminales distintos del mismo restaurante compartiendo prefijo
    // también la refutan.
    const owner = prefixOwners.get(prefix);
    if (owner && owner !== key) {
      conflicts.push({ type: 'SHARED_PREFIX', prefix, terminals: [owner, key] });
    } else {
      prefixOwners.set(prefix, key);
    }
  }

  const distinctTerminals = byTerminal.size;
  const enoughSamples = [...byTerminal.values()].some(
    (group) => group.length >= MIN_REQUIREMENTS.sameTerminalTickets
  );

  return {
    id: 'P2',
    observedRecords: observed.length,
    distinctTerminals,
    conflicts,
    testable: distinctTerminals >= MIN_REQUIREMENTS.distinctTerminals && enoughSamples,
    passed:
      conflicts.length === 0 &&
      distinctTerminals >= MIN_REQUIREMENTS.distinctTerminals &&
      enoughSamples,
  };
}

/**
 * R1 — La anomalía del cero a la izquierda. Si conviven números de 2 dígitos sin
 * relleno y números de 3 dígitos con cero inicial, la fórmula no explica el
 * formato por sí sola y hace falta una explicación antes de aplicarla.
 * Ver Docs/research/domain-findings.md §1.8.
 */
export function checkZeroPaddingAnomaly(records) {
  const unpadded = records.filter((r) => splitCandidate(r.rawNumber)?.digits === 2);
  const padded = records.filter((r) => {
    const split = splitCandidate(r.rawNumber);
    return split?.digits === 3 && split.padded;
  });

  const conflicting = unpadded.length > 0 && padded.length > 0;

  return {
    id: 'R1',
    unpaddedExamples: unpadded.slice(0, 5).map((r) => r.rawNumber),
    paddedExamples: padded.slice(0, 5).map((r) => r.rawNumber),
    conflicting,
    // Se resuelve cuando ya no conviven, o cuando la explicación se documenta a
    // mano en la investigación. Automáticamente solo detectamos el conflicto.
    resolved: !conflicting,
  };
}

export function checkCoverage(records) {
  const restaurants = new Set(records.map((r) => r.restaurant ?? 'unknown'));

  return {
    totalTickets: records.length,
    restaurants: restaurants.size,
    enoughTickets: records.length >= MIN_REQUIREMENTS.totalTickets,
    enoughRestaurants: restaurants.size >= MIN_REQUIREMENTS.restaurants,
  };
}

/**
 * Veredicto global. Solo devuelve SUPPORTED cuando se cumplen todos los
 * criterios fijados de antemano. Ante la duda, INSUFFICIENT_DATA.
 */
export function evaluateHypothesis(dataset) {
  const records = (dataset?.records ?? []).filter((r) => r.rawNumber);

  const coverage = checkCoverage(records);
  const p1 = checkSequenceMonotonicity(records);
  const p2 = checkTerminalStability(records);
  const r1 = checkZeroPaddingAnomaly(records);

  let verdict = VERDICT.INSUFFICIENT_DATA;

  if (p2.testable && p2.conflicts.length > 0) {
    verdict = VERDICT.REFUTED;
  } else if (
    coverage.enoughTickets &&
    coverage.enoughRestaurants &&
    p1.passed &&
    p2.passed &&
    r1.resolved
  ) {
    verdict = VERDICT.SUPPORTED;
  }

  return {
    verdict,
    canActivateNormalization: verdict === VERDICT.SUPPORTED,
    coverage,
    predictions: { p1, p2, r1 },
  };
}
