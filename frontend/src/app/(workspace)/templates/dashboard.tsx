"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  ListTodo,
  FolderOpen,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar as CalendarIcon,
  AlertCircle,
  Zap,
  ChevronRight,
  Users,
  FileText,
  BarChart3,
  Target,
  Flame,
  FolderKanban,
  Bug,
  Table,
  Apple,
  Dumbbell,
  Wallet,
  BookOpen,
  GitBranch,
  Brain,
  Layers,
  LayoutDashboard,
  CheckSquare,
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle,
  CreditCard,
  Briefcase,
  DollarSign,
  Tag,
  Star,
  StickyNote,
  Cloud,
  MapPin,
  Flag
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { useWorkspaceStore } from '@/core/store/workspaceStore';

// ===== TEMPLATE CONFIGS =====
const TEMPLATE_CONFIGS = {
  tasks: { icon: ListTodo, label: 'Tarefas', color: '#3b82f6' },
  kanban: { icon: FolderKanban, label: 'Kanban', color: '#8b5cf6' },
  bugs: { icon: Bug, label: 'Bugs', color: '#ef4444' },
  calendar: { icon: CalendarIcon, label: 'Calendário', color: '#10b981' },
  projects: { icon: Layers, label: 'Projetos', color: '#f59e0b' },
  table: { icon: Table, label: 'Tabela', color: '#14b8a6' },
  nutrition: { icon: Apple, label: 'Nutrição', color: '#84cc16' },
  workout: { icon: Dumbbell, label: 'Treino', color: '#f43f5e' },
  budget: { icon: BarChart3, label: 'Orçamento', color: '#059669' },
  'personal-budget': { icon: BarChart3, label: 'Orçamento Pessoal', color: '#059669' },
  'business-budget': { icon: BarChart3, label: 'Orçamento Empresarial', color: '#059669' },
  study: { icon: BookOpen, label: 'Estudos', color: '#6366f1' },
  focus: { icon: Target, label: 'Foco', color: '#8b5cf6' },
  notes: { icon: FileText, label: 'Notas', color: '#6b7280' },
  wiki: { icon: BookOpen, label: 'Wiki', color: '#3b82f6' },
  timeline: { icon: GitBranch, label: 'Timeline', color: '#06b6d4' },
  roadmap: { icon: GitBranch, label: 'Roadmap', color: '#0ea5e9' },
  sprint: { icon: Zap, label: 'Sprint', color: '#eab308' },
  mindmap: { icon: Brain, label: 'Mapa Mental', color: '#ec4899' },
  flowchart: { icon: GitBranch, label: 'Fluxograma', color: '#3b82f6' },
  documents: { icon: FileText, label: 'Documentos', color: '#64748b' },
  dashboard: { icon: LayoutDashboard, label: 'Dashboard', color: '#8b5cf6' },
  blank: { icon: FileText, label: 'Página', color: '#6b7280' },
};

const getTemplateConfig = (template: string) => {
  return TEMPLATE_CONFIGS[template as keyof typeof TEMPLATE_CONFIGS] || TEMPLATE_CONFIGS.blank;
};

const aggregatePageStats = (page: any) => {
  const data = page.data || {};
  let totalItems = 0;
  let completedItems = 0;
  let pendingItems = 0;
  let urgentItems = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (page.template) {
    case 'tasks':
      const tasks = data.tasks || [];
      totalItems = tasks.length;
      completedItems = tasks.filter((t: any) => t.status === 'done').length;
      pendingItems = tasks.filter((t: any) => t.status !== 'done').length;
      urgentItems = tasks.filter((t: any) => t.status !== 'done' && t.priority === 'high').length;
      break;
    case 'kanban':
      const cards = data.cards || [];
      totalItems = cards.length;
      completedItems = cards.filter((c: any) => c.status === 'done').length;
      pendingItems = cards.filter((c: any) => c.status !== 'done').length;
      urgentItems = cards.filter((c: any) => c.status !== 'done' && (c.priority === 'urgent' || c.priority === 'high')).length;
      break;
    case 'bugs':
      const bugs = data.bugs || [];
      totalItems = bugs.length;
      completedItems = bugs.filter((b: any) => b.status === 'resolved' || b.status === 'closed').length;
      pendingItems = bugs.filter((b: any) => b.status !== 'resolved' && b.status !== 'closed').length;
      urgentItems = bugs.filter((b: any) => (b.status !== 'resolved' && b.status !== 'closed') && (b.severity === 'critical' || b.severity === 'high')).length;
      break;
    case 'calendar':
      const events = data.events || [];
      totalItems = events.length;
      pendingItems = events.filter((e: any) => new Date(e.date) >= today).length;
      break;
    case 'projects':
    case 'table':
      const items = data.rows || data.projects || [];
      totalItems = items.length;
      completedItems = items.filter((i: any) => i.completed || i.status === 'completed').length;
      pendingItems = totalItems - completedItems;
      break;
    default:
      break;
  }

  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return {
    pageId: page.id,
    pageName: page.name,
    template: page.template || 'blank',
    totalItems,
    completedItems,
    pendingItems,
    progressPercentage,
    lastUpdated: new Date(page.updatedAt),
    urgentItems,
  };
};

interface DashboardTemplateProps {
  groupId: string;
  pageId: string;
}

export default function DashboardTemplate({ groupId, pageId }: DashboardTemplateProps) {
  const { workspace, isLoading } = useWorkspaceStore();

  const stats = useMemo(() => {
    if (!workspace) return null;

    const allPagesStats = workspace.groups.flatMap(group =>
      group.pages.map(page => aggregatePageStats(page))
    );

    const totalPages = allPagesStats.length;
    const totalTasks = allPagesStats.reduce((sum, p) => sum + p.totalItems, 0);
    const totalCompleted = allPagesStats.reduce((sum, p) => sum + p.completedItems, 0);
    const totalPending = allPagesStats.reduce((sum, p) => sum + p.pendingItems, 0);
    const totalUrgent = allPagesStats.reduce((sum, p) => sum + p.urgentItems, 0);
    const overallProgress = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = workspace.groups.flatMap(group =>
      group.pages
        .filter(p => p.template === 'calendar')
        .flatMap(p => {
          const events = p.data?.events || [];
          return events.map((e: any) => ({
            ...e,
            pageId: p.id,
            pageName: p.name,
            groupName: group.name,
            groupId: group.id
          }));
        })
    ).filter((e: any) => new Date(e.date) >= today)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);

    const needsAttention = allPagesStats
      .filter(p => p.totalItems > 0 && p.progressPercentage < 100 && p.urgentItems > 0)
      .sort((a, b) => b.urgentItems - a.urgentItems)
      .slice(0, 5);

    const recentPages = allPagesStats
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
      .slice(0, 8);

    const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
      const day = new Date();
      day.setDate(day.getDate() - (6 - i));
      return {
        day: day.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase(),
        tasks: Math.floor(Math.random() * 20) + 5,
        completed: Math.floor(Math.random() * 15) + 3
      };
    });

    const allPagesStatsWithGroupInfo = workspace.groups.flatMap(group =>
      group.pages.map(page => ({
        ...aggregatePageStats(page),
        groupName: group.name,
        groupId: group.id
      }))
    );

    return {
      totalPages,
      totalTasks,
      totalCompleted,
      totalPending,
      totalUrgent,
      overallProgress,
      upcomingEvents,
      needsAttention,
      recentPages,
      weeklyActivity,
      allPagesStats: allPagesStatsWithGroupInfo
    };
  }, [workspace]);

  if (isLoading || !workspace || !stats) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const velocitySeries = stats.weeklyActivity;

  return (
    <div className="flex h-full flex-col bg-gray-50 dark:bg-slate-950 overflow-y-auto">
      <div className="flex-1 px-6 lg:px-12 py-8 lg:py-12 max-w-[1800px] mx-auto w-full">

        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-2">
            dashboard completo.
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Visão geral de todo o workspace • {stats.totalPages} páginas • {stats.totalTasks} itens
          </p>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
          <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total de Páginas</span>
              <Layers className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-4xl font-black text-gray-900 dark:text-white">{stats.totalPages}</p>
          </div>

          <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progresso Geral</span>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-4xl font-black text-gray-900 dark:text-white">{Math.round(stats.overallProgress)}%</p>
          </div>

          <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Concluídos</span>
              <CheckCircle2 className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-4xl font-black text-gray-900 dark:text-white">{stats.totalCompleted}</p>
          </div>

          <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Urgentes</span>
              <AlertCircle className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-4xl font-black text-gray-900 dark:text-white">{stats.totalUrgent}</p>
          </div>
        </div>

        {/* 23 CARDS PERSONALIZADOS POR TIPO DE PÁGINA */}
        <div className="mb-8 lg:mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">insights por tipo de página.</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Análise detalhada de cada template no seu workspace</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Card 1: Tasks - 2 Cards lado a lado */}
            {(() => {
              const tasksPages = workspace.groups.flatMap(g =>
                g.pages.filter(p => p.template === 'tasks').map(page => ({
                  ...page,
                  groupId: g.id,
                  groupName: g.name
                }))
              );

              if (tasksPages.length === 0) return null;

              const allTasks = tasksPages.flatMap(p => (p.data?.tasks || []).map((t: any) => ({
                ...t,
                pageId: p.id,
                pageName: p.name,
                groupId: p.groupId
              })));

              const totalTasks = allTasks.length;
              const completedTasks = allTasks.filter((t: any) => t.status === 'done').length;
              const todoTasks = allTasks.filter((t: any) => t.status === 'todo').length;
              const inProgressTasks = allTasks.filter((t: any) => t.status === 'in_progress').length;

              // Encontrar primeira página de tasks para redirecionar
              const firstTasksPage = tasksPages[0];
              const tasksLink = `/workspace/${firstTasksPage.groupId}/${firstTasksPage.id}`;

              // Calcular tarefas urgentes
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const overdueTasks = allTasks.filter((t: any) =>
                t.status !== 'done' &&
                t.dueDate &&
                new Date(t.dueDate) < today
              );

              const highPriorityTasks = allTasks.filter((t: any) =>
                t.status !== 'done' &&
                t.priority === 'high'
              );

              const dueSoonTasks = allTasks.filter((t: any) => {
                if (t.status === 'done' || !t.dueDate) return false;
                const dueDate = new Date(t.dueDate);
                const threeDaysFromNow = new Date(today);
                threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
                return dueDate >= today && dueDate <= threeDaysFromNow;
              });

              // Combinar e ordenar tarefas urgentes
              const urgentTasksSet = new Set([
                ...overdueTasks.map((t: any) => ({ ...t, urgencyType: 'overdue' })),
                ...highPriorityTasks.map((t: any) => ({ ...t, urgencyType: 'high-priority' })),
                ...dueSoonTasks.map((t: any) => ({ ...t, urgencyType: 'due-soon' }))
              ]);

              const urgentTasksArray = Array.from(urgentTasksSet).sort((a: any, b: any) => {
                // Priorizar atrasadas, depois alta prioridade, depois vencendo em breve
                if (a.urgencyType === 'overdue' && b.urgencyType !== 'overdue') return -1;
                if (a.urgencyType !== 'overdue' && b.urgencyType === 'overdue') return 1;
                if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                return 0;
              }).slice(0, 5);

              // Calcular subtarefas
              const allSubtasks = allTasks.flatMap((t: any) => t.subtasks || []);
              const totalSubtasks = allSubtasks.length;
              const completedSubtasks = allSubtasks.filter((st: any) => st.completed).length;

              // Se não tiver nenhuma tarefa
              if (totalTasks === 0) {
                return (
                  <div className="col-span-full bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <ListTodo className="w-5 h-5 text-gray-900 dark:text-white" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tarefas</h3>
                      </div>
                      <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{tasksPages.length} página(s)</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-12">
                      <ListTodo className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Nenhuma tarefa criada ainda</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Comece criando suas primeiras tarefas</p>
                      <Link href={tasksLink}>
                        <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Criar Tarefas
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              }

              return (
                <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card Esquerdo - Urgência Combinada */}
                  <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tarefas Urgentes</h3>
                      </div>
                      <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{tasksPages.length} página(s)</span>
                    </div>

                    {urgentTasksArray.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <CheckCircle2 className="w-12 h-12 text-green-500 dark:text-green-600 mb-3" />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Tudo sob controle!</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Nenhuma tarefa urgente no momento</p>
                        <Link href={tasksLink}>
                          <button className="px-3 py-1.5 text-xs bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2">
                            <ArrowRight className="w-3 h-3" />
                            Ver Tarefas
                          </button>
                        </Link>
                      </div>
                    ) : (
                      <>
                        {/* Resumo visual */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-xs text-red-600 dark:text-red-400 font-semibold mb-1">Atrasadas</p>
                            <p className="text-2xl font-black text-red-700 dark:text-red-300">{overdueTasks.length}</p>
                          </div>
                          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                            <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold mb-1">Alta Prior.</p>
                            <p className="text-2xl font-black text-orange-700 dark:text-orange-300">{highPriorityTasks.length}</p>
                          </div>
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold mb-1">Vence Logo</p>
                            <p className="text-2xl font-black text-yellow-700 dark:text-yellow-300">{dueSoonTasks.length}</p>
                          </div>
                        </div>

                        {/* Lista de tarefas urgentes */}
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Top {urgentTasksArray.length} Mais Urgentes
                          </h4>
                          <div className="space-y-2">
                            {urgentTasksArray.map((task: any, idx: number) => {
                              const isOverdue = task.dueDate && new Date(task.dueDate) < today;
                              return (
                                <Link key={idx} href={`/workspace/${task.groupId}/${task.pageId}`}>
                                  <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-3 hover:border-gray-400 dark:hover:border-slate-600 transition-colors cursor-pointer">
                                    <div className="flex items-start gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          {isOverdue && (
                                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                                              ATRASADA
                                            </span>
                                          )}
                                          {task.priority === 'high' && !isOverdue && (
                                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                                              ALTA
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">{task.title}</p>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                          <span className="flex items-center gap-1">
                                            <FileText className="w-3 h-3" />
                                            {task.pageName}
                                          </span>
                                          {task.dueDate && (
                                            <span className="flex items-center gap-1">
                                              <CalendarIcon className="w-3 h-3" />
                                              {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                          <Link href={tasksLink}>
                            <button className="w-full mt-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-900 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-800">
                              Ver Todas as Tarefas
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </Link>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Card Direito - Estatísticas Gerais */}
                  <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-gray-900 dark:text-white" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Estatísticas Gerais</h3>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Total: <span className="font-bold text-gray-900 dark:text-white">{totalTasks}</span>
                      </span>
                    </div>

                    {/* Barra de distribuição por status */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Distribuição por Status</h4>
                      <div className="h-8 bg-gray-100 dark:bg-slate-900 rounded-lg overflow-hidden flex">
                        {todoTasks > 0 && (
                          <div
                            className="bg-gray-500 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-white transition-all hover:opacity-80"
                            style={{ width: `${(todoTasks / totalTasks) * 100}%` }}
                            title={`A Fazer: ${todoTasks}`}
                          >
                            {todoTasks > 0 && Math.round((todoTasks / totalTasks) * 100) > 8 && todoTasks}
                          </div>
                        )}
                        {inProgressTasks > 0 && (
                          <div
                            className="bg-yellow-500 dark:bg-yellow-600 flex items-center justify-center text-xs font-bold text-white transition-all hover:opacity-80"
                            style={{ width: `${(inProgressTasks / totalTasks) * 100}%` }}
                            title={`Em Progresso: ${inProgressTasks}`}
                          >
                            {inProgressTasks > 0 && Math.round((inProgressTasks / totalTasks) * 100) > 8 && inProgressTasks}
                          </div>
                        )}
                        {completedTasks > 0 && (
                          <div
                            className="bg-green-500 dark:bg-green-600 flex items-center justify-center text-xs font-bold text-white transition-all hover:opacity-80"
                            style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                            title={`Concluído: ${completedTasks}`}
                          >
                            {completedTasks > 0 && Math.round((completedTasks / totalTasks) * 100) > 8 && completedTasks}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Estatísticas detalhadas */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-900 rounded-lg p-3">
                        <div className="w-3 h-3 rounded-full bg-gray-500 dark:bg-gray-600"></div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">A Fazer</p>
                          <p className="text-xl font-black text-gray-900 dark:text-white">{todoTasks}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 dark:bg-yellow-600"></div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Progresso</p>
                          <p className="text-xl font-black text-gray-900 dark:text-white">{inProgressTasks}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                        <div className="w-3 h-3 rounded-full bg-green-500 dark:bg-green-600"></div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Concluído</p>
                          <p className="text-xl font-black text-gray-900 dark:text-white">{completedTasks}</p>
                        </div>
                      </div>
                    </div>

                    {/* Taxa de conclusão */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">Taxa de Conclusão</span>
                        </div>
                        <span className="text-2xl font-black text-green-700 dark:text-green-300">
                          {Math.round((completedTasks / totalTasks) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-green-200 dark:bg-green-900/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600 dark:bg-green-500 rounded-full transition-all"
                          style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Progresso de subtarefas */}
                    {totalSubtasks > 0 && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">Subtarefas</span>
                          </div>
                          <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                            {completedSubtasks}/{totalSubtasks}
                          </span>
                        </div>
                        <div className="h-2 bg-blue-200 dark:bg-blue-900/40 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all"
                            style={{ width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Card 2: Kanban - 3 Cards lado a lado */}
            {(() => {
              const kanbanPages = workspace.groups.flatMap(g =>
                g.pages.filter(p => p.template === 'kanban').map(page => ({
                  ...page,
                  groupId: g.id,
                  groupName: g.name
                }))
              );

              if (kanbanPages.length === 0) return null;

              const allTasks = kanbanPages.flatMap(p => (p.data?.tasks || []).map((t: any) => ({ ...t, pageId: p.id, pageName: p.name, groupId: p.groupId })));
              const totalCards = allTasks.length;

              // Distribuição por status (usando os status corretos do kanban)
              const backlogCount = allTasks.filter((t: any) => t.status?.id === 'backlog').length;
              const todoCount = allTasks.filter((t: any) => t.status?.id === 'to-do').length;
              const inProgressCount = allTasks.filter((t: any) => t.status?.id === 'in-progress').length;
              const reviewCount = allTasks.filter((t: any) => t.status?.id === 'review').length;
              const completedCount = allTasks.filter((t: any) => t.status?.id === 'completed').length;

              // Encontrar primeira página de kanban para redirecionar
              const firstKanbanPage = kanbanPages[0];
              const kanbanLink = `/workspace/${firstKanbanPage.groupId}/${firstKanbanPage.id}`;

              // Calcular prioridades urgentes
              const urgentCards = allTasks.filter((t: any) =>
                (t.priority === 'urgent' || t.priority === 'high') &&
                t.status?.id !== 'completed'
              );

              const urgentCount = allTasks.filter((t: any) => t.priority === 'urgent' && t.status?.id !== 'completed').length;
              const highCount = allTasks.filter((t: any) => t.priority === 'high' && t.status?.id !== 'completed').length;

              // Ordenar por prioridade
              const sortedUrgentCards = urgentCards.sort((a: any, b: any) => {
                if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
                if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
                if (a.date && b.date) return new Date(a.date).getTime() - new Date(b.date).getTime();
                return 0;
              }).slice(0, 4);

              // Se não tiver nenhuma task
              if (totalCards === 0) {
                return (
                  <div className="col-span-full bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="w-5 h-5 text-gray-900 dark:text-white" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Kanban</h3>
                      </div>
                      <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{kanbanPages.length} página(s)</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-12">
                      <FolderKanban className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Nenhum card no Kanban ainda</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Adicione cards para visualizar estatísticas</p>
                      <Link href={kanbanLink}>
                        <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Adicionar Cards
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              }

              return (
                <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1: Resumo Geral */}
                  <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Resumo</h3>
                      </div>
                      <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{kanbanPages.length}p</span>
                    </div>

                    {/* Métricas principais */}
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-1">Total de Cards</p>
                        <p className="text-4xl font-black text-purple-700 dark:text-purple-300">{totalCards}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                          <p className="text-xs text-green-600 dark:text-green-400 font-semibold mb-1">Concluídos</p>
                          <p className="text-2xl font-black text-green-700 dark:text-green-300">{completedCount}</p>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                          <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mb-1">Em Progresso</p>
                          <p className="text-2xl font-black text-amber-700 dark:text-amber-300">{inProgressCount}</p>
                        </div>
                      </div>

                      {/* Taxa de conclusão */}
                      <div className="pt-4 border-t border-gray-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Taxa de Conclusão</span>
                          <span className="text-xl font-black text-gray-900 dark:text-white">
                            {Math.round((completedCount / totalCards) * 100)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all"
                            style={{ width: `${(completedCount / totalCards) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <Link href={kanbanLink}>
                        <button className="w-full mt-2 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-900 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-800">
                          Ver Kanban
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                  </div>

                  {/* Card 2: Distribuição por Status */}
                  <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-gray-900 dark:text-white" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Por Status</h3>
                      </div>
                    </div>

                    {/* Barra visual */}
                    <div className="mb-4">
                      <div className="h-6 bg-gray-100 dark:bg-slate-900 rounded-lg overflow-hidden flex">
                        {backlogCount > 0 && (
                          <div
                            className="bg-gray-400 dark:bg-gray-600 transition-all hover:opacity-80"
                            style={{ width: `${(backlogCount / totalCards) * 100}%` }}
                            title={`Backlog: ${backlogCount}`}
                          ></div>
                        )}
                        {todoCount > 0 && (
                          <div
                            className="bg-gray-500 dark:bg-gray-700 transition-all hover:opacity-80"
                            style={{ width: `${(todoCount / totalCards) * 100}%` }}
                            title={`A Fazer: ${todoCount}`}
                          ></div>
                        )}
                        {inProgressCount > 0 && (
                          <div
                            className="bg-amber-500 dark:bg-amber-600 transition-all hover:opacity-80"
                            style={{ width: `${(inProgressCount / totalCards) * 100}%` }}
                            title={`Em Progresso: ${inProgressCount}`}
                          ></div>
                        )}
                        {reviewCount > 0 && (
                          <div
                            className="bg-blue-500 dark:bg-blue-600 transition-all hover:opacity-80"
                            style={{ width: `${(reviewCount / totalCards) * 100}%` }}
                            title={`Revisão: ${reviewCount}`}
                          ></div>
                        )}
                        {completedCount > 0 && (
                          <div
                            className="bg-green-500 dark:bg-green-600 transition-all hover:opacity-80"
                            style={{ width: `${(completedCount / totalCards) * 100}%` }}
                            title={`Concluído: ${completedCount}`}
                          ></div>
                        )}
                      </div>
                    </div>

                    {/* Estatísticas */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-900 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600"></div>
                          <span className="text-xs text-gray-700 dark:text-gray-300">Backlog</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{backlogCount}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-900 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-700"></div>
                          <span className="text-xs text-gray-700 dark:text-gray-300">A Fazer</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{todoCount}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-600"></div>
                          <span className="text-xs text-gray-700 dark:text-gray-300">Em Progresso</span>
                        </div>
                        <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{inProgressCount}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-600"></div>
                          <span className="text-xs text-gray-700 dark:text-gray-300">Revisão</span>
                        </div>
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{reviewCount}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-600"></div>
                          <span className="text-xs text-gray-700 dark:text-gray-300">Concluído</span>
                        </div>
                        <span className="text-sm font-bold text-green-700 dark:text-green-300">{completedCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Prioridades Urgentes */}
                  <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Urgentes</h3>
                      </div>
                    </div>

                    {sortedUrgentCards.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <CheckCircle2 className="w-12 h-12 text-green-500 dark:text-green-600 mb-3" />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Tudo certo!</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Nenhum card urgente</p>
                      </div>
                    ) : (
                      <>
                        {/* Resumo */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-xs text-red-600 dark:text-red-400 font-semibold mb-1">Urgente</p>
                            <p className="text-2xl font-black text-red-700 dark:text-red-300">{urgentCount}</p>
                          </div>
                          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                            <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold mb-1">Alta</p>
                            <p className="text-2xl font-black text-orange-700 dark:text-orange-300">{highCount}</p>
                          </div>
                        </div>

                        {/* Lista */}
                        <div className="space-y-2">
                          {sortedUrgentCards.map((task: any, idx: number) => (
                            <Link key={idx} href={`/workspace/${task.groupId}/${task.pageId}`}>
                              <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-2 hover:border-gray-400 dark:hover:border-slate-600 transition-colors cursor-pointer">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    task.priority === 'urgent'
                                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                      : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                  }`}>
                                    {task.priority === 'urgent' ? 'URG' : 'ALTA'}
                                  </span>
                                  <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">{task.title}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
                                  <span className="truncate">{task.pageName}</span>
                                  <span className={`px-1 py-0.5 rounded text-[9px] ${
                                    task.status?.id === 'in-progress' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                    task.status?.id === 'review' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                    'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                  }`}>
                                    {task.status?.name || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>

                        {urgentCards.length > 4 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                            +{urgentCards.length - 4} mais
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Card 3: Bugs */}
            {(() => {
              const bugsPages = workspace.groups.flatMap(g => g.pages.filter(p => p.template === 'bugs'));
              if (bugsPages.length === 0) return null;
              const totalBugs = bugsPages.reduce((sum, p) => sum + (p.data?.bugs?.length || 0), 0);
              const critical = bugsPages.reduce((sum, p) => sum + (p.data?.bugs?.filter((b: any) => b.severity === 'critical').length || 0), 0);
              const resolved = bugsPages.reduce((sum, p) => sum + (p.data?.bugs?.filter((b: any) => b.status === 'resolved').length || 0), 0);

              return (
                <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Bug className="w-5 h-5 text-gray-900 dark:text-white" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bugs</h3>
                    </div>
                    <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{bugsPages.length}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                      <span className="text-2xl font-black text-gray-900 dark:text-white">{totalBugs}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Críticos</span>
                      <span className="text-lg font-bold text-red-600 dark:text-red-400">{critical}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Resolvidos</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">{resolved}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden mt-4">
                      <div className="h-full bg-gray-900 dark:bg-white rounded-full transition-all" style={{ width: `${totalBugs > 0 ? (resolved / totalBugs) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Card 4: Calendar - 2 Cards lado a lado */}
            {(() => {
              const calendarPages = workspace.groups.flatMap(g =>
                g.pages.filter(p => p.template === 'calendar').map(page => ({
                  ...page,
                  groupId: g.id,
                  groupName: g.name
                }))
              );

              if (calendarPages.length === 0) return null;

              const allEvents = calendarPages.flatMap(p => (p.data?.events || []).map((e: any) => ({
                ...e,
                pageId: p.id,
                pageName: p.name,
                groupId: p.groupId
              })));

              const totalEvents = allEvents.length;

              // Encontrar primeira página de calendar para redirecionar
              const firstCalendarPage = calendarPages[0];
              const calendarLink = `/workspace/${firstCalendarPage.groupId}/${firstCalendarPage.id}`;

              const today = new Date();
              today.setHours(0, 0, 0, 0);

              // Eventos de hoje
              const todayEvents = allEvents.filter((e: any) => {
                const eventDate = new Date(e.date);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate.getTime() === today.getTime();
              });

              // Próximos 7 dias
              const sevenDaysFromNow = new Date(today);
              sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

              const upcomingEvents = allEvents.filter((e: any) => {
                const eventDate = new Date(e.date);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate >= today && eventDate <= sevenDaysFromNow;
              }).sort((a: any, b: any) => {
                const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
                if (dateCompare !== 0) return dateCompare;
                return a.time.localeCompare(b.time);
              }).slice(0, 5);

              // Estatísticas por categoria
              const categoryStats = {
                meeting: allEvents.filter((e: any) => e.category === 'meeting').length,
                deadline: allEvents.filter((e: any) => e.category === 'deadline').length,
                personal: allEvents.filter((e: any) => e.category === 'personal').length,
                task: allEvents.filter((e: any) => e.category === 'task').length,
                reminder: allEvents.filter((e: any) => e.category === 'reminder').length,
              };

              // Eventos com Google Meet
              const eventsWithMeet = allEvents.filter((e: any) => e.googleMeetLink).length;

              // Deadlines urgentes (próximos 3 dias)
              const threeDaysFromNow = new Date(today);
              threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

              const urgentDeadlines = allEvents.filter((e: any) => {
                if (e.category !== 'deadline') return false;
                const eventDate = new Date(e.date);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate >= today && eventDate <= threeDaysFromNow;
              }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

              // Se não tiver nenhum evento
              if (totalEvents === 0) {
                return (
                  <div className="col-span-full bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-gray-900 dark:text-white" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Calendário</h3>
                      </div>
                      <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{calendarPages.length} página(s)</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-12">
                      <CalendarIcon className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Nenhum evento agendado ainda</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Comece adicionando seus eventos e compromissos</p>
                      <Link href={calendarLink}>
                        <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Adicionar Eventos
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              }

              return (
                <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card Esquerdo - Próximos Eventos */}
                  <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Próximos Eventos</h3>
                      </div>
                      <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{calendarPages.length} página(s)</span>
                    </div>

                    {/* Resumo rápido */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">Hoje</p>
                        <p className="text-2xl font-black text-blue-700 dark:text-blue-300">{todayEvents.length}</p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-1">Esta Semana</p>
                        <p className="text-2xl font-black text-purple-700 dark:text-purple-300">{upcomingEvents.length}</p>
                      </div>
                    </div>

                    {upcomingEvents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <CheckCircle2 className="w-12 h-12 text-green-500 dark:text-green-600 mb-3" />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Agenda livre!</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Nenhum evento nos próximos dias</p>
                        <Link href={calendarLink}>
                          <button className="px-3 py-1.5 text-xs bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2">
                            <ArrowRight className="w-3 h-3" />
                            Ver Calendário
                          </button>
                        </Link>
                      </div>
                    ) : (
                      <>
                        {/* Lista de próximos eventos */}
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Próximos {upcomingEvents.length} Eventos
                          </h4>
                          <div className="space-y-2">
                            {upcomingEvents.map((event: any, idx: number) => {
                              const eventDate = new Date(event.date);
                              const isToday = eventDate.getTime() === today.getTime();
                              const categoryColor = event.category === 'meeting' ? 'blue' :
                                                   event.category === 'deadline' ? 'rose' :
                                                   event.category === 'personal' ? 'emerald' :
                                                   event.category === 'task' ? 'amber' : 'purple';

                              return (
                                <Link key={idx} href={`/workspace/${event.groupId}/${event.pageId}`}>
                                  <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-3 hover:border-gray-400 dark:hover:border-slate-600 transition-colors cursor-pointer">
                                    <div className="flex items-start gap-3">
                                      <div className={`w-1 h-full rounded-full bg-${categoryColor}-500`}></div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          {isToday && (
                                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                              HOJE
                                            </span>
                                          )}
                                          <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">{event.title}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                          <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {event.time}{event.endTime && ` - ${event.endTime}`}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <CalendarIcon className="w-3 h-3" />
                                            {new Date(event.date).toLocaleDateString('pt-BR')}
                                          </span>
                                          {event.googleMeetLink && (
                                            <span className="text-blue-600 dark:text-blue-400">📹 Meet</span>
                                          )}
                                        </div>
                                        {event.location && (
                                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">📍 {event.location}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                          <Link href={calendarLink}>
                            <button className="w-full mt-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-900 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-800">
                              Ver Calendário Completo
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </Link>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Card Direito - Estatísticas + Deadlines Urgentes */}
                  <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-gray-900 dark:text-white" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Estatísticas</h3>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Total: <span className="font-bold text-gray-900 dark:text-white">{totalEvents}</span>
                      </span>
                    </div>

                    {/* Distribuição por categoria */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Por Categoria</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-xs text-gray-700 dark:text-gray-300">Reuniões</span>
                          </div>
                          <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{categoryStats.meeting}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                            <span className="text-xs text-gray-700 dark:text-gray-300">Entregas</span>
                          </div>
                          <span className="text-sm font-bold text-rose-700 dark:text-rose-300">{categoryStats.deadline}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="text-xs text-gray-700 dark:text-gray-300">Pessoal</span>
                          </div>
                          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{categoryStats.personal}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            <span className="text-xs text-gray-700 dark:text-gray-300">Tarefas</span>
                          </div>
                          <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{categoryStats.task}</span>
                        </div>
                      </div>
                    </div>

                    {/* Google Meet */}
                    {eventsWithMeet > 0 && (
                      <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📹</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">Com Google Meet</span>
                          </div>
                          <span className="text-lg font-black text-blue-700 dark:text-blue-300">{eventsWithMeet}</span>
                        </div>
                      </div>
                    )}

                    {/* Deadlines urgentes */}
                    {urgentDeadlines.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          Entregas Urgentes
                        </h4>
                        <div className="space-y-2">
                          {urgentDeadlines.slice(0, 3).map((deadline: any, idx: number) => (
                            <div key={idx} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                              <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">{deadline.title}</p>
                              <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                                <Clock className="w-3 h-3" />
                                {new Date(deadline.date).toLocaleDateString('pt-BR')} • {deadline.time}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {urgentDeadlines.length === 0 && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 text-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Sem entregas urgentes</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tudo tranquilo nos próximos dias</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Card 5: Personal Budget - 2x1 + 1x1 */}
            {(() => {
              const budgetPages = workspace.groups.flatMap(g =>
                g.pages.filter(p => p.template === 'personal-budget').map(page => ({
                  ...page,
                  groupId: g.id,
                  groupName: g.name
                }))
              );

              if (budgetPages.length === 0) return null;

              // Pegar o mês atual
              const currentMonth = new Date().toISOString().slice(0, 7);

              // Agregar todas as transações de todas as páginas
              const allTransactions = budgetPages.flatMap(p =>
                (p.data?.transactions || []).filter((t: any) => t.date.slice(0, 7) === currentMonth).map((t: any) => ({
                  ...t,
                  pageId: p.id,
                  pageName: p.name,
                  groupId: p.groupId
                }))
              );

              // Calcular totais
              const totalIncome = allTransactions.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + t.amount, 0);
              const totalExpense = allTransactions.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + t.amount, 0);
              const balance = totalIncome - totalExpense;
              const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : "0";

              // Calcular gastos por categoria
              const allCategories = budgetPages.flatMap(p => p.data?.categories || []);
              const categoryExpenses = new Map();

              allTransactions.filter((t: any) => t.type === 'expense').forEach((t: any) => {
                const current = categoryExpenses.get(t.categoryId) || 0;
                categoryExpenses.set(t.categoryId, current + t.amount);
              });

              const topCategories = Array.from(categoryExpenses.entries())
                .map(([catId, amount]: [string, any]) => {
                  const category = allCategories.find((c: any) => c.id === catId);
                  return {
                    id: catId,
                    name: category?.name || 'Outros',
                    amount: amount,
                    color: category?.color || 'gray',
                    budget: category?.budget
                  };
                })
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 3);

              // Calcular categorias estouradas (acima do orçamento)
              const overBudgetCategories = topCategories.filter(cat => {
                if (!cat.budget || cat.budget <= 0) return false;
                const budgetAmount = totalIncome > 0 ? (totalIncome * cat.budget) / 100 : 0;
                return cat.amount > budgetAmount;
              });

              // Despesas pendentes (não pagas)
              const pendingExpenses = allTransactions.filter((t: any) => t.type === 'expense' && !t.paid);

              // Cartões de crédito
              const allCreditCards = budgetPages.flatMap(p => p.data?.creditCards || []);
              const totalCreditCardDebt = allCreditCards.reduce((sum: number, card: any) => sum + (card.currentBill || 0), 0);

              // Metas financeiras
              const allGoals = budgetPages.flatMap(p =>
                (p.data?.goals || []).map((g: any) => ({
                  ...g,
                  pageId: p.id,
                  pageName: p.name,
                  groupId: p.groupId
                }))
              );

              const highPriorityGoals = allGoals.filter((g: any) => g.priority === 'high');

              // Encontrar primeira página para redirecionar
              const firstBudgetPage = budgetPages[0];
              const budgetLink = `/workspace/${firstBudgetPage.groupId}/${firstBudgetPage.id}`;

              // Se não tiver nenhuma transação
              if (allTransactions.length === 0) {
                return (
                  <div className="col-span-full bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-gray-900 dark:text-white" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Orçamento Pessoal</h3>
                      </div>
                      <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{budgetPages.length} página(s)</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-12">
                      <Wallet className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Nenhuma transação ainda</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Comece registrando suas receitas e despesas</p>
                      <Link href={budgetLink}>
                        <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Adicionar Transações
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              }

              return (
                <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card Grande 2x1 - Visão Geral */}
                  <div className="md:col-span-2 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Visão Geral do Mês</h3>
                      </div>
                      <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{budgetPages.length}p</span>
                    </div>

                    {/* Saldo destaque */}
                    <div className={`mb-6 p-6 rounded-xl border-2 ${
                      balance >= 0
                        ? 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800'
                        : 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Saldo do Mês</p>
                          <p className={`text-4xl font-black ${
                            balance >= 0
                              ? 'text-green-700 dark:text-green-300'
                              : 'text-red-700 dark:text-red-300'
                          }`}>
                            R$ {Math.abs(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {balance >= 0 ? 'Superávit' : 'Déficit'}
                          </p>
                        </div>
                        {balance >= 0 ? (
                          <TrendingUp className="w-12 h-12 text-green-600 dark:text-green-400" />
                        ) : (
                          <TrendingDown className="w-12 h-12 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                    </div>

                    {/* Receitas e Despesas */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <ArrowUpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Receitas</span>
                        </div>
                        <p className="text-2xl font-black text-blue-700 dark:text-blue-300">
                          R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center gap-2 mb-2">
                          <ArrowDownCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Despesas</span>
                        </div>
                        <p className="text-2xl font-black text-orange-700 dark:text-orange-300">
                          R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    {/* Taxa de economia */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Taxa de Economia</span>
                        <span className="text-lg font-black text-gray-900 dark:text-white">{savingsRate}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 dark:bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            parseFloat(savingsRate) >= 20
                              ? 'bg-gradient-to-r from-green-500 to-green-600'
                              : parseFloat(savingsRate) >= 10
                              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                              : 'bg-gradient-to-r from-red-500 to-red-600'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, parseFloat(savingsRate)))}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {parseFloat(savingsRate) >= 20 ? 'Excelente!' : parseFloat(savingsRate) >= 10 ? 'Bom caminho' : 'Precisa melhorar'}
                      </p>
                    </div>

                    {/* Top 3 Categorias */}
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Maiores Gastos</h4>
                      <div className="space-y-2">
                        {topCategories.map((cat, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{idx + 1}º</span>
                              <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{cat.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {totalExpense > 0 ? ((cat.amount / totalExpense) * 100).toFixed(1) : 0}% do total
                                </p>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              R$ {cat.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Pequeno 1x1 - Alertas */}
                  <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                      <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Atenção</h3>
                    </div>

                    <div className="space-y-4">
                      {/* Categorias estouradas */}
                      {overBudgetCategories.length > 0 && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-red-600 dark:text-red-400" />
                            <span className="text-xs font-bold text-red-700 dark:text-red-300">Orçamento Estourado</span>
                          </div>
                          <div className="space-y-1">
                            {overBudgetCategories.slice(0, 2).map((cat, idx) => (
                              <p key={idx} className="text-xs text-gray-700 dark:text-gray-300">
                                • {cat.name}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Despesas pendentes */}
                      {pendingExpenses.length > 0 && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                            <span className="text-xs font-bold text-yellow-700 dark:text-yellow-300">Pendentes</span>
                          </div>
                          <p className="text-2xl font-black text-yellow-700 dark:text-yellow-300">{pendingExpenses.length}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            R$ {pendingExpenses.reduce((sum: number, t: any) => sum + t.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      )}

                      {/* Dívida de cartões */}
                      {totalCreditCardDebt > 0 && (
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-xs font-bold text-purple-700 dark:text-purple-300">Faturas</span>
                          </div>
                          <p className="text-2xl font-black text-purple-700 dark:text-purple-300">
                            R$ {totalCreditCardDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{allCreditCards.length} cartão(ões)</p>
                        </div>
                      )}

                      {/* Metas prioritárias */}
                      {highPriorityGoals.length > 0 && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Metas Altas</span>
                          </div>
                          <p className="text-2xl font-black text-blue-700 dark:text-blue-300">{highPriorityGoals.length}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Em andamento</p>
                        </div>
                      )}

                      {/* Estado sem alertas */}
                      {overBudgetCategories.length === 0 && pendingExpenses.length === 0 && totalCreditCardDebt === 0 && highPriorityGoals.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8">
                          <CheckCircle className="w-12 h-12 text-green-500 dark:text-green-600 mb-3" />
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Tudo em ordem!</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Suas finanças estão controladas</p>
                        </div>
                      )}
                    </div>

                    <Link href={budgetLink}>
                      <button className="w-full mt-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-900 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-800">
                        Ver Orçamento
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })()}

            {/* Card 6: Projects - 1x1 + 2x1 (invertido) */}
            {(() => {
              const projectPages = workspace.groups.flatMap(g =>
                g.pages.filter(p => p.template === 'projects').map(page => ({
                  ...page,
                  groupId: g.id,
                  groupName: g.name
                }))
              );

              if (projectPages.length === 0) return null;

              // Agregar todos os projetos
              const allProjects = projectPages.flatMap(p =>
                (p.data?.projects || []).map((proj: any) => ({
                  ...proj,
                  pageId: p.id,
                  pageName: p.name,
                  groupId: p.groupId
                }))
              );

              const totalProjects = allProjects.length;

              // Contar por status
              const statusCounts = {
                planning: allProjects.filter((p: any) => p.status === 'planning').length,
                active: allProjects.filter((p: any) => p.status === 'active').length,
                paused: allProjects.filter((p: any) => p.status === 'paused').length,
                review: allProjects.filter((p: any) => p.status === 'review').length,
                completed: allProjects.filter((p: any) => p.status === 'completed').length,
                archived: allProjects.filter((p: any) => p.status === 'archived').length,
              };

              // Calcular progresso médio
              const averageProgress = totalProjects > 0
                ? allProjects.reduce((sum: number, p: any) => sum + (p.progress || 0), 0) / totalProjects
                : 0;

              // Top 3 projetos ativos por progresso
              const topProjects = allProjects
                .filter((p: any) => p.status === 'active')
                .sort((a: any, b: any) => b.progress - a.progress)
                .slice(0, 3);

              // Alertas
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const sevenDaysFromNow = new Date(today);
              sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

              // Projetos com prazo próximo (próximos 7 dias)
              const dueSoonProjects = allProjects.filter((p: any) => {
                if (!p.deadline || p.status === 'completed' || p.status === 'archived') return false;
                const deadline = new Date(p.deadline);
                deadline.setHours(0, 0, 0, 0);
                return deadline >= today && deadline <= sevenDaysFromNow;
              });

              // Projetos atrasados
              const overdueProjects = allProjects.filter((p: any) => {
                if (!p.deadline || p.status === 'completed' || p.status === 'archived') return false;
                const deadline = new Date(p.deadline);
                deadline.setHours(0, 0, 0, 0);
                return deadline < today;
              });

              // Prioridade crítica/alta
              const criticalProjects = allProjects.filter((p: any) =>
                (p.priority === 'critical' || p.priority === 'high') &&
                p.status !== 'completed' &&
                p.status !== 'archived'
              );

              // Orçamento crítico (gasto > 80%)
              const budgetCritical = allProjects.filter((p: any) => {
                if (!p.budget || !p.spent) return false;
                return (p.spent / p.budget) > 0.8;
              });

              // Encontrar primeira página
              const firstProjectPage = projectPages[0];
              const projectLink = `/workspace/${firstProjectPage.groupId}/${firstProjectPage.id}`;

              // Se não tiver nenhum projeto
              if (totalProjects === 0) {
                return (
                  <div className="col-span-full bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-gray-900 dark:text-white" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Projetos</h3>
                      </div>
                      <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{projectPages.length} página(s)</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-12">
                      <Briefcase className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Nenhum projeto ainda</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Comece criando seus projetos</p>
                      <Link href={projectLink}>
                        <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Criar Projeto
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              }

              return (
                <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card Pequeno 1x1 - Alertas (à esquerda) */}
                  <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Alertas</h3>
                    </div>

                    <div className="space-y-4">
                      {/* Projetos atrasados */}
                      {overdueProjects.length > 0 && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-red-600 dark:text-red-400" />
                            <span className="text-xs font-bold text-red-700 dark:text-red-300">Atrasados</span>
                          </div>
                          <p className="text-2xl font-black text-red-700 dark:text-red-300">{overdueProjects.length}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {overdueProjects.slice(0, 2).map((p: any) => p.name).join(', ')}
                          </p>
                        </div>
                      )}

                      {/* Vencendo em breve */}
                      {dueSoonProjects.length > 0 && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CalendarIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                            <span className="text-xs font-bold text-yellow-700 dark:text-yellow-300">Vence em Breve</span>
                          </div>
                          <p className="text-2xl font-black text-yellow-700 dark:text-yellow-300">{dueSoonProjects.length}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Próximos 7 dias</p>
                        </div>
                      )}

                      {/* Prioridade crítica */}
                      {criticalProjects.length > 0 && (
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            <span className="text-xs font-bold text-orange-700 dark:text-orange-300">Alta Prioridade</span>
                          </div>
                          <p className="text-2xl font-black text-orange-700 dark:text-orange-300">{criticalProjects.length}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Críticos/Altos</p>
                        </div>
                      )}

                      {/* Orçamento crítico */}
                      {budgetCritical.length > 0 && (
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-xs font-bold text-purple-700 dark:text-purple-300">Orçamento</span>
                          </div>
                          <p className="text-2xl font-black text-purple-700 dark:text-purple-300">{budgetCritical.length}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Acima de 80%</p>
                        </div>
                      )}

                      {/* Estado sem alertas */}
                      {overdueProjects.length === 0 && dueSoonProjects.length === 0 && criticalProjects.length === 0 && budgetCritical.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8">
                          <CheckCircle2 className="w-12 h-12 text-green-500 dark:text-green-600 mb-3" />
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Tudo certo!</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Projetos no prazo</p>
                        </div>
                      )}
                    </div>

                    <Link href={projectLink}>
                      <button className="w-full mt-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-900 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-800">
                        Ver Projetos
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>

                  {/* Card Grande 2x1 - Visão Geral (à direita) */}
                  <div className="md:col-span-2 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Visão Geral</h3>
                      </div>
                      <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{projectPages.length}p</span>
                    </div>

                    {/* Resumo de status */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">Ativos</p>
                        <p className="text-3xl font-black text-blue-700 dark:text-blue-300">{statusCounts.active}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <p className="text-xs text-green-600 dark:text-green-400 font-semibold mb-1">Concluídos</p>
                        <p className="text-3xl font-black text-green-700 dark:text-green-300">{statusCounts.completed}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-800">
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">Total</p>
                        <p className="text-3xl font-black text-gray-900 dark:text-white">{totalProjects}</p>
                      </div>
                    </div>

                    {/* Progresso médio */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Progresso Médio</span>
                        <span className="text-2xl font-black text-purple-700 dark:text-purple-300">{Math.round(averageProgress)}%</span>
                      </div>
                      <div className="h-3 bg-purple-200 dark:bg-purple-900/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all"
                          style={{ width: `${averageProgress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Distribuição por status */}
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Por Status</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {statusCounts.planning > 0 && (
                          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-900 rounded-lg text-xs">
                            <span className="text-gray-700 dark:text-gray-300">Planejamento</span>
                            <span className="font-bold text-gray-900 dark:text-white">{statusCounts.planning}</span>
                          </div>
                        )}
                        {statusCounts.paused > 0 && (
                          <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-xs">
                            <span className="text-yellow-700 dark:text-yellow-300">Pausados</span>
                            <span className="font-bold text-yellow-900 dark:text-yellow-200">{statusCounts.paused}</span>
                          </div>
                        )}
                        {statusCounts.review > 0 && (
                          <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-xs">
                            <span className="text-purple-700 dark:text-purple-300">Em Revisão</span>
                            <span className="font-bold text-purple-900 dark:text-purple-200">{statusCounts.review}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Top 3 projetos */}
                    {topProjects.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Projetos em Destaque</h4>
                        <div className="space-y-3">
                          {topProjects.map((project: any, idx: number) => (
                            <Link key={idx} href={`/workspace/${project.groupId}/${project.pageId}`}>
                              <div className="p-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg hover:border-gray-400 dark:hover:border-slate-600 transition-colors cursor-pointer">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-gray-500 dark:text-gray-400">{idx + 1}º</span>
                                    <div>
                                      <h5 className="text-sm font-semibold text-gray-900 dark:text-white">{project.name}</h5>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">{project.client || project.pageName}</p>
                                    </div>
                                  </div>
                                  <span className="text-lg font-black text-blue-700 dark:text-blue-300">{project.progress}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                                    style={{ width: `${project.progress}%` }}
                                  ></div>
                                </div>
                                {project.deadline && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                                    <CalendarIcon className="w-3 h-3" />
                                    Prazo: {new Date(project.deadline).toLocaleDateString('pt-BR')}
                                  </p>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Card 7: Wiki - 3x1 */}
            {(() => {
              const wikiPages = workspace.groups.flatMap(g =>
                g.pages.filter(p => p.template === 'wiki').map(page => ({
                  ...page,
                  groupId: g.id,
                  groupName: g.name
                }))
              );

              if (wikiPages.length === 0) return null;

              // Agregar todos os artigos
              const allArticles = wikiPages.flatMap(p =>
                (p.data?.articles || []).map((article: any) => ({
                  ...article,
                  pageId: p.id,
                  pageName: p.name,
                  groupId: p.groupId
                }))
              );

              const totalArticles = allArticles.length;
              const publishedArticles = allArticles.filter((a: any) => a.published).length;
              const draftArticles = allArticles.filter((a: any) => !a.published).length;
              const favoriteArticles = allArticles.filter((a: any) => a.favorite).length;

              // Calcular tags populares
              const tagCounts = new Map();
              allArticles.forEach((article: any) => {
                (article.tags || []).forEach((tag: string) => {
                  tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
                });
              });

              const topTags = Array.from(tagCounts.entries())
                .sort((a: any, b: any) => b[1] - a[1])
                .slice(0, 5);

              // Artigos atualizados recentemente
              const recentArticles = [...allArticles]
                .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 4);

              // Encontrar primeira página
              const firstWikiPage = wikiPages[0];
              const wikiLink = `/workspace/${firstWikiPage.groupId}/${firstWikiPage.id}`;

              // Se não tiver nenhum artigo
              if (totalArticles === 0) {
                return (
                  <div className="col-span-full bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-gray-900 dark:text-white" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Wiki</h3>
                      </div>
                      <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{wikiPages.length} página(s)</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-12">
                      <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Nenhum artigo ainda</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Comece criando artigos para sua wiki</p>
                      <Link href={wikiLink}>
                        <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Criar Artigo
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              }

              return (
                <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1: Visão Geral */}
                  <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Visão Geral</h3>
                      </div>
                      <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{wikiPages.length}p</span>
                    </div>

                    {/* Total destaque */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">Total de Artigos</p>
                      <p className="text-4xl font-black text-blue-700 dark:text-blue-300">{totalArticles}</p>
                    </div>

                    {/* Métricas */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">Publicados</span>
                        </div>
                        <span className="text-xl font-black text-green-700 dark:text-green-300">{publishedArticles}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">Rascunhos</span>
                        </div>
                        <span className="text-xl font-black text-yellow-700 dark:text-yellow-300">{draftArticles}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">Favoritos</span>
                        </div>
                        <span className="text-xl font-black text-purple-700 dark:text-purple-300">{favoriteArticles}</span>
                      </div>
                    </div>

                    <Link href={wikiLink}>
                      <button className="w-full mt-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-900 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-800">
                        Ver Wiki
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>

                  {/* Card 2: Tags Populares */}
                  <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                      <Tag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tags Populares</h3>
                    </div>

                    {topTags.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Tag className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Sem tags ainda</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Adicione tags aos artigos</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {topTags.map(([tag, count]: [string, any], idx: number) => {
                          const maxCount = topTags[0][1];
                          const percentage = (count / maxCount) * 100;

                          return (
                            <div key={idx} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400">#{idx + 1}</span>
                                  <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{tag}</span>
                                </div>
                                <span className="text-sm font-bold text-orange-700 dark:text-orange-300">{count}</span>
                              </div>
                              <div className="h-2 bg-gray-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {topTags.length > 0 && (
                      <div className="mt-6 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-bold text-gray-900 dark:text-white">{tagCounts.size}</span> tags únicas no total
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card 3: Atualizados Recentemente */}
                  <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                      <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recentes</h3>
                    </div>

                    <div className="space-y-3">
                      {recentArticles.map((article: any, idx: number) => {
                        const updatedDate = new Date(article.updatedAt);
                        const now = new Date();
                        const diffHours = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60));
                        const diffDays = Math.floor(diffHours / 24);

                        let timeAgo = '';
                        if (diffHours < 1) timeAgo = 'Agora';
                        else if (diffHours < 24) timeAgo = `${diffHours}h atrás`;
                        else if (diffDays < 7) timeAgo = `${diffDays}d atrás`;
                        else timeAgo = updatedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

                        return (
                          <Link key={idx} href={`/workspace/${article.groupId}/${article.pageId}`}>
                            <div className="p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg hover:border-gray-400 dark:hover:border-slate-600 transition-colors cursor-pointer">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h5 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 flex-1">
                                  {article.title}
                                </h5>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap ${
                                  article.published
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                }`}>
                                  {article.published ? 'Publicado' : 'Rascunho'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="w-3 h-3" />
                                <span>{timeAgo}</span>
                                {article.favorite && (
                                  <Star className="w-3 h-3 text-purple-500 fill-purple-500" />
                                )}
                              </div>
                              {article.tags && article.tags.length > 0 && (
                                <div className="flex items-center gap-1 mt-2 flex-wrap">
                                  {article.tags.slice(0, 2).map((tag: string, tagIdx: number) => (
                                    <span key={tagIdx} className="text-[10px] px-1.5 py-0.5 bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-gray-400 rounded">
                                      {tag}
                                    </span>
                                  ))}
                                  {article.tags.length > 2 && (
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                      +{article.tags.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Card 8: Notes - 2x1 */}
            {(() => {
              const notesPages = workspace.groups.flatMap(g =>
                g.pages.filter(p => p.template === 'notes').map(page => ({
                  ...page,
                  groupId: g.id,
                  groupName: g.name
                }))
              );

              if (notesPages.length === 0) return null;

              // Agregar todas as notas
              const allNotes = notesPages.flatMap(p =>
                (p.data?.notes || []).map((note: any) => ({
                  ...note,
                  pageId: p.id,
                  pageName: p.name,
                  groupId: p.groupId
                }))
              );

              const totalNotes = allNotes.length;
              const activeNotes = allNotes.filter((n: any) => !n.archived).length;
              const favoriteNotes = allNotes.filter((n: any) => n.favorite).length;
              const archivedNotes = allNotes.filter((n: any) => n.archived).length;

              // Calcular tags populares
              const tagCounts = new Map();
              allNotes.forEach((note: any) => {
                (note.tags || []).forEach((tag: string) => {
                  tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
                });
              });

              const topTags = Array.from(tagCounts.entries())
                .sort((a: any, b: any) => b[1] - a[1])
                .slice(0, 4);

              // Notas recentes (apenas ativas)
              const recentNotes = allNotes
                .filter((n: any) => !n.archived)
                .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 5);

              // Encontrar primeira página
              const firstNotesPage = notesPages[0];
              const notesLink = `/workspace/${firstNotesPage.groupId}/${firstNotesPage.id}`;

              // Se não tiver nenhuma nota
              if (totalNotes === 0) {
                return (
                  <div className="col-span-full bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <StickyNote className="w-5 h-5 text-gray-900 dark:text-white" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notas</h3>
                      </div>
                      <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{notesPages.length} página(s)</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-12">
                      <StickyNote className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Nenhuma nota ainda</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Comece criando suas primeiras notas</p>
                      <Link href={notesLink}>
                        <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Criar Nota
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              }

              return (
                <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card Esquerdo: Visão Geral + Tags */}
                  <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <StickyNote className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Visão Geral</h3>
                      </div>
                      <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{notesPages.length}p</span>
                    </div>

                    {/* Métricas */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold mb-1">Total</p>
                        <p className="text-3xl font-black text-yellow-700 dark:text-yellow-300">{totalNotes}</p>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                          <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">Favoritas</p>
                        </div>
                        <p className="text-3xl font-black text-purple-700 dark:text-purple-300">{favoriteNotes}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Ativas</span>
                        <span className="text-xl font-black text-green-700 dark:text-green-300">{activeNotes}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Arquivadas</span>
                        <span className="text-xl font-black text-gray-700 dark:text-gray-300">{archivedNotes}</span>
                      </div>
                    </div>

                    {/* Tags Populares */}
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Tags Populares
                      </h4>
                      {topTags.length === 0 ? (
                        <div className="text-center py-6">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Sem tags ainda</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {topTags.map(([tag, count]: [string, any], idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-900 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-400 dark:text-gray-500">#{idx + 1}</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{tag}</span>
                              </div>
                              <span className="text-xs font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                                {count}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Link href={notesLink}>
                      <button className="w-full mt-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-900 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-800">
                        Ver Notas
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>

                  {/* Card Direito: Notas Recentes */}
                  <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notas Recentes</h3>
                    </div>

                    <div className="space-y-3">
                      {recentNotes.map((note: any, idx: number) => {
                        const updatedDate = new Date(note.updatedAt);
                        const now = new Date();
                        const diffHours = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60));
                        const diffDays = Math.floor(diffHours / 24);

                        let timeAgo = '';
                        if (diffHours < 1) timeAgo = 'Agora';
                        else if (diffHours < 24) timeAgo = `${diffHours}h atrás`;
                        else if (diffDays < 7) timeAgo = `${diffDays}d atrás`;
                        else timeAgo = updatedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

                        // Extrair preview do conteúdo (remover HTML se houver)
                        const contentPreview = note.content
                          ?.replace(/<[^>]*>/g, '')
                          ?.substring(0, 60) || 'Nota vazia';

                        return (
                          <Link key={idx} href={`/workspace/${note.groupId}/${note.pageId}`}>
                            <div className="p-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg hover:border-gray-400 dark:hover:border-slate-600 transition-colors cursor-pointer">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h5 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 flex-1">
                                  {note.title}
                                </h5>
                                {note.favorite && (
                                  <Star className="w-4 h-4 text-purple-500 fill-purple-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                {contentPreview}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                  <Clock className="w-3 h-3" />
                                  <span>{timeAgo}</span>
                                </div>
                                {note.tags && note.tags.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Tag className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{note.tags.length}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>

                    {recentNotes.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12">
                        <StickyNote className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Nenhuma nota ativa</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Todas as notas estão arquivadas</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Cards 9-10: Documents (1x1) + Roadmap (2x1) - Layout Condicional */}
            {(() => {
              // Buscar páginas de documentos e roadmap
              const documentsPages = workspace.groups.flatMap(g =>
                g.pages.filter(p => p.template === 'documents').map(page => ({
                  ...page,
                  groupId: g.id,
                  groupName: g.name
                }))
              );

              const roadmapPages = workspace.groups.flatMap(g =>
                g.pages.filter(p => p.template === 'roadmap').map(page => ({
                  ...page,
                  groupId: g.id,
                  groupName: g.name
                }))
              );

              // Se não tiver nem documents nem roadmap, não renderiza nada
              if (documentsPages.length === 0 && roadmapPages.length === 0) return null;

              // Determinar layout: se tiver documents, usar grid 3 colunas, senão roadmap usa full width
              const hasDocuments = documentsPages.length > 0;
              const hasRoadmap = roadmapPages.length > 0;

              return (
                <div className={`col-span-full ${hasDocuments && hasRoadmap ? 'grid grid-cols-1 md:grid-cols-3 gap-6' : ''}`}>
                  {/* Card 9: Documents - 1x1 */}
                  {hasDocuments && (() => {

              // Agregar todos os arquivos
              const allFiles = documentsPages.flatMap(p =>
                (p.data?.files || []).map((file: any) => ({
                  ...file,
                  pageId: p.id,
                  pageName: p.name,
                  groupId: p.groupId
                }))
              );

              const totalFiles = allFiles.length;
              const starredFiles = allFiles.filter((f: any) => f.starred).length;
              const sharedFiles = allFiles.filter((f: any) => f.shared).length;

              // Contar por tipo
              const typeCounts = {
                folders: allFiles.filter((f: any) => f.mimeType?.includes('folder')).length,
                documents: allFiles.filter((f: any) =>
                  f.mimeType?.includes('document') || f.mimeType?.includes('word')
                ).length,
                spreadsheets: allFiles.filter((f: any) =>
                  f.mimeType?.includes('sheet') || f.mimeType?.includes('excel')
                ).length,
                pdfs: allFiles.filter((f: any) => f.mimeType?.includes('pdf')).length,
                images: allFiles.filter((f: any) => f.mimeType?.includes('image')).length,
              };

              // Arquivos recentes (últimos 7 dias)
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              const recentFiles = allFiles.filter((f: any) =>
                new Date(f.modifiedTime) > sevenDaysAgo
              ).length;

              // Encontrar primeira página
              const firstDocumentsPage = documentsPages[0];
              const documentsLink = `/workspace/${firstDocumentsPage.groupId}/${firstDocumentsPage.id}`;

              // Se não tiver nenhum arquivo
              if (totalFiles === 0) {
                return (
                  <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Cloud className="w-5 h-5 text-gray-900 dark:text-white" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Documentos</h3>
                      </div>
                      <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{documentsPages.length}p</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-12">
                      <Cloud className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Nenhum documento</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Conecte ao Google Drive</p>
                      <Link href={documentsLink}>
                        <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2">
                          <Cloud className="w-4 h-4" />
                          Conectar Drive
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              }

              return (
                <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Documentos</h3>
                    </div>
                    <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{documentsPages.length}p</span>
                  </div>

                  {/* Total destaque */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">Total de Arquivos</p>
                    <p className="text-4xl font-black text-blue-700 dark:text-blue-300">{totalFiles}</p>
                  </div>

                  {/* Métricas */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Favoritos</span>
                      </div>
                      <span className="text-xl font-black text-yellow-700 dark:text-yellow-300">{starredFiles}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Compartilhados</span>
                      </div>
                      <span className="text-xl font-black text-green-700 dark:text-green-300">{sharedFiles}</span>
                    </div>
                  </div>

                  {/* Por tipo */}
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Por Tipo</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {typeCounts.folders > 0 && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-900 rounded">
                          <span className="text-gray-700 dark:text-gray-300">Pastas</span>
                          <span className="font-bold text-gray-900 dark:text-white">{typeCounts.folders}</span>
                        </div>
                      )}
                      {typeCounts.documents > 0 && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-900 rounded">
                          <span className="text-gray-700 dark:text-gray-300">Documentos</span>
                          <span className="font-bold text-gray-900 dark:text-white">{typeCounts.documents}</span>
                        </div>
                      )}
                      {typeCounts.spreadsheets > 0 && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-900 rounded">
                          <span className="text-gray-700 dark:text-gray-300">Planilhas</span>
                          <span className="font-bold text-gray-900 dark:text-white">{typeCounts.spreadsheets}</span>
                        </div>
                      )}
                      {typeCounts.pdfs > 0 && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-900 rounded">
                          <span className="text-gray-700 dark:text-gray-300">PDFs</span>
                          <span className="font-bold text-gray-900 dark:text-white">{typeCounts.pdfs}</span>
                        </div>
                      )}
                      {typeCounts.images > 0 && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-900 rounded">
                          <span className="text-gray-700 dark:text-gray-300">Imagens</span>
                          <span className="font-bold text-gray-900 dark:text-white">{typeCounts.images}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recentes */}
                  {recentFiles > 0 && (
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">Editados recentemente</span>
                        </div>
                        <span className="text-lg font-black text-purple-700 dark:text-purple-300">{recentFiles}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Últimos 7 dias</p>
                    </div>
                  )}

                  <Link href={documentsLink}>
                    <button className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-900 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-800">
                      Ver Documentos
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              );
            })()}

                  {/* Card 10: Roadmap - 2x1 (ou full-width se não houver documents) */}
                  {hasRoadmap && (() => {
                    // Agregar todos os itens de roadmap
                    const allItems = roadmapPages.flatMap(p =>
                      (p.data?.items || []).map((item: any) => ({
                        ...item,
                        pageId: p.id,
                        pageName: p.name,
                        groupId: p.groupId
                      }))
                    );

                    const allMilestones = roadmapPages.flatMap(p => p.data?.milestones || []);

                    const totalItems = allItems.length;
                    const completedItems = allItems.filter((i: any) => i.status === 'done').length;
                    const inProgressItems = allItems.filter((i: any) => i.status === 'in-progress').length;
                    const plannedItems = allItems.filter((i: any) => i.status === 'planned').length;
                    const backlogItems = allItems.filter((i: any) => i.status === 'backlog').length;
                    const cancelledItems = allItems.filter((i: any) => i.status === 'cancelled').length;

                    // Calcular progresso médio
                    const averageProgress = totalItems > 0
                      ? Math.round(allItems.reduce((sum: number, i: any) => sum + (i.progress || 0), 0) / totalItems)
                      : 0;

                    // Itens críticos
                    const criticalItems = allItems.filter((i: any) => i.priority === 'critical' && i.status !== 'done' && i.status !== 'cancelled');

                    // Itens atrasados
                    const now = new Date();
                    const overdueItems = allItems.filter((i: any) => {
                      if (i.status === 'done' || i.status === 'cancelled') return false;
                      const dueDate = new Date(i.dueDate);
                      return dueDate < now;
                    });

                    // Próximos milestones
                    const upcomingMilestones = allMilestones
                      .filter((m: any) => m.status === 'upcoming' || m.status === 'current')
                      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .slice(0, 3);

                    const firstRoadmapPage = roadmapPages[0];
                    const roadmapLink = `/workspace/${firstRoadmapPage.groupId}/${firstRoadmapPage.id}`;

                    // Se não tiver nenhum item
                    if (totalItems === 0) {
                      return (
                        <div className={`bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm ${!hasDocuments ? 'col-span-full' : 'md:col-span-2'}`}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-gray-900 dark:text-white" />
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Roadmap</h3>
                            </div>
                            <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{roadmapPages.length}p</span>
                          </div>
                          <div className="flex flex-col items-center justify-center py-12">
                            <MapPin className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                            <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Nenhum item no roadmap</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Comece planejando seu roadmap</p>
                            <Link href={roadmapLink}>
                              <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Adicionar Item
                              </button>
                            </Link>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className={`bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm ${!hasDocuments ? 'col-span-full' : 'md:col-span-2'}`}>
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Roadmap</h3>
                          </div>
                          <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{roadmapPages.length}p</span>
                        </div>

                        {/* Métricas principais */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
                            <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-1">Total</p>
                            <p className="text-3xl font-black text-purple-700 dark:text-purple-300">{totalItems}</p>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800">
                            <p className="text-xs text-green-600 dark:text-green-400 font-semibold mb-1">Concluídos</p>
                            <p className="text-3xl font-black text-green-700 dark:text-green-300">{completedItems}</p>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800">
                            <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold mb-1">Em Progresso</p>
                            <p className="text-3xl font-black text-orange-700 dark:text-orange-300">{inProgressItems}</p>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">Progresso Médio</p>
                            <p className="text-3xl font-black text-blue-700 dark:text-blue-300">{averageProgress}%</p>
                          </div>
                        </div>

                        {/* Distribuição por status */}
                        <div className="mb-6">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Distribuição por Status</h4>
                          <div className="w-full h-3 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden flex mb-3">
                            {completedItems > 0 && (
                              <div
                                className="bg-green-500 dark:bg-green-400 h-full"
                                style={{ width: `${(completedItems / totalItems) * 100}%` }}
                                title={`Concluídos: ${completedItems}`}
                              />
                            )}
                            {inProgressItems > 0 && (
                              <div
                                className="bg-orange-500 dark:bg-orange-400 h-full"
                                style={{ width: `${(inProgressItems / totalItems) * 100}%` }}
                                title={`Em Progresso: ${inProgressItems}`}
                              />
                            )}
                            {plannedItems > 0 && (
                              <div
                                className="bg-blue-500 dark:bg-blue-400 h-full"
                                style={{ width: `${(plannedItems / totalItems) * 100}%` }}
                                title={`Planejados: ${plannedItems}`}
                              />
                            )}
                            {backlogItems > 0 && (
                              <div
                                className="bg-gray-500 dark:bg-gray-400 h-full"
                                style={{ width: `${(backlogItems / totalItems) * 100}%` }}
                                title={`Backlog: ${backlogItems}`}
                              />
                            )}
                            {cancelledItems > 0 && (
                              <div
                                className="bg-red-500 dark:bg-red-400 h-full"
                                style={{ width: `${(cancelledItems / totalItems) * 100}%` }}
                                title={`Cancelados: ${cancelledItems}`}
                              />
                            )}
                          </div>
                          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-xs">
                            <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                              <span className="text-gray-700 dark:text-gray-300">Concluídos</span>
                              <span className="font-bold text-green-700 dark:text-green-300">{completedItems}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                              <span className="text-gray-700 dark:text-gray-300">Em Progresso</span>
                              <span className="font-bold text-orange-700 dark:text-orange-300">{inProgressItems}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                              <span className="text-gray-700 dark:text-gray-300">Planejados</span>
                              <span className="font-bold text-blue-700 dark:text-blue-300">{plannedItems}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-900 rounded border border-gray-200 dark:border-slate-800">
                              <span className="text-gray-700 dark:text-gray-300">Backlog</span>
                              <span className="font-bold text-gray-700 dark:text-gray-300">{backlogItems}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                              <span className="text-gray-700 dark:text-gray-300">Cancelados</span>
                              <span className="font-bold text-red-700 dark:text-red-300">{cancelledItems}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {/* Alertas */}
                          {(criticalItems.length > 0 || overdueItems.length > 0) && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                              <h4 className="text-sm font-bold text-red-900 dark:text-red-300 mb-3 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Requer Atenção
                              </h4>
                              <div className="space-y-2">
                                {overdueItems.length > 0 && (
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-700 dark:text-gray-300">Atrasados</span>
                                    <span className="font-bold text-red-700 dark:text-red-300">{overdueItems.length}</span>
                                  </div>
                                )}
                                {criticalItems.length > 0 && (
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-700 dark:text-gray-300">Prioridade Crítica</span>
                                    <span className="font-bold text-red-700 dark:text-red-300">{criticalItems.length}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Próximos Milestones */}
                          {upcomingMilestones.length > 0 && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                                <Flag className="w-4 h-4" />
                                Próximos Milestones
                              </h4>
                              <div className="space-y-2">
                                {upcomingMilestones.map((milestone: any, index: number) => {
                                  const milestoneDate = new Date(milestone.date);
                                  const diffDays = Math.ceil((milestoneDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                  return (
                                    <div key={index} className="text-sm">
                                      <div className="flex items-center justify-between">
                                        <span className="text-gray-900 dark:text-white font-semibold truncate flex-1">{milestone.name}</span>
                                        <span className={`text-xs font-bold ml-2 ${diffDays <= 7 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                          {diffDays <= 0 ? 'Hoje' : `${diffDays}d`}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        <Link href={roadmapLink}>
                          <button className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-900 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-800">
                            Ver Roadmap
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </Link>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}

            {/* Card 11: Timeline - Full Width */}
            {(() => {
              const timelinePages = workspace.groups.flatMap(g =>
                g.pages.filter(p => p.template === 'timeline').map(page => ({
                  ...page,
                  groupId: g.id,
                  groupName: g.name
                }))
              );

              if (timelinePages.length === 0) return null;

              // Agregar todos os eventos
              const allEvents = timelinePages.flatMap(p =>
                (p.data?.events || []).map((event: any) => ({
                  ...event,
                  pageId: p.id,
                  pageName: p.name,
                  groupId: p.groupId
                }))
              );

              const totalEvents = allEvents.length;
              const completedEvents = allEvents.filter((e: any) => e.status === 'completed').length;
              const pendingEvents = allEvents.filter((e: any) => e.status === 'pending').length;
              const cancelledEvents = allEvents.filter((e: any) => e.status === 'cancelled').length;

              // Contar por tipo
              const milestones = allEvents.filter((e: any) => e.type === 'milestone').length;
              const meetings = allEvents.filter((e: any) => e.type === 'meeting').length;
              const releases = allEvents.filter((e: any) => e.type === 'release').length;
              const events = allEvents.filter((e: any) => e.type === 'event').length;

              // Próximos eventos (futuros, não completados/cancelados)
              const now = new Date();
              const upcomingEvents = allEvents
                .filter((e: any) => {
                  const eventDate = new Date(e.date);
                  return eventDate >= now && e.status === 'pending';
                })
                .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5);

              // Eventos recentes completados
              const recentCompleted = allEvents
                .filter((e: any) => e.status === 'completed')
                .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 3);

              const firstTimelinePage = timelinePages[0];
              const timelineLink = `/workspace/${firstTimelinePage.groupId}/${firstTimelinePage.id}`;

              // Se não tiver nenhum evento
              if (totalEvents === 0) {
                return (
                  <div className="col-span-full bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-5 h-5 text-gray-900 dark:text-white" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Timeline</h3>
                      </div>
                      <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{timelinePages.length}p</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-12">
                      <GitBranch className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Nenhum evento na timeline</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Comece adicionando eventos importantes</p>
                      <Link href={timelineLink}>
                        <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Adicionar Evento
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              }

              return (
                <div className="col-span-full bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Timeline</h3>
                    </div>
                    <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{timelinePages.length}p</span>
                  </div>

                  {/* Métricas principais */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">Total de Eventos</p>
                      <p className="text-3xl font-black text-indigo-700 dark:text-indigo-300">{totalEvents}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800">
                      <p className="text-xs text-green-600 dark:text-green-400 font-semibold mb-1">Completados</p>
                      <p className="text-3xl font-black text-green-700 dark:text-green-300">{completedEvents}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold mb-1">Pendentes</p>
                      <p className="text-3xl font-black text-yellow-700 dark:text-yellow-300">{pendingEvents}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-800">
                      <p className="text-xs text-red-600 dark:text-red-400 font-semibold mb-1">Cancelados</p>
                      <p className="text-3xl font-black text-red-700 dark:text-red-300">{cancelledEvents}</p>
                    </div>
                  </div>

                  {/* Por Tipo */}
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Por Tipo</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">Marcos</span>
                        </div>
                        <span className="text-xl font-black text-blue-700 dark:text-blue-300">{milestones}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">Reuniões</span>
                        </div>
                        <span className="text-xl font-black text-purple-700 dark:text-purple-300">{meetings}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">Releases</span>
                        </div>
                        <span className="text-xl font-black text-green-700 dark:text-green-300">{releases}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">Eventos</span>
                        </div>
                        <span className="text-xl font-black text-orange-700 dark:text-orange-300">{events}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Próximos Eventos */}
                    {upcomingEvents.length > 0 && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          Próximos Eventos
                        </h4>
                        <div className="space-y-3">
                          {upcomingEvents.map((event: any, index: number) => {
                            const eventDate = new Date(event.date);
                            const diffDays = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                            const typeConfig = {
                              milestone: { icon: Target, color: 'text-blue-600 dark:text-blue-400' },
                              meeting: { icon: Users, color: 'text-purple-600 dark:text-purple-400' },
                              release: { icon: Zap, color: 'text-green-600 dark:text-green-400' },
                              event: { icon: Flame, color: 'text-orange-600 dark:text-orange-400' },
                            }[event.type] || { icon: CalendarIcon, color: 'text-gray-600 dark:text-gray-400' };
                            const EventIcon = typeConfig.icon;

                            return (
                              <div key={index} className="flex items-start gap-3 p-2 hover:bg-white dark:hover:bg-slate-900 rounded-lg transition-colors">
                                <EventIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${typeConfig.color}`} />
                                <div className="flex-1 min-w-0">
                                  <Link href={`/workspace/${event.groupId}/${event.pageId}`} className="hover:underline">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{event.title}</p>
                                  </Link>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{event.description}</p>
                                </div>
                                <span className={`text-xs font-bold whitespace-nowrap ${diffDays <= 3 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                  {diffDays === 0 ? 'Hoje' : diffDays === 1 ? 'Amanhã' : `${diffDays}d`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Recentes Completados */}
                    {recentCompleted.length > 0 && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                        <h4 className="text-sm font-bold text-green-900 dark:text-green-300 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Recentemente Completados
                        </h4>
                        <div className="space-y-3">
                          {recentCompleted.map((event: any, index: number) => {
                            const eventDate = new Date(event.date);
                            const diffDays = Math.floor((now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
                            const timeAgo = diffDays === 0 ? 'Hoje' : diffDays === 1 ? '1d atrás' : `${diffDays}d atrás`;
                            const typeConfig = {
                              milestone: { icon: Target, color: 'text-blue-600 dark:text-blue-400' },
                              meeting: { icon: Users, color: 'text-purple-600 dark:text-purple-400' },
                              release: { icon: Zap, color: 'text-green-600 dark:text-green-400' },
                              event: { icon: Flame, color: 'text-orange-600 dark:text-orange-400' },
                            }[event.type] || { icon: CalendarIcon, color: 'text-gray-600 dark:text-gray-400' };
                            const EventIcon = typeConfig.icon;

                            return (
                              <div key={index} className="flex items-start gap-3 p-2 hover:bg-white dark:hover:bg-slate-900 rounded-lg transition-colors">
                                <EventIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${typeConfig.color}`} />
                                <div className="flex-1 min-w-0">
                                  <Link href={`/workspace/${event.groupId}/${event.pageId}`} className="hover:underline">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{event.title}</p>
                                  </Link>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{event.description}</p>
                                </div>
                                <span className="text-xs font-bold text-green-600 dark:text-green-400 whitespace-nowrap">{timeAgo}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <Link href={timelineLink}>
                    <button className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-900 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-800">
                      Ver Timeline
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              );
            })()}

            {/* Cards 12-13: Sprint (2x1) + Table (1x1) - Layout Condicional */}
            {(() => {
              // Buscar páginas de sprint e table
              const sprintPages = workspace.groups.flatMap(g =>
                g.pages.filter(p => p.template === 'sprint').map(page => ({
                  ...page,
                  groupId: g.id,
                  groupName: g.name
                }))
              );

              const tablePages = workspace.groups.flatMap(g =>
                g.pages.filter(p => p.template === 'table').map(page => ({
                  ...page,
                  groupId: g.id,
                  groupName: g.name
                }))
              );

              // Se não tiver nem sprint nem table, não renderiza nada
              if (sprintPages.length === 0 && tablePages.length === 0) return null;

              // Determinar layout
              const hasSprint = sprintPages.length > 0;
              const hasTable = tablePages.length > 0;

              return (
                <div className={`col-span-full ${hasSprint && hasTable ? 'grid grid-cols-1 md:grid-cols-3 gap-6' : ''}`}>
                  {/* Card 12: Sprint - 2x1 */}
                  {hasSprint && (() => {

              // Agregar todas as tasks
              const allTasks = sprintPages.flatMap(p =>
                (p.data?.tasks || []).map((task: any) => ({
                  ...task,
                  pageId: p.id,
                  pageName: p.name,
                  groupId: p.groupId
                }))
              );

              const totalTasks = allTasks.length;
              const backlogTasks = allTasks.filter((t: any) => t.status === 'backlog').length;
              const inProgressTasks = allTasks.filter((t: any) => t.status === 'in-progress').length;
              const doneTasks = allTasks.filter((t: any) => t.status === 'done').length;

              // Story points
              const totalStoryPoints = allTasks.reduce((sum: number, t: any) => sum + (t.storyPoints || 0), 0);
              const completedStoryPoints = allTasks
                .filter((t: any) => t.status === 'done')
                .reduce((sum: number, t: any) => sum + (t.storyPoints || 0), 0);
              const inProgressStoryPoints = allTasks
                .filter((t: any) => t.status === 'in-progress')
                .reduce((sum: number, t: any) => sum + (t.storyPoints || 0), 0);

              // Taxa de conclusão
              const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

              // Tasks urgentes
              const urgentTasks = allTasks.filter((t: any) =>
                (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'done'
              );

              const firstSprintPage = sprintPages[0];
              const sprintLink = `/workspace/${firstSprintPage.groupId}/${firstSprintPage.id}`;

              // Se não tiver nenhuma task
              if (totalTasks === 0) {
                return (
                  <div className={`bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm ${hasTable ? 'md:col-span-2' : 'col-span-full'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-gray-900 dark:text-white" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sprint</h3>
                      </div>
                      <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{sprintPages.length}p</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-12">
                      <Zap className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Nenhuma task no sprint</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Comece planejando seu sprint</p>
                      <Link href={sprintLink}>
                        <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Adicionar Task
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              }

              return (
                <div className={`bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm ${hasTable ? 'md:col-span-2' : 'col-span-full'}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sprint</h3>
                    </div>
                    <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{sprintPages.length}p</span>
                  </div>

                  {/* Métricas principais */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold mb-1">Story Points</p>
                      <p className="text-3xl font-black text-yellow-700 dark:text-yellow-300">{completedStoryPoints}<span className="text-lg text-yellow-600/60 dark:text-yellow-400/60">/{totalStoryPoints}</span></p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800">
                      <p className="text-xs text-green-600 dark:text-green-400 font-semibold mb-1">Tasks Concluídas</p>
                      <p className="text-3xl font-black text-green-700 dark:text-green-300">{doneTasks}<span className="text-lg text-green-600/60 dark:text-green-400/60">/{totalTasks}</span></p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">Taxa de Conclusão</p>
                      <p className="text-3xl font-black text-blue-700 dark:text-blue-300">{completionRate}%</p>
                    </div>
                  </div>

                  {/* Progresso visual */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">Progresso do Sprint</h4>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{completedStoryPoints} / {totalStoryPoints} SP</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden flex mb-3">
                      {doneTasks > 0 && (
                        <div
                          className="bg-green-500 dark:bg-green-400 h-full"
                          style={{ width: `${(doneTasks / totalTasks) * 100}%` }}
                          title={`Concluídas: ${doneTasks}`}
                        />
                      )}
                      {inProgressTasks > 0 && (
                        <div
                          className="bg-yellow-500 dark:bg-yellow-400 h-full"
                          style={{ width: `${(inProgressTasks / totalTasks) * 100}%` }}
                          title={`Em Progresso: ${inProgressTasks}`}
                        />
                      )}
                      {backlogTasks > 0 && (
                        <div
                          className="bg-gray-400 dark:bg-gray-600 h-full"
                          style={{ width: `${(backlogTasks / totalTasks) * 100}%` }}
                          title={`Backlog: ${backlogTasks}`}
                        />
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                        <span className="text-gray-700 dark:text-gray-300">Concluídas</span>
                        <span className="font-bold text-green-700 dark:text-green-300">{doneTasks}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                        <span className="text-gray-700 dark:text-gray-300">Em Progresso</span>
                        <span className="font-bold text-yellow-700 dark:text-yellow-300">{inProgressTasks}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-900 rounded border border-gray-200 dark:border-slate-800">
                        <span className="text-gray-700 dark:text-gray-300">Backlog</span>
                        <span className="font-bold text-gray-700 dark:text-gray-300">{backlogTasks}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tasks urgentes */}
                  {urgentTasks.length > 0 && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 mb-4">
                      <h4 className="text-sm font-bold text-red-900 dark:text-red-300 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Alta Prioridade ({urgentTasks.length})
                      </h4>
                      <div className="space-y-2">
                        {urgentTasks.slice(0, 3).map((task: any, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-2 hover:bg-white dark:hover:bg-slate-900 rounded-lg transition-colors">
                            <Flame className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400" />
                            <div className="flex-1 min-w-0">
                              <Link href={`/workspace/${task.groupId}/${task.pageId}`} className="hover:underline">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{task.title}</p>
                              </Link>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded border ${
                                  task.status === 'backlog'
                                    ? 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-slate-700'
                                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700'
                                }`}>
                                  {task.status === 'backlog' ? 'Backlog' : 'Em Progresso'}
                                </span>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{task.storyPoints} SP</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Story points em progresso */}
                  {inProgressStoryPoints > 0 && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">Em Desenvolvimento</span>
                        </div>
                        <span className="text-lg font-black text-yellow-700 dark:text-yellow-300">{inProgressStoryPoints} SP</span>
                      </div>
                    </div>
                  )}

                  <Link href={sprintLink}>
                    <button className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-900 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-800">
                      Ver Sprint
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              );
            })()}

                  {/* Card 13: Table - 1x1 */}
                  {hasTable && (() => {
                    // Agregar todas as rows e columns
                    const allData = tablePages.map(p => ({
                      pageId: p.id,
                      pageName: p.name,
                      groupId: p.groupId,
                      rows: p.data?.rows || [],
                      columns: p.data?.columns || []
                    }));

                    const totalRows = allData.reduce((sum, d) => sum + d.rows.length, 0);
                    const totalColumns = allData.reduce((sum, d) => sum + d.columns.length, 0);
                    const avgColumns = allData.length > 0 ? Math.round(totalColumns / allData.length) : 0;

                    const firstTablePage = tablePages[0];
                    const tableLink = `/workspace/${firstTablePage.groupId}/${firstTablePage.id}`;

                    // Se não tiver nenhum dado
                    if (totalRows === 0) {
                      return (
                        <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Table className="w-5 h-5 text-gray-900 dark:text-white" />
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tabela</h3>
                            </div>
                            <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{tablePages.length}p</span>
                          </div>
                          <div className="flex flex-col items-center justify-center py-12">
                            <Table className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                            <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Nenhum dado na tabela</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Comece adicionando registros</p>
                            <Link href={tableLink}>
                              <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Adicionar Registro
                              </button>
                            </Link>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <Table className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tabela</h3>
                          </div>
                          <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{tablePages.length}p</span>
                        </div>

                        {/* Total de registros */}
                        <div className="mb-6 p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-xl border border-cyan-200 dark:border-cyan-800">
                          <p className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold mb-1">Total de Registros</p>
                          <p className="text-4xl font-black text-cyan-700 dark:text-cyan-300">{totalRows}</p>
                        </div>

                        {/* Métricas */}
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2">
                              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">Tabelas</span>
                            </div>
                            <span className="text-xl font-black text-blue-700 dark:text-blue-300">{tablePages.length}</span>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-2">
                              <ListTodo className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">Colunas (média)</span>
                            </div>
                            <span className="text-xl font-black text-purple-700 dark:text-purple-300">{avgColumns}</span>
                          </div>
                        </div>

                        {/* Tabelas individuais */}
                        {allData.length > 1 && (
                          <div className="mb-6">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Distribuição</h4>
                            <div className="space-y-2">
                              {allData.slice(0, 3).map((table, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-900 rounded-lg">
                                  <Link href={`/workspace/${table.groupId}/${table.pageId}`} className="hover:underline flex-1">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{table.pageName}</span>
                                  </Link>
                                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400 ml-2">{table.rows.length} linhas</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <Link href={tableLink}>
                          <button className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-900 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-800">
                            Ver Tabela
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </Link>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}

            {/* Cards 14-23: Outros templates */}
            {['study', 'workout', 'nutrition', 'mindmap', 'flowchart', 'focus', 'business-budget', 'budget', 'blank'].map(templateName => {
              const pages = workspace.groups.flatMap(g => g.pages.filter(p => p.template === templateName));
              if (pages.length === 0) return null;

              const config = getTemplateConfig(templateName);
              const Icon = config.icon;

              return (
                <div key={templateName} className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-gray-900 dark:text-white" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{config.label}</h3>
                    </div>
                    <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{pages.length}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total de Páginas</span>
                      <span className="text-2xl font-black text-gray-900 dark:text-white">{pages.length}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {pages.slice(0, 3).map(p => p.name).join(', ')}
                    </div>
                  </div>
                </div>
              );
            })}

          </div>
        </div>

      </div>
    </div>
  );
}
