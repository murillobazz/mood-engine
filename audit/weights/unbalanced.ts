import type { Weights } from '../../src/types';

/**
 * A deliberately bad weight set, kept around so the README's before/after is reproducible.
 *
 * It's the kind of thing that "seems to work" when you click through the demo a few times:
 * the emotion is shouted (x3) and the first question is doubled because it "felt important".
 * Run `pnpm audit:unbalanced` to see what the audit thinks of it.
 */
export const unbalancedWeights: Weights = {
  emotion: 3,
  questions: { weather: 2 },
  cravingBonus: 0.04,
};
