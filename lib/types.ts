export type DayId = string; // YYYY-MM-DD

export type PillarKey =
  | "sono"
  | "exercicio"
  | "alimentacao"
  | "trabalho"
  | "leitura"
  | "financeiro"
  | "roda";

export type Day = {
  sono: { bed: string; wake: string; quality: number }; // "23:30", "07:00", 0-5
  exercicio: { minutes: number; kind: string };
  alimentacao: { quality: number; water: number; junk: boolean }; // 0-5, copos
  trabalho: { focus: number; tasks: number }; // minutos de foco, tarefas concluídas
  leitura: { minutes: number; book: string };
  note: string;
};

export type TxKind = "saida" | "entrada";

export type Tx = {
  id: string;
  date: DayId;
  kind: TxKind;
  amount: number;
  category: string;
  note: string;
};

export const WHEEL_AREAS = [
  "Saúde",
  "Carreira",
  "Finanças",
  "Relacionamentos",
  "Família",
  "Lazer",
  "Desenvolvimento",
  "Espiritualidade",
] as const;

export type WheelArea = (typeof WHEEL_AREAS)[number];

export type WheelEntry = {
  id: string;
  date: DayId;
  scores: Record<WheelArea, number>; // 0-10
};

export type Goals = {
  sonoHoras: number;
  exercicioMin: number;
  exercicioDias: number; // dias por semana
  aguaCopos: number;
  focoMin: number;
  leituraMin: number;
  orcamentoMensal: number;
  poupancaMensal: number;
};

export type State = {
  version: 1;
  days: Record<DayId, Day>;
  txs: Tx[];
  wheel: WheelEntry[];
  goals: Goals;
};

export const DEFAULT_GOALS: Goals = {
  sonoHoras: 8,
  exercicioMin: 50,
  exercicioDias: 4,
  aguaCopos: 8,
  focoMin: 240,
  leituraMin: 20,
  orcamentoMensal: 4000,
  poupancaMensal: 1000,
};

export const EMPTY_DAY: Day = {
  sono: { bed: "", wake: "", quality: 0 },
  exercicio: { minutes: 0, kind: "" },
  alimentacao: { quality: 0, water: 0, junk: false },
  trabalho: { focus: 0, tasks: 0 },
  leitura: { minutes: 0, book: "" },
  note: "",
};

export const CATEGORIES = [
  "Moradia",
  "Mercado",
  "Transporte",
  "Saúde",
  "Lazer",
  "Educação",
  "Assinaturas",
  "Outros",
];
