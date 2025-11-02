"use client";

import { useEffect, useMemo, useState } from 'react';
import type React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Calendar as CalendarIcon,
  Clock,
  Trash2,
  Filter,
  List,
  Grid3X3,
  Tag,
} from 'lucide-react';
import { usePageTemplateData } from '@/core/hooks/usePageTemplateData';
import { WorkspaceTemplateComponentProps } from '@/core/types/workspace.types';

type Event = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  description?: string;
  category?: string; // visual tag
};

type CalendarTemplateData = {
  events: Event[];
};

const DEFAULT_DATA: CalendarTemplateData = {
  events: [
    { id: '1', title: 'Reunião de equipe', date: '2025-01-20', time: '10:00', description: 'Discussão sobre Q1', category: 'meeting' },
    { id: '2', title: 'Apresentação cliente', date: '2025-01-22', time: '14:30', description: 'Review do projeto', category: 'deadline' },
    { id: '3', title: 'Sprint planning', date: '2025-01-25', time: '09:00', category: 'task' },
  ],
};

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'meeting', label: 'Reunião' },
  { id: 'deadline', label: 'Entrega' },
  { id: 'personal', label: 'Pessoal' },
  { id: 'task', label: 'Tarefa' },
  { id: 'reminder', label: 'Lembrete' },
];

const CATEGORY_STYLES: Record<string, { chip: string; dot: string; badge: string }> = {
  meeting: {
    chip: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200/60 dark:border-blue-800',
    dot: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  deadline: {
    chip: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200/60 dark:border-rose-800',
    dot: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  },
  personal: {
    chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  task: {
    chip: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200/60 dark:border-amber-800',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  reminder: {
    chip: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200/60 dark:border-purple-800',
    dot: 'bg-purple-500',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  },
};

export default function CalendarTemplate({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData, isSaving } = usePageTemplateData<CalendarTemplateData>(groupId, pageId, DEFAULT_DATA);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>(data.events ?? DEFAULT_DATA.events);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({ title: '', time: '09:00', description: '', category: 'meeting' as string });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);

  useEffect(() => {
    setEvents(data.events ?? DEFAULT_DATA.events);
  }, [data.events]);

  const persistEvents = (updater: (current: Event[]) => Event[]) => {
    setEvents((current) => {
      const next = updater(current);
      setData((prev) => ({
        ...prev,
        events: next,
      }));
      return next;
    });
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const formatDateString = (year: number, month: number, day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return events.filter((e) => {
      const matchTerm = !term || e.title.toLowerCase().includes(term) || e.description?.toLowerCase().includes(term);
      const matchCat = categoryFilter === 'all' || !e.category || e.category === categoryFilter;
      return matchTerm && matchCat;
    });
  }, [events, search, categoryFilter]);

  const getEventsForDay = (day: number) => {
    const dateStr = formatDateString(currentDate.getFullYear(), currentDate.getMonth(), day);
    return filteredEvents.filter((event) => event.date === dateStr);
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setShowEventModal(true);
    setEditingEventId(null);
  };

  const addOrUpdateEvent = () => {
    if (!newEvent.title) return;
    const targetDay = selectedDay ?? Number(new Date().getDate());
    const dateStr = formatDateString(currentDate.getFullYear(), currentDate.getMonth(), targetDay);

    if (editingEventId) {
      persistEvents((current) =>
        current.map((e) =>
          e.id === editingEventId
            ? { ...e, title: newEvent.title, time: newEvent.time, description: newEvent.description, category: newEvent.category, date: dateStr }
            : e,
        ),
      );
    } else {
      persistEvents((current) => [
        ...current,
        {
          id: Date.now().toString(),
          title: newEvent.title,
          date: dateStr,
          time: newEvent.time,
          description: newEvent.description,
          category: newEvent.category,
        },
      ]);
    }

    setNewEvent({ title: '', time: '09:00', description: '', category: newEvent.category || 'meeting' });
    setShowEventModal(false);
    setSelectedDay(null);
    setEditingEventId(null);
  };

  const deleteEvent = (id: string) => {
    if (confirm('Excluir este evento?')) {
      persistEvents((current) => current.filter((event) => event.id !== id));
    }
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const days = getDaysInMonth(currentDate);

  const upcomingEvents = useMemo(() => {
    return [...filteredEvents]
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
      .slice(0, 10);
  }, [filteredEvents]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [] as Event[];
    return getEventsForDay(selectedDay);
  }, [selectedDay, currentDate, filteredEvents]);

  const showDayDetails = (day: number) => {
    setSelectedDay(day);
    // scroll até o painel de detalhes no mobile
    setTimeout(() => {
      const el = document.getElementById('day-details');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 't') setCurrentDate(new Date());
      if (e.key.toLowerCase() === 'n') {
        setSelectedDay(new Date().getDate());
        setShowEventModal(true);
        setEditingEventId(null);
      }
      if (e.key === 'ArrowLeft') previousMonth();
      if (e.key === 'ArrowRight') nextMonth();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentDate]);

  // Simple .ics export
  const exportIcs = () => {
    const icsHeader = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Projectly//Calendar//PT-BR\n';
    const icsEvents = filteredEvents
      .map((e) => {
        const dt = `${e.date.replace(/-/g, '')}T${e.time.replace(':', '')}00`;
        const uid = `${e.id}@projectly`;
        const summary = (e.title || '').replace(/\n/g, ' ');
        const description = (e.description || '').replace(/\n/g, ' ');
        return `BEGIN:VEVENT\nUID:${uid}\nDTSTART:${dt}\nSUMMARY:${summary}\nDESCRIPTION:${description}\nEND:VEVENT\n`;
      })
      .join('');
    const ics = icsHeader + icsEvents + 'END:VCALENDAR\n';
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projectly-calendar.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Drag and drop handlers (native)
  const onEventDragStart = (e: React.DragEvent, eventId: string) => {
    e.dataTransfer.setData('text/plain', eventId);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDayDragOver = (e: React.DragEvent, day: number | null) => {
    if (day === null) return;
    e.preventDefault();
    setDragOverDay(day);
  };
  const onDayDragLeave = (_e: React.DragEvent, _day: number | null) => {
    setDragOverDay(null);
  };
  const onDayDrop = (e: React.DragEvent, day: number | null) => {
    if (day === null) return;
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    const newDate = formatDateString(currentDate.getFullYear(), currentDate.getMonth(), day);
    persistEvents((current) => current.map((ev) => (ev.id === id ? { ...ev, date: newDate } : ev)));
    setDragOverDay(null);
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 md:mt-10">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar - 2 colunas */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  {isSaving && (
                    <span className="text-xs text-gray-500">Salvando...</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1 border border-gray-200 dark:border-slate-700 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('month')}
                      className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1.5 ${
                        viewMode === 'month'
                          ? 'bg-gray-900 text-white dark:bg-slate-700'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                      }`}
                      title="Modo mês"
                    >
                      <Grid3X3 className="w-4 h-4" />
                      <span className="hidden md:inline">Mês</span>
                    </button>
                    <button
                      onClick={() => setViewMode('agenda')}
                      className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1.5 ${
                        viewMode === 'agenda'
                          ? 'bg-gray-900 text-white dark:bg-slate-700'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                      }`}
                      title="Modo agenda"
                    >
                      <List className="w-4 h-4" />
                      <span className="hidden md:inline">Agenda</span>
                    </button>
                  </div>
                  <button
                    onClick={previousMonth}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                    title="Mês anterior"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                  >
                    Hoje
                  </button>
                  <button
                    onClick={nextMonth}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                    title="Próximo mês"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar evento..."
                      className="w-full sm:w-72 pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                    />
                    <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Categoria:</span>
                    <div className="relative">
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value as any)}
                        className="text-sm pl-8 pr-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-700 dark:text-gray-300 focus:outline-none"
                      >
                        <option value="all">Todas</option>
                        {CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                      <Tag className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedDay(new Date().getDate());
                    setShowEventModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white dark:bg-slate-700 hover:bg-gray-800 dark:hover:bg-slate-600"
                >
                  <Plus className="w-4 h-4" /> Novo evento
                </button>
                <button
                  onClick={exportIcs}
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                  title="Exportar .ics"
                >
                  <CalendarIcon className="w-4 h-4" /> Exportar .ics
                </button>
              </div>
            </div>

            {/* Calendar Grid or Agenda */}
            {viewMode === 'month' ? (
              <div className="p-6">
                {/* Day Names */}
                <div className="grid grid-cols-7 mb-2">
                  {dayNames.map((day) => (
                    <div key={day} className="text-center text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {days.map((day, index) => {
                    const dayEvents = day ? getEventsForDay(day) : [];
                    const isWeekend = index % 7 === 0 || index % 7 === 6;
                    return (
                      <button
                        key={index}
                        onClick={() => day && handleDayClick(day)}
                        disabled={day === null}
                        onDragOver={(e) => onDayDragOver(e, day)}
                        onDrop={(e) => onDayDrop(e, day)}
                        onDragLeave={(e) => onDayDragLeave(e, day)}
                        className={`min-h-[68px] sm:min-h-[96px] md:min-h-[110px] p-2 rounded-lg transition-all text-left border ${
                          day === null
                            ? 'bg-transparent border-transparent cursor-default'
                            : isToday(day)
                            ? 'bg-gray-900 dark:bg-slate-700 text-white border-transparent hover:bg-gray-800 dark:hover:bg-slate-600'
                            : `bg-gray-50 dark:bg-slate-900/50 hover:bg-gray-100 dark:hover:bg-slate-800 ${isWeekend ? 'opacity-95' : ''} border-gray-200 dark:border-slate-800`
                        } ${
                          dragOverDay !== null && dragOverDay === day && !isToday(day)
                            ? 'ring-2 ring-gray-300 dark:ring-slate-600'
                            : ''
                        }`}
                        title={day ? `Adicionar evento em ${day}/${currentDate.getMonth() + 1}` : ''}
                      >
                        {day && (
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-semibold ${isToday(day) ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                              {day}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {dayEvents.length > 0 ? `${dayEvents.length} evento${dayEvents.length > 1 ? 's' : ''}` : ''}
                            </span>
                          </div>
                        )}

                        {/* Day events chips */}
                        {dayEvents.length > 0 && (
                          <div className="space-y-1">
                            {dayEvents.slice(0, 3).map((event) => {
                              const cat = event.category && CATEGORY_STYLES[event.category];
                              return (
                                <div
                                  key={event.id}
                                  draggable={true}
                                  onDragStart={(e) => onEventDragStart(e, event.id)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Edit this event
                                    setEditingEventId(event.id);
                                    setSelectedDay(day);
                                    setNewEvent({
                                      title: event.title,
                                      time: event.time,
                                      description: event.description || '',
                                      category: event.category || 'meeting',
                                    });
                                    setShowEventModal(true);
                                  }}
                                  className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 border cursor-grab active:cursor-grabbing ${
                                    isToday(day!) ? 'bg-white/10 text-white border-white/20' : cat?.chip || 'bg-white/70 dark:bg-slate-800/80 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700'
                                  }`}
                                  title={`${event.time} · ${event.title}`}
                                >
                                  <span className={`w-2 h-2 rounded-full ${cat?.dot || 'bg-gray-400'}`} />
                                  <span className="truncate">{event.time} · {event.title}</span>
                                </div>
                              );
                            })}
                            {dayEvents.length > 3 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showDayDetails(day!);
                                }}
                                className={`text-[11px] underline ${isToday(day!) ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}
                                title="Ver todos os eventos do dia"
                              >
                                +{dayEvents.length - 3} mais
                              </button>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-6">
                {upcomingEvents.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                    Nenhum evento na agenda
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => {
                      const d = new Date(`${event.date}T${event.time}`);
                      const cat = event.category && CATEGORY_STYLES[event.category];
                      return (
                        <div key={event.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/40">
                          <div className={`mt-1 w-2 h-2 rounded-full ${cat?.dot || 'bg-gray-400'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">{event.title}</div>
                              <div className={`text-[11px] px-2 py-0.5 rounded-full ${cat?.badge || 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300'}`}>{event.category ? CATEGORIES.find(c=>c.id===event.category)?.label : 'Evento'}</div>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>
                                {d.toLocaleDateString()} · {event.time}
                              </span>
                            </div>
                            {event.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{event.description}</p>
                            )}
                          </div>
                          <button onClick={() => deleteEvent(event.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right column - Day details or Upcoming */}
        <div id="day-details">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {selectedDay ? `Dia ${selectedDay} · ${monthNames[currentDate.getMonth()]}` : 'Próximos eventos'}
                </h3>
              </div>
              {isSaving && (
                <span className="text-xs text-gray-500">Salvando...</span>
              )}
            </div>

            <div className="p-6 space-y-3">
              {selectedDay ? (
                selectedDayEvents.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                    Nenhum evento neste dia
                  </div>
                ) : (
                  selectedDayEvents.map((event) => {
                    const cat = event.category && CATEGORY_STYLES[event.category];
                    return (
                      <div
                        key={event.id}
                        className="group p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-2 h-2 rounded-full ${cat?.dot || 'bg-gray-400'}`} />
                              <button
                                className="font-semibold text-left text-gray-900 dark:text-gray-100 truncate hover:underline"
                                onClick={() => {
                                  setEditingEventId(event.id);
                                  setSelectedDay(selectedDay);
                                  setNewEvent({
                                    title: event.title,
                                    time: event.time,
                                    description: event.description || '',
                                    category: event.category || 'meeting',
                                  });
                                  setShowEventModal(true);
                                }}
                              >
                                {event.title}
                              </button>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{event.time}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteEvent(event.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                        {event.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                    );
                  })
                )
              ) : (
                upcomingEvents.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                    Nenhum evento cadastrado
                  </div>
                ) : (
                  upcomingEvents.map((event) => {
                    const cat = event.category && CATEGORY_STYLES[event.category];
                    return (
                      <div
                        key={event.id}
                        className="group p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-2 h-2 rounded-full ${cat?.dot || 'bg-gray-400'}`} />
                              <button
                                className="font-semibold text-left text-gray-900 dark:text-gray-100 truncate hover:underline"
                                onClick={() => {
                                  const d = new Date(event.date);
                                  setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
                                  setSelectedDay(d.getDate());
                                  setEditingEventId(event.id);
                                  setNewEvent({
                                    title: event.title,
                                    time: event.time,
                                    description: event.description || '',
                                    category: event.category || 'meeting',
                                  });
                                  setShowEventModal(true);
                                }}
                              >
                                {event.title}
                              </button>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{event.date} · {event.time}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteEvent(event.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                        {event.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                    );
                  })
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal - Add Event */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-slate-800">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {editingEventId ? 'Editar Evento' : 'Novo Evento'}{selectedDay ? ` - ${selectedDay} de ${monthNames[currentDate.getMonth()]}` : ''}
                </h3>
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setSelectedDay(null);
                    setNewEvent({ title: '', time: '09:00', description: '', category: newEvent.category || 'meeting' });
                    setEditingEventId(null);
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Nome do evento"
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoria
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => {
                      const active = newEvent.category === c.id;
                      const badge = CATEGORY_STYLES[c.id]?.badge || 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300';
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setNewEvent({ ...newEvent, category: c.id })}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border ${badge} ${active ? 'ring-2 ring-offset-1 ring-gray-300 dark:ring-slate-600 ring-offset-white dark:ring-offset-slate-900' : ''}`}
                        >
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Adicione detalhes sobre o evento"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 resize-none"
                />
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setSelectedDay(null);
                  setNewEvent({ title: '', time: '09:00', description: '', category: newEvent.category || 'meeting' });
                }}
                className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={addOrUpdateEvent}
                disabled={!newEvent.title.trim()}
                className="flex-1 px-4 py-3 bg-gray-900 dark:bg-slate-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingEventId ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
