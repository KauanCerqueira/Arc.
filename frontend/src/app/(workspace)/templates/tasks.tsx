"use client"

import { useState, useMemo } from 'react'
import { usePageTemplateData } from '@/core/hooks/usePageTemplateData'
import { WorkspaceTemplateComponentProps } from '@/core/types/workspace.types'
import {
  Plus,
  Circle,
  CheckCircle2,
  MoreHorizontal,
  Calendar,
  Tag,
  X,
  Trash2,
  Clock,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  List as ListIcon,
  GripVertical
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Textarea } from '@/shared/components/ui/Textarea'

type TaskStatus = 'todo' | 'in_progress' | 'done'
type ViewMode = 'list' | 'board'

interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  tags?: string[]
  subtasks?: Array<{ id: string; title: string; completed: boolean }>
  createdAt: string
}

interface TasksData extends Record<string, unknown> {
  tasks: Task[]
  viewMode: ViewMode
}

const DEFAULT_DATA: TasksData = {
  tasks: [],
  viewMode: 'list'
}

const STATUS_CONFIG = {
  todo: { label: 'A Fazer', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' },
  in_progress: { label: 'Em Progresso', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
  done: { label: 'Concluído', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' }
}

const PRIORITY_CONFIG = {
  low: { label: 'Baixa', color: 'text-gray-500' },
  medium: { label: 'Média', color: 'text-yellow-600' },
  high: { label: 'Alta', color: 'text-red-600' }
}

export default function TasksTemplate({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData } = usePageTemplateData<TasksData>(groupId, pageId, DEFAULT_DATA)
  const tasks = data.tasks || []
  const viewMode = data.viewMode || 'list'

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as const, dueDate: '', tags: '' })
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  const updateTasks = (updater: (tasks: Task[]) => Task[]) => {
    setData(prev => ({ ...prev, tasks: updater(prev.tasks || []) }))
  }

  const setViewModeAndSave = (mode: ViewMode) => {
    setData(prev => ({ ...prev, viewMode: mode }))
  }

  const createTask = () => {
    if (!newTask.title.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      status: 'todo',
      priority: newTask.priority,
      dueDate: newTask.dueDate || undefined,
      tags: newTask.tags ? newTask.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      subtasks: [],
      createdAt: new Date().toISOString()
    }

    updateTasks(current => [task, ...current])
    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', tags: '' })
    setShowCreateForm(false)
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    updateTasks(current => current.map(t => t.id === id ? { ...t, ...updates } : t))
    if (selectedTask?.id === id) {
      setSelectedTask(prev => prev ? { ...prev, ...updates } : null)
    }
  }

  const deleteTask = (id: string) => {
    if (!confirm('Deseja excluir esta tarefa?')) return
    updateTasks(current => current.filter(t => t.id !== id))
    if (selectedTask?.id === id) setSelectedTask(null)
  }

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    updateTasks(current =>
      current.map(task =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks?.map(st =>
                st.id === subtaskId ? { ...st, completed: !st.completed } : st
              )
            }
          : task
      )
    )
  }

  const addSubtask = (taskId: string, title: string) => {
    if (!title.trim()) return
    updateTasks(current =>
      current.map(task =>
        task.id === taskId
          ? {
              ...task,
              subtasks: [...(task.subtasks || []), { id: `${taskId}-${Date.now()}`, title, completed: false }]
            }
          : task
      )
    )
  }

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (status: TaskStatus) => {
    if (!draggedTask) return
    updateTask(draggedTask.id, { status })
    setDraggedTask(null)
  }

  const stats = useMemo(() => {
    const total = tasks.length
    const byStatus = {
      todo: tasks.filter(t => t.status === 'todo').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      done: tasks.filter(t => t.status === 'done').length
    }
    return { total, byStatus, completionRate: total ? (byStatus.done / total) * 100 : 0 }
  }, [tasks])

  const tasksByStatus = useMemo(() => {
    return {
      todo: tasks.filter(t => t.status === 'todo'),
      in_progress: tasks.filter(t => t.status === 'in_progress'),
      done: tasks.filter(t => t.status === 'done')
    }
  }, [tasks])

  return (
    <div className="h-full flex flex-col bg-arc-primary">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-arc">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-arc">Tarefas</h1>
            <p className="text-sm text-arc-muted mt-1">
              {stats.byStatus.done} de {stats.total} concluídas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-arc rounded-lg p-1 bg-arc-secondary">
              <button
                onClick={() => setViewModeAndSave('list')}
                className={cn(
                  'p-1.5 rounded transition-colors',
                  viewMode === 'list' ? 'bg-arc-primary shadow-sm' : 'hover:bg-arc-primary/50'
                )}
              >
                <ListIcon className="w-4 h-4 text-arc" />
              </button>
              <button
                onClick={() => setViewModeAndSave('board')}
                className={cn(
                  'p-1.5 rounded transition-colors',
                  viewMode === 'board' ? 'bg-arc-primary shadow-sm' : 'hover:bg-arc-primary/50'
                )}
              >
                <LayoutGrid className="w-4 h-4 text-arc" />
              </button>
            </div>
            <Button onClick={() => setShowCreateForm(true)} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Nova Tarefa
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-arc-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-arc transition-all duration-300"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'list' ? (
          <div className="max-w-4xl mx-auto space-y-2">
            {tasks.length === 0 ? (
              <div className="text-center py-16">
                <Circle className="w-12 h-12 mx-auto mb-4 text-arc-muted opacity-50" />
                <p className="text-arc-muted">Nenhuma tarefa criada</p>
                <Button onClick={() => setShowCreateForm(true)} variant="outline" size="sm" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeira tarefa
                </Button>
              </div>
            ) : (
              tasks.map(task => {
                const isExpanded = expandedTasks.has(task.id)
                const hasSubtasks = task.subtasks && task.subtasks.length > 0
                const statusConfig = STATUS_CONFIG[task.status as TaskStatus] || STATUS_CONFIG.todo
                const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
                const StatusIcon = task.status === 'done' ? CheckCircle2 : Circle

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    className="group border border-arc rounded-lg p-4 bg-arc-secondary hover:shadow-sm transition-all cursor-move"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' })}
                        className="flex-shrink-0 mt-0.5"
                      >
                        <StatusIcon className={cn('w-5 h-5 transition-colors', statusConfig.color)} />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <button
                            onClick={() => setSelectedTask(task)}
                            className="text-left flex-1"
                          >
                            <h3 className={cn(
                              'font-medium text-arc mb-1',
                              task.status === 'done' && 'line-through opacity-60'
                            )}>
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-sm text-arc-muted line-clamp-2">{task.description}</p>
                            )}
                          </button>

                          <div className="flex items-center gap-1">
                            {hasSubtasks && (
                              <button
                                onClick={() => setExpandedTasks(prev => {
                                  const newSet = new Set(prev)
                                  if (newSet.has(task.id)) newSet.delete(task.id)
                                  else newSet.add(task.id)
                                  return newSet
                                })}
                                className="p-1 hover:bg-arc-primary rounded transition-colors"
                              >
                                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </button>
                            )}
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2 text-xs text-arc-muted">
                          <span className={cn('px-2 py-0.5 rounded', statusConfig.bg, statusConfig.color)}>
                            {statusConfig.label}
                          </span>
                          <span className={priorityConfig.color}>
                            {priorityConfig.label}
                          </span>
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                          {task.tags && task.tags.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {task.tags.join(', ')}
                            </span>
                          )}
                        </div>

                        {isExpanded && hasSubtasks && (
                          <div className="mt-3 pl-6 space-y-1">
                            {task.subtasks?.map(subtask => (
                              <button
                                key={subtask.id}
                                onClick={() => toggleSubtask(task.id, subtask.id)}
                                className="flex items-center gap-2 text-sm text-arc hover:bg-arc-primary p-1.5 rounded w-full text-left transition-colors"
                              >
                                {subtask.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                )}
                                <span className={subtask.completed ? 'line-through opacity-60' : ''}>
                                  {subtask.title}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            {(['todo', 'in_progress', 'done'] as TaskStatus[]).map(status => (
              <div
                key={status}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(status)}
                className="flex flex-col bg-arc-secondary rounded-lg border border-arc"
              >
                <div className="px-4 py-3 border-b border-arc">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-arc">{STATUS_CONFIG[status].label}</h3>
                    <span className="text-sm text-arc-muted">{tasksByStatus[status].length}</span>
                  </div>
                </div>

                <div className="flex-1 p-4 space-y-2 overflow-auto">
                  {tasksByStatus[status].map(task => {
                    const statusConfig = STATUS_CONFIG[task.status as TaskStatus] || STATUS_CONFIG.todo
                    const StatusIcon = task.status === 'done' ? CheckCircle2 : Circle

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task)}
                        onClick={() => setSelectedTask(task)}
                        className="group p-3 bg-arc-primary rounded-lg border border-arc hover:shadow-sm transition-all cursor-move"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <StatusIcon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', statusConfig.color)} />
                          <h4 className={cn('text-sm font-medium text-arc flex-1', task.status === 'done' && 'line-through opacity-60')}>
                            {task.title}
                          </h4>
                        </div>

                        {task.description && (
                          <p className="text-xs text-arc-muted mb-2 line-clamp-2">{task.description}</p>
                        )}

                        <div className="flex items-center gap-2 text-xs text-arc-muted">
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            </span>
                          )}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <span>
                              {task.subtasks?.filter(st => st.completed).length}/{task.subtasks?.length}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {tasksByStatus[status].length === 0 && (
                    <div className="text-center py-8 text-arc-muted text-sm">
                      Nenhuma tarefa
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-arc-primary rounded-t-lg sm:rounded-lg border border-arc w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-4 sm:px-6 py-4 border-b border-arc flex items-center justify-between sticky top-0 bg-arc-primary">
              <h2 className="text-base sm:text-lg font-semibold text-arc">Nova Tarefa</h2>
              <button onClick={() => setShowCreateForm(false)} className="text-arc-muted hover:text-arc">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-arc mb-2 block">Título</label>
                <Input
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Nome da tarefa"
                  autoFocus
                  className="text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-arc mb-2 block">Descrição</label>
                <Textarea
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Detalhes da tarefa"
                  rows={3}
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-arc mb-2 block">Prioridade</label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-arc rounded-lg bg-arc-secondary text-arc text-sm sm:text-base"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-arc mb-2 block">Prazo</label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-arc mb-2 block">Tags</label>
                <Input
                  value={newTask.tags}
                  onChange={e => setNewTask({ ...newTask, tags: e.target.value })}
                  placeholder="Backend, API (separadas por vírgula)"
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={createTask} disabled={!newTask.title.trim()} className="w-full sm:flex-1 text-sm sm:text-base">
                  Criar Tarefa
                </Button>
                <Button onClick={() => setShowCreateForm(false)} variant="outline" className="w-full sm:w-auto text-sm sm:text-base">
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-arc-primary rounded-t-lg sm:rounded-lg border border-arc w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <div className="px-4 sm:px-6 py-4 border-b border-arc flex items-center justify-between sticky top-0 bg-arc-primary z-10">
              <h2 className="text-base sm:text-lg font-semibold text-arc">Detalhes da Tarefa</h2>
              <button onClick={() => setSelectedTask(null)} className="text-arc-muted hover:text-arc">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-arc mb-2 block">Título</label>
                <Input
                  value={selectedTask.title}
                  onChange={e => updateTask(selectedTask.id, { title: e.target.value })}
                  className="text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-arc mb-2 block">Descrição</label>
                <Textarea
                  value={selectedTask.description || ''}
                  onChange={e => updateTask(selectedTask.id, { description: e.target.value })}
                  rows={3}
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-arc mb-2 block">Status</label>
                  <select
                    value={selectedTask.status}
                    onChange={e => updateTask(selectedTask.id, { status: e.target.value as TaskStatus })}
                    className="w-full px-3 py-2 border border-arc rounded-lg bg-arc-secondary text-arc text-sm sm:text-base"
                  >
                    <option value="todo">A Fazer</option>
                    <option value="in_progress">Em Progresso</option>
                    <option value="done">Concluído</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-arc mb-2 block">Prioridade</label>
                  <select
                    value={selectedTask.priority}
                    onChange={e => updateTask(selectedTask.id, { priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-arc rounded-lg bg-arc-secondary text-arc text-sm sm:text-base"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-arc mb-2 block">Prazo</label>
                  <Input
                    type="date"
                    value={selectedTask.dueDate || ''}
                    onChange={e => updateTask(selectedTask.id, { dueDate: e.target.value })}
                    className="text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-arc mb-2 block">Tags</label>
                <Input
                  value={selectedTask.tags?.join(', ') || ''}
                  onChange={e => updateTask(selectedTask.id, { tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  placeholder="Backend, API"
                  className="text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-arc mb-3 block">Subtarefas</label>
                <div className="space-y-2 mb-3">
                  {selectedTask.subtasks?.map(subtask => (
                    <div key={subtask.id} className="flex items-center gap-2 p-2 bg-arc-secondary rounded">
                      <button
                        onClick={() => toggleSubtask(selectedTask.id, subtask.id)}
                        className="flex-shrink-0"
                      >
                        {subtask.completed ? (
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        ) : (
                          <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        )}
                      </button>
                      <span className={cn('flex-1 text-xs sm:text-sm text-arc break-words', subtask.completed && 'line-through opacity-60')}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>

                <Input
                  placeholder="Nova subtarefa (Enter para adicionar)"
                  className="text-sm sm:text-base"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement
                      addSubtask(selectedTask.id, input.value)
                      input.value = ''
                    }
                  }}
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-arc">
                <Button onClick={() => deleteTask(selectedTask.id)} variant="outline" className="w-full sm:w-auto text-sm sm:text-base text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                  Excluir Tarefa
                </Button>
                <Button onClick={() => setSelectedTask(null)} className="w-full sm:w-auto sm:ml-auto text-sm sm:text-base">
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
