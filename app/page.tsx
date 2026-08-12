"use client";

import Link from "next/link";
import { useState } from "react";
import Loading from "@/components/Loading";
import { Bar, Field, PageHeader, Panel, Rating, Stat, Stepper, Toggle, stagger } from "@/components/ui";
import { addDays, brl, formatLong, formatShort, monthId, nf, plural, sleepHours, today } from "@/lib/date";
import { DAILY_PILLARS, PILLARS, dayScores, monthMoney, streak } from "@/lib/score";
import { useDay, useMounted, useStore } from "@/lib/store";

const pillar = (key: string) => PILLARS.find((p) => p.key === key)!;

export default function HojePage() {
  const [id, setId] = useState(today());
  const s = useStore();
  const mounted = useMounted();
  const [day, patch] = useDay(id);
  const scores = dayScores(s, id);
  const total = DAILY_PILLARS.reduce((a, k) => a + scores[k], 0) / DAILY_PILLARS.length;
  const g = s.goals;
  const horas = sleepHours(day.sono.bed, day.sono.wake);
  const money = monthMoney(s, monthId(id));
  const seq = streak(s, today());
  const isToday = id === today();
  const noVerde = DAILY_PILLARS.filter((k) => scores[k] >= 0.8).length;

  if (!mounted) return <Loading />;

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow={formatLong(id)}
        title={isToday ? "Hoje" : formatShort(id)}
        prevLabel="Dia anterior"
        nextLabel="Próximo dia"
        onPrev={() => setId(addDays(id, -1))}
        onNext={() => setId(addDays(id, 1))}
        nextDisabled={id >= today()}
      />

      {/* Painel-herói escuro: um por tela, no topo */}
      <section className="panel-dark rise p-5" style={stagger(1)}>
        <span className="eyebrow eyebrow-dark mb-2">Pontuação do dia</span>
        <div className="flex items-end justify-between gap-4">
          <Stat value={String(Math.round(total * 100))} unit="/ 100" color="var(--dark-ink)" />
          <div className="pb-1 text-right">
            <p className="t-small" style={{ color: "var(--dark-ink)" }}>
              {noVerde} de 5 pilares no verde
            </p>
            <p className="t-micro" style={{ color: "var(--dark-ink-2)" }}>
              {seq > 0
                ? `${plural(seq, "dia")} seguido${seq > 1 ? "s" : ""} acima de 60%`
                : "Sem sequência ativa"}
            </p>
          </div>
        </div>

        <ul className="mt-5 flex gap-2">
          {DAILY_PILLARS.map((k) => (
            <li key={k} className="min-w-0 flex-1">
              <Bar
                value={scores[k]}
                color={pillar(k).color}
                height={6}
                track="rgba(255, 255, 243, 0.16)"
              />
              <span
                className="mt-1.5 block truncate text-[10px] font-semibold tracking-[0.6px] uppercase"
                style={{ color: "var(--dark-ink-2)" }}
              >
                {pillar(k).tiny}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Panel
        index={2}
        eyebrow="Pilar 1"
        title="Sono"
        color={pillar("sono").color}
        right={horas ? `${nf(horas)}h / ${nf(g.sonoHoras)}h` : "—"}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Dormi às">
            <input
              type="time"
              className="field"
              value={day.sono.bed}
              onChange={(e) => patch({ sono: { ...day.sono, bed: e.target.value } })}
            />
          </Field>
          <Field label="Acordei às">
            <input
              type="time"
              className="field"
              value={day.sono.wake}
              onChange={(e) => patch({ sono: { ...day.sono, wake: e.target.value } })}
            />
          </Field>
        </div>
        <div className="mt-4">
          <span className="eyebrow mb-1.5">Qualidade</span>
          <Rating
            value={day.sono.quality}
            color={pillar("sono").color}
            onChange={(quality) => patch({ sono: { ...day.sono, quality } })}
          />
        </div>
      </Panel>

      <Panel
        index={3}
        eyebrow="Pilar 2"
        title="Exercício"
        color={pillar("exercicio").color}
        right={`${day.exercicio.minutes} / ${g.exercicioMin} min`}
      >
        <Stepper
          value={day.exercicio.minutes}
          step={10}
          max={600}
          suffix="min"
          onChange={(minutes) => patch({ exercicio: { ...day.exercicio, minutes } })}
        />
        <input
          className="field mt-3"
          placeholder="Que atividade? (corrida, academia…)"
          value={day.exercicio.kind}
          onChange={(e) => patch({ exercicio: { ...day.exercicio, kind: e.target.value } })}
        />
      </Panel>

      <Panel
        index={4}
        eyebrow="Pilar 3"
        title="Alimentação"
        color={pillar("alimentacao").color}
        right={`${day.alimentacao.water} / ${g.aguaCopos} copos`}
      >
        <span className="eyebrow mb-1.5">Qualidade das refeições</span>
        <Rating
          value={day.alimentacao.quality}
          color={pillar("alimentacao").color}
          onChange={(quality) => patch({ alimentacao: { ...day.alimentacao, quality } })}
        />
        <div className="mt-4">
          <span className="eyebrow mb-1.5">Água</span>
          <Stepper
            value={day.alimentacao.water}
            max={30}
            suffix="copos"
            onChange={(water) => patch({ alimentacao: { ...day.alimentacao, water } })}
          />
        </div>
        <div className="mt-3">
          <Toggle
            label="Comi besteira hoje"
            checked={day.alimentacao.junk}
            onChange={(junk) => patch({ alimentacao: { ...day.alimentacao, junk } })}
          />
        </div>
      </Panel>

      <Panel
        index={5}
        eyebrow="Pilar 4"
        title="Trabalho e Estudos"
        color={pillar("trabalho").color}
        right={`${Math.floor(day.trabalho.focus / 60)}h${String(day.trabalho.focus % 60).padStart(2, "0")} / ${nf(g.focoMin / 60)}h`}
      >
        <span className="eyebrow mb-1.5">Tempo de foco</span>
        <Stepper
          value={day.trabalho.focus}
          step={25}
          max={960}
          suffix="min"
          onChange={(focus) => patch({ trabalho: { ...day.trabalho, focus } })}
        />
        <div className="mt-4">
          <span className="eyebrow mb-1.5">Tarefas concluídas</span>
          <Stepper
            value={day.trabalho.tasks}
            max={50}
            onChange={(tasks) => patch({ trabalho: { ...day.trabalho, tasks } })}
          />
        </div>
      </Panel>

      <Panel
        index={6}
        eyebrow="Pilar 5"
        title="Leitura"
        color={pillar("leitura").color}
        right={`${day.leitura.minutes} / ${g.leituraMin} min`}
      >
        <Stepper
          value={day.leitura.minutes}
          step={5}
          max={600}
          suffix="min"
          onChange={(minutes) => patch({ leitura: { ...day.leitura, minutes } })}
        />
        <input
          className="field mt-3"
          placeholder="Livro"
          value={day.leitura.book}
          onChange={(e) => patch({ leitura: { ...day.leitura, book: e.target.value } })}
        />
      </Panel>

      <Panel
        index={7}
        eyebrow="Pilar 6"
        title="Financeiro"
        color={pillar("financeiro").color}
        right={
          <Link href="/financeiro" className="btn-ghost">
            abrir →
          </Link>
        }
      >
        <div className="mb-2 flex items-baseline justify-between">
          <span className="t-small" style={{ color: "var(--body-2)" }}>
            Gasto no mês
          </span>
          <span className="t-small tabular-nums" style={{ color: "var(--title)", fontWeight: 600 }}>
            {brl(money.saidas)}{" "}
            <span style={{ color: "var(--body-3)", fontWeight: 500 }}>
              / {brl(g.orcamentoMensal)}
            </span>
          </span>
        </div>
        <Bar
          value={money.usoOrcamento}
          color={money.usoOrcamento > 1 ? "var(--danger)" : pillar("financeiro").color}
        />
      </Panel>

      <Panel
        index={8}
        eyebrow="Pilar 7"
        title="Wheel of Life"
        color={pillar("roda").color}
        right={
          <Link href="/roda" className="btn-ghost">
            abrir →
          </Link>
        }
      >
        <p className="t-small" style={{ color: "var(--body-2)" }}>
          {s.wheel.length
            ? `Última avaliação em ${s.wheel[s.wheel.length - 1].date.split("-").reverse().join("/")}.`
            : "Nenhuma avaliação ainda. Vale fazer uma agora e repetir a cada mês."}
        </p>
      </Panel>

      <Panel index={9} eyebrow="Registro livre" title="Nota do dia">
        <textarea
          className="field min-h-24 resize-y"
          placeholder="Como foi o dia?"
          value={day.note}
          onChange={(e) => patch({ note: e.target.value })}
        />
      </Panel>
    </div>
  );
}
