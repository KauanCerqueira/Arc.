import {
  GraduationCap,
  BookOpen,
  Calculator,
  Briefcase,
  Lightbulb,
  Code,
  DollarSign,
  Target,
  Calendar as CalendarIcon,
  Palette,
  FolderOpen,
  type LucideIcon,
} from "lucide-react"
import type { GroupPreset } from "@/core/types/workspace.types"

export interface GroupPresetWithIcon extends Omit<GroupPreset, 'icon'> {
  iconComponent: LucideIcon
  iconColor: string
}

export const GROUP_PRESETS_WITH_ICONS: GroupPresetWithIcon[] = [
  // ============================================
  // CATEGORIA: FINANÇAS
  // ============================================
  {
    id: 'personal-finance',
    name: 'Finanças Pessoais',
    description: 'Controle completo do seu dinheiro pessoal',
    iconComponent: DollarSign,
    iconColor: 'text-emerald-600',
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
    iconComponent: Calculator,
    iconColor: 'text-emerald-600',
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
    iconComponent: Briefcase,
    iconColor: 'text-blue-600',
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
    iconComponent: Lightbulb,
    iconColor: 'text-blue-600',
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
    iconComponent: Code,
    iconColor: 'text-purple-600',
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
    iconComponent: BookOpen,
    iconColor: 'text-green-600',
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
    iconComponent: GraduationCap,
    iconColor: 'text-green-600',
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
    iconComponent: Target,
    iconColor: 'text-orange-600',
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
    iconComponent: CalendarIcon,
    iconColor: 'text-orange-600',
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
    iconComponent: FolderOpen,
    iconColor: 'text-gray-600',
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
    iconComponent: Palette,
    iconColor: 'text-pink-600',
    color: 'pink',
    category: 'creative',
    pages: [
      { name: 'Calendário Editorial', template: 'calendar' },
      { name: 'Ideias', template: 'kanban' },
      { name: 'Scripts', template: 'notes' },
      { name: 'Métricas', template: 'table' },
    ]
  },
]
