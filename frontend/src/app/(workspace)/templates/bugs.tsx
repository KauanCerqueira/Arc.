"use client"

import { useState } from "react"
import { Plus, Bug, AlertCircle, CheckCircle2, Clock, Trash2 } from "lucide-react"
import { usePageTemplateData } from "@/core/hooks/usePageTemplateData"
import { WorkspaceTemplateComponentProps } from "@/core/types/workspace.types"

type BugStatus = "open" | "in_progress" | "resolved"
type BugPriority = "low" | "medium" | "high" | "critical"

type BugItem = {
  id: string
  title: string
  description: string
  status: BugStatus
  priority: BugPriority
  assignee?: string
  createdAt: string
}

type BugsTemplateData = {
  bugs: BugItem[]
}

const DEFAULT_DATA: BugsTemplateData = {
  bugs: [
    {
      id: "1",
      title: "Botão de login não funciona no Safari",
      description: "Usuários relatam que o botão não responde",
      status: "open",
      priority: "high",
      assignee: "João Silva",
      createdAt: "2025-01-18",
    },
    {
      id: "2",
      title: "Erro 500 ao criar projeto",
      description: "API retorna erro interno",
      status: "in_progress",
      priority: "critical",
      assignee: "Maria Santos",
      createdAt: "2025-01-17",
    },
    {
      id: "3",
      title: "Layout quebrado em mobile",
      description: "Sidebar não fecha corretamente",
      status: "resolved",
      priority: "medium",
      assignee: "Pedro Costa",
      createdAt: "2025-01-15",
    },
  ],
}

export default function BugsTemplate({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData, isSaving } = usePageTemplateData<BugsTemplateData>(groupId, pageId, DEFAULT_DATA)
  const bugs = data.bugs ?? DEFAULT_DATA.bugs

  const updateBugs = (updater: BugItem[] | ((current: BugItem[]) => BugItem[])) => {
    setData((current) => {
      const currentBugs = current.bugs ?? DEFAULT_DATA.bugs
      const nextBugs =
        typeof updater === "function"
          ? (updater as (current: BugItem[]) => BugItem[])(JSON.parse(JSON.stringify(currentBugs)))
          : updater
      return {
        ...current,
        bugs: nextBugs,
      }
    })
  }

  const [showAddForm, setShowAddForm] = useState(false)
  const [newBug, setNewBug] = useState({
    title: "",
    description: "",
    priority: "medium" as BugPriority,
    assignee: "",
  })

  const addBug = () => {
    if (!newBug.title.trim()) return

    updateBugs((current) => [
      ...current,
      {
        id: Date.now().toString(),
        title: newBug.title,
        description: newBug.description,
        status: "open",
        priority: newBug.priority,
        assignee: newBug.assignee || undefined,
        createdAt: new Date().toISOString().split("T")[0],
      },
    ])

    setNewBug({ title: "", description: "", priority: "medium", assignee: "" })
    setShowAddForm(false)
  }

  const updateStatus = (id: string, status: BugStatus) => {
    updateBugs((current) => current.map((bug) => (bug.id === id ? { ...bug, status } : bug)))
  }

  const deleteBug = (id: string) => {
    updateBugs((current) => current.filter((bug) => bug.id !== id))
  }

  const getPriorityColor = (priority: BugPriority) => {
    const colors = {
      low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      critical: "bg-red-500/10 text-red-600 border-red-500/20",
    }
    return colors[priority]
  }

  const getStatusIcon = (status: BugStatus) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "in_progress":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "resolved":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
    }
  }

  const getStatusLabel = (status: BugStatus) => {
    const labels = {
      open: "Aberto",
      in_progress: "Em Progresso",
      resolved: "Resolvido",
    }
    return labels[status]
  }

  const openCount = bugs.filter((b) => b.status === "open").length
  const inProgressCount = bugs.filter((b) => b.status === "in_progress").length
  const resolvedCount = bugs.filter((b) => b.status === "resolved").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciamento de Bugs</h1>
          <p className="text-gray-600">Acompanhe e resolva problemas do sistema</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Abertos</p>
                <p className="text-3xl font-bold text-gray-900">{openCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Em Progresso</p>
                <p className="text-3xl font-bold text-gray-900">{inProgressCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Resolvidos</p>
                <p className="text-3xl font-bold text-gray-900">{resolvedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="mb-6 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          Reportar Bug
        </button>

        {/* Add Form */}
        {showAddForm && (
          <div className="mb-6 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Novo Bug</h3>
            <input
              type="text"
              value={newBug.title}
              onChange={(e) => setNewBug({ ...newBug, title: e.target.value })}
              placeholder="Título do bug"
              className="w-full px-4 py-2.5 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            />
            <textarea
              value={newBug.description}
              onChange={(e) => setNewBug({ ...newBug, description: e.target.value })}
              placeholder="Descrição detalhada do problema"
              rows={3}
              className="w-full px-4 py-2.5 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none transition-all"
            />
            <input
              type="text"
              value={newBug.assignee}
              onChange={(e) => setNewBug({ ...newBug, assignee: e.target.value })}
              placeholder="Responsável (opcional)"
              className="w-full px-4 py-2.5 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            />
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={newBug.priority}
                onChange={(e) => setNewBug({ ...newBug, priority: e.target.value as BugPriority })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all font-medium"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
              <button
                onClick={addBug}
                className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all font-medium"
              >
                Adicionar
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-5 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Bugs List */}
        <div className="space-y-4">
          {bugs.map((bug) => (
            <div key={bug.id} className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bug className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{bug.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{bug.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getPriorityColor(bug.priority)}`}
                  >
                    {bug.priority === "low" && "Baixa"}
                    {bug.priority === "medium" && "Média"}
                    {bug.priority === "high" && "Alta"}
                    {bug.priority === "critical" && "Crítica"}
                  </span>
                  <button
                    onClick={() => deleteBug(bug.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Deletar bug"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="font-medium">{bug.createdAt}</span>
                  {bug.assignee && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span>{bug.assignee}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateStatus(bug.id, "open")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      bug.status === "open"
                        ? "bg-red-500/10 text-red-600 border border-red-500/20"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
                    }`}
                  >
                    Aberto
                  </button>
                  <button
                    onClick={() => updateStatus(bug.id, "in_progress")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      bug.status === "in_progress"
                        ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
                    }`}
                  >
                    Em Progresso
                  </button>
                  <button
                    onClick={() => updateStatus(bug.id, "resolved")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      bug.status === "resolved"
                        ? "bg-green-500/10 text-green-600 border border-green-500/20"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
                    }`}
                  >
                    Resolvido
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
