import { recommend } from '../src/engine';
import type { Quiz, Weights } from '../src/types';

/** Something the person picks: the emotion, or one question. */
export interface Source {
  id: string;
  label: string;
  options: { id: string; label: string }[];
}

/** What the engine returned for one combination of answers. */
export interface Outcome {
  /** Item ids, best first. */
  top: string[];
  profile: string;
}

/**
 * Every combination of answers and its outcome.
 *
 * Combinations are numbered in mixed radix: source 0 (the emotion) is the lowest "digit".
 * That makes "the same answers, but change question 3" a constant-time index lookup,
 * which is what the stability and influence checks lean on.
 */
export interface Simulation {
  sources: Source[];
  outcomes: Outcome[];
  itemIds: string[];
  profileIds: string[];
}

/**
 * Runs the engine on every combination (no time limit, no craving: we audit the scoring
 * itself; filters get their own check). 5 emotions x 4x4x3x4x4 answers = 3,840 runs.
 * If a quiz ever grows past a few million combinations, swap this for a seeded random sample.
 */
export function simulate(quiz: Quiz, weights: Weights): Simulation {
  const sources: Source[] = [
    { id: 'emotion', label: 'emotion', options: quiz.emotions.map(({ id, label }) => ({ id, label })) },
    ...quiz.questions.map((q) => ({ id: q.id, label: q.prompt, options: q.options.map(({ id, label }) => ({ id, label })) })),
  ];

  const total = sources.reduce((n, s) => n * s.options.length, 1);
  const outcomes: Outcome[] = [];

  for (let index = 0; index < total; index++) {
    const digits = decode(sources, index);
    const [emotion, ...answers] = digits.map((d, i) => sources[i]!.options[d]!.id);
    const result = recommend(
      quiz,
      { emotion: emotion!, answers: Object.fromEntries(quiz.questions.map((q, i) => [q.id, answers[i]!])) },
      weights,
    );
    outcomes.push({ top: result.top.map((r) => r.item.id), profile: result.profile.id });
  }

  return {
    sources,
    outcomes,
    itemIds: quiz.items.map((i) => i.id),
    profileIds: quiz.profiles.map((p) => p.id),
  };
}

/** Index -> one option index per source. */
export function decode(sources: readonly Source[], index: number): number[] {
  const digits: number[] = [];
  let rest = index;
  for (const source of sources) {
    digits.push(rest % source.options.length);
    rest = Math.floor(rest / source.options.length);
  }
  return digits;
}

/** The index of the same combination with source `s` switched to option `option`. */
export function swap(sources: readonly Source[], index: number, s: number, option: number): number {
  let stride = 1;
  for (let i = 0; i < s; i++) stride *= sources[i]!.options.length;
  const current = Math.floor(index / stride) % sources[s]!.options.length;
  return index + (option - current) * stride;
}

/** Calls `fn` for every pair (combination, same combination with exactly one answer changed). */
export function forEachNeighbor(sim: Simulation, fn: (a: Outcome, b: Outcome, source: number) => void): void {
  sim.outcomes.forEach((outcome, index) => {
    const digits = decode(sim.sources, index);
    sim.sources.forEach((source, s) => {
      for (let option = 0; option < source.options.length; option++) {
        if (option === digits[s]) continue;
        fn(outcome, sim.outcomes[swap(sim.sources, index, s, option)]!, s);
      }
    });
  });
}
