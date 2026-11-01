import type { Profile } from '../types';
import type { DimensionId } from './dimensions';

type CookingProfile = Profile & { dimensions: readonly [DimensionId, DimensionId] };

// Um perfil por par de dimensões (combinação de 5, 2 a 2 = 10). Um teste garante que nenhum falta.
export const profiles: readonly CookingProfile[] = [
  { id: 'spicy-blanket', name: 'o cobertor apimentado', dimensions: ['cozy', 'bold'], blurb: 'comida afetiva, mas no volume máximo.' },
  { id: 'sunday-garden', name: 'a horta de domingo', dimensions: ['cozy', 'fresh'], blurb: 'prato quentinho, algo verde por cima.' },
  { id: 'flour-everywhere', name: 'farinha pra todo lado', dimensions: ['cozy', 'playful'], blurb: 'você quer sovar alguma coisa. então bora sovar.' },
  { id: 'slow-simmer', name: 'fogo baixo', dimensions: ['cozy', 'calm'], blurb: 'uma panela, muito tempo, zero decisões.' },
  { id: 'citrus-fire', name: 'fogo cítrico', dimensions: ['bold', 'fresh'], blurb: 'pimenta, limão, crocância. acorda.' },
  { id: 'kitchen-chaos', name: 'caos na cozinha', dimensions: ['bold', 'playful'], blurb: 'todas as bocas acesas, música alta demais.' },
  { id: 'quiet-heat', name: 'o ardido discreto', dimensions: ['bold', 'calm'], blurb: 'muito sabor, pouquíssimo esforço.' },
  { id: 'market-sprint', name: 'corrida na feira', dimensions: ['fresh', 'playful'], blurb: 'cru, vivo, montado com as mãos.' },
  { id: 'clean-plate', name: 'o prato limpo', dimensions: ['fresh', 'calm'], blurb: 'mal é cozinhar. tecnicamente uma salada.' },
  { id: 'lazy-tinkerer', name: 'o inventor preguiçoso', dimensions: ['playful', 'calm'], blurb: 'um projetinho divertido que quase se limpa sozinho.' },
];
