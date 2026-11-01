import type { Quiz } from '../src/types';
import { decode, forEachNeighbor, type Outcome, type Simulation } from './simulate';

/**
 * Onde a auditoria traça suas linhas. São escolhas de julgamento, escritas pra poderem ser questionadas.
 */
export const THRESHOLDS = {
  /** Uma fonte (emoção ou pergunta) "domina" se sozinha explicar mais que isso do item #1 ou do perfil. */
  dominant: 0.3,
  /** ...e é "decoração" se explicar menos que isso do item #1. */
  decoration: 0.02,
  /** Uma resposta "trava" o item #1 se ele vencer essa fatia das combinações em que ela foi escolhida. */
  lockIn: 0.5,
  /** Um item "monopoliza" o primeiro lugar acima deste múltiplo da sua fatia justa de #1. */
  hogShare: 3,
  /** Um perfil está super-representado acima deste múltiplo da fatia uniforme. */
  profileSkew: 2.5,
  /** O top 3 é "instável" (jumpy) se mais que essa fatia das trocas de uma resposta substituir os três itens. */
  jumpy: 0.15,
  /** O top 3 é "grudado" (sticky) se mais que essa fatia das trocas de uma resposta deixá-lo idêntico. */
  sticky: 0.8,
  /** O orçamento de pontos de uma opção pode se afastar da mediana da pergunta até isso (relativo). */
  budgetDrift: 0.25,
  /** Um limite de tempo deve deixar pelo menos essa quantidade de itens pra escolher. */
  minEligible: 3,
} as const;

export interface Flag {
  check: string;
  message: string;
}

/** Porcentagem com vírgula decimal, do jeito que se lê no Brasil: 0.123 -> "12,3%". */
export const pct = (x: number) => `${(x * 100).toFixed(1).replace('.', ',')}%`;

// --- 1. influência: uma resposta (ou a emoção) decide tudo? -----------------------------------

export interface Influence {
  source: string;
  label: string;
  /** Com que frequência mudar só esta resposta muda o item #1. */
  flipRate: number;
  /** O quanto saber esta resposta diz sobre o item #1 (0..1, veja `explained`). */
  explainsTop: number;
  /** Idem, para o perfil. */
  explainsProfile: number;
}

export function measureInfluence(sim: Simulation): { rows: Influence[]; flags: Flag[] } {
  const changed = sim.sources.map(() => 0);
  const total = sim.sources.map(() => 0);
  forEachNeighbor(sim, (a, b, s) => {
    total[s]!++;
    if (a.top[0] !== b.top[0]) changed[s]!++;
  });

  const rows = sim.sources.map((source, s) => ({
    source: source.id,
    label: source.label,
    flipRate: total[s] ? changed[s]! / total[s]! : 0,
    explainsTop: explained(sim, s, (o) => o.top[0]!),
    explainsProfile: explained(sim, s, (o) => o.profile),
  }));

  const flags: Flag[] = [];
  for (const row of rows) {
    const loudest = Math.max(row.explainsTop, row.explainsProfile);
    if (loudest > THRESHOLDS.dominant) {
      flags.push({
        check: 'influência',
        message: `\`${row.source}\` domina: sozinha, explica ${pct(row.explainsTop)} do prato #1 e ${pct(row.explainsProfile)} do perfil.`,
      });
    } else if (row.explainsTop < THRESHOLDS.decoration) {
      flags.push({ check: 'influência', message: `\`${row.source}\` é decoração: explica só ${pct(row.explainsTop)} do prato #1.` });
    }
  }
  return { rows, flags };
}

/**
 * Informação mútua entre uma fonte e um resultado, como fatia da entropia do resultado:
 * 0 = saber esta resposta não diz nada sobre o resultado, 1 = diz tudo.
 */
export function explained(sim: Simulation, s: number, outcomeOf: (o: Outcome) => string): number {
  const n = sim.outcomes.length;
  const overall = new Map<string, number>();
  const byOption = sim.sources[s]!.options.map(() => new Map<string, number>());

  sim.outcomes.forEach((outcome, index) => {
    const key = outcomeOf(outcome);
    const bucket = byOption[decode(sim.sources, index)[s]!]!;
    overall.set(key, (overall.get(key) ?? 0) + 1);
    bucket.set(key, (bucket.get(key) ?? 0) + 1);
  });

  const h = entropy(overall);
  if (h === 0) return 0;
  const conditional = byOption.reduce((sum, bucket) => {
    const k = [...bucket.values()].reduce((x, y) => x + y, 0);
    return sum + (k / n) * entropy(bucket);
  }, 0);
  return (h - conditional) / h;
}

function entropy(counts: Map<string, number>): number {
  const n = [...counts.values()].reduce((x, y) => x + y, 0);
  let h = 0;
  for (const c of counts.values()) if (c > 0) h -= (c / n) * Math.log2(c / n);
  return h;
}

// --- 2. trava: uma única resposta escolhe o prato, não importa o resto? -------------------

export interface LockIn {
  source: string;
  option: string;
  item: string;
  share: number;
}

export function findLockIns(sim: Simulation): { rows: LockIn[]; flags: Flag[] } {
  // counts[source][option][item] = quantas vezes `item` foi #1 quando `option` foi escolhida
  const counts = sim.sources.map((s) => s.options.map(() => new Map<string, number>()));
  sim.outcomes.forEach((outcome, index) => {
    decode(sim.sources, index).forEach((option, s) => {
      const map = counts[s]![option]!;
      map.set(outcome.top[0]!, (map.get(outcome.top[0]!) ?? 0) + 1);
    });
  });

  const rows: LockIn[] = [];
  sim.sources.forEach((source, s) => {
    source.options.forEach((option, o) => {
      const map = counts[s]![o]!;
      const n = [...map.values()].reduce((x, y) => x + y, 0);
      const [item, wins] = [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0] ?? ['-', 0];
      rows.push({ source: source.id, option: option.id, item, share: n ? wins / n : 0 });
    });
  });

  const flags = rows
    .filter((r) => r.share > THRESHOLDS.lockIn)
    .map((r) => ({ check: 'trava', message: `escolher \`${r.source}=${r.option}\` faz \`${r.item}\` ser #1 em ${pct(r.share)} das combinações.` }));
  return { rows, flags };
}

// --- 3. cobertura: todo item tem uma chance? ----------------------------------------------

export interface Coverage {
  item: string;
  firsts: number;
  appearances: number;
}

export function measureCoverage(sim: Simulation): { rows: Coverage[]; flags: Flag[] } {
  const firsts = new Map(sim.itemIds.map((id) => [id, 0]));
  const appearances = new Map(sim.itemIds.map((id) => [id, 0]));
  for (const { top } of sim.outcomes) {
    firsts.set(top[0]!, (firsts.get(top[0]!) ?? 0) + 1);
    for (const id of top) appearances.set(id, (appearances.get(id) ?? 0) + 1);
  }

  const rows = sim.itemIds
    .map((item) => ({ item, firsts: firsts.get(item)!, appearances: appearances.get(item)! }))
    .sort((a, b) => b.firsts - a.firsts || b.appearances - a.appearances || a.item.localeCompare(b.item));

  const n = sim.outcomes.length;
  const fair = 1 / sim.itemIds.length;
  const flags: Flag[] = [];
  for (const row of rows) {
    if (row.appearances === 0) flags.push({ check: 'cobertura', message: `\`${row.item}\` nunca aparece em nenhum top 3.` });
    else if (row.firsts === 0) flags.push({ check: 'cobertura', message: `\`${row.item}\` nunca chega em #1 (aparece em ${row.appearances} top 3).` });
    else if (row.firsts / n > fair * THRESHOLDS.hogShare) {
      flags.push({ check: 'cobertura', message: `\`${row.item}\` é #1 em ${pct(row.firsts / n)} das combinações (a fatia justa é ${pct(fair)}).` });
    }
  }
  return { rows, flags };
}

// --- 4. perfis: alguma personalidade é impossível, ou está em todo lugar? ----------------

export interface ProfileShare {
  profile: string;
  count: number;
  share: number;
}

export function measureProfiles(sim: Simulation): { rows: ProfileShare[]; entropy: number; flags: Flag[] } {
  const counts = new Map(sim.profileIds.map((id) => [id, 0]));
  for (const { profile } of sim.outcomes) counts.set(profile, (counts.get(profile) ?? 0) + 1);

  const n = sim.outcomes.length;
  const rows = [...counts.entries()]
    .map(([profile, count]) => ({ profile, count, share: n ? count / n : 0 }))
    .sort((a, b) => b.count - a.count || a.profile.localeCompare(b.profile));

  // Entropia de Shannon normalizada: 1 = perfeitamente equilibrado, 0 = todo mundo cai no mesmo perfil.
  const h = rows.reduce((sum, r) => (r.share > 0 ? sum - r.share * Math.log(r.share) : sum), 0);
  const entropy = rows.length > 1 ? h / Math.log(rows.length) : 1;

  const fair = 1 / sim.profileIds.length;
  const flags: Flag[] = [];
  for (const row of rows) {
    if (row.count === 0) flags.push({ check: 'perfis', message: `o perfil \`${row.profile}\` é inalcançável.` });
    else if (row.share > fair * THRESHOLDS.profileSkew) {
      flags.push({ check: 'perfis', message: `o perfil \`${row.profile}\` recebe ${pct(row.share)} das pessoas (o uniforme seria ${pct(fair)}).` });
    }
  }
  return { rows, entropy, flags };
}

// --- 5. estabilidade: mudar uma resposta muda demais, ou nada? ---------------------------

export interface Stability {
  pairs: number;
  /** Média de itens em comum entre os dois top 3 (0..3). */
  meanOverlap: number;
  identical: number;
  firstChanged: number;
  fullyReplaced: number;
}

export function measureStability(sim: Simulation): { stats: Stability; flags: Flag[] } {
  let pairs = 0;
  let overlap = 0;
  let identical = 0;
  let firstChanged = 0;
  let fullyReplaced = 0;

  forEachNeighbor(sim, (a, b) => {
    const shared = a.top.filter((id) => b.top.includes(id)).length;
    pairs++;
    overlap += shared;
    if (shared === a.top.length && shared === b.top.length) identical++;
    if (a.top[0] !== b.top[0]) firstChanged++;
    if (shared === 0) fullyReplaced++;
  });

  const stats = {
    pairs,
    meanOverlap: pairs ? overlap / pairs : 0,
    identical: pairs ? identical / pairs : 0,
    firstChanged: pairs ? firstChanged / pairs : 0,
    fullyReplaced: pairs ? fullyReplaced / pairs : 0,
  };

  const flags: Flag[] = [];
  if (stats.fullyReplaced > THRESHOLDS.jumpy) {
    flags.push({ check: 'estabilidade', message: `instável: ${pct(stats.fullyReplaced)} das trocas de uma única resposta substituem o top 3 inteiro.` });
  }
  if (stats.identical > THRESHOLDS.sticky) {
    flags.push({ check: 'estabilidade', message: `grudado: ${pct(stats.identical)} das trocas de uma única resposta deixam o top 3 intacto.` });
  }
  return { stats, flags };
}

// --- 6. checagens estáticas nos próprios dados --------------------------------------------

export interface Budget {
  source: string;
  option: string;
  points: number;
  median: number;
}

/** Dentro de uma pergunta (ou da lista de emoções), toda opção deveria distribuir mais ou menos os mesmos pontos. */
export function checkPointBudgets(quiz: Quiz): { rows: Budget[]; flags: Flag[] } {
  const groups = [
    { source: 'emotion', options: quiz.emotions },
    ...quiz.questions.map((q) => ({ source: q.id, options: q.options })),
  ];

  const rows: Budget[] = [];
  for (const { source, options } of groups) {
    const totals = options.map((o) => Object.values(o.points).reduce((x, y) => x + y, 0));
    const median = medianOf(totals);
    options.forEach((o, i) => rows.push({ source, option: o.id, points: totals[i]!, median }));
  }

  const flags = rows
    .filter((r) => r.median > 0 && Math.abs(r.points - r.median) / r.median > THRESHOLDS.budgetDrift)
    .map((r) => ({ check: 'orçamento', message: `\`${r.source}=${r.option}\` distribui ${r.points} pontos; as irmãs distribuem ~${r.median}.` }));
  return { rows, flags };
}

export interface Eligibility {
  label: string;
  minutes: number | null;
  eligible: number;
}

/** Um filtro rígido que deixa um ou dois itens não é recomendação, é cara ou coroa. */
export function checkTimeLimits(quiz: Quiz): { rows: Eligibility[]; flags: Flag[] } {
  const rows = quiz.timeLimits.map(({ label, minutes }) => ({
    label,
    minutes,
    eligible: quiz.items.filter((i) => minutes == null || i.minutes <= minutes).length,
  }));
  const flags = rows
    .filter((r) => r.eligible < THRESHOLDS.minEligible)
    .map((r) => ({ check: 'filtros', message: `o limite de tempo "${r.label}" deixa só ${r.eligible} item(ns).` }));
  return { rows, flags };
}

function medianOf(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length === 0) return 0;
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}
