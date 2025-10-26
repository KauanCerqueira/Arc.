"use client"

import { useState } from "react"

type ProjectStatus = "planning" | "active" | "paused" | "review" | "completed" | "archived"
type ProjectPriority = "low" | "medium" | "high" | "critical"

type Project = {
  id: number
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
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-red-500",
  "bg-indigo-500",
  "bg-cyan-500",
  "bg-amber-500",
  "bg-teal-500",
]

const STATUS_CONFIG = {
  planning: {
    label: "Planejamento",
    color: "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800",
  },
  active: {
    label: "Em Andamento",
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  paused: {
    label: "Pausado",
    color:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
  },
  review: {
    label: "Em Revisão",
    color:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  },
  completed: {
    label: "Concluído",
    color:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
  },
  archived: {
    label: "Arquivado",
    color: "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800",
  },
}

const PRIORITY_CONFIG = {
  low: {
    label: "Baixa",
    color: "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800",
  },
  medium: {
    label: "Média",
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  high: {
    label: "Alta",
    color:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  },
  critical: {
    label: "Crítica",
    color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
  },
}

export default function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: "Website Redesign",
      description: "Redesign completo do site institucional com nova identidade visual",
      status: "active",
      priority: "high",
      progress: 65,
      team: ["João Silva", "Maria Santos", "Pedro Costa"],
      deadline: "2025-02-15",
      startDate: "2025-01-05",
      color: "bg-blue-500",
      tasksTotal: 24,
      tasksCompleted: 16,
      budget: 50000,
      spent: 32500,
      favorite: true,
      client: "Tech Corp",
    },
    {
      id: 2,
      name: "App Mobile",
      description: "Desenvolvimento do aplicativo iOS e Android",
      status: "active",
      priority: "critical",
      progress: 40,
      team: ["Ana Lima", "Carlos Souza"],
      deadline: "2025-03-20",
      startDate: "2025-01-10",
      color: "bg-purple-500",
      tasksTotal: 32,
      tasksCompleted: 13,
      budget: 80000,
      spent: 28000,
      favorite: false,
      client: "StartupXYZ",
    },
    {
      id: 3,
      name: "Marketing Q1",
      description: "Campanhas de marketing para o primeiro trimestre",
      status: "paused",
      priority: "medium",
      progress: 25,
      team: ["Fernanda Costa"],
      deadline: "2025-01-30",
      startDate: "2025-01-01",
      color: "bg-orange-500",
      tasksTotal: 15,
      tasksCompleted: 4,
      budget: 20000,
      spent: 5000,
      favorite: false,
    },
  ])

  const [view, setView] = useState<"grid" | "list">("grid")
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | "all">("all")
  const [filterPriority, setFilterPriority] = useState<ProjectPriority | "all">("all")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    client: "",
    deadline: "",
    team: "",
    budget: "",
    priority: "medium" as ProjectPriority,
  })

  const addProject = () => {
    if (!newProject.name.trim()) return

    const randomColor = PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)]

    const project: Project = {
      id: Date.now(),
      name: newProject.name,
      description: newProject.description,
      status: "planning",
      priority: newProject.priority,
      progress: 0,
      team: newProject.team
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
      deadline: newProject.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      startDate: new Date().toISOString().split("T")[0],
      color: randomColor,
      tasksTotal: 0,
      tasksCompleted: 0,
      budget: Number.parseFloat(newProject.budget) || undefined,
      spent: 0,
      favorite: false,
      client: newProject.client,
    }

    setProjects([...projects, project])
    setNewProject({ name: "", description: "", client: "", deadline: "", team: "", budget: "", priority: "medium" })
    setShowAddForm(false)
  }

  const updateProject = (id: number, updates: Partial<Project>) => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, ...updates } : p)))
    if (selectedProject?.id === id) {
      setSelectedProject({ ...selectedProject, ...updates })
    }
  }

  const deleteProject = (id: number) => {
    if (confirm("Excluir este projeto?")) {
      setProjects(projects.filter((p) => p.id !== id))
      setSelectedProject(null)
    }
  }

  const toggleFavorite = (id: number) => {
    updateProject(id, { favorite: !projects.find((p) => p.id === id)?.favorite })
  }

  const filteredProjects = projects.filter((project) => {
    const matchesStatus = filterStatus === "all" || project.status === filterStatus
    const matchesPriority = filterPriority === "all" || project.priority === filterPriority
    const matchesFavorite = !showFavoritesOnly || project.favorite
    return matchesStatus && matchesPriority && matchesFavorite
  })

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "active").length,
    completed: projects.filter((p) => p.status === "completed").length,
    paused: projects.filter((p) => p.status === "paused").length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    totalSpent: projects.reduce((sum, p) => sum + (p.spent || 0), 0),
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date() && new Date(deadline).toDateString() !== new Date().toDateString()
  }

  const getDaysRemaining = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-gray-50 tracking-tight">
                  Projetos
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5">
                  {filteredProjects.length} {filteredProjects.length === 1 ? "projeto" : "projetos"}
                </p>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center gap-2 px-4 lg:px-5 py-2.5 bg-gray-900 dark:bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-slate-600 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Novo Projeto</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
              <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-lg p-4 lg:p-5">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Total
                </div>
                <div className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-gray-50">{stats.total}</div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-lg p-4 lg:p-5">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Ativos
                </div>
                <div className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-gray-50">{stats.active}</div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-lg p-4 lg:p-5">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Concluídos
                </div>
                <div className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-gray-50">
                  {stats.completed}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-lg p-4 lg:p-5">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Orçamento
                </div>
                <div className="text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-50">
                  {formatCurrency(stats.totalBudget)}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-lg p-4 lg:p-5">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Gasto
                </div>
                <div className="text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-50">
                  {formatCurrency(stats.totalSpent)}
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ProjectStatus | "all")}
                className="flex-shrink-0 px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 focus:border-transparent"
              >
                <option value="all">Todos os Status</option>
                {Object.entries(STATUS_CONFIG).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as ProjectPriority | "all")}
                className="flex-shrink-0 px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 focus:border-transparent"
              >
                <option value="all">Todas as Prioridades</option>
                {Object.entries(PRIORITY_CONFIG).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  showFavoritesOnly
                    ? "bg-gray-900 dark:bg-slate-700 text-white border-gray-900 dark:border-slate-700"
                    : "bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill={showFavoritesOnly ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
                Favoritos
              </button>

              <div className="flex-shrink-0 ml-auto flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1 border border-gray-200 dark:border-slate-700">
                <button
                  onClick={() => setView("grid")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    view === "grid"
                      ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                  Grade
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    view === "list"
                      ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  Lista
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Novo Projeto</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome do Projeto
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="Digite o nome do projeto"
                  autoFocus
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descrição</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Descreva o projeto"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cliente</label>
                <input
                  type="text"
                  value={newProject.client}
                  onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                  placeholder="Nome do cliente"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prazo</label>
                <input
                  type="date"
                  value={newProject.deadline}
                  onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Equipe</label>
                <input
                  type="text"
                  value={newProject.team}
                  onChange={(e) => setNewProject({ ...newProject, team: e.target.value })}
                  placeholder="Nomes separados por vírgula"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Orçamento</label>
                <input
                  type="number"
                  value={newProject.budget}
                  onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                  placeholder="0,00"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prioridade</label>
                <select
                  value={newProject.priority}
                  onChange={(e) => setNewProject({ ...newProject, priority: e.target.value as ProjectPriority })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 focus:border-transparent"
                >
                  {Object.entries(PRIORITY_CONFIG).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={addProject}
                disabled={!newProject.name.trim()}
                className="px-5 py-2.5 bg-gray-900 dark:bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-slate-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900 dark:disabled:hover:bg-slate-700"
              >
                Criar Projeto
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-5 py-2.5 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {view === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {filteredProjects.map((project) => {
                const statusConfig = STATUS_CONFIG[project.status]
                const priorityConfig = PRIORITY_CONFIG[project.priority]
                const daysRemaining = getDaysRemaining(project.deadline)

                return (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 lg:p-6 hover:shadow-lg hover:border-gray-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-12 h-12 ${project.color} rounded-lg flex-shrink-0 shadow-sm`} />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base text-gray-900 dark:text-gray-50 truncate mb-0.5">
                            {project.name}
                          </h3>
                          {project.client && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{project.client}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(project.id)
                        }}
                        className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors"
                      >
                        <svg
                          className={`w-5 h-5 ${project.favorite ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}`}
                          fill={project.favorite ? "currentColor" : "none"}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>

                    <div className="flex items-center gap-2 mb-5">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${priorityConfig.color}`}>
                        {priorityConfig.label}
                      </span>
                    </div>

                    <div className="mb-5">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Progresso</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-50">{project.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`${project.color} h-2 transition-all duration-500 rounded-full`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                        <span>
                          {project.tasksCompleted} de {project.tasksTotal} tarefas
                        </span>
                      </div>
                    </div>

                    {project.budget && (
                      <div className="mb-5 p-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-lg">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">Orçamento</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-50">
                            {project.spent && project.budget ? ((project.spent / project.budget) * 100).toFixed(0) : 0}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">{formatCurrency(project.spent || 0)}</span>
                          <span className="text-gray-600 dark:text-gray-400">{formatCurrency(project.budget)}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        <span>{project.team.length}</span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 font-medium ${
                          isOverdue(project.deadline)
                            ? "text-red-600 dark:text-red-400"
                            : daysRemaining <= 7
                              ? "text-orange-600 dark:text-orange-400"
                              : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          {isOverdue(project.deadline)
                            ? "Atrasado"
                            : daysRemaining === 0
                              ? "Hoje"
                              : `${daysRemaining}d`}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {view === "list" && (
            <div className="space-y-3">
              {filteredProjects.map((project) => {
                const statusConfig = STATUS_CONFIG[project.status]
                const daysRemaining = getDaysRemaining(project.deadline)

                return (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 lg:p-5 hover:shadow-lg hover:border-gray-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${project.color} rounded-lg flex-shrink-0 shadow-sm`} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-base text-gray-900 dark:text-gray-50 truncate">
                            {project.name}
                          </h3>
                          {project.favorite && (
                            <svg className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" viewBox="0 0 24 24">
                              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{project.description}</p>
                      </div>

                      <div className="hidden md:flex items-center gap-6 flex-shrink-0">
                        <span className={`px-3 py-1.5 rounded-md text-xs font-medium border ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>

                        <div className="text-center min-w-[60px]">
                          <div className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                            {project.progress}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {project.tasksCompleted}/{project.tasksTotal}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 min-w-[80px]">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                          </svg>
                          {project.team.length} {project.team.length === 1 ? "pessoa" : "pessoas"}
                        </div>

                        <div
                          className={`flex items-center gap-1.5 text-sm font-medium min-w-[100px] ${
                            isOverdue(project.deadline)
                              ? "text-red-600 dark:text-red-400"
                              : daysRemaining <= 7
                                ? "text-orange-600 dark:text-orange-400"
                                : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {new Date(project.deadline).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {filteredProjects.length === 0 && (
            <div className="text-center py-16 lg:py-20">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-base text-gray-600 dark:text-gray-400 font-medium">Nenhum projeto encontrado</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Ajuste os filtros ou crie um novo projeto</p>
            </div>
          )}
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-t-2xl md:rounded-2xl w-full md:max-w-4xl shadow-2xl border-t md:border border-gray-200 dark:border-slate-800 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className={`w-14 h-14 lg:w-16 lg:h-16 ${selectedProject.color} rounded-xl flex-shrink-0 shadow-sm`}
                  />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-50 mb-1 truncate">
                      {selectedProject.name}
                    </h2>
                    {selectedProject.client && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cliente: {selectedProject.client}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Status do Projeto
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <button
                      key={status}
                      onClick={() => updateProject(selectedProject.id, { status: status as ProjectStatus })}
                      className={`px-4 py-2 rounded-lg transition-all text-sm font-medium border ${
                        selectedProject.status === status
                          ? config.color + " shadow-sm"
                          : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Descrição</label>
                <textarea
                  value={selectedProject.description}
                  onChange={(e) => updateProject(selectedProject.id, { description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 focus:border-transparent resize-none"
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-lg">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Progresso
                  </div>
                  <div className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                    {selectedProject.progress}%
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-lg">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Tarefas
                  </div>
                  <div className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                    {selectedProject.tasksCompleted}/{selectedProject.tasksTotal}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-lg">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Equipe
                  </div>
                  <div className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                    {selectedProject.team.length}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-lg">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Prazo
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                    {new Date(selectedProject.deadline).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>

              {/* Budget */}
              {selectedProject.budget && (
                <div className="p-5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Orçamento</h4>
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                      {selectedProject.spent && selectedProject.budget
                        ? ((selectedProject.spent / selectedProject.budget) * 100).toFixed(0)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Gasto</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-50">
                        {formatCurrency(selectedProject.spent || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Total</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-50">
                        {formatCurrency(selectedProject.budget)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Prioridade</label>
                <div className="grid grid-cols-2 lg:flex gap-2">
                  {Object.entries(PRIORITY_CONFIG).map(([priority, config]) => (
                    <button
                      key={priority}
                      onClick={() => updateProject(selectedProject.id, { priority: priority as ProjectPriority })}
                      className={`px-4 py-2 rounded-lg transition-all text-sm font-medium border ${
                        selectedProject.priority === priority
                          ? config.color + " shadow-sm"
                          : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Team */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Equipe</label>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.team.map((member, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium border border-gray-200 dark:border-slate-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      {member}
                    </span>
                  ))}
                  {selectedProject.team.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum membro na equipe</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-800 flex flex-col-reverse sm:flex-row gap-3">
              <button
                onClick={() => toggleFavorite(selectedProject.id)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-gray-200 dark:border-slate-700"
              >
                <svg
                  className={`w-4 h-4 ${selectedProject.favorite ? "text-yellow-500 fill-yellow-500" : ""}`}
                  fill={selectedProject.favorite ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
                {selectedProject.favorite ? "Remover Favorito" : "Favoritar"}
              </button>
              <button
                onClick={() => deleteProject(selectedProject.id)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Excluir
              </button>
              <button
                onClick={() => setSelectedProject(null)}
                className="sm:ml-auto px-6 py-2.5 text-sm bg-gray-900 dark:bg-slate-700 text-white font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-slate-600 transition-colors shadow-sm"
              >
                Salvar e Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
