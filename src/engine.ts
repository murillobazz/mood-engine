import type { Input, Item, Points, Profile, Quiz, Reason, Recommendation, Result, Weights } from './types';
import { defaultWeights } from './weights';

/** How many recommendations a quiz returns. */
export const TOP_N = 3;

/**
 * Step 1. Turn answers into dimension scores.
 *
 * score[d] = emotion.points[d] * weights.emotion + sum over answers of option.points[d] * weights.questions[q]
 */
export function scoreAnswers(quiz: Quiz, input: Input, weights: Weights = defaultWeights): Record<string, number> {
  const scores = Object.fromEntries(quiz.dimensions.map((d) => [d.id, 0]));

  const emotion = quiz.emotions.find((e) => e.id === input.emotion);
  if (!emotion) throw new Error(`Unknown emotion "${input.emotion}"`);
  addPoints(scores, emotion.points, weights.emotion);

  for (const question of quiz.questions) {
    const optionId = input.answers[question.id];
    if (optionId === undefined) continue;
    const option = question.options.find((o) => o.id === optionId);
    if (!option) throw new Error(`Unknown option "${optionId}" for question "${question.id}"`);
    addPoints(scores, option.points, weights.questions[question.id] ?? 1);
  }

  return scores;
}

/**
 * Step 2. The two strongest dimensions name the person's profile.
 *
 * Ties are common (points are small integers), so they're broken on purpose, not by
 * accident of array order: first by how much the chosen emotion pointed at each dimension
 * (mood comes first in this product), then by dimension order in the data.
 */
export function pickProfile(quiz: Quiz, scores: Points, emotionPoints: Points = {}): Profile {
  const ranked = quiz.dimensions
    .map((d, index) => ({ id: d.id, index, score: scores[d.id] ?? 0, mood: emotionPoints[d.id] ?? 0 }))
    .sort((a, b) => b.score - a.score || b.mood - a.mood || a.index - b.index);

  const [first, second] = ranked;
  if (!first || !second) throw new Error('A quiz needs at least two dimensions');

  const profile = quiz.profiles.find((p) => p.dimensions.includes(first.id) && p.dimensions.includes(second.id));
  if (!profile) throw new Error(`No profile for dimensions "${first.id}" + "${second.id}"`);
  return profile;
}

/**
 * Step 3. Rank items by how close their affinity is to the person's scores.
 *
 * We use cosine similarity, not a plain dot product: a dot product rewards items that are
 * "a bit of everything" no matter who's asking, cosine only cares about the shape of the match.
 * Items over the time limit are removed (hard filter). Items with the craved tag get
 * `weights.cravingBonus` on top (soft preference). Ties break by id, so results are stable.
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

/** The whole quiz in one call: scores, profile and the top 3 with their "why". */
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
 * The "why" behind a match: dimensions where both the person and the item are strong.
 * Each dimension contributes share[d] * affinity[d]; we keep the biggest one and anything
 * at least half as big, up to two.
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
    if (!(d in target)) throw new Error(`Unknown dimension "${d}"`);
    target[d] = (target[d] ?? 0) + value * weight;
  }
}
