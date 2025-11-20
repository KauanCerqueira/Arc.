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
  ChevronLeft,
  ChevronRight as ChevronRightIcon
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
      totalItems = 0;
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
    urgentItems,
    progressPercentage,
    lastUpdated: new Date(page.updatedAt),
  };
};

export default function WorkspaceDashboard() {
  const { workspace, isLoading, initializeWorkspace } = useWorkspaceStore();
  const [timeOfDay, setTimeOfDay] = useState("");
  const [activeCardView, setActiveCardView] = useState(0);

  useEffect(() => {
    if (!workspace && !isLoading) {
      initializeWorkspace();
    }
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay("Bom dia");
    else if (hour < 18) setTimeOfDay("Boa tarde");
    else setTimeOfDay("Boa noite");
  }, [workspace, isLoading, initializeWorkspace]);

  const stats = useMemo(() => {
    if (!workspace) return null;

    const allPages = workspace.groups.flatMap(g => g.pages);
    const allPagesStats = allPages.map(p => aggregatePageStats(p));

    const totalPages = allPages.length;
    const totalTasks = allPagesStats.reduce((sum, p) => sum + p.totalItems, 0);
    const totalCompleted = allPagesStats.reduce((sum, p) => sum + p.completedItems, 0);
    const totalPending = allPagesStats.reduce((sum, p) => sum + p.pendingItems, 0);
    const totalUrgent = allPagesStats.reduce((sum, p) => sum + p.urgentItems, 0);
    const overallProgress = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;

    // Upcoming Events
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingEvents = workspace.groups.flatMap(group =>
      group.pages
        .filter(p => p.template === 'calendar')
        .flatMap(p => {
          const events = p.data?.events || [];
          return events.map((e: any) => ({ ...e, pageId: p.id, pageName: p.name, groupName: group.name }));
        })
    ).filter((e: any) => {
      const d = new Date(e.date);
      d.setHours(0, 0, 0, 0);
      return d >= today;
    }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);

    // Template distribution
    const templateDistribution = allPages.reduce((acc: any, page) => {
      const template = page.template || 'blank';
      const config = getTemplateConfig(template);
      const existing = acc.find((item: any) => item.name === config.label);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: config.label, value: 1, color: config.color });
      }
      return acc;
    }, []);

    // Weekly activity (mock - pode ser substituído por dados reais)
    const weeklyActivity = [
      { day: 'Seg', tasks: 12, completed: 8 },
      { day: 'Ter', tasks: 15, completed: 10 },
      { day: 'Qua', tasks: 10, completed: 7 },
      { day: 'Qui', tasks: 18, completed: 14 },
      { day: 'Sex', tasks: 14, completed: 12 },
      { day: 'Sáb', tasks: 8, completed: 6 },
      { day: 'Dom', tasks: 5, completed: 4 },
    ];

    // Pages needing attention
    const needsAttention = allPagesStats
      .filter(p => p.urgentItems > 0 || (p.pendingItems > 0 && p.progressPercentage < 50))
      .sort((a, b) => b.urgentItems - a.urgentItems)
      .slice(0, 5);

    // Recent pages
    const recentPages = allPagesStats
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
      .slice(0, 6);

    // Daily progress (últimos 7 dias)
    const dailyProgress = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        progress: Math.min(Math.max(overallProgress + (Math.random() * 20 - 10), 0), 100)
      };
    });

    return {
      totalPages,
      totalTasks,
      totalCompleted,
      totalPending,
      totalUrgent,
      overallProgress,
      upcomingEvents,
      templateDistribution,
      weeklyActivity,
      needsAttention,
      recentPages,
      dailyProgress,
      allPagesStats
    };
  }, [workspace]);

  const cardViews = useMemo(() => {
    if (!stats) return [];

    const weeklyTotals = stats.weeklyActivity.reduce(
      (acc, day) => {
        acc.tasks += day.tasks;
        acc.completed += day.completed;
        return acc;
      },
      { tasks: 0, completed: 0 }
    );
    const weeklyCompletion =
      weeklyTotals.tasks > 0 ? (weeklyTotals.completed / weeklyTotals.tasks) * 100 : 0;

    const pendingRate =
      stats.totalTasks > 0 ? (stats.totalPending / stats.totalTasks) * 100 : 0;

    const nextEvent = stats.upcomingEvents[0];
    const topAttention = stats.needsAttention[0];

    return [
      {
        key: 'today',
        title: 'Hoje',
        subtitle: 'Seu progresso diário',
        render: () => (
          <>
            <div className="flex flex-col items-center mb-4">
              <div className="relative w-28 h-28 mb-3">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="7"
                    fill="none"
                    className="text-gray-200 dark:text-slate-700"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="7"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - stats.overallProgress / 100)}`}
                    className="text-gray-900 dark:text-white transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    {Math.round(stats.overallProgress)}%
                  </span>
                </div>
              </div>

              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {stats.totalCompleted}/{stats.totalTasks} tarefas
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stats.upcomingEvents.length} eventos próximos
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-3 py-2 px-3 bg-gray-100 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <span className="text-lg">🔥</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">5 dias de sequência</span>
            </div>

            {nextEvent ? (
              <div className="mb-3 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarIcon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Próximo
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {nextEvent.title || nextEvent.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(nextEvent.date).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ) : (
              <div className="mb-3 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">✨ Sem eventos</p>
              </div>
            )}
          </>
        ),
      },
      {
        key: 'week',
        title: 'Semana',
        subtitle: 'Criados vs concluídos',
        render: () => (
          <>
            <div className="flex flex-col items-center mb-4">
              <div className="relative w-28 h-28 mb-3">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="7"
                    fill="none"
                    className="text-gray-200 dark:text-slate-700"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="7"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - weeklyCompletion / 100)}`}
                    className="text-emerald-500 dark:text-emerald-400 transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    {Math.round(weeklyCompletion)}%
                  </span>
                </div>
              </div>

              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {weeklyTotals.completed}/{weeklyTotals.tasks} concluídas
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  média {Math.round(weeklyTotals.tasks / 7 || 0)} tarefas/dia
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-3 py-2 px-3 bg-gray-100 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <TrendingUp className="w-4 h-4 text-gray-900 dark:text-white" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">ritmo semanal</span>
            </div>

            {topAttention ? (
              <div className="mb-3 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Precisa de atenção
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{topAttention.pageName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {topAttention.urgentItems > 0
                    ? `${topAttention.urgentItems} urgentes`
                    : `${topAttention.pendingItems} pendentes`}
                </p>
              </div>
            ) : (
              <div className="mb-3 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">✨ Tudo em dia</p>
              </div>
            )}
          </>
        ),
      },
      {
        key: 'alertas',
        title: 'Alertas',
        subtitle: 'Pendências e urgentes',
        render: () => (
          <>
            <div className="flex flex-col items-center mb-4">
              <div className="relative w-28 h-28 mb-3">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="7"
                    fill="none"
                    className="text-gray-200 dark:text-slate-700"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="7"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - pendingRate / 100)}`}
                    className="text-amber-500 dark:text-amber-400 transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    {Math.round(pendingRate)}%
                  </span>
                </div>
              </div>

              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {stats.totalPending} pendentes
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stats.totalUrgent} críticos/urgentes
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-3 py-2 px-3 bg-gray-100 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <Flame className="w-4 h-4 text-gray-900 dark:text-white" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">priorize primeiro</span>
            </div>

            {topAttention ? (
              <div className="mb-3 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Foco agora
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{topAttention.pageName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {topAttention.urgentItems > 0
                    ? `${topAttention.urgentItems} urgentes`
                    : `${topAttention.pendingItems} pendentes`}
                </p>
              </div>
            ) : (
              <div className="mb-3 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">✨ Nenhum alerta</p>
              </div>
            )}
          </>
        ),
      },
    ];
  }, [stats]);

  const totalCardViews = cardViews.length;
  useEffect(() => {
    if (activeCardView >= totalCardViews) {
      setActiveCardView(0);
    }
  }, [activeCardView, totalCardViews]);

  if (isLoading || !workspace || !stats) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-slate-700 opacity-20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-gray-900 dark:border-white border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">carregando workspace</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8 lg:py-12">

        {/* HERO - Estilo Landing Page */}
        <div className="mb-12 lg:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Left: Hero Text */}
            <div className="lg:col-span-3 flex flex-col">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-3">
                {timeOfDay} — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.9] text-gray-900 dark:text-white mb-10">
                organize.
                <br />
                foque.
                <br />
                <span className="text-gray-500 dark:text-gray-400">entregue.</span>
              </h1>

              {/* Quick Stats Pills */}
              <div className="flex flex-wrap gap-3 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold">{stats.totalPages} páginas ativas</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 dark:border-slate-800 rounded-full">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{stats.totalPending} pendentes</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 dark:border-slate-800 rounded-full">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{Math.round(stats.overallProgress)}% completo</span>
                </div>
              </div>

              {/* Mini Activity Feed */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Atividade Recente</h3>
                <div className="space-y-2">
                  {stats.recentPages.slice(0, 3).map((page, idx) => {
                    const config = getTemplateConfig(page.template);
                    const Icon = config.icon;
                    return (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-slate-700"></div>
                        <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                        <span className="text-gray-900 dark:text-white font-medium truncate">{page.pageName}</span>
                        <span className="text-gray-400 dark:text-gray-500 text-xs shrink-0">
                          {page.lastUpdated.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Stats + Quick Actions Card */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 h-fit">

              {/* Header */}
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() =>
                    setActiveCardView(prev => (prev - 1 + totalCardViews) % totalCardViews)
                  }
                  className="p-2 rounded-full border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors justify-self-start"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1">
                    {cardViews[activeCardView]?.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {cardViews[activeCardView]?.subtitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveCardView(prev => (prev + 1) % totalCardViews)}
                  className="p-2 rounded-full border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors justify-self-end"
                  aria-label="Próximo"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>

              {cardViews[activeCardView]?.render()}

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-slate-800 my-3"></div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <Link
                  href="/workspace"
                  className="flex items-center gap-2.5 p-2.5 border border-gray-200 dark:border-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group w-full"
                >
                  <Plus className="w-4 h-4 text-gray-900 dark:text-white shrink-0" />
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">Nova Página</span>
                </Link>
                <Link
                  href="/workspace"
                  className="flex items-center gap-2.5 p-2.5 border border-gray-200 dark:border-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group w-full"
                >
                  <ListTodo className="w-4 h-4 text-gray-900 dark:text-white shrink-0" />
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">Nova Tarefa</span>
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* METRICS INLINE */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 dark:bg-slate-800 mb-12 lg:mb-16 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800">
          <div className="bg-white dark:bg-slate-950 p-6 lg:p-8">
            <div className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">{stats.totalPages}</div>
            <div className="text-xs lg:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">páginas ativas</div>
          </div>
          <div className="bg-white dark:bg-slate-950 p-6 lg:p-8">
            <div className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">{stats.totalPending}</div>
            <div className="text-xs lg:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">pendentes</div>
          </div>
          <div className="bg-white dark:bg-slate-950 p-6 lg:p-8">
            <div className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">{stats.totalCompleted}</div>
            <div className="text-xs lg:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">concluídos</div>
          </div>
          <div className="bg-white dark:bg-slate-950 p-6 lg:p-8">
            <div className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">{Math.round(stats.overallProgress)}%</div>
            <div className="text-xs lg:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">progresso</div>
          </div>
        </div>

        {/* COMPLEX CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16">

          {/* Weekly Activity Chart - 2/3 width */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
            <div className="mb-6">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1">atividade semanal.</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">tarefas criadas vs concluídas</p>
            </div>
            <div className="h-[280px] lg:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.weeklyActivity}>
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6b7280" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-slate-700" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                    className="text-gray-500 dark:text-gray-400"
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                    className="text-gray-500 dark:text-gray-400"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#111827'
                    }}
                    cursor={{ stroke: '#6b7280', strokeWidth: 2, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="tasks" stroke="#6b7280" strokeWidth={2} fillOpacity={1} fill="url(#colorTasks)" />
                  <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Template Distribution - 1/3 width */}
          <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
            <div className="mb-6">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1">distribuição.</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">páginas por tipo</p>
            </div>
            <div className="h-[280px] lg:h-[320px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={stats.templateDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stats.templateDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      color: '#111827'
                    }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Progress Trend - Full width */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
            <div className="mb-6">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1">progresso dos últimos 7 dias.</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">evolução do completion rate</p>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.dailyProgress}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-slate-700" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                    className="text-gray-500 dark:text-gray-400"
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                    className="text-gray-500 dark:text-gray-400"
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      color: '#111827'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="progress"
                    stroke="#6b7280"
                    strokeWidth={3}
                    dot={{ fill: '#6b7280', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* ASYMMETRIC GRID - Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16">

          {/* Main Column - 2/3 */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">

            {/* Needs Attention */}
            {stats.needsAttention.length > 0 && (
              <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1">requer atenção.</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stats.needsAttention.length} páginas precisam de ação</p>
                  </div>
                  <AlertCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="space-y-3">
                  {stats.needsAttention.map(page => {
                    const config = getTemplateConfig(page.template);
                    const Icon = config.icon;
                    return (
                      <Link
                        key={page.pageId}
                        href={`#`}
                        className="group flex items-center justify-between p-4 border-2 border-gray-200 dark:border-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shrink-0">
                            <Icon className="w-5 h-5 text-gray-900 dark:text-white" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-white truncate">{page.pageName}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {page.urgentItems > 0 ? `${page.urgentItems} urgentes` : `${page.pendingItems} pendentes`}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:text-white transition-colors shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
              <div className="mb-6">
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1">atividade recente.</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">páginas acessadas recentemente</p>
              </div>
              <div className="space-y-2">
                {stats.recentPages.map(page => {
                  const config = getTemplateConfig(page.template);
                  const Icon = config.icon;
                  return (
                    <Link
                      key={page.pageId}
                      href={`#`}
                      className="group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Icon className="w-5 h-5 text-gray-900 dark:text-white shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate text-sm">{page.pageName}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {config.label} • {page.lastUpdated.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Sidebar - 1/3 */}
          <div className="space-y-6 lg:space-y-8">

            {/* Upcoming Events */}
            <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">próximos eventos.</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stats.upcomingEvents.length} eventos</p>
              </div>
              {stats.upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {stats.upcomingEvents.map((event: any, i: number) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center justify-center w-12 h-12 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shrink-0">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">
                          {new Date(event.date).toLocaleString('pt-BR', { month: 'short' })}
                        </span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{event.title || event.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{event.pageName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-8 h-8 text-gray-500 dark:text-gray-400 mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">nenhum evento próximo</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">quick access.</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">ações rápidas</p>
              </div>
              <div className="space-y-2">
                <Link
                  href="/workspace"
                  className="flex items-center gap-3 p-3 border-2 border-gray-200 dark:border-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <Plus className="w-5 h-5 text-gray-900 dark:text-white" />
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">nova página</span>
                </Link>
                <Link
                  href="/workspace"
                  className="flex items-center gap-3 p-3 border-2 border-gray-200 dark:border-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <FolderOpen className="w-5 h-5 text-gray-900 dark:text-white" />
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">novo grupo</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 p-3 border-2 border-gray-200 dark:border-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <Users className="w-5 h-5 text-gray-900 dark:text-white" />
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">convidar equipe</span>
                </Link>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom CTA */}
        <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 border border-gray-900 dark:border-white rounded-2xl p-8 lg:p-12 text-center">
          <h3 className="text-2xl lg:text-3xl font-bold mb-3">
            tudo sob controle.
          </h3>
          <p className="opacity-80 mb-6 max-w-2xl mx-auto">
            Workspace organizado. {stats.totalCompleted} itens concluídos. Continue focado no que importa.
          </p>
          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-white dark:border-gray-900 rounded-lg font-bold hover:bg-transparent hover:text-white dark:hover:text-gray-900 hover:border-white dark:hover:border-gray-900 transition-colors"
          >
            explorar workspace
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
