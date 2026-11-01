import { recommend } from '../src/engine';
import type { Quiz, Weights } from '../src/types';

/** Algo que a pessoa escolhe: a emoção, ou uma pergunta. */
export interface Source {
  id: string;
  label: string;
  options: { id: string; label: string }[];
}

/** O que o motor devolveu para uma combinação de respostas. */
export interface Outcome {
  /** Ids dos itens, do melhor pro pior. */
  top: string[];
  profile: string;
}

/**
 * Toda combinação de respostas e o seu resultado.
 *
 * As combinações são numeradas em base mista: a fonte 0 (a emoção) é o "dígito" menos significativo.
 * Isso transforma "as mesmas respostas, mas trocando a pergunta 3" numa busca de índice em tempo constante,
 * que é a base das checagens de estabilidade e influência.
 */
export interface Simulation {
  sources: Source[];
  outcomes: Outcome[];
  itemIds: string[];
  profileIds: string[];
}

/**
 * Roda o motor em todas as combinações (sem limite de tempo, sem desejo: auditamos a pontuação
 * em si; os filtros têm checagem própria). 5 emoções x 4x4x3x4x4 respostas = 3.840 execuções.
 * Se um quiz passar de alguns milhões de combinações, troque isto por uma amostra aleatória com seed fixa.
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

/** Índice -> um índice de opção por fonte. */
export function decode(sources: readonly Source[], index: number): number[] {
  const digits: number[] = [];
  let rest = index;
  for (const source of sources) {
    digits.push(rest % source.options.length);
    rest = Math.floor(rest / source.options.length);
  }
  return digits;
}

/** O índice da mesma combinação, com a fonte `s` trocada para a opção `option`. */
export function swap(sources: readonly Source[], index: number, s: number, option: number): number {
  let stride = 1;
  for (let i = 0; i < s; i++) stride *= sources[i]!.options.length;
  const current = Math.floor(index / stride) % sources[s]!.options.length;
  return index + (option - current) * stride;
}

/** Chama `fn` para cada par (combinação, mesma combinação com exatamente uma resposta trocada). */
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
