import type { Weights } from './types';

/**
 * Os pesos usados. Todo número que molda uma recomendação está aqui, de propósito:
 * se não estiver neste arquivo, a auditoria não enxerga e ninguém consegue discutir.
 *
 * Os pontos brutos ficam nos dados (src/data). Cada emoção distribui 4 pontos e cada
 * resposta distribui 3, então dentro de uma pergunta nenhuma opção "grita" mais que outra.
 * Estes pesos decidem o quanto cada *fonte* grita em relação às outras.
 */
export const defaultWeights: Weights = {
  // A emoção é a porta de entrada do quiz, então conta um pouco mais que qualquer pergunta
  // sozinha (4 pts x 1.25 = 5 contra 3). A auditoria acusa se ela sozinha explicar mais de
  // 30% do resultado; com 1.25 ela fica em ~20%. Com 3, ela engoliu o quiz
  // (veja audit/reports/unbalanced.md).
  emotion: 1.25,

  // Toda pergunta conta igual. Só aumente uma com um bom motivo e uma auditoria nova.
  questions: {},

  // As notas são similaridades de cosseno (0..1) e os primeiros itens costumam ficar a ~0.1
  // um do outro. 0.04 sobe um prato desejado uma ou duas posições; não passa por cima do humor.
  cravingBonus: 0.04,
};
