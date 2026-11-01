import type { Weights } from './types';

/**
 * The shipped weights. Every number that shapes a recommendation is here, on purpose:
 * if it isn't in this file, the audit can't see it and nobody can argue about it.
 *
 * Raw points live in the data (src/data). Each emotion hands out 4 points and each
 * answer hands out 3, so within a question no option is "louder" than another.
 * These weights decide how loud each *source* is relative to the others.
 */
export const defaultWeights: Weights = {
  // The emotion is the front door of the quiz, so it counts a bit more than any single
  // question (4 pts x 1.25 = 5 vs 3). The audit allows it up to 2x its fair share of
  // influence; at 1.25 it sits comfortably under that. At 3 it swallowed the quiz
  // (see audit/reports/unbalanced.md).
  emotion: 1.25,

  // Every question counts the same. Bump one only with a reason and a fresh audit.
  questions: {},

  // Scores are cosine similarities (0..1) and the top items usually sit within ~0.1 of each
  // other. 0.04 nudges a craved dish up a spot or two; it doesn't override the mood.
  cravingBonus: 0.04,
};
