import type { Emotion } from '../types';
import type { DimPoints } from './dimensions';

type CookingEmotion = Emotion & { points: DimPoints };

// Toda emoção distribui exatamente 4 pontos. O quanto isso pesa perto das perguntas
// é decidido em src/weights.ts, não aqui.
export const emotions: readonly CookingEmotion[] = [
  { id: 'drained', label: 'no bagaço. mandem ajuda (carboidrato)', points: { calm: 3, cozy: 1 } },
  { id: 'homesick', label: 'com saudade de casa', points: { cozy: 3, calm: 1 } },
  { id: 'restless', label: 'com bicho-carpinteiro, preciso de um projeto', points: { playful: 3, bold: 1 } },
  { id: 'buzzing', label: 'estranhamente feliz, na real', points: { fresh: 2, playful: 2 } },
  { id: 'fed-up', label: 'de saco cheio de tudo', points: { bold: 3, fresh: 1 } },
];
