import type { Dimension } from '../types';

// Cinco eixos de "o que eu tô a fim de cozinhar". A ordem só importa como último critério de desempate.
export const dimensions = [
  { id: 'cozy', label: 'aconchego', blurb: 'quente, macio, um cobertor que dá pra comer' },
  { id: 'bold', label: 'intenso', blurb: 'ardência, umami, sabor que responde de volta' },
  { id: 'fresh', label: 'fresco', blurb: 'crocante, vivo, quase tudo verde' },
  { id: 'playful', label: 'mão na massa', blurb: 'um pouco de bagunça, divertido de fazer' },
  { id: 'calm', label: 'sossego', blurb: 'uma panela, pouco esforço, zero raciocínio' },
] as const satisfies readonly Dimension[];

export type DimensionId = (typeof dimensions)[number]['id'];
export type DimPoints = Partial<Record<DimensionId, number>>;
