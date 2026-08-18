"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  DEFAULT_GOALS,
  EMPTY_DAY,
  type Day,
  type DayId,
  type State,
} from "./types";

const KEY = "pilares.v1";

const EMPTY_STATE: State = {
  version: 1,
  days: {},
  txs: [],
  wheel: [],
  goals: DEFAULT_GOALS,
  treinoInicio: null,
};

let state: State = EMPTY_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function load(): State {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<State>;
    return {
      version: 1,
      days: parsed.days ?? {},
      txs: parsed.txs ?? [],
      wheel: parsed.wheel ?? [],
      goals: { ...DEFAULT_GOALS, ...(parsed.goals ?? {}) },
      treinoInicio: parsed.treinoInicio ?? null,
    };
  } catch {
    return EMPTY_STATE;
  }
}

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  if (!loaded) {
    loaded = true;
    state = load();
  }
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      state = load();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function setState(update: (s: State) => State) {
  state = update(state);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* cota cheia ou modo privado: mantém em memória */
  }
  emit();
}

export function replaceState(next: State) {
  setState(() => next);
}

/**
 * Lê o estado. Renderiza vazio no servidor e na primeira pintura, então
 * hidrata com o localStorage — evita divergência de hidratação.
 */
export function useStore(): State {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => EMPTY_STATE,
  );
}

/**
 * `false` no HTML pré-renderizado, `true` depois da hidratação. Páginas que
 * dependem da data de hoje só podem renderizar depois disso — o HTML estático
 * foi gerado no dia do build.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function getDay(s: State, id: DayId): Day {
  const d = s.days[id];
  if (!d) return EMPTY_DAY;
  return {
    sono: { ...EMPTY_DAY.sono, ...d.sono },
    exercicio: { ...EMPTY_DAY.exercicio, ...d.exercicio },
    alimentacao: { ...EMPTY_DAY.alimentacao, ...d.alimentacao },
    trabalho: { ...EMPTY_DAY.trabalho, ...d.trabalho },
    leitura: { ...EMPTY_DAY.leitura, ...d.leitura },
    note: d.note ?? "",
  };
}

/** Editor do dia: aplica um patch parcial e persiste. */
export function useDay(id: DayId) {
  const s = useStore();
  const day = getDay(s, id);
  const patch = useCallback(
    (p: Partial<Day>) => {
      setState((prev) => {
        const base = getDay(prev, id);
        return {
          ...prev,
          days: { ...prev.days, [id]: { ...base, ...p } },
        };
      });
    },
    [id],
  );
  return [day, patch] as const;
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
