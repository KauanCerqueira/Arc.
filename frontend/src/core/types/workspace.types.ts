/**
 * Tipos base do Arc.
 * Estrutura: Workspace → Groups → Pages
 */

// ============================================
// TIPOS DE TEMPLATES DISPONÍVEIS
// ============================================
export type TemplateType =
  | 'blank'                // Página em branco
  | 'tasks'                // Lista de tarefas
  | 'kanban'               // Quadro Kanban
  | 'table'                // Tabela editável
  | 'calendar'             // Calendário
  | 'projects'             // Gerenciador de projetos
  | 'bugs'                 // Rastreador de bugs
  | 'study'                // Gerenciador de estudos
  | 'budget'               // Calculadora de orçamento
  | 'personal-budget'      // Orçamento Financeiro Pessoal
  | 'business-budget'      // Orçamento Empresarial
  | 'focus'                // Pomodoro
  | 'sprint'               // Planejamento de sprint
  | 'flowchart'            // Fluxograma
  | 'roadmap'              // Roadmap do projeto
  | 'documents'            // Gerenciador de documentos
  | 'dashboard'            // Dashboard personalizável
  | 'mindmap'              // Mapa mental visual
  | 'notes'                // Notas rápidas
  | 'timeline'             // Linha do tempo visual
  | 'wiki';                // Página tipo Wiki

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
  'personal-budget': '💵',
  'business-budget': '💼',
  sprint: '🏃',
  focus: '⏱️',
  flowchart: '🔀',
  roadmap: '🗺️',
  documents: '📁',
  dashboard: '📈',
  mindmap: '🧠',
  notes: '🗒️',
  timeline: '⏳',
  wiki: '📘',
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
// ============================================
// CATEGORIAS DE TEMPLATES
// ============================================
export type PresetCategory =
  | 'business'      // Negócios e Empresas
  | 'personal'      // Pessoal e Vida
  | 'education'     // Educação e Estudos
  | 'development'   // Desenvolvimento e Tecnologia
  | 'finance'       // Finanças e Orçamento
  | 'creative';     // Criativo e Conteúdo

export const CATEGORY_INFO: Record<PresetCategory, { name: string; description: string; icon: string; color: string }> = {
  business: {
    name: 'Negócios',
    description: 'Templates para empresas e profissionais',
    icon: '💼',
    color: 'blue'
  },
  personal: {
    name: 'Pessoal',
    description: 'Organize sua vida pessoal e objetivos',
    icon: '🎯',
    color: 'orange'
  },
  education: {
    name: 'Educação',
    description: 'Para estudantes e professores',
    icon: '📚',
    color: 'green'
  },
  development: {
    name: 'Desenvolvimento',
    description: 'Projetos de software e tecnologia',
    icon: '💻',
    color: 'purple'
  },
  finance: {
    name: 'Finanças',
    description: 'Controle financeiro pessoal e empresarial',
    icon: '💰',
    color: 'emerald'
  },
  creative: {
    name: 'Criativo',
    description: 'Criação de conteúdo e projetos criativos',
    icon: '🎨',
    color: 'pink'
  }
};

export type GroupPreset = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: PresetCategory;
  pages: {
    name: string;
    template: TemplateType;
  }[];
};

export type WorkspaceTemplateComponentProps = {
  groupId: string;
  pageId: string;
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
  // ============================================
  // CATEGORIA: FINANÇAS
  // ============================================
  {
    id: 'personal-finance',
    name: 'Finanças Pessoais',
    description: 'Controle completo do seu dinheiro pessoal',
    icon: '💵',
    color: 'emerald',
    category: 'finance',
    pages: [
      { name: 'Orçamento Mensal', template: 'personal-budget' },
      { name: 'Despesas', template: 'table' },
      { name: 'Investimentos', template: 'table' },
      { name: 'Metas Financeiras', template: 'tasks' },
      { name: 'Notas', template: 'blank' },
    ]
  },
  {
    id: 'business-finance',
    name: 'Finanças Empresariais',
    description: 'Gestão financeira completa para sua empresa',
    icon: '💼',
    color: 'emerald',
    category: 'finance',
    pages: [
      { name: 'Orçamento Anual', template: 'business-budget' },
      { name: 'Fluxo de Caixa', template: 'table' },
      { name: 'Despesas Operacionais', template: 'table' },
      { name: 'Receitas', template: 'table' },
      { name: 'Relatórios', template: 'dashboard' },
    ]
  },

  // ============================================
  // CATEGORIA: NEGÓCIOS
  // ============================================
  {
    id: 'freelancer-project',
    name: 'Projeto Freelancer',
    description: 'Gerencie clientes, orçamentos e entregas',
    icon: '💼',
    color: 'blue',
    category: 'business',
    pages: [
      { name: 'Visão Geral', template: 'kanban' },
      { name: 'Orçamento', template: 'personal-budget' },
      { name: 'Tarefas', template: 'tasks' },
      { name: 'Cronograma', template: 'calendar' },
      { name: 'Notas', template: 'blank' },
    ]
  },
  {
    id: 'startup',
    name: 'Startup / Produto',
    description: 'Gerencie produto, desenvolvimento e lançamento',
    icon: '💡',
    color: 'blue',
    category: 'business',
    pages: [
      { name: 'Roadmap', template: 'kanban' },
      { name: 'Sprints', template: 'sprint' },
      { name: 'Bugs', template: 'bugs' },
      { name: 'Métricas', template: 'table' },
      { name: 'Documentação', template: 'blank' },
    ]
  },

  // ============================================
  // CATEGORIA: DESENVOLVIMENTO
  // ============================================
  {
    id: 'dev-project',
    name: 'Projeto de Software',
    description: 'Organize sprints, bugs e documentação',
    icon: '💻',
    color: 'purple',
    category: 'development',
    pages: [
      { name: 'Backlog', template: 'kanban' },
      { name: 'Sprint Atual', template: 'sprint' },
      { name: 'Bugs', template: 'bugs' },
      { name: 'Documentação', template: 'wiki' },
      { name: 'Releases', template: 'table' },
    ]
  },

  // ============================================
  // CATEGORIA: EDUCAÇÃO
  // ============================================
  {
    id: 'student-subject',
    name: 'Matéria Escolar',
    description: 'Organize conteúdo, exercícios e provas',
    icon: '📚',
    color: 'green',
    category: 'education',
    pages: [
      { name: 'Conteúdo', template: 'notes' },
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
    color: 'green',
    category: 'education',
    pages: [
      { name: 'Resumos', template: 'notes' },
      { name: 'Trabalhos', template: 'projects' },
      { name: 'Exercícios', template: 'tasks' },
      { name: 'Estudo', template: 'study' },
      { name: 'Provas', template: 'calendar' },
    ]
  },

  // ============================================
  // CATEGORIA: PESSOAL
  // ============================================
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
      { name: 'Progresso', template: 'dashboard' },
    ]
  },
  {
    id: 'event-planning',
    name: 'Organização de Evento',
    description: 'Planeje festas, casamentos ou eventos',
    icon: '🎉',
    color: 'orange',
    category: 'personal',
    pages: [
      { name: 'Checklist', template: 'tasks' },
      { name: 'Orçamento', template: 'personal-budget' },
      { name: 'Convidados', template: 'table' },
      { name: 'Cronograma', template: 'calendar' },
    ]
  },
  {
    id: 'blank',
    name: 'Grupo Vazio',
    description: 'Comece do zero e adicione suas próprias páginas',
    icon: '📁',
    color: 'gray',
    category: 'personal',
    pages: []
  },

  // ============================================
  // CATEGORIA: CRIATIVO
  // ============================================
  {
    id: 'content-creator',
    name: 'Criador de Conteúdo',
    description: 'Planeje posts, vídeos e campanhas',
    icon: '🎨',
    color: 'pink',
    category: 'creative',
    pages: [
      { name: 'Calendário Editorial', template: 'calendar' },
      { name: 'Ideias', template: 'kanban' },
      { name: 'Scripts', template: 'notes' },
      { name: 'Métricas', template: 'table' },
    ]
  },
];
