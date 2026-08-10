#!/usr/bin/env node
/**
 * Evalúa la hipótesis terminal|secuencia contra un dataset exportado desde la app
 * (Ajustes → Contribuir al dataset).
 *
 *   node scripts/analyze-hypothesis.mjs mcpoints_dataset_2026-08-10.json
 *
 * El criterio está fijado en Docs/research/hypothesis-validation.md y no debe
 * ajustarse después de ver estos resultados.
 */
import { readFileSync } from 'node:fs';
import { evaluateHypothesis, MIN_REQUIREMENTS, VERDICT } from '../src/core/dataset/hypothesis.js';

const [, , path] = process.argv;

if (!path) {
  console.error('Uso: node scripts/analyze-hypothesis.mjs <dataset.json>');
  process.exit(1);
}

const dataset = JSON.parse(readFileSync(path, 'utf8'));
const { verdict, coverage, predictions } = evaluateHypothesis(dataset);
const { p1, p2, r1 } = predictions;

const mark = (ok) => (ok ? 'OK  ' : 'FALLA');

console.log(`\nDataset: ${path}`);
console.log(`Registros: ${coverage.totalTickets} · Restaurantes: ${coverage.restaurants}\n`);

console.log('Cobertura');
console.log(
  `  ${mark(coverage.enoughTickets)} tickets      ${coverage.totalTickets}/${MIN_REQUIREMENTS.totalTickets}`
);
console.log(
  `  ${mark(coverage.enoughRestaurants)} restaurantes ${coverage.restaurants}/${MIN_REQUIREMENTS.restaurants}`
);

console.log('\nP1 — monotonía de la secuencia');
if (p1.pairs === 0) {
  console.log('  Sin pares comparables (hacen falta varios tickets del mismo restaurante y día).');
} else {
  console.log(
    `  ${mark(p1.passed)} ${p1.pairs - p1.violations}/${p1.pairs} pares correctos (${Math.round(p1.ratio * 100)}%)`
  );
  for (const ex of p1.examples) console.log(`      retroceso: ${ex.from} -> ${ex.to}`);
}

console.log('\nP2 — estabilidad del prefijo por terminal');
if (!p2.testable) {
  console.log(
    `  No comprobable todavía: ${p2.observedRecords} registros con terminal anotado, ${p2.distinctTerminals} terminales distintos.`
  );
  console.log(
    `  Hacen falta ${MIN_REQUIREMENTS.distinctTerminals} terminales y ${MIN_REQUIREMENTS.sameTerminalTickets} tickets de uno de ellos.`
  );
} else {
  console.log(`  ${mark(p2.passed)} ${p2.conflicts.length} conflictos`);
  for (const conflict of p2.conflicts) console.log(`      ${JSON.stringify(conflict)}`);
}

console.log('\nR1 — anomalía del cero a la izquierda');
if (r1.conflicting) {
  console.log(
    `  FALLA conviven ${r1.unpaddedExamples.join(', ')} con ${r1.paddedExamples.join(', ')}`
  );
  console.log('      Explica el formato antes de activar nada (domain-findings.md §1.8).');
} else {
  console.log('  OK   sin conflicto de formato en esta muestra');
}

console.log(`\nVEREDICTO: ${verdict}`);
if (verdict === VERDICT.SUPPORTED) {
  console.log('Se cumplen los criterios. Sube RULES_VERSION y activa la interpretación.');
} else if (verdict === VERDICT.REFUTED) {
  console.log('La hipótesis queda refutada. Documenta qué la tumbó en domain-findings.md.');
} else {
  console.log('Sigue recogiendo tickets. La app continúa guardando el número sin interpretar.');
}
console.log('');
