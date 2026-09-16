// Teste de sanidade do módulo de gamificação, pela interface pública.
// Roda com `npm test`: compila lib/ para .test-build/ e executa aqui.
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { progress, dayXp } = require("../.test-build/game.js");
const { DEFAULT_GOALS } = require("../.test-build/types.js");

const fullDay = (over = {}) => ({
  sono: { bed: "23:00", wake: "07:00", quality: 5 },
  exercicio: { minutes: 60, kind: "corrida" },
  alimentacao: { quality: 5, water: 8, junk: false },
  trabalho: { focus: 300, tasks: 3 },
  leitura: { minutes: 30, book: "b" },
  journal: {
    mood: 4,
    intention: "",
    reflection: "Um dia bom, com treino cedo e foco limpo a tarde inteira.",
    gratitude: "",
    highlight: "",
  },
  ...over,
});

function state(days) {
  return { version: 1, days, txs: [], wheel: [], goals: DEFAULT_GOALS, treinoInicio: null };
}

test("dia cheio rende o teto: 5 pilares + 7 missões + bônus + reflexão", () => {
  const s = state({ "2026-09-08": fullDay() });
  assert.equal(dayXp(s, "2026-09-08"), 100 + 35 + 25 + 10);
});

test("dia sem registro rende zero", () => {
  assert.equal(dayXp(state({}), "2026-09-08"), 0);
});

test("nível e XP restante batem com a curva 200 + 100·(n−1)", () => {
  const days = {};
  for (let i = 1; i <= 8; i++) days[`2026-09-0${i}`] = fullDay();
  const p = progress(state(days), "2026-09-08");
  assert.equal(p.xpTotal, 8 * 170);
  // 200 + 300 + 400 = 900 fecha o nível 3; sobram 460 dentro do nível 4 (precisa 500)
  assert.equal(p.level, 4);
  assert.equal(p.levelXp, 460);
  assert.equal(p.levelNeed, 500);
});

test("sequência do pilar quebra no dia em que ele fica abaixo de 80%", () => {
  const days = {};
  for (let i = 1; i <= 8; i++) days[`2026-09-0${i}`] = fullDay();
  days["2026-09-05"] = fullDay({ exercicio: { minutes: 0, kind: "" } });
  const p = progress(state(days), "2026-09-08");
  assert.equal(p.pillarStreaks.exercicio, 3);
  assert.equal(p.pillarStreaks.sono, 8);
  assert.equal(p.streak, 8);
});

test("conquistas destravam na primeira data em que a condição é atingida", () => {
  const days = {};
  for (let i = 1; i <= 7; i++) days[`2026-09-0${i}`] = fullDay();
  const p = progress(state(days), "2026-09-07");
  const at = Object.fromEntries(p.achievements.map((a) => [a.key, a.unlockedAt]));
  assert.equal(at["primeira-pagina"], "2026-09-01");
  assert.equal(at["dia-completo"], "2026-09-01");
  assert.equal(at["sete-dias"], "2026-09-07");
  assert.equal(at["semana-perfeita"], "2026-09-07");
  assert.equal(at["trinta-dias"], null);
});

test("conquista travada informa progresso proporcional", () => {
  const days = {};
  for (let i = 1; i <= 3; i++) days[`2026-09-0${i}`] = fullDay();
  const p = progress(state(days), "2026-09-03");
  const trinta = p.achievements.find((a) => a.key === "trinta-dias");
  assert.equal(trinta.unlockedAt, null);
  assert.equal(trinta.progress, 3 / 30);
});
