import type { Dimension } from '../types';

// Cinco eixos de "o que eu tô a fim de cozinhar". A ordem só importa como último critério de desempate.
export const dimensions = [
  { id: 'cozy', label: 'cozy', blurb: 'warm, soft, a blanket you can eat' },
  { id: 'bold', label: 'bold', blurb: 'heat, funk, flavors that talk back' },
  { id: 'fresh', label: 'fresh', blurb: 'crunchy, bright, mostly green' },
  { id: 'playful', label: 'playful', blurb: 'hands in the dough, a little mess, fun to make' },
  { id: 'calm', label: 'calm', blurb: 'one pan, low effort, no thinking required' },
] as const satisfies readonly Dimension[];

export type DimensionId = (typeof dimensions)[number]['id'];
export type DimPoints = Partial<Record<DimensionId, number>>;
