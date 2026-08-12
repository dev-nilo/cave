"use client";

import { useMemo, useState } from "react";
import Loading from "@/components/Loading";
import { Bar, Field, PageHeader, Panel, Stat, stagger } from "@/components/ui";
import { brl, monthId, monthLabel, today } from "@/lib/date";
import { monthMoney, moneyScore } from "@/lib/score";
import { setState, uid, useMounted, useStore } from "@/lib/store";
import { CATEGORIES, type TxKind } from "@/lib/types";

function shiftMonth(m: string, n: number): string {
  const [y, mo] = m.split("-").map(Number);
  const d = new Date(y, mo - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function FinanceiroPage() {
  const s = useStore();
  const mounted = useMounted();
  const [month, setMonth] = useState(monthId(today()));
  const [kind, setKind] = useState<TxKind>("saida");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(today());

  const m = useMemo(() => monthMoney(s, month), [s, month]);
  const score = moneyScore(m, s.goals);
  const txs = useMemo(
    () => s.txs.filter((t) => monthId(t.date) === month).sort((a, b) => b.date.localeCompare(a.date)),
    [s.txs, month],
  );
  const maxCat = m.porCategoria[0]?.total ?? 1;

  function add(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount.replace(",", "."));
    if (!value || value <= 0) return;
    setState((prev) => ({
      ...prev,
      txs: [
        ...prev.txs,
        { id: uid(), date, kind, amount: value, category: kind === "entrada" ? "Entrada" : category, note },
      ],
    }));
    setAmount("");
    setNote("");
  }

  function remove(id: string) {
    setState((prev) => ({ ...prev, txs: prev.txs.filter((t) => t.id !== id) }));
  }

  if (!mounted) return <Loading />;

  const saldoFmt = brl(Math.abs(m.saldo)).replace("R$", "").trim();

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow={monthLabel(month)}
        title="Finanças"
        prevLabel="Mês anterior"
        nextLabel="Próximo mês"
        onPrev={() => setMonth(shiftMonth(month, -1))}
        onNext={() => setMonth(shiftMonth(month, 1))}
        nextDisabled={month >= monthId(today())}
      />

      <section className="panel-dark rise p-5" style={stagger(1)}>
        <span className="eyebrow eyebrow-dark mb-2">Saldo do mês</span>
        <Stat
          prefix={m.saldo < 0 ? "− R$" : "R$"}
          value={saldoFmt}
          color="var(--dark-ink)"
          size={46}
        />
        <dl className="mt-5 flex gap-6">
          <div>
            <dt className="eyebrow eyebrow-dark">Entradas</dt>
            <dd className="t-body tabular-nums" style={{ color: "var(--dark-ink)" }}>
              {brl(m.entradas)}
            </dd>
          </div>
          <div>
            <dt className="eyebrow eyebrow-dark">Saídas</dt>
            <dd className="t-body tabular-nums" style={{ color: "var(--dark-ink)" }}>
              {brl(m.saidas)}
            </dd>
          </div>
        </dl>
      </section>

      <Panel index={2} eyebrow="Pilar 6" title="Metas do mês" right={`${Math.round(score * 100)}%`}>
        <div className="row pb-3">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <span className="t-small" style={{ color: "var(--title)" }}>
              Orçamento
            </span>
            <span className="t-small tabular-nums" style={{ color: "var(--body-2)" }}>
              {brl(m.saidas)} / {brl(s.goals.orcamentoMensal)}
            </span>
          </div>
          <Bar
            value={m.usoOrcamento}
            color={m.usoOrcamento > 1 ? "var(--danger)" : "var(--p-financeiro)"}
          />
        </div>
        <div className="pt-3">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <span className="t-small" style={{ color: "var(--title)" }}>
              Poupança
            </span>
            <span className="t-small tabular-nums" style={{ color: "var(--body-2)" }}>
              {brl(Math.max(0, m.saldo))} / {brl(s.goals.poupancaMensal)}
            </span>
          </div>
          <Bar value={m.saldo / Math.max(1, s.goals.poupancaMensal)} color="var(--accent)" />
        </div>
      </Panel>

      <Panel index={3} eyebrow="Registrar" title="Novo lançamento">
        <form onSubmit={add} className="space-y-4">
          <div
            className="flex gap-1 rounded-full p-1"
            style={{ background: "var(--panel-2)" }}
            role="tablist"
          >
            {(["saida", "entrada"] as TxKind[]).map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={kind === k}
                onClick={() => setKind(k)}
                className="min-h-10 flex-1 rounded-full text-[14px] font-semibold"
                style={{
                  background: kind === k ? "var(--title)" : "transparent",
                  color: kind === k ? "var(--action-ink)" : "var(--body-2)",
                  transition: "background-color 200ms var(--ease-bounce), color 150ms ease",
                }}
              >
                {k === "saida" ? "Saída" : "Entrada"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor">
              <input
                className="field tabular-nums"
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Field>
            <Field label="Data">
              <input
                type="date"
                className="field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
          </div>

          {kind === "saida" && (
            <div>
              <span className="eyebrow mb-1.5">Categoria</span>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => {
                  const on = category === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className="chip"
                      style={{
                        background: on ? "var(--title)" : "var(--panel-2)",
                        color: on ? "var(--action-ink)" : "var(--title)",
                        transition: "background-color 200ms var(--ease-bounce)",
                      }}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <Field label="Descrição">
            <input
              className="field"
              placeholder="opcional"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>

          <button type="submit" className="btn btn-primary w-full">
            Adicionar lançamento
          </button>
        </form>
      </Panel>

      {m.porCategoria.length > 0 && (
        <Panel index={4} eyebrow="Distribuição" title="Gastos por categoria">
          <ul>
            {m.porCategoria.map((c) => (
              <li key={c.category} className="row py-3 first:pt-0">
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <span className="t-small" style={{ color: "var(--title)" }}>
                    {c.category}
                  </span>
                  <span className="t-small tabular-nums" style={{ color: "var(--body-2)" }}>
                    {brl(c.total)}
                  </span>
                </div>
                <Bar value={c.total / maxCat} color="var(--p-financeiro)" height={6} />
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel index={5} eyebrow="Histórico" title="Lançamentos" right={`${txs.length}`}>
        {txs.length === 0 ? (
          <p className="t-small" style={{ color: "var(--body-3)" }}>
            Nada lançado neste mês.
          </p>
        ) : (
          <ul>
            {txs.map((t) => (
              <li key={t.id} className="row flex items-center gap-3 py-3 first:pt-0">
                <div className="min-w-0 flex-1">
                  <div className="t-small truncate" style={{ color: "var(--title)" }}>
                    {t.note || t.category}
                  </div>
                  <div className="t-micro" style={{ color: "var(--body-3)" }}>
                    {t.date.split("-").reverse().join("/")} · {t.category}
                  </div>
                </div>
                <span
                  className="t-small shrink-0 tabular-nums"
                  style={{
                    fontWeight: 600,
                    color: t.kind === "entrada" ? "var(--accent)" : "var(--title)",
                  }}
                >
                  {t.kind === "entrada" ? "+" : "−"} {brl(t.amount)}
                </span>
                <button
                  onClick={() => remove(t.id)}
                  aria-label={`Remover ${t.note || t.category}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "var(--panel-2)", color: "var(--body-2)" }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
