import type { DayId } from "./types";

export function toId(d: Date): DayId {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromId(id: DayId): Date {
  const [y, m, d] = id.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function today(): DayId {
  return toId(new Date());
}

export function addDays(id: DayId, n: number): DayId {
  const d = fromId(id);
  d.setDate(d.getDate() + n);
  return toId(d);
}

/** Segunda-feira da semana que contém `id`. */
export function weekStart(id: DayId): DayId {
  const d = fromId(id);
  const shift = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - shift);
  return toId(d);
}

export function weekDays(id: DayId): DayId[] {
  const start = weekStart(id);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function monthId(id: DayId): string {
  return id.slice(0, 7);
}

const WD = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];

export function weekdayShort(id: DayId): string {
  return WD[(fromId(id).getDay() + 6) % 7];
}

export function formatLong(id: DayId): string {
  return fromId(id).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export function formatShort(id: DayId): string {
  return fromId(id).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function monthLabel(m: string): string {
  const [y, mo] = m.split("-").map(Number);
  return new Date(y, mo - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

/** Horas dormidas a partir de dois horários "HH:MM", cruzando a meia-noite. */
export function sleepHours(bed: string, wake: string): number {
  if (!bed || !wake) return 0;
  const [bh, bm] = bed.split(":").map(Number);
  const [wh, wm] = wake.split(":").map(Number);
  if ([bh, bm, wh, wm].some((n) => Number.isNaN(n))) return 0;
  let mins = wh * 60 + wm - (bh * 60 + bm);
  if (mins <= 0) mins += 24 * 60;
  return Math.round((mins / 60) * 10) / 10;
}

export function brl(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Número no formato pt-BR (vírgula decimal). */
export function nf(n: number, digits = 1): string {
  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

/** Plural simples: `plural(1, "dia")` → "1 dia". */
export function plural(n: number, singular: string, pluralForm = singular + "s"): string {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}
