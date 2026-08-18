"use client";

import { useRef, useState } from "react";
import { Field, PageHeader, Panel } from "@/components/ui";
import { today } from "@/lib/date";
import { replaceState, setState, useStore } from "@/lib/store";
import { DEFAULT_GOALS, type Goals, type State } from "@/lib/types";

const GOAL_FIELDS: { key: keyof Goals; label: string; step?: number }[] = [
  { key: "sonoHoras", label: "Sono (h)", step: 0.5 },
  { key: "exercicioMin", label: "Exercício (min/dia)", step: 5 },
  { key: "exercicioDias", label: "Exercício (dias/semana)" },
  { key: "aguaCopos", label: "Água (copos/dia)" },
  { key: "focoMin", label: "Foco (min/dia)", step: 15 },
  { key: "leituraMin", label: "Leitura (min/dia)", step: 5 },
  { key: "orcamentoMensal", label: "Orçamento (R$/mês)", step: 100 },
  { key: "poupancaMensal", label: "Poupança (R$/mês)", step: 100 },
];

export default function AjustesPage() {
  const s = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");

  function setGoal(key: keyof Goals, value: number) {
    setState((p) => ({ ...p, goals: { ...p.goals, [key]: value } }));
  }

  function exportar() {
    const blob = new Blob([JSON.stringify(s, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pilares-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importar(file: File) {
    try {
      const parsed = JSON.parse(await file.text()) as State;
      if (typeof parsed !== "object" || !parsed || !("days" in parsed)) throw new Error();
      replaceState({
        version: 1,
        days: parsed.days ?? {},
        txs: parsed.txs ?? [],
        wheel: parsed.wheel ?? [],
        goals: { ...DEFAULT_GOALS, ...(parsed.goals ?? {}) },
        treinoInicio: parsed.treinoInicio ?? null,
      });
      setMsg("Dados importados.");
    } catch {
      setMsg("Arquivo inválido.");
    }
  }

  function apagarTudo() {
    if (!confirm("Apagar todos os registros? Isto não pode ser desfeito.")) return;
    replaceState({ version: 1, days: {}, txs: [], wheel: [], goals: DEFAULT_GOALS, treinoInicio: null });
    setMsg("Tudo apagado.");
  }

  const dias = Object.keys(s.days).length;

  return (
    <div className="space-y-3">
      <PageHeader eyebrow="Configuração" title="Ajustes" />

      <Panel index={1} eyebrow="Referência" title="Metas">
        <p className="t-small mb-4" style={{ color: "var(--body-2)" }}>
          É contra estes números que a pontuação de cada pilar é calculada.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {GOAL_FIELDS.map((f) => (
            <Field key={f.key} label={f.label}>
              <input
                type="number"
                inputMode="decimal"
                step={f.step ?? 1}
                min={0}
                className="field tabular-nums"
                value={s.goals[f.key]}
                onChange={(e) => setGoal(f.key, Number(e.target.value || 0))}
              />
            </Field>
          ))}
        </div>
      </Panel>

      <Panel
        index={2}
        eyebrow="Backup"
        title="Seus dados"
        right={`${dias} dia(s) · ${s.txs.length} lanç.`}
      >
        <p className="t-small mb-4" style={{ color: "var(--body-2)" }}>
          Tudo fica salvo só neste dispositivo, no navegador. Exporte de tempos em tempos.
        </p>
        <div className="flex flex-wrap gap-2">
          <button className="btn" onClick={exportar}>
            Exportar JSON
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            Importar JSON
          </button>
          <button className="btn" style={{ color: "var(--danger)" }} onClick={apagarTudo}>
            Apagar tudo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importar(f);
              e.target.value = "";
            }}
          />
        </div>
        {msg && (
          <p className="t-small mt-3" style={{ color: "var(--accent)" }}>
            {msg}
          </p>
        )}
      </Panel>

      <Panel index={3} eyebrow="Sobre" title="Pilares">
        <p className="t-small" style={{ color: "var(--body-2)" }}>
          Sono, exercício, alimentação, trabalho e estudos, leitura, financeiro e a roda da vida.
          Instale pelo menu do navegador (&quot;Adicionar à tela de início&quot;) para abrir offline,
          como um app.
        </p>
      </Panel>
    </div>
  );
}
