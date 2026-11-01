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
    { label: "i've got all night", minutes: null },
    { label: 'about an hour and a half', minutes: 90 },
    { label: 'under 45 minutes', minutes: 45 },
    { label: '20 minutes, tops', minutes: 20 },
  ],
  cravings: [
    { tag: 'vegetarian', label: 'something green' },
    { tag: 'spicy', label: 'heat' },
    { tag: 'noodles', label: 'noodles, obviously' },
    { tag: 'sweet', label: 'dessert for dinner' },
  ],
};
