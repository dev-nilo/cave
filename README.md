# Pilares

PWA para acompanhar os sete pilares de um dia (e de uma semana) bom.

| Pilar | Onde | O que é registrado |
| --- | --- | --- |
| 1. Sono | Hoje | hora de dormir/acordar, horas calculadas, qualidade 1–5 |
| 2. Exercício | Hoje | minutos e atividade |
| 3. Alimentação | Hoje | qualidade 1–5, copos de água, marcador de besteira |
| 4. Trabalho e Estudos | Hoje | minutos de foco e tarefas concluídas |
| 5. Leitura | Hoje | minutos e livro |
| 6. Financeiro | Finanças | entradas/saídas por categoria, orçamento e meta de poupança |
| 7. Wheel of Life | Roda | 8 áreas de 0 a 10, radar e histórico comparativo |

**Semana** mostra o mapa de calor 5 pilares × 7 dias (com tabela equivalente),
o progresso de cada meta e a média da semana. **Ajustes** define as metas que
alimentam a pontuação e faz backup/restauração em JSON.

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
