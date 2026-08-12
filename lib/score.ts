import { monthId, sleepHours } from "./date";
import { getDay } from "./store";
import type { DayId, Goals, PillarKey, State } from "./types";

export const PILLARS: {
  key: PillarKey;
  n: number;
  label: string;
  short: string;
  tiny: string;
  color: string;
  href: string;
}[] = [
  { key: "sono", tiny: "Sono", n: 1, label: "Sono", short: "Sono", color: "var(--p-sono)", href: "/" },
  { key: "exercicio", tiny: "Treino", n: 2, label: "Exercício", short: "Exercício", color: "var(--p-exercicio)", href: "/" },
  { key: "alimentacao", tiny: "Comida", n: 3, label: "Alimentação", short: "Comida", color: "var(--p-alimentacao)", href: "/" },
  { key: "trabalho", tiny: "Foco", n: 4, label: "Trabalho e Estudos", short: "Trabalho", color: "var(--p-trabalho)", href: "/" },
  { key: "leitura", tiny: "Ler", n: 5, label: "Leitura", short: "Leitura", color: "var(--p-leitura)", href: "/" },
  { key: "financeiro", tiny: "Grana", n: 6, label: "Financeiro", short: "Finanças", color: "var(--p-financeiro)", href: "/financeiro" },
  { key: "roda", tiny: "Roda", n: 7, label: "Wheel of Life", short: "Roda", color: "var(--p-roda)", href: "/roda" },
];

/** Os cinco pilares medidos diariamente (financeiro é mensal, roda é periódica). */
export const DAILY_PILLARS = ["sono", "exercicio", "alimentacao", "trabalho", "leitura"] as const;
export type DailyPillar = (typeof DAILY_PILLARS)[number];

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Pontuação 0–1 de cada pilar diário. */
export function dayScores(s: State, id: DayId): Record<DailyPillar, number> {
  const d = getDay(s, id);
  const g = s.goals;

  const horas = sleepHours(d.sono.bed, d.sono.wake);
  const sono = horas
    ? clamp01(horas / g.sonoHoras) * 0.7 + (d.sono.quality / 5) * 0.3
    : (d.sono.quality / 5) * 0.3;

  const exercicio = clamp01(d.exercicio.minutes / Math.max(1, g.exercicioMin));

  const alimentacao = clamp01(
    (d.alimentacao.quality / 5) * 0.6 +
      clamp01(d.alimentacao.water / Math.max(1, g.aguaCopos)) * 0.4 -
      (d.alimentacao.junk ? 0.15 : 0),
  );

  const trabalho = clamp01(d.trabalho.focus / Math.max(1, g.focoMin));
  const leitura = clamp01(d.leitura.minutes / Math.max(1, g.leituraMin));

  return { sono, exercicio, alimentacao, trabalho, leitura };
}

export function dayScore(s: State, id: DayId): number {
  const sc = dayScores(s, id);
  return DAILY_PILLARS.reduce((a, k) => a + sc[k], 0) / DAILY_PILLARS.length;
}

export function hasData(s: State, id: DayId): boolean {
  const d = s.days[id];
  if (!d) return false;
  return (
    !!d.sono?.bed ||
    !!d.sono?.wake ||
    !!d.sono?.quality ||
    !!d.exercicio?.minutes ||
    !!d.alimentacao?.quality ||
    !!d.alimentacao?.water ||
    !!d.trabalho?.focus ||
    !!d.trabalho?.tasks ||
    !!d.leitura?.minutes ||
    !!d.note
  );
}

/** Sequência de dias consecutivos, até hoje, com pontuação ≥ limiar. */
export function streak(s: State, todayId: DayId, threshold = 0.6): number {
  let n = 0;
  const d = new Date(todayId + "T00:00:00");
  for (let i = 0; i < 400; i++) {
    const id = d.toISOString().slice(0, 10);
    if (!hasData(s, id) || dayScore(s, id) < threshold) break;
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export type Money = {
  entradas: number;
  saidas: number;
  saldo: number;
  usoOrcamento: number; // 0–1+
  porCategoria: { category: string; total: number }[];
};

export function monthMoney(s: State, month: string): Money {
  const txs = s.txs.filter((t) => monthId(t.date) === month);
  const entradas = txs.filter((t) => t.kind === "entrada").reduce((a, t) => a + t.amount, 0);
  const saidas = txs.filter((t) => t.kind === "saida").reduce((a, t) => a + t.amount, 0);
  const byCat = new Map<string, number>();
  for (const t of txs) {
    if (t.kind !== "saida") continue;
    byCat.set(t.category, (byCat.get(t.category) ?? 0) + t.amount);
  }
  return {
    entradas,
    saidas,
    saldo: entradas - saidas,
    usoOrcamento: saidas / Math.max(1, s.goals.orcamentoMensal),
    porCategoria: [...byCat.entries()]
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total),
  };
}

/** Pontuação 0–1 do pilar financeiro no mês: gastar dentro do orçamento e poupar. */
export function moneyScore(m: Money, g: Goals): number {
  const dentro = clamp01(1 - Math.max(0, m.usoOrcamento - 1));
  const poupou = clamp01(m.saldo / Math.max(1, g.poupancaMensal));
  return dentro * 0.5 + poupou * 0.5;
}
