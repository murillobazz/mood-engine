import type { Emotion } from '../types';
import type { DimPoints } from './dimensions';

type CookingEmotion = Emotion & { points: DimPoints };

// Toda emoção distribui exatamente 4 pontos. O quanto isso pesa perto das perguntas
// é decidido em src/weights.ts, não aqui.
export const emotions: readonly CookingEmotion[] = [
  { id: 'drained', label: 'drained. send help (carbs)', points: { calm: 3, cozy: 1 } },
  { id: 'homesick', label: 'a bit homesick', points: { cozy: 3, calm: 1 } },
  { id: 'restless', label: 'restless, need a project', points: { playful: 3, bold: 1 } },
  { id: 'buzzing', label: 'weirdly great, actually', points: { fresh: 2, playful: 2 } },
  { id: 'fed-up', label: 'fed up with everything', points: { bold: 3, fresh: 1 } },
];
