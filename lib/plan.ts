import { addDays } from "./date";
import type { DayId } from "./types";

export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  biset?: boolean; // agrupado com o exercício seguinte, mesmo descanso ao final do par
};

export type Session = {
  label: string;
  focus: "Força" | "Hipertrofia";
  exercises: Exercise[];
};

export const WARMUP = [
  "2 min de cardio leve (bike, remo ou esteira inclinada) para elevar a FC",
  "Mobilidade dinâmica (60–90s no total): balanço de perna, rotação de braço, abertura de quadril, band pull-apart",
  "2 séries de aproximação só no primeiro exercício: uma a ~50% da carga x 8, outra a ~75% x 5, depois direto nas séries de trabalho",
];

const SUPERIOR_A: Session = {
  label: "Superior A",
  focus: "Força",
  exercises: [
    { name: "Supino (máquina ou barra)", sets: 4, reps: "6–8", rest: "90s" },
    { name: "Remada presa no peito (máquina ou halteres)", sets: 4, reps: "8–10", rest: "90s" },
    { name: "Desenvolvimento de ombro na máquina", sets: 3, reps: "8–10", rest: "75s" },
    { name: "Puxada alta pegada aberta", sets: 3, reps: "10–12", rest: "75s" },
    { name: "Elevação lateral com halteres", sets: 3, reps: "12–15", rest: "—", biset: true },
    { name: "Face pull no cabo", sets: 3, reps: "12–15", rest: "45s após o par" },
    { name: "Rosca direta na barra EZ", sets: 2, reps: "10–12", rest: "—", biset: true },
    { name: "Tríceps no cabo (pushdown)", sets: 2, reps: "10–12", rest: "45s após o par" },
  ],
};

const INFERIOR_A: Session = {
  label: "Inferior A",
  focus: "Força",
  exercises: [
    { name: "Leg press ou hack squat", sets: 4, reps: "6–8", rest: "100s" },
    { name: "Levantamento terra romeno (halteres ou barra)", sets: 4, reps: "8–10", rest: "90s" },
    { name: "Mesa flexora", sets: 3, reps: "10–12", rest: "75s" },
    { name: "Afundo búlgaro (halteres)", sets: 2, reps: "8–10 / perna", rest: "60s" },
    { name: "Elevação de panturrilha (máquina)", sets: 3, reps: "12–15", rest: "45s" },
    { name: "Prancha ou elevação de joelhos suspenso", sets: 2, reps: "30–45s / 12–15", rest: "45s" },
  ],
};

const SUPERIOR_B: Session = {
  label: "Superior B",
  focus: "Hipertrofia",
  exercises: [
    { name: "Supino inclinado (halteres ou máquina)", sets: 4, reps: "10–12", rest: "75s" },
    { name: "Remada sentada no cabo (pegada neutra)", sets: 4, reps: "10–12", rest: "75s" },
    { name: "Desenvolvimento Arnold (halteres ou máquina)", sets: 3, reps: "10–12", rest: "60s" },
    { name: "Puxada supinada ou barra assistida", sets: 3, reps: "8–10", rest: "75s" },
    { name: "Voador peitoral (peck deck ou cabo)", sets: 3, reps: "12–15", rest: "—", biset: true },
    { name: "Voador invertido / face pull", sets: 3, reps: "12–15", rest: "45s após o par" },
    { name: "Rosca martelo", sets: 2, reps: "12–15", rest: "—", biset: true },
    { name: "Tríceps testa no cabo", sets: 2, reps: "12–15", rest: "45s após o par" },
  ],
};

const INFERIOR_B: Session = {
  label: "Inferior B",
  focus: "Hipertrofia",
  exercises: [
    { name: "Hack squat ou leg press (ângulo diferente do dia A)", sets: 4, reps: "10–12", rest: "90s" },
    { name: "Elevação de quadril (hip thrust)", sets: 3, reps: "10–12", rest: "90s" },
    { name: "Cadeira extensora", sets: 3, reps: "12–15", rest: "60s" },
    { name: "Passada com halteres (walking lunge)", sets: 2, reps: "10–12 / perna", rest: "60s" },
    { name: "Panturrilha sentado", sets: 3, reps: "15–20", rest: "—", biset: true },
    { name: "Panturrilha em pé", sets: 3, reps: "15–20", rest: "45s após o par" },
    { name: "Prancha ou woodchopper no cabo", sets: 2, reps: "30–45s / 12–15", rest: "45s" },
  ],
};

export const SESSIONS: Session[] = [SUPERIOR_A, INFERIOR_A, SUPERIOR_B, INFERIOR_B];

function deloadSets(n: number): number {
  if (n >= 4) return 2;
  if (n === 3) return 2;
  if (n === 2) return 1;
  return n;
}

function toDeload(session: Session): Session {
  return {
    ...session,
    label: `${session.label} (deload)`,
    exercises: session.exercises.map((e) => ({ ...e, sets: deloadSets(e.sets) })),
  };
}

export const WEEKS: { title: string; note: string }[] = [
  { title: "Base", note: "Ancore as cargas no meio da faixa de reps, RIR 2–3. É a referência do bloco." },
  { title: "Sobrecarga", note: "Suba 2,5–5% de carga (ou +1–2 reps) em cada exercício. Última série dos compostos a RIR 1." },
  { title: "Intensidade", note: "Some 1 série extra nos dois exercícios compostos do dia. Últimas séries a RIR 0–1." },
  { title: "Deload", note: "Séries cortadas em ~40%, mesma carga da semana 3. Foco em técnica e recuperação." },
];

/** Ritmo 2x treino / 1x descanso / 2x treino / 2x descanso dentro de cada bloco de 7 dias. */
const WEEK_OFFSETS = [0, 1, 3, 4];

export function scheduleDates(start: DayId): DayId[] {
  const dates: DayId[] = [];
  for (let w = 0; w < WEEKS.length; w++) {
    for (const off of WEEK_OFFSETS) dates.push(addDays(start, w * 7 + off));
  }
  return dates;
}

export type PlannedSession = { date: DayId; week: number; dayInWeek: number; session: Session };

export function planSessions(start: DayId): PlannedSession[] {
  return scheduleDates(start).map((date, i) => {
    const week = Math.floor(i / WEEK_OFFSETS.length);
    const dayInWeek = i % WEEK_OFFSETS.length;
    const base = SESSIONS[dayInWeek];
    return { date, week, dayInWeek, session: week === WEEKS.length - 1 ? toDeload(base) : base };
  });
}

export const SESSION_MINUTES = 50;

/** Sessão planejada para a data, se houver (o plano tem 16 sessões em 4 semanas). */
export function sessionOn(start: DayId, date: DayId): PlannedSession | null {
  return planSessions(start).find((p) => p.date === date) ?? null;
}

/** Primeira sessão planejada depois da data. */
export function nextSessionAfter(start: DayId, date: DayId): PlannedSession | null {
  return planSessions(start).find((p) => p.date > date) ?? null;
}
