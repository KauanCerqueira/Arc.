"use client"

import { useState, useMemo, useEffect } from "react"
import { WorkspaceTemplateComponentProps } from "@/core/types/workspace.types"
import {
  Trophy,
  Target,
  Zap,
  Award,
  Flame,
  TrendingUp,
  Calendar,
  Clock,
  Star,
  Sparkles,
  Plus,
  CheckCircle,
  Circle,
  BarChart3,
  Loader2,
} from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/Button"
import { Badge } from "@/shared/components/ui/Badge"
import { Input } from "@/shared/components/ui/Input"
import { Textarea } from "@/shared/components/ui/Textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/Dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/Select"
import { Card, CardContent } from "@/components/ui/card"
import { Leaderboard } from "@/shared/components/gamification/Leaderboard"
import { AchievementCard } from "@/shared/components/gamification/AchievementCard"
import { useWorkspaceGamification } from "@/core/hooks/useWorkspaceGamification"
import { useAuthStore } from "@/core/store/authStore"
import { useWorkspaceStore } from "@/core/store/workspaceStore"

// Types
type TaskStatus = "backlog" | "in-progress" | "done"

type Task = {
  id: string
  title: string
  description: string
  storyPoints: number
  status: TaskStatus
  assignee?: string
  priority: "urgent" | "high" | "medium" | "low"
  tags: string[]
  createdAt?: Date
  completedAt?: Date
}

type SprintTag = {
  id: string
  name: string
  color: string
}

// Sprint Tags Configuration - Monochromatic palette
const sprintTags: SprintTag[] = [
  { id: "backend", name: "Backend", color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600" },
  { id: "frontend", name: "Frontend", color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600" },
  { id: "bug", name: "Bug", color: "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-400 dark:border-gray-500" },
  { id: "feature", name: "Feature", color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600" },
  { id: "urgent", name: "Urgente", color: "bg-gray-900 dark:bg-gray-100 text-gray-100 dark:text-gray-900 border-gray-900 dark:border-gray-100" },
  { id: "design", name: "Design", color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600" },
]

function PriorityIcon({ priority }: { priority: Task["priority"] }) {
  const config = {
    urgent: { icon: Flame, color: "text-gray-900 dark:text-gray-100" },
    high: { icon: Zap, color: "text-gray-700 dark:text-gray-300" },
    medium: { icon: TrendingUp, color: "text-gray-500 dark:text-gray-400" },
    low: { icon: Circle, color: "text-gray-400 dark:text-gray-500" },
  }

  const Icon = config[priority].icon
  return <Icon className={cn("size-4", config[priority].color)} />
}

function TaskModal({
  open,
  onOpenChange,
  task,
  onSave,
  members,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
  onSave: (task: Task) => void
  members: Array<{ userId: string; userName: string }>
}) {
  const [formData, setFormData] = useState<Partial<Task>>(
    task || {
      title: "",
      description: "",
      storyPoints: 5,
      status: "backlog",
      priority: "medium",
      tags: [],
    },
  )

  const handleSave = () => {
    if (!formData.title?.trim()) return

    const newTask: Task = {
      id: task?.id || `${Date.now()}`,
      title: formData.title || "",
      description: formData.description || "",
      storyPoints: formData.storyPoints || 5,
      status: (formData.status as TaskStatus) || "backlog",
      assignee: formData.assignee,
      priority: (formData.priority as Task["priority"]) || "medium",
      tags: formData.tags || [],
      createdAt: task?.createdAt || new Date(),
      completedAt: formData.status === "done" ? new Date() : undefined,
    }

    onSave(newTask)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Título</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Digite o título da tarefa..."
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Descrição</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Digite a descrição..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Story Points</label>
              <Select
                value={formData.storyPoints?.toString()}
                onValueChange={(value) => setFormData({ ...formData, storyPoints: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 5, 8, 13, 21].map((p) => (
                    <SelectItem key={p} value={p.toString()}>
                      {p} pontos
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as TaskStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="in-progress">Em Progresso</SelectItem>
                  <SelectItem value="done">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Prioridade</label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as Task["priority"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Atribuído para</label>
            <Select
              value={formData.assignee || "unassigned"}
              onValueChange={(value) => setFormData({ ...formData, assignee: value === "unassigned" ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um membro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Nenhum</SelectItem>
                {members.map((member) => (
                  <SelectItem key={member.userId} value={member.userId}>
                    {member.userName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-2">
              {sprintTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    const currentTags = formData.tags || []
                    const hasTags = currentTags.includes(tag.id)
                    setFormData({
                      ...formData,
                      tags: hasTags ? currentTags.filter((t) => t !== tag.id) : [...currentTags, tag.id],
                    })
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all",
                    formData.tags?.includes(tag.id)
                      ? tag.color
                      : "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-200",
                  )}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function SprintGamificationPage({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { user } = useAuthStore()
  const { workspace } = useWorkspaceStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [sprintName, setSprintName] = useState("Sprint - " + new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" }))
  const [sprintGoal, setSprintGoal] = useState(
    "Defina a meta desta sprint para manter o time focado e alinhado nos objetivos principais.",
  )
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()

  // Sprint dates
  const today = new Date()
  const [sprintStart] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [sprintEnd] = useState(new Date(today.getFullYear(), today.getMonth() + 1, 0))

  // Get workspace ID from workspace store
  const workspaceId = workspace?.id || ''

  // Use gamification hook
  const { leaderboard, userStats, members, isLoading, error } = useWorkspaceGamification(
    workspaceId,
    tasks,
  )

  // Gamification Calculations
  const totalPoints = tasks.reduce((sum, t) => sum + t.storyPoints, 0)
  const completedPoints = tasks.filter((t) => t.status === "done").reduce((sum, t) => sum + t.storyPoints, 0)
  const inProgressPoints = tasks.filter((t) => t.status === "in-progress").reduce((sum, t) => sum + t.storyPoints, 0)
  const backlogPoints = tasks.filter((t) => t.status === "backlog").reduce((sum, t) => sum + t.storyPoints, 0)
  const progress = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0

  const completedTasks = tasks.filter((t) => t.status === "done").length
  const totalTasks = tasks.length

  // Sprint Days
  const daysTotal = Math.ceil((sprintEnd.getTime() - sprintStart.getTime()) / (1000 * 60 * 60 * 24))
  const daysElapsed = Math.ceil((today.getTime() - sprintStart.getTime()) / (1000 * 60 * 60 * 24))
  const daysRemaining = daysTotal - daysElapsed > 0 ? daysTotal - daysElapsed : 0

  // Task by status
  const tasksByStatus = useMemo(() => {
    return {
      backlog: tasks.filter((t) => t.status === "backlog"),
      inProgress: tasks.filter((t) => t.status === "in-progress"),
      done: tasks.filter((t) => t.status === "done"),
    }
  }, [tasks])

  // Get current user stats
  const currentUserStats = user ? userStats.get(user.userId) : undefined

  // Get top achievements
  const topAchievements = currentUserStats?.achievements
    .filter(a => a.progress === 100)
    .slice(0, 3) || []

  const handleSaveTask = (task: Task) => {
    if (editingTask) {
      setTasks(tasks.map((t) => (t.id === task.id ? task : t)))
    } else {
      setTasks([...tasks, task])
    }
    setEditingTask(undefined)
  }

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === taskId) {
          const nextStatus: Record<TaskStatus, TaskStatus> = {
            backlog: "in-progress",
            "in-progress": "done",
            done: "backlog",
          }
          const newStatus = nextStatus[t.status]
          return {
            ...t,
            status: newStatus,
            completedAt: newStatus === "done" ? new Date() : undefined,
          }
        }
        return t
      }),
    )
  }

  const getMemberName = (userId: string) => {
    const member = members.find(m => m.userId === userId)
    return member?.userName || userId
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">Carregando dados de gamificação...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-primary dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Erro ao carregar dados: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary dark:bg-gray-900">
      <div className="max-w-[1600px] mx-auto p-3 md:p-6 space-y-4 md:space-y-6">
        {/* Header com Sprint Info */}
        <div className="bg-bg-secondary dark:bg-gray-800 rounded-xl border border-border dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between w-full mb-4 gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-10 md:size-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                    <Target className="size-5 md:size-6 text-text-primary dark:text-gray-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={sprintName}
                      onChange={(e) => setSprintName(e.target.value)}
                      className="text-lg md:text-2xl font-bold text-text-primary dark:text-gray-100 bg-transparent border-none outline-none w-full"
                    />
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-xs md:text-sm text-text-secondary dark:text-gray-400 mt-1">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="size-3 md:size-4" />
                        {sprintStart.toLocaleDateString("pt-BR")} - {sprintEnd.toLocaleDateString("pt-BR")}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-3 md:size-4" />
                        {daysRemaining} dias restantes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => {
                  setEditingTask(undefined)
                  setTaskModalOpen(true)
                }}
                variant="secondary"
                size="sm"
                className="h-9 w-full md:w-auto"
              >
                <Plus className="size-4 mr-2" />
                Nova Tarefa
              </Button>
            </div>
            <Textarea
              value={sprintGoal}
              onChange={(e) => setSprintGoal(e.target.value)}
              rows={2}
              className="w-full bg-transparent border border-border dark:border-gray-700 rounded-lg p-3 outline-none resize-none text-text-primary dark:text-gray-200"
              placeholder="Meta do sprint..."
            />
          </div>

          {/* Progress Bar */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Trophy className="size-5 text-gray-700 dark:text-gray-300" />
                <span className="text-sm font-semibold text-text-primary dark:text-gray-300">Progresso do Sprint</span>
              </div>
              <div className="text-sm text-text-secondary dark:text-gray-400">
                <span className="font-bold text-text-primary dark:text-gray-100">{completedPoints}</span> / {totalPoints}{" "}
                pontos ({progress}%)
              </div>
            </div>
            <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 dark:from-gray-300 dark:via-gray-200 dark:to-gray-100 transition-all duration-500 shadow-lg"
                style={{ width: `${progress}%` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Gamification Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Métricas Principais */}
          <div className="lg:col-span-3 space-y-6">
            {/* Cards de Métricas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="size-5 text-gray-600 dark:text-gray-400" />
                    <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 text-xs">Total</Badge>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold mb-1 text-text-primary dark:text-gray-100">{totalPoints}</div>
                  <div className="text-xs text-text-secondary dark:text-gray-400">Story Points</div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="size-5 text-gray-800 dark:text-gray-200" />
                    <Badge className="bg-gray-800 dark:bg-gray-200 text-gray-100 dark:text-gray-900 px-2 py-0.5 text-xs">{progress}%</Badge>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold mb-1 text-text-primary dark:text-gray-100">{completedPoints}</div>
                  <div className="text-xs text-text-secondary dark:text-gray-400">Concluídos</div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="size-5 text-gray-700 dark:text-gray-300" />
                    <Badge className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 text-xs">Ativo</Badge>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold mb-1 text-text-primary dark:text-gray-100">{inProgressPoints}</div>
                  <div className="text-xs text-text-secondary dark:text-gray-400">Em Progresso</div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="size-5 text-gray-600 dark:text-gray-400" />
                    <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 text-xs">Meta</Badge>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold mb-1 text-text-primary dark:text-gray-100">{backlogPoints}</div>
                  <div className="text-xs text-text-secondary dark:text-gray-400">Backlog</div>
                </CardContent>
              </Card>
            </div>

            {/* Tasks List */}
            <div className="bg-bg-secondary dark:bg-gray-800 rounded-xl border border-border dark:border-gray-700 shadow-sm p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-3">
                <h2 className="text-base md:text-lg font-bold text-text-primary dark:text-gray-100 flex items-center gap-2">
                  <Sparkles className="size-4 md:size-5 text-gray-600 dark:text-gray-400" />
                  Tarefas do Sprint
                </h2>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                  {sprintTags.slice(0, 4).map((tag) => (
                    <Badge key={tag.id} variant="outline" className={cn("text-xs whitespace-nowrap", tag.color)}>
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {["done", "in-progress", "backlog"].map((status) => {
                  const statusTasks =
                    status === "done"
                      ? tasksByStatus.done
                      : status === "in-progress"
                        ? tasksByStatus.inProgress
                        : tasksByStatus.backlog

                  const statusConfig = {
                    done: {
                      label: "Concluído",
                      icon: CheckCircle,
                      color: "text-green-500",
                      bg: "bg-green-50 dark:bg-green-950/20",
                    },
                    "in-progress": {
                      label: "Em Progresso",
                      icon: Zap,
                      color: "text-amber-500",
                      bg: "bg-amber-50 dark:bg-amber-950/20",
                    },
                    backlog: {
                      label: "Backlog",
                      icon: Circle,
                      color: "text-gray-500",
                      bg: "bg-gray-50 dark:bg-gray-950/20",
                    },
                  }

                  const config = statusConfig[status as keyof typeof statusConfig]
                  const Icon = config.icon

                  return (
                    <div
                      key={status}
                      className={cn(
                        "rounded-xl border border-border dark:border-gray-700 overflow-hidden",
                        config.bg,
                      )}
                    >
                      <div className="px-4 py-3 border-b border-border dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={cn("size-4", config.color)} />
                          <span className="text-sm font-semibold text-text-primary dark:text-gray-300">{config.label}</span>
                          <Badge variant="secondary" className="h-5 px-2 text-xs">
                            {statusTasks.length}
                          </Badge>
                        </div>
                        <div className="text-xs text-text-secondary dark:text-gray-400">
                          {statusTasks.reduce((sum, t) => sum + t.storyPoints, 0)} pts
                        </div>
                      </div>
                      <div className="p-2 space-y-2">
                        {statusTasks.length === 0 ? (
                          <div className="text-center py-8 text-text-secondary dark:text-gray-400 text-sm">
                            Nenhuma tarefa neste status
                          </div>
                        ) : (
                          statusTasks.map((task) => {
                            const taskTag = sprintTags.find((t) => task.tags.includes(t.id))

                            return (
                              <div
                                key={task.id}
                                className="bg-bg-secondary dark:bg-gray-900 rounded-lg border border-border dark:border-gray-700 p-3 hover:shadow-md transition-all cursor-pointer group"
                                onClick={() => {
                                  setEditingTask(task)
                                  setTaskModalOpen(true)
                                }}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleToggleTaskStatus(task.id)
                                        }}
                                        className="shrink-0"
                                      >
                                        {task.status === "done" ? (
                                          <CheckCircle className="size-5 text-green-500" />
                                        ) : (
                                          <Circle className="size-5 text-gray-400 hover:text-blue-500 transition" />
                                        )}
                                      </button>
                                      <h3 className="text-sm font-medium text-text-primary dark:text-gray-100 truncate">
                                        {task.title}
                                      </h3>
                                      <PriorityIcon priority={task.priority} />
                                    </div>
                                    <p className="text-xs text-text-secondary dark:text-gray-400 line-clamp-1 ml-7">
                                      {task.description}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {taskTag && (
                                      <Badge variant="outline" className={cn("text-[10px] px-2 h-5 hidden md:flex", taskTag.color)}>
                                        {taskTag.name}
                                      </Badge>
                                    )}
                                    <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 px-2 h-6 text-xs">
                                      <Award className="size-3 mr-1" />
                                      {task.storyPoints}
                                    </Badge>
                                    {task.assignee && (
                                      <div
                                        className="size-6 md:size-7 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100 flex items-center justify-center text-white dark:text-gray-900 text-[10px] font-bold shadow-sm"
                                        title={getMemberName(task.assignee)}
                                      >
                                        {getMemberName(task.assignee)
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")
                                          .slice(0, 2)
                                          .toUpperCase()}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Leaderboard & Team Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Velocity Card */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-100 rounded-xl p-6 text-white dark:text-gray-900 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-12 rounded-xl bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm flex items-center justify-center">
                  <TrendingUp className="size-6" />
                </div>
                <div>
                  <div className="text-sm opacity-80">Velocidade do Time</div>
                  <div className="text-2xl md:text-3xl font-bold">
                    {daysElapsed > 0 ? Math.round(completedPoints / daysElapsed) : 0} pts/dia
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 dark:bg-gray-900/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-xs opacity-80 mb-1">Tarefas</div>
                  <div className="text-lg md:text-xl font-bold">
                    {completedTasks}/{totalTasks}
                  </div>
                </div>
                <div className="bg-white/10 dark:bg-gray-900/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-xs opacity-80 mb-1">Dias Ativos</div>
                  <div className="text-lg md:text-xl font-bold">{daysElapsed}</div>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-bg-secondary dark:bg-gray-800 rounded-xl border border-border dark:border-gray-700 shadow-sm p-6">
              <Leaderboard entries={leaderboard} currentUserId={user?.userId} highlightTop={3} />
            </div>

            {/* Current User Achievements */}
            {currentUserStats && topAchievements.length > 0 && (
              <div className="bg-bg-secondary dark:bg-gray-800 rounded-xl border border-border dark:border-gray-700 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="size-5 text-yellow-500" />
                  <h3 className="text-lg font-bold text-text-primary dark:text-gray-100">Suas Conquistas</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {topAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      compact
                      showProgress={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sprint Tags */}
            <div className="bg-bg-secondary dark:bg-gray-800 rounded-xl border border-border dark:border-gray-700 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="size-5 text-purple-500" />
                <h2 className="text-lg font-bold text-text-primary dark:text-gray-100">Tags do Sprint</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {sprintTags.map((tag) => {
                  const tagTasks = tasks.filter((t) => t.tags.includes(tag.id))
                  const tagPoints = tagTasks.reduce((sum, t) => sum + t.storyPoints, 0)

                  return (
                    <div key={tag.id} className={cn("rounded-lg border px-3 py-2 flex items-center gap-2", tag.color)}>
                      <span className="text-sm font-semibold">{tag.name}</span>
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                        {tagTasks.length}
                      </Badge>
                      <span className="text-xs opacity-70">{tagPoints}pts</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Achievement Alert */}
            {progress >= 50 && (
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-100 rounded-xl p-6 text-white dark:text-gray-900 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="size-12 rounded-xl bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <Trophy className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1 text-sm md:text-base">
                      {progress === 100 ? "Sprint Completa!" : "Ótimo Progresso!"}
                    </h3>
                    <p className="text-xs md:text-sm opacity-90">
                      {progress === 100
                        ? "Parabéns! Você completou todas as tarefas da sprint!"
                        : `Você completou ${progress}% do sprint. Continue assim!`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        task={editingTask}
        onSave={handleSaveTask}
        members={members.map(m => ({ userId: m.userId, userName: m.userName }))}
      />

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}
