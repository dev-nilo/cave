"use client";

import Link from "next/link";
import { useState } from "react";
import Loading from "@/components/Loading";
import {
  Bar,
  Check,
  Field,
  PageHeader,
  Panel,
  Rating,
  Segmented,
  Stat,
  Stepper,
  Toggle,
  stagger,
} from "@/components/ui";
import { addDays, brl, formatLong, formatShort, monthId, nf, plural, sleepHours, today } from "@/lib/date";
import { progress } from "@/lib/game";
import { PILLARS, monthMoney } from "@/lib/score";
import { useDay, useMounted, useStore } from "@/lib/store";
import type { Journal } from "@/lib/types";

const pillar = (key: string) => PILLARS.find((p) => p.key === key)!;

const MOODS = [
  { value: 1, label: "Péssimo" },
  { value: 2, label: "Ruim" },
  { value: 3, label: "Ok" },
  { value: 4, label: "Bom" },
  { value: 5, label: "Ótimo" },
];

/** Rótulo do painel de um pilar: "PILAR 2 · 3 DIAS SEGUIDOS" quando há sequência. */
const pillarEyebrow = (n: number, streak: number) =>
  streak > 1 ? `Pilar ${n} · ${streak} dias seguidos` : `Pilar ${n}`;

export default function DiarioPage() {
  const [id, setId] = useState(today());
  const s = useStore();
  const mounted = useMounted();
  const [day, patch] = useDay(id);
  const g = s.goals;
  const p = progress(s, id);
  const horas = sleepHours(day.sono.bed, day.sono.wake);
  const money = monthMoney(s, monthId(id));
  const isToday = id === today();
  const j = day.journal;
  const setJ = (part: Partial<Journal>) => patch({ journal: { ...j, ...part } });

  if (!mounted) return <Loading />;

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow={formatLong(id)}
        title={isToday ? "Diário" : formatShort(id)}
        prevLabel="Dia anterior"
        nextLabel="Próximo dia"
        onPrev={() => setId(addDays(id, -1))}
        onNext={() => setId(addDays(id, 1))}
        nextDisabled={id >= today()}
      />

      {/* Painel-herói: o progresso de hoje dentro da jornada */}
      <section className="panel-dark rise p-5" style={stagger(1)}>
        <span className="eyebrow eyebrow-dark mb-2">
          Nível {p.level} · {p.xpTotal.toLocaleString("pt-BR")} XP no total
        </span>
        <div className="flex items-end justify-between gap-4">
          <Stat value={`+${p.xpToday}`} unit="XP hoje" color="var(--dark-ink)" />
          <div className="pb-1 text-right">
            <p className="t-small" style={{ color: "var(--dark-ink)" }}>
              {p.missionsDone} de {p.missions.length} missões
            </p>
            <p className="t-micro" style={{ color: "var(--dark-ink-2)" }}>
              {p.streak > 0 ? `${plural(p.streak, "dia")} de diário seguido${p.streak > 1 ? "s" : ""}` : "Comece a sequência hoje"}
            </p>
          </div>
        </div>
        <div className="mt-5">
          <div className="mb-1.5 flex justify-between">
            <span className="text-[10px] font-semibold tracking-[0.6px] uppercase" style={{ color: "var(--dark-ink-2)" }}>
              Nível {p.level}
            </span>
            <span className="t-micro tabular-nums" style={{ color: "var(--dark-ink-2)" }}>
              {p.levelXp} / {p.levelNeed} para o nível {p.level + 1}
            </span>
          </div>
          <Bar value={p.levelPct} color="var(--dark-label)" height={6} track="rgba(255, 255, 243, 0.16)" />
        </div>
      </section>

      <Panel index={2} eyebrow="Hoje" title="Missões" right={`${p.missionsDone} / ${p.missions.length}`}>
        <ul>
          {p.missions.map((m) => (
            <li key={m.key} className="row flex items-center gap-3 py-2.5 first:pt-0">
              <Check done={m.done} color={m.pillar ? pillar(m.pillar).color : "var(--accent)"} />
              <span
                className="t-small flex-1"
                style={{
                  color: m.done ? "var(--body-3)" : "var(--title)",
                  textDecoration: m.done ? "line-through" : "none",
                  textDecorationColor: "var(--line-2)",
                }}
              >
                {m.label}
              </span>
              <span className="t-micro tabular-nums" style={{ color: "var(--body-3)" }}>
                +5 XP
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel index={3} eyebrow="Manhã" title="Como você acorda hoje?">
        <span className="eyebrow mb-1.5">Humor</span>
        <Segmented options={MOODS} value={j.mood || null} onChange={(mood) => setJ({ mood })} />
        <div className="mt-4">
          <Field label="Intenção do dia">
            <input
              className="field"
              placeholder="A única coisa que, feita, já vale o dia"
              value={j.intention}
              onChange={(e) => setJ({ intention: e.target.value })}
            />
          </Field>
        </div>
      </Panel>

      <Panel
        index={4}
        eyebrow={pillarEyebrow(1, p.pillarStreaks.sono)}
        title="Sono"
        color={pillar("sono").color}
        right={horas ? `${nf(horas)}h / ${nf(g.sonoHoras)}h` : "—"}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Dormi às">
            <input type="time" className="field" value={day.sono.bed}
              onChange={(e) => patch({ sono: { ...day.sono, bed: e.target.value } })} />
          </Field>
          <Field label="Acordei às">
            <input type="time" className="field" value={day.sono.wake}
              onChange={(e) => patch({ sono: { ...day.sono, wake: e.target.value } })} />
          </Field>
        </div>
        <div className="mt-4">
          <span className="eyebrow mb-1.5">Qualidade</span>
          <Rating value={day.sono.quality} color={pillar("sono").color}
            onChange={(quality) => patch({ sono: { ...day.sono, quality } })} />
        </div>
      </Panel>

      <Panel
        index={5}
        eyebrow={pillarEyebrow(2, p.pillarStreaks.exercicio)}
        title="Exercício"
        color={pillar("exercicio").color}
        right={`${day.exercicio.minutes} / ${g.exercicioMin} min`}
      >
        <Stepper value={day.exercicio.minutes} step={10} max={600} suffix="min"
          onChange={(minutes) => patch({ exercicio: { ...day.exercicio, minutes } })} />
        <input className="field mt-3" placeholder="Que atividade? (corrida, academia…)" value={day.exercicio.kind}
          onChange={(e) => patch({ exercicio: { ...day.exercicio, kind: e.target.value } })} />
      </Panel>

      <Panel
        index={6}
        eyebrow={pillarEyebrow(3, p.pillarStreaks.alimentacao)}
        title="Alimentação"
        color={pillar("alimentacao").color}
        right={`${day.alimentacao.water} / ${g.aguaCopos} copos`}
      >
        <span className="eyebrow mb-1.5">Qualidade das refeições</span>
        <Rating value={day.alimentacao.quality} color={pillar("alimentacao").color}
          onChange={(quality) => patch({ alimentacao: { ...day.alimentacao, quality } })} />
        <div className="mt-4">
          <span className="eyebrow mb-1.5">Água</span>
          <Stepper value={day.alimentacao.water} max={30} suffix="copos"
            onChange={(water) => patch({ alimentacao: { ...day.alimentacao, water } })} />
        </div>
        <div className="mt-3">
          <Toggle label="Comi besteira hoje" checked={day.alimentacao.junk}
            onChange={(junk) => patch({ alimentacao: { ...day.alimentacao, junk } })} />
        </div>
      </Panel>

      <Panel
        index={7}
        eyebrow={pillarEyebrow(4, p.pillarStreaks.trabalho)}
        title="Trabalho e Estudos"
        color={pillar("trabalho").color}
        right={`${Math.floor(day.trabalho.focus / 60)}h${String(day.trabalho.focus % 60).padStart(2, "0")} / ${nf(g.focoMin / 60)}h`}
      >
        <span className="eyebrow mb-1.5">Tempo de foco</span>
        <Stepper value={day.trabalho.focus} step={25} max={960} suffix="min"
          onChange={(focus) => patch({ trabalho: { ...day.trabalho, focus } })} />
        <div className="mt-4">
          <span className="eyebrow mb-1.5">Tarefas concluídas</span>
          <Stepper value={day.trabalho.tasks} max={50}
            onChange={(tasks) => patch({ trabalho: { ...day.trabalho, tasks } })} />
        </div>
      </Panel>

      <Panel
        index={8}
        eyebrow={pillarEyebrow(5, p.pillarStreaks.leitura)}
        title="Leitura"
        color={pillar("leitura").color}
        right={`${day.leitura.minutes} / ${g.leituraMin} min`}
      >
        <Stepper value={day.leitura.minutes} step={5} max={600} suffix="min"
          onChange={(minutes) => patch({ leitura: { ...day.leitura, minutes } })} />
        <input className="field mt-3" placeholder="Livro" value={day.leitura.book}
          onChange={(e) => patch({ leitura: { ...day.leitura, book: e.target.value } })} />
      </Panel>

      <Panel
        index={9}
        eyebrow="Pilar 6"
        title="Financeiro"
        color={pillar("financeiro").color}
        right={<Link href="/financeiro" className="btn-ghost">abrir →</Link>}
      >
        <div className="mb-2 flex items-baseline justify-between">
          <span className="t-small" style={{ color: "var(--body-2)" }}>Gasto no mês</span>
          <span className="t-small tabular-nums" style={{ color: "var(--title)", fontWeight: 600 }}>
            {brl(money.saidas)}{" "}
            <span style={{ color: "var(--body-3)", fontWeight: 500 }}>/ {brl(g.orcamentoMensal)}</span>
          </span>
        </div>
        <Bar value={money.usoOrcamento}
          color={money.usoOrcamento > 1 ? "var(--danger)" : pillar("financeiro").color} />
      </Panel>

      <Panel
        index={10}
        eyebrow="Pilar 7"
        title="Wheel of Life"
        color={pillar("roda").color}
        right={<Link href="/roda" className="btn-ghost">abrir →</Link>}
      >
        <p className="t-small" style={{ color: "var(--body-2)" }}>
          {s.wheel.length
            ? `Última avaliação em ${s.wheel[s.wheel.length - 1].date.split("-").reverse().join("/")}.`
            : "Nenhuma avaliação ainda. Vale fazer uma agora e repetir a cada mês."}
        </p>
      </Panel>

      <Panel index={11} eyebrow="Noite" title="Como foi o dia?">
        <Field label="Reflexão">
          <textarea
            className="field min-h-28 resize-y"
            placeholder="O que aconteceu, o que você sentiu, o que faria diferente."
            value={j.reflection}
            onChange={(e) => setJ({ reflection: e.target.value })}
          />
        </Field>
        <p className="t-micro mt-1.5" style={{ color: "var(--body-3)" }}>
          {j.reflection.trim().length >= 40
            ? "Reflexão com substância: +10 XP."
            : "A partir de 40 caracteres a reflexão vale +10 XP."}
        </p>
        <div className="mt-4 space-y-3">
          <Field label="Gratidão">
            <input className="field" placeholder="Uma coisa pela qual você é grato hoje"
              value={j.gratitude} onChange={(e) => setJ({ gratitude: e.target.value })} />
          </Field>
          <Field label="Destaque do dia">
            <input className="field" placeholder="O melhor momento"
              value={j.highlight} onChange={(e) => setJ({ highlight: e.target.value })} />
          </Field>
        </div>
      </Panel>
    </div>
  );
}
