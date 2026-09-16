"use client";

import { useMemo, useState } from "react";
import Loading from "@/components/Loading";
import { Bar, PageHeader, Panel, Stat, stagger } from "@/components/ui";
import {
  addDays,
  formatShort,
  monthId,
  nf,
  plural,
  sleepHours,
  today,
  weekDays,
  weekStart,
  weekdayShort,
} from "@/lib/date";
import {
  DAILY_PILLARS,
  PILLARS,
  dayScore,
  dayScores,
  hasData,
  monthMoney,
  moneyScore,
} from "@/lib/score";
import { dayXp } from "@/lib/game";
import { getDay, useMounted, useStore } from "@/lib/store";

const pillar = (key: string) => PILLARS.find((p) => p.key === key)!;

/** Rampa sequencial de uma matiz. "Sem registro" não entra na rampa. */
function seqStep(v: number): string {
  if (v < 0.2) return "var(--seq-1)";
  if (v < 0.4) return "var(--seq-2)";
  if (v < 0.6) return "var(--seq-3)";
  if (v < 0.8) return "var(--seq-4)";
  return "var(--seq-5)";
}

export default function SemanaPage() {
  const s = useStore();
  const mounted = useMounted();
  const [anchor, setAnchor] = useState(weekStart(today()));
  const [sel, setSel] = useState<{ d: string; k: string } | null>(null);
  const [table, setTable] = useState(false);
  const days = useMemo(() => weekDays(anchor), [anchor]);

  const perDay = days.map((d) => ({ d, scores: dayScores(s, d), empty: !hasData(s, d) }));

  const totals = useMemo(() => {
    const filled = days.filter((d) => hasData(s, d));
    const sono = filled
      .map((d) => sleepHours(getDay(s, d).sono.bed, getDay(s, d).sono.wake))
      .filter(Boolean);
    return {
      diasComRegistro: filled.length,
      sonoMedio: sono.length ? sono.reduce((a, b) => a + b, 0) / sono.length : 0,
      diasExercicio: days.filter((d) => getDay(s, d).exercicio.minutes > 0).length,
      minExercicio: days.reduce((a, d) => a + getDay(s, d).exercicio.minutes, 0),
      aguaMedia: filled.length
        ? filled.reduce((a, d) => a + getDay(s, d).alimentacao.water, 0) / filled.length
        : 0,
      foco: days.reduce((a, d) => a + getDay(s, d).trabalho.focus, 0),
      tarefas: days.reduce((a, d) => a + getDay(s, d).trabalho.tasks, 0),
      leitura: days.reduce((a, d) => a + getDay(s, d).leitura.minutes, 0),
      media: filled.length ? filled.reduce((a, d) => a + dayScore(s, d), 0) / filled.length : 0,
      xp: days.reduce((a, d) => a + dayXp(s, d), 0),
    };
  }, [s, days]);

  const money = monthMoney(s, monthId(anchor));
  const mScore = moneyScore(money, s.goals);
  const lastWheel = s.wheel[s.wheel.length - 1];
  const wheelScore = lastWheel
    ? Object.values(lastWheel.scores).reduce((a, b) => a + b, 0) /
      (Object.keys(lastWheel.scores).length * 10)
    : 0;

  const g = s.goals;
  const metas = [
    { key: "sono", label: "Sono médio", value: `${nf(totals.sonoMedio)}h`, pct: totals.sonoMedio / g.sonoHoras },
    { key: "exercicio", label: "Dias de exercício", value: `${plural(totals.diasExercicio, "dia")} · ${totals.minExercicio} min`, pct: totals.diasExercicio / g.exercicioDias },
    { key: "alimentacao", label: "Água por dia", value: `${nf(totals.aguaMedia)} copos`, pct: totals.aguaMedia / g.aguaCopos },
    { key: "trabalho", label: "Foco na semana", value: `${nf(totals.foco / 60)}h · ${plural(totals.tarefas, "tarefa")}`, pct: totals.foco / (g.focoMin * 5) },
    { key: "leitura", label: "Leitura na semana", value: `${totals.leitura} min`, pct: totals.leitura / (g.leituraMin * 7) },
    { key: "financeiro", label: "Finanças do mês", value: `${Math.round(money.usoOrcamento * 100)}% do orçamento`, pct: mScore },
    ...(lastWheel
      ? [{ key: "roda", label: "Wheel of Life", value: `${nf(wheelScore * 10)} / 10`, pct: wheelScore }]
      : []),
  ];

  const selDetail = sel
    ? (() => {
        const d = getDay(s, sel.d);
        const sc = dayScores(s, sel.d)[sel.k as keyof ReturnType<typeof dayScores>];
        const txt: Record<string, string> = {
          sono: `${nf(sleepHours(d.sono.bed, d.sono.wake) || 0)}h, qualidade ${d.sono.quality || "–"}/5`,
          exercicio: `${d.exercicio.minutes} min${d.exercicio.kind ? ` · ${d.exercicio.kind}` : ""}`,
          alimentacao: `qualidade ${d.alimentacao.quality || "–"}/5, ${d.alimentacao.water} copos${d.alimentacao.junk ? ", besteira" : ""}`,
          trabalho: `${d.trabalho.focus} min de foco, ${plural(d.trabalho.tasks, "tarefa")}`,
          leitura: `${d.leitura.minutes} min${d.leitura.book ? ` · ${d.leitura.book}` : ""}`,
        };
        return `${formatShort(sel.d)} · ${pillar(sel.k).label}: ${txt[sel.k]} (${Math.round(sc * 100)}%)`;
      })()
    : null;

  if (!mounted) return <Loading />;

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow={`${formatShort(days[0])} – ${formatShort(days[6])}`}
        title="Semana"
        prevLabel="Semana anterior"
        nextLabel="Próxima semana"
        onPrev={() => setAnchor(addDays(anchor, -7))}
        onNext={() => setAnchor(addDays(anchor, 7))}
        nextDisabled={anchor >= weekStart(today())}
      />

      <section className="panel-dark rise p-5" style={stagger(1)}>
        <span className="eyebrow eyebrow-dark mb-2">Média da semana</span>
        <div className="flex items-end justify-between gap-4">
          <Stat value={String(Math.round(totals.media * 100))} unit="/ 100" color="var(--dark-ink)" />
          <div className="pb-1 text-right">
            <p className="t-small" style={{ color: "var(--dark-ink)" }}>
              +{totals.xp.toLocaleString("pt-BR")} XP na semana
            </p>
            <p className="t-micro" style={{ color: "var(--dark-ink-2)" }}>
              {totals.diasComRegistro} de 7 dias registrados
            </p>
          </div>
        </div>
      </section>

      <Panel
        index={2}
        eyebrow="Visão geral"
        title="Mapa da semana"
        right={
          <button className="btn-ghost" onClick={() => setTable((t) => !t)}>
            {table ? "ver mapa" : "ver tabela"}
          </button>
        }
      >
        {table ? (
          <div className="overflow-x-auto">
            <table className="t-small w-full tabular-nums">
              <thead>
                <tr>
                  <th className="eyebrow p-1 text-left">Pilar</th>
                  {days.map((d) => (
                    <th key={d} className="eyebrow p-1">
                      {weekdayShort(d)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAILY_PILLARS.map((k) => (
                  <tr key={k} className="row">
                    <td className="py-2 pr-2 whitespace-nowrap" style={{ color: "var(--title)" }}>
                      {pillar(k).short}
                    </td>
                    {perDay.map((p) => (
                      <td
                        key={p.d}
                        className="p-1 text-center"
                        style={{ color: p.empty ? "var(--body-3)" : "var(--body)" }}
                      >
                        {p.empty ? "–" : Math.round(p.scores[k] * 100)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <div
              className="grid gap-1.5"
              style={{ gridTemplateColumns: "auto repeat(7, minmax(0,1fr))" }}
            >
              <div />
              {days.map((d) => (
                <div key={d} className="eyebrow pb-1 text-center">
                  {weekdayShort(d)}
                </div>
              ))}
              {DAILY_PILLARS.map((k) => (
                <div key={k} className="contents">
                  <div className="flex items-center gap-1.5 pr-2 whitespace-nowrap">
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: pillar(k).color }}
                    />
                    <span className="t-micro" style={{ color: "var(--title)" }}>
                      {pillar(k).short}
                    </span>
                  </div>
                  {perDay.map((p) => (
                    <button
                      key={p.d + k}
                      onClick={() => setSel({ d: p.d, k })}
                      aria-label={`${pillar(k).label} em ${formatShort(p.d)}: ${p.empty ? "sem registro" : Math.round(p.scores[k] * 100) + "%"}`}
                      className="h-9 rounded-lg"
                      style={{
                        background: p.empty ? "transparent" : seqStep(p.scores[k]),
                        border: p.empty
                          ? "1px dashed var(--line-2)"
                          : `2px solid ${sel?.d === p.d && sel?.k === k ? "var(--title)" : "transparent"}`,
                        transition: "border-color 150ms ease",
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>

            <p className="t-micro mt-4 min-h-8" style={{ color: "var(--body-2)" }}>
              {selDetail ?? "Toque numa célula para ver o detalhe."}
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="chip gap-1">
                <span className="t-micro" style={{ color: "var(--body-3)" }}>
                  0%
                </span>
                {["var(--seq-1)", "var(--seq-2)", "var(--seq-3)", "var(--seq-4)", "var(--seq-5)"].map(
                  (c) => (
                    <span key={c} className="h-2.5 w-4 rounded-full" style={{ background: c }} />
                  ),
                )}
                <span className="t-micro" style={{ color: "var(--body-3)" }}>
                  100%
                </span>
              </span>
              <span className="chip">
                <span
                  className="h-2.5 w-4 rounded-full"
                  style={{ border: "1px dashed var(--line-2)" }}
                />
                sem registro
              </span>
            </div>
          </>
        )}
      </Panel>

      <Panel index={3} eyebrow="Progresso" title="Metas da semana">
        <ul>
          {metas.map((m) => (
            <li key={m.key} className="row py-3 first:pt-0">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <span className="t-small flex items-center gap-2" style={{ color: "var(--title)" }}>
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: pillar(m.key).color }}
                  />
                  {m.label}
                </span>
                <span className="t-small tabular-nums" style={{ color: "var(--body-2)" }}>
                  {m.value}
                </span>
              </div>
              <Bar value={m.pct} color={pillar(m.key).color} height={6} />
            </li>
          ))}
        </ul>
      </Panel>

      {totals.diasComRegistro < 7 && (
        <Panel index={4} eyebrow="Lembrete" title="Dias em branco">
          <p className="t-small" style={{ color: "var(--body-2)" }}>
            {`${7 - totals.diasComRegistro === 1 ? "Falta" : "Faltam"} ${plural(7 - totals.diasComRegistro, "dia")} sem nenhum registro nesta semana.`}
          </p>
        </Panel>
      )}
    </div>
  );
}
