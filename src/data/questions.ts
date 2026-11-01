import type { Option, Question } from '../types';
import type { DimPoints } from './dimensions';

type CookingQuestion = Question & { options: readonly (Option & { points: DimPoints })[] };

// Toda opção distribui exatamente 3 pontos, então nenhuma resposta grita mais que as irmãs.
// A checagem de orçamento de pontos da auditoria acusa se isso sair do trilho.
export const questions: readonly CookingQuestion[] = [
  {
    id: 'weather',
    prompt: 'como tá o tempo aí?',
    options: [
      { id: 'drizzle', label: 'cinza e garoando', points: { cozy: 2, calm: 1 } },
      { id: 'heatwave', label: 'um calor absurdo', points: { fresh: 3 } },
      { id: 'crisp', label: 'fresquinho e com sol', points: { fresh: 1, playful: 2 } },
      { id: 'storm', label: 'temporal dos bons', points: { bold: 2, cozy: 1 } },
    ],
  },
  {
    id: 'company',
    prompt: 'quem vai comer?',
    options: [
      { id: 'solo', label: 'só eu, no sofá', points: { calm: 2, cozy: 1 } },
      { id: 'plus-one', label: 'eu e mais um ser humano', points: { cozy: 1, bold: 1, playful: 1 } },
      { id: 'crowd', label: 'uma mesa barulhenta de amigos', points: { playful: 2, bold: 1 } },
      { id: 'impress', label: 'alguém que eu quero impressionar', points: { fresh: 2, bold: 1 } },
    ],
  },
  {
    id: 'dishes',
    prompt: 'e a louça, como fica?',
    options: [
      { id: 'one-pan', label: 'uma panela. no máximo.', points: { calm: 3 } },
      { id: 'whatever', label: 'problema do eu de amanhã', points: { playful: 2, bold: 1 } },
      { id: 'someone-else', label: 'outra pessoa vai lavar', points: { bold: 2, fresh: 1 } },
    ],
  },
  {
    id: 'soundtrack',
    prompt: 'escolha a trilha sonora',
    options: [
      { id: 'lofi', label: 'lo-fi e chuva na janela', points: { calm: 2, cozy: 1 } },
      { id: 'records', label: 'os discos velhos dos seus pais', points: { cozy: 3 } },
      { id: 'brass', label: 'qualquer coisa com naipe de metais', points: { bold: 2, playful: 1 } },
      { id: 'birds', label: 'janela aberta, passarinho cantando', points: { fresh: 2, calm: 1 } },
    ],
  },
  {
    id: 'appetite',
    prompt: 'e a fome, como tá?',
    options: [
      { id: 'peckish', label: 'quase nenhuma', points: { fresh: 2, calm: 1 } },
      { id: 'normal', label: 'fome de gente normal', points: { cozy: 1, fresh: 1, bold: 1 } },
      { id: 'starving', label: 'comeria uma porta', points: { cozy: 2, bold: 1 } },
      { id: 'grazing', label: 'quero ficar beliscando', points: { playful: 2, fresh: 1 } },
    ],
  },
];
