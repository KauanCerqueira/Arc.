"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import {
  Plus,
  MoreVertical,
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
  Search,
  Filter,
  Download,
  Users,
  Clock,
  Tag,
  TrendingUp,
  BarChart3,
  CheckSquare,
  Circle,
  AlertCircle,
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
      stroke="#737373"
      strokeWidth="2"
      strokeDasharray="1.4 1.74"
      strokeDashoffset="0.65"
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
      stroke="#737373"
      strokeWidth="2"
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
      stroke="#f59e0b"
      strokeWidth="2"
    ></circle>
    <circle
      className="progress"
      cx="7"
      cy="7"
      r="2"
      fill="none"
      stroke="#f59e0b"
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
      stroke="#3b82f6"
      strokeWidth="2"
    ></circle>
    <circle
      className="progress"
      cx="7"
      cy="7"
      r="2"
      fill="none"
      stroke="#3b82f6"
      strokeWidth="4"
      strokeDasharray="4.1678 100"
      strokeDashoffset="0"
      transform="rotate(-90 7 7)"
    ></circle>
  </svg>
)

const CompletedIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" fill="none" stroke="#22c55e" strokeWidth="2"></circle>
    <path d="M4.5 7L6.5 9L9.5 5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const STATUSES: Status[] = [
  { id: "backlog", name: "Backlog", color: "#737373", icon: BacklogIcon },
  { id: "to-do", name: "A Fazer", color: "#737373", icon: ToDoIcon },
  { id: "in-progress", name: "Em Progresso", color: "#f59e0b", icon: InProgressIcon },
  { id: "review", name: "Revisão", color: "#3b82f6", icon: ReviewIcon },
  { id: "completed", name: "Concluído", color: "#22c55e", icon: CompletedIcon },
]

const labels: Label[] = [
  { id: "design", name: "Design", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800" },
  { id: "product", name: "Produto", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-800" },
  { id: "marketing", name: "Marketing", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800" },
  { id: "new", name: "Novo", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  { id: "bug", name: "Bug", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800" },
  { id: "feature", name: "Funcionalidade", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
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
        "size-6 border-2 border-white dark:border-neutral-900 rounded-full text-[10px] font-semibold flex items-center justify-center text-white",
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
    urgent: { label: "Urgente", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800" },
    high: { label: "Alta", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800" },
    medium: { label: "Média", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800" },
    low: { label: "Baixa", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
    none: { label: "Nenhuma", className: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700" },
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
      <DialogContent className="max-w-2xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-neutral-900 dark:text-white">Comentários - {task.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[500px] overflow-y-auto">
          {task.comments.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-8">Nenhum comentário ainda</p>
          ) : (
            task.comments.map((comment) => (
              <div key={comment.id} className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">{comment.userName}</span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">{new Date(comment.createdAt).toLocaleString('pt-BR')}</span>
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">{comment.content}</p>
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
            className="flex-1 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleSubmit()
              }
            }}
          />
          <Button onClick={handleSubmit} disabled={!newComment.trim()} className="self-end bg-neutral-900 dark:bg-neutral-700 hover:bg-neutral-800 dark:hover:bg-neutral-600">
            <Send className="size-4" />
          </Button>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Ctrl + Enter para enviar</p>
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
  menuOpenId,
  setMenuOpenId,
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
  menuOpenId: string | null
  setMenuOpenId: (id: string | null) => void
}) {
  const StatusIcon = task.status.icon
  const hasProgress = task.progress.total > 0
  const isCompleted = hasProgress && task.progress.completed === task.progress.total

  if (viewMode === "list") {
    return (
      <div
        draggable
        onDragStart={() => onDragStart(task)}
        className={cn(
          "bg-white dark:bg-neutral-900 rounded-lg border transition-all hover:border-neutral-400 dark:hover:border-neutral-600 cursor-move",
          selected ? "border-neutral-900 dark:border-neutral-100" : "border-neutral-200 dark:border-neutral-800",
        )}
      >
        <div className="px-4 py-3 flex items-center gap-4">
          <Checkbox checked={selected} onCheckedChange={() => onSelect(task.id)} />
          <GripVertical className="size-4 text-neutral-400 cursor-grab" />
          <div className="size-5 shrink-0 flex items-center justify-center">
            <StatusIcon />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-medium truncate text-neutral-900 dark:text-white">{task.title}</h3>
              <PriorityBadge priority={task.priority} />
              {isCompleted && <CheckCircle className="size-4 shrink-0 text-green-500" />}
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">{task.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {task.labels.slice(0, 2).map((label) => (
              <Badge key={label.id} variant="outline" className={cn("text-[10px] px-2 py-0 h-5", label.color)}>
                {label.name}
              </Badge>
            ))}
            {task.labels.length > 2 && (
              <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                +{task.labels.length - 2}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
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
              className="flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-white"
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
                <div className="size-6 border-2 border-white dark:border-neutral-900 rounded-full bg-neutral-300 dark:bg-neutral-700 text-[10px] flex items-center justify-center">
                  +{task.assignees.length - 3}
                </div>
              )}
            </div>
          )}
          <div className="relative">
            <button
              onClick={() => setMenuOpenId(menuOpenId === task.id ? null : task.id)}
              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
            >
              <MoreVertical className="size-4" />
            </button>
            {menuOpenId === task.id && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg z-10">
                <button
                  onClick={() => {
                    onEdit(task)
                    setMenuOpenId(null)
                  }}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                >
                  <Edit className="size-3" /> Editar
                </button>
                <button
                  onClick={() => {
                    onArchive(task.id)
                    setMenuOpenId(null)
                  }}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                >
                  <Archive className="size-3" /> Arquivar
                </button>
                <button
                  onClick={() => {
                    onDelete(task.id)
                    setMenuOpenId(null)
                  }}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-red-600"
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
        "bg-white dark:bg-neutral-900 shrink-0 rounded-lg overflow-hidden border transition-all hover:shadow-md cursor-move group",
        selected ? "border-neutral-900 dark:border-neutral-100" : "border-neutral-200 dark:border-neutral-800",
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
          <GripVertical className="size-4 text-neutral-400 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
          <div className="size-5 mt-0.5 shrink-0 flex items-center justify-center">
            <StatusIcon />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-medium leading-tight flex-1 text-neutral-900 dark:text-white">{task.title}</h3>
              {isCompleted && <CheckCircle className="size-4 shrink-0 text-green-500" />}
            </div>
            <PriorityBadge priority={task.priority} />
          </div>
          <div className="relative">
            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation()
                setMenuOpenId(menuOpenId === task.id ? null : task.id)
              }}
              className="p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <MoreVertical className="size-4 text-neutral-600 dark:text-neutral-300" />
            </button>
            {menuOpenId === task.id && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg z-10">
                <button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation()
                    onEdit(task)
                    setMenuOpenId(null)
                  }}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                >
                  <Edit className="size-3" /> Editar
                </button>
                <button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation()
                    onArchive(task.id)
                    setMenuOpenId(null)
                  }}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                >
                  <Archive className="size-3" /> Arquivar
                </button>
                <button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation()
                    onDelete(task.id)
                    setMenuOpenId(null)
                  }}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-red-600"
                >
                  <Trash2 className="size-3" /> Deletar
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">{task.description}</p>
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
      <div className="px-3 py-2.5 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 flex-wrap">
            {task.date && (
              <div className="flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-800 rounded py-1 px-2">
                <CalendarIcon className="size-3" />
                <span>{new Date(task.date).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenComments(task)
              }}
              className="flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-800 rounded py-1 px-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <MessageSquare className="size-3" />
              <span>{task.comments.length}</span>
            </button>
            {hasProgress && (
              <div className="flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-800 rounded py-1 px-2">
                {isCompleted ? (
                  <CheckCircle className="size-3 text-green-500" />
                ) : (
                  <div className="size-3">
                    <CircularProgressbar
                      value={(task.progress.completed / task.progress.total) * 100}
                      strokeWidth={12}
                      styles={buildStyles({ pathColor: "#10b981", trailColor: "#e5e5e5", strokeLinecap: "round" })}
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
  menuOpenId,
  setMenuOpenId,
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
  menuOpenId: string | null
  setMenuOpenId: (id: string | null) => void
}) {
  const StatusIcon = status.icon
  const [isDragOver, setIsDragOver] = useState(false)

  return (
    <div className="shrink-0 w-[300px] lg:w-[340px] flex flex-col h-full">
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
          "rounded-lg border p-3 bg-neutral-50 dark:bg-neutral-900/40 flex flex-col max-h-full transition-colors",
          isDragOver ? "border-neutral-900 dark:border-neutral-100 bg-neutral-100 dark:bg-neutral-800" : "border-neutral-200 dark:border-neutral-800",
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="size-4 flex items-center justify-center">
              <StatusIcon />
            </div>
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">{status.name}</span>
            <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              {tasks.length}
            </Badge>
          </div>
          <button
            onClick={() => onAddTask(status.id)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
          >
            <Plus className="size-4" />
          </button>
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
              menuOpenId={menuOpenId}
              setMenuOpenId={setMenuOpenId}
            />
          ))}
          {tasks.length === 0 && (
            <div className="flex-1 flex items-center justify-center py-8">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Nenhuma tarefa</p>
            </div>
          )}
          <button
            onClick={() => onAddTask(status.id)}
            className="w-full py-2 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="size-3.5" />
            Adicionar
          </button>
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-neutral-900 dark:text-white">{task ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-xs font-medium mb-1.5 block text-neutral-700 dark:text-neutral-300">Título *</label>
            <Input
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Digite o título da tarefa..."
              className="border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block text-neutral-700 dark:text-neutral-300">Descrição</label>
            <Textarea
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Digite a descrição da tarefa..."
              rows={3}
              className="border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1.5 block text-neutral-700 dark:text-neutral-300">Status</label>
              <Select
                value={formData.status?.id}
                onValueChange={(value) => setFormData({ ...formData, status: STATUSES.find((s) => s.id === value) })}
              >
                <SelectTrigger className="border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950">
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
              <label className="text-xs font-medium mb-1.5 block text-neutral-700 dark:text-neutral-300">Prioridade</label>
              <Select
                value={formData.priority}
                onValueChange={(value: Task["priority"]) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className="border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950">
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
            <label className="text-xs font-medium mb-1.5 block text-neutral-700 dark:text-neutral-300">Data de Vencimento</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, date: e.target.value })}
              className="border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block text-neutral-700 dark:text-neutral-300">Progresso</label>
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
                className="flex-1 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
              />
              <span className="flex items-center text-neutral-700 dark:text-neutral-300">/</span>
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
                className="flex-1 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block text-neutral-700 dark:text-neutral-300">Responsáveis</label>
            <div className="flex flex-wrap gap-2">
              {availableUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => toggleAssignee(user)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors border",
                    formData.assignees?.some((u) => u.id === user.id)
                      ? "bg-neutral-900 dark:bg-neutral-700 text-white border-neutral-900 dark:border-neutral-700"
                      : "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  )}
                >
                  {user.name}
                </button>
              ))}
              {availableUsers.length === 0 && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Nenhum membro disponível</p>
              )}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block text-neutral-700 dark:text-neutral-300">Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableLabels.map((label) => (
                <button
                  key={label.id}
                  onClick={() => toggleLabel(label)}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs font-medium transition-colors border",
                    formData.labels?.some((l) => l.id === label.id)
                      ? label.color
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  )}
                >
                  {label.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.title?.trim()}
            className="px-4 py-2 text-sm bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Salvar
          </button>
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
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [filterLabel, setFilterLabel] = useState<string>("all")
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  useEffect(() => {
    const loadGroupMembers = async () => {
      if (!groupId) return
      try {
        setGroupMembers([])
      } catch (error) {
        console.error("Erro ao carregar membros do grupo:", error)
      }
    }
    loadGroupMembers()
  }, [groupId])

  const filteredTasks = useMemo(() => {
    let result = tasks.filter((task) => !task.archived)

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
      )
    }

    if (filterPriority !== "all") {
      result = result.filter((t) => t.priority === filterPriority)
    }

    if (filterLabel !== "all") {
      result = result.filter((t) => t.labels.some((l) => l.id === filterLabel))
    }

    return result
  }, [tasks, searchQuery, filterPriority, filterLabel])

  const tasksByStatus = useMemo(() => {
    const map: Record<string, Task[]> = {}
    for (const s of STATUSES) map[s.id] = []
    for (const t of filteredTasks) {
      map[t.status.id] = map[t.status.id] || []
      map[t.status.id].push(t)
    }
    return map
  }, [filteredTasks])

  const stats = useMemo(() => {
    const total = filteredTasks.length
    const completed = filteredTasks.filter((t) => t.status.id === "completed").length
    const inProgress = filteredTasks.filter((t) => t.status.id === "in-progress").length
    const urgent = filteredTasks.filter((t) => t.priority === "urgent").length

    return { total, completed, inProgress, urgent }
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
    if (confirm("Deseja excluir esta tarefa?")) {
      setTasks(tasks.filter((t) => t.id !== id))
    }
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
    if (confirm(`Deseja excluir ${selectedTasks.size} tarefa(s)?`)) {
      setTasks(tasks.filter((t) => !selectedTasks.has(t.id)))
      setSelectedTasks(new Set())
    }
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
    <div className="flex h-full flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Quadro Kanban</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Gerencie tarefas e projetos visualmente
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingTask(undefined)
                setDefaultStatus(undefined)
                setTaskModalOpen(true)
              }}
              className="px-3 py-1.5 text-sm bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex px-4">
          <button
            onClick={() => setViewMode('board')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              viewMode === 'board'
                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <Grid3x3 className="w-3.5 h-3.5 inline mr-1.5" />
            Quadro
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              viewMode === 'list'
                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <List className="w-3.5 h-3.5 inline mr-1.5" />
            Lista
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
        <div className="grid grid-cols-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Total</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Concluídas</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">{stats.completed}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Em Progresso</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">{stats.inProgress}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Urgente</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">{stats.urgent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar tarefas..."
                className="pl-9 pr-3 py-1.5 text-xs w-full rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
            </div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-1.5 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
            >
              <option value="all">Todas prioridades</option>
              <option value="urgent">Urgente</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
            <select
              value={filterLabel}
              onChange={(e) => setFilterLabel(e.target.value)}
              className="px-3 py-1.5 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
            >
              <option value="all">Todas tags</option>
              {labels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTasks.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700">
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {selectedTasks.size} selecionada(s)
              </span>
              <button
                onClick={handleBulkArchive}
                className="px-2 py-1 text-xs bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded hover:bg-neutral-300 dark:hover:bg-neutral-600 flex items-center gap-1"
              >
                <Archive className="w-3 h-3" />
                Arquivar
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/30 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Deletar
              </button>
              <button
                onClick={() => setSelectedTasks(new Set())}
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
              >
                <X className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
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
                menuOpenId={menuOpenId}
                setMenuOpenId={setMenuOpenId}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
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
                  menuOpenId={menuOpenId}
                  setMenuOpenId={setMenuOpenId}
                />
              ))
            ) : (
              <div className="text-center py-16">
                <CheckSquare className="w-12 h-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
                <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
                  Nenhuma tarefa encontrada
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Crie uma nova tarefa para começar
                </p>
              </div>
            )}
          </div>
        )}
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
