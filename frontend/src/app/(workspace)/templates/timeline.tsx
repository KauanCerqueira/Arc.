"use client"

import { useState } from 'react'
import { usePageTemplateData } from '@/core/hooks/usePageTemplateData'
import { WorkspaceTemplateComponentProps } from '@/core/types/workspace.types'
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  Edit2,
  Trash2,
  Search,
  Clock,
  CheckCircle2,
  X,
  Circle,
  Flag,
  Sparkles,
  Rocket,
  Target,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'

type TimelineEvent = {
  id: string
  title: string
  description: string
  date: string
  type: 'milestone' | 'meeting' | 'release' | 'event'
  status: 'pending' | 'completed' | 'cancelled'
  location?: string
  attendees?: string[]
}

const EVENT_TYPES = {
  milestone: { label: 'Marco', color: 'from-blue-500 to-blue-600', icon: Target, iconColor: 'text-blue-600' },
  meeting: { label: 'Reunião', color: 'from-purple-500 to-purple-600', icon: Users, iconColor: 'text-purple-600' },
  release: { label: 'Release', color: 'from-green-500 to-green-600', icon: Rocket, iconColor: 'text-green-600' },
  event: { label: 'Evento', color: 'from-orange-500 to-orange-600', icon: Sparkles, iconColor: 'text-orange-600' },
}

const DEFAULT_EVENTS: TimelineEvent[] = [
  {
    id: '1',
    title: 'Lançamento do MVP',
    description: 'Primeira versão do Arc. disponível para testes',
    date: new Date(2025, 0, 15).toISOString(),
    type: 'milestone',
    status: 'completed',
  },
  {
    id: '2',
    title: 'Sprint Planning',
    description: 'Planejamento da Sprint #5',
    date: new Date(2025, 1, 1).toISOString(),
    type: 'meeting',
    status: 'completed',
    location: 'Sala de Reunião Virtual',
    attendees: ['João', 'Maria', 'Pedro'],
  },
  {
    id: '3',
    title: 'Release v1.0',
    description: 'Lançamento oficial da versão 1.0',
    date: new Date(2025, 2, 15).toISOString(),
    type: 'release',
    status: 'pending',
  },
]

type TimelineTemplateData = {
  events: TimelineEvent[]
}

const DEFAULT_DATA: TimelineTemplateData = {
  events: DEFAULT_EVENTS,
}

export default function Timeline({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData } = usePageTemplateData<TimelineTemplateData>(groupId, pageId, DEFAULT_DATA)
  const events = data.events ?? DEFAULT_EVENTS

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    type: 'milestone' as TimelineEvent['type'],
    status: 'pending' as TimelineEvent['status'],
    location: '',
    attendees: '',
  })

  const filteredEvents = events
    .filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === 'all' || event.type === filterType
      const matchesStatus = filterStatus === 'all' || event.status === filterStatus
      return matchesSearch && matchesType && matchesStatus
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const formatDate = (dateIso: string) => {
    const date = new Date(dateIso)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date)
  }

  const getDaysUntil = (dateIso: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const eventDate = new Date(dateIso)
    eventDate.setHours(0, 0, 0, 0)
    const diff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diff < 0) return `${Math.abs(diff)} dias atrás`
    if (diff === 0) return 'Hoje'
    if (diff === 1) return 'Amanhã'
    return `Em ${diff} dias`
  }

  const openModal = (event?: TimelineEvent) => {
    if (event) {
      setEditingEvent(event)
      setFormData({
        title: event.title,
        description: event.description,
        date: new Date(event.date).toISOString().split('T')[0],
        type: event.type,
        status: event.status,
        location: event.location || '',
        attendees: event.attendees?.join(', ') || '',
      })
    } else {
      setEditingEvent(null)
      setFormData({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        type: 'milestone',
        status: 'pending',
        location: '',
        attendees: '',
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingEvent(null)
  }

  const saveEvent = () => {
    if (!formData.title.trim() || !formData.date) return

    const eventData: TimelineEvent = {
      id: editingEvent?.id || `${Date.now()}`,
      title: formData.title,
      description: formData.description,
      date: new Date(formData.date).toISOString(),
      type: formData.type,
      status: formData.status,
      location: formData.location || undefined,
      attendees: formData.attendees ? formData.attendees.split(',').map((a) => a.trim()) : undefined,
    }

    if (editingEvent) {
      setData((current) => ({
        ...current,
        events: current.events.map((e) => (e.id === editingEvent.id ? eventData : e)),
      }))
    } else {
      setData((current) => ({
        ...current,
        events: [...current.events, eventData],
      }))
    }

    closeModal()
  }

  const deleteEvent = (id: string) => {
    if (confirm('Deletar este evento?')) {
      setData((current) => ({
        ...current,
        events: current.events.filter((e) => e.id !== id),
      }))
    }
  }

  const toggleStatus = (id: string) => {
    setData((current) => ({
      ...current,
      events: current.events.map((e) => {
        if (e.id === id) {
          if (e.status === 'pending') return { ...e, status: 'completed' as const }
          if (e.status === 'completed') return { ...e, status: 'pending' as const }
        }
        return e
      }),
    }))
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="h-full flex flex-col bg-arc-primary">
      {/* Header Fixo */}
      <div className="sticky top-0 z-10 bg-arc-primary border-b border-arc backdrop-blur-sm bg-opacity-95">
        <div className="px-3 sm:px-6 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-arc">Linha do Tempo</h1>
              <p className="text-xs text-arc-muted mt-0.5">Marcos e eventos do projeto</p>
            </div>

            <Button onClick={() => openModal()} size="sm" className="h-8 px-2.5">
              <Plus className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Novo Evento</span>
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
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-arc rounded-lg bg-arc-secondary text-arc text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
            >
              <option value="all">Todos tipos</option>
              {Object.entries(EVENT_TYPES).map(([type, config]) => (
                <option key={type} value={type}>
                  {config.label}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-arc rounded-lg bg-arc-secondary text-arc text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
            >
              <option value="all">Todos status</option>
              <option value="pending">Pendente</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        {filteredEvents.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 bg-arc-secondary rounded-lg flex items-center justify-center">
                <Calendar className="w-8 h-8 text-arc-muted" />
              </div>
              <h2 className="text-lg font-semibold text-arc mb-2">Nenhum evento encontrado</h2>
              <p className="text-sm text-arc-muted mb-6">
                {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Tente ajustar os filtros'
                  : 'Adicione eventos para começar sua linha do tempo'}
              </p>
              <Button onClick={() => openModal()} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Criar Evento
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Linha vertical */}
              <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 opacity-30" />

              {/* Eventos */}
              <div className="space-y-6">
                {filteredEvents.map((event, index) => {
                  const config = EVENT_TYPES[event.type]
                  const Icon = config.icon
                  const eventDate = new Date(event.date)
                  eventDate.setHours(0, 0, 0, 0)
                  const isToday = eventDate.getTime() === today.getTime()
                  const isPast = eventDate < today

                  return (
                    <div key={event.id} className="relative flex gap-4">
                      {/* Icon */}
                      <div className="relative flex-shrink-0">
                        <div
                          className={cn(
                            'w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-300',
                            event.status === 'completed'
                              ? 'bg-green-100 dark:bg-green-900/30 ring-2 ring-green-500/50'
                              : event.status === 'cancelled'
                              ? 'bg-gray-100 dark:bg-gray-900/30 ring-2 ring-gray-500/30'
                              : `bg-gradient-to-br ${config.color} ring-2 ring-white dark:ring-gray-900`,
                            isToday && 'ring-4 ring-blue-500/30 animate-pulse'
                          )}
                        >
                          {event.status === 'completed' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <Icon className="w-5 h-5 text-white" />
                          )}
                        </div>

                        {/* Badge "Hoje" */}
                        {isToday && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-[10px] font-bold">!</span>
                          </div>
                        )}
                      </div>

                      {/* Card */}
                      <div
                        className={cn(
                          'flex-1 group relative rounded-xl border-2 p-4 transition-all duration-300',
                          event.status === 'completed'
                            ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50'
                            : event.status === 'cancelled'
                            ? 'bg-gray-50 dark:bg-gray-900/10 border-gray-200 dark:border-gray-800 opacity-60'
                            : 'bg-arc-secondary border-arc hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700',
                          isToday && 'ring-2 ring-blue-500/20 border-blue-400 dark:border-blue-600'
                        )}
                      >
                        {/* Actions */}
                        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => toggleStatus(event.id)}
                            className="p-1.5 hover:bg-arc-primary rounded-lg transition"
                            title={event.status === 'pending' ? 'Marcar como concluído' : 'Marcar como pendente'}
                          >
                            <CheckCircle2
                              className={cn(
                                'w-4 h-4',
                                event.status === 'completed' ? 'text-green-600' : 'text-arc-muted'
                              )}
                            />
                          </button>
                          <button
                            onClick={() => openModal(event)}
                            className="p-1.5 hover:bg-arc-primary rounded-lg transition"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4 text-arc-muted" />
                          </button>
                          <button
                            onClick={() => deleteEvent(event.id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                            title="Deletar"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="pr-20">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-base font-semibold text-arc">{event.title}</h3>
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium',
                                event.status === 'completed' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                                event.status === 'cancelled' && 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400',
                                event.status === 'pending' && 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                              )}
                            >
                              {event.status === 'completed' ? 'Concluído' : event.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-arc-muted mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(event.date)}</span>
                            </div>
                            <div
                              className={cn(
                                'flex items-center gap-1 font-medium',
                                isToday ? 'text-blue-600 dark:text-blue-400' : isPast ? 'text-gray-500' : 'text-orange-600 dark:text-orange-400'
                              )}
                            >
                              <Clock className="w-3 h-3" />
                              <span>{getDaysUntil(event.date)}</span>
                            </div>
                          </div>

                          {event.description && (
                            <p className="text-sm text-arc mb-3 leading-relaxed">{event.description}</p>
                          )}

                          {(event.location || event.attendees) && (
                            <div className="flex flex-wrap gap-3 text-xs mb-3">
                              {event.location && (
                                <div className="flex items-center gap-1 text-arc-muted">
                                  <MapPin className="w-3 h-3" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                              {event.attendees && event.attendees.length > 0 && (
                                <div className="flex items-center gap-1 text-arc-muted">
                                  <Users className="w-3 h-3" />
                                  <span>{event.attendees.join(', ')}</span>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-arc-primary border border-arc rounded-lg">
                            <Icon className={cn('w-3 h-3', config.iconColor)} />
                            <span className="text-xs font-medium text-arc">{config.label}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {events.length > 0 && (
        <div className="border-t border-arc px-3 sm:px-6 py-3">
          <div className="grid grid-cols-4 gap-2 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-arc">{events.length}</div>
              <div className="text-[10px] sm:text-xs text-arc-muted">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-orange-600">
                {events.filter((e) => e.status === 'pending').length}
              </div>
              <div className="text-[10px] sm:text-xs text-arc-muted">Pendentes</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-green-600">
                {events.filter((e) => e.status === 'completed').length}
              </div>
              <div className="text-[10px] sm:text-xs text-arc-muted">Concluídos</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-blue-600">
                {
                  events.filter((e) => {
                    const eventDate = new Date(e.date)
                    eventDate.setHours(0, 0, 0, 0)
                    return eventDate >= today && e.status === 'pending'
                  }).length
                }
              </div>
              <div className="text-[10px] sm:text-xs text-arc-muted">Próximos</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-arc-primary rounded-2xl w-full max-w-2xl shadow-2xl border border-arc">
            <div className="p-6 border-b border-arc flex items-center justify-between">
              <h2 className="text-xl font-bold text-arc">{editingEvent ? 'Editar Evento' : 'Novo Evento'}</h2>
              <button onClick={closeModal} className="p-1 hover:bg-arc-secondary rounded transition-colors">
                <X className="w-5 h-5 text-arc" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-arc mb-2">Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-arc rounded-lg bg-arc-secondary text-arc focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do evento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-arc mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-arc rounded-lg bg-arc-secondary text-arc focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Detalhes do evento"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-arc mb-2">Data *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-arc rounded-lg bg-arc-secondary text-arc focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-arc mb-2">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-arc rounded-lg bg-arc-secondary text-arc focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(EVENT_TYPES).map(([type, config]) => (
                      <option key={type} value={type}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-arc mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-arc rounded-lg bg-arc-secondary text-arc focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pendente</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-arc mb-2">Localização</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-arc rounded-lg bg-arc-secondary text-arc focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Local do evento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-arc mb-2">Participantes</label>
                <input
                  type="text"
                  value={formData.attendees}
                  onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                  className="w-full px-4 py-2 border border-arc rounded-lg bg-arc-secondary text-arc focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome1, Nome2, Nome3"
                />
                <p className="text-xs text-arc-muted mt-1">Separe os nomes com vírgula</p>
              </div>
            </div>

            <div className="p-6 pt-4 border-t border-arc flex justify-end gap-3">
              <Button onClick={closeModal} variant="outline" size="sm">
                Cancelar
              </Button>
              <Button onClick={saveEvent} size="sm" disabled={!formData.title.trim() || !formData.date}>
                {editingEvent ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
