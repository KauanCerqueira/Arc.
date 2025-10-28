"use client";

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, Clock, Trash2 } from 'lucide-react';
import { usePageTemplateData } from '@/core/hooks/usePageTemplateData';
import { WorkspaceTemplateComponentProps } from '@/core/types/workspace.types';

type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  description?: string;
};

type CalendarTemplateData = {
  events: Event[];
};

const DEFAULT_DATA: CalendarTemplateData = {
  events: [
    { id: '1', title: 'Reunião de equipe', date: '2025-01-20', time: '10:00', description: 'Discussão sobre Q1' },
    { id: '2', title: 'Apresentação cliente', date: '2025-01-22', time: '14:30', description: 'Review do projeto' },
    { id: '3', title: 'Sprint planning', date: '2025-01-25', time: '09:00' },
  ],
};

export default function CalendarTemplate({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData, isSaving } = usePageTemplateData<CalendarTemplateData>(groupId, pageId, DEFAULT_DATA);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>(data.events ?? DEFAULT_DATA.events);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', time: '09:00', description: '' });

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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setShowEventModal(true);
  };

  const addEvent = () => {
    if (!newEvent.title || !selectedDay) return;

    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

    persistEvents((current) => [
      ...current,
      {
        id: Date.now().toString(),
        title: newEvent.title,
        date: dateStr,
        time: newEvent.time,
        description: newEvent.description,
      },
    ]);

    setNewEvent({ title: '', time: '09:00', description: '' });
    setShowEventModal(false);
    setSelectedDay(null);
  };

  const deleteEvent = (id: string) => {
    if (confirm('Excluir este evento?')) {
      persistEvents((current) => current.filter((event) => event.id !== id));
    }
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  const days = getDaysInMonth(currentDate);

  const upcomingEvents = [...events]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar - 2 colunas */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={previousMonth}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
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
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              {/* Day Names */}
              <div className="grid grid-cols-7 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  const dayEvents = day ? getEventsForDay(day) : [];
                  return (
                    <button
                      key={index}
                      onClick={() => day && handleDayClick(day)}
                      disabled={day === null}
                      className={`min-h-[100px] p-2 rounded-lg transition-all text-left ${
                        day === null 
                          ? 'bg-transparent cursor-default' 
                          : isToday(day)
                          ? 'bg-gray-900 dark:bg-slate-700 text-white hover:bg-gray-800 dark:hover:bg-slate-600 shadow-lg'
                          : 'bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
                      }`}
                    >
                      {day !== null && (
                        <>
                          <div className={`text-sm font-semibold mb-1 ${
                            isToday(day) 
                              ? 'text-white' 
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {day}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.map((event) => (
                              <div
                                key={event.id}
                                className={`text-xs px-1.5 py-0.5 rounded truncate ${
                                  isToday(day)
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                                }`}
                                title={`${event.time} - ${event.title}`}
                              >
                                {event.time}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Upcoming Events */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <CalendarIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Próximos Eventos</h3>
            </div>

            <div className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">📅</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nenhum evento agendado
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Clique em um dia para adicionar
                  </p>
                </div>
              ) : (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="group p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                          {event.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{event.date} • {event.time}</span>
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
                ))
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
                  Novo Evento - {selectedDay} de {monthNames[currentDate.getMonth()]}
                </h3>
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setSelectedDay(null);
                    setNewEvent({ title: '', time: '09:00', description: '' });
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
                  setNewEvent({ title: '', time: '09:00', description: '' });
                }}
                className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={addEvent}
                disabled={!newEvent.title.trim()}
                className="flex-1 px-4 py-3 bg-gray-900 dark:bg-slate-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
