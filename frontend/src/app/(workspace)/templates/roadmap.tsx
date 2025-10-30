"use client"

import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, GripVertical, ChevronDown, ChevronRight, X, Calendar, MessageSquare, Send } from 'lucide-react'
import { usePageTemplateData } from '@/core/hooks/usePageTemplateData'
import { WorkspaceTemplateComponentProps } from '@/core/types/workspace.types'

type Comment = {
  id: string
  text: string
  timestamp: string
  author: string
}

type RoadmapItem = {
  id: string
  title: string
  owner: string
  status: 'backlog' | 'planned' | 'in-progress' | 'done'
  tags: string[]
  dueDate: string
  groupId: string
  comments: Comment[]
}

type RoadmapGroup = {
  id: string
  name: string
  color: string
}

type RoadmapTemplateData = {
  items: RoadmapItem[]
  groups: RoadmapGroup[]
}

const DEFAULT_DATA: RoadmapTemplateData = {
  groups: [],
  items: [],
}

const STATUS_CONFIG = {
  backlog: { label: 'Backlog', color: '#6b7280' },
  planned: { label: 'Planejado', color: '#3b82f6' },
  'in-progress': { label: 'Em progresso', color: '#f59e0b' },
  done: { label: 'Concluído', color: '#10b981' },
}

const GROUP_COLORS = [
  { id: 'blue', color: '#3b82f6', name: 'Azul' },
  { id: 'green', color: '#10b981', name: 'Verde' },
  { id: 'yellow', color: '#f59e0b', name: 'Amarelo' },
  { id: 'purple', color: '#8b5cf6', name: 'Roxo' },
  { id: 'pink', color: '#ec4899', name: 'Rosa' },
  { id: 'cyan', color: '#06b6d4', name: 'Ciano' },
  { id: 'red', color: '#ef4444', name: 'Vermelho' },
  { id: 'lime', color: '#84cc16', name: 'Lima' },
  { id: 'indigo', color: '#6366f1', name: 'Índigo' },
  { id: 'orange', color: '#f97316', name: 'Laranja' },
]

export default function RoadmapTemplate({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData } = usePageTemplateData<RoadmapTemplateData>(groupId, pageId, DEFAULT_DATA)
  const items = data.items ?? []
  const groups = data.groups ?? []

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [colorPickerGroupId, setColorPickerGroupId] = useState<string | null>(null)

  // Gerar meses para timeline (próximos 6 meses)
  const generateMonths = () => {
    const months = []
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    for (let i = 0; i < 6; i++) {
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

  const months = generateMonths()
  const timelineStart = months[0].date
  const timelineEnd = new Date(months[5].date.getFullYear(), months[5].date.getMonth() + 1, 0)

  // Calcular posição do item na timeline baseado apenas na data de vencimento
  const getItemPosition = (item: RoadmapItem) => {
    if (!item.dueDate) return { left: '0%', width: '2%' }

    const dueDate = new Date(item.dueDate)
    const totalDays = (timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)
    const dueDateDays = (dueDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)

    const left = Math.max(0, Math.min(98, (dueDateDays / totalDays) * 100))

    return { left: `${left}%`, width: '8px' }
  }

  const toggleGroupCollapse = (groupId: string) => {
    const newCollapsed = new Set(collapsedGroups)
    if (newCollapsed.has(groupId)) {
      newCollapsed.delete(groupId)
    } else {
      newCollapsed.add(groupId)
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

    setEditingGroupId(newGroup.id)
    setEditingField('name')
  }

  const addItem = (groupId: string) => {
    const today = new Date()

    const newItem: RoadmapItem = {
      id: Date.now().toString(),
      title: 'Nova tarefa',
      owner: '',
      status: 'planned',
      tags: [],
      dueDate: today.toISOString().split('T')[0],
      groupId,
      comments: [],
    }

    setData((current) => ({
      ...current,
      items: [...(current.items || []), newItem],
    }))

    setEditingItemId(newItem.id)
    setEditingField('title')
  }

  const updateItem = (id: string, updates: Partial<RoadmapItem>) => {
    setData((current) => ({
      ...current,
      items: (current.items || []).map(item =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }))
  }

  const updateGroup = (id: string, updates: Partial<RoadmapGroup>) => {
    setData((current) => ({
      ...current,
      groups: (current.groups || []).map(group =>
        group.id === id ? { ...group, ...updates } : group
      ),
    }))
  }

  const deleteItem = (id: string) => {
    setData((current) => ({
      ...current,
      items: (current.items || []).filter(item => item.id !== id),
    }))
    if (selectedItemId === id) {
      setSelectedItemId(null)
    }
  }

  const deleteGroup = (id: string) => {
    setData((current) => ({
      ...current,
      groups: (current.groups || []).filter(group => group.id !== id),
      items: (current.items || []).filter(item => item.groupId !== id),
    }))
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
      comments: [...(items.find(i => i.id === itemId)?.comments || []), comment],
    })

    setNewComment('')
  }

  const selectedItem = items.find(item => item.id === selectedItemId)

  const EditableField = ({
    value,
    onChange,
    itemId,
    field,
    className = "",
    placeholder = "Clique para editar",
    multiline = false
  }: any) => {
    const [localValue, setLocalValue] = useState(value)
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
    const isEditing = editingItemId === itemId && editingField === field

    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }, [isEditing])

    const handleBlur = () => {
      onChange(localValue)
      setEditingItemId(null)
      setEditingField(null)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !multiline) {
        handleBlur()
      } else if (e.key === 'Escape') {
        setLocalValue(value)
        setEditingItemId(null)
        setEditingField(null)
      }
    }

    if (isEditing) {
      const InputComponent = multiline ? 'textarea' : 'input'
      return (
        <InputComponent
          ref={inputRef as any}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`${className} bg-white dark:bg-slate-800 border border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder={placeholder}
        />
      )
    }

    return (
      <div
        onClick={() => {
          setEditingItemId(itemId)
          setEditingField(field)
          setLocalValue(value)
        }}
        className={`${className} cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 rounded px-2 py-1 transition`}
      >
        {value || <span className="text-gray-400">{placeholder}</span>}
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Crie seu primeiro roadmap
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Organize features, planeje sprints e acompanhe o progresso do seu projeto em uma timeline visual
          </p>
          <button
            onClick={addGroup}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Criar Primeiro Grupo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="flex-none border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Roadmap</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {items.length} {items.length === 1 ? 'item' : 'itens'} • {groups.length} {groups.length === 1 ? 'grupo' : 'grupos'}
            </p>
          </div>
          <button
            onClick={addGroup}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Grupo
          </button>
        </div>
      </div>

      {/* Roadmap Table */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[1200px]">
          {/* Table Header */}
          <div className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
            <div className="flex">
              {/* Left columns */}
              <div className="flex-none w-[700px] flex border-r border-gray-200 dark:border-slate-800">
                <div className="w-12"></div>
                <div className="flex-1 px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Item
                </div>
                <div className="w-32 px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Owner
                </div>
                <div className="w-32 px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Status
                </div>
                <div className="w-40 px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Data de Vencimento
                </div>
                <div className="w-20 px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase text-center">
                  💬
                </div>
              </div>

              {/* Timeline columns */}
              <div className="flex-1 flex">
                {months.map((month, idx) => (
                  <div
                    key={idx}
                    className="flex-1 px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase border-l border-gray-200 dark:border-slate-800"
                  >
                    <div>{month.label}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-500">{month.date.getFullYear()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div>
            {groups.map((group) => {
              const groupItems = items.filter(item => item.groupId === group.id)
              const isCollapsed = collapsedGroups.has(group.id)

              return (
                <div key={group.id}>
                  {/* Group Header */}
                  <div className="flex items-center bg-gray-100 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 group/header">
                    <button
                      onClick={() => toggleGroupCollapse(group.id)}
                      className="w-12 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-800 h-12"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                    <div className="flex-1 flex items-center gap-3 py-3">
                      <div className="relative">
                        <button
                          className="w-6 h-6 rounded-md border-2 border-white dark:border-slate-800 shadow-sm hover:scale-110 transition-transform"
                          style={{ backgroundColor: group.color }}
                          onClick={() => setColorPickerGroupId(colorPickerGroupId === group.id ? null : group.id)}
                          title="Alterar cor do grupo"
                        />
                        {colorPickerGroupId === group.id && (
                          <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-20">
                            <div className="grid grid-cols-5 gap-2">
                              {GROUP_COLORS.map((colorOption) => (
                                <button
                                  key={colorOption.id}
                                  className="w-8 h-8 rounded-md border-2 hover:scale-110 transition-transform"
                                  style={{
                                    backgroundColor: colorOption.color,
                                    borderColor: group.color === colorOption.color ? '#fff' : 'transparent',
                                  }}
                                  onClick={() => {
                                    updateGroup(group.id, { color: colorOption.color })
                                    setColorPickerGroupId(null)
                                  }}
                                  title={colorOption.name}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <EditableField
                        value={group.name}
                        onChange={(value: string) => updateGroup(group.id, { name: value })}
                        itemId={group.id}
                        field="name"
                        className="font-semibold text-gray-900 dark:text-gray-100"
                        placeholder="Nome do grupo"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({groupItems.length})
                      </span>
                    </div>
                    <button
                      onClick={() => addItem(group.id)}
                      className="px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 opacity-0 group-hover/header:opacity-100 transition"
                    >
                      + Item
                    </button>
                    <button
                      onClick={() => deleteGroup(group.id)}
                      className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover/header:opacity-100 transition"
                    >
                      Excluir
                    </button>
                  </div>

                  {/* Group Items */}
                  {!isCollapsed && groupItems.map((item) => (
                    <div key={item.id} className="flex border-b border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-900/50 group/item">
                      {/* Left columns */}
                      <div className="flex-none w-[700px] flex border-r border-gray-200 dark:border-slate-800">
                        <div className="w-12 flex items-center justify-center">
                          <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-600 opacity-0 group-hover/item:opacity-100 cursor-grab" />
                        </div>
                        <div className="flex-1 px-4 py-3">
                          <EditableField
                            value={item.title}
                            onChange={(value: string) => updateItem(item.id, { title: value })}
                            itemId={item.id}
                            field="title"
                            className="text-sm text-gray-900 dark:text-gray-100 font-medium"
                            placeholder="Nome da tarefa"
                          />
                        </div>
                        <div className="w-32 px-4 py-3">
                          <EditableField
                            value={item.owner}
                            onChange={(value: string) => updateItem(item.id, { owner: value })}
                            itemId={item.id}
                            field="owner"
                            className="text-sm text-gray-600 dark:text-gray-400"
                            placeholder="—"
                          />
                        </div>
                        <div className="w-32 px-4 py-3">
                          <select
                            value={item.status}
                            onChange={(e) => updateItem(item.id, { status: e.target.value as any })}
                            className="text-xs font-medium text-white rounded-full px-3 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ backgroundColor: STATUS_CONFIG[item.status].color }}
                          >
                            <option value="backlog">Backlog</option>
                            <option value="planned">Planejado</option>
                            <option value="in-progress">Em progresso</option>
                            <option value="done">Concluído</option>
                          </select>
                        </div>
                        <div className="w-40 px-4 py-3">
                          <input
                            type="date"
                            value={item.dueDate}
                            onChange={(e) => updateItem(item.id, { dueDate: e.target.value })}
                            className="text-xs px-2 py-1 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                          />
                        </div>
                        <div className="w-20 px-4 py-3 flex items-center justify-center">
                          <button
                            onClick={() => setSelectedItemId(item.id)}
                            className="relative p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition"
                          >
                            <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            {item.comments && item.comments.length > 0 && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center">
                                {item.comments.length}
                              </span>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="flex-1 relative py-3">
                        <div className="absolute inset-y-0 left-0 right-0 flex">
                          {months.map((_, idx) => (
                            <div
                              key={idx}
                              className="flex-1 border-l border-gray-200 dark:border-slate-800"
                            />
                          ))}
                        </div>
                        <div className="relative px-2 h-full">
                          <div
                            className="absolute top-1/2 -translate-y-1/2 h-8 w-2 rounded-full shadow-sm hover:scale-125 transition-transform cursor-pointer group/marker"
                            style={{
                              ...getItemPosition(item),
                              backgroundColor: STATUS_CONFIG[item.status].color,
                            }}
                            title={`${item.title} - ${new Date(item.dueDate).toLocaleDateString('pt-BR')}`}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteItem(item.id)
                              }}
                              className="absolute -top-1 -right-1 opacity-0 group-hover/marker:opacity-100 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition text-[10px]"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Item Row */}
                  {!isCollapsed && (
                    <div className="flex border-b border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-900/50">
                      <div className="flex-none w-[700px] flex border-r border-gray-200 dark:border-slate-800">
                        <div className="w-12"></div>
                        <div className="flex-1 px-4 py-3">
                          <button
                            onClick={() => addItem(group.id)}
                            className="text-sm text-gray-400 dark:text-gray-600 hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
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
        </div>
      </div>

      {/* Comments Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedItemId(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex-none border-b border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {selectedItem.title}
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="px-2 py-1 rounded text-white text-xs font-medium" style={{ backgroundColor: STATUS_CONFIG[selectedItem.status].color }}>
                      {STATUS_CONFIG[selectedItem.status].label}
                    </span>
                    {selectedItem.owner && <span>• {selectedItem.owner}</span>}
                    {selectedItem.dueDate && <span>• {new Date(selectedItem.dueDate).toLocaleDateString('pt-BR')}</span>}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItemId(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-4">
                Comentários ({selectedItem.comments?.length || 0})
              </h3>

              {selectedItem.comments && selectedItem.comments.length > 0 ? (
                <div className="space-y-4">
                  {selectedItem.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {comment.author}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(comment.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {comment.text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Nenhum comentário ainda</p>
                </div>
              )}
            </div>

            {/* Add Comment */}
            <div className="flex-none border-t border-gray-200 dark:border-slate-700 p-6">
              <div className="flex gap-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Adicione um comentário..."
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      addComment(selectedItem.id)
                    }
                  }}
                />
                <button
                  onClick={() => addComment(selectedItem.id)}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 self-end"
                >
                  <Send className="w-4 h-4" />
                  Enviar
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Pressione Ctrl+Enter para enviar
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
