"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import {
  Plus,
  MoreHorizontal,
  CalendarIcon,
  MessageSquare,
  CheckCircle,
  Grid3x3,
  List,
  X,
  GripVertical,
  Archive,
  Edit,
  Trash2,
  Send,
} from "lucide-react"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/Button"
import { Input } from "@/shared/components/ui/Input"
import { Textarea } from "@/shared/components/ui/Textarea"
import { Badge } from "@/shared/components/ui/Badge"
import { Checkbox } from "@/shared/components/ui/Checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/Dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/Select"
import teamService from "@/core/services/team.service"
import type { WorkspaceMember } from "@/core/types/team.types"

// Types
type Status = { id: string; name: string; color: string; icon: React.FC }
type Label = { id: string; name: string; color: string }
type User = { id: string; name: string; email: string; avatar?: string }
type Progress = { completed: number; total: number }

interface Comment {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

type Task = {
  id: string
  title: string
  description: string
  status: Status
  date?: string
  comments: Comment[]
  progress: Progress
  assignees: User[]
  labels: Label[]
  priority: "urgent" | "high" | "medium" | "low" | "none"
  archived?: boolean
}

// Status Icons
const BacklogIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle
      cx="7"
      cy="7"
      r="6"
      fill="none"
      stroke="#53565A"
      strokeWidth="2"
      strokeDasharray="1.4 1.74"
      strokeDashoffset="0.65"
    ></circle>
    <circle
      className="progress"
      cx="7"
      cy="7"
      r="2"
      fill="none"
      stroke="#53565A"
      strokeWidth="4"
      strokeDasharray="0 100"
      strokeDashoffset="0"
      transform="rotate(-90 7 7)"
    ></circle>
  </svg>
)

const ToDoIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle
      cx="7"
      cy="7"
      r="6"
      fill="none"
      stroke="#53565A"
      strokeWidth="2"
      strokeDasharray="3.14 0"
      strokeDashoffset="-0.7"
    ></circle>
    <circle
      className="progress"
      cx="7"
      cy="7"
      r="2"
      fill="none"
      stroke="#53565A"
      strokeWidth="4"
      strokeDasharray="0 100"
      strokeDashoffset="0"
      transform="rotate(-90 7 7)"
    ></circle>
  </svg>
)

const InProgressIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle
      cx="7"
      cy="7"
      r="6"
      fill="none"
      stroke="#facc15"
      strokeWidth="2"
      strokeDasharray="3.14 0"
      strokeDashoffset="-0.7"
    ></circle>
    <circle
      className="progress"
      cx="7"
      cy="7"
      r="2"
      fill="none"
      stroke="#facc15"
      strokeWidth="4"
      strokeDasharray="2.0839 100"
      strokeDashoffset="0"
      transform="rotate(-90 7 7)"
    ></circle>
  </svg>
)

const ReviewIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle
      cx="7"
      cy="7"
      r="6"
      fill="none"
      stroke="#22c55e"
      strokeWidth="2"
      strokeDasharray="3.14 0"
      strokeDashoffset="-0.7"
    ></circle>
    <circle
      className="progress"
      cx="7"
      cy="7"
      r="2"
      fill="none"
      stroke="#22c55e"
      strokeWidth="4"
      strokeDasharray="4.1678 100"
      strokeDashoffset="0"
      transform="rotate(-90 7 7)"
    ></circle>
  </svg>
)

const CompletedIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle
      cx="7"
      cy="7"
      r="6"
      fill="none"
      stroke="#8b5cf6"
      strokeWidth="2"
      strokeDasharray="3.14 0"
      strokeDashoffset="-0.7"
    ></circle>
    <path d="M4.5 7L6.5 9L9.5 5" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const STATUSES: Status[] = [
  { id: "backlog", name: "Backlog", color: "#53565A", icon: BacklogIcon },
  { id: "to-do", name: "A Fazer", color: "#53565A", icon: ToDoIcon },
  { id: "in-progress", name: "Em Progresso", color: "#facc15", icon: InProgressIcon },
  { id: "technical-review", name: "Revisão Técnica", color: "#22c55e", icon: ReviewIcon },
  { id: "completed", name: "Concluído", color: "#8b5cf6", icon: CompletedIcon },
]

const labels: Label[] = [
  { id: "design", name: "Design", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  { id: "product", name: "Produto", color: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
  { id: "marketing", name: "Marketing", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  { id: "new", name: "Novo", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { id: "bug", name: "Bug", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  { id: "feature", name: "Funcionalidade", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
]

const tasksSeed: Task[] = [
  {
    id: "t1",
    title: "Redesign do app mobile",
    description: "Redesign completo da aplicação mobile para melhor UX",
    status: STATUSES[0],
    date: "2025-02-10",
    comments: [],
    progress: { completed: 0, total: 0 },
    assignees: [],
    labels: [labels[0]],
    priority: "high",
  },
  {
    id: "t2",
    title: "Atualização do design system",
    description: "Melhorar design system para consistência e usabilidade",
    status: STATUSES[1],
    date: "2025-01-25",
    comments: [],
    progress: { completed: 1, total: 4 },
    assignees: [],
    labels: [labels[0], labels[3]],
    priority: "urgent",
  },
]

function Avatar({ user }: { user: User }) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-orange-500"]
  const colorIndex = user.id.charCodeAt(user.id.length - 1) % colors.length

  return (
    <div
      className={cn(
        "size-6 border-2 border-white dark:border-slate-900 rounded-full text-[10px] font-semibold flex items-center justify-center text-white",
        colors[colorIndex],
      )}
      title={`${user.name} (${user.email})`}
    >
      {initials}
    </div>
  )
}

function PriorityBadge({ priority }: { priority: Task["priority"] }) {
  const config = {
    urgent: { label: "Urgente", className: "bg-red-500/10 text-red-500 border-red-500/20" },
    high: { label: "Alta", className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
    medium: { label: "Média", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
    low: { label: "Baixa", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    none: { label: "Nenhuma", className: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
  }

  if (priority === "none") return null

  return (
    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5", config[priority].className)}>
      {config[priority].label}
    </Badge>
  )
}

function CommentsModal({
  task,
  open,
  onOpenChange,
  onAddComment,
}: {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddComment: (taskId: string, content: string) => void
}) {
  const [newComment, setNewComment] = useState("")

  const handleSubmit = () => {
    if (!newComment.trim()) return
    onAddComment(task.id, newComment)
    setNewComment("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Comentários - {task.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[500px] overflow-y-auto">
          {task.comments.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Nenhum comentário ainda</p>
          ) : (
            task.comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 dark:border-slate-800 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{comment.userName}</span>
                  <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString('pt-BR')}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escreva seu comentário..."
            rows={3}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleSubmit()
              }
            }}
          />
          <Button onClick={handleSubmit} disabled={!newComment.trim()} className="self-end">
            <Send className="size-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500">Ctrl + Enter para enviar</p>
      </DialogContent>
    </Dialog>
  )
}

function TaskCard({
  task,
  onEdit,
  onArchive,
  onDelete,
  onOpenComments,
  selected,
  onSelect,
  viewMode,
  onDragStart,
}: {
  task: Task
  onEdit: (task: Task) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  onOpenComments: (task: Task) => void
  selected: boolean
  onSelect: (id: string) => void
  viewMode: "board" | "list"
  onDragStart: (task: Task) => void
}) {
  const StatusIcon = task.status.icon
  const hasProgress = task.progress.total > 0
  const isCompleted = hasProgress && task.progress.completed === task.progress.total
  const [showActions, setShowActions] = useState(false)

  if (viewMode === "list") {
    return (
      <div
        draggable
        onDragStart={() => onDragStart(task)}
        className={cn(
          "bg-white dark:bg-slate-900 rounded-lg border transition-all hover:shadow-md cursor-move",
          selected ? "border-blue-500 dark:border-blue-600" : "border-gray-200 dark:border-slate-800",
        )}
      >
        <div className="px-4 py-3 flex items-center gap-4">
          <Checkbox checked={selected} onCheckedChange={() => onSelect(task.id)} />
          <GripVertical className="size-4 text-gray-400 cursor-grab" />
          <div className="size-5 shrink-0 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-sm p-1">
            <StatusIcon />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-medium truncate">{task.title}</h3>
              <PriorityBadge priority={task.priority} />
              {isCompleted && <CheckCircle className="size-4 shrink-0 text-green-500" />}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{task.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {task.labels.slice(0, 2).map((label) => (
              <Badge key={label.id} variant="outline" className={cn("text-[10px] px-2 py-0 h-5", label.color)}>
                {label.name}
              </Badge>
            ))}
            {task.labels.length > 2 && (
              <Badge variant="outline" className="text-[10px] px-2 py-0 h-5">
                +{task.labels.length - 2}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
            {task.date && (
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="size-3" />
                <span>{new Date(task.date).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenComments(task)
              }}
              className="flex items-center gap-1.5 hover:text-blue-500"
            >
              <MessageSquare className="size-3" />
              <span>{task.comments.length}</span>
            </button>
            {hasProgress && (
              <div className="flex items-center gap-1.5">
                <span>
                  {task.progress.completed}/{task.progress.total}
                </span>
              </div>
            )}
          </div>
          {task.assignees.length > 0 && (
            <div className="flex -space-x-2">
              {task.assignees.slice(0, 3).map((u) => (
                <Avatar key={u.id} user={u} />
              ))}
              {task.assignees.length > 3 && (
                <div className="size-6 border-2 border-white dark:border-slate-900 rounded-full bg-gray-300 dark:bg-slate-700 text-[10px] flex items-center justify-center">
                  +{task.assignees.length - 3}
                </div>
              )}
            </div>
          )}
          <div className="relative">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowActions(!showActions)}>
              <MoreHorizontal className="size-4" />
            </Button>
            {showActions && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    onEdit(task)
                    setShowActions(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Edit className="size-3" /> Editar
                </button>
                <button
                  onClick={() => {
                    onArchive(task.id)
                    setShowActions(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Archive className="size-3" /> Arquivar
                </button>
                <button
                  onClick={() => {
                    onDelete(task.id)
                    setShowActions(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center gap-2 text-red-500"
                >
                  <Trash2 className="size-3" /> Deletar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      draggable
      onDragStart={() => onDragStart(task)}
      className={cn(
        "bg-white dark:bg-slate-900 shrink-0 rounded-lg overflow-hidden border transition-all hover:shadow-md cursor-move group",
        selected ? "border-blue-500 dark:border-blue-600" : "border-gray-200 dark:border-slate-800",
      )}
      onClick={() => onEdit(task)}
    >
      <div className="px-3 py-2.5">
        <div className="flex items-start gap-2 mb-2">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onSelect(task.id)}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5"
          />
          <GripVertical className="size-4 text-gray-400 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
          <div className="size-5 mt-0.5 shrink-0 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-sm p-1">
            <StatusIcon />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-medium leading-tight flex-1">{task.title}</h3>
              {isCompleted && <CheckCircle className="size-4 shrink-0 text-green-500" />}
            </div>
            <PriorityBadge priority={task.priority} />
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation()
                setShowActions(!showActions)
              }}
            >
              <MoreHorizontal className="size-4" />
            </Button>
            {showActions && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-lg z-10">
                <button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation()
                    onEdit(task)
                    setShowActions(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Edit className="size-3" /> Editar
                </button>
                <button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation()
                    onArchive(task.id)
                    setShowActions(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Archive className="size-3" /> Arquivar
                </button>
                <button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation()
                    onDelete(task.id)
                    setShowActions(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center gap-2 text-red-500"
                >
                  <Trash2 className="size-3" /> Deletar
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{task.description}</p>
        {task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {task.labels.map((label) => (
              <Badge key={label.id} variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5", label.color)}>
                {label.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="px-3 py-2.5 border-t border-dashed border-gray-200 dark:border-slate-800">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 flex-wrap">
            {task.date && (
              <div className="flex items-center gap-1.5 border border-gray-200 dark:border-slate-800 rounded-sm py-1 px-2">
                <CalendarIcon className="size-3" />
                <span>{new Date(task.date).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenComments(task)
              }}
              className="flex items-center gap-1.5 border border-gray-200 dark:border-slate-800 rounded-sm py-1 px-2 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <MessageSquare className="size-3" />
              <span>{task.comments.length}</span>
            </button>
            {hasProgress && (
              <div className="flex items-center gap-1.5 border border-gray-200 dark:border-slate-800 rounded-sm py-1 px-2">
                {isCompleted ? (
                  <CheckCircle className="size-3 text-green-500" />
                ) : (
                  <div className="size-3">
                    <CircularProgressbar
                      value={(task.progress.completed / task.progress.total) * 100}
                      strokeWidth={12}
                      styles={buildStyles({ pathColor: "#10b981", trailColor: "#EDEDED", strokeLinecap: "round" })}
                    />
                  </div>
                )}
                <span>
                  {task.progress.completed}/{task.progress.total}
                </span>
              </div>
            )}
          </div>
          {task.assignees.length > 0 && (
            <div className="flex -space-x-2">
              {task.assignees.map((u) => (
                <Avatar key={u.id} user={u} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TaskColumn({
  status,
  tasks,
  onEdit,
  onArchive,
  onDelete,
  onOpenComments,
  selectedTasks,
  onSelect,
  onDrop,
  onDragStart,
  onAddTask,
}: {
  status: Status
  tasks: Task[]
  onEdit: (task: Task) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  onOpenComments: (task: Task) => void
  selectedTasks: Set<string>
  onSelect: (id: string) => void
  onDrop: (statusId: string) => void
  onDragStart: (task: Task) => void
  onAddTask: (statusId: string) => void
}) {
  const StatusIcon = status.icon
  const [isDragOver, setIsDragOver] = useState(false)

  return (
    <div className="shrink-0 w-[300px] lg:w-[360px] flex flex-col h-full">
      <div
        onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault()
          setIsDragOver(false)
          onDrop(status.id)
        }}
        className={cn(
          "rounded-lg border p-3 bg-gray-50/60 dark:bg-slate-900/40 flex flex-col max-h-full transition-colors",
          isDragOver ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20" : "border-gray-200 dark:border-slate-800",
        )}
      >
        <div className="flex items-center justify-between mb-3 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="size-4 flex items-center justify-center">
              <StatusIcon />
            </div>
            <span className="text-sm font-semibold">{status.name}</span>
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {tasks.length}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onAddTask(status.id)}>
            <Plus className="size-4" />
          </Button>
        </div>
        <div className="flex flex-col gap-3 overflow-y-auto h-full pr-1">
          {tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onEdit={onEdit}
              onArchive={onArchive}
              onDelete={onDelete}
              onOpenComments={onOpenComments}
              selected={selectedTasks.has(t.id)}
              onSelect={onSelect}
              viewMode="board"
              onDragStart={onDragStart}
            />
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="justify-start h-auto py-2 text-xs text-gray-600 dark:text-gray-400"
            onClick={() => onAddTask(status.id)}
          >
            <Plus className="size-4 mr-2" />
            Adicionar tarefa
          </Button>
        </div>
      </div>
    </div>
  )
}

function TaskModal({
  task,
  open,
  onOpenChange,
  onSave,
  defaultStatus,
  availableUsers,
  availableLabels,
}: {
  task?: Task
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (task: Partial<Task>) => void
  defaultStatus?: Status
  availableUsers: User[]
  availableLabels: Label[]
}) {
  const [formData, setFormData] = useState<Partial<Task>>(
    task || {
      title: "",
      description: "",
      status: defaultStatus || STATUSES[0],
      priority: "medium",
      labels: [],
      assignees: [],
      progress: { completed: 0, total: 0 },
      comments: [],
    },
  )

  const handleSave = () => {
    if (!formData.title?.trim()) return
    onSave(formData)
    onOpenChange(false)
  }

  const toggleLabel = (label: Label) => {
    const currentLabels = formData.labels || []
    const hasLabel = currentLabels.some((l) => l.id === label.id)

    if (hasLabel) {
      setFormData({ ...formData, labels: currentLabels.filter((l) => l.id !== label.id) })
    } else {
      setFormData({ ...formData, labels: [...currentLabels, label] })
    }
  }

  const toggleAssignee = (user: User) => {
    const currentAssignees = formData.assignees || []
    const hasUser = currentAssignees.some((u) => u.id === user.id)

    if (hasUser) {
      setFormData({ ...formData, assignees: currentAssignees.filter((u) => u.id !== user.id) })
    } else {
      setFormData({ ...formData, assignees: [...currentAssignees, user] })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Título</label>
            <Input
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Digite o título da tarefa..."
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Descrição</label>
            <Textarea
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Digite a descrição da tarefa..."
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={formData.status?.id}
                onValueChange={(value) => setFormData({ ...formData, status: STATUSES.find((s) => s.id === value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Prioridade</label>
              <Select
                value={formData.priority}
                onValueChange={(value: Task["priority"]) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="none">Nenhuma</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Data de Vencimento</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Progresso</label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                value={formData.progress?.completed || 0}
                onChange={(e) => setFormData({
                  ...formData,
                  progress: {
                    ...formData.progress || { completed: 0, total: 0 },
                    completed: parseInt(e.target.value) || 0
                  }
                })}
                placeholder="Concluído"
                className="flex-1"
              />
              <span className="flex items-center">/</span>
              <Input
                type="number"
                min="0"
                value={formData.progress?.total || 0}
                onChange={(e) => setFormData({
                  ...formData,
                  progress: {
                    ...formData.progress || { completed: 0, total: 0 },
                    total: parseInt(e.target.value) || 0
                  }
                })}
                placeholder="Total"
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Responsáveis</label>
            <div className="flex flex-wrap gap-2">
              {availableUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => toggleAssignee(user)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-colors",
                    formData.assignees?.some((u) => u.id === user.id)
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700"
                  )}
                >
                  {user.name}
                </button>
              ))}
              {availableUsers.length === 0 && (
                <p className="text-sm text-gray-500">Nenhum membro disponível</p>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableLabels.map((label) => (
                <button
                  key={label.id}
                  onClick={() => toggleLabel(label)}
                  className={cn(
                    "px-2.5 py-1 rounded-md border text-xs font-semibold transition-colors",
                    formData.labels?.some((l) => l.id === label.id)
                      ? label.color
                      : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700"
                  )}
                >
                  {label.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!formData.title?.trim()}>
            Salvar Tarefa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface KanbanBoardProps {
  groupId?: string
  pageId?: string
}

export default function KanbanBoard({ groupId, pageId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(tasksSeed)
  const [viewMode, setViewMode] = useState<"board" | "list">("board")
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [commentsModalOpen, setCommentsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [commentingTask, setCommentingTask] = useState<Task | undefined>()
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<Status | undefined>()
  const [groupMembers, setGroupMembers] = useState<User[]>([])

  useEffect(() => {
    // Carregar membros do grupo
    const loadGroupMembers = async () => {
      if (!groupId) return

      try {
        // Aqui você precisará ajustar de acordo com sua API
        // Por enquanto, vamos deixar vazio
        setGroupMembers([])
      } catch (error) {
        console.error("Erro ao carregar membros do grupo:", error)
      }
    }

    loadGroupMembers()
  }, [groupId])

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => !task.archived)
  }, [tasks])

  const tasksByStatus = useMemo(() => {
    const map: Record<string, Task[]> = {}
    for (const s of STATUSES) map[s.id] = []
    for (const t of filteredTasks) {
      map[t.status.id] = map[t.status.id] || []
      map[t.status.id].push(t)
    }
    return map
  }, [filteredTasks])

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setDefaultStatus(undefined)
    setTaskModalOpen(true)
  }

  const handleOpenComments = (task: Task) => {
    setCommentingTask(task)
    setCommentsModalOpen(true)
  }

  const handleAddComment = (taskId: string, content: string) => {
    const newComment: Comment = {
      id: `c${Date.now()}`,
      userId: "current-user",
      userName: "Usuário Atual",
      content,
      createdAt: new Date().toISOString(),
    }

    setTasks(tasks.map((t) =>
      t.id === taskId
        ? { ...t, comments: [...t.comments, newComment] }
        : t
    ))

    // Atualizar também a tarefa que está sendo comentada
    if (commentingTask && commentingTask.id === taskId) {
      setCommentingTask({
        ...commentingTask,
        comments: [...commentingTask.comments, newComment]
      })
    }
  }

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      setTasks(tasks.map((t) => (t.id === editingTask.id ? { ...t, ...taskData } : t)))
    } else {
      const newTask: Task = {
        id: `t${Date.now()}`,
        title: taskData.title || "",
        description: taskData.description || "",
        status: taskData.status || STATUSES[0],
        priority: taskData.priority || "medium",
        labels: taskData.labels || [],
        assignees: taskData.assignees || [],
        progress: taskData.progress || { completed: 0, total: 0 },
        comments: [],
        date: taskData.date,
      }
      setTasks([...tasks, newTask])
    }
    setEditingTask(undefined)
    setDefaultStatus(undefined)
  }

  const handleArchiveTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, archived: true } : t)))
  }

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  const handleSelectTask = (id: string) => {
    const newSelected = new Set(selectedTasks)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedTasks(newSelected)
  }

  const handleBulkArchive = () => {
    setTasks(tasks.map((t) => (selectedTasks.has(t.id) ? { ...t, archived: true } : t)))
    setSelectedTasks(new Set())
  }

  const handleBulkDelete = () => {
    setTasks(tasks.filter((t) => !selectedTasks.has(t.id)))
    setSelectedTasks(new Set())
  }

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDrop = (statusId: string) => {
    if (!draggedTask) return

    const newStatus = STATUSES.find((s) => s.id === statusId)
    if (!newStatus) return

    setTasks(tasks.map((t) => (t.id === draggedTask.id ? { ...t, status: newStatus } : t)))
    setDraggedTask(null)
  }

  const handleAddTask = (statusId: string) => {
    const status = STATUSES.find((s) => s.id === statusId)
    setDefaultStatus(status)
    setEditingTask(undefined)
    setTaskModalOpen(true)
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-slate-950">
        <div className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Quadro Kanban</h1>

            <div className="flex items-center gap-2">
              <div className="flex items-center border border-gray-200 dark:border-slate-800 rounded-lg p-1">
                <Button
                  variant={viewMode === "board" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-3"
                  onClick={() => setViewMode("board")}
                >
                  <Grid3x3 className="size-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-3"
                  onClick={() => setViewMode("list")}
                >
                  <List className="size-4" />
                </Button>
              </div>

              <Button
                size="sm"
                className="h-9"
                onClick={() => {
                  setEditingTask(undefined)
                  setDefaultStatus(undefined)
                  setTaskModalOpen(true)
                }}
              >
                <Plus className="size-4 mr-2" />
                Nova Tarefa
              </Button>
            </div>
          </div>

          {selectedTasks.size > 0 && (
            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2 mt-3">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {selectedTasks.size} tarefa{selectedTasks.size > 1 ? "s" : ""} selecionada
                {selectedTasks.size > 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleBulkArchive}>
                  <Archive className="size-3 mr-2" />
                  Arquivar
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="size-3 mr-2" />
                  Deletar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedTasks(new Set())}>
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 h-[calc(100%-80px)] overflow-auto">
          {viewMode === "board" ? (
            <div className="flex gap-4 h-full pb-4">
              {STATUSES.map((status) => (
                <TaskColumn
                  key={status.id}
                  status={status}
                  tasks={tasksByStatus[status.id] || []}
                  onEdit={handleEditTask}
                  onArchive={handleArchiveTask}
                  onDelete={handleDeleteTask}
                  onOpenComments={handleOpenComments}
                  selectedTasks={selectedTasks}
                  onSelect={handleSelectTask}
                  onDrop={handleDrop}
                  onDragStart={handleDragStart}
                  onAddTask={handleAddTask}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onArchive={handleArchiveTask}
                  onDelete={handleDeleteTask}
                  onOpenComments={handleOpenComments}
                  selected={selectedTasks.has(task.id)}
                  onSelect={handleSelectTask}
                  viewMode="list"
                  onDragStart={handleDragStart}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <TaskModal
        task={editingTask}
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        onSave={handleSaveTask}
        defaultStatus={defaultStatus}
        availableUsers={groupMembers}
        availableLabels={labels}
      />

      {commentingTask && (
        <CommentsModal
          task={commentingTask}
          open={commentsModalOpen}
          onOpenChange={setCommentsModalOpen}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  )
}
