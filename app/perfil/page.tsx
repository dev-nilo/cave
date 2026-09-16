"use client";

import { useRef, useState } from "react";
import Loading from "@/components/Loading";
import { Bar, Field, PageHeader, Panel, Stat, stagger } from "@/components/ui";
import { plural, today } from "@/lib/date";
import { progress } from "@/lib/game";
import { DAILY_PILLARS, PILLARS } from "@/lib/score";
import { replaceState, setState, useMounted, useStore } from "@/lib/store";
import { DEFAULT_GOALS, type Goals, type State } from "@/lib/types";

const pillar = (key: string) => PILLARS.find((p) => p.key === key)!;

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

export default function PerfilPage() {
  const s = useStore();
  const mounted = useMounted();
  const p = progress(s, today());
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
  const unlocked = p.achievements.filter((a) => a.unlockedAt).sort((a, b) => b.unlockedAt!.localeCompare(a.unlockedAt!));
  const locked = p.achievements.filter((a) => !a.unlockedAt).sort((a, b) => b.progress - a.progress);

  if (!mounted) return <Loading />;

  return (
    <div className="space-y-3">
      <PageHeader eyebrow={`${p.xpTotal.toLocaleString("pt-BR")} XP · ${plural(dias, "dia")} de diário`} title={`Nível ${p.level}`} />

      <section className="panel-dark rise p-5" style={stagger(1)}>
        <span className="eyebrow eyebrow-dark mb-2">Próximo nível</span>
        <div className="flex items-end justify-between gap-4">
          <Stat value={String(p.levelNeed - p.levelXp)} unit="XP restantes" color="var(--dark-ink)" />
          <p className="t-small pb-1 text-right" style={{ color: "var(--dark-ink-2)" }}>
            {p.unlockedCount} de {p.achievements.length}
            <br />
            conquistas
          </p>
        </div>
        <div className="mt-5">
          <Bar value={p.levelPct} color="var(--dark-label)" height={6} track="rgba(255, 255, 243, 0.16)" />
        </div>
      </section>

      <Panel index={2} eyebrow="Consistência" title="Sequências">
        <ul>
          {DAILY_PILLARS.map((k) => (
            <li key={k} className="row flex items-center gap-3 py-2.5 first:pt-0">
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: pillar(k).color }} />
              <span className="t-small flex-1" style={{ color: "var(--title)" }}>{pillar(k).label}</span>
              <span className="t-small tabular-nums" style={{ color: p.pillarStreaks[k] ? "var(--title)" : "var(--body-3)", fontWeight: 600 }}>
                {p.pillarStreaks[k] ? plural(p.pillarStreaks[k], "dia") : "—"}
              </span>
            </li>
          ))}
        </ul>
        <p className="t-micro mt-3" style={{ color: "var(--body-3)" }}>
          Dias seguidos com o pilar acima de 80%. Zera no primeiro dia abaixo.
        </p>
      </Panel>

      <Panel index={3} eyebrow="Conquistas" title={unlocked.length ? "Desbloqueadas" : "Nenhuma ainda"} right={`${p.unlockedCount} / ${p.achievements.length}`}>
        {unlocked.length > 0 && (
          <ul className="mb-4">
            {unlocked.map((a) => (
              <li key={a.key} className="row flex items-center gap-3 py-3 first:pt-0">
                <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--accent)" }}>
                  <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                    <path d="M1.5 5.8 5 9.3 12.5 1.8" stroke="#fffff3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="t-small" style={{ color: "var(--title)", fontWeight: 600 }}>{a.title}</div>
                  <div className="t-micro" style={{ color: "var(--body-2)" }}>{a.desc}</div>
                </div>
                <span className="t-micro shrink-0 tabular-nums" style={{ color: "var(--body-3)" }}>
                  {a.unlockedAt!.split("-").reverse().slice(0, 2).join("/")}
                </span>
              </li>
            ))}
          </ul>
        )}
        {locked.length > 0 && (
          <>
            <span className="eyebrow mb-2">A caminho</span>
            <ul>
              {locked.map((a) => (
                <li key={a.key} className="row py-3 first:pt-0">
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="t-small" style={{ color: "var(--title)" }}>{a.title}</span>
                    <span className="t-micro tabular-nums" style={{ color: "var(--body-3)" }}>{Math.round(a.progress * 100)}%</span>
                  </div>
                  <div className="t-micro mb-2" style={{ color: "var(--body-2)" }}>{a.desc}</div>
                  <Bar value={a.progress} color="var(--accent)" height={6} />
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>

      <Panel index={4} eyebrow="Referência" title="Metas">
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
        index={5}
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

      <Panel index={6} eyebrow="Sobre" title="Pilares">
        <p className="t-small" style={{ color: "var(--body-2)" }}>
          Sono, exercício, alimentação, trabalho e estudos, leitura, financeiro e a roda da vida.
          Instale pelo menu do navegador (&quot;Adicionar à tela de início&quot;) para abrir offline,
          como um app.
        </p>
      </Panel>
    </div>
  );
}
