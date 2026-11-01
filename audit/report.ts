import type { Quiz, Weights } from '../src/types';
import {
  THRESHOLDS,
  checkPointBudgets,
  checkTimeLimits,
  findLockIns,
  measureCoverage,
  measureInfluence,
  measureProfiles,
  measureStability,
  pct,
  type Flag,
} from './detectors';
import type { Simulation } from './simulate';

/** Número com vírgula decimal: 1.25 -> "1,25". */
const num = (x: number, digits?: number) => (digits === undefined ? String(x) : x.toFixed(digits)).replace('.', ',');
const table = (head: string[], rows: (string | number)[][]) =>
  [`| ${head.join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n');

export interface Audit {
  flags: Flag[];
  markdown: string;
}

/** Roda todos os detectores e gera um relatório em Markdown. Determinístico: mesma entrada, mesmos bytes. */
export function buildReport(quiz: Quiz, weights: Weights, sim: Simulation, name: string): Audit {
  const influence = measureInfluence(sim);
  const lockIns = findLockIns(sim);
  const coverage = measureCoverage(sim);
  const profiles = measureProfiles(sim);
  const stability = measureStability(sim);
  const budgets = checkPointBudgets(quiz);
  const limits = checkTimeLimits(quiz);

  const flags = [
    ...influence.flags,
    ...lockIns.flags,
    ...coverage.flags,
    ...profiles.flags,
    ...stability.flags,
    ...budgets.flags,
    ...limits.flags,
  ];
  const n = sim.outcomes.length;
  const sectionFlags = (f: Flag[]) => (f.length ? f.map((x) => `> ⚠️ ${x.message}`).join('\n>\n') : '> ✅ nada a sinalizar.');

  const md = [
    `# auditoria: pesos \`${name}\``,
    '',
    `Gerado por \`pnpm audit:engine${name === 'default' ? '' : ` --weights ${name}`}\`. ` +
      `Todas as combinações de emoção e respostas passaram pelo motor: **${n.toLocaleString('pt-BR')} combinações**, ` +
      `${stability.stats.pairs.toLocaleString('pt-BR')} trocas de uma única resposta.`,
    '',
    `Pesos: emoção × ${num(weights.emotion)}, ` +
      `perguntas ${Object.keys(weights.questions).length ? Object.entries(weights.questions).map(([q, w]) => `${q} × ${num(w)}`).join(', ') + ', demais × 1' : 'todas × 1'}, ` +
      `bônus de desejo +${num(weights.cravingBonus)}.`,
    '',
    '## resumo',
    '',
    flags.length ? `**${flags.length} sinalização(ões).**\n\n${flags.map((f) => `- **${f.check}** — ${f.message}`).join('\n')}` : '**Nenhuma sinalização.** ✅',
    '',
    '## 1. influência',
    '',
    'Duas perguntas por fonte. *Troca o #1*: mudando só esta resposta, com que frequência o prato #1 muda? ' +
      '*Explica*: o quanto saber só esta resposta diz sobre o resultado ' +
      '(informação mútua como fatia da entropia do resultado; 0% = nada, 100% = tudo). ' +
      `Sinaliza se uma fonte explicar mais de ${pct(THRESHOLDS.dominant)} do prato #1 ou do perfil, ` +
      `ou menos de ${pct(THRESHOLDS.decoration)} do prato #1.`,
    '',
    table(
      ['fonte', 'troca o #1', 'explica o #1', 'explica o perfil'],
      influence.rows.map((r) => [
        `\`${r.source}\``,
        pct(r.flipRate),
        `${pct(r.explainsTop)} ${bar(r.explainsTop / THRESHOLDS.dominant)}`,
        `${pct(r.explainsProfile)} ${bar(r.explainsProfile / THRESHOLDS.dominant)}`,
      ]),
    ),
    '',
    sectionFlags(influence.flags),
    '',
    '## 2. trava',
    '',
    `Para cada resposta: o item que mais vence quando ela é escolhida. Sinaliza acima de ${pct(THRESHOLDS.lockIn)}. Mostrando as 10 maiores.`,
    '',
    table(
      ['resposta', '#1 mais comum', 'fatia'],
      [...lockIns.rows]
        .sort((a, b) => b.share - a.share)
        .slice(0, 10)
        .map((r) => [`\`${r.source}=${r.option}\``, `\`${r.item}\``, pct(r.share)]),
    ),
    '',
    sectionFlags(lockIns.flags),
    '',
    '## 3. cobertura',
    '',
    `Todo item deveria chegar em #1 para *alguém*. A fatia justa de #1 é ${pct(1 / sim.itemIds.length)}; sinaliza acima de ${num(THRESHOLDS.hogShare)}× isso.`,
    '',
    table(
      ['item', '#1', 'no top 3'],
      coverage.rows.map((r) => [`\`${r.item}\``, `${r.firsts} (${pct(r.firsts / n)})`, `${r.appearances} (${pct(r.appearances / n)})`]),
    ),
    '',
    sectionFlags(coverage.flags),
    '',
    '## 4. perfis',
    '',
    `Equilíbrio (entropia normalizada, 1 = perfeitamente equilibrado): **${num(profiles.entropy, 2)}**. ` +
      `Sinaliza se um perfil for inalcançável ou passar de ${num(THRESHOLDS.profileSkew)}× a fatia uniforme de ${pct(1 / sim.profileIds.length)}.`,
    '',
    table(
      ['perfil', 'pessoas', 'fatia'],
      profiles.rows.map((r) => [`\`${r.profile}\``, r.count, `${pct(r.share)} ${bar(r.share * sim.profileIds.length / THRESHOLDS.profileSkew)}`]),
    ),
    '',
    sectionFlags(profiles.flags),
    '',
    '## 5. estabilidade',
    '',
    'Mude uma resposta, mantenha o resto. Um bom motor se mexe um pouco: nem nada (as respostas seriam decoração), nem tudo (as respostas seriam um caça-níquel).',
    '',
    table(
      ['métrica', 'valor'],
      [
        ['média de itens mantidos no top 3', `${num(stability.stats.meanOverlap, 2)} / 3`],
        ['top 3 idêntico', pct(stability.stats.identical)],
        ['#1 muda', pct(stability.stats.firstChanged)],
        ['top 3 inteiro substituído', pct(stability.stats.fullyReplaced)],
      ],
    ),
    '',
    `Sinaliza como instável acima de ${pct(THRESHOLDS.jumpy)} de top 3 totalmente substituído, e como grudado acima de ${pct(THRESHOLDS.sticky)} de top 3 idêntico.`,
    '',
    sectionFlags(stability.flags),
    '',
    '## 6. checagens dos dados',
    '',
    `Orçamento de pontos: toda opção dentro de uma pergunta deveria distribuir os mesmos pontos (±${pct(THRESHOLDS.budgetDrift)}).`,
    '',
    sectionFlags(budgets.flags),
    '',
    `Limites de tempo: cada um deveria deixar pelo menos ${THRESHOLDS.minEligible} itens.`,
    '',
    table(['limite', 'itens restantes'], limits.rows.map((r) => [r.label, r.eligible])),
    '',
    sectionFlags(limits.flags),
    '',
  ].join('\n');

  return { flags, markdown: md };
}

/** Uma barrinha de texto; 1.0 significa "na linha do alerta". */
function bar(ratio: number): string {
  const width = 10;
  const filled = Math.max(0, Math.min(width, Math.round(ratio * width)));
  return '`' + '█'.repeat(filled) + '·'.repeat(width - filled) + '`';
}
