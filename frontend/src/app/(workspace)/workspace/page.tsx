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
  Line,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { DashboardGrid } from '@/features/dashboard/components/DashboardGrid';
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

// Frases estáticas motivacionais
const STATIC_PHRASES = [
  'Planeje com clareza.',
  'Priorize o essencial.',
  'Avance com confiança.',
  'Entregue com foco.',
  'Organize sem fricção.',
  'Foco no que importa.'
];

export default function WorkspaceDashboard() {
  const { workspace, isLoading, initializeWorkspace, loadWorkspace } = useWorkspaceStore();
  const [timeOfDay, setTimeOfDay] = useState("");
  const [activeCardView, setActiveCardView] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isPhraseFading, setIsPhraseFading] = useState(false);
  const [searchParams] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  });

  useEffect(() => {
    const workspaceIdFromUrl = searchParams.get('id');

    if (!workspace && !isLoading) {
      if (workspaceIdFromUrl) {
        // Se tem ID na URL, carregar esse workspace específico
        console.log('📍 Loading workspace from URL:', workspaceIdFromUrl);
        loadWorkspace(workspaceIdFromUrl);
        // Salvar no localStorage para próximas vezes
        localStorage.setItem('lastWorkspaceId', workspaceIdFromUrl);
      } else {
        // Senão, inicializar normalmente
        initializeWorkspace();
      }
    }

    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay("Bom dia");
    else if (hour < 18) setTimeOfDay("Boa tarde");
    else setTimeOfDay("Boa noite");
  }, [workspace, isLoading, initializeWorkspace, loadWorkspace, searchParams]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPhraseFading(true);
      setTimeout(() => {
        setPhraseIndex((prev) => prev + 1);
        setIsPhraseFading(false);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  // Gera frases dinâmicas baseadas nas estatísticas
  const heroPhrases = useMemo(() => {
    const phrases: string[] = [];

    if (stats) {
      // Frases baseadas em contexto
      if (stats.totalPending > 0) {
        phrases.push(`${stats.totalPending} tarefa${stats.totalPending > 1 ? 's' : ''} aguardando você.`);
      }
      if (stats.totalUrgent > 0) {
        phrases.push(`${stats.totalUrgent} item${stats.totalUrgent > 1 ? 's urgentes' : ' urgente'} hoje.`);
      }
      if (stats.totalCompleted > 0) {
        phrases.push(`${stats.totalCompleted} tarefa${stats.totalCompleted > 1 ? 's concluídas' : ' concluída'}!`);
      }
      if (stats.upcomingEvents.length > 0) {
        phrases.push(`${stats.upcomingEvents.length} evento${stats.upcomingEvents.length > 1 ? 's' : ''} próximo${stats.upcomingEvents.length > 1 ? 's' : ''}.`);
      }
      if (stats.overallProgress > 70) {
        phrases.push('Excelente progresso hoje!');
      }
      if (stats.totalPages > 0) {
        phrases.push(`${stats.totalPages} página${stats.totalPages > 1 ? 's' : ''} ativa${stats.totalPages > 1 ? 's' : ''}.`);
      }
    }

    // Adiciona frases estáticas no mix
    phrases.push(...STATIC_PHRASES);

    return phrases;
  }, [stats]);

  const dailySummary = useMemo(() => {
    if (!stats) {
      return { avg: 0, max: { value: 0, date: '' }, min: { value: 0, date: '' } };
    }
    const list = stats.dailyProgress;
    const avg = list.reduce((sum, item) => sum + item.progress, 0) / Math.max(list.length, 1);
    const max = list.reduce(
      (acc, item) => (item.progress > acc.value ? { value: item.progress, date: item.date } : acc),
      { value: -Infinity, date: '' }
    );
    const min = list.reduce(
      (acc, item) => (item.progress < acc.value ? { value: item.progress, date: item.date } : acc),
      { value: Infinity, date: '' }
    );
    return { avg, max, min };
  }, [stats]);

  const enhancedDaily = useMemo(() => {
    if (!stats) return [];
    return stats.dailyProgress.map((day, idx) => {
      const prev = idx > 0 ? stats.dailyProgress[idx - 1].progress : day.progress;
      const change = day.progress - prev;
      return {
        ...day,
        change,
      };
    });
  }, [stats]);

  const advancedInsights = useMemo(() => {
    if (!stats) {
      return {
        backlogDays: 0,
        backlogSignal: 'neutral',
        oldestPages: [],
        criticalEvents: [],
        riskWithoutAssignee: 0,
        riskGroups: [],
        reopenRate: null,
        topAssignees: [],
        urgentMttr: null,
        engagementPages: [],
        urgentVelocity: null,
        riskByTemplate: [],
      };
    }

    const avgCompletedPerDay =
      stats.weeklyActivity.reduce((sum, d) => sum + d.completed, 0) /
      Math.max(stats.weeklyActivity.length, 1);
    const backlogDays = stats.totalPending / Math.max(avgCompletedPerDay, 1);
    const backlogSignal = backlogDays > 7 ? 'red' : backlogDays > 3 ? 'amber' : 'green';

    const oldestPages = stats.allPagesStats
      .slice()
      .sort((a, b) => a.lastUpdated.getTime() - b.lastUpdated.getTime())
      .slice(0, 5)
      .map(p => ({
        id: p.pageId,
        name: p.pageName,
        age: Math.max(
          0,
          Math.floor((Date.now() - p.lastUpdated.getTime()) / (1000 * 60 * 60 * 24))
        ),
        template: p.template,
      }));

    const criticalEvents = stats.upcomingEvents.filter((e: any) => {
      const diff = new Date(e.date).getTime() - Date.now();
      return diff <= 1000 * 60 * 60 * 48 && diff >= 0;
    });

    // Risco: usamos needsAttention como proxy “sem próximo passo”
    const riskWithoutAssignee = stats.needsAttention.length;
    const riskByTemplate = stats.needsAttention.reduce((acc: any[], item: any) => {
      const tpl = getTemplateConfig(item.template);
      const found = acc.find((r: any) => r.template === tpl.label);
      if (found) found.count += 1;
      else acc.push({ template: tpl.label, color: tpl.color, count: 1 });
      return acc;
    }, []);
    const riskGroups = riskByTemplate;

    // Fiabilidade: proxy de reabertura = pendentes atuais ÷ concluídos na semana
    const weeklyCompleted = stats.weeklyActivity.reduce((sum, d) => sum + d.completed, 0);
    const reopenRate = weeklyCompleted > 0 ? stats.totalPending / weeklyCompleted : null;
    const topAssignees: any[] = [];

    // Velocidade urgentes: usamos páginas com urgentes como proxy
    const urgentPages = stats.allPagesStats.filter(p => p.urgentItems > 0);
    const todayMs = Date.now();
    const urgentDurations = urgentPages.map(p =>
      Math.max(0, (todayMs - p.lastUpdated.getTime()) / (1000 * 60 * 60 * 24))
    );
    const urgentAvg =
      urgentDurations.length > 0
        ? urgentDurations.reduce((a, b) => a + b, 0) / urgentDurations.length
        : null;
    const urgentMttr = urgentAvg;
    const urgentMin = urgentDurations.length > 0 ? Math.min(...urgentDurations) : null;
    const urgentMax = urgentDurations.length > 0 ? Math.max(...urgentDurations) : null;
    const bestDay = stats.weeklyActivity.reduce(
      (acc, d) => (d.completed > acc.completed ? d : acc),
      stats.weeklyActivity[0] || { day: '', completed: 0 }
    );
    const urgentVelocity = {
      avg: urgentAvg,
      min: urgentMin,
      max: urgentMax,
      bestDay: bestDay?.day || '',
    };

    // Envolvimento: usamos páginas recentes como proxy (já ordenadas por lastUpdated)
    const engagementPages = stats.recentPages.slice(0, 5).map(p => ({
      id: p.pageId,
      name: p.pageName,
      template: p.template,
      lastUpdated: p.lastUpdated,
    }));

    return {
      backlogDays,
      backlogSignal,
      oldestPages,
      criticalEvents,
      riskWithoutAssignee,
      riskGroups,
      reopenRate,
      topAssignees,
      urgentMttr,
      engagementPages,
      urgentVelocity,
      riskByTemplate,
    };
  }, [stats]);

  const riskChartData = useMemo(() => {
    if (!advancedInsights) return [];
    return advancedInsights.riskByTemplate.length > 0
      ? advancedInsights.riskByTemplate
      : [{ template: 'Sem risco', color: '#e5e7eb', count: 1 }];
  }, [advancedInsights]);

  const velocitySeries = useMemo(() => {
    if (!stats) return [];
    return stats.weeklyActivity.map(day => ({
      day: day.day,
      created: day.tasks,
      done: day.completed,
    }));
  }, [stats]);

  const reliabilitySeries = useMemo(() => {
    if (!stats) return [];
    return stats.weeklyActivity.map(day => ({
      day: day.day,
      completionRate: Math.round((day.completed / Math.max(day.tasks, 1)) * 100),
    }));
  }, [stats]);

  const extendedInsights = useMemo(() => {
    if (!stats) {
      return {
        pipeline: { created: 0, inProgress: 0, done: 0 },
        comparison: { progress: 0, change: 0, pending: 0, pendingChange: 0 },
        heatmap: [],
        quickActions: [],
        timeline: [],
      };
    }

    const created = stats.totalTasks;
    const done = stats.totalCompleted;
    const inProgress = Math.max(stats.totalPending, 0);

    const last = stats.dailyProgress[stats.dailyProgress.length - 1]?.progress ?? 0;
    const prev = stats.dailyProgress[stats.dailyProgress.length - 2]?.progress ?? last;
    const progressChange = last - prev;

    const pendingChange =
      stats.dailyProgress.length > 1
        ? (stats.dailyProgress[stats.dailyProgress.length - 2].progress || 0) - last
        : 0;

    const heatmap = Array.from({ length: 7 }, (_, d) => {
      const day = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][d];
      return Array.from({ length: 4 }, (_, t) => {
        const slot = ['Manhã', 'Tarde', 'Noite', 'Extra'][t];
        const val = Math.floor(Math.random() * 8);
        return { day, slot, value: val };
      });
    });

    const timeline = stats.upcomingEvents.slice(0, 6);

    const quickActions = [
      { label: 'Criar Sprint', href: '/workspace', icon: '⚡' },
      { label: 'Nova Tabela', href: '/workspace', icon: '📊' },
      { label: 'Board de Riscos', href: '/workspace', icon: '🚨' },
      { label: 'Checklist rápido', href: '/workspace', icon: '✅' },
    ];

    return {
      pipeline: { created, inProgress, done },
      comparison: {
        progress: last,
        change: progressChange,
        pending: stats.totalPending,
        pendingChange,
      },
      heatmap,
      timeline,
      quickActions,
    };
  }, [stats]);

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
                {timeOfDay} - {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-full">
                    painel diário
                  </span>
                </div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-gray-900 dark:text-white h-[200px] sm:h-[240px] lg:h-[280px] flex items-center">
                  <span
                    className={`inline-block transition-opacity duration-300 ${
                      isPhraseFading ? 'opacity-0' : 'opacity-100'
                    }`}
                  >
                    {heroPhrases[phraseIndex % heroPhrases.length]}
                  </span>
                </h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                  Organize seu dia sem fricção: visão, ritmo e entrega em um só lugar.
                </p>
              </div>

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

        {/* MODULAR DASHBOARD */}
        <div className="mb-12 lg:mb-16">
          <DashboardGrid />
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8 lg:mb-12">

          {/* Weekly Activity Chart - 2/3 width */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
            <div className="mb-6">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1">atividade semanal.</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">tarefas criadas vs concluídas</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div className="flex items-center justify-between px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-lg bg-gray-50 dark:bg-slate-900">
                <span className="text-xs text-gray-500 dark:text-gray-400">criados</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {stats.weeklyActivity.reduce((acc, d) => acc + d.tasks, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-lg bg-gray-50 dark:bg-slate-900">
                <span className="text-xs text-gray-500 dark:text-gray-400">concluídos</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {stats.weeklyActivity.reduce((acc, d) => acc + d.completed, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-lg bg-gray-50 dark:bg-slate-900">
                <span className="text-xs text-gray-500 dark:text-gray-400">taxa</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {Math.round(
                    (stats.weeklyActivity.reduce((acc, d) => acc + d.completed, 0) /
                      Math.max(stats.weeklyActivity.reduce((acc, d) => acc + d.tasks, 0), 1)) *
                      100
                  )}
                  %
                </span>
              </div>
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
                  <ReferenceLine
                    y={
                      stats.weeklyActivity.reduce((acc, d) => acc + d.tasks, 0) /
                      Math.max(stats.weeklyActivity.length, 1)
                    }
                    stroke="#e5e7eb"
                    className="dark:stroke-slate-700"
                    strokeDasharray="4 4"
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
            <div className="h-[280px] lg:h-[320px] flex flex-col gap-4 relative items-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={stats.templateDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    cornerRadius={6}
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
                      color: '#111827',
                    }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] uppercase font-semibold text-gray-500 dark:text-gray-400">total</span>
                <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.totalPages}</span>
              </div>
              <div className="w-full space-y-2">
                {stats.templateDistribution
                  .slice()
                  .sort((a: any, b: any) => b.value - a.value)
                  .slice(0, 3)
                  .map((entry: any) => (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        ></span>
                        <span className="font-medium text-gray-900 dark:text-white">{entry.name}</span>
                      </div>
                      <span className="text-gray-500 dark:text-gray-400">{entry.value}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Daily Progress Trend - Full width */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
            <div className="mb-6">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1">progresso dos últimos 7 dias.</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">evolução do completion rate</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="flex items-center justify-between px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-lg bg-gray-50 dark:bg-slate-900">
                <span className="text-xs text-gray-500 dark:text-gray-400">média (7d)</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{Math.round(dailySummary.avg)}%</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-lg bg-gray-50 dark:bg-slate-900">
                <span className="text-xs text-gray-500 dark:text-gray-400">melhor</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {Math.round(dailySummary.max.value)}% • {dailySummary.max.date}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-lg bg-gray-50 dark:bg-slate-900">
                <span className="text-xs text-gray-500 dark:text-gray-400">pior</span>
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  {Math.round(dailySummary.min.value)}% • {dailySummary.min.date}
                </span>
              </div>
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enhancedDaily}>
                  <defs>
                    <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6b7280" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                    formatter={(value: any, _name: any, props: any) => {
                      const change = props?.payload?.change ?? 0;
                      const sign = change > 0 ? '+' : '';
                      return [`${Math.round(value)}% (${sign}${Math.round(change)}pp vs dia anterior)`, 'progress'];
                    }}
                  />
                  <ReferenceArea y1={50} y2={80} fill="#10b981" fillOpacity={0.06} />
                  <ReferenceLine y={dailySummary.avg} stroke="#e5e7eb" className="dark:stroke-slate-700" strokeDasharray="3 3" />
                  <ReferenceLine y={70} stroke="#10b981" strokeDasharray="4 4" />
                  <Area
                    type="monotone"
                    dataKey="progress"
                    stroke="none"
                    fill="url(#progressGradient)"
                    fillOpacity={1}
                  />
                  <Line
                    type="monotone"
                    dataKey="progress"
                    stroke="#6b7280"
                    strokeWidth={3}
                    dot={{ fill: '#6b7280', r: 4 }}
                    activeDot={{ r: 7, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* KPI ROW BELOW CHARTS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12 lg:mb-16">
          <div className="border border-gray-200 dark:border-slate-800 rounded-2xl px-4 py-3 lg:px-5 lg:py-4 bg-white dark:bg-slate-950">
            <p className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">pendentes</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.totalPending}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">itens</span>
            </div>
          </div>
          <div className="border border-gray-200 dark:border-slate-800 rounded-2xl px-4 py-3 lg:px-5 lg:py-4 bg-white dark:bg-slate-950">
            <p className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">urgentes/críticos</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{stats.totalUrgent}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">itens</span>
            </div>
          </div>
          <div className="border border-gray-200 dark:border-slate-800 rounded-2xl px-4 py-3 lg:px-5 lg:py-4 bg-white dark:bg-slate-950">
            <p className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">páginas ativas</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.totalPages}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{cardViews.length} visões</span>
            </div>
          </div>
          <div className="border border-gray-200 dark:border-slate-800 rounded-2xl px-4 py-3 lg:px-5 lg:py-4 bg-white dark:bg-slate-950">
            <p className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">eventos próximos</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.upcomingEvents.length}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">calendário</span>
            </div>
          </div>
        </div>

        {/* ADVANCED INSIGHTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16">
          <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Capacidade e backlog</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">dias de backlog estimado</p>
              </div>
              <span
                className={`w-3 h-3 rounded-full ${
                  advancedInsights.backlogSignal === 'green'
                    ? 'bg-emerald-500'
                    : advancedInsights.backlogSignal === 'amber'
                    ? 'bg-amber-400'
                    : 'bg-red-500'
                }`}
              ></span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                {advancedInsights.backlogDays.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">dias</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Baseado em pendentes ÷ média de conclusão diária da semana.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Freshness</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">páginas mais paradas</p>
              </div>
              <Flame className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="space-y-2">
              {advancedInsights.oldestPages.map(item => {
                const cfg = getTemplateConfig(item.template);
                const Icon = cfg.icon;
                return (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                      <span className="text-gray-900 dark:text-white truncate">{item.name}</span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 shrink-0">{item.age}d</span>
                  </div>
                );
              })}
              {advancedInsights.oldestPages.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Tudo atualizado recentemente.</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Eventos críticos</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">48h próximas</p>
              </div>
              <AlertCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="space-y-2">
              {advancedInsights.criticalEvents.map((event: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-gray-900 dark:text-white truncate">
                      {event.title || event.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{event.pageName}</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 shrink-0">
                    {new Date(event.date).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {advancedInsights.criticalEvents.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Sem conflitos/urgências nas próximas 48h.</p>
              )}
            </div>
          </div>
        </div>

        {/* INSIGHTS VISUAIS (2x2) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12 lg:mb-16">
          <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Risco</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">sem proximo passo/responsavel</p>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  advancedInsights.riskWithoutAssignee > 0
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-600/20 dark:text-amber-100'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-100'
                }`}
              >
                {advancedInsights.riskWithoutAssignee > 0 ? 'atencao' : 'ok'}
              </span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">itens em risco</p>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {advancedInsights.riskWithoutAssignee}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">top template</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {riskChartData[0]?.template || 'Sem riscos'}
                </p>
              </div>
            </div>
            <div className="h-40">
              {riskChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={riskChartData}
                      dataKey="count"
                      nameKey="template"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={4}
                    >
                      {riskChartData.map((entry: any, idx: number) => (
                        <Cell key={idx} fill={entry.color || '#94a3b8'} />
                      ))}
                    </Pie>
                  </RechartsPie>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Sem riscos mapeados.</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
              {riskChartData.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color || '#cbd5e1' }}></span>
                  <span className="flex-1 text-gray-900 dark:text-white truncate">{item.template}</span>
                  <span className="text-gray-500 dark:text-gray-400">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Velocidade</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">criadas vs concluidas</p>
              </div>
              <Zap className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="flex items-center gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">urgentes</p>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  {advancedInsights.urgentVelocity?.avg?.toFixed(1) ?? '--'}d
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">media desde ultima atualizacao</p>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>melhor dia: {advancedInsights.urgentVelocity?.bestDay || '--'}</p>
                <p>
                  min {advancedInsights.urgentVelocity?.min?.toFixed(1) ?? '-'}d | max {advancedInsights.urgentVelocity?.max?.toFixed(1) ?? '-'}d
                </p>
              </div>
            </div>
            <div className="h-40">
              {velocitySeries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={velocitySeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', color: '#e2e8f0', borderRadius: 12, border: 'none' }}
                      wrapperClassName="dark:text-white"
                    />
                    <Line type="monotone" dataKey="created" stroke="#94a3b8" strokeWidth={2} dot={false} name="Criadas" />
                    <Line type="monotone" dataKey="done" stroke="#22c55e" strokeWidth={3} dot={false} name="Concluidas" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Sem dados semanais.</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Envolvimento</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">tendencia de acesso</p>
              </div>
              <Activity className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="h-40">
              {stats.dailyProgress.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.dailyProgress}>
                    <defs>
                      <linearGradient id="engagement" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', color: '#e2e8f0', borderRadius: 12, border: 'none' }}
                      wrapperClassName="dark:text-white"
                    />
                    <Area
                      type="monotone"
                      dataKey="progress"
                      stroke="#6366f1"
                      fill="url(#engagement)"
                      strokeWidth={3}
                      name="Progresso"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Sem acessos recentes.</p>
              )}
            </div>
            <div className="mt-3 space-y-2 text-sm">
              {advancedInsights.engagementPages.slice(0, 3).map(item => {
                const cfg = getTemplateConfig(item.template);
                const Icon = cfg.icon;
                return (
                  <div key={item.id} className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                    <span className="text-gray-900 dark:text-white truncate">{item.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                      {item.lastUpdated.toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                );
              })}
              {advancedInsights.engagementPages.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Sem acessos recentes.</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Fiabilidade</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">taxa de conclusao na semana</p>
              </div>
              <TrendingUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="flex items-center gap-3 mb-3">
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {advancedInsights.reopenRate != null ? Math.round(advancedInsights.reopenRate * 100) : '--'}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">pendentes x concluidos</p>
            </div>
            <div className="h-40">
              {reliabilitySeries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reliabilitySeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <YAxis hide domain={[0, 100]} />
                    <ReferenceLine y={80} stroke="#10b981" strokeDasharray="6 6" />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', color: '#e2e8f0', borderRadius: 12, border: 'none' }}
                      wrapperClassName="dark:text-white"
                    />
                    <Line
                      type="monotone"
                      dataKey="completionRate"
                      stroke="#0ea5e9"
                      strokeWidth={3}
                      dot={{ r: 3 }}
                      name="Conclusao"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Sem base de confiabilidade.</p>
              )}
            </div>
          </div>
        </div>

        {/* CAMADA EXTRA: RESUMOS, COMPARATIVOS E CTAs (layout variado) */}
        <div className="space-y-8 lg:space-y-10 mb-12 lg:mb-16">
          {/* Visão Semanal - Consistent Design */}
          <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
            <div className="mb-6">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1">visão semanal.</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">resumo de desempenho e entregas</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Entregas</span>
                  <CheckCircle2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
                  {stats.totalCompleted}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  tarefas finalizadas
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progresso</span>
                  <TrendingUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
                  {Math.round(stats.overallProgress)}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  completion rate
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pendentes</span>
                  <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
                  {stats.totalPending}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  em andamento
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Velocidade</span>
                  <Zap className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
                  {Math.round(stats.weeklyActivity.reduce((acc, d) => acc + d.completed, 0) / 7)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  tarefas/dia
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Left: Progress Breakdown */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Distribuição de Trabalho</h4>

                <div className="space-y-4 mb-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Concluído</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{stats.totalCompleted}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (stats.totalCompleted / Math.max(stats.totalTasks, 1)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Em Progresso</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{stats.totalPending}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (stats.totalPending / Math.max(stats.totalTasks, 1)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Urgente</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{stats.totalUrgent}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (stats.totalUrgent / Math.max(stats.totalTasks, 1)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Overall Progress */}
                <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Progresso Geral</p>
                      <p className="text-4xl font-extrabold text-gray-900 dark:text-white">{Math.round(stats.overallProgress)}%</p>
                    </div>
                    <div className="relative w-24 h-24">
                      <svg className="transform -rotate-90 w-24 h-24">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-gray-200 dark:text-slate-700"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.overallProgress / 100)}`}
                          className="text-blue-500 transition-all duration-1000"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Recent Deliveries */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Páginas Mais Ativas</h4>

                <div className="space-y-3">
                  {stats.recentPages.slice(0, 5).map((page, idx) => {
                    const config = getTemplateConfig(page.template);
                    const Icon = config.icon;
                    return (
                      <div
                        key={idx}
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-gray-50 dark:bg-slate-900 p-3 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-slate-700 shrink-0">
                            <Icon className="w-4 h-4" style={{ color: config.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{page.pageName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                                  style={{ width: `${Math.round(page.progressPercentage)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-bold text-gray-900 dark:text-white shrink-0">
                                {Math.round(page.progressPercentage)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* NEW ENHANCED CARDS - 4 cards replacing the old 8 */}

          {/* Card 1: Produtividade & Velocidade - Full width */}
          <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
            <div className="mb-6">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1">produtividade & velocidade.</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">métricas de performance em tempo real</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">taxa de conclusão</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-3xl font-extrabold text-emerald-900 dark:text-emerald-100 mb-1">
                  {Math.round((stats.totalCompleted / Math.max(stats.totalTasks, 1)) * 100)}%
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400">
                  {stats.totalCompleted} de {stats.totalTasks} completos
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">velocidade</span>
                  <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-3xl font-extrabold text-blue-900 dark:text-blue-100 mb-1">
                  {Math.round(stats.weeklyActivity.reduce((acc, d) => acc + d.completed, 0) / 7)}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  tarefas/dia (média 7d)
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">backlog</span>
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-3xl font-extrabold text-amber-900 dark:text-amber-100 mb-1">
                  {advancedInsights.backlogDays.toFixed(1)}
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400">
                  dias até limpar
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">streak</span>
                  <Flame className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-3xl font-extrabold text-purple-900 dark:text-purple-100 mb-1">
                  7
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400">
                  dias produtivos
                </div>
              </div>
            </div>

            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={velocitySeries}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-slate-700" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                    className="text-gray-500 dark:text-gray-400"
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
                      borderRadius: '12px',
                      color: '#111827'
                    }}
                  />
                  <Line type="monotone" dataKey="created" stroke="#6b7280" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="done" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 2 & 3: Side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

            {/* Card 2: Análise de Prioridades */}
            <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">análise de prioridades.</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">distribuição e foco crítico</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Urgente</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{stats.totalUrgent}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (stats.totalUrgent / Math.max(stats.totalTasks, 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Pendente</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{stats.totalPending}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (stats.totalPending / Math.max(stats.totalTasks, 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Completo</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{stats.totalCompleted}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (stats.totalCompleted / Math.max(stats.totalTasks, 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border border-red-200 dark:border-red-900 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-red-900 dark:text-red-100 mb-1">Items críticos</h4>
                    {stats.needsAttention.length > 0 ? (
                      <div className="space-y-2">
                        {stats.needsAttention.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="text-xs text-red-700 dark:text-red-300">
                            • {item.pageName} ({item.urgentItems > 0 ? `${item.urgentItems} urgentes` : `${item.pendingItems} pendentes`})
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-red-700 dark:text-red-300">Nenhum item crítico no momento</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Insights de Tempo */}
            <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">insights de tempo.</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">padrões e próximos deadlines</p>
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Atividade por dia</h4>
                <div className="grid grid-cols-7 gap-2">
                  {stats.weeklyActivity.map((day, idx) => {
                    const completionRate = (day.completed / Math.max(day.tasks, 1)) * 100;
                    const isToday = idx === new Date().getDay() - 1;
                    return (
                      <div key={day.day} className="text-center">
                        <div
                          className={`h-16 rounded-lg border-2 ${isToday ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-200 dark:border-slate-800'} flex items-end justify-center pb-2 mb-1 overflow-hidden relative`}
                        >
                          <div
                            className={`absolute bottom-0 left-0 right-0 ${isToday ? 'bg-blue-400' : 'bg-gray-300 dark:bg-slate-700'} transition-all`}
                            style={{ height: `${completionRate}%` }}
                          ></div>
                          <span className="text-xs font-bold text-gray-900 dark:text-white relative z-10">{day.completed}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">{day.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Próximos deadlines</h4>
                {stats.upcomingEvents.slice(0, 4).length > 0 ? (
                  <div className="space-y-2">
                    {stats.upcomingEvents.slice(0, 4).map((event: any, idx: number) => {
                      const daysUntil = Math.ceil((new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      const isUrgent = daysUntil <= 2;
                      return (
                        <div key={idx} className={`flex items-center justify-between p-2 rounded-lg border ${isUrgent ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30' : 'border-gray-200 dark:border-slate-800'}`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <CalendarIcon className={`w-3.5 h-3.5 shrink-0 ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`} />
                            <span className={`text-xs truncate ${isUrgent ? 'text-red-900 dark:text-red-100 font-semibold' : 'text-gray-900 dark:text-white'}`}>
                              {event.title || event.name}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold shrink-0 ml-2 ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {daysUntil}d
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800">
                    <CalendarIcon className="w-6 h-6 text-gray-400 dark:text-gray-500 mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sem deadlines próximos</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 4: Performance Overview - Full width */}
          <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
            <div className="mb-6">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1">performance overview.</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">top performers e recomendações inteligentes</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Top Performers */}
              <div className="lg:col-span-2">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Top Páginas por Progresso</h4>
                <div className="space-y-3">
                  {stats.allPagesStats
                    .slice()
                    .sort((a, b) => b.progressPercentage - a.progressPercentage)
                    .slice(0, 5)
                    .map((page, idx) => {
                      const config = getTemplateConfig(page.template);
                      const Icon = config.icon;
                      const medals = ['🥇', '🥈', '🥉'];
                      return (
                        <div key={page.pageId} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group">
                          <div className="text-xl shrink-0">
                            {idx < 3 ? medals[idx] : `#${idx + 1}`}
                          </div>
                          <div className="p-2 bg-white dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-slate-700 shrink-0">
                            <Icon className="w-4 h-4" style={{ color: config.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-sm text-gray-900 dark:text-white truncate">{page.pageName}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all"
                                  style={{ width: `${Math.round(page.progressPercentage)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-bold text-gray-900 dark:text-white shrink-0 w-10 text-right">
                                {Math.round(page.progressPercentage)}%
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              {page.completedItems}/{page.totalItems}
                            </div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">
                              completos
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Smart Recommendations */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Recomendações</h4>
                <div className="space-y-3">

                  {stats.needsAttention.length > 0 && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                      <div className="flex items-start gap-2 mb-2">
                        <Target className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-xs font-bold text-amber-900 dark:text-amber-100 mb-1">Foque aqui</h5>
                          <p className="text-[11px] text-amber-700 dark:text-amber-300">
                            {stats.needsAttention.length} páginas precisam de atenção
                          </p>
                        </div>
                      </div>
                      <Link href="#" className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors">
                        Ver todas <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-blue-900 dark:text-blue-100 mb-1">Continue assim</h5>
                        <p className="text-[11px] text-blue-700 dark:text-blue-300">
                          Você está {Math.round((stats.totalCompleted / Math.max(stats.totalTasks, 1)) * 100)}% acima da meta
                        </p>
                      </div>
                    </div>
                  </div>

                  {advancedInsights.oldestPages.length > 0 && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                      <div className="flex items-start gap-2 mb-2">
                        <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-xs font-bold text-purple-900 dark:text-purple-100 mb-1">Páginas paradas</h5>
                          <p className="text-[11px] text-purple-700 dark:text-purple-300">
                            {advancedInsights.oldestPages.length} páginas sem atualização há {advancedInsights.oldestPages[0]?.age || 0}+ dias
                          </p>
                        </div>
                      </div>
                      <Link href="#" className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 transition-colors">
                        Revisar <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ASYMMETRIC GRID - Main Content */}
        {/* ASYMMETRIC GRID - Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16">

          {/* Main Column - 2/3 */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">

            {/* Centro de Ação - Enhanced */}
            {stats.needsAttention.length > 0 && (
              <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
                {/* Header with Stats */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1">centro de ação.</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">itens que requerem sua atenção</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-red-100 dark:bg-red-950 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                    </div>
                  </div>

                  {/* Priority Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs font-bold text-red-700 dark:text-red-300 uppercase">Crítico</span>
                      </div>
                      <p className="text-2xl font-extrabold text-red-900 dark:text-red-100">
                        {stats.needsAttention.filter(p => p.urgentItems > 0).length}
                      </p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase">Importante</span>
                      </div>
                      <p className="text-2xl font-extrabold text-amber-900 dark:text-amber-100">
                        {stats.needsAttention.filter(p => p.urgentItems === 0 && p.pendingItems > 5).length}
                      </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase">Normal</span>
                      </div>
                      <p className="text-2xl font-extrabold text-blue-900 dark:text-blue-100">
                        {stats.needsAttention.filter(p => p.urgentItems === 0 && p.pendingItems <= 5).length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Items */}
                <div className="space-y-2">
                  {stats.needsAttention.slice(0, 5).map(page => {
                    const config = getTemplateConfig(page.template);
                    const Icon = config.icon;
                    const isCritical = page.urgentItems > 0;
                    const isImportant = page.urgentItems === 0 && page.pendingItems > 5;

                    const priorityColor = isCritical
                      ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20'
                      : isImportant
                        ? 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20'
                        : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950';

                    return (
                      <div
                        key={page.pageId}
                        className={`group relative overflow-hidden border-2 ${priorityColor} rounded-xl p-4 transition-all hover:shadow-md`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className={`p-2.5 rounded-lg border ${
                              isCritical
                                ? 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700'
                                : isImportant
                                  ? 'bg-amber-100 dark:bg-amber-900 border-amber-300 dark:border-amber-700'
                                  : 'bg-gray-100 dark:bg-slate-800 border-gray-300 dark:border-slate-700'
                            }`}>
                              <Icon className="w-5 h-5 text-gray-900 dark:text-white" />
                            </div>
                            {isCritical && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-gray-900 dark:text-white truncate">{page.pageName}</h4>
                              {isCritical && (
                                <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded uppercase">urgente</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-gray-500 dark:text-gray-400">{config.label}</span>
                              {page.urgentItems > 0 && (
                                <span className="text-red-600 dark:text-red-400 font-semibold">• {page.urgentItems} urgentes</span>
                              )}
                              <span className="text-gray-500 dark:text-gray-400">• {page.pendingItems} pendentes</span>
                              <span className="text-emerald-600 dark:text-emerald-400">• {page.completedItems} completos</span>
                            </div>

                            {/* Mini Progress Bar */}
                            <div className="mt-2 h-1 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isCritical
                                    ? 'bg-gradient-to-r from-red-500 to-orange-500'
                                    : 'bg-gradient-to-r from-blue-500 to-purple-500'
                                }`}
                                style={{ width: `${Math.round(page.progressPercentage)}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              href={`#`}
                              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                              title="Abrir página"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Actions Footer */}
                {stats.needsAttention.length > 5 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-800">
                    <Link
                      href="#"
                      className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      Ver todos ({stats.needsAttention.length} itens)
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Hub de Atividades - Enhanced */}
            <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
              <div className="mb-6">
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1">hub de atividades.</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">histórico completo de interações</p>
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-2 text-center">
                  <p className="text-lg font-extrabold text-gray-900 dark:text-white">{stats.recentPages.length}</p>
                  <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Total</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg p-2 text-center">
                  <p className="text-lg font-extrabold text-emerald-900 dark:text-emerald-100">
                    {stats.recentPages.filter(p => p.progressPercentage === 100).length}
                  </p>
                  <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Completos</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-2 text-center">
                  <p className="text-lg font-extrabold text-blue-900 dark:text-blue-100">
                    {stats.recentPages.filter(p => p.progressPercentage > 0 && p.progressPercentage < 100).length}
                  </p>
                  <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase">Em Andamento</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-2 text-center">
                  <p className="text-lg font-extrabold text-gray-900 dark:text-white">
                    {stats.recentPages.filter(p => p.progressPercentage === 0).length}
                  </p>
                  <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Iniciando</p>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="space-y-3">
                {stats.recentPages.map((page, idx) => {
                  const config = getTemplateConfig(page.template);
                  const Icon = config.icon;
                  const daysSinceUpdate = Math.floor((Date.now() - page.lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
                  const isRecent = daysSinceUpdate === 0;
                  const isActive = page.progressPercentage > 0 && page.progressPercentage < 100;

                  return (
                    <div key={page.pageId} className="relative">
                      {/* Timeline Line */}
                      {idx < stats.recentPages.length - 1 && (
                        <div className="absolute left-[18px] top-10 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-700"></div>
                      )}

                      <div className="group relative flex gap-4 p-3 rounded-xl border-2 border-gray-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-slate-900 transition-all">
                        {/* Timeline Dot */}
                        <div className="relative shrink-0">
                          <div className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center ${
                            isRecent
                              ? 'bg-blue-100 dark:bg-blue-900 border-blue-500'
                              : 'bg-gray-100 dark:bg-slate-800 border-gray-300 dark:border-slate-700'
                          }`}>
                            <Icon className="w-4 h-4 text-gray-900 dark:text-white" />
                          </div>
                          {isRecent && (
                            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{page.pageName}</h4>
                            {isRecent && (
                              <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded uppercase">novo</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mb-2 text-xs">
                            <span className="text-gray-500 dark:text-gray-400">{config.label}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {daysSinceUpdate === 0
                                ? 'hoje'
                                : daysSinceUpdate === 1
                                  ? 'ontem'
                                  : `há ${daysSinceUpdate} dias`}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className={`font-semibold ${
                              page.progressPercentage === 100
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : isActive
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {Math.round(page.progressPercentage)}%
                            </span>
                          </div>

                          {/* Progress & Stats */}
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  page.progressPercentage === 100
                                    ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                                    : 'bg-gradient-to-r from-blue-500 to-purple-500'
                                }`}
                                style={{ width: `${Math.round(page.progressPercentage)}%` }}
                              ></div>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-semibold shrink-0">
                              <span className="text-emerald-600 dark:text-emerald-400">{page.completedItems}</span>
                              <span className="text-gray-400">/</span>
                              <span className="text-gray-500 dark:text-gray-400">{page.totalItems}</span>
                            </div>
                          </div>
                        </div>

                        <Link
                          href={`#`}
                          className="shrink-0 self-center p-2 bg-gray-100 dark:bg-slate-800 hover:bg-blue-500 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* View All Link */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-800">
                <Link
                  href="/workspace"
                  className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Ver histórico completo
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>

          {/* Sidebar - 1/3 */}
          <div className="space-y-6 lg:space-y-8">

            {/* Agenda Inteligente - Enhanced */}
            <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">agenda inteligente.</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">eventos e prazos importantes</p>
              </div>

              {stats.upcomingEvents.length > 0 ? (
                <>
                  {/* Event Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
                      <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase mb-1">Próximos 7 dias</p>
                      <p className="text-2xl font-extrabold text-blue-900 dark:text-blue-100">
                        {stats.upcomingEvents.filter((e: any) => {
                          const diff = new Date(e.date).getTime() - Date.now();
                          return diff <= 7 * 24 * 60 * 60 * 1000;
                        }).length}
                      </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 rounded-lg p-3">
                      <p className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase mb-1">Este mês</p>
                      <p className="text-2xl font-extrabold text-purple-900 dark:text-purple-100">
                        {stats.upcomingEvents.length}
                      </p>
                    </div>
                  </div>

                  {/* Events List */}
                  <div className="space-y-2">
                    {stats.upcomingEvents.slice(0, 5).map((event: any, i: number) => {
                      const eventDate = new Date(event.date);
                      const daysUntil = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      const isUrgent = daysUntil <= 2;
                      const isSoon = daysUntil <= 7;

                      return (
                        <div
                          key={i}
                          className={`group relative overflow-hidden rounded-xl border-2 p-3 transition-all hover:shadow-md ${
                            isUrgent
                              ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20'
                              : isSoon
                                ? 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20'
                                : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950'
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg border-2 shrink-0 ${
                              isUrgent
                                ? 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700'
                                : isSoon
                                  ? 'bg-amber-100 dark:bg-amber-900 border-amber-300 dark:border-amber-700'
                                  : 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700'
                            }`}>
                              <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase">
                                {eventDate.toLocaleString('pt-BR', { month: 'short' })}
                              </span>
                              <span className="text-xl font-black text-gray-900 dark:text-white">
                                {eventDate.getDate()}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                  {event.title || event.name}
                                </h4>
                                {isUrgent && (
                                  <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded uppercase">
                                    urgente
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">{event.pageName}</p>

                              <div className="flex items-center gap-2 text-xs">
                                <CalendarIcon className="w-3 h-3 text-gray-400" />
                                <span className={`font-semibold ${
                                  isUrgent
                                    ? 'text-red-600 dark:text-red-400'
                                    : isSoon
                                      ? 'text-amber-600 dark:text-amber-400'
                                      : 'text-blue-600 dark:text-blue-400'
                                }`}>
                                  {daysUntil === 0
                                    ? 'Hoje'
                                    : daysUntil === 1
                                      ? 'Amanhã'
                                      : `Em ${daysUntil} dias`}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {stats.upcomingEvents.length > 5 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-800">
                      <Link
                        href="#"
                        className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        Ver todos eventos ({stats.upcomingEvents.length})
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                    <CalendarIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Nenhum evento próximo</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Adicione eventos para acompanhar seus prazos</p>
                </div>
              )}
            </div>

            {/* Central de Comandos - Enhanced */}
            <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">central de comandos.</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">acesso rápido e atalhos</p>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase">Seu workspace</span>
                  <Activity className="w-4 h-4 text-blue-500" />
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.totalPages}</p>
                    <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase">Páginas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{workspace?.groups.length || 0}</p>
                    <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase">Grupos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.totalTasks}</p>
                    <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase">Tasks</p>
                  </div>
                </div>
              </div>

              {/* Primary Actions */}
              <div className="space-y-2 mb-4">
                <Link
                  href="/workspace"
                  className="group flex items-center gap-3 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all hover:shadow-lg"
                >
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-sm block">Nova Página</span>
                    <span className="text-xs opacity-90">Criar do zero ou usar template</span>
                  </div>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>

              {/* Secondary Actions */}
              <div className="space-y-2">
                <Link
                  href="/workspace"
                  className="group flex items-center gap-3 p-3 border-2 border-gray-200 dark:border-slate-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-900 transition-all"
                >
                  <FolderOpen className="w-5 h-5 text-gray-900 dark:text-white" />
                  <div className="flex-1">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white block">Novo Grupo</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Organizar páginas</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                <Link
                  href="/settings"
                  className="group flex items-center gap-3 p-3 border-2 border-gray-200 dark:border-slate-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-900 transition-all"
                >
                  <Users className="w-5 h-5 text-gray-900 dark:text-white" />
                  <div className="flex-1">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white block">Convidar Equipe</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Colaborar em tempo real</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                <Link
                  href="/workspace"
                  className="group flex items-center gap-3 p-3 border-2 border-gray-200 dark:border-slate-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-900 transition-all"
                >
                  <BarChart3 className="w-5 h-5 text-gray-900 dark:text-white" />
                  <div className="flex-1">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white block">Ver Analytics</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Métricas detalhadas</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>

              {/* Templates Quick Access */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-800">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">Templates Rápidos</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: ListTodo, label: 'Tarefas', color: '#3b82f6' },
                    { icon: FolderKanban, label: 'Kanban', color: '#8b5cf6' },
                    { icon: CalendarIcon, label: 'Agenda', color: '#10b981' }
                  ].map((template, idx) => {
                    const Icon = template.icon;
                    return (
                      <Link
                        key={idx}
                        href="/workspace"
                        className="group flex flex-col items-center gap-2 p-3 border-2 border-gray-200 dark:border-slate-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-900 transition-all"
                      >
                        <div className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg group-hover:scale-110 transition-transform">
                          <Icon className="w-4 h-4" style={{ color: template.color }} />
                        </div>
                        <span className="text-[10px] font-semibold text-gray-900 dark:text-white">{template.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Painel de Conquistas - Enhanced CTA */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">

            {/* Left: Main Stats */}
            <div className="lg:col-span-2 p-8 lg:p-12">
              <div className="mb-8">
                <h3 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-3">
                  workspace em alta performance.
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Você está no caminho certo. Continue entregando resultados excepcionais.
                </p>
              </div>

              {/* Achievement Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-2 border-emerald-200 dark:border-emerald-900 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase">Entregues</span>
                  </div>
                  <p className="text-4xl font-black text-emerald-900 dark:text-emerald-100">{stats.totalCompleted}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">tarefas concluídas</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-200 dark:border-blue-900 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase">Páginas</span>
                  </div>
                  <p className="text-4xl font-black text-blue-900 dark:text-blue-100">{stats.totalPages}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">em produção</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-2 border-purple-200 dark:border-purple-900 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase">Performance</span>
                  </div>
                  <p className="text-4xl font-black text-purple-900 dark:text-purple-100">{Math.round(stats.overallProgress)}%</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">de progresso</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-200 dark:border-amber-900 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase">Streak</span>
                  </div>
                  <p className="text-4xl font-black text-amber-900 dark:text-amber-100">7</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">dias ativos</p>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Completion Rate</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {Math.round((stats.totalCompleted / Math.max(stats.totalTasks, 1)) * 100)}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (stats.totalCompleted / Math.max(stats.totalTasks, 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Produtividade Semanal</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {Math.round((stats.weeklyActivity.reduce((acc, d) => acc + d.completed, 0) / Math.max(stats.weeklyActivity.reduce((acc, d) => acc + d.tasks, 0), 1)) * 100)}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (stats.weeklyActivity.reduce((acc, d) => acc + d.completed, 0) / Math.max(stats.weeklyActivity.reduce((acc, d) => acc + d.tasks, 0), 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Actions & Recognition */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-l-2 border-gray-200 dark:border-slate-800 p-8 lg:p-12 flex flex-col">
              <div className="flex-1">
                {/* Recognition Badge */}
                <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-6 mb-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🏆</span>
                  </div>
                  <h4 className="text-lg font-black text-gray-900 dark:text-white mb-2">Top Performer</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Você está entre os {Math.round((stats.overallProgress / 100) * 10)}% mais produtivos!
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Média diária</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(stats.weeklyActivity.reduce((acc, d) => acc + d.completed, 0) / 7)} tarefas
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Tempo de backlog</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {advancedInsights.backlogDays.toFixed(1)} dias
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <Link
                  href="/workspace"
                  className="group flex items-center justify-between gap-3 p-4 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl transition-all font-bold"
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Explorar Workspace</span>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/analytics"
                  className="group flex items-center justify-between gap-3 p-4 border-2 border-gray-900 dark:border-white hover:bg-gray-900 dark:hover:bg-white text-gray-900 dark:text-white hover:text-white dark:hover:text-gray-900 rounded-xl transition-all font-bold"
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5" />
                    <span>Ver Relatório</span>
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
