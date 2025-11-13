/**
 * Schema TypeScript para Templates JSON Modulares
 *
 * Permite definir templates de forma declarativa, modular e versionada
 * sem necessidade de escrever código React diretamente
 */

export type TemplateVersion = `${number}.${number}.${number}`;

export type ComponentType =
  | 'Container'
  | 'Grid'
  | 'Flex'
  | 'Stack'
  | 'Card'
  | 'Button'
  | 'Input'
  | 'Select'
  | 'Textarea'
  | 'Table'
  | 'List'
  | 'Tabs'
  | 'Form'
  | 'Header'
  | 'Text'
  | 'Icon'
  | 'Image'
  | 'Divider'
  | 'Spacer'
  // Template-specific components
  | 'BudgetCalculator'
  | 'BudgetList'
  | 'BudgetForm'
  | 'KanbanBoard'
  | 'CalendarView'
  | 'ChartView'
  | 'TableView'
  | 'Custom';

export type DataBindingType = 'state' | 'computed' | 'service' | 'constant';

/**
 * Data binding - vincula dados dinâmicos ao template
 */
export interface DataBinding {
  type: DataBindingType;
  source: string; // Ex: 'budgets', 'selectedBudget', 'workspaceId'
  transform?: string; // Função de transformação (ex: 'map', 'filter', 'format')
  defaultValue?: any;
}

/**
 * Evento do componente
 */
export interface ComponentEvent {
  type: string; // Ex: 'click', 'change', 'submit'
  action: string; // Ex: 'createBudget', 'deleteBudget', 'updateField'
  params?: Record<string, any>;
}

/**
 * Propriedades do componente
 */
export interface ComponentProps {
  // Propriedades visuais
  className?: string;
  style?: Record<string, string | number>;

  // Data binding
  data?: DataBinding;
  value?: DataBinding | any;

  // Eventos
  events?: ComponentEvent[];

  // Props específicas do componente
  [key: string]: any;
}

/**
 * Definição de um componente no template
 */
export interface TemplateComponent {
  id: string;
  type: ComponentType;
  props?: ComponentProps;
  children?: TemplateComponent[];
  condition?: DataBinding; // Renderiza apenas se verdadeiro
  loop?: DataBinding; // Itera sobre array
}

/**
 * Estado do template (gerenciado por hooks/store)
 */
export interface TemplateState {
  key: string;
  initialValue: any;
  persist?: boolean; // Persiste no localStorage
}

/**
 * Serviço usado pelo template
 */
export interface TemplateService {
  name: string;
  path: string; // Ex: '@/core/services/budget.service'
  methods: string[]; // Métodos usados: ['getByPage', 'create', 'delete']
}

/**
 * Hook customizado usado pelo template
 */
export interface TemplateHook {
  name: string;
  path: string; // Ex: '@/core/hooks/use-budget'
  config?: Record<string, any>;
}

/**
 * Layout do template
 */
export interface TemplateLayout {
  type: 'default' | 'sidebar' | 'split' | 'fullscreen';
  sidebar?: TemplateComponent;
  header?: TemplateComponent;
  footer?: TemplateComponent;
  main: TemplateComponent;
}

/**
 * Metadados do template
 */
export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  category: string; // Ex: 'Finance', 'Project Management', 'Analytics'
  tags: string[];
  version: TemplateVersion;
  author: string;
  createdAt: string;
  updatedAt: string;
  deprecated?: boolean;
}

/**
 * Template JSON completo
 */
export interface Template {
  meta: TemplateMeta;
  layout: TemplateLayout;
  state?: TemplateState[];
  services?: TemplateService[];
  hooks?: TemplateHook[];
  dependencies?: string[]; // NPM packages necessários
  schema?: Record<string, any>; // JSON Schema para validação de dados
}

/**
 * Catálogo de templates (index)
 */
export interface TemplateCatalog {
  version: string;
  templates: {
    id: string;
    path: string; // Caminho do arquivo JSON
    meta: TemplateMeta;
  }[];
}

/**
 * Configuração de cache de templates
 */
export interface TemplateCacheConfig {
  ttl: number; // Time to live em segundos
  maxSize: number; // Máximo de templates em cache
  strategy: 'lru' | 'lfu'; // Least Recently Used ou Least Frequently Used
}

/**
 * Template renderizado (em runtime)
 */
export interface RenderedTemplate {
  template: Template;
  state: Map<string, any>;
  services: Map<string, any>;
  hooks: Map<string, any>;
  cachedAt: number;
}

/**
 * Type guards para validação
 */
export function isValidTemplate(obj: any): obj is Template {
  return (
    obj &&
    typeof obj === 'object' &&
    'meta' in obj &&
    'layout' in obj &&
    typeof obj.meta.id === 'string' &&
    typeof obj.meta.name === 'string'
  );
}

export function isValidTemplateCatalog(obj: any): obj is TemplateCatalog {
  return (
    obj &&
    typeof obj === 'object' &&
    'version' in obj &&
    'templates' in obj &&
    Array.isArray(obj.templates)
  );
}
