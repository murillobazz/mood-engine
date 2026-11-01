import type { Input, Item, Points, Profile, Quiz, Reason, Recommendation, Result, Weights } from './types';
import { defaultWeights } from './weights';

/** Quantas recomendações um quiz devolve. */
export const TOP_N = 3;

/**
 * Passo 1. Transforma as respostas em pontuação por dimensão.
 *
 * score[d] = emotion.points[d] * weights.emotion + soma, em cada resposta, de option.points[d] * weights.questions[q]
 */
export function scoreAnswers(quiz: Quiz, input: Input, weights: Weights = defaultWeights): Record<string, number> {
  const scores = Object.fromEntries(quiz.dimensions.map((d) => [d.id, 0]));

  const emotion = quiz.emotions.find((e) => e.id === input.emotion);
  if (!emotion) throw new Error(`Emoção desconhecida "${input.emotion}"`);
  addPoints(scores, emotion.points, weights.emotion);

  for (const question of quiz.questions) {
    const optionId = input.answers[question.id];
    if (optionId === undefined) continue;
    const option = question.options.find((o) => o.id === optionId);
    if (!option) throw new Error(`Opção desconhecida "${optionId}" na pergunta "${question.id}"`);
    addPoints(scores, option.points, weights.questions[question.id] ?? 1);
  }

  return scores;
}

/**
 * Passo 2. As duas dimensões mais fortes dão nome ao perfil da pessoa.
 *
 * Empates são comuns (os pontos são inteiros pequenos), então são desfeitos de propósito, e não
 * por acaso da ordem do array: primeiro por quanto a emoção escolhida apontou para cada dimensão
 * (neste produto, o humor vem primeiro), depois pela ordem das dimensões nos dados.
 */
export function pickProfile(quiz: Quiz, scores: Points, emotionPoints: Points = {}): Profile {
  const ranked = quiz.dimensions
    .map((d, index) => ({ id: d.id, index, score: scores[d.id] ?? 0, mood: emotionPoints[d.id] ?? 0 }))
    .sort((a, b) => b.score - a.score || b.mood - a.mood || a.index - b.index);

  const [first, second] = ranked;
  if (!first || !second) throw new Error('Um quiz precisa de pelo menos duas dimensões');

  const profile = quiz.profiles.find((p) => p.dimensions.includes(first.id) && p.dimensions.includes(second.id));
  if (!profile) throw new Error(`Nenhum perfil para as dimensões "${first.id}" + "${second.id}"`);
  return profile;
}

/**
 * Passo 3. Ordena os itens pela proximidade entre a afinidade deles e a pontuação da pessoa.
 *
 * Usamos similaridade de cosseno, não produto escalar puro: o produto escalar premia itens que são
 * "um pouco de tudo", seja quem for que pergunte; o cosseno só olha o formato do match.
 * Itens acima do limite de tempo saem (filtro rígido). Itens com a tag desejada ganham
 * `weights.cravingBonus` a mais (preferência suave). Empates são desfeitos pelo id, então o resultado é estável.
 */
export function rankItems(
  quiz: Quiz,
  scores: Points,
  input: Pick<Input, 'maxMinutes' | 'craving'> = {},
  weights: Weights = defaultWeights,
  limit = TOP_N,
): Recommendation[] {
  const dims = quiz.dimensions.map((d) => d.id);
  const { maxMinutes, craving } = input;

  return quiz.items
    .filter((item) => maxMinutes == null || item.minutes <= maxMinutes)
    .map((item) => {
      const craved = craving != null && item.tags.includes(craving);
      const score = cosine(scores, item.affinity, dims) + (craved ? weights.cravingBonus : 0);
      return { item, score, reasons: explain(scores, item, dims), craved };
    })
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id))
    .slice(0, limit);
}

/** O quiz inteiro numa chamada: pontuação, perfil e o top 3 com o "porquê". */
export function recommend(quiz: Quiz, input: Input, weights: Weights = defaultWeights): Result {
  const scores = scoreAnswers(quiz, input, weights);
  const emotion = quiz.emotions.find((e) => e.id === input.emotion);
  return {
    scores,
    profile: pickProfile(quiz, scores, emotion?.points),
    top: rankItems(quiz, scores, input, weights),
  };
}

/**
 * O "porquê" de um match: dimensões em que a pessoa e o item são fortes.
 * Cada dimensão contribui share[d] * affinity[d]; ficamos com a maior e com qualquer outra
 * que tenha pelo menos metade dela, até duas.
 */
export function explain(scores: Points, item: Item, dims: readonly string[]): Reason[] {
  const total = dims.reduce((sum, d) => sum + (scores[d] ?? 0), 0);
  if (total === 0) return [];

  const reasons = dims
    .map((d) => ({ dimension: d, you: (scores[d] ?? 0) / total, item: item.affinity[d] ?? 0 }))
    .filter((r) => r.you * r.item > 0)
    .sort((a, b) => b.you * b.item - a.you * a.item);

  const best = reasons[0];
  if (!best) return [];
  return reasons.filter((r) => r.you * r.item >= (best.you * best.item) / 2).slice(0, 2);
}

function cosine(a: Points, b: Points, dims: readonly string[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const d of dims) {
    const x = a[d] ?? 0;
    const y = b[d] ?? 0;
    dot += x * y;
    normA += x * x;
    normB += y * y;
  }
  return normA === 0 || normB === 0 ? 0 : dot / Math.sqrt(normA * normB);
}

function addPoints(target: Record<string, number>, points: Points, weight: number): void {
  for (const [d, value] of Object.entries(points)) {
    if (!(d in target)) throw new Error(`Dimensão desconhecida "${d}"`);
    target[d] = (target[d] ?? 0) + value * weight;
  }
}
