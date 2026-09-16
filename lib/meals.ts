export const PROFILE = {
  alturaCm: 170,
  pesoKg: 79,
  idade: 30,
  bfPercent: 17,
  sexo: "M" as const,
};

export type Targets = {
  bmr: number;
  tdee: number;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
};

/** Mifflin-St Jeor + fator de atividade fixo (treino de força 4x/semana + rotina normal). */
export function nutritionTargets(): Targets {
  const { alturaCm, pesoKg, idade } = PROFILE;
  const bmr = 10 * pesoKg + 6.25 * alturaCm - 5 * idade + 5;
  const activityFactor = 1.55;
  const tdee = bmr * activityFactor;
  const deficit = 300; // recomposição: leve déficit, prioriza reter músculo
  const kcal = tdee - deficit;
  const protein = 2.2 * pesoKg; // g — extremidade alta para intermediário/avançado em déficit
  const fat = (kcal * 0.25) / 9; // g — piso de gordura para hormônios
  const carbs = (kcal - protein * 4 - fat * 9) / 4; // g — o resto
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    kcal: Math.round(kcal),
    protein: Math.round(protein),
    fat: Math.round(fat),
    carbs: Math.round(carbs),
  };
}

export type Macro = { kcal: number; protein: number; carbs: number; fat: number };

export type Meal = {
  time: string;
  name: string;
  portions: string[];
  recipe: string;
} & Macro;

export type DayMeals = { label: string; topUp: string; meals: Meal[] };

export function mealTotal(m: Meal): Macro {
  return { kcal: m.kcal, protein: m.protein, carbs: m.carbs, fat: m.fat };
}

export function dayTotal(d: DayMeals): Macro {
  return d.meals.reduce(
    (a, m) => ({
      kcal: a.kcal + m.kcal,
      protein: a.protein + m.protein,
      carbs: a.carbs + m.carbs,
      fat: a.fat + m.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export const MEAL_DAYS: DayMeals[] = [
  {
    label: "Dia 1",
    topUp: "Abaixo da meta? Some 1 dose de whey no lanche.",
    meals: [
      {
        time: "Café da manhã",
        name: "Omelete com aveia e banana",
        portions: ["3 ovos inteiros", "50g aveia em flocos", "1 banana", "1 colher de sopa (16g) pasta de amendoim"],
        recipe:
          "Bata os ovos com sal e pimenta e faça a omelete em fogo médio, 3–4 min de cada lado. Cozinhe a aveia em 150ml de água ou leite por 3 min. Corte a banana por cima e regue com a pasta de amendoim.",
        kcal: 600,
        protein: 30,
        carbs: 62,
        fat: 27,
      },
      {
        time: "Almoço",
        name: "Frango grelhado, arroz e brócolis",
        portions: ["170g peito de frango", "200g arroz cozido", "150g brócolis", "1/2 colher de sopa de azeite"],
        recipe:
          "Tempere o frango com sal, limão e alho e grelhe 5–6 min de cada lado. Cozinhe o arroz. Cozinhe o brócolis no vapor por 4 min. Regue tudo com azeite.",
        kcal: 650,
        protein: 57,
        carbs: 62,
        fat: 13,
      },
      {
        time: "Lanche",
        name: "Skyr com whey e morango",
        portions: ["170g skyr ou iogurte grego", "1 dose (30g) whey protein", "100g morango"],
        recipe: "Misture o whey no skyr até dissolver e adicione os morangos picados.",
        kcal: 315,
        protein: 41,
        carbs: 34,
        fat: 1,
      },
      {
        time: "Jantar",
        name: "Salmão, batata doce e salada",
        portions: ["150g salmão", "300g batata doce", "salada verde a gosto", "1/2 colher de sopa de azeite"],
        recipe:
          "Asse o salmão temperado a 200°C por 12–15 min. Cozinhe ou asse a batata doce em cubos. Monte a salada e regue com azeite.",
        kcal: 670,
        protein: 38,
        carbs: 65,
        fat: 24,
      },
    ],
  },
  {
    label: "Dia 2",
    topUp: "Abaixo da meta? Some mais 50g de macarrão no almoço.",
    meals: [
      {
        time: "Café da manhã",
        name: "Panqueca proteica de banana e aveia",
        portions: ["3 ovos", "40g aveia em flocos", "1 banana", "1 colher de sopa de pasta de amendoim"],
        recipe:
          "Bata os ovos, a aveia e a banana no liquidificador até virar massa. Frite em frigideira antiaderente em porções pequenas, 2 min de cada lado. Regue com a pasta de amendoim.",
        kcal: 560,
        protein: 28,
        carbs: 56,
        fat: 26,
      },
      {
        time: "Almoço",
        name: "Carne moída magra com macarrão integral e legumes",
        portions: ["170g carne moída 5% de gordura", "200g macarrão integral cozido", "150g abobrinha e cenoura salteadas", "1/2 colher de sopa de azeite"],
        recipe:
          "Refogue a carne moída temperada em fogo médio até dourar. Cozinhe o macarrão. Salteie os legumes com o azeite e misture tudo.",
        kcal: 635,
        protein: 57,
        carbs: 59,
        fat: 17,
      },
      {
        time: "Lanche",
        name: "Cottage com fruta e castanhas",
        portions: ["200g queijo cottage", "1 pêssego ou fruta da estação", "15g castanhas"],
        recipe: "Misture o cottage com a fruta picada e finalize com as castanhas.",
        kcal: 330,
        protein: 27,
        carbs: 26,
        fat: 12,
      },
      {
        time: "Jantar",
        name: "Atum com batata inglesa e abacate",
        portions: ["150g atum em lata, escorrido", "350g batata inglesa cozida", "50g abacate", "salada a gosto"],
        recipe: "Cozinhe a batata em cubos até macia. Misture com o atum e o abacate em fatias, sirva com a salada.",
        kcal: 581,
        protein: 46,
        carbs: 65,
        fat: 15,
      },
    ],
  },
  {
    label: "Dia 3",
    topUp: "Abaixo da meta? Some 1 fruta extra no lanche.",
    meals: [
      {
        time: "Café da manhã",
        name: "Torrada com ovos e abacate",
        portions: ["3 fatias de pão integral", "2 ovos mexidos", "1/2 abacate"],
        recipe: "Mexa os ovos em fogo baixo com uma pitada de sal. Torre o pão e monte com o abacate fatiado por cima.",
        kcal: 500,
        protein: 23,
        carbs: 51,
        fat: 24,
      },
      {
        time: "Almoço",
        name: "Peito de peru grelhado com quinoa",
        portions: ["180g peito de peru", "200g quinoa cozida", "150g legumes no vapor", "1/2 colher de sopa de azeite"],
        recipe: "Grelhe o peru temperado 5 min de cada lado. Cozinhe a quinoa. Sirva com os legumes e regue com azeite.",
        kcal: 567,
        protein: 58,
        carbs: 48,
        fat: 14,
      },
      {
        time: "Lanche",
        name: "Iogurte grego com granola e mel",
        portions: ["200g iogurte grego", "30g granola", "1 colher de sopa de mel"],
        recipe: "Monte em camadas: iogurte, granola e mel por cima.",
        kcal: 310,
        protein: 23,
        carbs: 45,
        fat: 5,
      },
      {
        time: "Jantar",
        name: "Camarão salteado com arroz",
        portions: ["200g camarão limpo", "200g arroz cozido", "150g legumes salteados", "1 colher de sopa de azeite"],
        recipe: "Salteie o camarão temperado em fogo alto por 3–4 min. Sirva sobre o arroz com os legumes salteados no azeite.",
        kcal: 640,
        protein: 48,
        carbs: 68,
        fat: 17,
      },
    ],
  },
  {
    label: "Dia 4",
    topUp: "Abaixo da meta? Some 1 colher extra de pasta de amendoim no café da manhã.",
    meals: [
      {
        time: "Café da manhã",
        name: "Vitamina proteica de banana e aveia",
        portions: ["250ml leite desnatado", "1 dose (30g) whey protein", "1 banana", "30g aveia em flocos", "1 colher de sopa de pasta de amendoim"],
        recipe: "Bata tudo no liquidificador até ficar homogêneo.",
        kcal: 525,
        protein: 40,
        carbs: 65,
        fat: 11,
      },
      {
        time: "Almoço",
        name: "Bife de carne magra, batata doce e abacate",
        portions: ["170g bife de carne magra", "250g batata doce cozida", "50g abacate", "salada com 1/2 colher de sopa de azeite"],
        recipe: "Grelhe o bife 3–4 min de cada lado. Cozinhe a batata doce em cubos. Monte com a salada e o abacate.",
        kcal: 596,
        protein: 48,
        carbs: 54,
        fat: 22,
      },
      {
        time: "Lanche",
        name: "Cottage com frutas vermelhas e castanhas",
        portions: ["200g queijo cottage", "100g frutas vermelhas", "15g castanhas"],
        recipe: "Misture tudo em uma tigela.",
        kcal: 320,
        protein: 27,
        carbs: 23,
        fat: 12,
      },
      {
        time: "Jantar",
        name: "Atum com macarrão integral e brócolis",
        portions: ["150g atum em lata, escorrido", "200g macarrão integral cozido", "150g brócolis", "1/2 colher de sopa de azeite"],
        recipe: "Cozinhe o macarrão e o brócolis no vapor. Misture com o atum e finalize com azeite.",
        kcal: 538,
        protein: 48,
        carbs: 59,
        fat: 9,
      },
    ],
  },
  {
    label: "Dia 5",
    topUp: "Dia vegetariano — se sobrar fôlego de proteína, some mais 1 dose de whey.",
    meals: [
      {
        time: "Café da manhã",
        name: "Mingau de aveia com whey e maçã",
        portions: ["60g aveia em flocos", "1 dose (30g) whey protein", "1 maçã picada", "canela a gosto"],
        recipe: "Cozinhe a aveia em água ou leite por 3–4 min, desligue o fogo e misture o whey. Finalize com a maçã e canela.",
        kcal: 445,
        protein: 32,
        carbs: 68,
        fat: 5,
      },
      {
        time: "Almoço",
        name: "Tofu grelhado com arroz e legumes",
        portions: ["300g tofu firme", "200g arroz cozido", "150g legumes salteados", "1 colher de sopa de azeite"],
        recipe: "Corte o tofu em cubos, tempere e grelhe até dourar. Sirva com o arroz e os legumes salteados no azeite.",
        kcal: 670,
        protein: 35,
        carbs: 71,
        fat: 26,
      },
      {
        time: "Lanche",
        name: "Skyr com whey, nozes e mel",
        portions: ["170g skyr", "1 dose (30g) whey protein", "15g nozes", "1 colher de sopa de mel"],
        recipe: "Misture o whey no skyr e finalize com nozes picadas e o mel.",
        kcal: 380,
        protein: 43,
        carbs: 28,
        fat: 11,
      },
      {
        time: "Jantar",
        name: "Frango grelhado, batata inglesa e salada",
        portions: ["170g peito de frango", "300g batata inglesa cozida", "salada com 1/2 colher de sopa de azeite"],
        recipe: "Grelhe o frango temperado 5–6 min de cada lado. Cozinhe a batata em cubos. Sirva com a salada.",
        kcal: 568,
        protein: 58,
        carbs: 52,
        fat: 13,
      },
    ],
  },
  {
    label: "Dia 6",
    topUp: "Abaixo da meta? Some mais 50g de quinoa no jantar.",
    meals: [
      {
        time: "Café da manhã",
        name: "Panqueca de banana e aveia com iogurte",
        portions: ["2 ovos", "50g aveia em flocos", "1 banana", "100g iogurte grego"],
        recipe: "Bata os ovos, a aveia e a banana e frite em porções pequenas. Sirva com o iogurte por cima.",
        kcal: 500,
        protein: 29,
        carbs: 63,
        fat: 14,
      },
      {
        time: "Almoço",
        name: "Picadinho de carne magra com arroz",
        portions: ["170g carne moída magra", "200g arroz cozido", "150g legumes", "1/2 colher de sopa de azeite"],
        recipe: "Refogue a carne com cebola e alho até dourar. Cozinhe o arroz e os legumes e sirva junto.",
        kcal: 652,
        protein: 53,
        carbs: 67,
        fat: 16,
      },
      {
        time: "Lanche",
        name: "Whey com banana e pasta de amendoim",
        portions: ["1 dose (30g) whey protein", "1 banana", "1 colher de sopa de pasta de amendoim"],
        recipe: "Bata o whey com água ou leite e a banana; sirva com a pasta de amendoim ao lado ou misturada.",
        kcal: 320,
        protein: 28,
        carbs: 33,
        fat: 9,
      },
      {
        time: "Jantar",
        name: "Salmão assado com quinoa e aspargos",
        portions: ["150g salmão", "200g quinoa cozida", "150g aspargos", "1/2 colher de sopa de azeite"],
        recipe: "Asse o salmão a 200°C por 12–15 min. Cozinhe a quinoa. Salteie os aspargos e sirva tudo junto.",
        kcal: 627,
        protein: 41,
        carbs: 47,
        fat: 28,
      },
    ],
  },
  {
    label: "Dia 7",
    topUp: "Dia livre — pode trocar o jantar por uma refeição social mantendo as porções de proteína e carbo.",
    meals: [
      {
        time: "Café da manhã",
        name: "Omelete com queijo e torrada integral",
        portions: ["3 ovos", "30g queijo minas ou similar", "2 fatias de pão integral"],
        recipe: "Bata os ovos com o queijo picado e faça a omelete em fogo médio. Sirva com o pão torrado.",
        kcal: 460,
        protein: 31,
        carbs: 31,
        fat: 24,
      },
      {
        time: "Almoço",
        name: "Frango grelhado com macarrão integral",
        portions: ["170g peito de frango", "200g macarrão integral cozido", "150g legumes", "1/2 colher de sopa de azeite"],
        recipe: "Grelhe o frango temperado. Cozinhe o macarrão e os legumes e misture com azeite.",
        kcal: 643,
        protein: 61,
        carbs: 59,
        fat: 14,
      },
      {
        time: "Lanche",
        name: "Iogurte grego com frutas e granola",
        portions: ["200g iogurte grego", "100g frutas da estação", "20g granola"],
        recipe: "Monte em camadas: iogurte, frutas picadas e granola por cima.",
        kcal: 270,
        protein: 22,
        carbs: 37,
        fat: 4,
      },
      {
        time: "Jantar",
        name: "Camarão com batata doce e salada",
        portions: ["200g camarão limpo", "300g batata doce cozida", "salada com 1 colher de sopa de azeite"],
        recipe: "Salteie o camarão temperado em fogo alto. Cozinhe a batata doce em cubos e sirva com a salada.",
        kcal: 580,
        protein: 48,
        carbs: 61,
        fat: 17,
      },
    ],
  },
];

export type SubGroup = { titulo: string; itens: string[] };

/** Trocas equivalentes por macro — mesma porção-alvo do grupo, ajuste fino na balança se quiser precisão. */
export const SUBSTITUTIONS: SubGroup[] = [
  {
    titulo: "Proteína (~45–50g de proteína por porção)",
    itens: [
      "170g peito de frango grelhado",
      "150g salmão grelhado ou assado",
      "170g carne magra moída (5%)",
      "150g atum em lata, escorrido",
      "180g peito de peru grelhado",
      "200g camarão limpo",
      "300g tofu firme (opção vegetariana, ~35g proteína)",
    ],
  },
  {
    titulo: "Carboidrato (~55–60g de carboidrato por porção)",
    itens: [
      "200g arroz branco ou integral cozido",
      "300g batata doce cozida",
      "300g batata inglesa cozida",
      "200g macarrão integral cozido",
      "200g quinoa cozida",
      "70g aveia em flocos (seca)",
      "3 fatias de pão integral",
    ],
  },
  {
    titulo: "Gordura (~10g de gordura por porção)",
    itens: [
      "1 colher de sopa de azeite",
      "80g abacate",
      "20g castanhas ou amêndoas",
      "1 colher de sopa de pasta de amendoim",
    ],
  },
  {
    titulo: "Lanche proteico (~25–40g de proteína por porção)",
    itens: [
      "170–200g skyr ou iogurte grego",
      "1–2 doses de whey protein",
      "200g queijo cottage",
      "2–3 ovos cozidos",
    ],
  },
  {
    titulo: "Vegetais (livres, ~150g por refeição)",
    itens: ["Brócolis", "Salada verde", "Abobrinha", "Cenoura", "Couve", "Aspargos", "Legumes salteados ou no vapor"],
  },
];

/** Cardápio do dia: o plano de 7 dias roda com a semana, segunda = Dia 1. */
export function mealsFor(date: string): DayMeals {
  const [y, m, d] = date.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay(); // 0 = domingo
  return MEAL_DAYS[(dow + 6) % 7];
}
