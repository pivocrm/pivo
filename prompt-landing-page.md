# PROMPT — Landing Page PIVO
> Cole esse prompt direto no Claude Code para gerar a landing page completa.

---

## CONTEXTO

Crie a landing page de marketing do **PIVO** — o primeiro CRM feito para o influenciador brasileiro gerenciar campanhas com marcas de forma profissional. O produto já existe (app Next.js em produção). Essa é a página pública de conversão, cujo único objetivo é fazer o visitante clicar em "Começar grátis" e iniciar o trial de 7 dias.

---

## STACK & ARQUITETURA

- **Next.js 14** com App Router
- **Tailwind CSS** para estilos base
- **Framer Motion** para todas as animações
- **React hooks** para interatividade (useRef, useEffect, useState)
- Arquivo único: `app/page.tsx` (ou `pages/index.tsx`)
- Imagens: use placeholder via `https://placehold.co` onde necessário
- Ícones: **Lucide React** exclusivamente (sem emojis como ícones estruturais)

---

## DESIGN SYSTEM

### Cores
```
Primary Green:   #5DC93E
Primary Navy:    #1A2547
Dark Navy:       #0F1A35
Light Green:     #7EE05F
Muted Green:     #5DC93E20  (verde com 12% opacidade — para glows e backgrounds)
White:           #FFFFFF
Off-white:       #F7F9FC
Text Primary:    #1A2547
Text Secondary:  #6B7A99
Border:          #E2E8F0
Border Dark:     #1E2D4D
```

### Tipografia
```
Títulos:  font-family: 'Nunito', sans-serif   (weights: 700, 800, 900)
Corpo:    font-family: 'Space Grotesk', sans-serif  (weights: 400, 500, 600)
```
Importar via Google Fonts no `<head>`:
```
https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Space+Grotesk:wght@400;500;600&display=swap
```

### Escala tipográfica
```
Hero headline:   clamp(2.5rem, 6vw, 4.5rem) / font-weight: 900 / Nunito
H2 sections:     clamp(1.75rem, 3.5vw, 2.75rem) / font-weight: 800 / Nunito
H3 cards:        1.25rem / font-weight: 700 / Nunito
Body large:      1.125rem / font-weight: 400 / Space Grotesk
Body:            1rem / font-weight: 400 / Space Grotesk
Label/Caption:   0.875rem / font-weight: 500 / Space Grotesk
```

### Espaçamento
Base 8pt grid. Seções com padding vertical de 96px desktop / 64px mobile.

### Border radius
```
Cards:   16px
Buttons: 12px
Pills:   9999px
```

### Sombras
```
Card default: 0 4px 24px rgba(26, 37, 71, 0.08)
Card hover:   0 12px 40px rgba(26, 37, 71, 0.16)
Green glow:   0 0 40px rgba(93, 201, 62, 0.25)
```

---

## SISTEMA DE ANIMAÇÕES (OBRIGATÓRIO)

### 1. Mouse Parallax — Hero Section
Implemente efeito de parallax responsivo ao movimento do mouse em TODA a hero section:
- Capturar posição do mouse com `useEffect` + `mousemove` listener
- Calcular offset: `(mouseX / windowWidth - 0.5) * intensidade`
- **Mascote/ilustração principal**: move `±20px` no eixo X, `±10px` no eixo Y (inverso ao mouse — efeito "depth")
- **Blob de fundo verde**: move `±30px` X, `±20px` Y (mesmo sentido do mouse)
- **Texto headline**: move `±6px` X, `±3px` Y (leve, sutil)
- **Screenshot do produto (mockup)**: move `±12px` X, `±8px` Y
- Usar `transform: translate()` com `transition: transform 0.1s ease-out` para suavidade

### 2. Scroll Reveal — Todas as Seções
Usar **Framer Motion** com `whileInView` + `viewport={{ once: true, margin: "-100px" }}`:
- Elementos entram com: `opacity: 0 → 1` + `y: 40 → 0`
- Duration: `0.6s` com `ease: [0.21, 0.47, 0.32, 0.98]`
- Cards em grid: stagger de `0.1s` entre cada item

### 3. Hover States
- **Botões primários**: `scale(1.03)` + intensificar sombra verde + cursor pointer — 200ms ease-out
- **Cards de features**: `translateY(-6px)` + sombra elevada — 250ms ease-out
- **Links de navegação**: underline slide da esquerda para direita — 200ms
- **Pricing cards**: borda verde iluminada no hover (box-shadow verde)

### 4. Background Blobs Animados
Na hero section, criar 2-3 blobs com animação CSS `@keyframes`:
- Blob 1: cor `#5DC93E` com 15% opacidade, 300px, blur 80px — animação de "float" lento (8s loop)
- Blob 2: cor `#1A2547` com 60% opacidade, 400px — animação contrária (10s loop)
- `animation: float 8s ease-in-out infinite alternate`

### 5. Contador Animado (Stats Section)
Quando entrar no viewport, números contam de 0 até o valor final:
- "500k+" criadores — conta em 2s
- "R$32B" mercado — conta em 2s
- "7 dias" trial — aparece com fade

### 6. Glassmorphism Cards
Cards de features e pricing usam:
```css
background: rgba(255, 255, 255, 0.07);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.12);
```
(Apenas nas seções com fundo escuro/navy)

---

## ESTRUTURA DA PÁGINA — SEÇÃO POR SEÇÃO

---

### SEÇÃO 0 — Navbar

**Visual:**
- Fundo: `transparent` que transiciona para `rgba(15, 26, 53, 0.95)` com `backdrop-filter: blur(20px)` após 80px de scroll
- Position: `fixed` top-0, z-index 50
- Height: 72px
- Logo: SVG do camaleão PIVO à esquerda (ou placeholder `[LOGO PIVO]`)
- Links center: "Como funciona", "Preços", "Entrar"
- CTA direita: botão verde "Começar grátis" (pill shape, 40px height)
- Mobile: hamburger menu com drawer

---

### SEÇÃO 1 — Hero

**Fundo:** Dark navy `#0F1A35` com blobs animados e grid sutil de pontos (dot pattern via SVG background)

**Layout:** Duas colunas desktop (texto esquerda, produto direita) / Stack mobile

**Copy:**

```
[PILL BADGE — verde, cantos arredondados]
"✦ Novo · O CRM feito para criadores brasileiros"

[HEADLINE — Nunito 900, branco, clamp(2.5rem, 6vw, 4.5rem)]
"Chega de gerenciar
campanha no WhatsApp."

[SUBHEADLINE em verde #5DC93E]
"Você é uma empresa. Opere como uma."

[BODY — Space Grotesk, #A0AEBF, 1.125rem, max-width 520px]
"O PIVO organiza seus deals, contratos e pagamentos
num lugar só. Do primeiro contato da marca ao
pagamento na conta — tudo sob controle."

[DOIS CTAs lado a lado]
Botão primário (verde): "Começar grátis por 7 dias →"
Botão secundário (outline branco): "Ver como funciona"

[SOCIAL PROOF micro — abaixo dos botões]
Avatares empilhados (5 círculos sobrepostos) + texto:
"Junte-se a mais de 200 criadores que já saíram do caos"
```

**Lado direito:**
- Screenshot do dashboard do PIVO dentro de um mockup de browser/Mac
- Borda verde sutil (1px, 15% opacidade) ao redor do mockup
- Sombra verde forte embaixo: `0 40px 80px rgba(93, 201, 62, 0.2)`
- Aplicar parallax ao mockup

**Mascote:**
- Camaleão PIVO posicionado na borda inferior do mockup, como se estivesse "segurando" a tela
- Tamanho: ~120px
- Aplicar parallax inverso

---

### SEÇÃO 2 — Dor (Pain Section)

**Fundo:** Off-white `#F7F9FC`

**Copy:**

```
[LABEL acima — verde, uppercase, 0.875rem, letter-spacing 2px]
"A REALIDADE DE TODO CRIADOR"

[H2 — navy, centralizado]
"Você ainda gerencia assim?"

[SUBHEADLINE — texto secundário]
"Se você fechou campanha nos últimos 30 dias,
provavelmente se reconhece aqui:"
```

**Grid de 3 cards** (ícones Lucide + texto):

```
Card 1 — Ícone: MessageCircle
Título: "WhatsApp como CRM"
Texto: "Proposta da marca perdida entre meme de amigo e figurinha. Você vira a tela do celular de cabeça pra baixo procurando o valor que a marca te mandou."

Card 2 — Ícone: FileSpreadsheet
Título: "Planilha do caos"
Texto: "Linha 47: 'Collab Nike - PAGO?'. Linha 48: 'Nike 2 - não sei'. Linha 49: em branco. Você não sabe o que recebeu, o que vai receber, nem o que esqueceu."

Card 3 — Ícone: AlertCircle
Título: "NF no improviso"
Texto: "Marca pede nota fiscal. Você lembra que é MEI, que talvez tenha emitido uma vez, abre o portal da prefeitura e reza."
```

Cards com borda esquerda verde, fundo branco, sombra suave. Hover: eleva levemente.

**Transição para próxima seção:**
```
[Texto centralizado abaixo dos cards — verde, bold]
"Existe uma forma melhor. ↓"
```

---

### SEÇÃO 3 — Solução / Features

**Fundo:** Dark navy `#1A2547`

**Copy:**

```
[LABEL]
"O QUE O PIVO FAZ POR VOCÊ"

[H2 — branco]
"Tudo que você precisa.
Nada que você não usa."

[Subtítulo — #A0AEBF]
"Construído especificamente para o dia a dia
do influenciador brasileiro."
```

**Layout de features: 2 colunas, 3 linhas (6 features)**
Cards glassmorphism com ícone Lucide, título e descrição:

```
Feature 1 — Ícone: Kanban
Título: "Pipeline de Campanhas"
Texto: "Visualize cada deal do primeiro contato até o pagamento. Kanban visual, sem planilha, sem caos."
Badge: "Mais usado"

Feature 2 — Ícone: FileText  
Título: "Media Kit Dinâmico"
Texto: "Sua página pública com dados reais e sempre atualizados. Manda o link, não o PDF velho de 2022."

Feature 3 — Ícone: DollarSign
Título: "Controle Financeiro"
Texto: "Tudo que recebeu, tudo que vai receber, tudo que está atrasado. Por campanha, por mês, por marca."

Feature 4 — Ícone: FileSignature
Título: "Gestão de Contratos"
Texto: "Templates prontos para publi, stories e reels. Nunca feche campanha no boca a boca de novo."

Feature 5 — Ícone: BarChart2
Título: "Relatório de Campanha"
Texto: "PDF automático com suas métricas reais para enviar para a marca depois de cada campanha."

Feature 6 — Ícone: Star (destaque especial)
Título: "Creator Score™"  
Texto: "Seu score de credibilidade no mercado. Quanto mais você usa, mais valioso fica seu perfil para as marcas."
Badge verde pulsante: "Em breve"
```

---

### SEÇÃO 4 — Como Funciona

**Fundo:** Off-white `#F7F9FC`

**Copy:**

```
[LABEL]
"SIMPLES ASSIM"

[H2 — navy]
"Comece em menos de 5 minutos"
```

**Timeline horizontal (desktop) / vertical (mobile) — 4 passos:**

```
Passo 1 — Ícone: UserPlus
"Crie sua conta"
"Cadastro em menos de 1 minuto. Sem cartão de crédito."

Passo 2 — Ícone: PlusCircle
"Adicione sua primeira campanha"
"Marca, valor, prazo, briefing. Tudo num lugar só."

Passo 3 — Ícone: Layout
"Publique seu Media Kit"
"Link único que você manda para as marcas. Atualiza sozinho."

Passo 4 — Ícone: TrendingUp
"Acompanhe e receba"
"Saiba exatamente o que foi pago, o que está pendente e o que vence essa semana."
```

Linha conectando os passos (verde, com pontos nos nós). Animação: linha "desenha" da esquerda para direita quando entra no viewport.

---

### SEÇÃO 5 — Stats / Mercado

**Fundo:** Verde `#5DC93E` (única seção totalmente verde)

**Copy:**

```
[H2 — navy, centralizado]
"O mercado está crescendo.
Sua gestão precisa acompanhar."
```

**3 stats grandes com contador animado:**

```
Stat 1:
Número: "500k+"
Label: "Criadores monetizados no Brasil"

Stat 2:
Número: "R$32B"  
Label: "Mercado global de influencer marketing em 2025"

Stat 3:
Número: "7 dias"
Label: "Para testar o PIVO completamente de graça"
```

Divisores verticais entre stats. Texto em navy. Fundo verde com textura sutil (noise ou grid leve).

---

### SEÇÃO 6 — Depoimentos / Social Proof

**Fundo:** Branco

**Copy:**

```
[LABEL]
"QUEM JÁ USA"

[H2 — navy]
"O que os criadores estão dizendo"
```

**3 cards de depoimento** (dados fictícios para placeholder — instrução: serão substituídos):

```
Depoimento 1:
Avatar: placeholder circular 48px
Nome: "Rafaela B."
Handle: "@rafaelab · 89k seguidores"
Nicho tag: "Moda & Lifestyle"
Texto: "Eu literalmente perdia proposta de marca porque ficava enterrada no WhatsApp. Agora vejo tudo num kanban. Parece óbvio mas não existia antes."
Estrelas: 5

Depoimento 2:
Avatar: placeholder
Nome: "Thalita M."
Handle: "@thalitam · 154k seguidores"
Nicho tag: "Fitness"
Texto: "O media kit dinâmico salvou minha vida. Parei de mandar PDF. Mando o link e ele já tem todos os meus dados atualizados automaticamente."
Estrelas: 5

Depoimento 3:
Avatar: placeholder
Nome: "Giovanna G."
Handle: "@gio · 67k seguidores"
Nicho tag: "Gastronomia"
Texto: "Finalmente sei quanto recebi no mês. Soa básico mas era impossível saber antes. Abria 3 aplicativos de banco e ainda ficava com dúvida."
Estrelas: 5
```

Cards brancos com sombra suave, borda esquerda verde 3px. Aspas grandes decorativas em verde com baixa opacidade.

---

### SEÇÃO 7 — Pricing

**Fundo:** `#F7F9FC`

**Copy:**

```
[LABEL]
"PLANOS"

[H2 — navy, centralizado]
"Simples. Transparente. Sem surpresa."

[Subtítulo]
"7 dias grátis em qualquer plano. Cancele quando quiser."

[Toggle: Mensal / Anual — "Economize 20%" badge no Anual]
```

**3 cards de pricing:**

```
Card 1 — Creator (borda normal)
Preço: "R$197/mês"
Desconto anual: "R$157/mês"
Tagline: "Para criadores independentes"
Features lista (Lucide Check ícones):
✓ Pipeline ilimitado de campanhas
✓ Media Kit dinâmico com link público
✓ Controle financeiro completo
✓ Gestão de contratos
✓ Até 3 usuários
✓ Suporte por chat
CTA: "Começar grátis por 7 dias"

Card 2 — Agency (DESTAQUE — borda verde, badge "Mais popular", card ligeiramente maior)
Fundo: dark navy #1A2547
Preço: "R$697/mês"
Desconto anual: "R$557/mês"
Tagline: "Para assessorias de influência"
Features lista:
✓ Tudo do Creator
✓ Criadores ilimitados na carteira
✓ Dashboard centralizado por criador
✓ Relatórios por carteira
✓ Revenue share com criadores
✓ Suporte prioritário
CTA: "Começar grátis por 7 dias"

Card 3 — Agency Pro (borda normal)
Preço: "R$1.497/mês"
Desconto anual: "R$1.197/mês"
Tagline: "Para assessorias em escala"
Features lista:
✓ Tudo do Agency
✓ White-label (sua marca)
✓ API de integração
✓ Suporte dedicado
✓ SLA garantido
✓ Onboarding personalizado
CTA: "Falar com time comercial"
```

**Risk reversal abaixo dos cards:**
```
[Ícone Shield] "Garantia de 30 dias. Se não gostar, devolvemos 100%."
[Ícone CreditCard] "Sem cartão de crédito para começar."
[Ícone X] "Cancele quando quiser, sem multa."
```

---

### SEÇÃO 8 — CTA Final

**Fundo:** Gradiente diagonal de `#0F1A35` para `#1A2547`

**Copy:**

```
[Mascote camaleão PIVO — maior, centralizado, com animação idle (leve flutuação CSS)]

[H2 — branco, centralizado, Nunito 900]
"Sua carreira é um negócio.
Comece a tratar como um."

[Subtítulo — #A0AEBF]
"Junte-se aos criadores que pararam de improvisar
e começaram a operar com profissionalismo."

[CTA principal — verde, grande, centralizado]
"Começar grátis por 7 dias →"
[Caption abaixo do botão — pequena, #6B7A99]
"Sem cartão de crédito · Cancele quando quiser · Setup em 5 minutos"
```

Blobs verdes animados no fundo. Efeito de glow verde atrás do botão quando hover.

---

### SEÇÃO 9 — Footer

**Fundo:** `#0F1A35`

**Layout 4 colunas:**

```
Col 1 — Logo + tagline
Logo PIVO
"Você é uma empresa. Opere como uma."
[Ícones sociais: Instagram, LinkedIn, TikTok — Lucide]

Col 2 — Produto
Media Kit
Pipeline
Financeiro
Contratos
Creator Score™

Col 3 — Empresa
Sobre
Blog
Parceiros
Afiliados

Col 4 — Legal
Termos de uso
Política de privacidade
Contato
```

**Rodapé inferior:**
```
"© 2025 Pivo · Feito com ♥ para criadores brasileiros"
```

---

## REQUISITOS TÉCNICOS OBRIGATÓRIOS

### Performance
- Lazy loading em todas as imagens abaixo do fold
- `font-display: swap` nos Google Fonts
- `prefers-reduced-motion`: se ativo, desabilitar todos os parallax e animações de entrada, mantendo apenas fade suave

### Responsividade
- Mobile-first breakpoints: 375px / 768px / 1024px / 1440px
- Nenhum elemento com scroll horizontal
- Hero em mobile: stack vertical (texto acima, mockup abaixo)
- Pricing cards em mobile: scroll horizontal snap ou stack vertical
- Navbar mobile: hamburger + drawer overlay

### Acessibilidade
- Contraste mínimo 4.5:1 em todos os textos
- `alt` descritivo em todas as imagens
- `aria-label` em todos os botões icon-only
- `role="navigation"` na navbar
- Focus rings visíveis (não remover outline)

### Interação
- Todos os botões: `cursor: pointer`, feedback visual em 100ms
- Hover states em todos os links e cards
- Smooth scroll nos links âncora da navbar
- Scroll progress indicator opcional no topo (fina barra verde)

---

## VARIÁVEIS DE CONFIGURAÇÃO

Centralize no topo do arquivo para fácil edição:
```typescript
const CONFIG = {
  trialDays: 7,
  creatorPrice: "R$197",
  agencyPrice: "R$697",
  agencyProPrice: "R$1.497",
  annualDiscount: "20%",
  ctaUrl: "/signup",        // URL do cadastro
  loginUrl: "/login",       // URL do login
  demoUrl: "#como-funciona", // âncora
  totalUsers: "200+",
}
```

---

## ENTREGÁVEL ESPERADO

Um único arquivo `landing-page.tsx` (ou `page.tsx`) completamente funcional com:
- Todo HTML estruturado semanticamente
- Todos os estilos via Tailwind + CSS modules/inline onde necessário
- Todas as animações via Framer Motion + CSS
- Parallax do mouse implementado com hooks
- Responsividade completa
- Copy exatamente como especificado acima
- Componentes organizados por seção com comentários claros

**Após gerar, verifique:**
1. Parallax funciona no desktop ao mover o mouse na hero
2. Scroll reveal em todas as seções
3. Toggle mensal/anual no pricing funciona
4. Navbar muda de aparência após scroll
5. Todos os CTAs apontam para `CONFIG.ctaUrl`
6. Sem scroll horizontal em nenhum breakpoint
