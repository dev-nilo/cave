"use client";

import { useMemo, useState } from "react";
import Radar from "@/components/Radar";
import { PageHeader, Panel, Stat, stagger } from "@/components/ui";
import { nf, today } from "@/lib/date";
import { setState, uid, useStore } from "@/lib/store";
import { WHEEL_AREAS, type WheelArea, type WheelEntry } from "@/lib/types";

const blank = () => Object.fromEntries(WHEEL_AREAS.map((a) => [a, 5])) as Record<WheelArea, number>;

const avg = (e: WheelEntry) =>
  Object.values(e.scores).reduce((a, b) => a + b, 0) / WHEEL_AREAS.length;

export default function RodaPage() {
  const s = useStore();
  const last = s.wheel[s.wheel.length - 1];
  const prev = s.wheel[s.wheel.length - 2];
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<WheelArea, number>>(blank);

  const shown = useMemo<WheelEntry | undefined>(
    () => (editing ? { id: "draft", date: today(), scores: draft } : last),
    [editing, draft, last],
  );

  const series = shown
    ? [
        { label: editing ? "Rascunho" : "Atual", scores: shown.scores, color: "var(--p-roda)" },
        ...(prev && !editing
          ? [{ label: "Anterior", scores: prev.scores, color: "var(--body-3)", dashed: true }]
          : []),
      ]
    : [];

  const delta = last && prev ? avg(last) - avg(prev) : null;

  function save() {
    setState((p) => ({ ...p, wheel: [...p.wheel, { id: uid(), date: today(), scores: draft }] }));
    setEditing(false);
  }

  function removeEntry(id: string) {
    setState((p) => ({ ...p, wheel: p.wheel.filter((w) => w.id !== id) }));
  }

  return (
    <div className="space-y-3">
      <PageHeader eyebrow="Pilar 7" title="Wheel of Life" />

      {shown && (
        <section className="panel-dark rise p-5" style={stagger(1)}>
          <span className="eyebrow eyebrow-dark mb-2">
            {editing ? "Rascunho" : "Média das áreas"}
          </span>
          <div className="flex items-end justify-between gap-4">
            <Stat
              value={nf(Object.values(shown.scores).reduce((a, b) => a + b, 0) / WHEEL_AREAS.length)}
              unit="/ 10"
              color="var(--dark-ink)"
            />
            {delta !== null && !editing && (
              <p className="t-small pb-1 text-right" style={{ color: "var(--dark-ink-2)" }}>
                {delta >= 0 ? "+" : "−"}
                {nf(Math.abs(delta))} desde
                <br />a avaliação anterior
              </p>
            )}
          </div>
        </section>
      )}

      <Panel index={2} eyebrow="Panorama" title={editing ? "Ajustando notas" : "As oito áreas"}>
        {shown ? (
          <Radar series={series} />
        ) : (
          <p className="t-small py-6 text-center" style={{ color: "var(--body-3)" }}>
            Nenhuma avaliação ainda. Dê uma nota de 0 a 10 para cada área e repita a cada mês.
          </p>
        )}
      </Panel>

      {editing ? (
        <Panel index={3} eyebrow="Nova avaliação" title="Nota por área">
          <ul>
            {WHEEL_AREAS.map((a) => (
              <li key={a} className="row py-3 first:pt-0">
                <div className="mb-1.5 flex items-baseline justify-between">
                  <label htmlFor={`area-${a}`} className="t-small" style={{ color: "var(--title)" }}>
                    {a}
                  </label>
                  <span
                    className="t-small tabular-nums"
                    style={{ color: "var(--title)", fontWeight: 600 }}
                  >
                    {draft[a]}
                  </span>
                </div>
                <input
                  id={`area-${a}`}
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={draft[a]}
                  onChange={(e) => setDraft({ ...draft, [a]: Number(e.target.value) })}
                  className="w-full"
                  style={{ accentColor: "var(--p-roda)" }}
                />
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <button className="btn flex-1" onClick={() => setEditing(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary flex-1" onClick={save}>
              Salvar
            </button>
          </div>
        </Panel>
      ) : (
        <button
          className="btn btn-primary rise w-full"
          style={stagger(3)}
          onClick={() => {
            setDraft(last ? { ...last.scores } : blank());
            setEditing(true);
          }}
        >
          Nova avaliação →
        </button>
      )}

      {last && !editing && (
        <Panel index={4} eyebrow="Detalhe" title="Notas por área">
          <ul className="grid grid-cols-2 gap-x-5">
            {WHEEL_AREAS.map((a) => (
              <li key={a} className="flex items-baseline justify-between border-b py-2.5" style={{ borderColor: "var(--line)" }}>
                <span className="t-small" style={{ color: "var(--body-2)" }}>
                  {a}
                </span>
                <span className="t-body tabular-nums" style={{ color: "var(--title)", fontWeight: 600 }}>
                  {last.scores[a]}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {s.wheel.length > 0 && (
        <Panel index={5} eyebrow="Histórico" title="Avaliações" right={`${s.wheel.length}`}>
          <ul>
            {[...s.wheel].reverse().map((w) => (
              <li key={w.id} className="row flex items-center gap-3 py-3 first:pt-0">
                <span className="t-small flex-1" style={{ color: "var(--title)" }}>
                  {w.date.split("-").reverse().join("/")}
                </span>
                <span className="t-small tabular-nums" style={{ color: "var(--body-2)" }}>
                  {nf(avg(w))} / 10
                </span>
                <button
                  onClick={() => removeEntry(w.id)}
                  aria-label={`Remover avaliação de ${w.date}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ background: "var(--panel-2)", color: "var(--body-2)" }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
