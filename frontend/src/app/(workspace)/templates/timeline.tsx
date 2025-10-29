"use client";

import { useState } from 'react';
import { usePageTemplateData } from '@/core/hooks/usePageTemplateData';
import { WorkspaceTemplateComponentProps } from '@/core/types/workspace.types';
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  Edit2,
  Trash2,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';

type TimelineEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'milestone' | 'meeting' | 'release' | 'event';
  status: 'pending' | 'completed' | 'cancelled';
  location?: string;
  attendees?: string[];
};

const EVENT_TYPES = {
  milestone: { label: 'Marco', color: '#3B82F6', icon: '🎯' },
  meeting: { label: 'Reunião', color: '#8B5CF6', icon: '👥' },
  release: { label: 'Release', color: '#10B981', icon: '🚀' },
  event: { label: 'Evento', color: '#F59E0B', icon: '📅' },
};

const STATUS_CONFIG = {
  pending: { label: 'Pendente', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/20' },
  completed: { label: 'Concluído', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/20' },
  cancelled: { label: 'Cancelado', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-900/20' },
};

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
    {
      id: '4',
      title: 'Conferência Build in Public',
      description: 'Apresentação do Arc. na conferência',
      date: new Date(2025, 3, 20).toISOString(),
      type: 'event',
      status: 'pending',
      location: 'São Paulo Convention Center',
      attendees: ['Equipe completa'],
    },
    {
      id: '5',
      title: 'Feature: Templates Avançados',
      description: 'Implementação de novos templates',
      date: new Date(2025, 1, 28).toISOString(),
      type: 'milestone',
      status: 'pending',
    },
  ];

type TimelineTemplateData = {
  events: TimelineEvent[];
};

const DEFAULT_DATA: TimelineTemplateData = {
  events: DEFAULT_EVENTS,
};

export default function Timeline({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData } = usePageTemplateData<TimelineTemplateData>(groupId, pageId, DEFAULT_DATA);
  const events = data.events ?? DEFAULT_EVENTS;

  const updateEvents = (updater: TimelineEvent[] | ((current: TimelineEvent[]) => TimelineEvent[])) => {
    setData((current) => {
      const currentEvents = current.events ?? DEFAULT_EVENTS;
      const nextEvents =
        typeof updater === 'function'
          ? (updater as (current: TimelineEvent[]) => TimelineEvent[])(JSON.parse(JSON.stringify(currentEvents)))
          : updater;
      return {
        ...current,
        events: nextEvents,
      };
    });
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    type: 'milestone' as TimelineEvent['type'],
    status: 'pending' as TimelineEvent['status'],
    location: '',
    attendees: '',
  });

  // Filtrar eventos
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const formatDate = (dateIso: string) => {
    const date = new Date(dateIso);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatDateShort = (dateIso: string) => {
    const date = new Date(dateIso);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short'
    }).format(date);
  };

  const getMonthYear = (dateIso: string) => {
    const date = new Date(dateIso);
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const getDaysUntil = (dateIso: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateIso);
    eventDate.setHours(0, 0, 0, 0);
    const diff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) return `${Math.abs(diff)} dias atrás`;
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Amanhã';
    return `Em ${diff} dias`;
  };

  const groupedEvents = sortedEvents.reduce((acc, event) => {
    const key = getMonthYear(event.date);
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  // Adicionar/Editar evento
  const openModal = (event?: TimelineEvent) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        date: new Date(event.date).toISOString().split('T')[0],
        type: event.type,
        status: event.status,
        location: event.location || '',
        attendees: event.attendees?.join(', ') || '',
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        type: 'milestone',
        status: 'pending',
        location: '',
        attendees: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
  };

  const saveEvent = () => {
    if (!formData.title.trim() || !formData.date) return;

    const eventData: TimelineEvent = {
      id: editingEvent?.id || `${Date.now()}`,
      title: formData.title,
      description: formData.description,
      date: new Date(formData.date).toISOString(),
      type: formData.type,
      status: formData.status,
      location: formData.location || undefined,
      attendees: formData.attendees ? formData.attendees.split(',').map(a => a.trim()) : undefined,
    };

    if (editingEvent) {
      updateEvents(events => events.map(e => e.id === editingEvent.id ? eventData : e));
    } else {
      updateEvents(events => [...events, eventData]);
    }

    closeModal();
  };

  const deleteEvent = (id: string) => {
    if (confirm('Deletar este evento?')) {
      updateEvents(events => events.filter(e => e.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    updateEvents(events => events.map(e => {
      if (e.id === id) {
        if (e.status === 'pending') return { ...e, status: 'completed' as const };
        if (e.status === 'completed') return { ...e, status: 'pending' as const };
      }
      return e;
    }));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Linha do Tempo
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Gerencie marcos e eventos do projeto
              </p>
            </div>

            <button
              onClick={() => openModal()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">Novo Evento</span>
            </button>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar eventos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os tipos</option>
              {Object.entries(EVENT_TYPES).map(([type, config]) => (
                <option key={type} value={type}>{config.icon} {config.label}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          {sortedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Nenhum evento encontrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Tente ajustar os filtros'
                  : 'Adicione eventos para começar'}
              </p>
              <button
                onClick={() => openModal()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                Novo Evento
              </button>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(groupedEvents).map(([monthYear, monthEvents]) => (
                <div key={monthYear}>
                  {/* Mês/Ano */}
                  <div className="sticky top-0 bg-gray-50 dark:bg-slate-950 z-10 py-2 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 capitalize flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      {monthYear}
                    </h2>
                  </div>

                  {/* Eventos do mês */}
                  <div className="relative space-y-8">
                    {/* Linha vertical */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-800"></div>

                    {monthEvents.map((event, index) => {
                      const config = EVENT_TYPES[event.type];
                      const statusConfig = STATUS_CONFIG[event.status];
                      const eventDate = new Date(event.date);
                      eventDate.setHours(0, 0, 0, 0);
                      const isToday = eventDate.getTime() === today.getTime();
                      const isPast = eventDate < today;
                      const isUpcoming = !isPast && !isToday;

                      return (
                        <div key={event.id} className="relative flex items-start gap-6 group">
                          {/* Ponto na linha */}
                          <div className="relative flex-shrink-0">
                            <div
                              className={`w-12 h-12 rounded-full border-4 border-white dark:border-slate-950 shadow-lg flex items-center justify-center text-xl transition-transform group-hover:scale-110 ${
                                isToday ? 'ring-4 ring-blue-500/30 animate-pulse' :
                                event.status === 'completed' ? 'bg-green-100 dark:bg-green-900/40 ring-2 ring-green-500/30' :
                                event.status === 'cancelled' ? 'bg-gray-100 dark:bg-gray-900/40' :
                                'bg-white dark:bg-slate-900'
                              }`}
                              style={{
                                backgroundColor: event.status === 'pending' ? config.color + '20' : undefined,
                                borderColor: event.status === 'pending' ? config.color : undefined,
                              }}
                            >
                              {config.icon}
                            </div>

                            {/* Indicador "Hoje" */}
                            {isToday && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                !
                              </div>
                            )}
                          </div>

                          {/* Card do evento */}
                          <div className={`flex-1 bg-white dark:bg-slate-900 rounded-xl border-2 p-5 transition-all group-hover:shadow-xl ${
                            isToday ? 'border-blue-500 shadow-lg ring-2 ring-blue-500/20' :
                            event.status === 'completed' ? 'border-green-200 dark:border-green-800/50' :
                            event.status === 'cancelled' ? 'border-gray-200 dark:border-slate-800 opacity-60' :
                            'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                          }`}>
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    {event.title}
                                  </h3>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.color}`}>
                                    {statusConfig.label}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{formatDate(event.date)}</span>
                                  </div>
                                  <div className={`flex items-center gap-1 font-medium ${
                                    isToday ? 'text-blue-600 dark:text-blue-400' :
                                    isPast ? 'text-gray-500 dark:text-gray-500' :
                                    'text-orange-600 dark:text-orange-400'
                                  }`}>
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{getDaysUntil(event.date)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => toggleStatus(event.id)}
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                                  title={event.status === 'pending' ? 'Marcar como concluído' : 'Marcar como pendente'}
                                >
                                  <CheckCircle2 className={`w-4 h-4 ${
                                    event.status === 'completed' ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                                  }`} />
                                </button>
                                <button
                                  onClick={() => openModal(event)}
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                                  title="Editar"
                                >
                                  <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </button>
                                <button
                                  onClick={() => deleteEvent(event.id)}
                                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                  title="Deletar"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                </button>
                              </div>
                            </div>

                            {/* Description */}
                            {event.description && (
                              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                                {event.description}
                              </p>
                            )}

                            {/* Meta info */}
                            {(event.location || event.attendees) && (
                              <div className="flex flex-wrap gap-4 text-sm">
                                {event.location && (
                                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                                {event.attendees && event.attendees.length > 0 && (
                                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                    <Users className="w-3.5 h-3.5" />
                                    <span>{event.attendees.join(', ')}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Type badge */}
                            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
                              <span className="text-base">{config.icon}</span>
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {config.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 p-4">
        <div className="max-w-7xl mx-auto grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{events.length}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {events.filter(e => e.status === 'pending').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Pendentes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {events.filter(e => e.status === 'completed').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Concluídos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {events.filter(e => {
                const eventDate = new Date(e.date);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate >= today && e.status === 'pending';
              }).length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Próximos</div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {editingEvent ? 'Editar Evento' : 'Novo Evento'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do evento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Detalhes do evento"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(EVENT_TYPES).map(([type, config]) => (
                      <option key={type} value={type}>{config.icon} {config.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pendente</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Localização
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Local do evento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Participantes
                </label>
                <input
                  type="text"
                  value={formData.attendees}
                  onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome1, Nome2, Nome3"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Separe os nomes com vírgula
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={saveEvent}
                disabled={!formData.title.trim() || !formData.date}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingEvent ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
