import { EMPTY_DAY, EMPTY_JOURNAL, type Day, type DayId, type State } from "./types";

/**
 * Leitura normalizada de um dia. Puro e sem React de propósito: é a base de
 * `score.ts` e `game.ts`, que precisam rodar em qualquer ambiente.
 */
export function getDay(s: State, id: DayId): Day {
  const d = s.days[id];
  if (!d) return EMPTY_DAY;
  return {
    sono: { ...EMPTY_DAY.sono, ...d.sono },
    exercicio: { ...EMPTY_DAY.exercicio, ...d.exercicio },
    alimentacao: { ...EMPTY_DAY.alimentacao, ...d.alimentacao },
    trabalho: { ...EMPTY_DAY.trabalho, ...d.trabalho },
    leitura: { ...EMPTY_DAY.leitura, ...d.leitura },
    // Dados antigos guardavam só `note`; ela vira a reflexão do diário.
    journal: {
      ...EMPTY_JOURNAL,
      ...d.journal,
      reflection: d.journal?.reflection ?? d.note ?? "",
    },
  };
}
