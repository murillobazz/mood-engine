/**
 * pnpm audit:engine                       -> audita os pesos usados, grava audit/reports/default.md
 * pnpm audit:engine --weights unbalanced  -> audita o exemplo ruim, grava audit/reports/unbalanced.md
 * use --strict para sair com código 1 quando algo for sinalizado (útil em CI).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { quiz } from '../src/data';
import type { Weights } from '../src/types';
import { defaultWeights } from '../src/weights';
import { buildReport } from './report';
import { simulate } from './simulate';
import { unbalancedWeights } from './weights/unbalanced';

const WEIGHT_SETS: Record<string, Weights> = {
  default: defaultWeights,
  unbalanced: unbalancedWeights,
};

const { values } = parseArgs({
  options: {
    weights: { type: 'string', default: 'default' },
    strict: { type: 'boolean', default: false },
  },
});

const name = values.weights;
const weights = WEIGHT_SETS[name];
if (!weights) {
  console.error(`Unknown weight set "${name}". Try: ${Object.keys(WEIGHT_SETS).join(', ')}`);
  process.exit(2);
}

const started = performance.now();
const sim = simulate(quiz, weights);
const { flags, markdown } = buildReport(quiz, weights, sim, name);

const out = join(dirname(fileURLToPath(import.meta.url)), 'reports', `${name}.md`);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, markdown);

const ms = Math.round(performance.now() - started);
console.log(`audited ${sim.outcomes.length} combos in ${ms}ms -> ${out}`);
console.log(flags.length ? `${flags.length} flag(s):\n${flags.map((f) => `  - [${f.check}] ${f.message}`).join('\n')}` : 'no flags.');

if (values.strict && flags.length) process.exit(1);
