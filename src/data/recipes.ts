import type { Item } from '../types';
import type { DimPoints } from './dimensions';

type Recipe = Item & { affinity: Required<DimPoints> };

// O catálogo. Afinidades vão de 0 (nada a ver) a 1 (é a razão de existir do prato).
// Toda receita pontua todas as dimensões, então um número faltando é erro de digitação, não zero.
export const recipes: readonly Recipe[] = [
  {
    id: 'miso-butter-noodles', name: 'miso butter noodles', minutes: 15, tags: ['noodles', 'vegetarian'],
    blurb: 'pantry noodles, a spoon of miso, too much butter.',
    affinity: { cozy: 0.8, bold: 0.5, fresh: 0.1, playful: 0.2, calm: 0.9 },
  },
  {
    id: 'sheet-pan-gnocchi', name: 'sheet-pan gnocchi with blistered tomatoes', minutes: 30, tags: ['vegetarian'],
    blurb: 'everything on one tray, oven does the rest.',
    affinity: { cozy: 0.7, bold: 0.2, fresh: 0.4, playful: 0.1, calm: 0.9 },
  },
  {
    id: 'beans-on-toast', name: 'braised beans on garlic toast', minutes: 40, tags: ['vegetarian'],
    blurb: 'a fancy name for the best thing on earth.',
    affinity: { cozy: 1, bold: 0.2, fresh: 0.1, playful: 0.1, calm: 0.6 },
  },
  {
    id: 'chili-cucumbers', name: 'smashed cucumbers with chili crisp', minutes: 10, tags: ['vegetarian', 'spicy'],
    blurb: 'hit a cucumber with a pan. therapeutic and delicious.',
    affinity: { cozy: 0, bold: 0.8, fresh: 1, playful: 0.2, calm: 0.5 },
  },
  {
    id: 'hand-rolled-dumplings', name: 'hand-rolled dumplings', minutes: 90, tags: [],
    blurb: 'fold forty of them. ugly ones taste the same.',
    affinity: { cozy: 0.6, bold: 0.3, fresh: 0.2, playful: 1, calm: 0 },
  },
  {
    id: 'taco-spread', name: 'build-your-own taco spread', minutes: 45, tags: ['spicy'],
    blurb: 'twelve little bowls and nobody agrees on salsa.',
    affinity: { cozy: 0.3, bold: 0.8, fresh: 0.5, playful: 0.9, calm: 0.1 },
  },
  {
    id: 'chicken-soup', name: 'chicken soup, the long way', minutes: 120, tags: [],
    blurb: 'two hours of simmering and a kitchen that smells like a hug.',
    affinity: { cozy: 1, bold: 0.1, fresh: 0.2, playful: 0.1, calm: 0.5 },
  },
  {
    id: 'peach-burrata', name: 'peach and burrata plate', minutes: 10, tags: ['vegetarian'],
    blurb: 'slice, tear, olive oil, done. call it cooking.',
    affinity: { cozy: 0.1, bold: 0.1, fresh: 1, playful: 0.3, calm: 0.7 },
  },
  {
    id: 'dan-dan-noodles', name: 'fiery dan dan noodles', minutes: 35, tags: ['noodles', 'spicy'],
    blurb: 'numbing, nutty, slightly dangerous.',
    affinity: { cozy: 0.5, bold: 1, fresh: 0.1, playful: 0.3, calm: 0.3 },
  },
  {
    id: 'pizza-night', name: 'homemade pizza night', minutes: 120, tags: ['vegetarian'],
    blurb: 'dough from scratch, toppings by committee.',
    affinity: { cozy: 0.7, bold: 0.3, fresh: 0.2, playful: 1, calm: 0.1 },
  },
  {
    id: 'fridge-green-curry', name: "green curry with whatever's in the fridge", minutes: 30, tags: ['spicy'],
    blurb: 'a clean-out-the-fridge move disguised as dinner.',
    affinity: { cozy: 0.6, bold: 0.8, fresh: 0.6, playful: 0.2, calm: 0.4 },
  },
  {
    id: 'charred-corn', name: 'charred corn with lime and chili', minutes: 20, tags: ['vegetarian', 'spicy'],
    blurb: 'eaten standing up, over the sink, no regrets.',
    affinity: { cozy: 0.2, bold: 0.7, fresh: 0.8, playful: 0.6, calm: 0.3 },
  },
  {
    id: 'rice-pudding', name: 'stovetop rice pudding', minutes: 50, tags: ['vegetarian', 'sweet'],
    blurb: 'stir slowly, think about nothing.',
    affinity: { cozy: 0.9, bold: 0, fresh: 0, playful: 0.2, calm: 0.7 },
  },
  {
    id: 'summer-rolls', name: 'summer rolls', minutes: 40, tags: ['vegetarian'],
    blurb: 'rice paper, herbs, at least one roll falls apart.',
    affinity: { cozy: 0.1, bold: 0.3, fresh: 1, playful: 0.8, calm: 0.2 },
  },
  {
    id: 'shakshuka', name: 'shakshuka', minutes: 25, tags: ['vegetarian', 'spicy'],
    blurb: 'eggs in spicy tomato, bread for dragging.',
    affinity: { cozy: 0.6, bold: 0.7, fresh: 0.3, playful: 0.2, calm: 0.6 },
  },
  {
    id: 'smashed-potatoes', name: 'crispy smashed potatoes', minutes: 50, tags: ['vegetarian'],
    blurb: 'boil, smash, roast, fight over the crunchy ones.',
    affinity: { cozy: 0.7, bold: 0.4, fresh: 0.1, playful: 0.5, calm: 0.4 },
  },
  {
    id: 'lemon-risotto', name: 'lemony herb risotto', minutes: 40, tags: ['vegetarian'],
    blurb: 'twenty minutes of stirring is basically meditation.',
    affinity: { cozy: 0.7, bold: 0, fresh: 0.6, playful: 0.2, calm: 0.7 },
  },
  {
    id: 'fruit-galette', name: 'rustic fruit galette', minutes: 75, tags: ['vegetarian', 'sweet'],
    blurb: 'a pie for people who refuse to crimp.',
    affinity: { cozy: 0.6, bold: 0, fresh: 0.5, playful: 0.7, calm: 0.2 },
  },
  {
    id: 'pickle-fried-chicken', name: 'pickle-brined fried chicken', minutes: 80, tags: ['spicy'],
    blurb: 'loud, greasy, a project. absolutely worth it.',
    affinity: { cozy: 0.5, bold: 0.9, fresh: 0.1, playful: 0.7, calm: 0 },
  },
  {
    id: 'cold-sesame-soba', name: 'cold sesame soba', minutes: 20, tags: ['noodles', 'vegetarian'],
    blurb: 'slurpable, cold, for when the sun is personally attacking you.',
    affinity: { cozy: 0.1, bold: 0.4, fresh: 0.9, playful: 0.1, calm: 0.7 },
  },
];
