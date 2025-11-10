"use client"

import { useState, useMemo } from "react"
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
  Medal,
  Crown,
  Sparkles,
  Plus,
  CheckCircle,
  Circle,
  BarChart3,
} from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/Button"
import { Badge } from "@/shared/components/ui/Badge"
import { Input } from "@/shared/components/ui/Input"
import { Textarea } from "@/shared/components/ui/Textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/Dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/Select"
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"

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
}

type SprintTag = {
  id: string
  name: string
  color: string
}

type TeamMember = {
  id: string
  name: string
  avatar: string
  points: number
  tasksCompleted: number
  level: number
  badges: string[]
}

// Initial Data
const sprintTags: SprintTag[] = [
  { id: "backend", name: "Backend", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { id: "frontend", name: "Frontend", color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  { id: "bug", name: "Bug", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  { id: "feature", name: "Feature", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { id: "urgent", name: "Urgente", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  { id: "design", name: "Design", color: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
]

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Implementar autenticação JWT",
    description: "Sistema completo de auth com refresh tokens",
    storyPoints: 8,
    status: "done",
    assignee: "João Silva",
    priority: "high",
    tags: ["backend", "feature"],
  },
  {
    id: "2",
    title: "Redesign da landing page",
    description: "Nova UI com animações modernas",
    storyPoints: 13,
    status: "in-progress",
    assignee: "Maria Santos",
    priority: "urgent",
    tags: ["frontend", "design"],
  },
  {
    id: "3",
    title: "Corrigir bug de performance",
    description: "Otimizar queries do banco",
    storyPoints: 5,
    status: "done",
    assignee: "Pedro Costa",
    priority: "high",
    tags: ["backend", "bug"],
  },
  {
    id: "4",
    title: "Dashboard de analytics",
    description: "Criar dashboard com métricas",
    storyPoints: 21,
    status: "in-progress",
    assignee: "Ana Lima",
    priority: "medium",
    tags: ["frontend", "feature"],
  },
  {
    id: "5",
    title: "Testes E2E",
    description: "Implementar testes end-to-end",
    storyPoints: 8,
    status: "backlog",
    assignee: "João Silva",
    priority: "medium",
    tags: ["backend"],
  },
]

const initialTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "João Silva",
    avatar: "JS",
    points: 850,
    tasksCompleted: 12,
    level: 8,
    badges: ["🚀", "⚡", "🏆"],
  },
  {
    id: "2",
    name: "Maria Santos",
    avatar: "MS",
    points: 920,
    tasksCompleted: 15,
    level: 9,
    badges: ["👑", "✨", "🎨", "🔥"],
  },
  {
    id: "3",
    name: "Pedro Costa",
    avatar: "PC",
    points: 680,
    tasksCompleted: 9,
    level: 7,
    badges: ["💎", "⚡"],
  },
  {
    id: "4",
    name: "Ana Lima",
    avatar: "AL",
    points: 790,
    tasksCompleted: 11,
    level: 8,
    badges: ["🌟", "🎯", "💪"],
  },
]

function PriorityIcon({ priority }: { priority: Task["priority"] }) {
  const config = {
    urgent: { icon: Flame, color: "text-red-500" },
    high: { icon: Zap, color: "text-orange-500" },
    medium: { icon: TrendingUp, color: "text-yellow-500" },
    low: { icon: Circle, color: "text-blue-500" },
  }

  const Icon = config[priority].icon
  return <Icon className={cn("size-4", config[priority].color)} />
}

function TaskModal({
  open,
  onOpenChange,
  task,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
  onSave: (task: Task) => void
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
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [teamMembers] = useState<TeamMember[]>(initialTeamMembers)
  const [sprintName, setSprintName] = useState("Sprint 3 - Janeiro 2025")
  const [sprintGoal, setSprintGoal] = useState(
    "Implementar sistema de autenticação completo e redesign da interface principal com foco em UX",
  )
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()

  // Gamification Calculations
  const totalPoints = tasks.reduce((sum, t) => sum + t.storyPoints, 0)
  const completedPoints = tasks.filter((t) => t.status === "done").reduce((sum, t) => sum + t.storyPoints, 0)
  const inProgressPoints = tasks.filter((t) => t.status === "in-progress").reduce((sum, t) => sum + t.storyPoints, 0)
  const backlogPoints = tasks.filter((t) => t.status === "backlog").reduce((sum, t) => sum + t.storyPoints, 0)
  const progress = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0

  const completedTasks = tasks.filter((t) => t.status === "done").length
  const totalTasks = tasks.length

  // Sprint Days
  const sprintStart = "2025-01-20"
  const sprintEnd = "2025-02-03"
  const daysTotal = Math.ceil((new Date(sprintEnd).getTime() - new Date(sprintStart).getTime()) / (1000 * 60 * 60 * 24))
  const daysElapsed = Math.ceil((new Date().getTime() - new Date(sprintStart).getTime()) / (1000 * 60 * 60 * 24))
  const daysRemaining = daysTotal - daysElapsed > 0 ? daysTotal - daysElapsed : 0

  // Team Stats
  const teamTotalPoints = teamMembers.reduce((sum, m) => sum + m.points, 0)
  const sortedTeam = [...teamMembers].sort((a, b) => b.points - a.points)

  // Task by status
  const tasksByStatus = useMemo(() => {
    return {
      backlog: tasks.filter((t) => t.status === "backlog"),
      inProgress: tasks.filter((t) => t.status === "in-progress"),
      done: tasks.filter((t) => t.status === "done"),
    }
  }, [tasks])

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
          return { ...t, status: nextStatus[t.status] }
        }
        return t
      }),
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Header com Sprint Info */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between w-full">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Target className="size-6 text-slate-700 dark:text-slate-200" />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={sprintName}
                        onChange={(e) => setSprintName(e.target.value)}
                        className="text-2xl font-bold text-gray-900 dark:text-gray-100 bg-transparent border-none outline-none"
                      />
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="size-4" />
                          {new Date(sprintStart).toLocaleDateString("pt-BR")} - {new Date(sprintEnd).toLocaleDateString("pt-BR")}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-4" />
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
                  className="h-9"
                >
                  <Plus className="size-4 mr-2" />
                  Nova Tarefa
                </Button>
              </div>
              <div className="mt-3">
                <Textarea
                  value={sprintGoal}
                  onChange={(e) => setSprintGoal(e.target.value)}
                  rows={2}
                  className="w-full bg-transparent border border-gray-200 dark:border-slate-800 rounded-lg p-3 outline-none resize-none text-gray-700 dark:text-gray-200"
                  placeholder="Meta do sprint..."
                />
              </div>
            </CardHeader>
          </Card>

          {/* Progress Bar */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Trophy className="size-5 text-yellow-500" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Progresso do Sprint</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-bold text-gray-900 dark:text-gray-100">{completedPoints}</span> / {totalPoints}{" "}
                pontos ({progress}%)
              </div>
            </div>
            <div className="relative w-full h-4 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 transition-all duration-500 shadow-lg"
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
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="size-5 text-slate-600 dark:text-slate-200" />
                    <Badge className="bg-muted/5 text-muted px-2 py-0.5">Total</Badge>
                  </div>
                  <div className="text-3xl font-bold mb-1 text-gray-900 dark:text-gray-100">{totalPoints}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Story Points</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="size-5 text-slate-600 dark:text-slate-200" />
                    <Badge className="bg-muted/5 text-muted px-2 py-0.5">{progress}%</Badge>
                  </div>
                  <div className="text-3xl font-bold mb-1 text-gray-900 dark:text-gray-100">{completedPoints}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Concluídos</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="size-5 text-slate-600 dark:text-slate-200" />
                    <Badge className="bg-muted/5 text-muted px-2 py-0.5">Ativo</Badge>
                  </div>
                  <div className="text-3xl font-bold mb-1 text-gray-900 dark:text-gray-100">{inProgressPoints}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Em Progresso</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <Target className="size-5 text-slate-600 dark:text-slate-200" />
                    <Badge className="bg-muted/5 text-muted px-2 py-0.5">Meta</Badge>
                  </div>
                  <div className="text-3xl font-bold mb-1 text-gray-900 dark:text-gray-100">{backlogPoints}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Backlog</div>
                </CardContent>
              </Card>
            </div>

            {/* Tasks List */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Sparkles className="size-5 text-purple-500" />
                  Tarefas do Sprint
                </h2>
                <div className="flex items-center gap-2">
                  {sprintTags.slice(0, 4).map((tag) => (
                    <Badge key={tag.id} variant="outline" className={cn("text-xs", tag.color)}>
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
                        "rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden",
                        config.bg,
                      )}
                    >
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={cn("size-4", config.color)} />
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{config.label}</span>
                          <Badge variant="secondary" className="h-5 px-2 text-xs">
                            {statusTasks.length}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {statusTasks.reduce((sum, t) => sum + t.storyPoints, 0)} pts
                        </div>
                      </div>
                      <div className="p-2 space-y-2">
                        {statusTasks.map((task) => {
                          const taskTag = sprintTags.find((t) => task.tags.includes(t.id))

                          return (
                            <div
                              key={task.id}
                              className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-3 hover:shadow-md transition-all cursor-pointer group"
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
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                      {task.title}
                                    </h3>
                                    <PriorityIcon priority={task.priority} />
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 ml-7">
                                    {task.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {taskTag && (
                                    <Badge variant="outline" className={cn("text-[10px] px-2 h-5", taskTag.color)}>
                                      {taskTag.name}
                                    </Badge>
                                  )}
                                  <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 px-2 h-6">
                                    <Award className="size-3 mr-1" />
                                    {task.storyPoints}
                                  </Badge>
                                  {task.assignee && (
                                    <div
                                      className="size-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
                                      title={task.assignee}
                                    >
                                      {task.assignee
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
                        })}
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
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <TrendingUp className="size-6" />
                </div>
                <div>
                  <div className="text-sm opacity-80">Velocidade do Time</div>
                  <div className="text-3xl font-bold">
                    {daysElapsed > 0 ? Math.round(completedPoints / daysElapsed) : 0} pts/dia
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-xs opacity-80 mb-1">Tarefas</div>
                  <div className="text-xl font-bold">
                    {completedTasks}/{totalTasks}
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-xs opacity-80 mb-1">Dias Ativos</div>
                  <div className="text-xl font-bold">{daysElapsed}</div>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Crown className="size-5 text-yellow-500" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Leaderboard</h2>
              </div>

              <div className="space-y-3">
                {sortedTeam.map((member, index) => {
                  const rankColors = [
                    "from-yellow-500 to-amber-500",
                    "from-gray-400 to-gray-500",
                    "from-amber-600 to-orange-700",
                  ]
                  const rankColor = rankColors[index] || "from-gray-300 to-gray-400"

                  return (
                    <div
                      key={member.id}
                      className={cn(
                        "rounded-xl border p-4 transition-all hover:shadow-md",
                        index === 0
                          ? "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800/30"
                          : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "size-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold shadow-sm",
                            rankColor,
                          )}
                        >
                          {index < 3 ? <Medal className="size-5" /> : <span className="text-sm">#{index + 1}</span>}
                        </div>
                        <div
                          className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm"
                          title={member.name}
                        >
                          {member.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {member.name}
                            </h3>
                            <Badge
                              variant="outline"
                              className="h-5 px-1.5 text-xs bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800"
                            >
                              Lvl {member.level}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Star className="size-3 text-yellow-500" />
                              {member.points} pts
                            </span>
                            <span>•</span>
                            <span>{member.tasksCompleted} tarefas</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {member.badges.map((badge, i) => (
                            <span key={i} className="text-lg">
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Sprint Tags */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="size-5 text-purple-500" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Tags do Sprint</h2>
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
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-start gap-3">
                <div className="size-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <Trophy className="size-6" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Meta Atingida!</h3>
                  <p className="text-sm opacity-90">Você completou {progress}% do sprint. Continue assim!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal open={taskModalOpen} onOpenChange={setTaskModalOpen} task={editingTask} onSave={handleSaveTask} />

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
