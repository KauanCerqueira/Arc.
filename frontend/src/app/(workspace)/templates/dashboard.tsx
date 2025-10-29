"use client";

import { useWorkspaceStore } from '@/core/store/workspaceStore';
import { useMemo } from 'react';
import { WorkspaceTemplateComponentProps } from '@/core/types/workspace.types';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  FileText,
  BarChart3,
  Calendar as CalendarIcon,
  Target,
  Layers,
  AlertTriangle,
  Activity,
  Zap,
  Users,
  Award,
  ArrowRight,
  TrendingDown,
  CalendarDays,
  ListTodo,
  Bug
} from 'lucide-react';
import Link from 'next/link';

type PageStats = {
  pageId: string;
  pageName: string;
  pageIcon: string;
  template: string;
  totalItems: number;
  completedItems: number;
  pendingItems: number;
  progressPercentage: number;
  lastUpdated: Date;
  summary: string;
  urgentItems?: number;
  overdueItems?: number;
};

type UpcomingEvent = {
  pageId: string;
  pageName: string;
  eventTitle: string;
  eventDate: Date;
  daysUntil: number;
};

type DueTask = {
  pageId: string;
  pageName: string;
  taskTitle: string;
  dueDate: Date;
  priority: string;
  daysUntil: number;
};

type RecentActivity = {
  pageId: string;
  pageName: string;
  action: string;
  timestamp: Date;
  icon: any;
};

export default function DashboardTemplate({ groupId }: WorkspaceTemplateComponentProps) {
  const { getGroup } = useWorkspaceStore();

  const group = getGroup(groupId);

  // Função para agregar dados de cada página baseado no template
  const aggregatePageData = (page: any): PageStats => {
    const data = page.data || {};
    let totalItems = 0;
    let completedItems = 0;
    let pendingItems = 0;
    let urgentItems = 0;
    let overdueItems = 0;
    let summary = '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (page.template) {
      case 'tasks':
        const tasks = data.tasks || [];
        totalItems = tasks.length;
        completedItems = tasks.filter((t: any) => t.completed).length;
        pendingItems = tasks.filter((t: any) => !t.completed).length;

        // Tarefas urgentes e atrasadas
        urgentItems = tasks.filter((t: any) => !t.completed && t.priority === 'high').length;
        overdueItems = tasks.filter((t: any) => {
          if (!t.dueDate || t.completed) return false;
          const dueDate = new Date(t.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate < today;
        }).length;

        summary = `${completedItems}/${totalItems} tarefas concluídas`;
        break;

      case 'kanban':
        const cards = data.cards || [];
        totalItems = cards.length;
        completedItems = cards.filter((c: any) => c.status === 'done').length;
        pendingItems = cards.filter((c: any) => c.status !== 'done').length;

        urgentItems = cards.filter((c: any) => c.status !== 'done' && (c.priority === 'urgent' || c.priority === 'high')).length;
        overdueItems = cards.filter((c: any) => {
          if (!c.dueDate || c.status === 'done') return false;
          const dueDate = new Date(c.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate < today;
        }).length;

        summary = `${completedItems} cards concluídos de ${totalItems}`;
        break;

      case 'bugs':
        const bugs = data.bugs || [];
        totalItems = bugs.length;
        completedItems = bugs.filter((b: any) => b.status === 'resolved' || b.status === 'closed').length;
        pendingItems = bugs.filter((b: any) => b.status !== 'resolved' && b.status !== 'closed').length;
        urgentItems = bugs.filter((b: any) =>
          (b.status !== 'resolved' && b.status !== 'closed') &&
          (b.severity === 'critical' || b.severity === 'high')
        ).length;
        summary = `${pendingItems} bugs ativos`;
        break;

      case 'calendar':
        const events = data.events || [];
        totalItems = events.length;
        completedItems = events.filter((e: any) => {
          const eventDate = new Date(e.date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate < today;
        }).length;
        pendingItems = events.filter((e: any) => {
          const eventDate = new Date(e.date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= today;
        }).length;
        summary = `${pendingItems} eventos futuros`;
        break;

      case 'table':
      case 'projects':
        const items = data.rows || data.projects || [];
        totalItems = items.length;
        completedItems = items.filter((i: any) => i.completed || i.status === 'completed').length;
        pendingItems = totalItems - completedItems;
        summary = `${totalItems} itens registrados`;
        break;

      default:
        summary = 'Página de conteúdo';
        break;
    }

    const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    return {
      pageId: page.id,
      pageName: page.name,
      pageIcon: page.icon || '📄',
      template: page.template,
      totalItems,
      completedItems,
      pendingItems,
      progressPercentage,
      lastUpdated: new Date(page.updatedAt),
      summary,
      urgentItems,
      overdueItems,
    };
  };

  // Coletar eventos futuros
  const upcomingEvents = useMemo((): UpcomingEvent[] => {
    if (!group) return [];

    const events: UpcomingEvent[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    group.pages.forEach(page => {
      if (page.template === 'calendar') {
        const data = page.data || {};
        const calendarEvents = data.events || [];

        calendarEvents.forEach((event: any) => {
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);

          if (eventDate >= today) {
            const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            if (daysUntil <= 7) { // Próximos 7 dias
              events.push({
                pageId: page.id,
                pageName: page.name,
                eventTitle: event.title || event.name || 'Sem título',
                eventDate,
                daysUntil,
              });
            }
          }
        });
      }
    });

    return events.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
  }, [group]);

  // Coletar tarefas com prazo próximo
  const dueTasks = useMemo((): DueTask[] => {
    if (!group) return [];

    const tasks: DueTask[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    group.pages.forEach(page => {
      const data = page.data || {};

      if (page.template === 'tasks') {
        const pageTasks = data.tasks || [];

        pageTasks.forEach((task: any) => {
          if (!task.completed && task.dueDate) {
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            if (daysUntil <= 3 || daysUntil < 0) { // Próximos 3 dias ou atrasadas
              tasks.push({
                pageId: page.id,
                pageName: page.name,
                taskTitle: task.title,
                dueDate,
                priority: task.priority || 'medium',
                daysUntil,
              });
            }
          }
        });
      } else if (page.template === 'kanban') {
        const cards = data.cards || [];

        cards.forEach((card: any) => {
          if (card.status !== 'done' && card.dueDate) {
            const dueDate = new Date(card.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            if (daysUntil <= 3 || daysUntil < 0) {
              tasks.push({
                pageId: page.id,
                pageName: page.name,
                taskTitle: card.title,
                dueDate,
                priority: card.priority || 'medium',
                daysUntil,
              });
            }
          }
        });
      }
    });

    return tasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }, [group]);

  // Calcular estatísticas gerais do grupo
  const groupStats = useMemo(() => {
    if (!group) return null;

    const pageStats = group.pages.map(aggregatePageData);

    const totalPages = group.pages.length;
    const totalTasks = pageStats.reduce((sum, p) => sum + p.totalItems, 0);
    const totalCompleted = pageStats.reduce((sum, p) => sum + p.completedItems, 0);
    const totalPending = pageStats.reduce((sum, p) => sum + p.pendingItems, 0);
    const totalUrgent = pageStats.reduce((sum, p) => sum + (p.urgentItems || 0), 0);
    const totalOverdue = pageStats.reduce((sum, p) => sum + (p.overdueItems || 0), 0);
    const overallProgress = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;

    // Páginas com maior atividade (mais atualizadas recentemente)
    const mostActivePages = [...pageStats]
      .filter(p => p.totalItems > 0)
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
      .slice(0, 5);

    // Páginas com menor progresso
    const needsAttention = [...pageStats]
      .filter(p => p.totalItems > 0 && p.progressPercentage < 50)
      .sort((a, b) => a.progressPercentage - b.progressPercentage)
      .slice(0, 3);

    // Agrupar páginas por template
    const pagesByTemplate = group.pages.reduce((acc: any, page) => {
      const template = page.template;
      acc[template] = (acc[template] || 0) + 1;
      return acc;
    }, {});

    return {
      totalPages,
      totalTasks,
      totalCompleted,
      totalPending,
      totalUrgent,
      totalOverdue,
      overallProgress,
      pagesByTemplate,
      pageStats,
      mostActivePages,
      needsAttention,
    };
  }, [group]);

  if (!group || !groupStats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950 p-4">
        <div className="text-center">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Dashboard não disponível
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Não foi possível carregar os dados do grupo
          </p>
        </div>
      </div>
    );
  }

  const getTemplateIcon = (template: string) => {
    const icons: Record<string, any> = {
      tasks: CheckCircle2,
      kanban: Layers,
      bugs: AlertCircle,
      calendar: CalendarIcon,
      projects: Target,
      table: BarChart3,
      blank: FileText,
    };
    return icons[template] || FileText;
  };

  const getTemplateColor = (template: string) => {
    const colors: Record<string, string> = {
      tasks: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      kanban: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      bugs: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
      calendar: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      projects: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      table: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      blank: 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800',
    };
    return colors[template] || colors.blank;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'text-red-600 dark:text-red-400',
      high: 'text-orange-600 dark:text-orange-400',
      medium: 'text-yellow-600 dark:text-yellow-400',
      low: 'text-blue-600 dark:text-blue-400',
    };
    return colors[priority] || colors.medium;
  };

  const formatDaysUntil = (days: number) => {
    if (days < 0) return `${Math.abs(days)} dias atrasado`;
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Amanhã';
    return `Em ${days} dias`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 overflow-auto">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl md:text-4xl">{group.icon}</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Dashboard - {group.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Visão completa e inteligente do seu projeto
              </p>
            </div>
          </div>
        </div>

        {/* Alertas Críticos */}
        {(groupStats.totalOverdue > 0 || groupStats.totalUrgent > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {groupStats.totalOverdue > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <div className="font-bold text-red-900 dark:text-red-100">
                      {groupStats.totalOverdue} {groupStats.totalOverdue === 1 ? 'item atrasado' : 'itens atrasados'}
                    </div>
                    <div className="text-xs text-red-700 dark:text-red-300">
                      Requer atenção imediata
                    </div>
                  </div>
                </div>
              </div>
            )}

            {groupStats.totalUrgent > 0 && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                    <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <div className="font-bold text-orange-900 dark:text-orange-100">
                      {groupStats.totalUrgent} {groupStats.totalUrgent === 1 ? 'item urgente' : 'itens urgentes'}
                    </div>
                    <div className="text-xs text-orange-700 dark:text-orange-300">
                      Alta prioridade
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Estatísticas Principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-800 p-4 md:p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 md:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Páginas
            </div>
            <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
              {groupStats.totalPages}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-800 p-4 md:p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 md:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Layers className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                <TrendingUp size={10} className="md:w-3 md:h-3" />
                {groupStats.overallProgress.toFixed(0)}%
              </div>
            </div>
            <div className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Itens
            </div>
            <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
              {groupStats.totalTasks}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-green-200 dark:border-green-800 p-4 md:p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 md:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Feitos
            </div>
            <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
              {groupStats.totalCompleted}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-orange-200 dark:border-orange-800 p-4 md:p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 md:p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Pendentes
            </div>
            <div className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">
              {groupStats.totalPending}
            </div>
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Progresso Geral */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Progresso Geral
              </h2>
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {groupStats.overallProgress.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-6 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 rounded-full"
                style={{ width: `${groupStats.overallProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{groupStats.totalCompleted} concluídos</span>
              <span>{groupStats.totalPending} pendentes</span>
            </div>

            {/* Páginas que precisam de atenção */}
            {groupStats.needsAttention.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Precisa de Atenção
                </h3>
                <div className="space-y-2">
                  {groupStats.needsAttention.map(page => (
                    <Link
                      key={page.pageId}
                      href={`/workspace/group/${groupId}/page/${page.pageId}`}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-lg">{page.pageIcon}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {page.pageName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                          {page.progressPercentage.toFixed(0)}%
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Próximos Eventos */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Próximos Eventos
            </h3>

            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nenhum evento próximo
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 5).map((event, idx) => (
                  <Link
                    key={`${event.pageId}-${idx}`}
                    href={`/workspace/group/${groupId}/page/${event.pageId}`}
                    className="block p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-1">
                        {event.eventTitle}
                      </div>
                      <div className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        event.daysUntil === 0
                          ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                          : event.daysUntil === 1
                          ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
                          : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                      }`}>
                        {formatDaysUntil(event.daysUntil)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span>{event.pageName}</span>
                      <span>•</span>
                      <span>{event.eventDate.toLocaleDateString('pt-BR')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tarefas com Prazo Próximo */}
        {dueTasks.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-800 p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <ListTodo className="w-5 h-5" />
              Tarefas Urgentes ({dueTasks.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {dueTasks.map((task, idx) => (
                <Link
                  key={`${task.pageId}-${idx}`}
                  href={`/workspace/group/${groupId}/page/${task.pageId}`}
                  className={`block p-4 rounded-lg border-2 hover:shadow-md transition ${
                    task.daysUntil < 0
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      : task.daysUntil === 0
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                      : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={`text-xs font-bold px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {formatDaysUntil(task.daysUntil)}
                    </div>
                  </div>
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                    {task.taskTitle}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    📄 {task.pageName}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Páginas Mais Ativas */}
        {groupStats.mostActivePages.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-800 p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Páginas Mais Ativas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupStats.mostActivePages.map((pageStat) => {
                const TemplateIcon = getTemplateIcon(pageStat.template);

                return (
                  <Link
                    key={pageStat.pageId}
                    href={`/workspace/group/${groupId}/page/${pageStat.pageId}`}
                    className="block"
                  >
                    <div className="bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-2xl">{pageStat.pageIcon}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                            {pageStat.pageName}
                          </h4>
                          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-medium border ${getTemplateColor(pageStat.template)}`}>
                            <TemplateIcon className="w-3 h-3" />
                            {pageStat.template}
                          </div>
                        </div>
                      </div>

                      {pageStat.totalItems > 0 && (
                        <>
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-600 dark:text-gray-400">
                                {pageStat.summary}
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {pageStat.progressPercentage.toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                                style={{ width: `${pageStat.progressPercentage}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <CheckCircle2 className="w-3 h-3" />
                              <span className="font-medium">{pageStat.completedItems}</span>
                            </div>
                            <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                              <Clock className="w-3 h-3" />
                              <span className="font-medium">{pageStat.pendingItems}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Todas as Páginas */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-800 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Todas as Páginas ({groupStats.totalPages})
          </h2>

          {groupStats.pageStats.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📄</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Nenhuma página ainda
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Adicione páginas ao grupo para ver o dashboard completo
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {groupStats.pageStats.map((pageStat) => {
                const TemplateIcon = getTemplateIcon(pageStat.template);

                return (
                  <Link
                    key={pageStat.pageId}
                    href={`/workspace/group/${groupId}/page/${pageStat.pageId}`}
                    className="block group"
                  >
                    <div className="bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer h-full">
                      <div className="flex items-start gap-2 mb-3">
                        <div className="text-xl">{pageStat.pageIcon}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                            {pageStat.pageName}
                          </h3>
                          <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border ${getTemplateColor(pageStat.template)}`}>
                            <TemplateIcon className="w-3 h-3" />
                            <span className="text-xs">{pageStat.template}</span>
                          </div>
                        </div>
                      </div>

                      {pageStat.totalItems > 0 ? (
                        <>
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-600 dark:text-gray-400 truncate">
                                {pageStat.summary}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${pageStat.progressPercentage}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{pageStat.completedItems}</span>
                            </div>
                            <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                              <Clock className="w-3 h-3" />
                              <span>{pageStat.pendingItems}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Sem itens
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
