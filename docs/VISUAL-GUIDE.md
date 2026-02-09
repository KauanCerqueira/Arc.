# Arc. - Guia de Identidade Visual

> Documentação completa do sistema de design do Arc. para manter consistência visual em todas as interfaces.

---

## 📐 Filosofia de Design

**Minimalista. Direto. Funcional.**

O Arc. é construído com foco em clareza e eficiência. Sem elementos decorativos desnecessários, cada pixel tem um propósito.

### Princípios

1. **Hierarquia Clara** - Tipografia bold e espaçamento generoso guiam o olhar
2. **Contraste Forte** - Preto absoluto (#0E0E0E) vs Branco quente (#F6F5F2)
3. **Bordas Definidas** - Separação visual através de borders sutis, não sombras pesadas
4. **Transições Suaves** - Micro-interações de 200ms para feedback instantâneo
5. **Responsivo por Padrão** - Mobile-first com breakpoints bem definidos

---

## 🎨 Paleta de Cores

### Cores Primárias (Brand)

```css
--arc-black: #0E0E0E;      /* Preto profundo, texto principal dark */
--arc-white: #F6F5F2;      /* Branco quente, fundo light mode */
--arc-gray: #D9D9D9;       /* Cinza neutro, texto secundário */
--arc-violet: #6E62E5;     /* Violeta primário, ações principais */
--arc-red: #EB5757;        /* Vermelho, alertas e destaques */
--arc-blue: #4D7DFF;       /* Azul, informações */
```

### Light Mode

```css
/* Backgrounds */
--bg-primary: #F6F5F2;     /* Fundo principal - bege quente */
--bg-secondary: #FFFFFF;   /* Cards, modais, sidebar */
--bg-tertiary: #EAE7E0;    /* Backgrounds alternativos */
--bg-sidebar: #FFFFFF;     /* Sidebar específico */

/* Texto */
--color-text: #0E0E0E;          /* Texto principal - preto */
--color-text-light: #4A4A4A;    /* Texto secundário - cinza escuro */

/* Bordas */
--color-border: #e0ddd8;        /* Bordas sutis - bege escuro */

/* Primária */
--color-primary: #6E62E5;       /* Violeta para CTAs */
--color-primary-hover: #5E55D9; /* Violeta escuro no hover */
```

### Dark Mode

```css
/* Backgrounds */
--bg-primary: #0E0E0E;     /* Fundo principal - preto profundo */
--bg-secondary: #121212;   /* Cards, modais, sidebar */
--bg-tertiary: #161616;    /* Backgrounds alternativos */
--bg-sidebar: #121212;     /* Sidebar específico */

/* Texto */
--color-text: #F6F5F2;          /* Texto principal - branco quente */
--color-text-light: #D9D9D9;    /* Texto secundário - cinza claro */

/* Bordas */
--color-border: #1F1F1F;        /* Bordas sutis - cinza muito escuro */

/* Primária */
--color-primary: #6E62E5;       /* Violeta para CTAs */
--color-primary-hover: #5E55D9; /* Violeta escuro no hover */
```

### Cores de Destaque (Templates/Features)

```css
/* Usadas para ícones de templates e badges de features */
--template-blue: #3b82f6;      /* Tarefas, Calendar */
--template-purple: #8b5cf6;    /* Kanban, Focus */
--template-red: #ef4444;       /* Bugs, Urgente */
--template-green: #10b981;     /* Calendar, Concluído */
--template-orange: #f59e0b;    /* Projetos */
--template-teal: #14b8a6;      /* Table */
--template-lime: #84cc16;      /* Nutrição */
--template-pink: #f43f5e;      /* Workout */
--template-emerald: #059669;   /* Budget */
--template-indigo: #6366f1;    /* Study */
--template-cyan: #06b6d4;      /* Timeline */
--template-sky: #0ea5e9;       /* Roadmap */
--template-yellow: #eab308;    /* Sprint */
--template-magenta: #ec4899;   /* MindMap */
--template-slate: #64748b;     /* Documents */
```

---

## ✍️ Tipografia

### Fonte Principal

**Inter** - Sans-serif moderna e altamente legível

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Pesos (Weights)

```css
font-weight: 300;  /* Light - raramente usado */
font-weight: 400;  /* Regular - corpo de texto */
font-weight: 500;  /* Medium - labels, tags */
font-weight: 600;  /* Semibold - subtítulos */
font-weight: 700;  /* Bold - títulos secundários */
font-weight: 800;  /* Extrabold - títulos principais */
font-weight: 900;  /* Black - hero sections, logos */
```

### Scale de Tamanhos

```css
/* Hierarquia de títulos */
text-8xl: 6rem (96px);    /* Hero Landing - Mobile: 5xl */
text-7xl: 4.5rem (72px);  /* Hero Dashboard - Mobile: 6xl */
text-6xl: 3.75rem (60px); /* Títulos principais - Mobile: 5xl */
text-5xl: 3rem (48px);    /* Títulos seções - Mobile: 4xl */
text-4xl: 2.25rem (36px); /* Subtítulos grandes */
text-3xl: 1.875rem (30px); /* Subtítulos médios */
text-2xl: 1.5rem (24px);  /* Subtítulos pequenos */
text-xl: 1.25rem (20px);  /* Leads, descrições */
text-lg: 1.125rem (18px); /* Corpo grande */
text-base: 1rem (16px);   /* Corpo padrão */
text-sm: 0.875rem (14px); /* Corpo pequeno, labels */
text-xs: 0.75rem (12px);  /* Metadados, tags */
```

### Tracking (Letter Spacing)

```css
tracking-tight: -0.025em;  /* Títulos grandes (5xl+) */
tracking-normal: 0em;      /* Corpo de texto */
tracking-wide: 0.025em;    /* Labels */
tracking-wider: 0.05em;    /* Tags uppercase */
tracking-[0.12em]: 0.12em; /* Badges uppercase */
```

### Leading (Line Height)

```css
leading-none: 1;           /* Títulos hero compactos */
leading-tight: 1.25;       /* Títulos */
leading-snug: 1.375;       /* Subtítulos */
leading-normal: 1.5;       /* Corpo padrão */
leading-relaxed: 1.625;    /* Corpo com respiração */
leading-loose: 2;          /* Textos espaçados */
```

### Exemplos de Uso

```tsx
/* Hero Landing Page */
<h1 className="text-8xl font-extrabold tracking-tight leading-[0.9]">
  organize.
</h1>

/* Título Dashboard */
<h1 className="text-7xl font-extrabold tracking-tight leading-[1.05]">
  Planeje com clareza.
</h1>

/* Badge/Chip */
<span className="text-xs font-semibold uppercase tracking-[0.12em]">
  painel diário
</span>

/* Corpo de texto */
<p className="text-lg leading-relaxed text-arc-muted">
  Organize seu dia sem fricção: visão, ritmo e entrega em um só lugar.
</p>
```

---

## 📦 Componentes

### Botões

#### Primário (CTA Principal)

```tsx
<button className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-arc text-arc-primary font-bold text-base hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]">
  começar grátis
</button>
```

**Especificações:**
- Background: `bg-gray-900 dark:bg-white`
- Texto: `text-white dark:text-gray-900`
- Fonte: `font-bold` ou `font-extrabold`
- Padding: `px-8 py-4` (large), `px-6 py-3` (medium), `px-4 py-2` (small)
- Border Radius: `rounded-lg`
- Hover: `opacity-90` + `scale-[1.02]`
- Active: `scale-[0.98]`
- Transição: `transition-all duration-200`

#### Secundário (Outline)

```tsx
<button className="inline-flex items-center gap-2 px-8 py-4 rounded-lg border-2 border-arc text-arc font-semibold hover:bg-arc-secondary transition-all hover:scale-[1.02]">
  ver métricas
</button>
```

**Especificações:**
- Border: `border-2 border-gray-900 dark:border-white`
- Texto: `text-gray-900 dark:text-white`
- Hover: `bg-gray-50 dark:bg-slate-800/50`

#### Terciário (Ghost)

```tsx
<button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-arc-muted hover:text-arc hover:bg-arc-secondary/60 transition-colors">
  cancelar
</button>
```

**Especificações:**
- Sem border
- Texto: `text-gray-600 dark:text-gray-400`
- Hover: `text-gray-900 dark:text-white` + `bg-gray-100 dark:bg-slate-800/60`

### Cards

#### Card Padrão

```tsx
<div className="p-6 rounded-xl border-2 border-arc bg-arc-secondary hover:bg-arc-primary transition-all duration-300 hover:scale-[1.01]">
  {/* Conteúdo */}
</div>
```

**Especificações:**
- Padding: `p-6` (medium), `p-8` (large), `p-4` (small)
- Border: `border-2 border-gray-200 dark:border-slate-800`
- Background: `bg-white dark:bg-slate-900`
- Border Radius: `rounded-xl` (padrão), `rounded-2xl` (grande)
- Hover: Troca background + `scale-[1.01]`
- Transição: `transition-all duration-300`

#### Card com Ícone

```tsx
<div className="group p-6 rounded-xl border-2 border-arc bg-arc-secondary hover:border-[#EF4444] transition-all">
  <div className="w-12 h-12 rounded-xl border-2 border-arc flex items-center justify-center mb-5 group-hover:scale-110 group-hover:border-[#EF4444] transition-all">
    <Icon className="w-6 h-6 text-arc group-hover:text-[#EF4444]" />
  </div>
  <h3 className="text-xl font-bold text-arc">Título</h3>
  <p className="text-sm text-arc-muted">Descrição</p>
</div>
```

**Especificações:**
- Ícone Container: `w-12 h-12 rounded-xl border-2`
- Hover: Border color muda + scale no ícone
- Usa `group` e `group-hover:` para coordenação

### Badges / Pills

#### Badge Principal

```tsx
<span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-arc bg-arc-secondary hover:border-arc transition-colors">
  <Icon className="w-4 h-4 text-arc" />
  <span className="text-sm font-medium text-arc">label</span>
</span>
```

**Especificações:**
- Shape: `rounded-full`
- Padding: `px-4 py-2` (medium), `px-3 py-1.5` (small)
- Border: `border border-gray-200 dark:border-slate-700`
- Texto: `text-sm font-medium`

#### Badge Uppercase (Chip)

```tsx
<span className="inline-flex px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-arc-muted bg-arc-secondary border border-arc rounded-full">
  painel diário
</span>
```

**Especificações:**
- Texto: `text-xs font-semibold uppercase tracking-[0.12em]`
- Cores mais sutis: `text-gray-600 dark:text-gray-300`

### Inputs / Forms

#### Input de Texto

```tsx
<input
  type="text"
  className="w-full px-4 py-3 rounded-lg border-2 border-arc bg-arc-secondary text-arc placeholder:text-arc-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
  placeholder="Digite algo..."
/>
```

**Especificações:**
- Padding: `px-4 py-3`
- Border: `border-2` em repouso
- Focus: `border-primary` + `ring-2 ring-primary/20`
- Placeholder: `placeholder:text-gray-400 dark:placeholder:text-gray-500`

#### Select / Dropdown

```tsx
<select className="w-full px-4 py-3 rounded-lg border-2 border-arc bg-arc-secondary text-arc focus:border-primary focus:ring-2 focus:ring-primary/20">
  <option>Opção 1</option>
</select>
```

**Especificações:**
- Mesmas de input
- Arrow customizada via background-image (opcional)

### Modais

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
  <div className="w-full max-w-lg bg-arc-secondary rounded-2xl shadow-2xl border border-arc p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
    {/* Conteúdo */}
  </div>
</div>
```

**Especificações:**
- Overlay: `bg-black/50 backdrop-blur-sm`
- Container: `rounded-2xl shadow-2xl`
- Animação: `animate-in fade-in slide-in-from-bottom-4`
- Max Width: `max-w-lg` (padrão), `max-w-2xl` (grande)

---

## 🔲 Bordas e Raios

### Border Radius

```css
rounded-sm: 0.125rem (2px);   /* Badges, tags pequenos */
rounded: 0.25rem (4px);        /* Inputs pequenos */
rounded-md: 0.375rem (6px);    /* Botões pequenos */
rounded-lg: 0.5rem (8px);      /* Botões, inputs padrão */
rounded-xl: 0.75rem (12px);    /* Cards médios */
rounded-2xl: 1rem (16px);      /* Cards grandes, modais */
rounded-3xl: 1.5rem (24px);    /* Hero cards */
rounded-full: 9999px;          /* Badges, avatares */
```

### Border Width

```css
border: 1px;    /* Separadores sutis */
border-2: 2px;  /* Padrão para cards, botões */
```

---

## 🌑 Sombras

**Filosofia:** Sombras sutis. Preferir bordas a sombras pesadas.

```css
/* Light Mode */
--shadow-soft: 0 2px 8px rgba(34, 34, 34, 0.04);
--shadow-medium: 0 4px 16px rgba(34, 34, 34, 0.08);
--shadow-strong: 0 8px 24px rgba(34, 34, 34, 0.12);

/* Dark Mode */
--shadow-soft: 0 2px 8px rgba(0, 0, 0, 0.3);
--shadow-medium: 0 4px 16px rgba(0, 0, 0, 0.4);
--shadow-strong: 0 8px 24px rgba(0, 0, 0, 0.5);
```

### Uso em Tailwind

```tsx
/* Sombra suave - Hover de botões, cards inativos */
<div className="shadow-sm">

/* Sombra média - Cards elevados */
<div className="shadow-md">

/* Sombra forte - Modais, dropdowns */
<div className="shadow-2xl">
```

**Quando usar:**
- **shadow-sm**: Hover states, separação leve
- **shadow-md**: Cards importantes, elementos elevados
- **shadow-2xl**: Modais, dropdowns, tooltips

---

## ⚡ Animações e Transições

### Durações

```css
duration-100: 100ms;   /* Micro-interações, toggle rápido */
duration-200: 200ms;   /* Padrão - hover, focus */
duration-300: 300ms;   /* Transições de conteúdo, fade */
duration-500: 500ms;   /* Animações complexas */
```

### Easing

```css
ease-linear: linear;              /* Loading spinners */
ease-in: cubic-bezier(0.4, 0, 1, 1);     /* Saída */
ease-out: cubic-bezier(0, 0, 0.2, 1);    /* Entrada - PADRÃO */
ease-in-out: cubic-bezier(0.4, 0, 0.2, 1); /* Vai e volta */
```

### Animações Comuns

#### Fade In

```tsx
<div className="animate-in fade-in duration-300">
  {/* Conteúdo */}
</div>
```

#### Slide In

```tsx
/* De baixo */
<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">

/* De cima */
<div className="animate-in fade-in slide-in-from-top-2 duration-200">

/* Da esquerda */
<div className="animate-in fade-in slide-in-from-left-2 duration-200">
```

#### Hover Scale

```tsx
<button className="transition-all hover:scale-[1.02] active:scale-[0.98]">
  {/* Texto */}
</button>
```

**Especificações:**
- Hover: `scale-[1.02]` (2% maior)
- Active: `scale-[0.98]` (2% menor) - feedback tátil
- Transição: `transition-all duration-200`

#### Rotate (Chevrons, Ícones)

```tsx
<ChevronDown className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
```

### Loading / Spinner

```css
@keyframes spinner {
  to { transform: rotate(360deg); }
}

.loading-spinner {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spinner 0.6s linear infinite;
}
```

---

## 📏 Espaçamento

### Sistema de Spacing (4px base)

```css
/* Tailwind spacing scale (rem) */
0: 0px;
0.5: 0.125rem (2px);
1: 0.25rem (4px);
1.5: 0.375rem (6px);
2: 0.5rem (8px);
2.5: 0.625rem (10px);
3: 0.75rem (12px);
3.5: 0.875rem (14px);
4: 1rem (16px);
5: 1.25rem (20px);
6: 1.5rem (24px);
8: 2rem (32px);
10: 2.5rem (40px);
12: 3rem (48px);
16: 4rem (64px);
20: 5rem (80px);
24: 6rem (96px);
```

### Padding Interno (Componentes)

```css
/* Botões */
px-4 py-2: Small
px-6 py-3: Medium
px-8 py-4: Large

/* Cards */
p-4: Small
p-6: Medium
p-8: Large

/* Inputs */
px-4 py-3: Padrão
px-5 py-4: Large
```

### Gap (Flexbox/Grid)

```css
gap-2: 0.5rem (8px);   /* Ícone + texto, badges */
gap-3: 0.75rem (12px); /* Cards pequenos */
gap-4: 1rem (16px);    /* Grid padrão */
gap-6: 1.5rem (24px);  /* Seções, cards médios */
gap-8: 2rem (32px);    /* Seções grandes */
```

### Margin (Seções)

```css
mb-4: 1rem (16px);      /* Entre parágrafos */
mb-6: 1.5rem (24px);    /* Entre seções pequenas */
mb-8: 2rem (32px);      /* Entre seções médias */
mb-12: 3rem (48px);     /* Entre seções grandes */
mb-16: 4rem (64px);     /* Entre módulos */
```

---

## 🎯 Ícones

### Biblioteca: Lucide React

```tsx
import { Icon } from 'lucide-react';
```

### Tamanhos Padrão

```tsx
<Icon className="w-4 h-4" />   /* 16px - Badges, inline text */
<Icon className="w-5 h-5" />   /* 20px - Botões, inputs */
<Icon className="w-6 h-6" />   /* 24px - Cards, menu */
<Icon className="w-8 h-8" />   /* 32px - Hero sections */
```

### Stroke Width

```tsx
<Icon strokeWidth={1.5} />  /* Padrão - balanceado */
<Icon strokeWidth={2} />    /* Títulos, destaque */
<Icon strokeWidth={1} />    /* Sutil, backgrounds */
```

### Cores

```tsx
/* Seguir cor do texto */
<Icon className="text-arc" />

/* Cor primária */
<Icon className="text-primary" />

/* Cor de template */
<Icon className="text-[#3b82f6]" />

/* Muted */
<Icon className="text-arc-muted" />
```

---

## 📱 Layout

### Estrutura Geral

```
┌─────────────────────────────────────┐
│           Header (opcional)          │
├──────┬──────────────────────────────┤
│      │                              │
│ Side │       Main Content           │
│ bar  │                              │
│      │                              │
│      │                              │
└──────┴──────────────────────────────┘
```

### Sidebar

**Desktop:**
- Largura: `280px` (expandido), `64px` (colapsado)
- Background: `bg-white dark:bg-slate-900`
- Border: `border-r border-gray-200 dark:border-slate-800`
- Padding: `p-3` (geral), `px-3 pb-3` (workspace selector)

**Mobile:**
- Overlay full screen
- Slide in da esquerda
- Backdrop: `bg-black/50 backdrop-blur-sm`

```tsx
/* Desktop - expandido */
<aside className="w-[280px] bg-arc-sidebar border-r border-arc">

/* Desktop - colapsado */
<aside className="w-16 bg-arc-sidebar border-r border-arc">

/* Mobile - overlay */
<aside className="fixed inset-y-0 left-0 w-64 bg-arc-sidebar z-50 animate-in slide-in-from-left">
```

### Main Content

```tsx
<main className="flex-1 bg-arc-primary overflow-auto">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
    {/* Conteúdo */}
  </div>
</main>
```

**Especificações:**
- Max Width: `max-w-7xl` (1280px)
- Padding horizontal: `px-4` (mobile), `px-6` (tablet+)
- Padding vertical: `py-6` (mobile), `py-8` (desktop)

### Header

```tsx
<header className="h-16 bg-arc-secondary border-b border-arc px-6 flex items-center justify-between">
  {/* Conteúdo */}
</header>
```

**Especificações:**
- Altura fixa: `h-16` (64px)
- Background: `bg-white dark:bg-slate-900`
- Border bottom: `border-b border-gray-200 dark:border-slate-800`

---

## 📐 Breakpoints

```css
/* Tailwind breakpoints */
sm: 640px;    /* Tablet pequeno */
md: 768px;    /* Tablet */
lg: 1024px;   /* Desktop */
xl: 1280px;   /* Desktop grande */
2xl: 1536px;  /* Desktop muito grande */
```

### Mobile-First

**Sempre construir mobile-first:**

```tsx
/* ❌ Errado - desktop-first */
<div className="text-2xl sm:text-lg">

/* ✅ Correto - mobile-first */
<div className="text-lg sm:text-2xl">
```

### Padrões Responsivos Comuns

```tsx
/* Grid responsivo */
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

/* Padding responsivo */
<div className="px-4 sm:px-6 lg:px-8">

/* Texto responsivo */
<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">

/* Gap responsivo */
<div className="gap-4 sm:gap-6 lg:gap-8">

/* Visibilidade condicional */
<div className="hidden lg:block">  {/* Desktop apenas */}
<div className="block lg:hidden">  {/* Mobile apenas */}
```

---

## 🎨 Estados de Componentes

### Hover

```tsx
/* Botão */
hover:opacity-90 hover:scale-[1.02]

/* Card */
hover:bg-arc-primary hover:border-primary

/* Link */
hover:text-arc hover:underline
```

### Active (Pressed)

```tsx
/* Botão */
active:scale-[0.98]

/* Card selecionado */
bg-gray-100 dark:bg-slate-800 border-primary
```

### Focus

```tsx
/* Input */
focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none

/* Botão */
focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
```

### Disabled

```tsx
/* Botão */
disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100

/* Input */
disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:text-gray-400
```

### Loading

```tsx
<button disabled className="relative">
  <span className={loading ? 'opacity-0' : ''}>Salvar</span>
  {loading && (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  )}
</button>
```

---

## 🌙 Dark Mode

### Implementação

Usa `class` strategy do Tailwind. Classe `.dark` no `<html>` elemento.

```tsx
/* Exemplo de componente dark-mode-aware */
<div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
  <p className="text-gray-600 dark:text-gray-300">
    Texto secundário
  </p>
</div>
```

### Padrões de Cores

| Elemento | Light | Dark |
|----------|-------|------|
| Fundo principal | `bg-[#F6F5F2]` | `bg-[#0E0E0E]` |
| Fundo cards | `bg-white` | `bg-slate-900` |
| Texto principal | `text-gray-900` | `text-white` |
| Texto secundário | `text-gray-600` | `text-gray-300` |
| Bordas | `border-gray-200` | `border-slate-800` |
| Hover | `hover:bg-gray-50` | `hover:bg-slate-800` |

### Classes Utilitárias

```css
.bg-arc-primary { background-color: var(--bg-primary); }
.bg-arc-secondary { background-color: var(--bg-secondary); }
.text-arc { color: var(--color-text); }
.text-arc-muted { color: var(--color-text-light); }
.border-arc { border-color: var(--color-border); }
```

---

## 📋 Checklist de Consistência

Use este checklist ao criar novos componentes:

### Visual
- [ ] Usa paleta de cores Arc (variáveis CSS)
- [ ] Tipografia Inter com weights corretos
- [ ] Border radius consistente (lg, xl, 2xl, full)
- [ ] Espaçamento segue sistema 4px
- [ ] Ícones são Lucide React com tamanho adequado

### Interatividade
- [ ] Transições suaves (200-300ms)
- [ ] Hover states visíveis
- [ ] Active/pressed feedback tátil
- [ ] Focus states acessíveis (outline/ring)
- [ ] Loading states quando necessário

### Responsividade
- [ ] Mobile-first (sm:, md:, lg:)
- [ ] Touch targets mínimo 44x44px
- [ ] Texto legível em todos os tamanhos
- [ ] Layout adapta sem overflow horizontal

### Acessibilidade
- [ ] Contraste WCAG AA (4.5:1 texto, 3:1 UI)
- [ ] Focus visible para teclado
- [ ] Aria labels quando necessário
- [ ] Respeita prefer-reduced-motion

### Dark Mode
- [ ] Todas as cores têm equivalente dark:
- [ ] Contraste mantido em ambos os temas
- [ ] Sem cores hardcoded (usa variáveis)

---

## 🎯 Exemplos Práticos

### Landing Page Hero

```tsx
<section className="relative pt-32 pb-20 px-6 overflow-hidden">
  {/* Grid pattern de fundo */}
  <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:4rem_4rem]" />

  {/* Conteúdo */}
  <div className="max-w-7xl mx-auto relative">
    <h1 className="text-7xl sm:text-8xl font-extrabold tracking-tight leading-[0.9] mb-8">
      organize.
      <br />
      foque.
      <br />
      <span className="text-arc-muted">entregue.</span>
    </h1>

    <p className="text-xl text-arc-muted leading-relaxed mb-10">
      Plataforma minimalista para projetos e equipes.
    </p>

    <div className="flex gap-4">
      <button className="px-8 py-4 rounded-lg bg-arc text-arc-primary font-bold hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all">
        começar grátis
      </button>
      <button className="px-8 py-4 rounded-lg border-2 border-arc text-arc font-semibold hover:bg-arc-secondary transition-all">
        ver demo
      </button>
    </div>
  </div>
</section>
```

### Dashboard Card

```tsx
<div className="p-6 rounded-xl border-2 border-arc bg-arc-secondary hover:scale-[1.01] transition-all duration-300 group">
  {/* Header com ícone */}
  <div className="flex items-center gap-3 mb-4">
    <div className="w-10 h-10 rounded-lg border-2 border-arc flex items-center justify-center group-hover:scale-110 transition-transform">
      <Activity className="w-5 h-5 text-arc" />
    </div>
    <h3 className="text-lg font-bold text-arc">Atividade Semanal</h3>
  </div>

  {/* Conteúdo */}
  <p className="text-sm text-arc-muted mb-4">
    Você completou 24 tarefas esta semana
  </p>

  {/* Métrica */}
  <div className="flex items-baseline gap-2">
    <span className="text-3xl font-extrabold text-arc">+15%</span>
    <span className="text-sm text-arc-muted">vs semana passada</span>
  </div>
</div>
```

### Sidebar Item

```tsx
<button className={`
  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
  transition-colors duration-200
  ${isActive
    ? 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white font-semibold'
    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50'
  }
`}>
  <Icon className="w-5 h-5" />
  <span className="flex-1 truncate">Nome da Página</span>
  {badge && <span className="text-xs">{badge}</span>}
</button>
```

---

## 🚀 Performance

### Otimizações de Renderização

1. **Transições apenas em propriedades transform/opacity**
   ```css
   /* ✅ Bom - GPU accelerated */
   transition: transform 200ms, opacity 200ms;

   /* ❌ Evitar - força reflow */
   transition: all 200ms;
   ```

2. **Will-change para animações pesadas**
   ```tsx
   <div className="will-change-transform hover:scale-110">
   ```

3. **Lazy load de ícones**
   ```tsx
   import dynamic from 'next/dynamic';
   const Icon = dynamic(() => import('lucide-react').then(m => m.Icon));
   ```

### Scrollbar Customizada

```css
/* Scrollbar sutil - quase imperceptível */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}
```

---

## 📚 Recursos

### Ferramentas

- **Tailwind CSS**: https://tailwindcss.com
- **Lucide Icons**: https://lucide.dev
- **Inter Font**: https://fonts.google.com/specimen/Inter
- **Color Contrast Checker**: https://webaim.org/resources/contrastchecker/

### Referências Internas

- `/frontend/src/app/globals.css` - Variáveis CSS e estilos globais
- `/frontend/src/app/page.tsx` - Landing page (melhor exemplo)
- `/frontend/src/app/(workspace)/workspace/page.tsx` - Dashboard
- `/frontend/src/app/(workspace)/components/sidebar/` - Componentes de sidebar

---

**Última atualização:** 2025-11-22
**Versão:** 1.0.0

Para dúvidas ou sugestões sobre este guia, abra uma issue no repositório.
