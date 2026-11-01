import { describe, expect, it } from 'vitest';
import { explain, pickProfile, rankItems, recommend, scoreAnswers } from '../src/engine';
import { quiz } from '../src/data';
import type { Item, Quiz, Weights } from '../src/types';
import { defaultWeights } from '../src/weights';

const flat: Weights = { emotion: 1, questions: {}, cravingBonus: 0.05 };

const item = (id: string, affinity: Item['affinity'], extra: Partial<Item> = {}): Item => ({
  id,
  name: id,
  blurb: '',
  minutes: 30,
  tags: [],
  affinity,
  ...extra,
});

// Um quiz minúsculo, com números pequenos o bastante pra conferir na mão.
const mini: Quiz = {
  dimensions: [
    { id: 'a', label: 'a', blurb: '' },
    { id: 'b', label: 'b', blurb: '' },
    { id: 'c', label: 'c', blurb: '' },
  ],
  emotions: [
    { id: 'happy', label: 'happy', points: { a: 2 } },
    { id: 'meh', label: 'meh', points: { c: 1 } },
  ],
  questions: [
    { id: 'q1', prompt: 'q1', options: [{ id: 'x', label: 'x', points: { b: 1, c: 1 } }, { id: 'y', label: 'y', points: { a: 1 } }] },
    { id: 'q2', prompt: 'q2', options: [{ id: 'z', label: 'z', points: { b: 2 } }] },
  ],
  profiles: [
    { id: 'ab', name: 'ab', blurb: '', dimensions: ['a', 'b'] },
    { id: 'ac', name: 'ac', blurb: '', dimensions: ['a', 'c'] },
    { id: 'bc', name: 'bc', blurb: '', dimensions: ['b', 'c'] },
  ],
  items: [
    item('only-a', { a: 1, b: 0, c: 0 }, { minutes: 10, tags: ['quick'] }),
    item('only-b', { a: 0, b: 1, c: 0 }, { minutes: 60 }),
    item('a-bit-of-everything', { a: 1, b: 1, c: 1 }, { minutes: 20 }),
  ],
  timeLimits: [],
  cravings: [],
};

describe('scoreAnswers', () => {
  it('adds the emotion and every answer, weighted', () => {
    const scores = scoreAnswers(mini, { emotion: 'happy', answers: { q1: 'x', q2: 'z' } }, flat);
    expect(scores).toEqual({ a: 2, b: 3, c: 1 });
  });

  it('multiplies emotion and per-question weights', () => {
    const weights: Weights = { emotion: 3, questions: { q2: 0.5 }, cravingBonus: 0 };
    const scores = scoreAnswers(mini, { emotion: 'happy', answers: { q1: 'x', q2: 'z' } }, weights);
    expect(scores).toEqual({ a: 6, b: 2, c: 1 });
  });

  it('ignores unanswered questions', () => {
    expect(scoreAnswers(mini, { emotion: 'meh', answers: {} }, flat)).toEqual({ a: 0, b: 0, c: 1 });
  });

  it('rejects unknown emotions and options', () => {
    expect(() => scoreAnswers(mini, { emotion: 'ecstatic', answers: {} }, flat)).toThrow(/Unknown emotion/);
    expect(() => scoreAnswers(mini, { emotion: 'happy', answers: { q1: 'nope' } }, flat)).toThrow(/Unknown option/);
  });
});

describe('pickProfile', () => {
  it('uses the two strongest dimensions', () => {
    expect(pickProfile(mini, { a: 2, b: 3, c: 1 }).id).toBe('ab');
    expect(pickProfile(mini, { a: 0, b: 5, c: 4 }).id).toBe('bc');
  });

  it("breaks ties by the emotion's points first", () => {
    // a, b e c empatam. A emoção apontou para c, então c entra.
    expect(pickProfile(mini, { a: 1, b: 1, c: 1 }, { c: 1 }).id).toBe('ac');
  });

  it('falls back to dimension order when the emotion is no help', () => {
    expect(pickProfile(mini, { a: 1, b: 1, c: 1 }).id).toBe('ab');
  });
});

describe('rankItems', () => {
  it('matches on shape, so "a bit of everything" does not win by default', () => {
    // Um produto escalar coroaria a-bit-of-everything aqui; o cosseno escolhe o match honesto.
    const top = rankItems(mini, { a: 5, b: 0, c: 0 }, {}, flat);
    expect(top.map((r) => r.item.id)).toEqual(['only-a', 'a-bit-of-everything', 'only-b']);
    expect(top[0]!.score).toBeCloseTo(1);
  });

  it('drops items over the time limit (hard filter)', () => {
    const top = rankItems(mini, { a: 0, b: 5, c: 0 }, { maxMinutes: 30 }, flat);
    expect(top.map((r) => r.item.id)).not.toContain('only-b');
    expect(top).toHaveLength(2);
  });

  it('gives the craved tag a small bonus (soft preference)', () => {
    const scores = { a: 1, b: 1, c: 1 };
    const without = rankItems(mini, scores, {}, flat);
    const withCraving = rankItems(mini, scores, { craving: 'quick' }, flat);
    const before = without.find((r) => r.item.id === 'only-a')!;
    const after = withCraving.find((r) => r.item.id === 'only-a')!;
    expect(after.score - before.score).toBeCloseTo(flat.cravingBonus);
    expect(after.craved).toBe(true);
    // ...mas um bônus pequeno não supera um match muito melhor.
    expect(withCraving[0]!.item.id).toBe('a-bit-of-everything');
  });

  it('returns at most the limit and breaks ties by id', () => {
    const twins: Quiz = { ...mini, items: [item('zeta', { a: 1 }), item('alpha', { a: 1 })] };
    expect(rankItems(twins, { a: 1 }, {}, flat, 1).map((r) => r.item.id)).toEqual(['alpha']);
  });
});

describe('explain', () => {
  it('names where person and item meet, strongest first', () => {
    const reasons = explain({ a: 3, b: 1, c: 0 }, item('x', { a: 0.5, b: 0.3, c: 1 }), ['a', 'b', 'c']);
    // c é a melhor dimensão do item, mas a pessoa fez 0 nela, então não vira motivo.
    expect(reasons.map((r) => r.dimension)).toEqual(['a']);
    expect(reasons[0]).toEqual({ dimension: 'a', you: 0.75, item: 0.5 });
  });

  it('keeps a second reason when it is at least half as strong', () => {
    const reasons = explain({ a: 2, b: 2, c: 0 }, item('x', { a: 1, b: 0.6, c: 1 }), ['a', 'b', 'c']);
    expect(reasons.map((r) => r.dimension)).toEqual(['a', 'b']);
  });
});

describe('recommend (real catalog)', () => {
  it('sends a drained couch person to something calm and cozy', () => {
    const result = recommend(quiz, {
      emotion: 'drained',
      answers: { weather: 'drizzle', company: 'solo', dishes: 'one-pan', soundtrack: 'lofi', appetite: 'starving' },
    });
    expect(result.profile.id).toBe('slow-simmer');
    expect(result.top).toHaveLength(3);
    expect(result.top[0]!.reasons.map((r) => r.dimension)).toContain('calm');
  });

  it('respects a 20-minute limit end to end', () => {
    const result = recommend(quiz, {
      emotion: 'restless',
      answers: { weather: 'crisp', company: 'crowd', dishes: 'whatever', soundtrack: 'brass', appetite: 'grazing' },
      maxMinutes: 20,
    });
    expect(result.top.every((r) => r.item.minutes <= 20)).toBe(true);
  });
});

describe('catalog data', () => {
  const dims = quiz.dimensions.map((d) => d.id);

  it('has exactly one profile for every pair of dimensions', () => {
    const pairs = quiz.profiles.map((p) => [...p.dimensions].sort().join('+'));
    expect(new Set(pairs).size).toBe(pairs.length);
    expect(pairs).toHaveLength((dims.length * (dims.length - 1)) / 2);
  });

  it('only uses known dimensions, and every item rates all of them in 0..1', () => {
    const options = [...quiz.emotions, ...quiz.questions.flatMap((q) => q.options)];
    for (const o of options) expect(dims).toEqual(expect.arrayContaining(Object.keys(o.points)));
    for (const i of quiz.items) {
      expect(Object.keys(i.affinity).sort()).toEqual([...dims].sort());
      for (const v of Object.values(i.affinity)) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    }
  });

  it('has unique ids', () => {
    const ids = [...quiz.items, ...quiz.emotions, ...quiz.profiles].map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('ships weights that are positive', () => {
    expect(defaultWeights.emotion).toBeGreaterThan(0);
    expect(Object.values(defaultWeights.questions).every((w) => w > 0)).toBe(true);
  });
});
