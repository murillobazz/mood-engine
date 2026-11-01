/** Pontos ou afinidades indexados por id de dimensão. Chave ausente conta como 0. */
export type Points = Readonly<Record<string, number>>;

/** Um eixo de gosto com nome, ex.: "cozy" ou "fresh". */
export interface Dimension {
  id: string;
  label: string;
  blurb: string;
}

/** Uma resposta possível. Escolhê-la soma seus pontos à pontuação da pessoa em cada dimensão. */
export interface Option {
  id: string;
  label: string;
  points: Points;
}

/** A primeira tela: como você tá se sentindo? Mesmo formato de uma resposta, com peso próprio. */
export type Emotion = Option;

export interface Question {
  id: string;
  prompt: string;
  options: readonly Option[];
}

/** Um rótulo para a pessoa, definido pelas suas duas dimensões mais fortes. */
export interface Profile {
  id: string;
  name: string;
  blurb: string;
  dimensions: readonly [string, string];
}

/** Algo que dá pra recomendar. `affinity` diz o quanto ele combina com cada dimensão, de 0 a 1. */
export interface Item {
  id: string;
  name: string;
  blurb: string;
  minutes: number;
  tags: readonly string[];
  affinity: Points;
}

export interface TimeLimit {
  label: string;
  /** null significa "sem limite". */
  minutes: number | null;
}

export interface Craving {
  /** Corresponde a uma tag de item. */
  tag: string;
  label: string;
}

/** Tudo que o motor precisa pra rodar um quiz. Só dados, nenhum comportamento. */
export interface Quiz {
  dimensions: readonly Dimension[];
  emotions: readonly Emotion[];
  questions: readonly Question[];
  profiles: readonly Profile[];
  items: readonly Item[];
  timeLimits: readonly TimeLimit[];
  cravings: readonly Craving[];
}

/** Todo número que muda o resultado. Veja src/weights.ts para os valores usados e o porquê de cada um. */
export interface Weights {
  /** Multiplicador dos pontos da emoção escolhida. */
  emotion: number;
  /** Multiplicador por pergunta. Perguntas fora da lista usam 1. */
  questions: Readonly<Record<string, number>>;
  /** Somado à nota de um item (escala 0..1) quando ele tem a tag desejada. */
  cravingBonus: number;
}

/** O que a pessoa nos contou. */
export interface Input {
  emotion: string;
  /** questionId -> optionId. Pergunta sem resposta não soma nada. */
  answers: Readonly<Record<string, string>>;
  /** Filtro rígido: itens que demoram mais são removidos, não só penalizados. */
  maxMinutes?: number | null;
  /** Preferência suave: itens com essa tag ganham um bônus pequeno. */
  craving?: string | null;
}

/** Uma linha do "porquê": uma dimensão onde a pessoa e o item se encontram. */
export interface Reason {
  dimension: string;
  /** Fatia da pontuação total da pessoa nesta dimensão (0..1). */
  you: number;
  /** A afinidade do item com esta dimensão (0..1). */
  item: number;
}

export interface Recommendation {
  item: Item;
  /** Similaridade entre pessoa e item (0..1), mais o bônus de desejo, se houver. */
  score: number;
  reasons: Reason[];
  craved: boolean;
}

export interface Result {
  scores: Record<string, number>;
  profile: Profile;
  top: Recommendation[];
}
