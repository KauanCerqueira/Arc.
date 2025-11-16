"use client";

import { useEffect, useMemo, useState, useCallback } from 'react';
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
  Video,
  CheckSquare,
  MapPin,
  Users,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Download,
  Search,
  MoreVertical,
  Edit,
} from 'lucide-react';
import { usePageTemplateData } from '@/core/hooks/usePageTemplateData';
import { WorkspaceTemplateComponentProps } from '@/core/types/workspace.types';
import { useWorkspaceStore } from '@/core/store/workspaceStore';
import { format, addDays, startOfWeek, startOfMonth, endOfMonth, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ===========================================
// TYPES
// ===========================================

type Event = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  endTime?: string; // HH:mm
  description?: string;
  category?: string;
  googleMeetLink?: string;
  location?: string;
  attendees?: string[];
  linkedTaskId?: string;
  linkedPageId?: string;
  isFromTask?: boolean;
};

type Task = {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  pageId: string;
  pageName: string;
};

type CalendarTemplateData = {
  events: Event[];
  settings?: {
    showTasks: boolean;
    defaultView: 'month' | 'week' | 'agenda';
    workingHoursStart: string;
    workingHoursEnd: string;
  };
};

type ViewMode = 'month' | 'week' | 'agenda';

const DEFAULT_DATA: CalendarTemplateData = {
  events: [],
  settings: {
    showTasks: true,
    defaultView: 'month',
    workingHoursStart: '08:00',
    workingHoursEnd: '18:00',
  },
};

// ===========================================
// CONSTANTS
// ===========================================

const CATEGORIES = [
  { id: 'meeting', label: 'Reunião', color: 'blue' },
  { id: 'deadline', label: 'Entrega', color: 'rose' },
  { id: 'personal', label: 'Pessoal', color: 'emerald' },
  { id: 'task', label: 'Tarefa', color: 'amber' },
  { id: 'reminder', label: 'Lembrete', color: 'purple' },
];

const CATEGORY_STYLES: Record<string, { chip: string; dot: string; bg: string }> = {
  meeting: {
    chip: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/10',
  },
  deadline: {
    chip: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-900/10',
  },
  personal: {
    chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/10',
  },
  task: {
    chip: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/10',
  },
  reminder: {
    chip: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    dot: 'bg-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/10',
  },
};

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
const WEEK_HOURS = Array.from({ length: 14 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`); // 6h às 20h

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAY_NAMES_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// ===========================================
// HELPER FUNCTIONS
// ===========================================

const formatDateString = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const generateGoogleMeetLink = () => {
  const code = Math.random().toString(36).substring(2, 12);
  return `https://meet.google.com/${code}`;
};

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

const getWeekDays = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

// ===========================================
// MAIN COMPONENT
// ===========================================

export default function CalendarTemplate({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const workspace = useWorkspaceStore((state) => state.workspace);
  const { data, setData, isSaving } = usePageTemplateData<CalendarTemplateData>(groupId, pageId, DEFAULT_DATA);

  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>(data.events ?? []);
  const [viewMode, setViewMode] = useState<ViewMode>(data.settings?.defaultView ?? 'month');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');
  const [showTasks, setShowTasks] = useState(data.settings?.showTasks ?? true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '09:00',
    endTime: '10:00',
    description: '',
    category: 'meeting',
    location: '',
    attendees: [] as string[],
    googleMeetLink: '',
  });

  // Sync events from data
  useEffect(() => {
    setEvents(data.events ?? []);
  }, [data.events]);

  // Load tasks from all pages
  useEffect(() => {
    if (!workspace) return;

    const loadTasks = async () => {
      const allTasks: Task[] = [];

      workspace.groups.forEach((group) => {
        group.pages.forEach((page) => {
          if (page.data) {
            try {
              const pageData = page.data;
              if (pageData.tasks && Array.isArray(pageData.tasks)) {
                pageData.tasks.forEach((task: any) => {
                  if (task.dueDate) {
                    allTasks.push({
                      id: task.id,
                      title: task.title,
                      status: task.status,
                      priority: task.priority,
                      dueDate: task.dueDate,
                      pageId: page.id,
                      pageName: page.name,
                    });
                  }
                });
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        });
      });

      setTasks(allTasks);
    };

    loadTasks();
  }, [workspace]);

  // Persist events
  const persistEvents = useCallback((updater: (current: Event[]) => Event[]) => {
    setEvents((current) => {
      const next = updater(current);
      setData((prev) => ({
        ...prev,
        events: next,
      }));
      return next;
    });
  }, [setData]);

  // Persist settings
  const persistSettings = useCallback((updates: Partial<CalendarTemplateData['settings']>) => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...updates,
      } as any,
    }));
  }, [setData]);

  // Handle show tasks toggle
  const handleToggleTasks = useCallback((value: boolean) => {
    setShowTasks(value);
    persistSettings({ showTasks: value });
  }, [persistSettings]);

  // Get events for a date
  const getEventsForDate = useCallback((date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const eventsList = events.filter((event) => event.date === dateStr);

    // Add tasks as events if enabled
    if (showTasks) {
      const taskEvents = tasks
        .filter((task) => task.dueDate === dateStr && task.status !== 'done')
        .map((task) => ({
          id: `task-${task.id}`,
          title: task.title,
          date: dateStr,
          time: '23:59',
          category: 'task',
          isFromTask: true,
          linkedTaskId: task.id,
          linkedPageId: task.pageId,
          description: `Tarefa de: ${task.pageName}`,
        } as Event));

      return [...eventsList, ...taskEvents];
    }

    return eventsList;
  }, [events, tasks, showTasks]);

  // Filter events
  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();
    let filtered = events;

    if (term) {
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(term) ||
          e.description?.toLowerCase().includes(term) ||
          e.location?.toLowerCase().includes(term)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((e) => e.category === categoryFilter);
    }

    return filtered;
  }, [events, search, categoryFilter]);

  // Navigation
  const previousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  const previousWeek = () => setCurrentDate(addDays(currentDate, -7));
  const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const goToToday = () => setCurrentDate(new Date());

  // Add/Update Event
  const handleSaveEvent = () => {
    if (!newEvent.title.trim()) return;

    const targetDate = selectedDay || new Date();
    const dateStr = format(targetDate, 'yyyy-MM-dd');

    if (editingEventId) {
      persistEvents((current) =>
        current.map((e) =>
          e.id === editingEventId
            ? {
                ...e,
                title: newEvent.title,
                time: newEvent.time,
                endTime: newEvent.endTime,
                description: newEvent.description,
                category: newEvent.category,
                location: newEvent.location,
                attendees: newEvent.attendees,
                googleMeetLink: newEvent.googleMeetLink,
                date: dateStr,
              }
            : e
        )
      );
    } else {
      persistEvents((current) => [
        ...current,
        {
          id: Date.now().toString(),
          title: newEvent.title,
          date: dateStr,
          time: newEvent.time,
          endTime: newEvent.endTime,
          description: newEvent.description,
          category: newEvent.category,
          location: newEvent.location,
          attendees: newEvent.attendees,
          googleMeetLink: newEvent.googleMeetLink,
        },
      ]);
    }

    closeModal();
  };

  const deleteEvent = (id: string) => {
    if (confirm('Excluir este evento?')) {
      persistEvents((current) => current.filter((event) => event.id !== id));
    }
  };

  const openEventModal = (date?: Date, event?: Event) => {
    if (event) {
      setEditingEventId(event.id);
      setNewEvent({
        title: event.title,
        time: event.time,
        endTime: event.endTime || '',
        description: event.description || '',
        category: event.category || 'meeting',
        location: event.location || '',
        attendees: event.attendees || [],
        googleMeetLink: event.googleMeetLink || '',
      });
    } else {
      setEditingEventId(null);
      setNewEvent({
        title: '',
        time: '09:00',
        endTime: '10:00',
        description: '',
        category: 'meeting',
        location: '',
        attendees: [],
        googleMeetLink: '',
      });
    }
    setSelectedDay(date || new Date());
    setShowEventModal(true);
  };

  const closeModal = () => {
    setShowEventModal(false);
    setSelectedDay(null);
    setEditingEventId(null);
  };

  const handleGenerateMeetLink = () => {
    setNewEvent((prev) => ({ ...prev, googleMeetLink: generateGoogleMeetLink() }));
  };

  const isToday = (date: Date) => isSameDay(date, new Date());

  // Export ICS
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

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key.toLowerCase() === 't') goToToday();
      if (e.key.toLowerCase() === 'n') openEventModal();
      if (e.key === 'ArrowLeft') viewMode === 'week' ? previousWeek() : previousMonth();
      if (e.key === 'ArrowRight') viewMode === 'week' ? nextWeek() : nextMonth();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewMode, currentDate]);

  // Upcoming events
  const upcomingEvents = useMemo(() => {
    return [...filteredEvents]
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
      .slice(0, 10);
  }, [filteredEvents]);

  // Calendar days
  const days = getDaysInMonth(currentDate);
  const weekDays = getWeekDays(currentDate);

  return (
    <div className="flex h-full flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Calendário</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Organize eventos, reuniões e compromissos
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleToggleTasks(!showTasks)}
              className={`px-3 py-1.5 text-sm rounded flex items-center gap-1.5 transition ${
                showTasks
                  ? 'bg-neutral-900 dark:bg-neutral-700 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tarefas</span>
            </button>
            <button
              onClick={() => openEventModal()}
              className="px-3 py-1.5 text-sm bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex px-4">
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              viewMode === 'month'
                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5 inline mr-1.5" />
            Mês
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              viewMode === 'week'
                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5 inline mr-1.5" />
            Semana
          </button>
          <button
            onClick={() => setViewMode('agenda')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              viewMode === 'agenda'
                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <List className="w-3.5 h-3.5 inline mr-1.5" />
            Agenda
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={viewMode === 'week' ? previousWeek : previousMonth}
              className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition"
            >
              <ChevronLeft className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition"
            >
              Hoje
            </button>
            <button
              onClick={viewMode === 'week' ? nextWeek : nextMonth}
              className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition"
            >
              <ChevronRight className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            </button>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white ml-2">
              {viewMode === 'week'
                ? `Semana de ${format(weekDays[0], 'dd/MM')} - ${format(weekDays[6], 'dd/MM')}`
                : `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar eventos..."
                className="pl-9 pr-3 py-1.5 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
            >
              <option value="all">Todas</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <button
              onClick={exportIcs}
              className="px-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center gap-1.5"
              title="Exportar .ics"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'month' && (
          <MonthView
            days={days}
            currentDate={currentDate}
            getEventsForDate={getEventsForDate}
            isToday={isToday}
            openEventModal={openEventModal}
          />
        )}

        {viewMode === 'week' && (
          <WeekView
            weekDays={weekDays}
            getEventsForDate={getEventsForDate}
            isToday={isToday}
            openEventModal={openEventModal}
          />
        )}

        {viewMode === 'agenda' && (
          <AgendaView
            upcomingEvents={upcomingEvents}
            deleteEvent={deleteEvent}
            openEventModal={openEventModal}
            menuOpenId={menuOpenId}
            setMenuOpenId={setMenuOpenId}
          />
        )}
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <EventModal
          isOpen={showEventModal}
          onClose={closeModal}
          onSave={handleSaveEvent}
          event={newEvent}
          setEvent={setNewEvent}
          isEditing={!!editingEventId}
          selectedDay={selectedDay}
          onGenerateMeetLink={handleGenerateMeetLink}
        />
      )}
    </div>
  );
}

// ===========================================
// MONTH VIEW COMPONENT
// ===========================================

function MonthView({
  days,
  currentDate,
  getEventsForDate,
  isToday,
  openEventModal,
}: {
  days: (number | null)[];
  currentDate: Date;
  getEventsForDate: (date: Date) => Event[];
  isToday: (date: Date) => boolean;
  openEventModal: (date?: Date, event?: Event) => void;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
      {/* Day Names */}
      <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800">
        {DAY_NAMES.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-neutral-500 dark:text-neutral-400 py-3">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={index} className="min-h-[100px] border-r border-b border-neutral-100 dark:border-neutral-800" />;
          }

          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const dayEvents = getEventsForDate(date);
          const today = isToday(date);

          return (
            <button
              key={index}
              onClick={() => openEventModal(date)}
              className={`min-h-[100px] p-2 text-left border-r border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${
                today ? 'bg-neutral-100 dark:bg-neutral-800' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold ${today ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 w-6 h-6 rounded-full flex items-center justify-center' : 'text-neutral-700 dark:text-neutral-300'}`}>
                  {day}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event) => {
                  const cat = event.category ? CATEGORY_STYLES[event.category] : null;
                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!event.isFromTask) openEventModal(date, event);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1 border ${
                        cat?.chip || 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                      } ${event.isFromTask ? 'opacity-70' : 'cursor-pointer hover:scale-105'}`}
                      title={`${event.time} · ${event.title}`}
                    >
                      {cat && <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />}
                      {event.isFromTask && <CheckSquare className="w-3 h-3" />}
                      <span className="truncate">{event.time} {event.title}</span>
                    </div>
                  );
                })}
                {dayEvents.length > 2 && (
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    +{dayEvents.length - 2} mais
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ===========================================
// WEEK VIEW COMPONENT
// ===========================================

function WeekView({
  weekDays,
  getEventsForDate,
  isToday,
  openEventModal,
}: {
  weekDays: Date[];
  getEventsForDate: (date: Date) => Event[];
  isToday: (date: Date) => boolean;
  openEventModal: (date?: Date, event?: Event) => void;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Day Headers */}
        <div className="grid grid-cols-8 border-b border-neutral-200 dark:border-neutral-800">
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 py-3 px-3">Horário</div>
          {weekDays.map((day, index) => {
            const today = isToday(day);
            return (
              <div
                key={index}
                className={`text-center py-3 border-l border-neutral-100 dark:border-neutral-800 ${
                  today ? 'bg-neutral-100 dark:bg-neutral-800' : ''
                }`}
              >
                <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{DAY_NAMES[day.getDay()]}</div>
                <div className={`text-lg font-bold ${today ? 'text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-300'}`}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Grid */}
        {WEEK_HOURS.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b border-neutral-100 dark:border-neutral-800">
            <div className="text-xs text-neutral-500 dark:text-neutral-400 py-3 px-3 text-right">{hour}</div>
            {weekDays.map((day, dayIndex) => {
              const events = getEventsForDate(day).filter((e) => e.time.startsWith(hour.split(':')[0]));
              return (
                <button
                  key={dayIndex}
                  onClick={() => openEventModal(day)}
                  className="min-h-[60px] p-1 border-l border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  {events.map((event) => {
                    const cat = event.category ? CATEGORY_STYLES[event.category] : null;
                    return (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!event.isFromTask) openEventModal(day, event);
                        }}
                        className={`px-2 py-1 rounded text-[10px] font-medium mb-1 border ${
                          cat?.chip || 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                        } ${event.isFromTask ? 'opacity-70' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          {cat && <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />}
                          {event.isFromTask && <CheckSquare className="w-3 h-3" />}
                          {event.googleMeetLink && <Video className="w-3 h-3" />}
                        </div>
                        <div className="truncate">{event.title}</div>
                      </div>
                    );
                  })}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===========================================
// AGENDA VIEW COMPONENT
// ===========================================

function AgendaView({
  upcomingEvents,
  deleteEvent,
  openEventModal,
  menuOpenId,
  setMenuOpenId,
}: {
  upcomingEvents: Event[];
  deleteEvent: (id: string) => void;
  openEventModal: (date?: Date, event?: Event) => void;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
}) {
  if (upcomingEvents.length === 0) {
    return (
      <div className="text-center py-16">
        <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
        <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
          Nenhum evento cadastrado
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Adicione eventos para vê-los aqui
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {upcomingEvents.map((event) => {
        const cat = event.category ? CATEGORY_STYLES[event.category] : null;
        const eventDate = parseISO(event.date);

        return (
          <div
            key={event.id}
            className="relative border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors bg-white dark:bg-neutral-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {cat && <span className={`w-3 h-3 rounded-full ${cat.dot}`} />}
                  {event.isFromTask && <CheckSquare className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />}
                  <button
                    onClick={() => !event.isFromTask && openEventModal(eventDate, event)}
                    className="font-medium text-neutral-900 dark:text-white hover:underline text-sm"
                  >
                    {event.title}
                  </button>
                  {event.googleMeetLink && (
                    <a
                      href={event.googleMeetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                      title="Entrar na reunião"
                    >
                      <Video className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {format(eventDate, "dd 'de' MMMM", { locale: ptBR })} · {event.time}
                    {event.endTime && ` - ${event.endTime}`}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.location}
                    </span>
                  )}
                  {event.attendees && event.attendees.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {event.attendees.length}
                    </span>
                  )}
                </div>

                {event.description && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">{event.description}</p>
                )}
              </div>

              {!event.isFromTask && (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === event.id ? null : event.id)}
                    className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {menuOpenId === event.id && (
                    <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg z-10">
                      <button
                        onClick={() => { openEventModal(eventDate, event); setMenuOpenId(null); }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                      >
                        <Edit className="w-3.5 h-3.5" /> Editar
                      </button>
                      <button
                        onClick={() => { deleteEvent(event.id); setMenuOpenId(null); }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 text-red-600 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Excluir
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ===========================================
// EVENT MODAL COMPONENT
// ===========================================

function EventModal({
  isOpen,
  onClose,
  onSave,
  event,
  setEvent,
  isEditing,
  selectedDay,
  onGenerateMeetLink,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  event: any;
  setEvent: React.Dispatch<React.SetStateAction<any>>;
  isEditing: boolean;
  selectedDay: Date | null;
  onGenerateMeetLink: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg w-full max-w-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
              {isEditing ? 'Editar Evento' : 'Novo Evento'}
              {selectedDay && ` - ${format(selectedDay, "dd 'de' MMMM", { locale: ptBR })}`}
            </h3>
            <button onClick={onClose} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition">
              <X className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Título *</label>
            <input
              type="text"
              value={event.title}
              onChange={(e) => setEvent({ ...event, title: e.target.value })}
              placeholder="Nome do evento"
              autoFocus
              className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Início</label>
              <input
                type="time"
                value={event.time}
                onChange={(e) => setEvent({ ...event, time: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Fim (opcional)</label>
              <input
                type="time"
                value={event.endTime}
                onChange={(e) => setEvent({ ...event, endTime: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Categoria</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const active = event.category === c.id;
                const style = CATEGORY_STYLES[c.id];
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setEvent({ ...event, category: c.id })}
                    className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${
                      active
                        ? style.chip
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Google Meet */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5" />
              Google Meet
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={event.googleMeetLink}
                onChange={(e) => setEvent({ ...event, googleMeetLink: e.target.value })}
                placeholder="https://meet.google.com/..."
                className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
              <button
                type="button"
                onClick={onGenerateMeetLink}
                className="px-3 py-2 text-xs bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 flex items-center gap-1"
                title="Gerar link do Meet"
              >
                <Video className="w-3.5 h-3.5" />
                Gerar
              </button>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Local
            </label>
            <input
              type="text"
              value={event.location}
              onChange={(e) => setEvent({ ...event, location: e.target.value })}
              placeholder="Adicionar local"
              className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Descrição</label>
            <textarea
              value={event.description}
              onChange={(e) => setEvent({ ...event, description: e.target.value })}
              placeholder="Adicione detalhes sobre o evento"
              rows={3}
              className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={!event.title.trim()}
            className="flex-1 px-4 py-2 text-sm bg-neutral-900 dark:bg-neutral-700 text-white rounded hover:bg-neutral-800 dark:hover:bg-neutral-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? 'Salvar' : 'Criar Evento'}
          </button>
        </div>
      </div>
    </div>
  );
}
