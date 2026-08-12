"use client";

import type { CSSProperties, ReactNode } from "react";

/** Índice para o stagger de entrada (DESIGN.md §5). */
export const stagger = (i: number) => ({ "--child-index": i }) as CSSProperties;

export function Panel({
  eyebrow,
  title,
  right,
  color,
  index = 0,
  children,
  className = "",
}: {
  eyebrow?: string;
  title?: string;
  right?: ReactNode;
  color?: string;
  index?: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel rise p-5 ${className}`} style={stagger(index)}>
      {(eyebrow || title) && (
        <header className="mb-4 flex items-start gap-3">
          <div className="min-w-0 flex-1">
            {eyebrow && (
              <span className="eyebrow mb-1.5 flex items-center gap-1.5">
                {color && (
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: color }}
                  />
                )}
                {eyebrow}
              </span>
            )}
            {title && <h2 className="t-panel">{title}</h2>}
          </div>
          {right !== undefined && (
            <div
              className="t-small shrink-0 pt-0.5 tabular-nums"
              style={{ color: "var(--body-2)" }}
            >
              {right}
            </div>
          )}
        </header>
      )}
      {children}
    </section>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow mb-1.5">{label}</span>
      {children}
    </label>
  );
}

/** Sinais desenhados: ficam simétricos em qualquer fonte. */
function Sign({ plus = false }: { plus?: boolean }) {
  return (
    <span aria-hidden className="relative block h-3.5 w-3.5">
      <span
        className="absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 rounded-full"
        style={{ background: "currentColor" }}
      />
      {plus && (
        <span
          className="absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 rounded-full"
          style={{ background: "currentColor" }}
        />
      )}
    </span>
  );
}

/** Contador com passos — mais rápido no toque que digitar. */
export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 100000,
  suffix,
}: {
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  const set = (n: number) => onChange(Math.max(min, Math.min(max, n)));
  return (
    <div className="flex items-center gap-2">
      <button type="button" className="btn btn-icon" aria-label="Diminuir" onClick={() => set(value - step)}>
        <Sign />
      </button>
      <div className="field flex flex-1 items-baseline justify-center gap-1">
        <input
          type="number"
          inputMode="numeric"
          className="w-full bg-transparent text-center text-[20px] font-semibold tabular-nums outline-none"
          style={{ color: "var(--title)", letterSpacing: "-0.4px" }}
          value={value === 0 ? "" : value}
          placeholder="0"
          onChange={(e) => set(Number(e.target.value || 0))}
        />
        {suffix && (
          <span className="t-micro shrink-0" style={{ color: "var(--body-3)" }}>
            {suffix}
          </span>
        )}
      </div>
      <button type="button" className="btn btn-icon" aria-label="Aumentar" onClick={() => set(value + step)}>
        <Sign plus />
      </button>
    </div>
  );
}

/** Nota de 1 a 5 em pílulas. */
export function Rating({
  value,
  onChange,
  color = "var(--accent)",
}: {
  value: number;
  onChange: (n: number) => void;
  color?: string;
}) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="Nota de 1 a 5">
      {[1, 2, 3, 4, 5].map((n) => {
        const on = value >= n;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} de 5`}
            onClick={() => onChange(value === n ? 0 : n)}
            className="h-11 flex-1 rounded-full border text-[14px] font-semibold tabular-nums"
            style={{
              background: on ? color : "var(--panel-2)",
              borderColor: on ? color : "transparent",
              color: on ? "#fffff3" : "var(--body-3)",
              transition: "background-color 200ms var(--ease-bounce), color 200ms ease",
            }}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (b: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="t-small flex min-h-12 w-full items-center justify-between rounded-full border px-4"
      style={{
        borderColor: "var(--line-2)",
        background: checked ? "var(--accent-soft)" : "transparent",
        color: "var(--title)",
        transition: "background-color 200ms var(--ease-bounce)",
      }}
    >
      <span>{label}</span>
      <span
        aria-hidden
        className="relative h-6 w-11 shrink-0 rounded-full"
        style={{
          background: checked ? "var(--accent)" : "var(--line-2)",
          transition: "background-color 200ms var(--ease-bounce)",
        }}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full"
          style={{
            left: checked ? "1.375rem" : "0.125rem",
            background: "var(--panel)",
            transition: "left 200ms var(--ease-bounce)",
          }}
        />
      </span>
    </button>
  );
}

/** Barra de progresso: trilho neutro, preenchimento na cor do pilar. */
export function Bar({
  value,
  color = "var(--accent)",
  height = 8,
  track = "var(--panel-2)",
}: {
  value: number; // 0–1
  color?: string;
  height?: number;
  track?: string;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className="w-full overflow-hidden rounded-full"
      style={{ background: track, height }}
      role="presentation"
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: color,
          transition: "width 500ms var(--ease-quart)",
        }}
      />
    </div>
  );
}

/**
 * Número grande com prefixo e unidade alinhados ao topo — o padrão de
 * estatística do site (`flex gap-1 items-start`), nunca alinhado à linha de base.
 */
export function Stat({
  value,
  unit,
  prefix,
  color,
  size = 64,
}: {
  value: string;
  unit?: string;
  prefix?: string;
  color?: string;
  size?: number;
}) {
  const ink = color ?? "var(--title)";
  return (
    <span className="flex items-start gap-1">
      {prefix && (
        <span className="pt-2 text-[15px] font-semibold" style={{ color: ink, opacity: 0.72 }}>
          {prefix}
        </span>
      )}
      <span
        className="t-hero"
        style={{ color: ink, fontSize: size, letterSpacing: size * -0.038 }}
      >
        {value}
      </span>
      {unit && (
        <span className="t-small pt-2" style={{ color: ink, opacity: 0.72 }}>
          {unit}
        </span>
      )}
    </span>
  );
}

/** Cabeçalho de tela: rótulo laranja, título grande, navegação em pílulas. */
export function PageHeader({
  eyebrow,
  title,
  onPrev,
  onNext,
  nextDisabled,
  prevLabel,
  nextLabel,
}: {
  eyebrow?: string;
  title: string;
  onPrev?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  prevLabel?: string;
  nextLabel?: string;
}) {
  return (
    <header className="rise flex items-end gap-2" style={stagger(0)}>
      <div className="min-w-0 flex-1">
        {eyebrow && <span className="eyebrow mb-1.5">{eyebrow}</span>}
        <h1 className="t-title">{title}</h1>
      </div>
      {onPrev && (
        <button className="btn btn-icon" aria-label={prevLabel} onClick={onPrev}>
          ←
        </button>
      )}
      {onNext && (
        <button className="btn btn-icon" aria-label={nextLabel} disabled={nextDisabled} onClick={onNext}>
          →
        </button>
      )}
    </header>
  );
}
