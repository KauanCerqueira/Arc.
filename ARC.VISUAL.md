# 🎨 GUIA DE ESTÉTICA VISUAL — ARC.

> “Minimalismo não é ausência.  
> É precisão.”  
>  
> O Arc. é uma plataforma feita para ser limpa, direta e impactante.  
> Cada detalhe visual deve refletir foco, clareza e força.

---

## 🖤 VISÃO GERAL

A estética do **Arc.** combina **minimalismo técnico** com **energia agressiva e moderna**.  
A base é **preto e branco chapado**, com **contrastes fortes** e **tipografia dominante**.  
O visual deve **comunicar potência e movimento**, mesmo quando está parado.

---

## ⚡ PRINCÍPIOS FUNDAMENTAIS

1. **Clareza absoluta** — nada deve distrair.  
2. **Força tipográfica** — o texto é o design.  
3. **Contraste extremo** — branco total e preto absoluto.  
4. **Movimento controlado** — transições rápidas, diretas e sem exageros.  
5. **Agressividade elegante** — impacto visual sem poluição.

---

## 🎨 PALETA DE CORES

### Base (Implementação Atual)
| Nome | Código | Token CSS | Uso |
|------|---------|-----------|-----|
| **Bege Arc** | `#f6f4f0` | `bg-primary` ou `arc-primary` | Fundo principal (modo claro) |
| **Branco Puro** | `#ffffff` | `bg-secondary` ou `arc-secondary` | Fundos de cards e modais |
| **Preto Arc** | `#222222` | `text-primary` ou `arc` | Texto principal |
| **Cinza Neutro** | `#666666` | `text-secondary` ou `arc-muted` | Texto secundário / labels |
| **Cinza Claro** | `#D9D9D9` | `border-arc` | Bordas sutis |

### Acentos (uso pontual)
| Nome | Código | Uso |
|------|---------|-----|
| **Vermelho Impacto** | `#EF4444` | Alertas, chamadas e CTA agressivos |
| **Violeta Elétrico** | `#6E62E5` | Destaques, ícones ativos (uso futuro) |
| **Azul Ativo** | `#3B82F6` | Links e interações secundárias |

### Sistema de Prioridades (Kanban)
| Nome | Código | Uso |
|------|---------|-----|
| **Urgente** | `#dc2626` (red-600) | Tarefas críticas |
| **Alta** | `#ea580c` (orange-600) | Tarefas importantes |
| **Média** | `#ca8a04` (yellow-600) | Tarefas normais |
| **Baixa** | `#16a34a` (green-600) | Tarefas de baixa prioridade |

> **Regra de ouro:**
> O Arc. é 90% bege/branco e preto, 10% energia de contraste.
>
> **Nota de implementação:**
> O contraste suavizado (#222222 vs #f6f4f0) oferece melhor legibilidade para uso prolongado, mantendo a identidade visual minimalista.

---

## 🔠 TIPOGRAFIA

| Papel | Fonte recomendada |
|-------|--------------------|
| **Logo e Títulos principais** | `Radnika Next Bold` *(oficial da marca)* |
| **Texto de apoio / UI** | `Manrope Regular` ou `Inter Regular` |
| **Destaques / Chamada curta** | `Radnika Next ExtraBold` |

**Estilo de uso:**
- Preferência por **minúsculas** (ex: `focus mode.`)  
- Ponto final é assinatura visual.  
- **Peso e ritmo visual** são o contraste, não cores.  
- Nunca use sombras, gradientes ou contornos.  
- Quando necessário, reduza o tracking (−1% a −3%) para dar densidade e agressividade ao texto.

---

## 🧱 LAYOUT E ESTRUTURA

### Grade
- Margens amplas e respiro generoso.  
- Distribuição assimétrica (evitar centralização constante).  
- Trabalhar com áreas negativas como parte do design.  
- Linhas finas podem guiar o olhar (1px no máximo).

### Hierarquia
- Título grande (impacto visual).  
- Subtítulo fino e recuado.  
- Espaço → ritmo visual → silêncio.  

---

## 🩶 COMPONENTES VISUAIS

### Botões
- Chapados, sem sombras pesadas (shadow-lg permitido para profundidade sutil).
- Transição suave na opacidade e escala (hover: opacity-90, scale-[1.01]).
- Bordas: 8px de raio (rounded-lg).
- Altura mínima: 48px para acessibilidade.

**Variantes:**
```
Botão Primário: bg-arc (#222222) + text-arc-primary (#f6f4f0)
Botão Secundário: border-2 border-arc + text-arc
Botão Destrutivo: bg-red-600 + text-white
```

### Inputs e Formulários
- Border: 2px solid #222222
- Background: #f6f4f0 (mesmo tom do fundo principal)
- Focus: ring-2 ring-arc (anel de foco sem mudar a borda)
- Placeholder: #666666 (arc-muted)
- Altura mínima: 48px
- Border radius: 8px (rounded-lg)

### Cards e Modais
- Background: #ffffff (branco puro para destacar do fundo bege)
- Border: 2px solid #222222
- Border radius: 12px (rounded-xl) ou 16px (rounded-2xl)
- Sombras sutis permitidas: shadow-lg, shadow-xl

### Badges e Tags
- Altura: 24-28px (text-xs ou text-sm)
- Border radius: 9999px (rounded-full)
- Padding: px-2.5 py-0.5
- Sem sombras
- Cores conforme contexto (prioridades, status, categorias)

### Avatares
- Formato: circular (rounded-full)
- Tamanhos: 32px (small), 40px (medium), 48px (large)
- Border: 2px solid quando sobreposto
- Fallback: iniciais em texto com background colorido

### Progress Indicators
- Circular: stroke-width 8px, tamanho 40-48px
- Linear: altura 4-8px, rounded-full
- Cores: verde (#16a34a) para completo, cinza (#d1d5db) para incompleto

---

## 🧩 ÍCONES E ILUSTRAÇÕES

- **Estilo line art**, peso uniforme (stroke-width: 2px).
- Biblioteca recomendada: **Lucide React** (consistência garantida).
- Cores: preto (#222222), branco (#ffffff) ou cores de acento conforme contexto.
- Ícones não devem competir com o texto — são complementares.
- Evitar qualquer tipo de 3D, gradiente ou sombra.
- Tamanhos padrão: 16px (small), 20px (medium), 24px (large).

---

## 🔲 USO DE IMAGENS

- Preferência por **planos chapados**.  
- Se necessário, use ruído ou textura suave (grão 2–3%).  
- Imagens sempre em **tons neutros** (sem saturação alta).  
- Quando houver cor, ela deve servir ao contraste (ex: violeta sobre branco).

---

## 🗣️ TOM DE VOZ VISUAL

O Arc. fala com **intensidade e foco**, como uma marca que acredita em ritmo e atitude.  
É o equilíbrio entre **precisão técnica e energia criativa**.

| Situação | Exemplo |
|-----------|----------|
| Motivacional | “Menos ruído. Mais clareza.” |
| Chamada de ação | “Construa. Foque. Evolua.” |
| Institucional | “Arc. — feito para quem cria.” |

**Regras:**
- Frases curtas, assertivas e com ponto final.  
- Sempre usar tipografia como elemento principal da mensagem.  
- Sem ícones decorativos, sem emojis.

---

## 🧠 MOOD VISUAL

**Inspirações:**
- Nike (impacto tipográfico e contraste)  
- Linear.app (design técnico e limpo)  
- Affinity (minimalismo estético)  
- Nothing Tech (design chapado e confiante)  

**Sensação geral:**
> “Potência silenciosa.”  
> O design não grita com cor, grita com confiança.

---

## ⚙️ ANIMAÇÕES E MOTION

### Timing e Curvas
- Duração curta: 150–300ms
- Ease: transition-all ou ease-in-out
- Sem bounce, sem overshoot — tudo direto
- Movimentos devem parecer *mecânicos, não artísticos*

### Transformações Permitidas
- **Scale**: hover:scale-[1.01], active:scale-[0.99]
- **Fade**: opacity-0 → opacity-100
- **Slide**: translateY(-10px) → translateY(0)
- **Spin**: Loading states (animate-spin)

### Animações Definidas (Tailwind)
```
fadeIn: opacity 0 → 1 (200ms)
scaleIn: scale 0.95 → 1 (200ms)
slideDown: translateY -10px → 0 (300ms)
slideUp: translateY 10px → 0 (300ms)
slideInFromRight: translateX 100% → 0 (300ms)
pulse: scale 1 → 1.05 → 1 (2s infinite)
```

### Princípios
- Loading states: spinner simples (border-2, border-t-transparent, animate-spin)
- Hover states: opacity-90 ou opacity-80
- Active states: scale-[0.99]
- Transições de página: fade apenas

---

## 🎯 APLICAÇÕES ESPECÍFICAS

### Kanban Board
O design do Kanban segue os princípios Arc. com adaptações funcionais:

**Estrutura Visual:**
- Background: #f6f4f0 (bege Arc)
- Colunas: border-l-4 com cores diferenciadas por status
- Cards: bg-white com border-2 border-gray-200, shadow-sm
- Drag handle: GripVertical icon (#d1d5db)

**Sistema de Prioridades:**
- Badges circulares (rounded-full) com cores semânticas
- Urgent: bg-red-100 text-red-700
- High: bg-orange-100 text-orange-700
- Medium: bg-yellow-100 text-yellow-700
- Low: bg-green-100 text-green-700

**Interações:**
- Hover nos cards: border-gray-300 (transição sutil)
- Modal de edição: max-w-2xl, bg-white, border-2
- Comentários: lista cronológica com timestamps
- Tags: toggleáveis com checkbox visual

**Elementos de Progresso:**
- Circular progressbar: stroke-width 8, cores verde/cinza
- Texto de progresso: "X/Y concluídas" com tipografia Manrope

---

## 💬 ASSINATURA VISUAL

O ponto "." é a assinatura da marca.
Ele representa **conclusão, foco e presença**.

> Sempre que possível, encerrar frases, logos e chamadas com o ponto "."
>
> Exemplo:
> **arc.**
> **focus mode.**
> **build in public.**

---

## ✅ CHECKLIST DE ESTILO (antes de publicar qualquer tela ou post)

- [ ] Fundo bege Arc (#f6f4f0) ou branco puro (#ffffff), sem gradiente
- [ ] Tipografia dominante e limpa (headings extrabold com tracking-tight)
- [ ] Texto principal em #222222, secundário em #666666
- [ ] Uso minimal de cores de acento (vermelho #EF4444 para CTAs)
- [ ] Contraste adequado e legibilidade perfeita
- [ ] Bordas consistentes (2px) e border-radius (8px, 12px, 16px)
- [ ] Altura mínima de 48px para elementos interativos
- [ ] Ícones Lucide React com stroke-width 2
- [ ] Animações rápidas (150-300ms) e diretas
- [ ] Nenhum elemento gratuito (sem decoração)
- [ ] Tudo transmite movimento e confiança

---

## 🏁 CONCLUSÃO

O Arc. deve parecer **simples de longe e poderoso de perto**.  
É uma marca que vive no contraste — entre **calma e energia**, **precisão e brutalidade**, **clareza e impacto**.

> “Foco é o novo luxo.”  
> **arc.**

