import {
  FileText,
  StickyNote,
  BookOpen,
  Brain,
  FolderOpen,
  Trello,
  CheckSquare,
  Map,
  GitBranch,
  Clock,
  Target,
  Zap,
  Bug,
  Timer,
  GraduationCap,
  Table,
  Calendar,
  BarChart3,
  DollarSign,
  Wallet,
  Briefcase,
  Dumbbell,
  Apple,
  type LucideIcon,
} from "lucide-react"

export interface PageTemplate {
  id: string
  name: string
  description: string
  iconComponent: LucideIcon
  color: string
  category: string
}

export const pageTemplates: PageTemplate[] = [
  // Básico
  {
    id: "blank",
    name: "Documento",
    description: "Página em branco para começar do zero",
    iconComponent: FileText,
    color: "from-gray-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 border-gray-200 dark:border-slate-700",
    category: "basico",
  },
  {
    id: "notes",
    name: "Notas",
    description: "Anotações rápidas e simples",
    iconComponent: StickyNote,
    color: "from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border-yellow-200 dark:border-yellow-800",
    category: "basico",
  },
  {
    id: "wiki",
    name: "Wiki",
    description: "Base de conhecimento organizada",
    iconComponent: BookOpen,
    color: "from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-blue-200 dark:border-blue-800",
    category: "basico",
  },
  {
    id: "mindmap",
    name: "Mapa Mental",
    description: "Organização visual de ideias",
    iconComponent: Brain,
    color: "from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-200 dark:border-purple-800",
    category: "basico",
  },
  {
    id: "documents",
    name: "Documentos",
    description: "Gerenciador de documentos",
    iconComponent: FolderOpen,
    color: "from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 border-slate-200 dark:border-slate-700",
    category: "basico",
  },

  // Projetos
  {
    id: "kanban",
    name: "Kanban",
    description: "Quadro visual com colunas de status",
    iconComponent: Trello,
    color: "from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 border-purple-200 dark:border-purple-800",
    category: "projetos",
  },
  {
    id: "tasks",
    name: "Tarefas",
    description: "Lista simples de tarefas",
    iconComponent: CheckSquare,
    color: "from-blue-50 to-sky-50 dark:from-blue-900/30 dark:to-sky-900/30 border-blue-200 dark:border-blue-800",
    category: "projetos",
  },
  {
    id: "roadmap",
    name: "Roadmap",
    description: "Timeline de planejamento visual",
    iconComponent: Map,
    color: "from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border-emerald-200 dark:border-emerald-800",
    category: "projetos",
  },
  {
    id: "flowchart",
    name: "Fluxograma",
    description: "Diagramas e fluxos de processo",
    iconComponent: GitBranch,
    color: "from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 border-slate-200 dark:border-slate-700",
    category: "projetos",
  },
  {
    id: "timeline",
    name: "Timeline",
    description: "Linha do tempo visual de eventos",
    iconComponent: Clock,
    color: "from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border-amber-200 dark:border-amber-800",
    category: "projetos",
  },
  {
    id: "projects",
    name: "Projetos",
    description: "Gerenciador completo de projetos",
    iconComponent: Target,
    color: "from-rose-50 to-red-50 dark:from-rose-900/30 dark:to-red-900/30 border-rose-200 dark:border-rose-800",
    category: "projetos",
  },
  {
    id: "sprint",
    name: "Sprint",
    description: "Planejamento ágil de sprints",
    iconComponent: Zap,
    color: "from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 border-indigo-200 dark:border-indigo-800",
    category: "projetos",
  },
  {
    id: "bugs",
    name: "Bugs",
    description: "Rastreador de bugs e issues",
    iconComponent: Bug,
    color: "from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 border-red-200 dark:border-red-800",
    category: "projetos",
  },

  // Produtividade
  {
    id: "focus",
    name: "Foco",
    description: "Timer Pomodoro para produtividade",
    iconComponent: Timer,
    color: "from-pink-50 to-rose-50 dark:from-pink-900/30 dark:to-rose-900/30 border-pink-200 dark:border-pink-800",
    category: "produtividade",
  },
  {
    id: "study",
    name: "Estudos",
    description: "Gerenciador de estudos e aprendizado",
    iconComponent: GraduationCap,
    color: "from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 border-cyan-200 dark:border-cyan-800",
    category: "produtividade",
  },

  // Dados e Análise
  {
    id: "table",
    name: "Tabela",
    description: "Planilha com linhas e colunas",
    iconComponent: Table,
    color: "from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200 dark:border-green-800",
    category: "dados",
  },
  {
    id: "calendar",
    name: "Calendário",
    description: "Agenda de eventos e compromissos",
    iconComponent: Calendar,
    color: "from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 border-red-200 dark:border-red-800",
    category: "dados",
  },
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Painel com métricas e gráficos",
    iconComponent: BarChart3,
    color: "from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 border-cyan-200 dark:border-cyan-800",
    category: "dados",
  },

  // Financeiro
  {
    id: "budget",
    name: "Orçamento",
    description: "Calculadora de orçamento geral",
    iconComponent: DollarSign,
    color: "from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 border-emerald-200 dark:border-emerald-800",
    category: "financeiro",
  },
  {
    id: "personal-budget",
    name: "Orçamento Pessoal",
    description: "Controle financeiro pessoal",
    iconComponent: Wallet,
    color: "from-green-50 to-teal-50 dark:from-green-900/30 dark:to-teal-900/30 border-green-200 dark:border-green-800",
    category: "financeiro",
  },
  {
    id: "business-budget",
    name: "Orçamento Empresarial",
    description: "Gestão financeira empresarial",
    iconComponent: Briefcase,
    color: "from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-800",
    category: "financeiro",
  },

  // Saúde e Bem-estar
  {
    id: "workout",
    name: "Treinos",
    description: "Gerenciador completo de treinos e exercícios",
    iconComponent: Dumbbell,
    color: "from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 border-orange-200 dark:border-orange-800",
    category: "saude",
  },
  {
    id: "nutrition",
    name: "Nutrição",
    description: "Planejamento de refeições e controle de macros",
    iconComponent: Apple,
    color: "from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200 dark:border-green-800",
    category: "saude",
  },
]
