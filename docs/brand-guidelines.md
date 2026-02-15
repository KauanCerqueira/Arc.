# arc. — brand guidelines.

> documento de identidade visual e diretrizes de marca.
> tudo em minúsculo. tudo com ponto final. sem exceção.

---

## 1. nome e logotipo.

- o nome da marca é **arc.** — sempre em minúsculo, sempre com ponto final.
- o ponto final faz parte do nome e nunca deve ser omitido.
- o logotipo é um svg localizado em `/public/icon/arclogo.svg`.
- ao lado do ícone, o texto "arc." aparece em `font-bold` (700) ou `font-extrabold` (800).

```
✅ arc.
✅ Arc. (apenas em contextos legais/metadata: "Arc." no title tag)
❌ Arc
❌ ARC
❌ arc
❌ ARC.
```

---

## 2. tipografia.

### fonte principal.
- **Inter** (Google Fonts) — usada em todo o projeto.
- import: `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap`
- fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

### pesos utilizados.
| peso | uso |
|------|-----|
| 300 (light) | raramente usado |
| 400 (regular) | texto corrido, descrições |
| 500 (medium) | labels, texto secundário com destaque |
| 600 (semibold) | labels de formulário, stats labels |
| 700 (bold) | títulos de cards, nomes, botões |
| 800 (extrabold) | headlines principais, CTAs, métricas grandes |
| 900 (black) | não utilizado atualmente |

### escala de tamanhos (headlines).
| breakpoint | tamanho |
|------------|---------|
| mobile | `text-4xl` a `text-5xl` (2.25rem–3rem) |
| tablet (sm) | `text-5xl` a `text-6xl` (3rem–3.75rem) |
| desktop (md) | `text-6xl` a `text-7xl` (3.75rem–4.5rem) |
| large (lg) | `text-7xl` a `text-8xl` (4.5rem–6rem) |

---

## 3. regra de caixa — tudo em minúsculo.

essa é a regra mais importante da identidade visual do arc.

- **todos os textos de interface** devem ser escritos em minúsculo.
- headlines, títulos de seção, botões, labels, badges, CTAs — **tudo minúsculo**.
- a única exceção são **nomes próprios de terceiros** (ex: "Notion", "Asana", "GitHub", "Discord") e **siglas técnicas** (ex: "JWT", "SSO", "2FA", "GDPR", "REST API").

```
✅ "seu workspace de projetos."
✅ "começar grátis agora"
✅ "comece em 3 passos."
✅ "sem features inúteis."
✅ "bem-vindo de volta."

❌ "Seu Workspace de Projetos"
❌ "COMEÇAR GRÁTIS AGORA"
❌ "Comece em 3 Passos"
```

> **exceção consciente:** badges de urgência/marketing podem usar maiúsculas para criar contraste visual (ex: "PRIMEIROS 1.000 NUNCA PAGAM", "CONCORRENTE", "GRÁTIS"). essa quebra de padrão é intencional e deve ser usada com moderação.

---

## 4. regra do ponto final.

toda frase completa **deve** terminar com ponto final. é a marca registrada do arc.

- headlines terminam com ponto final.
- títulos de features terminam com ponto final.
- descrições curtas terminam com ponto final.
- o próprio nome "arc." termina com ponto.

```
✅ "workspaces colaborativos."
✅ "controle total."
✅ "velocidade extrema."
✅ "zero frescura."
✅ "presets prontos."
✅ "feito para quem faz acontecer."

❌ "Workspaces Colaborativos"
❌ "controle total"
❌ "velocidade extrema!"
```

---

## 5. paleta de cores.

### brand tokens.
| token | hex | uso |
|-------|-----|-----|
| `--arc-black` | `#0E0E0E` | texto principal (light) / fundo principal (dark) |
| `--arc-white` | `#F6F5F2` | fundo principal (light) / texto principal (dark) |
| `--arc-gray` | `#D9D9D9` | texto secundário (dark mode) |
| `--arc-violet` | `#6E62E5` | cor primária/accent da marca |
| `--arc-red` | `#EB5757` | alertas, erros |
| `--arc-blue` | `#4D7DFF` | links, informacional |

### paleta monocromática (light mode).
| papel | hex | descrição |
|-------|-----|-----------|
| fundo principal | `#F6F5F2` | bege claro, off-white quente |
| fundo secundário | `#FFFFFF` | branco puro para cards/sidebar |
| fundo terciário | `#EAE7E0` | bege mais escuro para contraste |
| texto principal | `#0E0E0E` | quase preto, mas suave |
| texto secundário | `#4A4A4A` | cinza médio |
| borda | `#E0DDD8` | borda sutil, tom de areia |

### paleta monocromática (dark mode).
| papel | hex | descrição |
|-------|-----|-----------|
| fundo principal | `#0E0E0E` | preto suave, não puro |
| fundo secundário | `#121212` | quase preto para cards/sidebar |
| fundo terciário | `#161616` | leve elevação |
| texto principal | `#F6F5F2` | off-white quente |
| texto secundário | `#D9D9D9` | cinza claro |
| borda | `#1F1F1F` | borda sutil escura |

### cores funcionais (usadas pontualmente na LP).
| cor | hex | uso |
|-----|-----|-----|
| verde sucesso | `#10B981` | badges positivos, "grátis", checkmarks |
| vermelho destaque | `#EF4444` | urgência, CTAs de conversão, comparações |
| vermelho escuro | `#DC2626` | gradients com vermelho |
| violeta brand | `#6E62E5` | seções de API/tech, accent de marca |

> **importante:** as cores funcionais (verde, vermelho) são usadas **apenas** na landing page para fins de marketing/conversão. dentro do app (workspace, sidebar, modais), a paleta permanece **estritamente monocromática** com o violet como accent sutil.

---

## 6. escala de cinzas (tailwind custom).
```
gray-50:  #f6f4f0   (≈ bg principal light)
gray-100: #eae7e0
gray-200: #e0ddd8   (≈ borda)
gray-300: #c8c5c0
gray-400: #9d9a95
gray-500: #7a7772
gray-600: #5e5b56
gray-700: #4a4744
gray-800: #333130
gray-900: #222222   (≈ texto principal)
gray-950: #1a1918
```

> nota: a escala de cinzas tem um subtom **quente/bege**, nunca cinza frio ou azulado.

---

## 7. sombras.

| nível | valor | uso |
|-------|-------|-----|
| soft | `0 2px 8px rgba(34,34,34, 0.04)` | hover sutil |
| medium | `0 4px 16px rgba(34,34,34, 0.08)` | cards elevados |
| strong | `0 8px 24px rgba(34,34,34, 0.12)` | modais, dropdowns |

em dark mode, as sombras usam `rgba(0,0,0, 0.3–0.5)`.

---

## 8. border radius.
| token | valor |
|-------|-------|
| `rounded-lg` | 0.5rem (8px) — botões, inputs |
| `rounded-xl` | 0.75rem (12px) — cards médios |
| `rounded-2xl` | 1rem (16px) — cards grandes, seções |
| `rounded-full` | 9999px — badges, avatares, pills |

---

## 9. componentes e padrões de UI.

### botão primário (CTA).
```
bg-arc text-arc-primary font-bold rounded-lg
hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]
shadow-2xl shadow-arc/30
transição suave em all
```

### botão secundário (outline).
```
border-2 border-arc text-arc font-bold rounded-lg
hover:bg-arc-secondary
hover:scale-[1.02] active:scale-[0.98]
```

### cards.
```
p-6 sm:p-8 rounded-2xl border-2 border-arc
bg-arc-secondary (ou bg-arc-primary dependendo do contexto)
hover:bg-arc-primary (ou hover:bg-arc-secondary)
hover:scale-[1.01] ou hover:scale-[1.02]
transition-all duration-300
```

### badges / pills.
```
px-3 py-1.5 ou px-4 py-2
rounded-full
border border-arc
text-xs sm:text-sm font-medium
```

### inputs.
```
px-4 py-3.5
border-2 border-arc rounded-xl
bg-arc-primary text-arc
placeholder:text-arc-muted
focus:ring-2 focus:ring-arc
min-h-[52px]
```

---

## 10. motion e animações.

| animação | config |
|----------|--------|
| fade-in | `opacity 0→1 + translateY 10px→0` em 0.3s ease-out |
| hover scale (cards) | `scale(1.01)` ou `scale(1.02)` |
| active press | `scale(0.98)` |
| icon hover | `scale(1.1)` em transition-transform |
| slide-down | altura 0→auto em 0.2s ease-out (accordions) |
| pulse | opacity oscilando entre 1 e 0.5 |

> respeitar `prefers-reduced-motion: reduce` — todas as animações são desativadas.

---

## 11. nav e footer.

### navbar.
- fixed no topo, backdrop-blur-md, borda inferior sutil.
- logo "arc." à esquerda, links de navegação + CTA à direita.
- links de nav: `text-arc-muted hover:text-arc`, sem underline.
- CTA: botão primário sólido.

### footer.
- minimalista, borda superior.
- logo à esquerda, links de navegação no centro.
- copyright: `© 2025 arc. feito para quem faz acontecer.`

---

## 12. dark mode.

- toggle via classe `.dark` no html.
- as cores se invertem: fundo claro → escuro, texto escuro → claro.
- o violet (`#6E62E5`) permanece o mesmo em ambos os modos.
- transição suave de 0.2s em background-color e color.

---

## 13. voz e tom da marca.

| aspecto | diretriz |
|---------|----------|
| tom | direto, sem enrolação, confiante mas acessível |
| linguagem | português brasileiro informal, gírias de tech |
| frases | curtas, assertivas, terminadas com ponto final |
| postura | anti-corporate, pró-comunidade, transparente |
| comparações | direta contra concorrentes (Notion, Asana) |
| emojis | usados com moderação, nunca em excesso |

exemplos de voz:
```
✅ "menos blá-blá, mais resultado."
✅ "chega de template pago."
✅ "feito para quem faz acontecer."
✅ "sem ruído. só resultado."

❌ "Oferecemos uma plataforma de produtividade robusta..."
❌ "Nossa solução enterprise-grade..."
```

---

## 14. classes utilitárias customizadas.

| classe | efeito |
|--------|--------|
| `.bg-arc-primary` | background do token `--bg-primary` |
| `.bg-arc-secondary` | background do token `--bg-secondary` |
| `.text-arc` | cor de texto `--color-text` |
| `.text-arc-muted` | cor de texto `--color-text-light` |
| `.border-arc` | cor de borda `--color-border` |
| `.accent-arc` | cor accent `--color-primary` |

---

## 15. scrollbar.

- largura: 6px.
- thumb: cinza translúcido (`rgba(156, 163, 175, 0.3)`).
- track: transparente.
- quase invisível, mas funcional.

---

## 16. responsividade.

| breakpoint | largura |
|------------|---------|
| default | mobile-first |
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |

- touch targets mínimos de 44×44px.
- safe-area para notch (iOS).
- `-webkit-tap-highlight-color: transparent`.

---

> **resumo:** arc. é minimalista, monocromático, sempre em minúsculo e com ponto final. a identidade visual transmite confiança sem arrogância, modernidade sem frivolidade.
