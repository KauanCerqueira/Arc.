"use client"

import { useState, useRef, useEffect, useMemo } from 'react'
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  X,
  Calendar,
  MessageSquare,
  Send,
  MoreVertical,
  Edit,
  Archive,
  Search,
  Filter,
  Download,
  Users,
  Clock,
  Tag,
  BarChart3,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Link as LinkIcon,
  MapPin,
  List,
  Grid3x3,
  Target,
  Flag,
  PlayCircle,
  PauseCircle,
  XCircle,
  GripVertical,
} from 'lucide-react'
import { usePageTemplateData } from '@/core/hooks/usePageTemplateData'
import { WorkspaceTemplateComponentProps } from '@/core/types/workspace.types'

// ===========================================
// TYPES
// ===========================================

type Comment = {
  id: string
  text: string
  timestamp: string
  author: string
}

type Milestone = {
  id: string
  name: string
  date: string
  description?: string
  status: 'upcoming' | 'current' | 'completed'
}

type RoadmapItem = {
  id: string
  title: string
  description?: string
  owner: string
  assignees: string[]
  status: 'backlog' | 'planned' | 'in-progress' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  tags: string[]
  startDate: string
  dueDate: string
  progress: number // 0-100
  groupId: string
  comments: Comment[]
  dependencies: string[] // IDs of items this depends on
  links: { url: string; title: string }[]
}

type RoadmapGroup = {
  id: string
  name: string
  color: string
  description?: string
}

type RoadmapTemplateData = {
  items: RoadmapItem[]
  groups: RoadmapGroup[]
  milestones: Milestone[]
}

type ViewMode = 'timeline' | 'gantt' | 'list' | 'board'

// ===========================================
// CONSTANTS
// ===========================================

const DEFAULT_DATA: RoadmapTemplateData = {
  groups: [],
  items: [],
  milestones: [],
}

const STATUS_CONFIG = {
  backlog: { label: 'Backlog', color: '#737373', icon: Archive },
  planned: { label: 'Planejado', color: '#3b82f6', icon: Clock },
  'in-progress': { label: 'Em Progresso', color: '#f59e0b', icon: PlayCircle },
  done: { label: 'Concluído', color: '#22c55e', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: '#ef4444', icon: XCircle },
}

const PRIORITY_CONFIG = {
  low: { label: 'Baixa', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  medium: { label: 'Média', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800' },
  critical: { label: 'Crítica', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800' },
}

const GROUP_COLORS = [
  { id: 'blue', color: '#3b82f6', name: 'Azul' },
  { id: 'green', color: '#22c55e', name: 'Verde' },
  { id: 'yellow', color: '#f59e0b', name: 'Amarelo' },
  { id: 'purple', color: '#8b5cf6', name: 'Roxo' },
  { id: 'pink', color: '#ec4899', name: 'Rosa' },
  { id: 'cyan', color: '#06b6d4', name: 'Ciano' },
  { id: 'red', color: '#ef4444', name: 'Vermelho' },
  { id: 'lime', color: '#84cc16', name: 'Lima' },
  { id: 'indigo', color: '#6366f1', name: 'Índigo' },
  { id: 'orange', color: '#f97316', name: 'Laranja' },
]

const TAGS = [
  { id: 'frontend', label: 'Frontend', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800' },
  { id: 'backend', label: 'Backend', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  { id: 'design', label: 'Design', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-800' },
  { id: 'infra', label: 'Infra', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800' },
  { id: 'feature', label: 'Feature', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800' },
  { id: 'bug', label: 'Bug', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800' },
]

// ===========================================
// HELPER FUNCTIONS
// ===========================================

const generateMonths = (count = 6) => {
  const months = []
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  for (let i = 0; i < count; i++) {
    const date = new Date(currentYear, currentMonth + i, 1)
    months.push({
      label: date.toLocaleDateString('pt-BR', { month: 'short' }),
      fullLabel: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      year: date.getFullYear(),
      month: date.getMonth(),
      date: date,
    })
  }
  return months
}

const isOverdue = (dueDate: string, status: string) => {
  if (status === 'done' || status === 'cancelled') return false
  return new Date(dueDate) < new Date()
}

// ===========================================
// EDITABLE FIELD COMPONENT
// ===========================================

function EditableField({
  value,
  onChange,
  className = '',
  placeholder = 'Clique para editar',
  multiline = false,
  type = 'text',
}: {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  multiline?: boolean
  type?: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleBlur = () => {
    onChange(localValue)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      handleBlur()
    } else if (e.key === 'Escape') {
      setLocalValue(value)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    const InputComponent = multiline ? 'textarea' : 'input'
    return (
      <InputComponent
        ref={inputRef as any}
        type={type}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`${className} bg-white dark:bg-neutral-950 border border-blue-500 dark:border-blue-400 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500`}
        placeholder={placeholder}
        rows={multiline ? 3 : undefined}
      />
    )
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`${className} cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded px-2 py-1 transition`}
      title="Clique para editar"
    >
      {value || <span className="text-neutral-400 dark:text-neutral-600">{placeholder}</span>}
    </div>
  )
}

// ===========================================
// MAIN COMPONENT
// ===========================================

export default function RoadmapTemplate({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData } = usePageTemplateData<RoadmapTemplateData>(groupId, pageId, DEFAULT_DATA)
  const items = data.items ?? []
  const groups = data.groups ?? []
  const milestones = data.milestones ?? []

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('timeline')
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [commentsModalItemId, setCommentsModalItemId] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterTag, setFilterTag] = useState<string>('all')
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [draggedItem, setDraggedItem] = useState<RoadmapItem | null>(null)

  // Timeline
  const months = generateMonths(12)
  const timelineStart = months[0].date
  const timelineEnd = new Date(months[11].date.getFullYear(), months[11].date.getMonth() + 1, 0)

  // Filtered items
  const filteredItems = useMemo(() => {
    let result = items

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.owner.toLowerCase().includes(query)
      )
    }

    if (filterStatus !== 'all') {
      result = result.filter((item) => item.status === filterStatus)
    }

    if (filterPriority !== 'all') {
      result = result.filter((item) => item.priority === filterPriority)
    }

    if (filterTag !== 'all') {
      result = result.filter((item) => item.tags.includes(filterTag))
    }

    return result
  }, [items, searchQuery, filterStatus, filterPriority, filterTag])

  // Stats
  const stats = useMemo(() => {
    const total = items.length
    const completed = items.filter((i) => i.status === 'done').length
    const inProgress = items.filter((i) => i.status === 'in-progress').length
    const overdue = items.filter((i) => isOverdue(i.dueDate, i.status)).length
    const avgProgress = items.length > 0 ? Math.round(items.reduce((sum, i) => sum + i.progress, 0) / items.length) : 0

    return { total, completed, inProgress, overdue, avgProgress }
  }, [items])

  // Position calculation for timeline
  const getItemPosition = (item: RoadmapItem) => {
    if (!item.startDate || !item.dueDate) return { left: '0%', width: '2%' }

    const startDate = new Date(item.startDate)
    const dueDate = new Date(item.dueDate)
    const totalDays = (timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)
    const startDays = (startDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)
    const dueDays = (dueDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)

    const left = Math.max(0, Math.min(98, (startDays / totalDays) * 100))
    const right = Math.max(0, Math.min(100, (dueDays / totalDays) * 100))
    const width = Math.max(1, right - left)

    return { left: `${left}%`, width: `${width}%` }
  }

  // Handlers
  const toggleGroupCollapse = (id: string) => {
    const newCollapsed = new Set(collapsedGroups)
    if (newCollapsed.has(id)) {
      newCollapsed.delete(id)
    } else {
      newCollapsed.add(id)
    }
    setCollapsedGroups(newCollapsed)
  }

  const addGroup = () => {
    const newGroup: RoadmapGroup = {
      id: Date.now().toString(),
      name: 'Novo Grupo',
      color: GROUP_COLORS[groups.length % GROUP_COLORS.length].color,
    }

    setData((current) => ({
      ...current,
      groups: [...(current.groups || []), newGroup],
    }))
  }

  const addItem = (groupId: string) => {
    const today = new Date()
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())

    const newItem: RoadmapItem = {
      id: Date.now().toString(),
      title: 'Nova tarefa',
      description: '',
      owner: '',
      assignees: [],
      status: 'planned',
      priority: 'medium',
      tags: [],
      startDate: today.toISOString().split('T')[0],
      dueDate: nextMonth.toISOString().split('T')[0],
      progress: 0,
      groupId,
      comments: [],
      dependencies: [],
      links: [],
    }

    setData((current) => ({
      ...current,
      items: [...(current.items || []), newItem],
    }))
  }

  const updateItem = (id: string, updates: Partial<RoadmapItem>) => {
    setData((current) => ({
      ...current,
      items: (current.items || []).map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }))
  }

  const updateGroup = (id: string, updates: Partial<RoadmapGroup>) => {
    setData((current) => ({
      ...current,
      groups: (current.groups || []).map((group) =>
        group.id === id ? { ...group, ...updates } : group
      ),
    }))
  }

  const deleteItem = (id: string) => {
    if (confirm('Deseja excluir este item?')) {
      setData((current) => ({
        ...current,
        items: (current.items || []).filter((item) => item.id !== id),
      }))
      if (selectedItemId === id) {
        setSelectedItemId(null)
      }
    }
  }

  const deleteGroup = (id: string) => {
    if (confirm('Deseja excluir este grupo e todos os seus itens?')) {
      setData((current) => ({
        ...current,
        groups: (current.groups || []).filter((group) => group.id !== id),
        items: (current.items || []).filter((item) => item.groupId !== id),
      }))
    }
  }

  const addComment = (itemId: string) => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment,
      timestamp: new Date().toISOString(),
      author: 'Você',
    }

    updateItem(itemId, {
      comments: [...(items.find((i) => i.id === itemId)?.comments || []), comment],
    })

    setNewComment('')
  }

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      name: editingMilestone?.name || 'Novo Marco',
      date: editingMilestone?.date || new Date().toISOString().split('T')[0],
      description: editingMilestone?.description || '',
      status: editingMilestone?.status || 'upcoming',
    }

    if (editingMilestone && editingMilestone.id) {
      setData((current) => ({
        ...current,
        milestones: (current.milestones || []).map((m) =>
          m.id === editingMilestone.id ? newMilestone : m
        ),
      }))
    } else {
      setData((current) => ({
        ...current,
        milestones: [...(current.milestones || []), newMilestone],
      }))
    }

    setShowMilestoneModal(false)
    setEditingMilestone(null)
  }

  // Drag and drop
  const handleDragStart = (item: RoadmapItem) => {
    setDraggedItem(item)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDropOnStatus = (status: string) => {
    if (!draggedItem) return
    updateItem(draggedItem.id, { status: status as any })
    setDraggedItem(null)
  }

  const handleDropOnGroup = (groupId: string) => {
    if (!draggedItem) return
    updateItem(draggedItem.id, { groupId })
    setDraggedItem(null)
  }

  const commentsModalItem = items.find((item) => item.id === commentsModalItemId)

  // Empty state
  if (groups.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-neutral-900 dark:bg-neutral-700 rounded-2xl flex items-center justify-center">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
            Crie seu primeiro roadmap
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            Organize features, planeje sprints e acompanhe o progresso do seu projeto em uma timeline visual
          </p>
          <button
            onClick={addGroup}
            className="px-6 py-3 bg-neutral-900 dark:bg-neutral-700 text-white rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-600 transition font-medium inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Criar Primeiro Grupo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Header - COMPACTO */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-base font-semibold text-neutral-900 dark:text-white">Roadmap</h1>
            </div>
            {/* Stats inline */}
            <div className="flex items-center gap-3 text-xs">
              <span className="text-neutral-600 dark:text-neutral-400">{stats.total} itens</span>
              <span className="text-green-600 dark:text-green-400">{stats.completed} concluídas</span>
              <span className="text-amber-600 dark:text-amber-400">{stats.inProgress} em progresso</span>
              {stats.overdue > 0 && <span className="text-red-600 dark:text-red-400">{stats.overdue} atrasadas</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowMilestoneModal(true)}
              className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center gap-1"
            >
              <Flag className="w-3 h-3" />
              Marco
            </button>
            <button
              onClick={addGroup}
              className="px-2 py-1 text-xs bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Grupo
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex px-4">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              viewMode === 'timeline'
                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
            Timeline
          </button>
          <button
            onClick={() => setViewMode('gantt')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              viewMode === 'gantt'
                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 inline mr-1.5" />
            Gantt
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
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar itens..."
              className="pl-7 pr-2 py-1 text-xs w-full rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
          >
            <option value="all">Status</option>
            {Object.entries(STATUS_CONFIG).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-2 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
          >
            <option value="all">Prioridade</option>
            {Object.entries(PRIORITY_CONFIG).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-2 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
          >
            <option value="all">Tags</option>
            {TAGS.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'timeline' && (
          <TimelineView
            groups={groups}
            items={filteredItems}
            milestones={milestones}
            months={months}
            collapsedGroups={collapsedGroups}
            toggleGroupCollapse={toggleGroupCollapse}
            addItem={addItem}
            updateItem={updateItem}
            updateGroup={updateGroup}
            deleteItem={deleteItem}
            deleteGroup={deleteGroup}
            getItemPosition={getItemPosition}
            setCommentsModalItemId={setCommentsModalItemId}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDropOnGroup={handleDropOnGroup}
          />
        )}

        {viewMode === 'gantt' && (
          <GanttView
            groups={groups}
            items={filteredItems}
            months={months}
            getItemPosition={getItemPosition}
            setCommentsModalItemId={setCommentsModalItemId}
            updateItem={updateItem}
            deleteItem={deleteItem}
          />
        )}

        {viewMode === 'list' && (
          <ListView
            items={filteredItems}
            groups={groups}
            updateItem={updateItem}
            deleteItem={deleteItem}
            setCommentsModalItemId={setCommentsModalItemId}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDropOnGroup={handleDropOnGroup}
          />
        )}

        {viewMode === 'board' && (
          <BoardView
            items={filteredItems}
            groups={groups}
            updateItem={updateItem}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDropOnStatus={handleDropOnStatus}
            setCommentsModalItemId={setCommentsModalItemId}
          />
        )}
      </div>

      {/* Comments Modal */}
      {commentsModalItem && (
        <CommentsModal
          item={commentsModalItem}
          onClose={() => setCommentsModalItemId(null)}
          newComment={newComment}
          setNewComment={setNewComment}
          addComment={addComment}
        />
      )}

      {/* Milestone Modal */}
      {showMilestoneModal && (
        <MilestoneModal
          milestone={editingMilestone}
          onClose={() => {
            setShowMilestoneModal(false)
            setEditingMilestone(null)
          }}
          onSave={addMilestone}
          onChange={setEditingMilestone}
        />
      )}
    </div>
  )
}

// ===========================================
// TIMELINE VIEW
// ===========================================

function TimelineView({
  groups,
  items,
  milestones,
  months,
  collapsedGroups,
  toggleGroupCollapse,
  addItem,
  updateItem,
  updateGroup,
  deleteItem,
  deleteGroup,
  getItemPosition,
  setCommentsModalItemId,
  handleDragStart,
  handleDragOver,
  handleDropOnGroup,
}: any) {
  return (
    <div className="min-w-[1400px] bg-white dark:bg-neutral-900">
      {/* Table Header */}
      <div className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex">
          <div className="flex-none w-[700px] flex border-r border-neutral-200 dark:border-neutral-800">
            <div className="w-10"></div>
            <div className="flex-1 px-3 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Item</div>
            <div className="w-28 px-3 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Owner</div>
            <div className="w-28 px-3 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Status</div>
            <div className="w-24 px-3 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Progresso</div>
            <div className="w-12 px-3 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase text-center">💬</div>
          </div>
          <div className="flex-1 flex">
            {months.map((month: any, idx: number) => (
              <div key={idx} className="flex-1 px-2 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase border-l border-neutral-200 dark:border-neutral-800">
                <div>{month.label}</div>
                <div className="text-[10px] text-neutral-500">{month.date.getFullYear()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Milestones */}
      {milestones.length > 0 && (
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800">
          <div className="flex-none w-[700px] px-3 py-2 border-r border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <Flag className="w-3 h-3 text-neutral-600 dark:text-neutral-400" />
              <span className="text-xs font-semibold text-neutral-900 dark:text-white">Marcos</span>
            </div>
          </div>
          <div className="flex-1 relative py-2">
            <div className="absolute inset-y-0 left-0 right-0 flex">
              {months.map((_: any, idx: number) => (
                <div key={idx} className="flex-1 border-l border-neutral-200 dark:border-neutral-800" />
              ))}
            </div>
            {milestones.map((milestone: any) => {
              const date = new Date(milestone.date)
              const timelineStart = months[0].date
              const timelineEnd = new Date(months[11].date.getFullYear(), months[11].date.getMonth() + 1, 0)
              const totalDays = (timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)
              const milestoneDays = (date.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)
              const left = Math.max(0, Math.min(98, (milestoneDays / totalDays) * 100))

              return (
                <div key={milestone.id} className="absolute top-0 bottom-0" style={{ left: `${left}%` }}>
                  <div className="w-px h-full bg-purple-500"></div>
                  <div className="absolute top-1/2 -translate-y-1/2 -left-2">
                    <Flag className="w-3 h-3 text-purple-500 fill-purple-500" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Groups */}
      {groups.map((group: any) => {
        const groupItems = items.filter((item: any) => item.groupId === group.id)
        const isCollapsed = collapsedGroups.has(group.id)

        return (
          <div
            key={group.id}
            onDragOver={handleDragOver}
            onDrop={() => handleDropOnGroup(group.id)}
          >
            {/* Group Header */}
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-800 group/header">
              <button
                onClick={() => toggleGroupCollapse(group.id)}
                className="w-10 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 h-10"
              >
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              <div className="flex-1 flex items-center gap-2 py-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: group.color }} />
                <EditableField
                  value={group.name}
                  onChange={(value) => updateGroup(group.id, { name: value })}
                  className="text-xs font-semibold text-neutral-900 dark:text-white"
                  placeholder="Nome do grupo"
                />
                <span className="text-xs text-neutral-500">({groupItems.length})</span>
              </div>
              <button
                onClick={() => addItem(group.id)}
                className="px-2 py-1 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 opacity-0 group-hover/header:opacity-100 transition"
              >
                + Item
              </button>
              <button
                onClick={() => deleteGroup(group.id)}
                className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover/header:opacity-100 transition mr-2"
              >
                Excluir
              </button>
            </div>

            {/* Items */}
            {!isCollapsed && groupItems.map((item: any) => {
              const overdue = isOverdue(item.dueDate, item.status)
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item)}
                  className="flex border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 group/item cursor-move"
                >
                  <div className="flex-none w-[700px] flex border-r border-neutral-200 dark:border-neutral-800">
                    <div className="w-10 flex items-center justify-center">
                      <GripVertical className="w-3 h-3 text-neutral-400 opacity-0 group-hover/item:opacity-100" />
                    </div>
                    <div className="flex-1 px-3 py-2">
                      <EditableField
                        value={item.title}
                        onChange={(value) => updateItem(item.id, { title: value })}
                        className="text-xs text-neutral-900 dark:text-white font-medium"
                        placeholder="Título"
                      />
                      {overdue && <span className="text-[10px] text-red-600">Atrasado</span>}
                    </div>
                    <div className="w-28 px-3 py-2">
                      <EditableField
                        value={item.owner}
                        onChange={(value) => updateItem(item.id, { owner: value })}
                        className="text-xs text-neutral-600 dark:text-neutral-400"
                        placeholder="—"
                      />
                    </div>
                    <div className="w-28 px-3 py-2 flex items-center">
                      <select
                        value={item.status}
                        onChange={(e) => updateItem(item.id, { status: e.target.value })}
                        className="text-[10px] px-2 py-1 rounded-full text-white cursor-pointer focus:outline-none"
                        style={{ backgroundColor: STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG].color }}
                      >
                        {Object.entries(STATUS_CONFIG).map(([key, value]) => (
                          <option key={key} value={key}>{value.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24 px-3 py-2">
                      <div className="flex items-center gap-1">
                        <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div className="h-full bg-neutral-900 dark:bg-neutral-100" style={{ width: `${item.progress}%` }} />
                        </div>
                        <span className="text-[10px] text-neutral-600 dark:text-neutral-400 w-8">{item.progress}%</span>
                      </div>
                    </div>
                    <div className="w-12 px-3 py-2 flex items-center justify-center">
                      <button
                        onClick={() => setCommentsModalItemId(item.id)}
                        className="relative p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
                      >
                        <MessageSquare className="w-3 h-3 text-neutral-600 dark:text-neutral-400" />
                        {item.comments?.length > 0 && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 text-white text-[8px] rounded-full flex items-center justify-center">
                            {item.comments.length}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex-1 relative py-2">
                    <div className="absolute inset-y-0 left-0 right-0 flex">
                      {months.map((_: any, idx: number) => (
                        <div key={idx} className="flex-1 border-l border-neutral-200 dark:border-neutral-800" />
                      ))}
                    </div>
                    <div className="relative px-1 h-full">
                      <div
                        className="absolute top-1/2 -translate-y-1/2 h-5 rounded hover:scale-105 transition-transform cursor-pointer"
                        style={{
                          ...getItemPosition(item),
                          backgroundColor: STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG].color,
                          opacity: 0.8,
                        }}
                        title={`${item.title}\n${new Date(item.startDate).toLocaleDateString('pt-BR')} - ${new Date(item.dueDate).toLocaleDateString('pt-BR')}`}
                      >
                        <div className="h-full flex items-center justify-center overflow-hidden">
                          <div className="h-3 bg-white/20 rounded-sm" style={{ width: `${item.progress}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Add Item */}
            {!isCollapsed && (
              <div className="flex border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                <div className="flex-none w-[700px] flex border-r border-neutral-200 dark:border-neutral-800">
                  <div className="w-10"></div>
                  <div className="flex-1 px-3 py-2">
                    <button
                      onClick={() => addItem(group.id)}
                      className="text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Adicionar item
                    </button>
                  </div>
                </div>
                <div className="flex-1"></div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ===========================================
// GANTT VIEW
// ===========================================

function GanttView({ groups, items, months, getItemPosition, setCommentsModalItemId, updateItem, deleteItem }: any) {
  return (
    <div className="p-4 space-y-3">
      {groups.map((group: any) => {
        const groupItems = items.filter((item: any) => item.groupId === group.id)
        if (groupItems.length === 0) return null

        return (
          <div key={group.id} className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: group.color }} />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{group.name}</h3>
            </div>
            <div className="space-y-2">
              {groupItems.map((item: any) => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="w-44">
                    <EditableField
                      value={item.title}
                      onChange={(value) => updateItem(item.id, { title: value })}
                      className="text-xs text-neutral-700 dark:text-neutral-300 truncate"
                      placeholder="Título"
                    />
                  </div>
                  <div className="flex-1 relative h-7 bg-neutral-100 dark:bg-neutral-800 rounded">
                    <div className="absolute inset-y-0 flex">
                      {months.map((_: any, idx: number) => (
                        <div key={idx} className="flex-1 border-l border-neutral-200 dark:border-neutral-700" />
                      ))}
                    </div>
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-5 rounded cursor-pointer hover:scale-105 transition-transform"
                      style={{
                        ...getItemPosition(item),
                        backgroundColor: STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG].color,
                      }}
                      title={item.title}
                    />
                  </div>
                  <div className="w-12 text-xs text-neutral-500 dark:text-neutral-400 text-right">{item.progress}%</div>
                  <button
                    onClick={() => setCommentsModalItemId(item.id)}
                    className="relative p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                  >
                    <MessageSquare className="w-3 h-3 text-neutral-600 dark:text-neutral-400" />
                    {item.comments?.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 text-white text-[8px] rounded-full flex items-center justify-center">
                        {item.comments.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ===========================================
// LIST VIEW
// ===========================================

function ListView({
  items,
  groups,
  updateItem,
  deleteItem,
  setCommentsModalItemId,
  handleDragStart,
  handleDragOver,
  handleDropOnGroup,
}: any) {
  return (
    <div className="p-4 space-y-2" onDragOver={handleDragOver}>
      {items.length === 0 ? (
        <div className="text-center py-16">
          <Target className="w-12 h-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
          <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-1">Nenhum item encontrado</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Crie um novo item para começar</p>
        </div>
      ) : (
        items.map((item: any) => {
          const group = groups.find((g: any) => g.id === item.groupId)
          const overdue = isOverdue(item.dueDate, item.status)

          return (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item)}
              className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 hover:border-neutral-400 dark:hover:border-neutral-600 transition cursor-move"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <GripVertical className="w-4 h-4 text-neutral-400" />
                    {group && <div className="w-3 h-3 rounded" style={{ backgroundColor: group.color }} />}
                    <EditableField
                      value={item.title}
                      onChange={(value) => updateItem(item.id, { title: value })}
                      className="font-medium text-neutral-900 dark:text-white"
                      placeholder="Título"
                    />
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG].color }}
                    >
                      {STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG].label}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG].color
                      }`}
                    >
                      {PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG].label}
                    </span>
                    {overdue && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700">Atrasado</span>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <input
                        type="date"
                        value={item.startDate}
                        onChange={(e) => updateItem(item.id, { startDate: e.target.value })}
                        className="bg-transparent border-0 p-0 focus:outline-none cursor-pointer"
                      />
                      <span>-</span>
                      <input
                        type="date"
                        value={item.dueDate}
                        onChange={(e) => updateItem(item.id, { dueDate: e.target.value })}
                        className="bg-transparent border-0 p-0 focus:outline-none cursor-pointer"
                      />
                    </div>
                    {item.owner && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <EditableField
                          value={item.owner}
                          onChange={(value) => updateItem(item.id, { owner: value })}
                          className="text-xs"
                          placeholder="Owner"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <div className="h-full bg-neutral-900 dark:bg-neutral-100" style={{ width: `${item.progress}%` }} />
                      </div>
                      <span>{item.progress}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCommentsModalItemId(item.id)}
                    className="relative p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                  >
                    <MessageSquare className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                    {item.comments?.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[9px] rounded-full flex items-center justify-center">
                        {item.comments.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

// ===========================================
// BOARD VIEW
// ===========================================

function BoardView({
  items,
  groups,
  updateItem,
  handleDragStart,
  handleDragOver,
  handleDropOnStatus,
  setCommentsModalItemId,
}: any) {
  const statuses = Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>

  return (
    <div className="flex gap-3 p-4 h-full overflow-x-auto">
      {statuses.map((status) => {
        const statusItems = items.filter((item: any) => item.status === status)
        const StatusIcon = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].icon

        return (
          <div
            key={status}
            className="flex-none w-72"
            onDragOver={handleDragOver}
            onDrop={() => handleDropOnStatus(status)}
          >
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <StatusIcon
                  className="w-3 h-3"
                  style={{ color: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].color }}
                />
                <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                  {STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].label}
                </span>
                <span className="text-xs text-neutral-500">({statusItems.length})</span>
              </div>
              <div className="space-y-2 flex-1 overflow-y-auto">
                {statusItems.map((item: any) => {
                  const group = groups.find((g: any) => g.id === item.groupId)
                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(item)}
                      className="bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-800 p-2 cursor-move hover:border-neutral-400 dark:hover:border-neutral-600 transition"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        {group && <div className="w-2 h-2 rounded mt-1" style={{ backgroundColor: group.color }} />}
                        <EditableField
                          value={item.title}
                          onChange={(value) => updateItem(item.id, { title: value })}
                          className="flex-1 text-xs font-medium text-neutral-900 dark:text-white"
                          placeholder="Título"
                        />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div className="h-full bg-neutral-900 dark:bg-neutral-100" style={{ width: `${item.progress}%` }} />
                        </div>
                        <span className="text-[10px] text-neutral-500">{item.progress}%</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-neutral-500 dark:text-neutral-400">
                        <span>{new Date(item.dueDate).toLocaleDateString('pt-BR')}</span>
                        <button
                          onClick={() => setCommentsModalItemId(item.id)}
                          className="relative"
                        >
                          <MessageSquare className="w-3 h-3" />
                          {item.comments?.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 text-white text-[8px] rounded-full flex items-center justify-center">
                              {item.comments.length}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ===========================================
// COMMENTS MODAL
// ===========================================

function CommentsModal({ item, onClose, newComment, setNewComment, addComment }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-neutral-900 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-neutral-200 dark:border-neutral-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-none border-b border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-1">{item.title}</h2>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className="px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG].color }}
                >
                  {STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG].label}
                </span>
                <span className="text-neutral-600 dark:text-neutral-400">
                  {new Date(item.dueDate).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded">
              <X className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <h3 className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
            Comentários ({item.comments?.length || 0})
          </h3>
          {item.comments && item.comments.length > 0 ? (
            item.comments.map((comment: any) => (
              <div key={comment.id} className="bg-neutral-50 dark:bg-neutral-800 rounded p-3">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs font-medium text-neutral-900 dark:text-white">{comment.author}</span>
                  <span className="text-xs text-neutral-500">{new Date(comment.timestamp).toLocaleString('pt-BR')}</span>
                </div>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{comment.text}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-neutral-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Nenhum comentário</p>
            </div>
          )}
        </div>

        <div className="flex-none border-t border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Adicione um comentário..."
              className="flex-1 px-3 py-2 text-xs border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400 resize-none"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  addComment(item.id)
                }
              }}
            />
            <button
              onClick={() => addComment(item.id)}
              disabled={!newComment.trim()}
              className="px-3 py-2 bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 transition disabled:opacity-50 self-end"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-neutral-500 mt-2">Ctrl+Enter para enviar</p>
        </div>
      </div>
    </div>
  )
}

// ===========================================
// MILESTONE MODAL
// ===========================================

function MilestoneModal({ milestone, onClose, onSave, onChange }: any) {
  const [formData, setFormData] = useState(
    milestone || {
      name: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      status: 'upcoming',
    }
  )

  useEffect(() => {
    onChange(formData)
  }, [formData, onChange])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-neutral-900 rounded-lg shadow-2xl w-full max-w-md border border-neutral-200 dark:border-neutral-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 space-y-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">{milestone ? 'Editar Marco' : 'Novo Marco'}</h2>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nome *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
              placeholder="Nome do marco"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Data *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400 resize-none"
              rows={3}
              placeholder="Descrição do marco..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition"
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              disabled={!formData.name.trim()}
              className="px-3 py-1.5 text-sm bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 transition disabled:opacity-50"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
