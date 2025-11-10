"use client"

import { useEffect, useState } from "react"
import { usePageTemplateData } from "@/core/hooks/usePageTemplateData"
import { WorkspaceTemplateComponentProps } from "@/core/types/workspace.types"
import {
  Plus,
  Search,
  Star,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Briefcase,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreHorizontal,
  FolderKanban,
  Grid3x3,
  List,
} from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/Button"
import { Input } from "@/shared/components/ui/Input"

type ProjectStatus = "planning" | "active" | "paused" | "review" | "completed" | "archived"
type ProjectPriority = "low" | "medium" | "high" | "critical"

type Project = {
  id: string
  name: string
  description: string
  status: ProjectStatus
  priority: ProjectPriority
  progress: number
  team: string[]
  deadline: string
  startDate: string
  color: string
  tasksTotal: number
  tasksCompleted: number
  budget?: number
  spent?: number
  favorite: boolean
  client?: string
}

const PROJECT_COLORS = [
  "from-blue-500 to-blue-600",
  "from-purple-500 to-purple-600",
  "from-green-500 to-green-600",
  "from-orange-500 to-orange-600",
  "from-pink-500 to-pink-600",
  "from-red-500 to-red-600",
  "from-indigo-500 to-indigo-600",
  "from-cyan-500 to-cyan-600",
]

const STATUS_CONFIG = {
  planning: { label: "Planejamento", color: "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300" },
  active: { label: "Em Andamento", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
  paused: { label: "Pausado", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300" },
  review: { label: "Em Revisão", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" },
  completed: { label: "Concluído", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" },
  archived: { label: "Arquivado", color: "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300" },
}

const PRIORITY_CONFIG = {
  low: { label: "Baixa", color: "text-gray-600" },
  medium: { label: "Média", color: "text-blue-600" },
  high: { label: "Alta", color: "text-orange-600" },
  critical: { label: "Crítica", color: "text-red-600" },
}

const DEFAULT_DATA: { projects: Project[] } = {
  projects: [
    {
      id: "1",
      name: "Website Redesign",
      description: "Redesign completo do site institucional",
      status: "active" as ProjectStatus,
      priority: "high" as ProjectPriority,
      progress: 65,
      team: ["João Silva", "Maria Santos", "Pedro Costa"],
      deadline: "2025-02-15",
      startDate: "2025-01-05",
      color: "from-blue-500 to-blue-600",
      tasksTotal: 24,
      tasksCompleted: 16,
      budget: 50000,
      spent: 32500,
      favorite: true,
      client: "Tech Corp",
    },
    {
      id: "2",
      name: "App Mobile",
      description: "Desenvolvimento do aplicativo iOS e Android",
      status: "active" as ProjectStatus,
      priority: "critical" as ProjectPriority,
      progress: 40,
      team: ["Ana Lima", "Carlos Souza"],
      deadline: "2025-03-20",
      startDate: "2025-01-10",
      color: "from-purple-500 to-purple-600",
      tasksTotal: 32,
      tasksCompleted: 13,
      budget: 80000,
      spent: 28000,
      favorite: false,
      client: "StartupXYZ",
    },
  ],
}

export default function ProjectsManager({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData } = usePageTemplateData(groupId, pageId, DEFAULT_DATA)
  const [projects, setProjects] = useState<Project[]>(data.projects ?? DEFAULT_DATA.projects)

  useEffect(() => {
    setProjects(data.projects ?? DEFAULT_DATA.projects)
  }, [data.projects])

  const persistProjects = (updater: (current: Project[]) => Project[]) => {
    setProjects((current) => {
      const next = updater(current)
      setData({ projects: next })
      return next
    })
  }

  const [view, setView] = useState<"grid" | "list">("grid")
  const [showModal, setShowModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    client: "",
    deadline: "",
    team: "",
    budget: "",
    priority: "medium" as ProjectPriority,
  })

  const addProject = () => {
    if (!formData.name.trim()) return

    const randomColor = PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)]

    const project: Project = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      status: "planning",
      priority: formData.priority,
      progress: 0,
      team: formData.team.split(",").map((t) => t.trim()).filter((t) => t),
      deadline: formData.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      startDate: new Date().toISOString().split("T")[0],
      color: randomColor,
      tasksTotal: 0,
      tasksCompleted: 0,
      budget: Number.parseFloat(formData.budget) || undefined,
      spent: 0,
      favorite: false,
      client: formData.client,
    }

    persistProjects((current) => [...current, project])
    setFormData({ name: "", description: "", client: "", deadline: "", team: "", budget: "", priority: "medium" })
    setShowModal(false)
  }

  const updateProject = (id: string, updates: Partial<Project>) => {
    persistProjects((current) => current.map((p) => (p.id === id ? { ...p, ...updates } : p)))
    if (selectedProject?.id === id) {
      setSelectedProject({ ...selectedProject, ...updates })
    }
  }

  const deleteProject = (id: string) => {
    if (confirm("Excluir este projeto?")) {
      persistProjects((current) => current.filter((p) => p.id !== id))
      setSelectedProject(null)
    }
  }

  const toggleFavorite = (id: string) => {
    const project = projects.find((p) => p.id === id)
    if (!project) return
    updateProject(id, { favorite: !project.favorite })
  }

  const filteredProjects = projects.filter((project) => {
    const matchesStatus = filterStatus === "all" || project.status === filterStatus
    const matchesFavorite = !showFavoritesOnly || project.favorite
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesFavorite && matchesSearch
  })

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "active").length,
    completed: projects.filter((p) => p.status === "completed").length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    totalSpent: projects.reduce((sum, p) => sum + (p.spent || 0), 0),
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
  }

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  const getDaysRemaining = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div className="h-full flex flex-col bg-arc-primary">
      {/* Header Fixo */}
      <div className="sticky top-0 z-10 bg-arc-primary border-b border-arc backdrop-blur-sm bg-opacity-95">
        <div className="px-3 sm:px-6 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-arc">Projetos</h1>
              <p className="text-xs text-arc-muted mt-0.5">
                {filteredProjects.length} {filteredProjects.length === 1 ? "projeto" : "projetos"}
              </p>
            </div>

            <Button onClick={() => setShowModal(true)} size="sm" className="h-8 px-2.5">
              <Plus className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Novo Projeto</span>
            </Button>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-arc-muted w-3.5 h-3.5" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="pl-9 h-9 text-sm"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ProjectStatus | "all")}
              className="px-3 py-2 border border-arc rounded-lg bg-arc-secondary text-arc text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
            >
              <option value="all">Todos Status</option>
              {Object.entries(STATUS_CONFIG).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 border h-9",
                showFavoritesOnly
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                  : "bg-arc-secondary text-arc border-arc hover:bg-arc-primary"
              )}
            >
              <Star className={cn("w-3.5 h-3.5", showFavoritesOnly && "fill-current")} />
              <span className="hidden sm:inline">Favoritos</span>
            </button>

            <div className="flex border border-arc rounded-lg p-0.5 bg-arc-secondary h-9">
              <button
                onClick={() => setView("grid")}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  view === "grid" ? "bg-arc-primary shadow-sm" : "hover:bg-arc-primary/50"
                )}
              >
                <Grid3x3 className="w-3.5 h-3.5 text-arc" />
              </button>
              <button
                onClick={() => setView("list")}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  view === "list" ? "bg-arc-primary shadow-sm" : "hover:bg-arc-primary/50"
                )}
              >
                <List className="w-3.5 h-3.5 text-arc" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        {filteredProjects.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 bg-arc-secondary rounded-lg flex items-center justify-center">
                <FolderKanban className="w-8 h-8 text-arc-muted" />
              </div>
              <h2 className="text-lg font-semibold text-arc mb-2">Nenhum projeto encontrado</h2>
              <p className="text-sm text-arc-muted mb-6">
                {searchQuery || filterStatus !== "all" || showFavoritesOnly
                  ? "Tente ajustar os filtros"
                  : "Crie seu primeiro projeto para começar"}
              </p>
              <Button onClick={() => setShowModal(true)} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Criar Projeto
              </Button>
            </div>
          </div>
        ) : view === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => {
              const statusConfig = STATUS_CONFIG[project.status]
              const priorityConfig = PRIORITY_CONFIG[project.priority]
              const daysRemaining = getDaysRemaining(project.deadline)
              const overdue = isOverdue(project.deadline)

              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="group relative bg-arc-secondary border border-arc rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className={cn("w-12 h-12 rounded-lg flex-shrink-0 bg-gradient-to-br", project.color)} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-arc truncate mb-0.5">{project.name}</h3>
                      {project.client && <p className="text-xs text-arc-muted truncate">{project.client}</p>}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(project.id)
                      }}
                      className="p-1 hover:bg-arc-primary rounded transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Star className={cn("w-4 h-4", project.favorite ? "fill-yellow-500 text-yellow-500" : "text-arc-muted")} />
                    </button>
                  </div>

                  <p className="text-sm text-arc mb-4 line-clamp-2">{project.description}</p>

                  {/* Status & Priority */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig.color)}>
                      {statusConfig.label}
                    </span>
                    <span className={cn("text-xs font-medium", priorityConfig.color)}>
                      {priorityConfig.label}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-arc-muted">Progresso</span>
                      <span className="font-semibold text-arc">{project.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-arc-primary rounded-full overflow-hidden">
                      <div
                        className={cn("h-2 bg-gradient-to-r transition-all", project.color)}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-arc-muted mt-1">
                      {project.tasksCompleted} de {project.tasksTotal} tarefas
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-arc text-xs">
                    <div className="flex items-center gap-1 text-arc-muted">
                      <Users className="w-3 h-3" />
                      <span>{project.team.length}</span>
                    </div>
                    <div className={cn("flex items-center gap-1 font-medium", overdue ? "text-red-600" : daysRemaining <= 7 ? "text-orange-600" : "text-arc-muted")}>
                      <Calendar className="w-3 h-3" />
                      <span>{overdue ? "Atrasado" : daysRemaining === 0 ? "Hoje" : `${daysRemaining}d`}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {filteredProjects.map((project) => {
              const statusConfig = STATUS_CONFIG[project.status]
              const daysRemaining = getDaysRemaining(project.deadline)

              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="group bg-arc-secondary border border-arc rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-lg flex-shrink-0 bg-gradient-to-br", project.color)} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base text-arc truncate">{project.name}</h3>
                        {project.favorite && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-arc-muted truncate">{project.description}</p>
                    </div>

                    <div className="hidden md:flex items-center gap-6 flex-shrink-0">
                      <span className={cn("px-3 py-1 rounded-lg text-xs font-medium", statusConfig.color)}>
                        {statusConfig.label}
                      </span>

                      <div className="text-center min-w-[60px]">
                        <div className="text-lg font-semibold text-arc">{project.progress}%</div>
                        <div className="text-xs text-arc-muted">
                          {project.tasksCompleted}/{project.tasksTotal}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-arc-muted min-w-[80px]">
                        <Users className="w-4 h-4" />
                        {project.team.length}
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-arc-muted min-w-[100px]">
                        <Calendar className="w-4 h-4" />
                        {new Date(project.deadline).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {projects.length > 0 && (
        <div className="border-t border-arc px-3 sm:px-6 py-3">
          <div className="grid grid-cols-5 gap-2">
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-arc">{stats.total}</div>
              <div className="text-[10px] sm:text-xs text-arc-muted">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-blue-600">{stats.active}</div>
              <div className="text-[10px] sm:text-xs text-arc-muted">Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-[10px] sm:text-xs text-arc-muted">Concluídos</div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm font-bold text-arc">{formatCurrency(stats.totalBudget)}</div>
              <div className="text-[10px] sm:text-xs text-arc-muted">Orçamento</div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm font-bold text-arc">{formatCurrency(stats.totalSpent)}</div>
              <div className="text-[10px] sm:text-xs text-arc-muted">Gasto</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-arc-primary rounded-2xl w-full max-w-2xl shadow-2xl border border-arc">
            <div className="p-6 border-b border-arc flex items-center justify-between">
              <h2 className="text-xl font-bold text-arc">Novo Projeto</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-arc-secondary rounded transition-colors">
                <X className="w-5 h-5 text-arc" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-arc mb-2">Nome do Projeto *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-arc rounded-lg bg-arc-secondary text-arc focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do projeto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-arc mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-arc rounded-lg bg-arc-secondary text-arc focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Descreva o projeto"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-arc mb-2">Cliente</label>
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full px-4 py-2 border border-arc rounded-lg bg-arc-secondary text-arc focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome do cliente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-arc mb-2">Prazo</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-2 border border-arc rounded-lg bg-arc-secondary text-arc focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-arc mb-2">Equipe</label>
                  <input
                    type="text"
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    className="w-full px-4 py-2 border border-arc rounded-lg bg-arc-secondary text-arc focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome1, Nome2"
                  />
                  <p className="text-xs text-arc-muted mt-1">Separe por vírgula</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-arc mb-2">Orçamento (R$)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-2 border border-arc rounded-lg bg-arc-secondary text-arc focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-arc mb-2">Prioridade</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as ProjectPriority })}
                  className="w-full px-4 py-2 border border-arc rounded-lg bg-arc-secondary text-arc focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(PRIORITY_CONFIG).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 pt-4 border-t border-arc flex justify-end gap-3">
              <Button onClick={() => setShowModal(false)} variant="outline" size="sm">
                Cancelar
              </Button>
              <Button onClick={addProject} size="sm" disabled={!formData.name.trim()}>
                Criar Projeto
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-arc-primary rounded-2xl w-full max-w-3xl shadow-2xl border border-arc max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-arc flex items-start justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className={cn("w-14 h-14 rounded-xl flex-shrink-0 bg-gradient-to-br", selectedProject.color)} />
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-arc mb-1 truncate">{selectedProject.name}</h2>
                  {selectedProject.client && <p className="text-sm text-arc-muted">Cliente: {selectedProject.client}</p>}
                </div>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 hover:bg-arc-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-arc" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-arc mb-3">Status</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <button
                      key={status}
                      onClick={() => updateProject(selectedProject.id, { status: status as ProjectStatus })}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        selectedProject.status === status ? config.color + " shadow-sm" : "bg-arc-secondary text-arc-muted hover:bg-arc-primary"
                      )}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-arc mb-3">Descrição</label>
                <textarea
                  value={selectedProject.description}
                  onChange={(e) => updateProject(selectedProject.id, { description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-arc rounded-lg bg-arc-secondary text-arc focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-arc-secondary border border-arc rounded-lg text-center">
                  <div className="text-2xl font-semibold text-arc">{selectedProject.progress}%</div>
                  <div className="text-xs text-arc-muted mt-1">Progresso</div>
                </div>
                <div className="p-4 bg-arc-secondary border border-arc rounded-lg text-center">
                  <div className="text-2xl font-semibold text-arc">
                    {selectedProject.tasksCompleted}/{selectedProject.tasksTotal}
                  </div>
                  <div className="text-xs text-arc-muted mt-1">Tarefas</div>
                </div>
                <div className="p-4 bg-arc-secondary border border-arc rounded-lg text-center">
                  <div className="text-2xl font-semibold text-arc">{selectedProject.team.length}</div>
                  <div className="text-xs text-arc-muted mt-1">Equipe</div>
                </div>
                <div className="p-4 bg-arc-secondary border border-arc rounded-lg text-center">
                  <div className="text-sm font-semibold text-arc">
                    {new Date(selectedProject.deadline).toLocaleDateString("pt-BR")}
                  </div>
                  <div className="text-xs text-arc-muted mt-1">Prazo</div>
                </div>
              </div>

              {/* Budget */}
              {selectedProject.budget && (
                <div className="p-5 bg-arc-secondary border border-arc rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-arc">Orçamento</h4>
                    <span className="text-lg font-semibold text-arc">
                      {selectedProject.spent && selectedProject.budget
                        ? ((selectedProject.spent / selectedProject.budget) * 100).toFixed(0)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-arc-muted">Gasto</span>
                      <span className="font-semibold text-arc">{formatCurrency(selectedProject.spent || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-arc-muted">Total</span>
                      <span className="font-semibold text-arc">{formatCurrency(selectedProject.budget)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Team */}
              <div>
                <label className="block text-sm font-medium text-arc mb-3">Equipe</label>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.team.map((member, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-arc-secondary border border-arc text-arc rounded-lg text-sm"
                    >
                      <Users className="w-3.5 h-3.5" />
                      {member}
                    </span>
                  ))}
                  {selectedProject.team.length === 0 && <p className="text-sm text-arc-muted">Nenhum membro</p>}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-arc flex gap-3">
              <Button onClick={() => toggleFavorite(selectedProject.id)} variant="outline" size="sm">
                <Star className={cn("w-4 h-4 mr-2", selectedProject.favorite && "fill-yellow-500 text-yellow-500")} />
                {selectedProject.favorite ? "Desfavoritar" : "Favoritar"}
              </Button>
              <Button onClick={() => deleteProject(selectedProject.id)} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
              <Button onClick={() => setSelectedProject(null)} size="sm" className="ml-auto">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
