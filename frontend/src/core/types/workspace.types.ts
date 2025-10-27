/**
 * Tipos base do Arc.
 * Estrutura: Workspace → Groups → Pages
 */

// ============================================
// TIPOS DE TEMPLATES DISPONÍVEIS
// ============================================
export type TemplateType =
  | 'blank'         // Página em branco
  | 'tasks'         // Lista de tarefas
  | 'kanban'        // Quadro Kanban
  | 'table'         // Tabela editável
  | 'calendar'      // Calendário
  | 'projects'      // Gerenciador de projetos
  | 'bugs'          // Rastreador de bugs
  | 'study'         // Gerenciador de estudos
  | 'budget'        // Calculadora de orçamento
  | 'focus'         // Pomodoro
  | 'sprint'        // Planejamento de sprint
  | 'flowchart'     // Fluxograma
  | 'roadmap'       // Roadmap do projeto
  | 'documents'     // Gerenciador de documentos
  | 'dashboard'     // Dashboard personalizável
  | 'mindmap'       // Mapa mental visual
  | 'notes'         // Notas rápidas
  | 'timeline'      // Linha do tempo visual
  | 'wiki';         // Página tipo Wiki

// ============================================
// MAPEAMENTO DE ÍCONES POR TEMPLATE
// ============================================
export const TEMPLATE_ICONS: Record<TemplateType, string> = {
  blank: '📝',
  tasks: '✅',
  kanban: '📋',
  table: '📊',
  calendar: '📅',
  projects: '🎯',
  bugs: '🐛',
  study: '📚',
  budget: '💰',
  sprint: '🏃',
  focus: '🏃',
  flowchart: '🔀',
  roadmap: '🗺️',
  documents: '📁',
  dashboard: '📊',  // Novo
  mindmap: '🧠',    // Novo
  notes: '🗒️',      // Novo
  timeline: '⏳',   // Novo
  wiki: '📘',       // Novo
};


// ============================================
// PÁGINA (cada página tem um template específico)
// ============================================
export type Page = {
  id: string;
  name: string;
  template: TemplateType;
  icon?: string;              // Ícone personalizado (opcional)
  data: PageData;
  favorite: boolean;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PageData = Record<string, any>;

// ============================================
// GRUPO (contém várias páginas)
// ============================================
export type Group = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  pages: Page[];
  expanded: boolean;
  favorite: boolean;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// ============================================
// WORKSPACE (contém vários grupos)
// ============================================
export type Workspace = {
  id: string;
  name: string;
  ownerId: string;
  groups: Group[];
  settings: WorkspaceSettings;
  createdAt: Date;
  updatedAt: Date;
};

// ============================================
// CONFIGURAÇÕES DO WORKSPACE
// ============================================
export type WorkspaceSettings = {
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
  dateFormat: string;
};

// ============================================
// TEMPLATE PRESET (grupos pré-configurados)
// ============================================
export type GroupPreset = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'work' | 'study' | 'personal';
  pages: {
    name: string;
    template: TemplateType;
  }[];
};

// ============================================
// HELPERS PARA CRIAR NOVOS ITENS
// ============================================

/**
 * Cria uma nova página vazia
 */
export const createPage = (
  name: string, 
  template: TemplateType, 
  position: number
): Page => ({
  id: `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name,
  template,
  icon: TEMPLATE_ICONS[template], // Ícone automático baseado no template
  data: {},
  favorite: false,
  position,
  createdAt: new Date(),
  updatedAt: new Date(),
});

/**
 * Cria um novo grupo vazio
 */
export const createGroup = (name: string, pages: Page[] = []): Group => ({
  id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name,
  description: '',
  icon: '📁',
  color: 'gray',
  pages,
  expanded: true,
  favorite: false,
  archived: false,
  createdAt: new Date(),
  updatedAt: new Date(),
});

/**
 * Cria um grupo a partir de um preset
 */
export const createGroupFromPreset = (preset: GroupPreset): Group => {
  const pages = preset.pages.map((pageConfig, index) => 
    createPage(pageConfig.name, pageConfig.template, index)
  );

  return {
    id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: preset.name,
    description: preset.description,
    icon: preset.icon,
    color: preset.color,
    pages,
    expanded: true,
    favorite: false,
    archived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

/**
 * Cria um novo workspace vazio
 */
export const createWorkspace = (name: string, ownerId: string): Workspace => ({
  id: `workspace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name,
  ownerId,
  groups: [],
  settings: {
    theme: 'light',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'DD/MM/YYYY',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

// ============================================
// PRESETS DE GRUPOS PRÉ-DEFINIDOS
// ============================================

export const GROUP_PRESETS: GroupPreset[] = [
  {
    id: 'blank',
    name: 'Grupo Vazio',
    description: 'Comece do zero e adicione suas próprias páginas',
    icon: '📁',
    color: 'gray',
    category: 'personal',
    pages: []
  },
  {
    id: 'freelancer-project',
    name: 'Projeto Freelancer',
    description: 'Gerencie clientes, orçamentos e entregas',
    icon: '💼',
    color: 'blue',
    category: 'work',
    pages: [
      { name: 'Visão Geral', template: 'kanban' },
      { name: 'Orçamento', template: 'budget' },
      { name: 'Tarefas', template: 'tasks' },
      { name: 'Cronograma', template: 'calendar' },
      { name: 'Notas', template: 'blank' },
    ]
  },
  {
    id: 'dev-project',
    name: 'Projeto de Desenvolvimento',
    description: 'Organize sprints, bugs e documentação',
    icon: '🚀',
    color: 'purple',
    category: 'work',
    pages: [
      { name: 'Backlog', template: 'kanban' },
      { name: 'Sprint Atual', template: 'sprint' },
      { name: 'Bugs', template: 'bugs' },
      { name: 'Documentação', template: 'blank' },
      { name: 'Releases', template: 'table' },
    ]
  },
  {
    id: 'student-subject',
    name: 'Matéria Escolar',
    description: 'Organize conteúdo, exercícios e provas',
    icon: '📚',
    color: 'green',
    category: 'study',
    pages: [
      { name: 'Conteúdo', template: 'blank' },
      { name: 'Exercícios', template: 'tasks' },
      { name: 'Progresso', template: 'study' },
      { name: 'Cronograma', template: 'calendar' },
    ]
  },
  {
    id: 'college-subject',
    name: 'Disciplina Universitária',
    description: 'Gerencie matérias complexas da faculdade',
    icon: '🎓',
    color: 'indigo',
    category: 'study',
    pages: [
      { name: 'Resumos', template: 'blank' },
      { name: 'Trabalhos', template: 'projects' },
      { name: 'Exercícios', template: 'tasks' },
      { name: 'Estudo', template: 'study' },
      { name: 'Provas', template: 'calendar' },
    ]
  },
  {
    id: 'personal-goals',
    name: 'Metas Pessoais',
    description: 'Acompanhe objetivos e hábitos',
    icon: '🎯',
    color: 'orange',
    category: 'personal',
    pages: [
      { name: 'Objetivos', template: 'tasks' },
      { name: 'Hábitos', template: 'table' },
      { name: 'Calendário', template: 'calendar' },
      { name: 'Progresso', template: 'blank' },
    ]
  },
  {
    id: 'content-creator',
    name: 'Criador de Conteúdo',
    description: 'Planeje posts, vídeos e campanhas',
    icon: '📹',
    color: 'pink',
    category: 'work',
    pages: [
      { name: 'Calendário Editorial', template: 'calendar' },
      { name: 'Ideias', template: 'kanban' },
      { name: 'Scripts', template: 'blank' },
      { name: 'Métricas', template: 'table' },
    ]
  },
  {
    id: 'event-planning',
    name: 'Organização de Evento',
    description: 'Planeje festas, casamentos ou eventos',
    icon: '🎉',
    color: 'red',
    category: 'personal',
    pages: [
      { name: 'Checklist', template: 'tasks' },
      { name: 'Orçamento', template: 'budget' },
      { name: 'Convidados', template: 'table' },
      { name: 'Cronograma', template: 'calendar' },
    ]
  },
  {
    id: 'startup',
    name: 'Startup / Produto',
    description: 'Gerencie produto, desenvolvimento e lançamento',
    icon: '💡',
    color: 'yellow',
    category: 'work',
    pages: [
      { name: 'Roadmap', template: 'kanban' },
      { name: 'Sprints', template: 'sprint' },
      { name: 'Bugs', template: 'bugs' },
      { name: 'Métricas', template: 'table' },
      { name: 'Documentação', template: 'blank' },
    ]
  },
];