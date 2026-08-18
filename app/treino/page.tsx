"use client";

import Loading from "@/components/Loading";
import { Field, PageHeader, Panel, stagger } from "@/components/ui";
import { formatShort, today, weekdayShort } from "@/lib/date";
import { PILLARS } from "@/lib/score";
import { getDay, setState, useMounted, useStore } from "@/lib/store";
import { SESSION_MINUTES, WARMUP, WEEKS, planSessions, type PlannedSession } from "@/lib/plan";

const pillar = PILLARS.find((p) => p.key === "exercicio")!;

export default function TreinoPage() {
  const s = useStore();
  const mounted = useMounted();
  const inicio = s.treinoInicio ?? today();
  const sessions = planSessions(inicio);
  const weeks = [0, 1, 2, 3].map((w) => sessions.filter((p) => p.week === w));

  function setInicio(id: string) {
    setState((prev) => ({ ...prev, treinoInicio: id || null }));
  }

  function marcar(p: PlannedSession) {
    const done = getDay(s, p.date).exercicio.kind === p.session.label && getDay(s, p.date).exercicio.minutes > 0;
    setState((prev) => {
      const base = getDay(prev, p.date);
      return {
        ...prev,
        days: {
          ...prev.days,
          [p.date]: {
            ...base,
            exercicio: done ? { minutes: 0, kind: "" } : { minutes: SESSION_MINUTES, kind: p.session.label },
          },
        },
      };
    });
  }

  if (!mounted) return <Loading />;

  return (
    <div className="space-y-3">
      <PageHeader eyebrow="Plano de 4 semanas" title="Treino" />

      <Panel index={1} eyebrow="Superior/Inferior" title="Início do plano" color={pillar.color}>
        <p className="t-small mb-3" style={{ color: "var(--body-2)" }}>
          4 dias por semana, 50 min por sessão, ritmo de treino/treino/descanso/treino/treino/descanso/descanso a
          partir da data abaixo.
        </p>
        <Field label="Primeiro treino">
          <input
            type="date"
            className="field"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
          />
        </Field>
      </Panel>

      <Panel index={2} eyebrow="Antes de cada sessão" title="Aquecimento">
        <ul className="space-y-2">
          {WARMUP.map((w, i) => (
            <li key={i} className="t-small flex gap-2" style={{ color: "var(--body-2)" }}>
              <span aria-hidden style={{ color: "var(--body-3)" }}>
                {i + 1}.
              </span>
              {w}
            </li>
          ))}
        </ul>
      </Panel>

      {weeks.map((week, wi) => (
        <Panel
          key={wi}
          index={3 + wi}
          eyebrow={`Semana ${wi + 1}`}
          title={WEEKS[wi].title}
          color={pillar.color}
          right={`${formatShort(week[0].date)} – ${formatShort(week[week.length - 1].date)}`}
        >
          <p className="t-small mb-4" style={{ color: "var(--body-2)" }}>
            {WEEKS[wi].note}
          </p>
          <ul className="space-y-4">
            {week.map((p) => {
              const d = getDay(s, p.date);
              const done = d.exercicio.kind === p.session.label && d.exercicio.minutes > 0;
              return (
                <li key={p.date} className="row pb-4 last:pb-0">
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <span className="t-small" style={{ color: "var(--title)", fontWeight: 600 }}>
                      {weekdayShort(p.date)} {formatShort(p.date)} · {p.session.label}
                    </span>
                    <button
                      type="button"
                      className="btn-ghost"
                      aria-pressed={done}
                      onClick={() => marcar(p)}
                      style={done ? { color: pillar.color } : undefined}
                    >
                      {done ? "concluído ✓" : "marcar concluído"}
                    </button>
                  </div>
                  <ul className="space-y-1">
                    {p.session.exercises.map((ex, i) => (
                      <li key={i} className="t-small flex items-baseline justify-between gap-3">
                        <span style={{ color: "var(--body)" }}>
                          {ex.biset && <span style={{ color: "var(--body-3)" }}>+ </span>}
                          {ex.name}
                        </span>
                        <span className="tabular-nums shrink-0" style={{ color: "var(--body-2)" }}>
                          {ex.sets}x{ex.reps}
                          {ex.rest !== "—" && ` · ${ex.rest}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </Panel>
      ))}

      <Panel index={7} eyebrow="Fora do treino" title="Deixar mais magro">
        <p className="t-small" style={{ color: "var(--body-2)" }}>
          Este plano preserva/ganha músculo em déficit — quem decide se você fica mais magro é a dieta. Proteína
          1,8–2,2 g/kg/dia, déficit de ~300–500 kcal se emagrecimento for prioridade agora, e 2x/semana de 15–20 min
          de cardio leve fora dessas sessões, sem invadir os 50 min de treino.
        </p>
      </Panel>
    </div>
  );
}
