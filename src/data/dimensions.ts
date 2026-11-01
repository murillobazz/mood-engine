import type { Dimension } from '../types';

// Five axes of "what do i feel like cooking". Order matters only as the last tie-breaker.
export const dimensions = [
  { id: 'cozy', label: 'cozy', blurb: 'warm, soft, a blanket you can eat' },
  { id: 'bold', label: 'bold', blurb: 'heat, funk, flavors that talk back' },
  { id: 'fresh', label: 'fresh', blurb: 'crunchy, bright, mostly green' },
  { id: 'playful', label: 'playful', blurb: 'hands in the dough, a little mess, fun to make' },
  { id: 'calm', label: 'calm', blurb: 'one pan, low effort, no thinking required' },
] as const satisfies readonly Dimension[];

export type DimensionId = (typeof dimensions)[number]['id'];
export type DimPoints = Partial<Record<DimensionId, number>>;
