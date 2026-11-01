import type { Weights } from '../../src/types';

/**
 * Um conjunto de pesos ruim de propósito, mantido aqui para o antes/depois do README ser reproduzível.
 *
 * É o tipo de coisa que "parece funcionar" quando você clica na demo algumas vezes:
 * a emoção grita (x3) e a primeira pergunta é dobrada porque "parecia importante".
 * Rode `pnpm audit:unbalanced` para ver o que a auditoria acha disso.
 */
export const unbalancedWeights: Weights = {
  emotion: 3,
  questions: { weather: 2 },
  cravingBonus: 0.04,
};
