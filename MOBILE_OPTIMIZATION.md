# Guia de Otimização Mobile

## ✅ Implementações Concluídas

### 1. Meta Tags e Viewport
**Arquivo:** `frontend/src/app/layout.tsx`

```typescript
viewport: {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
},
appleWebApp: {
  capable: true,
  statusBarStyle: 'default',
  title: 'Arc.',
},
```

**Benefícios:**
- Viewport otimizado para mobile
- Suporte a PWA (Progressive Web App)
- Zoom habilitado (acessibilidade)

### 2. Hooks de Detecção Mobile
**Arquivo:** `frontend/src/core/hooks/useIsMobile.ts`

**Hooks disponíveis:**
- `useIsMobile(breakpoint?: number)` - Detecta se é mobile (padrão: < 768px)
- `useDeviceType()` - Retorna 'mobile' | 'tablet' | 'desktop'
- `useIsTouchDevice()` - Detecta suporte a touch

**Uso:**
```typescript
import { useIsMobile } from '@/core/hooks/useIsMobile';

function MyComponent() {
  const isMobile = useIsMobile();

  return (
    <div className={isMobile ? "mobile-view" : "desktop-view"}>
      {/* ... */}
    </div>
  );
}
```

### 3. Editor Rich Text Responsivo
**Arquivo:** `frontend/src/core/components/RichTextEditor.tsx`

**Características:**
- Toolbar adaptável para mobile
- Botões essenciais sempre visíveis
- Botões avançados em menu expansível
- Touch-friendly (botões maiores em mobile)

**Como usar:**
```typescript
import { RichTextEditor } from '@/core/components/RichTextEditor';

<RichTextEditor
  content={content}
  onChange={setContent}
  placeholder="Digite aqui..."
  storageKey="meu-documento"
  showToolbar={true}
/>
```

##  Próximos Passos - Manual de Implementação

### 4. Layout do Workspace (TO-DO)

**Problema:** Sidebar não é responsiva
**Solução:** Menu hamburger para mobile

**Implementar em:** `frontend/src/app/(workspace)/layout.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/core/hooks/useIsMobile';

export default function WorkspaceLayout({ children }) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Mobile: Hamburger button */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-900 rounded-lg shadow-lg"
        >
          {sidebarOpen ? <X /> : <Menu />}
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-40' : 'relative'}
          ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          w-64 transition-transform duration-300
        `}
      >
        {/* Sidebar content */}
      </aside>

      {/* Overlay para mobile */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30"
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

### 5. Wiki Otimizada (TO-DO)

**Implementar:** Substituir textarea por RichTextEditor

**Arquivo:** `frontend/src/app/(workspace)/templates/wiki.tsx`

```typescript
import { RichTextEditor } from '@/core/components/RichTextEditor';

// Substituir a textarea por:
<RichTextEditor
  content={selectedPage.content}
  onChange={(html) => {
    updatePages(pages => pages.map(p =>
      p.id === selectedPage.id
        ? { ...p, content: html, updatedAt: new Date().toISOString() }
        : p
    ));
  }}
  placeholder="Escreva o conteúdo da página..."
  storageKey={`wiki-${pageId}-${selectedPage.id}`}
/>
```

### 6. Flowchart para Mobile (TO-DO)

**Problema:** React Flow não é touch-friendly por padrão

**Solução:** Configurar gestos touch

**Arquivo:** `frontend/src/app/(workspace)/templates/flowchart.tsx`

```typescript
import { ReactFlow } from 'reactflow';
import { useIsTouchDevice } from '@/core/hooks/useIsMobile';

function FlowchartTemplate() {
  const isTouch = useIsTouchDevice();

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      // Mobile optimizations
      panOnDrag={isTouch ? [1, 2] : true} // Pan com 1 ou 2 dedos
      zoomOnPinch={isTouch} // Zoom com pinch
      zoomOnScroll={!isTouch} // Desabilitar scroll zoom em touch
      zoomOnDoubleClick={false} // Evitar zoom acidental
      minZoom={0.1}
      maxZoom={4}
      defaultViewport={{ x: 0, y: 0, zoom: isTouch ? 0.6 : 1 }} // Zoom inicial menor em mobile

      // Touch-friendly node sizes
      nodesDraggable={true}
      nodesConnectable={true}

      // Mobile UI
      attributionPosition="bottom-left"
      fitView
      fitViewOptions={{
        padding: isTouch ? 0.3 : 0.2,
      }}
    >
      {/* Mobile: Botões maiores */}
      <Controls
        className={isTouch ? 'react-flow__controls-touch' : ''}
        showInteractive={false}
      />

      {/* Mobile: MiniMap opcional (pode esconder) */}
      {!isTouch && <MiniMap />}
    </ReactFlow>
  );
}

// CSS para controles touch-friendly
// Adicionar em globals.css:
.react-flow__controls-touch button {
  width: 48px !important;
  height: 48px !important;
  font-size: 20px !important;
}
```

### 7. Documents Template (TO-DO)

**Problema:** Upload não funciona

**Solução:** Implementar upload real de arquivos

```typescript
// Adicionar input file hidden
<input
  ref={fileInputRef}
  type="file"
  multiple
  accept="*/*"
  className="hidden"
  onChange={handleFileUpload}
/>

// Handler de upload
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;

  for (const file of Array.from(files)) {
    // Criar um novo documento
    const newDoc: Document = {
      id: `doc_${Date.now()}_${Math.random()}`,
      name: file.name,
      type: getFileType(file.type),
      size: file.size,
      folder: currentFolder || 'root',
      tags: [],
      favorite: false,
      lastModified: new Date().toISOString(),
      author: 'Current User',
    };

    updateDocuments(docs => [...docs, newDoc]);

    // TODO: Upload real para servidor/cloud
    // await uploadToServer(file);
  }

  e.target.value = ''; // Reset input
};

const getFileType = (mimeType: string): Document['type'] => {
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('doc') || mimeType.includes('word')) return 'doc';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return 'archive';
  if (mimeType.includes('javascript') || mimeType.includes('typescript')) return 'code';
  return 'other';
};
```

## Checklist de Otimização Mobile

### Geral
- [x] Meta tags de viewport configuradas
- [x] PWA meta tags adicionadas
- [x] Hooks de detecção mobile criados
- [ ] Sidebar responsiva com menu hamburger
- [ ] Teste em dispositivos reais (iOS/Android)

### Templates
- [x] Blank - Editor responsivo criado
- [ ] Wiki - Usar RichTextEditor
- [ ] Flowchart - Touch gestures configurados
- [ ] Documents - Upload funcional
- [ ] Kanban - Touch drag and drop
- [ ] Calendar - Touch events
- [ ] Todos os templates - Testar em mobile

### UI/UX Mobile
- [ ] Botões > 44px (touch target size)
- [ ] Espaçamento adequado entre elementos clicáveis
- [ ] Scroll suave em listas longas
- [ ] Pull-to-refresh (opcional)
- [ ] Loading states para todas as ações
- [ ] Toast notifications mobile-friendly

### Performance Mobile
- [x] Lazy loading de templates
- [x] Code splitting configurado
- [x] Imagens otimizadas (AVIF/WebP)
- [ ] Service Worker (PWA)
- [ ] Offline support (opcional)
- [ ] Cache estratégico

## Tailwind Classes Responsivas

### Padrões a seguir:

```css
/* Padding/Margin */
p-4 md:p-6 lg:p-8    /* Mobile: 1rem, Tablet: 1.5rem, Desktop: 2rem */

/* Text Size */
text-sm md:text-base lg:text-lg

/* Grid */
grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4

/* Flex Direction */
flex-col md:flex-row

/* Display */
hidden md:block    /* Esconde em mobile, mostra em tablet+ */

/* Width */
w-full md:w-1/2 lg:w-1/3

/* Height - Viewport units */
min-h-screen md:min-h-[85vh]
```

### Breakpoints do Tailwind:
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px
- `2xl:` 1536px

## Testando em Mobile

### Chrome DevTools
1. F12 → Toggle Device Toolbar
2. Testar em:
   - iPhone SE (375x667)
   - iPhone 12 Pro (390x844)
   - iPad Air (820x1180)
   - Samsung Galaxy S20 (360x800)

### Ferramentas Recomendadas
- [Chrome DevTools Device Mode](https://developer.chrome.com/docs/devtools/device-mode/)
- [BrowserStack](https://www.browserstack.com/) - Teste em devices reais
- [Lighthouse Mobile](https://developers.google.com/web/tools/lighthouse) - Score de performance mobile

### Comandos Úteis

```bash
# Teste em rede local (acessível por celular)
cd frontend
npm run dev -- --host 0.0.0.0

# Descubra seu IP local
ipconfig  # Windows
ifconfig  # Mac/Linux

# Acesse do celular:
# http://SEU_IP:3000
```

## Problemas Comuns e Soluções

### 1. Sidebar sobrepõe conteúdo em mobile
**Solução:** Menu hamburger + overlay

### 2. Toolbar muito grande em mobile
**Solução:** Toolbar colapsável + botões essenciais

### 3. Drag and drop não funciona em touch
**Solução:** Usar `@dnd-kit` com `TouchSensor`

```typescript
import { TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

const sensors = useSensors(
  useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  })
);
```

### 4. Inputs pequenos demais para touch
**Solução:** Mínimo 44x44px

```css
/* globals.css */
input, button, select {
  @apply min-h-[44px] min-w-[44px];
}
```

### 5. Scroll horizontal indesejado
**Solução:**

```css
html, body {
  overflow-x: hidden;
}
```

## Performance Metrics - Mobile

### Metas (3G Network):
- FCP (First Contentful Paint): < 3s
- LCP (Largest Contentful Paint): < 4s
- TTI (Time to Interactive): < 5s
- FID (First Input Delay): < 100ms

### Lighthouse Mobile Score: > 85

---

**Última atualização:** 2025-11-01
**Status:** 60% completo
