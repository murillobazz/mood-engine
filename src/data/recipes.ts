import type { Item } from '../types';
import type { DimPoints } from './dimensions';

type Recipe = Item & { affinity: Required<DimPoints> };

// O catálogo. Afinidades vão de 0 (nada a ver) a 1 (é a razão de existir do prato).
// Toda receita pontua todas as dimensões, então um número faltando é erro de digitação, não zero.
export const recipes: readonly Recipe[] = [
  {
    id: 'miso-butter-noodles', name: 'macarrão com manteiga e missô', minutes: 15, tags: ['noodles', 'vegetarian'],
    blurb: 'macarrão da despensa, uma colher de missô, manteiga demais.',
    affinity: { cozy: 0.8, bold: 0.5, fresh: 0.1, playful: 0.2, calm: 0.9 },
  },
  {
    id: 'sheet-pan-gnocchi', name: 'nhoque assado com tomatinhos', minutes: 30, tags: ['vegetarian'],
    blurb: 'tudo numa assadeira, o forno faz o resto.',
    affinity: { cozy: 0.7, bold: 0.2, fresh: 0.4, playful: 0.1, calm: 0.9 },
  },
  {
    id: 'beans-on-toast', name: 'feijão-branco ensopado na torrada de alho', minutes: 40, tags: ['vegetarian'],
    blurb: 'um nome chique pra melhor coisa do mundo.',
    affinity: { cozy: 1, bold: 0.2, fresh: 0.1, playful: 0.1, calm: 0.6 },
  },
  {
    id: 'chili-cucumbers', name: 'pepino amassado com óleo de pimenta crocante', minutes: 10, tags: ['vegetarian', 'spicy'],
    blurb: 'bata num pepino com a frigideira. terapêutico e delicioso.',
    affinity: { cozy: 0, bold: 0.8, fresh: 1, playful: 0.2, calm: 0.5 },
  },
  {
    id: 'hand-rolled-dumplings', name: 'guioza feito à mão', minutes: 90, tags: [],
    blurb: 'dobre uns quarenta. os feios têm o mesmo gosto.',
    affinity: { cozy: 0.6, bold: 0.3, fresh: 0.2, playful: 1, calm: 0 },
  },
  {
    id: 'taco-spread', name: 'mesa de tacos, cada um monta o seu', minutes: 45, tags: ['spicy'],
    blurb: 'doze potinhos e ninguém concorda sobre o molho.',
    affinity: { cozy: 0.3, bold: 0.8, fresh: 0.5, playful: 0.9, calm: 0.1 },
  },
  {
    id: 'chicken-soup', name: 'canja do jeito demorado', minutes: 120, tags: [],
    blurb: 'duas horas no fogo e uma cozinha com cheiro de abraço.',
    affinity: { cozy: 1, bold: 0.1, fresh: 0.2, playful: 0.1, calm: 0.5 },
  },
  {
    id: 'peach-burrata', name: 'pêssego com burrata', minutes: 10, tags: ['vegetarian'],
    blurb: 'fatia, rasga, azeite, pronto. chama isso de cozinhar.',
    affinity: { cozy: 0.1, bold: 0.1, fresh: 1, playful: 0.3, calm: 0.7 },
  },
  {
    id: 'dan-dan-noodles', name: 'dan dan noodles ardido', minutes: 35, tags: ['noodles', 'spicy'],
    blurb: 'adormece a boca, tem gosto de amendoim, é levemente perigoso.',
    affinity: { cozy: 0.5, bold: 1, fresh: 0.1, playful: 0.3, calm: 0.3 },
  },
  {
    id: 'pizza-night', name: 'noite da pizza caseira', minutes: 120, tags: ['vegetarian'],
    blurb: 'massa do zero, cobertura decidida em comitê.',
    affinity: { cozy: 0.7, bold: 0.3, fresh: 0.2, playful: 1, calm: 0.1 },
  },
  {
    id: 'fridge-green-curry', name: 'curry verde com o que tiver na geladeira', minutes: 30, tags: ['spicy'],
    blurb: 'uma faxina na geladeira disfarçada de jantar.',
    affinity: { cozy: 0.6, bold: 0.8, fresh: 0.6, playful: 0.2, calm: 0.4 },
  },
  {
    id: 'charred-corn', name: 'milho tostado com limão e pimenta', minutes: 20, tags: ['vegetarian', 'spicy'],
    blurb: 'comido em pé, debruçado na pia, sem arrependimentos.',
    affinity: { cozy: 0.2, bold: 0.7, fresh: 0.8, playful: 0.6, calm: 0.3 },
  },
  {
    id: 'rice-pudding', name: 'arroz-doce de panela', minutes: 50, tags: ['vegetarian', 'sweet'],
    blurb: 'mexe devagar, não pensa em nada.',
    affinity: { cozy: 0.9, bold: 0, fresh: 0, playful: 0.2, calm: 0.7 },
  },
  {
    id: 'summer-rolls', name: 'rolinhos vietnamitas', minutes: 40, tags: ['vegetarian'],
    blurb: 'papel de arroz, ervas, pelo menos um rolinho desmancha.',
    affinity: { cozy: 0.1, bold: 0.3, fresh: 1, playful: 0.8, calm: 0.2 },
  },
  {
    id: 'shakshuka', name: 'shakshuka', minutes: 25, tags: ['vegetarian', 'spicy'],
    blurb: 'ovos no molho de tomate apimentado, pão pra arrastar.',
    affinity: { cozy: 0.6, bold: 0.7, fresh: 0.3, playful: 0.2, calm: 0.6 },
  },
  {
    id: 'smashed-potatoes', name: 'batata esmagada crocante', minutes: 50, tags: ['vegetarian'],
    blurb: 'cozinha, esmaga, assa, briga pelas mais crocantes.',
    affinity: { cozy: 0.7, bold: 0.4, fresh: 0.1, playful: 0.5, calm: 0.4 },
  },
  {
    id: 'lemon-risotto', name: 'risoto de limão-siciliano com ervas', minutes: 40, tags: ['vegetarian'],
    blurb: 'vinte minutos mexendo é basicamente meditação.',
    affinity: { cozy: 0.7, bold: 0, fresh: 0.6, playful: 0.2, calm: 0.7 },
  },
  {
    id: 'fruit-galette', name: 'galette rústica de frutas', minutes: 75, tags: ['vegetarian', 'sweet'],
    blurb: 'uma torta pra quem se recusa a fazer acabamento na borda.',
    affinity: { cozy: 0.6, bold: 0, fresh: 0.5, playful: 0.7, calm: 0.2 },
  },
  {
    id: 'pickle-fried-chicken', name: 'frango frito marinado em salmoura de picles', minutes: 80, tags: ['spicy'],
    blurb: 'barulhento, gorduroso, um projeto. vale cada minuto.',
    affinity: { cozy: 0.5, bold: 0.9, fresh: 0.1, playful: 0.7, calm: 0 },
  },
  {
    id: 'cold-sesame-soba', name: 'soba gelado com gergelim', minutes: 20, tags: ['noodles', 'vegetarian'],
    blurb: 'gelado e pra sorver, pra quando o sol tá te atacando pessoalmente.',
    affinity: { cozy: 0.1, bold: 0.4, fresh: 0.9, playful: 0.1, calm: 0.7 },
  },
];
