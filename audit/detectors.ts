import type { Quiz } from '../src/types';
import { decode, forEachNeighbor, type Outcome, type Simulation } from './simulate';

/**
 * Where the audit draws its lines. They're judgment calls, written down so they can be argued with.
 */
export const THRESHOLDS = {
  /** A source (emotion or question) "dominates" if it alone explains more than this of the #1 item or the profile. */
  dominant: 0.3,
  /** ...and is "decoration" if it explains less than this of the #1 item. */
  decoration: 0.02,
  /** One answer "locks in" the #1 item if that item wins this share of the combos where it was picked. */
  lockIn: 0.5,
  /** An item "hogs" first place above this multiple of its fair share of #1s. */
  hogShare: 3,
  /** A profile is overrepresented above this multiple of the uniform share. */
  profileSkew: 2.5,
  /** Top 3 is "jumpy" if more than this share of single-answer changes replace all three items. */
  jumpy: 0.15,
  /** Top 3 is "sticky" if more than this share of single-answer changes leave it identical. */
  sticky: 0.8,
  /** Option point budgets may differ from their question's median by this much (relative). */
  budgetDrift: 0.25,
  /** A time limit should leave at least this many items to choose from. */
  minEligible: 3,
} as const;

export interface Flag {
  check: string;
  message: string;
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

// --- 1. influence: does one answer (or the emotion) decide everything? -------------------

export interface Influence {
  source: string;
  label: string;
  /** How often changing only this answer changes the #1 item. */
  flipRate: number;
  /** How much knowing this answer tells you about the #1 item (0..1, see `explained`). */
  explainsTop: number;
  /** Same, for the profile. */
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
        check: 'influence',
        message: `\`${row.source}\` dominates: it alone explains ${pct(row.explainsTop)} of the #1 dish and ${pct(row.explainsProfile)} of the profile.`,
      });
    } else if (row.explainsTop < THRESHOLDS.decoration) {
      flags.push({ check: 'influence', message: `\`${row.source}\` is decoration: it explains only ${pct(row.explainsTop)} of the #1 dish.` });
    }
  }
  return { rows, flags };
}

/**
 * Mutual information between one source and an outcome, as a share of the outcome's entropy:
 * 0 = knowing this answer tells you nothing about the result, 1 = it tells you everything.
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

// --- 2. lock-in: does a single answer pick the dish no matter what else you say? --------

export interface LockIn {
  source: string;
  option: string;
  item: string;
  share: number;
}

export function findLockIns(sim: Simulation): { rows: LockIn[]; flags: Flag[] } {
  // counts[source][option][item] = how often `item` was #1 when `option` was picked
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
    .map((r) => ({ check: 'lock-in', message: `picking \`${r.source}=${r.option}\` makes \`${r.item}\` #1 in ${pct(r.share)} of combos.` }));
  return { rows, flags };
}

// --- 3. coverage: does every item get a chance? -------------------------------------------

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
    if (row.appearances === 0) flags.push({ check: 'coverage', message: `\`${row.item}\` never appears in any top 3.` });
    else if (row.firsts === 0) flags.push({ check: 'coverage', message: `\`${row.item}\` never reaches #1 (shows up in ${row.appearances} top 3s).` });
    else if (row.firsts / n > fair * THRESHOLDS.hogShare) {
      flags.push({ check: 'coverage', message: `\`${row.item}\` is #1 in ${pct(row.firsts / n)} of combos (fair share is ${pct(fair)}).` });
    }
  }
  return { rows, flags };
}

// --- 4. profiles: are some personalities impossible, or everywhere? -----------------------

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

  // Normalised Shannon entropy: 1 = perfectly even, 0 = everyone gets the same profile.
  const h = rows.reduce((sum, r) => (r.share > 0 ? sum - r.share * Math.log(r.share) : sum), 0);
  const entropy = rows.length > 1 ? h / Math.log(rows.length) : 1;

  const fair = 1 / sim.profileIds.length;
  const flags: Flag[] = [];
  for (const row of rows) {
    if (row.count === 0) flags.push({ check: 'profiles', message: `profile \`${row.profile}\` is unreachable.` });
    else if (row.share > fair * THRESHOLDS.profileSkew) {
      flags.push({ check: 'profiles', message: `profile \`${row.profile}\` gets ${pct(row.share)} of people (uniform would be ${pct(fair)}).` });
    }
  }
  return { rows, entropy, flags };
}

// --- 5. stability: does changing one answer change too much, or nothing? ------------------

export interface Stability {
  pairs: number;
  /** Mean number of items shared by the two top 3s (0..3). */
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
    flags.push({ check: 'stability', message: `jumpy: ${pct(stats.fullyReplaced)} of single-answer changes replace the whole top 3.` });
  }
  if (stats.identical > THRESHOLDS.sticky) {
    flags.push({ check: 'stability', message: `sticky: ${pct(stats.identical)} of single-answer changes leave the top 3 untouched.` });
  }
  return { stats, flags };
}

// --- 6. static checks on the data itself ---------------------------------------------------

export interface Budget {
  source: string;
  option: string;
  points: number;
  median: number;
}

/** Within one question (or the emotion list), every option should hand out about the same points. */
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
    .map((r) => ({ check: 'budget', message: `\`${r.source}=${r.option}\` hands out ${r.points} points; its siblings hand out ~${r.median}.` }));
  return { rows, flags };
}

export interface Eligibility {
  label: string;
  minutes: number | null;
  eligible: number;
}

/** A hard filter that leaves one or two items isn't a recommendation, it's a coin flip. */
export function checkTimeLimits(quiz: Quiz): { rows: Eligibility[]; flags: Flag[] } {
  const rows = quiz.timeLimits.map(({ label, minutes }) => ({
    label,
    minutes,
    eligible: quiz.items.filter((i) => minutes == null || i.minutes <= minutes).length,
  }));
  const flags = rows
    .filter((r) => r.eligible < THRESHOLDS.minEligible)
    .map((r) => ({ check: 'filters', message: `time limit "${r.label}" leaves only ${r.eligible} item(s).` }));
  return { rows, flags };
}

function medianOf(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length === 0) return 0;
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}
