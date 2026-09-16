# Pilares

Diário PWA para acompanhar os sete pilares de um dia (e de uma semana) bom,
com missões diárias, XP, níveis e conquistas derivados do próprio histórico.

| Pilar | Onde | O que é registrado |
| --- | --- | --- |
| 1. Sono | Diário | hora de dormir/acordar, horas calculadas, qualidade 1–5 |
| 2. Exercício | Diário | minutos e atividade |
| 3. Alimentação | Diário | qualidade 1–5, copos de água, marcador de besteira |
| 4. Trabalho e Estudos | Diário | minutos de foco e tarefas concluídas |
| 5. Leitura | Diário | minutos e livro |
| 6. Financeiro | Finanças | entradas/saídas por categoria, orçamento e meta de poupança |
| 7. Wheel of Life | Roda | 8 áreas de 0 a 10, radar e histórico comparativo |

**Diário** abre com humor e intenção da manhã, passa pelos pilares e fecha com
reflexão, gratidão e destaque da noite. O treino planejado do dia aparece dentro
de Exercício (com "marcar feito") e o cardápio do dia dentro de Alimentação;
`/treino` e `/dieta` são as telas de detalhe, acessadas dali. Sete missões por dia (cinco metas de
pilar, humor e reflexão) rendem XP; o nível cresce com o acumulado.

**Semana** mostra o mapa de calor 5 pilares × 7 dias (com tabela equivalente),
o progresso de cada meta e a média da semana. **Perfil** reúne nível, sequências
por pilar, conquistas (desbloqueadas e a caminho), as metas que alimentam a
pontuação e backup/restauração em JSON.

## Rodar

```bash
npm run dev
```

```bash
npm run build && npm start
```

O service worker só é registrado em produção; em `dev` fica desligado para não
servir cache velho.

## Como funciona

- **Dados**: tudo em `localStorage` (chave `pilares.v1`), sem backend nem contas.
  `lib/store.ts` expõe o estado via `useSyncExternalStore` — o HTML estático é
  renderizado vazio e a página só monta depois da hidratação, porque o build
  não conhece a data de hoje nem os dados do dispositivo.
- **Pontuação**: `lib/score.ts`. Cada pilar diário vale 0–1 contra a meta; a nota
  do dia é a média dos cinco. Financeiro é mensal (orçamento + poupança) e a roda
  é periódica.
- **Gamificação**: `lib/game.ts`, uma função de entrada — `progress(state, hoje)`
  devolve XP do dia e total, nível, missões, sequências por pilar e conquistas.
  Nada disso é gravado: é recomputado do histórico, então mudar uma regra
  reavalia o passado sozinho. `lib/day.ts` é a leitura pura de um dia, sem
  React, para que `score` e `game` rodem em qualquer ambiente. `npm test` roda
  `tests/game.test.js` só contra essa interface.
- **Design**: tokens, tipografia (Bricolage Grotesque, auto-hospedada) e regras
  de cor em [DESIGN.md](DESIGN.md),
  derivados do sistema visual da Strider (onstrider.com). Leia antes de mexer em
  cor — as cores de série passaram por validação de daltonismo e a ordem delas é
  o mecanismo de segurança.
- **Gráficos**: SVG e CSS escritos à mão (`components/Radar.tsx`, as barras e o
  número-herói em `ui.tsx`). Rampa sequencial verde no mapa da semana e cores de
  identidade por pilar, com par claro/escuro validado.
- **PWA**: `public/manifest.webmanifest` + `public/sw.js` (network-first na
  navegação, cache-first nos estáticos).
