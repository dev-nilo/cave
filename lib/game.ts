import { addDays, sleepHours } from "./date";
import { DAILY_PILLARS, dayScore, dayScores, hasData, type DailyPillar } from "./score";
import { getDay } from "./day";
import type { DayId, Goals, State } from "./types";

/**
 * Gamificação — módulo fundo: tudo aqui é derivado do histórico. Não existe XP,
 * nível ou conquista gravados no estado; se as regras mudarem, o passado é
 * reavaliado sozinho e nada desincroniza.
 *
 * Interface: `progress(state, hoje)`. O resto é implementação.
 */

export type Mission = {
  key: string;
  label: string;
  done: boolean;
  pillar?: DailyPillar;
};

export type Achievement = {
  key: string;
  title: string;
  desc: string;
  unlockedAt: DayId | null;
  progress: number; // 0–1, útil enquanto travada
};

export type Progress = {
  xpToday: number;
  xpTotal: number;
  level: number;
  levelXp: number; // XP acumulado dentro do nível atual
  levelNeed: number; // XP para fechar o nível atual
  levelPct: number;
  missions: Mission[];
  missionsDone: number;
  streak: number; // dias seguidos com registro
  pillarStreaks: Record<DailyPillar, number>; // dias seguidos com o pilar ≥ 80%
  achievements: Achievement[];
  unlockedCount: number;
};

const GOOD = 0.8;
const MISSION_XP = 5;
const FULL_DAY_BONUS = 25;
const DEEP_REFLECTION_XP = 10; // reflexão com alguma substância
const PILLAR_MAX_XP = 20;

/** XP necessário para fechar o nível `n` (1-based). Cresce devagar e linear. */
function xpForLevel(n: number): number {
  return 200 + (n - 1) * 100;
}

export function missionsOf(s: State, id: DayId): Mission[] {
  const d = getDay(s, id);
  const g = s.goals;
  return [
    { key: "sono", pillar: "sono", label: `Dormir ${g.sonoHoras}h`, done: sleepHours(d.sono.bed, d.sono.wake) >= g.sonoHoras },
    { key: "exercicio", pillar: "exercicio", label: `Treinar ${g.exercicioMin} min`, done: d.exercicio.minutes >= g.exercicioMin },
    { key: "agua", pillar: "alimentacao", label: `Beber ${g.aguaCopos} copos`, done: d.alimentacao.water >= g.aguaCopos },
    { key: "foco", pillar: "trabalho", label: `Focar ${Math.round(g.focoMin / 60)}h`, done: d.trabalho.focus >= g.focoMin },
    { key: "leitura", pillar: "leitura", label: `Ler ${g.leituraMin} min`, done: d.leitura.minutes >= g.leituraMin },
    { key: "humor", label: "Registrar o humor", done: d.journal.mood > 0 },
    { key: "diario", label: "Escrever no diário", done: d.journal.reflection.trim().length > 0 },
  ];
}

export function dayXp(s: State, id: DayId): number {
  if (!hasData(s, id)) return 0;
  const sc = dayScores(s, id);
  let xp = DAILY_PILLARS.reduce((a, k) => a + Math.round(sc[k] * PILLAR_MAX_XP), 0);
  const ms = missionsOf(s, id);
  xp += ms.filter((m) => m.done).length * MISSION_XP;
  if (ms.filter((m) => m.pillar).every((m) => m.done)) xp += FULL_DAY_BONUS;
  if (getDay(s, id).journal.reflection.trim().length >= 40) xp += DEEP_REFLECTION_XP;
  return xp;
}

function levelFrom(xpTotal: number) {
  let level = 1;
  let rest = xpTotal;
  while (rest >= xpForLevel(level)) {
    rest -= xpForLevel(level);
    level++;
  }
  return { level, levelXp: rest, levelNeed: xpForLevel(level) };
}

/** Dias seguidos até `todayId` (inclusive) que satisfazem `ok`. */
function backwardStreak(s: State, todayId: DayId, ok: (id: DayId) => boolean): number {
  let n = 0;
  let id = todayId;
  for (let i = 0; i < 400; i++) {
    if (!hasData(s, id) || !ok(id)) break;
    n++;
    id = addDays(id, -1);
  }
  return n;
}

/**
 * Definição das conquistas. `check` recebe o acumulado até o dia e devolve
 * quanto da meta já foi atingido (≥ 1 destrava). O acumulado é único para todas,
 * então o histórico é percorrido uma vez só.
 */
type Acc = {
  entries: number;
  reflections: number;
  fullDays: number;
  earlyRises: number;
  readingMin: number;
  exerciseMin: number;
  deepFocusDays: number;
  waterDays: number;
  goodStreak: number;
  entryStreak: number;
  wheelCount: number;
};

const ACHIEVEMENTS: { key: string; title: string; desc: string; check: (a: Acc, g: Goals) => number }[] = [
  { key: "primeira-pagina", title: "Primeira página", desc: "Escreva a primeira reflexão no diário.", check: (a) => a.reflections / 1 },
  { key: "sete-dias", title: "Sete dias", desc: "Registre sete dias seguidos.", check: (a) => a.entryStreak / 7 },
  { key: "trinta-dias", title: "Trinta dias", desc: "Registre trinta dias seguidos.", check: (a) => a.entryStreak / 30 },
  { key: "semana-perfeita", title: "Semana perfeita", desc: "Sete dias seguidos acima de 80%.", check: (a) => a.goodStreak / 7 },
  { key: "dia-completo", title: "Dia completo", desc: "Feche os cinco pilares num mesmo dia.", check: (a) => a.fullDays / 1 },
  { key: "dez-completos", title: "Dez dias completos", desc: "Dez dias com os cinco pilares fechados.", check: (a) => a.fullDays / 10 },
  { key: "madrugador", title: "Madrugador", desc: "Acorde antes das 6h30 em cinco dias.", check: (a) => a.earlyRises / 5 },
  { key: "leitor", title: "Leitor", desc: "Acumule 500 minutos de leitura.", check: (a) => a.readingMin / 500 },
  { key: "maratonista", title: "Maratonista", desc: "Acumule 1.000 minutos de exercício.", check: (a) => a.exerciseMin / 1000 },
  { key: "foco-profundo", title: "Foco profundo", desc: "Cinco dias com 5h ou mais de foco.", check: (a) => a.deepFocusDays / 5 },
  { key: "hidratado", title: "Hidratado", desc: "Bata a meta de água em dez dias.", check: (a) => a.waterDays / 10 },
  { key: "roda-girada", title: "Roda girada", desc: "Faça três avaliações da roda da vida.", check: (a) => a.wheelCount / 3 },
];

function achievementsOf(s: State, todayId: DayId): Achievement[] {
  const ids = Object.keys(s.days).filter((id) => id <= todayId && hasData(s, id)).sort();
  const wheelDates = s.wheel.map((w) => w.date).sort();

  const acc: Acc = {
    entries: 0, reflections: 0, fullDays: 0, earlyRises: 0, readingMin: 0, exerciseMin: 0,
    deepFocusDays: 0, waterDays: 0, goodStreak: 0, entryStreak: 0, wheelCount: 0,
  };
  const unlockedAt = new Map<string, DayId>();
  let prev: DayId | null = null;

  const evaluate = (id: DayId) => {
    for (const a of ACHIEVEMENTS) {
      if (!unlockedAt.has(a.key) && a.check(acc, s.goals) >= 1) unlockedAt.set(a.key, id);
    }
  };

  for (const id of ids) {
    const d = getDay(s, id);
    const g = s.goals;
    const consecutive = prev !== null && addDays(prev, 1) === id;

    acc.entries++;
    acc.entryStreak = consecutive ? acc.entryStreak + 1 : 1;
    acc.goodStreak = dayScore(s, id) >= GOOD ? (consecutive ? acc.goodStreak + 1 : 1) : 0;
    if (d.journal.reflection.trim()) acc.reflections++;
    if (missionsOf(s, id).filter((m) => m.pillar).every((m) => m.done)) acc.fullDays++;
    if (d.sono.wake && d.sono.wake <= "06:30") acc.earlyRises++;
    acc.readingMin += d.leitura.minutes;
    acc.exerciseMin += d.exercicio.minutes;
    if (d.trabalho.focus >= 300) acc.deepFocusDays++;
    if (d.alimentacao.water >= g.aguaCopos) acc.waterDays++;
    acc.wheelCount = wheelDates.filter((w) => w <= id).length;

    evaluate(id);
    prev = id;
  }
  // Avaliações da roda podem existir sem registro diário no mesmo dia.
  acc.wheelCount = wheelDates.filter((w) => w <= todayId).length;
  evaluate(todayId);

  return ACHIEVEMENTS.map((a) => ({
    key: a.key,
    title: a.title,
    desc: a.desc,
    unlockedAt: unlockedAt.get(a.key) ?? null,
    progress: Math.min(1, a.check(acc, s.goals)),
  }));
}

export function progress(s: State, todayId: DayId): Progress {
  const xpTotal = Object.keys(s.days)
    .filter((id) => id <= todayId)
    .reduce((a, id) => a + dayXp(s, id), 0);
  const { level, levelXp, levelNeed } = levelFrom(xpTotal);
  const missions = missionsOf(s, todayId);
  const pillarStreaks = Object.fromEntries(
    DAILY_PILLARS.map((k) => [k, backwardStreak(s, todayId, (id) => dayScores(s, id)[k] >= GOOD)]),
  ) as Record<DailyPillar, number>;
  const achievements = achievementsOf(s, todayId);

  return {
    xpToday: dayXp(s, todayId),
    xpTotal,
    level,
    levelXp,
    levelNeed,
    levelPct: levelXp / levelNeed,
    missions,
    missionsDone: missions.filter((m) => m.done).length,
    streak: backwardStreak(s, todayId, () => true),
    pillarStreaks,
    achievements,
    unlockedCount: achievements.filter((a) => a.unlockedAt).length,
  };
}
