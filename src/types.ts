/** Points or affinities keyed by dimension id. Missing keys count as 0. */
export type Points = Readonly<Record<string, number>>;

/** A named axis of taste, e.g. "cozy" or "fresh". */
export interface Dimension {
  id: string;
  label: string;
  blurb: string;
}

/** One pickable answer. Choosing it adds its points to the person's dimension scores. */
export interface Option {
  id: string;
  label: string;
  points: Points;
}

/** The first screen: how are you feeling? Same shape as an answer, weighted separately. */
export type Emotion = Option;

export interface Question {
  id: string;
  prompt: string;
  options: readonly Option[];
}

/** A label for a person, defined by their two strongest dimensions. */
export interface Profile {
  id: string;
  name: string;
  blurb: string;
  dimensions: readonly [string, string];
}

/** Something we can recommend. `affinity` says how well it fits each dimension, from 0 to 1. */
export interface Item {
  id: string;
  name: string;
  blurb: string;
  minutes: number;
  tags: readonly string[];
  affinity: Points;
}

export interface TimeLimit {
  label: string;
  /** null means "no limit". */
  minutes: number | null;
}

export interface Craving {
  /** Matches an item tag. */
  tag: string;
  label: string;
}

/** Everything the engine needs to run a quiz. Pure data, no behaviour. */
export interface Quiz {
  dimensions: readonly Dimension[];
  emotions: readonly Emotion[];
  questions: readonly Question[];
  profiles: readonly Profile[];
  items: readonly Item[];
  timeLimits: readonly TimeLimit[];
  cravings: readonly Craving[];
}

/** Every number that changes the outcome. See src/weights.ts for the shipped values and why. */
export interface Weights {
  /** Multiplier on the chosen emotion's points. */
  emotion: number;
  /** Per-question multiplier. Questions not listed use 1. */
  questions: Readonly<Record<string, number>>;
  /** Added to an item's score (0..1 scale) when it carries the craved tag. */
  cravingBonus: number;
}

/** What a person told us. */
export interface Input {
  emotion: string;
  /** questionId -> optionId. Unanswered questions add nothing. */
  answers: Readonly<Record<string, string>>;
  /** Hard filter: items that take longer are dropped, not just penalised. */
  maxMinutes?: number | null;
  /** Soft preference: items with this tag get a small bonus. */
  craving?: string | null;
}

/** One line of "why": a dimension where the person and the item meet. */
export interface Reason {
  dimension: string;
  /** Share of the person's total score in this dimension (0..1). */
  you: number;
  /** The item's affinity for this dimension (0..1). */
  item: number;
}

export interface Recommendation {
  item: Item;
  /** Similarity between person and item (0..1), plus the craving bonus if any. */
  score: number;
  reasons: Reason[];
  craved: boolean;
}

export interface Result {
  scores: Record<string, number>;
  profile: Profile;
  top: Recommendation[];
}
