import { describe, expect, it } from 'vitest';
import {
  checkPointBudgets,
  checkTimeLimits,
  explained,
  findLockIns,
  measureCoverage,
  measureInfluence,
  measureProfiles,
  measureStability,
} from '../audit/detectors';
import { buildReport } from '../audit/report';
import { decode, simulate, swap, type Outcome, type Simulation, type Source } from '../audit/simulate';
import { unbalancedWeights } from '../audit/weights/unbalanced';
import { quiz } from '../src/data';
import type { Quiz } from '../src/types';
import { defaultWeights } from '../src/weights';

/** Uma simulação falsa: `sizes` opções por fonte, resultado calculado a partir dos índices escolhidos. */
function fakeSim(sizes: number[], outcomeOf: (digits: number[]) => Outcome, itemIds?: string[], profileIds?: string[]): Simulation {
  const sources: Source[] = sizes.map((size, s) => ({
    id: `s${s}`,
    label: `s${s}`,
    options: Array.from({ length: size }, (_, o) => ({ id: `o${o}`, label: `o${o}` })),
  }));
  const total = sizes.reduce((x, y) => x * y, 1);
  const outcomes = Array.from({ length: total }, (_, i) => outcomeOf(decode(sources, i)));
  return {
    sources,
    outcomes,
    itemIds: itemIds ?? [...new Set(outcomes.flatMap((o) => o.top))].sort(),
    profileIds: profileIds ?? [...new Set(outcomes.map((o) => o.profile))].sort(),
  };
}

describe('auxiliares do simulate', () => {
  it('decode e swap concordam entre si', () => {
    const sim = fakeSim([2, 3, 4], () => ({ top: ['x'], profile: 'p' }));
    const index = 17;
    const digits = decode(sim.sources, index);
    const swapped = decode(sim.sources, swap(sim.sources, index, 1, (digits[1]! + 1) % 3));
    expect(swapped[0]).toBe(digits[0]);
    expect(swapped[2]).toBe(digits[2]);
    expect(swapped[1]).toBe((digits[1]! + 1) % 3);
  });
});

describe('measureInfluence', () => {
  it('sinaliza a fonte que decide tudo e as que não decidem nada', () => {
    // Só a fonte 0 importa.
    const sim = fakeSim([3, 3, 3], ([a]) => ({ top: [`i${a}`], profile: `p${a}` }));
    const { rows, flags } = measureInfluence(sim);
    expect(rows[0]!.explainsTop).toBeCloseTo(1);
    expect(rows[1]!.explainsTop).toBeCloseTo(0);
    expect(rows[0]!.flipRate).toBe(1);
    expect(flags.map((f) => f.message).join('\n')).toMatch(/s0` domina/);
    expect(flags.filter((f) => f.message.includes('decoração'))).toHaveLength(2);
  });

  it('fica quieto quando todas as fontes contribuem igual', () => {
    // O #1 é a soma dos dígitos mod 3: toda fonte importa igualmente, e nenhuma explica o resultado sozinha.
    const sim = fakeSim([3, 3, 3], (d) => {
      const k = d.reduce((x, y) => x + y, 0) % 3;
      return { top: [`i${k}`], profile: `p${k}` };
    });
    const { rows } = measureInfluence(sim);
    for (const row of rows) expect(row.flipRate).toBe(1);
    expect(explained(sim, 0, (o) => o.top[0]!)).toBeCloseTo(0);
  });
});

describe('findLockIns', () => {
  it('sinaliza uma resposta que escolhe o #1 não importa o que mais for dito', () => {
    const sim = fakeSim([2, 4], ([a, b]) => ({ top: [a === 0 ? 'always' : `i${b}`], profile: 'p' }));
    const { flags } = findLockIns(sim);
    expect(flags).toHaveLength(1);
    expect(flags[0]!.message).toContain('`s0=o0` faz `always` ser #1 em 100,0%');
  });
});

describe('measureCoverage', () => {
  it('sinaliza itens que nunca vencem, nunca aparecem ou vencem demais', () => {
    const sim = fakeSim(
      [10],
      ([a]) => ({ top: a! < 8 ? ['hog', 'runner-up'] : [`i${a}`, 'runner-up'], profile: 'p' }),
      ['hog', 'runner-up', 'ghost', 'i8', 'i9'],
    );
    const messages = measureCoverage(sim).flags.map((f) => f.message);
    expect(messages).toContain('`ghost` nunca aparece em nenhum top 3.');
    expect(messages).toContain('`runner-up` nunca chega em #1 (aparece em 10 top 3).');
    expect(messages.some((m) => m.startsWith('`hog` é #1 em 80,0%'))).toBe(true);
  });
});

describe('measureProfiles', () => {
  it('considera uma distribuição uniforme perfeitamente equilibrada', () => {
    const sim = fakeSim([4], ([a]) => ({ top: ['x'], profile: `p${a}` }));
    const { entropy, flags } = measureProfiles(sim);
    expect(entropy).toBeCloseTo(1);
    expect(flags).toHaveLength(0);
  });

  it('sinaliza perfis inalcançáveis e super-representados', () => {
    const sim = fakeSim([10], ([a]) => ({ top: ['x'], profile: a! < 9 ? 'popular' : 'rare' }), undefined, ['popular', 'rare', 'never', 'n2', 'n3']);
    const messages = measureProfiles(sim).flags.map((f) => f.message);
    expect(messages).toContain('o perfil `never` é inalcançável.');
    expect(messages.some((m) => m.startsWith('o perfil `popular` recebe 90,0%'))).toBe(true);
  });
});

describe('measureStability', () => {
  it('chama de "grudado" um motor que nunca muda', () => {
    const sim = fakeSim([3, 3], () => ({ top: ['a', 'b', 'c'], profile: 'p' }));
    const { stats, flags } = measureStability(sim);
    expect(stats.identical).toBe(1);
    expect(stats.meanOverlap).toBe(3);
    expect(flags[0]!.message).toMatch(/^grudado/);
  });

  it('chama de "instável" um motor que embaralha tudo', () => {
    // Cada combinação ganha um top 3 próprio, sem nada em comum com as outras.
    const sim = fakeSim([3, 3], ([a, b]) => ({ top: ['x', 'y', 'z'].map((id) => `${id}${a}${b}`), profile: 'p' }));
    const { stats, flags } = measureStability(sim);
    expect(stats.fullyReplaced).toBe(1);
    expect(flags[0]!.message).toMatch(/^instável/);
  });
});

describe('checagens dos dados', () => {
  const base: Quiz = { ...quiz };

  it('sinaliza uma opção que distribui mais pontos que as irmãs', () => {
    const loud: Quiz = {
      ...base,
      questions: [{ id: 'q', prompt: 'q', options: [
        { id: 'quiet', label: '', points: { cozy: 3 } },
        { id: 'normal', label: '', points: { bold: 2, fresh: 1 } },
        { id: 'loud', label: '', points: { calm: 6 } },
      ] }],
    };
    const { flags } = checkPointBudgets(loud);
    expect(flags.map((f) => f.message)).toEqual(['`q=loud` distribui 6 pontos; as irmãs distribuem ~3.']);
  });

  it('sinaliza um limite de tempo que deixa poucos itens', () => {
    const { flags } = checkTimeLimits({ ...base, timeLimits: [{ label: 'cinco minutos', minutes: 5 }] });
    expect(flags[0]!.message).toBe('o limite de tempo "cinco minutos" deixa só 0 item(ns).');
  });
});

describe('a auditoria de verdade', () => {
  it('aprova os pesos usados', () => {
    const { flags } = buildReport(quiz, defaultWeights, simulate(quiz, defaultWeights), 'default');
    expect(flags).toEqual([]);
  });

  it('pega os pesos desbalanceados do README', () => {
    const { flags } = buildReport(quiz, unbalancedWeights, simulate(quiz, unbalancedWeights), 'unbalanced');
    const messages = flags.map((f) => f.message);
    expect(messages.some((m) => m.startsWith('`emotion` domina'))).toBe(true);
    expect(messages.filter((m) => m.includes('decoração')).length).toBeGreaterThan(0);
  });
});
