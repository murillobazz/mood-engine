import type { Quiz } from '../types';
import { dimensions } from './dimensions';
import { emotions } from './emotions';
import { profiles } from './profiles';
import { questions } from './questions';
import { recipes } from './recipes';

/** "o que eu cozinho hoje?" — o catálogo fictício que a demo e a auditoria usam. */
export const quiz: Quiz = {
  dimensions,
  emotions,
  questions,
  profiles,
  items: recipes,
  timeLimits: [
    { label: 'tenho a noite toda', minutes: null },
    { label: 'mais ou menos uma hora e meia', minutes: 90 },
    { label: 'menos de 45 minutos', minutes: 45 },
    { label: '20 minutos, no máximo', minutes: 20 },
  ],
  cravings: [
    { tag: 'vegetarian', label: 'algo verde' },
    { tag: 'spicy', label: 'ardência' },
    { tag: 'noodles', label: 'macarrão, óbvio' },
    { tag: 'sweet', label: 'sobremesa de jantar' },
  ],
};
