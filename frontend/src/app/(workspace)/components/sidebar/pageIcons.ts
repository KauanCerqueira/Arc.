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

export interface PageIconConfig {
  icon: LucideIcon
  color: string
  bgColor: string
  bgColorDark: string
}

export const PAGE_ICON_MAP: Record<string, PageIconConfig> = {
  // Básico
  blank: {
    icon: FileText,
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-100",
    bgColorDark: "dark:bg-gray-800",
  },
  notes: {
    icon: StickyNote,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100",
    bgColorDark: "dark:bg-amber-900/30",
  },
  wiki: {
    icon: BookOpen,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100",
    bgColorDark: "dark:bg-blue-900/30",
  },
  mindmap: {
    icon: Brain,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100",
    bgColorDark: "dark:bg-purple-900/30",
  },
  documents: {
    icon: FolderOpen,
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100",
    bgColorDark: "dark:bg-slate-800",
  },

  // Projetos
  kanban: {
    icon: Trello,
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-100",
    bgColorDark: "dark:bg-violet-900/30",
  },
  tasks: {
    icon: CheckSquare,
    color: "text-sky-600 dark:text-sky-400",
    bgColor: "bg-sky-100",
    bgColorDark: "dark:bg-sky-900/30",
  },
  roadmap: {
    icon: Map,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100",
    bgColorDark: "dark:bg-emerald-900/30",
  },
  flowchart: {
    icon: GitBranch,
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100",
    bgColorDark: "dark:bg-slate-800",
  },
  timeline: {
    icon: Clock,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100",
    bgColorDark: "dark:bg-orange-900/30",
  },
  projects: {
    icon: Target,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-100",
    bgColorDark: "dark:bg-rose-900/30",
  },
  sprint: {
    icon: Zap,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100",
    bgColorDark: "dark:bg-indigo-900/30",
  },
  bugs: {
    icon: Bug,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100",
    bgColorDark: "dark:bg-red-900/30",
  },

  // Produtividade
  focus: {
    icon: Timer,
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-100",
    bgColorDark: "dark:bg-pink-900/30",
  },
  study: {
    icon: GraduationCap,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100",
    bgColorDark: "dark:bg-cyan-900/30",
  },

  // Dados
  table: {
    icon: Table,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100",
    bgColorDark: "dark:bg-green-900/30",
  },
  calendar: {
    icon: Calendar,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100",
    bgColorDark: "dark:bg-red-900/30",
  },
  dashboard: {
    icon: BarChart3,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100",
    bgColorDark: "dark:bg-cyan-900/30",
  },

  // Financeiro
  budget: {
    icon: DollarSign,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100",
    bgColorDark: "dark:bg-emerald-900/30",
  },
  "personal-budget": {
    icon: Wallet,
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-100",
    bgColorDark: "dark:bg-teal-900/30",
  },
  "business-budget": {
    icon: Briefcase,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100",
    bgColorDark: "dark:bg-blue-900/30",
  },

  // Saúde
  workout: {
    icon: Dumbbell,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100",
    bgColorDark: "dark:bg-orange-900/30",
  },
  nutrition: {
    icon: Apple,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100",
    bgColorDark: "dark:bg-green-900/30",
  },
}

// Fallback para templates sem ícone definido
export const DEFAULT_PAGE_ICON: PageIconConfig = {
  icon: FileText,
  color: "text-gray-600 dark:text-gray-400",
  bgColor: "bg-gray-100",
  bgColorDark: "dark:bg-gray-800",
}

export function getPageIcon(template: string): PageIconConfig {
  return PAGE_ICON_MAP[template] || DEFAULT_PAGE_ICON
}
