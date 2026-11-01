import type { Option, Question } from '../types';
import type { DimPoints } from './dimensions';

type CookingQuestion = Question & { options: readonly (Option & { points: DimPoints })[] };

// Toda opção distribui exatamente 3 pontos, então nenhuma resposta grita mais que as irmãs.
// A checagem de orçamento de pontos da auditoria acusa se isso sair do trilho.
export const questions: readonly CookingQuestion[] = [
  {
    id: 'weather',
    prompt: "what's the weather doing?",
    options: [
      { id: 'drizzle', label: 'grey and drizzly', points: { cozy: 2, calm: 1 } },
      { id: 'heatwave', label: 'stupidly hot', points: { fresh: 3 } },
      { id: 'crisp', label: 'crisp and sunny', points: { fresh: 1, playful: 2 } },
      { id: 'storm', label: 'full thunderstorm', points: { bold: 2, cozy: 1 } },
    ],
  },
  {
    id: 'company',
    prompt: "who's eating?",
    options: [
      { id: 'solo', label: 'just me, on the couch', points: { calm: 2, cozy: 1 } },
      { id: 'plus-one', label: 'me and one other human', points: { cozy: 1, bold: 1, playful: 1 } },
      { id: 'crowd', label: 'a loud table of friends', points: { playful: 2, bold: 1 } },
      { id: 'impress', label: 'someone i want to impress', points: { fresh: 2, bold: 1 } },
    ],
  },
  {
    id: 'dishes',
    prompt: 'how do you feel about washing up?',
    options: [
      { id: 'one-pan', label: 'one pan. maximum.', points: { calm: 3 } },
      { id: 'whatever', label: "future me's problem", points: { playful: 2, bold: 1 } },
      { id: 'someone-else', label: 'someone else is washing', points: { bold: 2, fresh: 1 } },
    ],
  },
  {
    id: 'soundtrack',
    prompt: 'pick the soundtrack',
    options: [
      { id: 'lofi', label: 'lo-fi and rain on the window', points: { calm: 2, cozy: 1 } },
      { id: 'records', label: "your parents' old records", points: { cozy: 3 } },
      { id: 'brass', label: 'anything with a horn section', points: { bold: 2, playful: 1 } },
      { id: 'birds', label: 'windows open, birds doing their thing', points: { fresh: 2, calm: 1 } },
    ],
  },
  {
    id: 'appetite',
    prompt: "where's your appetite at?",
    options: [
      { id: 'peckish', label: 'barely there', points: { fresh: 2, calm: 1 } },
      { id: 'normal', label: 'normal human amount', points: { cozy: 1, fresh: 1, bold: 1 } },
      { id: 'starving', label: 'could eat a door', points: { cozy: 2, bold: 1 } },
      { id: 'grazing', label: 'snacky. i want to graze.', points: { playful: 2, fresh: 1 } },
    ],
  },
];
