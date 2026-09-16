# DESIGN.md — Pilares

Sistema visual derivado do site da **Strider** (onstrider.com), extraído do CSS e
do HTML de produção (`template_app.min.css`, home e página de vaga) — não de
impressão visual.

## 0. O que realmente define aquele visual

Cinco coisas, em ordem de impacto. Se só der para acertar cinco, são estas:

1. **O rótulo laranja queimado.** Micro-texto em caixa alta, 10–12px, peso 600,
   tracking **positivo**, na cor `#8A3700`. É o fio que costura o site inteiro e
   o único lugar onde o espaçamento abre. Sem ele, o resto vira genérico.
2. **Cartão não tem sombra.** Superfície off-white sobre off-white, separada por
   **borda** `#DEDED0`. Sombra existe só em modal, toast e cards empilhados —
   elementos que realmente flutuam. Cartão branco com sombra difusa é o erro
   típico e não é o site.
3. **Tudo que é acionável é pílula.** Botões e tags são `rounded-full`, com ícone
   e `gap-2` interno. Retângulo arredondado é para campo de formulário, não para
   ação.
4. **Um container grande, itens divididos por linha.** O site agrupa em painéis
   de raio 24px com divisórias internas `#F0F0E2`, em vez de espalhar cartõezinhos
   soltos. Densidade com ordem.
5. **Seções escuras invertem tudo.** Verde-gradiente com texto off-white e rótulo
   amarelo-claro `#F2F3AE`. É assim que o site cria hierarquia entre blocos — não
   por tamanho de sombra.

## 1. Cor

### 1.1 Tokens da marca (extraídos)

| Nome no site | Hex | Papel |
| --- | --- | --- |
| `off-white-200` | `#FFFFF3` | fundo da página |
| `off-white-100` | `#FBFBF3` | superfície de painel |
| `off-white-300` | `#F0F0E2` | divisória, chip, trilho |
| `off-white-400` | `#DEDED0` | borda de painel e de controle |
| `red-200` | `#381113` | tinta de título, botão primário |
| `red-100` | `#5E1A10` | hover do botão primário |
| `orange-100` | `#F2F3AE` | texto sobre escuro, rótulo invertido |
| `orange-400` | `#8A3700` | **rótulo / eyebrow** |
| `orange-300` | `#A44200` | destaque quente |
| `green-800` | `#003106` | fundo escuro, título alternativo |
| `green-600` | `#2F4E21` | verde institucional |
| `green-500` `400` `300` `100` | `#608758` `#92BA92` `#C6DBC6` `#EDF4E6` | rampa |
| gradiente verde | `linear-gradient(137.63deg,#3F5522,#00300C)` | painel escuro |
| gradiente quente | `linear-gradient(226deg,#5E1A10 8%,#A44200 107%)` | painel de alerta |

### 1.2 Três cores de texto, três papéis

Isto é regra, não preferência — o site nunca mistura:

- **Rótulo** → `#8A3700` (claro) / `#F2F3AE` (sobre escuro). Caixa alta.
- **Título** → `#381113`. Em contexto de painel escuro, `#FFFFF3`.
- **Corpo** → `#1A1A17`; apoio `#5C554C`; desativado `#8B8477`.

Nunca pinte texto com a cor de uma série de dado. O pontinho colorido ao lado é
que carrega a identidade.

### 1.3 Tokens da aplicação

```
claro                             escuro (o site inverte para verde, não cinza)
--page      #FFFFF3               #002204
--panel     #FBFBF3               #00380B
--panel-2   #F0F0E2               #0C4212
--line      #E8E8D8               #0F4A18
--line-2    #DEDED0               #1C5C24
--label     #8A3700               #F2A66A
--title     #381113               #FFFFF3
--body      #1A1A17               #E4EADF
--body-2    #5C554C               #A9BBA4
--body-3    #8B8477               #7E9079
--action    #381113  ink #F2F3AE  #F2F3AE  ink #002204
--accent    #2F4E21               #92BA92
--warm      #A44200               #F0965A
--danger    #5E1A10               #E0796B
--dark-grad linear-gradient(137.63deg,#3F5522,#00300C)
```

### 1.4 Identidade dos sete pilares

Ordem validada por busca sobre todas as permutações; **é o mecanismo de segurança
para daltonismo**, não escolha estética. Não reordene sem revalidar.

| # | Pilar | Claro | Escuro |
| --- | --- | --- | --- |
| 1 | Sono | `#7A3E63` | `#B87199` |
| 2 | Exercício | `#8A6B00` | `#EFCB5C` |
| 3 | Alimentação | `#2F4E21` | `#6DAE72` |
| 4 | Trabalho e Estudos | `#3F5F8F` | `#5F8FD4` |
| 5 | Leitura | `#A44200` | `#F0965A` |
| 6 | Financeiro | `#5E1A10` | `#B85449` |
| 7 | Wheel of Life | `#14614F` | `#5FD5B4` |

Claro sobre `#FFFFF3`: pior par ΔE normal 17,4 / daltonismo 10,0 — sem falhas.
Escuro sobre `#00380B`: pior par 19,2 / 6,9 — o par verde↔azul fica na faixa de
aviso, legítimo só porque todo ponto tem rótulo textual ao lado e o mapa da
semana tem visão de tabela.

Rampa sequencial (uma matiz, verde):
`#EDF4E6 → #C6DBC6 → #92BA92 → #608758 → #2F4E21` (escuro:
`#1B5A20 → #35763A → #56945A → #86B87F → #C0DDA5`). "Sem registro" **não** entra
na rampa: fica transparente com borda tracejada.

## 2. Tipografia

O site usa **PP Mori** (Pangram Pangram, licença comercial — não redistribuível).
O app usa **Bricolage Grotesque** (SIL OFL, auto-hospedada pelo `next/font`, sem
CDN em tempo de execução), que tem a mesma família de gestos: grotesca de
contraste baixo, x-height alta e formas levemente idiossincráticas.

Como Bricolage é mais estreita e tem x-height maior que PP Mori, a escala foi
recalibrada: **um passo a mais de peso nos títulos (700 em vez de 600)** para
recuperar presença, e **tracking negativo ~40% menor**, já que a fonte
naturalmente aperta. Corpo segue em 500.

| Papel | px | peso | tracking | origem no site |
| --- | --- | --- | --- | --- |
| Número-herói | 64 | 700 | −2,4px | `text-header-4` reduzido |
| Título de tela | 32 | 700 | −1px | `text-header-7` |
| Título de painel | 20 | 700 | −0,3px | `text-subheader-2` |
| Corpo grande | 18 | 500 | −0,36px | `text-body-l` |
| Corpo | 16 | 500 | −0,32px | `text-body-reg` |
| Corpo pequeno | 14 | 500 | −0,28px | `text-body-s` |
| Micro | 12 | 500 | −0,24px | `text-body-xs` |
| **Rótulo** | 11 | 600 | **+1,1px** caixa alta | `text-title-t1/t2` |
| Botão | 14–16 | 600 | −0,28px | `text-button-3` |

Sinais de `+` e `−` (stepper) são **desenhados como retângulos**, não glifos: o
minus da Bricolage é curto e não casa com o plus.

Detalhes que o site usa e que importam: blocos de título levam `-mb-3` (margem
negativa) para colar o título no que vem depois; números sempre
`tabular-nums`; unidades e sufixos ficam menores e alinhados ao **topo** do
número (`flex gap-1 items-start`), nunca à linha de base.

## 3. Forma

- **Raio**: painel grande 24px · painel/campo 12px · modal 16px · **ação
  (botão, tag, chip) 999px** · célula de mapa 8px.
- **Borda**: 1px `--line-2` em painel e controle. É a separação principal.
- **Sombra**: só em elemento que flutua de verdade —
  modal `0 24px 64px rgba(0,0,0,.22), 0 4px 16px rgba(0,0,0,.1)`,
  toast `0 8px 40px rgba(0,0,0,.1)`. Painel comum: nenhuma.
- **Espaço**: base 4px. Painel 20px de padding, 12px entre painéis, 28px entre
  blocos de assunto.
- **Toque**: mínimo 44px.

## 4. Componentes

**Painel** — `--panel`, borda `--line-2`, raio 24px. Cabeçalho: rótulo laranja
em caixa alta (`PILAR 3`), título 20/600 logo abaixo, métrica à direita em
tabular-nums. Itens internos separados por divisória `--line`, nunca por
sub-cartões.

**Painel escuro (herói)** — gradiente verde, raio 24px, rótulo em `#F2F3AE`,
número 64px em off-white, texto de apoio em verde claro. Um por tela, no topo.

**Botão primário** — pílula, `--action` com texto `#F2F3AE`, 16px/600, altura 52,
ícone opcional à direita com `gap-2`, hover troca para `#5E1A10`.
**Secundário** — pílula, `--panel` com borda `--line-2`, texto `--title`.
**Ghost** — texto verde `#003106`, hover `#608758`, sem caixa.
**Ícone** — círculo 44px com borda.

**Chip / tag** — pílula `--panel-2`, 12px/500, texto `--title`. Selecionado:
fundo `--title`, texto `#F2F3AE`.

**Linha de lista** — 44px+, divisória embaixo, hover `#EDF4E6` com raio 12px,
`transition duration-100`.

**Barra de progresso** — trilho `--panel-2`, preenchimento na cor do pilar,
altura 8px (6px em lista), pontas arredondadas. Estouro vira `--danger`.

**Navegação inferior** — pílula flutuante: container `rounded-full` em `--panel`
com borda, item ativo em pílula `--title` com texto `#F2F3AE`.

## 5. Movimento

Vocabulário extraído do site — use este, não outro:

- **Entrada de bloco**: `translateY(33%)` + opacidade 0→1, 500ms,
  `cubic-bezier(.25,1,.5,1)`.
- **Stagger de lista**: cada filho recebe `--child-index` e atrasa
  `index × 60ms`. É a assinatura de movimento do site.
- **Controles (toggle, chip, stepper)**: 200ms com
  `ease-bounce = cubic-bezier(.175,.885,.32,1.2)` — passa levemente do ponto.
- **Modal**: `scale(.97) translateY(14px)` → normal, 200ms,
  `cubic-bezier(.34,1.26,.64,1)`.
- **Hover**: só opacidade ou cor de fundo, 100–150ms. Nada de levantar cartão.
- Tudo isso desliga sob `prefers-reduced-motion`.

## 6. Tom

Sóbrio e adulto. Sem emoji na interface, sem gradiente decorativo fora dos
painéis-herói, sem cor comemorativa. Progresso se mostra por preenchimento e
número. Português direto, sem exclamação.

### 6.1 Gamificação sem parecer joguinho

XP, nível, missões e conquistas existem para dar **ritmo** ao diário, não para
gritar. Regras:

- Recompensa aparece como **número e preenchimento** (`+83 XP`, barra do nível),
  nunca como confete, brilho ou cor nova.
- O único ícone é o **check** dentro do círculo — missão feita, conquista
  desbloqueada. Nada de troféu, medalha, fogo.
- Nome de conquista é curto, em português e descreve o feito ("Sete dias",
  "Madrugador", "Primeira página"). Sem trocadilho, sem superlativo.
- Conquista travada mostra **progresso**, não cadeado: a barra diz o quanto
  falta. A caminho é mais motivador que bloqueado.
- Sequência zera sem drama: "—" no lugar do número. Sem mensagem de derrota.
- Tudo é derivado do histórico (`lib/game.ts`): nada de XP gravado, nada de
  pop-up de "você subiu de nível". O nível novo simplesmente está lá amanhã.

## 7. Checklist antes de mudar cor

1. Série nova? Valide pares adjacentes nos dois modos (ΔE normal ≥ 15, com
   daltonismo ≥ 8; 6–8 só com rótulo textual ao lado).
2. Rampa sequencial continua de uma matiz só?
3. "Sem dado" continua distinto de "zero"?
4. Algum texto pegou cor de série? Reverta para tinta.
5. Rótulo continua laranja e em caixa alta? É a assinatura.
