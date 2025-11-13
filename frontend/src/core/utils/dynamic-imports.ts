import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

/**
 * Helper para criar dynamic imports com loading otimizado
 * Reduz o bundle inicial carregando componentes pesados sob demanda
 */

// Loading component genérico
const DefaultLoading = () => (
  <div className="flex items-center justify-center p-8">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

/**
 * Dynamic import otimizado para componentes pesados
 * @param importFn - Função de import do componente
 * @param loadingComponent - Componente de loading customizado (opcional)
 */
export function dynamicImport<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  loadingComponent?: ComponentType
) {
  return dynamic(importFn, {
    loading: loadingComponent || DefaultLoading,
    ssr: false, // Desabilita SSR para componentes pesados
  });
}

/**
 * Dynamic imports pré-configurados para componentes pesados comuns
 */

// Rich Text Editors (TipTap, TinyMCE)
export const DynamicTipTapEditor = dynamicImport(
  () => import('@/components/editors/tiptap-editor')
);

export const DynamicTinyMCEEditor = dynamicImport(
  () => import('@/components/editors/tinymce-editor')
);

// Charts e Gráficos (Recharts)
export const DynamicLineChart = dynamicImport(
  () => import('recharts').then((mod) => ({ default: mod.LineChart as any }))
);

export const DynamicBarChart = dynamicImport(
  () => import('recharts').then((mod) => ({ default: mod.BarChart as any }))
);

export const DynamicPieChart = dynamicImport(
  () => import('recharts').then((mod) => ({ default: mod.PieChart as any }))
);

// Drag and Drop (DnD Kit) - Kanban, etc
export const DynamicKanbanBoard = dynamicImport(
  () => import('@/components/kanban/kanban-board')
);

export const DynamicSortableList = dynamicImport(
  () => import('@/components/dnd/sortable-list')
);

// Flow/Diagram editors (ReactFlow)
export const DynamicFlowEditor = dynamicImport(
  () => import('@/components/flow/flow-editor')
);

export const DynamicMindMap = dynamicImport(
  () => import('@/components/mindmap/mindmap')
);

// Calendar e Date Pickers pesados
export const DynamicFullCalendar = dynamicImport(
  () => import('@/components/calendar/full-calendar')
);

/**
 * Helper para prefetch de componentes dinâmicos
 * Útil para carregar componentes antes do usuário precisar (ex: ao hover)
 */
export function prefetchComponent(importFn: () => Promise<any>) {
  return importFn();
}

/**
 * Hook para prefetch em hover
 */
export function usePrefetchOnHover<T>(importFn: () => Promise<T>) {
  const handleMouseEnter = () => {
    prefetchComponent(importFn);
  };

  return { onMouseEnter: handleMouseEnter };
}
