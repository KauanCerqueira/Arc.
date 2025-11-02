// Lazy loading dos templates para melhor performance
// Usa dynamic imports para carregar componentes apenas quando necessário

import dynamic from 'next/dynamic';
import React from 'react';

// Loading component simples
const TemplateLoadingFallback = () => {
  return React.createElement(
    'div',
    { className: 'flex items-center justify-center p-8' },
    React.createElement('div', {
      className: 'w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin'
    })
  );
};

// Templates carregados dinamicamente
export const LazyBlankTemplate = dynamic(
  () => import('@/app/(workspace)/templates/blank'),
  {
    loading: TemplateLoadingFallback,
    ssr: false,
  }
);

export const LazyKanbanTemplate = dynamic(
  () => import('@/app/(workspace)/templates/kanban'),
  {
    loading: TemplateLoadingFallback,
    ssr: false,
  }
);

export const LazyFlowchartTemplate = dynamic(
  () => import('@/app/(workspace)/templates/flowchart'),
  {
    loading: TemplateLoadingFallback,
    ssr: false,
  }
);

export const LazyRoadmapTemplate = dynamic(
  () => import('@/app/(workspace)/templates/roadmap'),
  {
    loading: TemplateLoadingFallback,
    ssr: false,
  }
);

export const LazyCalendarTemplate = dynamic(
  () => import('@/app/(workspace)/templates/calendar'),
  {
    loading: TemplateLoadingFallback,
    ssr: false,
  }
);

export const LazyMindMapTemplate = dynamic(
  () => import('@/app/(workspace)/templates/mindmap'),
  {
    loading: TemplateLoadingFallback,
    ssr: false,
  }
);

export const LazySprintTemplate = dynamic(
  () => import('@/app/(workspace)/templates/sprint'),
  {
    loading: TemplateLoadingFallback,
    ssr: false,
  }
);

export const LazyWikiTemplate = dynamic(
  () => import('@/app/(workspace)/templates/wiki'),
  {
    loading: TemplateLoadingFallback,
    ssr: false,
  }
);

// Mapa de templates para facilitar o uso
export const LAZY_TEMPLATES = {
  blank: LazyBlankTemplate,
  kanban: LazyKanbanTemplate,
  flowchart: LazyFlowchartTemplate,
  roadmap: LazyRoadmapTemplate,
  calendar: LazyCalendarTemplate,
  mindmap: LazyMindMapTemplate,
  sprint: LazySprintTemplate,
  wiki: LazyWikiTemplate,
} as const;

export type TemplateType = keyof typeof LAZY_TEMPLATES;
