import { quiz } from '../src/data';
import { recommend } from '../src/engine';
import type { Input, Recommendation, Result } from '../src/types';

// Uma tela por passo: a emoção, cada pergunta e, por fim, os limites opcionais.
type Step = { kind: 'emotion' } | { kind: 'question'; index: number } | { kind: 'limits' } | { kind: 'result'; result: Result };

const app = document.querySelector<HTMLElement>('#app')!;
const totalSteps = quiz.questions.length + 2;

let step: Step = { kind: 'emotion' };
let input: Input = { emotion: '', answers: {}, maxMinutes: null, craving: null };

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const pct = (x: number) => `${Math.round(x * 100)}%`;
const dimLabel = (id: string) => quiz.dimensions.find((d) => d.id === id)?.label ?? id;

function go(next: Step) {
  step = next;
  render();
  app.querySelector<HTMLElement>('h1, h2')?.focus();
}

function render() {
  app.innerHTML = step.kind === 'result' ? resultView(step.result) : questionView();
}

function questionView(): string {
  const position = step.kind === 'emotion' ? 1 : step.kind === 'question' ? step.index + 2 : totalSteps;
  const back = position > 1 ? '<button class="ghost" data-action="back">← back</button>' : '<span></span>';
  const header = `<div class="topbar">${back}<span class="progress" aria-label="step ${position} of ${totalSteps}">${position} / ${totalSteps}</span></div>
    <div class="bar"><div style="width:${(position / totalSteps) * 100}%"></div></div>`;

  if (step.kind === 'emotion') {
    return `${header}
      <p class="eyebrow">what should i cook tonight?</p>
      <h1 tabindex="-1">first things first. how are you feeling?</h1>
      <div class="options">${quiz.emotions.map((e) => choice('emotion', e.id, e.label, input.emotion === e.id)).join('')}</div>`;
  }

  if (step.kind === 'question') {
    const q = quiz.questions[step.index]!;
    return `${header}
      <h2 tabindex="-1">${escape(q.prompt)}</h2>
      <div class="options">${q.options.map((o) => choice('answer', o.id, o.label, input.answers[q.id] === o.id)).join('')}</div>`;
  }

  return `${header}
    <h2 tabindex="-1">any rules?</h2>
    <p class="hint">time is a hard limit. the craving is just a nudge.</p>
    <fieldset><legend>how long have you got?</legend>
      <div class="chips">${quiz.timeLimits
        .map((t) => chip('time', String(t.minutes), t.label, (input.maxMinutes ?? null) === t.minutes))
        .join('')}</div>
    </fieldset>
    <fieldset><legend>craving anything?</legend>
      <div class="chips">${[{ tag: '', label: 'surprise me' }, ...quiz.cravings]
        .map((c) => chip('craving', c.tag, c.label, (input.craving ?? '') === c.tag))
        .join('')}</div>
    </fieldset>
    <button class="primary" data-action="finish">show me dinner</button>`;
}

function resultView(result: Result): string {
  const total = Object.values(result.scores).reduce((x, y) => x + y, 0);
  const mix = quiz.dimensions
    .map((d) => ({ d, share: total ? (result.scores[d.id] ?? 0) / total : 0 }))
    .sort((a, b) => b.share - a.share)
    .map(({ d, share }) => `<li><span>${escape(d.label)}</span><div class="meter"><div style="width:${pct(share)}"></div></div><span class="num">${pct(share)}</span></li>`)
    .join('');

  const cards = result.top.length
    ? result.top.map(card).join('')
    : '<p class="hint">nothing fits that time limit. maybe order in?</p>';

  return `<p class="eyebrow">you are</p>
    <h1 tabindex="-1">${escape(result.profile.name)}</h1>
    <p class="lede">${escape(result.profile.blurb)}</p>
    <ol class="cards">${cards}</ol>
    <details><summary>show the math</summary>
      <p class="hint">your answers, as a mix of the five dimensions. dishes are ranked by how closely their own mix matches yours (cosine similarity).</p>
      <ul class="mix">${mix}</ul>
    </details>
    <button class="primary" data-action="restart">start over</button>`;
}

function card(r: Recommendation, rank: number): string {
  const why = r.reasons
    .map((x) => `<li><strong>${escape(dimLabel(x.dimension))}</strong> <span>you ${pct(x.you)} · it ${pct(x.item)}</span></li>`)
    .join('');
  return `<li class="card">
    <div class="rank">${rank + 1}</div>
    <div>
      <h3>${escape(r.item.name)}</h3>
      <p>${escape(r.item.blurb)}</p>
      <p class="meta">${r.item.minutes} min · ${pct(Math.min(r.score, 1))} match${r.craved ? ' · <span class="badge">matches your craving</span>' : ''}</p>
      <ul class="why" aria-label="why this dish">${why}</ul>
    </div>
  </li>`;
}

const choice = (kind: string, id: string, label: string, selected: boolean) =>
  `<button class="option${selected ? ' selected' : ''}" data-${kind}="${escape(id)}">${escape(label)}</button>`;

const chip = (kind: string, value: string, label: string, selected: boolean) =>
  `<button class="chip${selected ? ' selected' : ''}" aria-pressed="${selected}" data-${kind}="${escape(value)}">${escape(label)}</button>`;

app.addEventListener('click', (event) => {
  const el = (event.target as HTMLElement).closest<HTMLElement>('button');
  if (!el) return;
  const { emotion, answer, time, craving, action } = el.dataset;

  if (emotion !== undefined) {
    input = { ...input, emotion };
    go({ kind: 'question', index: 0 });
  } else if (answer !== undefined && step.kind === 'question') {
    const q = quiz.questions[step.index]!;
    input = { ...input, answers: { ...input.answers, [q.id]: answer } };
    go(step.index + 1 < quiz.questions.length ? { kind: 'question', index: step.index + 1 } : { kind: 'limits' });
  } else if (time !== undefined) {
    input = { ...input, maxMinutes: time === 'null' ? null : Number(time) };
    render();
  } else if (craving !== undefined) {
    input = { ...input, craving: craving || null };
    render();
  } else if (action === 'finish') {
    go({ kind: 'result', result: recommend(quiz, input) });
  } else if (action === 'back') {
    if (step.kind === 'limits') go({ kind: 'question', index: quiz.questions.length - 1 });
    else if (step.kind === 'question') go(step.index === 0 ? { kind: 'emotion' } : { kind: 'question', index: step.index - 1 });
  } else if (action === 'restart') {
    input = { emotion: '', answers: {}, maxMinutes: null, craving: null };
    go({ kind: 'emotion' });
  }
});

render();
