"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar as CalendarIcon,
  ListTodo,
  Bug,
  FolderKanban,
  Table,
  FileText,
  Apple,
  Dumbbell,
  Wallet,
  BookOpen,
  Target,
  Zap,
  Brain,
  GitBranch,
  Layers,
  Timer,
  Star,
  AlertCircle,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Sparkles,
  TrendingDown,
  Activity,
  Users,
  Settings,
  Bell,
  Search,
  ChevronRight,
  BarChart3,
  PieChart,
  LineChart,
  Flame
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useWorkspaceStore } from '@/core/store/workspaceStore';

// ===== TEMPLATE CONFIGS =====
const TEMPLATE_CONFIGS = {
  tasks: { icon: ListTodo, label: 'Tarefas', color: 'blue', gradient: 'from-blue-500 to-cyan-500' },
  kanban: { icon: FolderKanban, label: 'Kanban', color: 'purple', gradient: 'from-purple-500 to-pink-500' },
  bugs: { icon: Bug, label: 'Bugs', color: 'red', gradient: 'from-red-500 to-orange-500' },
  calendar: { icon: CalendarIcon, label: 'Calendário', color: 'green', gradient: 'from-green-500 to-emerald-500' },
  projects: { icon: Layers, label: 'Projetos', color: 'orange', gradient: 'from-orange-500 to-amber-500' },
  table: { icon: Table, label: 'Tabela', color: 'teal', gradient: 'from-teal-500 to-cyan-500' },
  nutrition: { icon: Apple, label: 'Nutrição', color: 'lime', gradient: 'from-lime-500 to-green-500' },
  workout: { icon: Dumbbell, label: 'Treino', color: 'rose', gradient: 'from-rose-500 to-pink-500' },
  budget: { icon: Wallet, label: 'Orçamento', color: 'emerald', gradient: 'from-emerald-500 to-teal-500' },
  'personal-budget': { icon: Wallet, label: 'Orçamento Pessoal', color: 'emerald', gradient: 'from-emerald-500 to-green-500' },
  'business-budget': { icon: Wallet, label: 'Orçamento Empresarial', color: 'emerald', gradient: 'from-emerald-600 to-green-600' },
  study: { icon: BookOpen, label: 'Estudos', color: 'indigo', gradient: 'from-indigo-500 to-purple-500' },
  focus: { icon: Target, label: 'Foco', color: 'violet', gradient: 'from-violet-500 to-purple-500' },
  notes: { icon: FileText, label: 'Notas', color: 'gray', gradient: 'from-gray-500 to-slate-500' },
  wiki: { icon: BookOpen, label: 'Wiki', color: 'blue', gradient: 'from-blue-600 to-indigo-600' },
  timeline: { icon: GitBranch, label: 'Timeline', color: 'cyan', gradient: 'from-cyan-500 to-blue-500' },
  roadmap: { icon: GitBranch, label: 'Roadmap', color: 'sky', gradient: 'from-sky-500 to-blue-500' },
  sprint: { icon: Zap, label: 'Sprint', color: 'yellow', gradient: 'from-yellow-500 to-orange-500' },
  mindmap: { icon: Brain, label: 'Mapa Mental', color: 'pink', gradient: 'from-pink-500 to-rose-500' },
  flowchart: { icon: GitBranch, label: 'Fluxograma', color: 'blue', gradient: 'from-blue-400 to-cyan-400' },
  documents: { icon: FileText, label: 'Documentos', color: 'slate', gradient: 'from-slate-500 to-gray-500' },
  dashboard: { icon: LayoutDashboard, label: 'Dashboard', color: 'purple', gradient: 'from-purple-600 to-pink-600' },
  blank: { icon: FileText, label: 'Página', color: 'gray', gradient: 'from-gray-400 to-slate-400' },
};

// ===== HELPER FUNCTIONS =====
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
    case 'nutrition':
      const meals = data.meals || [];
      totalItems = meals.length;
      const dailyTotals = meals.reduce((sum: number, m: any) => sum + (m.foods || []).reduce((s: number, f: any) => s + (f.calories || 0), 0), 0);
      const goals = data.goals || { calories: 2000 };
      completedItems = Math.round((dailyTotals / goals.calories) * 100);
      break;
    case 'workout':
      const workouts = data.workouts || [];
      totalItems = workouts.length;
      completedItems = workouts.filter((w: any) => w.completed).length;
      pendingItems = workouts.filter((w: any) => !w.completed).length;
      break;
    case 'budget':
    case 'personal-budget':
    case 'business-budget':
      const transactions = data.transactions || [];
      totalItems = transactions.length;
      const totalIncome = transactions.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
      const totalExpense = transactions.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
      completedItems = totalIncome - totalExpense;
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

  useEffect(() => {
    if (!workspace && !isLoading) {
      initializeWorkspace();
    }
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay("Bom dia");
    else if (hour < 18) setTimeOfDay("Boa tarde");
    else setTimeOfDay("Boa noite");
  }, [workspace, isLoading, initializeWorkspace]);

  // ===== COMPUTED STATS =====
  const stats = useMemo(() => {
    if (!workspace) return null;

    const allPages = workspace.groups.flatMap(g => g.pages);
    const allPagesStats = allPages.map(p => aggregatePageStats(p));

    // Global metrics
    const totalPages = allPages.length;
    const totalTasks = allPagesStats.filter(p => ['tasks', 'kanban', 'bugs'].includes(p.template))
      .reduce((sum, p) => sum + p.pendingItems, 0);
    const totalCompleted = allPagesStats.reduce((sum, p) => sum + p.completedItems, 0);
    const totalUrgent = allPagesStats.reduce((sum, p) => sum + p.urgentItems, 0);

    // Events
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
        acc.push({ name: config.label, value: 1, color: config.gradient });
      }
      return acc;
    }, []);

    // Weekly activity (mock data - pode ser substituído por dados reais)
    const weeklyActivity = [
      { day: 'Seg', tasks: 12, completed: 8 },
      { day: 'Ter', tasks: 15, completed: 10 },
      { day: 'Qua', tasks: 10, completed: 7 },
      { day: 'Qui', tasks: 18, completed: 14 },
      { day: 'Sex', tasks: 14, completed: 12 },
      { day: 'Sáb', tasks: 8, completed: 6 },
      { day: 'Dom', tasks: 5, completed: 4 },
    ];

    // Completion rate by category
    const completionByCategory = Object.keys(TEMPLATE_CONFIGS).map(template => {
      const pagesOfType = allPagesStats.filter(p => p.template === template);
      if (pagesOfType.length === 0) return null;

      const totalItems = pagesOfType.reduce((sum, p) => sum + p.totalItems, 0);
      const completed = pagesOfType.reduce((sum, p) => sum + p.completedItems, 0);
      const rate = totalItems > 0 ? (completed / totalItems) * 100 : 0;

      if (totalItems === 0) return null;

      return {
        name: TEMPLATE_CONFIGS[template as keyof typeof TEMPLATE_CONFIGS].label,
        rate: Math.round(rate),
        total: totalItems
      };
    }).filter(Boolean);

    // Pages needing attention
    const needsAttention = allPagesStats
      .filter(p => p.urgentItems > 0 || (p.pendingItems > 0 && p.progressPercentage < 50))
      .sort((a, b) => b.urgentItems - a.urgentItems)
      .slice(0, 5);

    // Recent activity
    const recentPages = allPagesStats
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
      .slice(0, 8);

    return {
      totalPages,
      totalTasks,
      totalCompleted,
      totalUrgent,
      upcomingEvents,
      templateDistribution,
      weeklyActivity,
      completionByCategory,
      needsAttention,
      recentPages,
      allPagesStats
    };
  }, [workspace]);

  if (isLoading || !workspace || !stats) {
    return (
      <div className="flex h-screen items-center justify-center bg-arc-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-arc opacity-20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-arc border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm font-medium text-arc-muted uppercase tracking-wider">carregando workspace</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-arc-primary">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8 lg:py-12">

        {/* HERO - Estilo Landing Page */}
        <div className="mb-12 lg:mb-16">
          <div className="absolute inset-0 bg-grid-white/5 dark:bg-grid-black/5"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm font-medium text-neutral-300 dark:text-neutral-600 uppercase tracking-wider">
                    {timeOfDay}
                  </span>
                </div>
                <h2 className="text-3xl lg:text-5xl font-bold mb-3 tracking-tight">
                  Centro de Comando
                </h2>
                <p className="text-neutral-300 dark:text-neutral-600 text-lg max-w-2xl">
                  Gerencie todos os seus projetos, tarefas e metas em um só lugar.
                  {stats.totalTasks > 0 && ` Você tem ${stats.totalTasks} itens pendentes.`}
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/workspace"
                  className="px-6 py-3 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-xl font-semibold hover:shadow-2xl transition-all flex items-center gap-2 group"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  Nova Página
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="group relative overflow-hidden bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 hover:shadow-xl hover:scale-[1.02] transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-4xl font-bold text-neutral-900 dark:text-white mb-1">{stats.totalPages}</h3>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Páginas Ativas</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 hover:shadow-xl hover:scale-[1.02] transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                  <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                {stats.totalTasks > 0 && <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
              </div>
              <h3 className="text-4xl font-bold text-neutral-900 dark:text-white mb-1">{stats.totalTasks}</h3>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Tarefas Pendentes</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 hover:shadow-xl hover:scale-[1.02] transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-4xl font-bold text-neutral-900 dark:text-white mb-1">{stats.totalCompleted}</h3>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Itens Concluídos</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 hover:shadow-xl hover:scale-[1.02] transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <CalendarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                {stats.upcomingEvents.length > 0 && <Flame className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
              </div>
              <h3 className="text-4xl font-bold text-neutral-900 dark:text-white mb-1">{stats.upcomingEvents.length}</h3>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Eventos Próximos</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Weekly Activity Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-neutral-500" />
                  Atividade Semanal
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Tarefas criadas vs concluídas</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 rounded-full bg-neutral-900 dark:bg-white"></div>
                  <span className="text-neutral-600 dark:text-neutral-400">Criadas</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-neutral-600 dark:text-neutral-400">Concluídas</span>
                </div>
              </div>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.weeklyActivity}>
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#171717" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#171717" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" className="dark:stroke-neutral-800" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#737373', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#737373', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    cursor={{ stroke: '#171717', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="tasks" stroke="#171717" strokeWidth={2} fillOpacity={1} fill="url(#colorTasks)" />
                  <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Template Distribution Pie Chart */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-shadow">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-neutral-500" />
                Distribuição de Templates
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Páginas por tipo</p>
            </div>
            <div className="h-[280px] flex items-center justify-center">
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {stats.templateDistribution.slice(0, 6).map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Access Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-neutral-500" />
                Acesso Rápido
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Crie novas páginas rapidamente</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-4">
            {Object.entries(TEMPLATE_CONFIGS).slice(0, 12).map(([key, config]) => {
              const Icon = config.icon;
              const pagesOfType = stats.allPagesStats.filter(p => p.template === key);
              const count = pagesOfType.length;

              return (
                <button
                  key={key}
                  className="group relative overflow-hidden bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 hover:shadow-lg hover:scale-105 transition-all text-left"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                  <div className="relative">
                    <div className={`p-2.5 bg-gradient-to-br ${config.gradient} rounded-lg w-fit mb-3`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1 truncate">{config.label}</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {count} {count === 1 ? 'página' : 'páginas'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Recent Pages & Need Attention */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Pages */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-neutral-500" />
                Acessado Recentemente
              </h3>
            </div>
            <div className="space-y-2">
              {stats.recentPages.map(page => {
                const config = getTemplateConfig(page.template);
                const Icon = config.icon;

                return (
                  <div
                    key={page.pageId}
                    className="group flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <div className={`p-2 bg-gradient-to-br ${config.gradient} rounded-lg shrink-0`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-neutral-900 dark:text-white text-sm truncate">{page.pageName}</h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {config.label} • {page.lastUpdated.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Needs Attention */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Requer Atenção
              </h3>
            </div>
            {stats.needsAttention.length > 0 ? (
              <div className="space-y-2">
                {stats.needsAttention.map(page => {
                  const config = getTemplateConfig(page.template);
                  const Icon = config.icon;

                  return (
                    <div
                      key={page.pageId}
                      className="group flex items-center gap-3 p-3 rounded-lg border border-orange-100 dark:border-orange-900/30 bg-orange-50 dark:bg-orange-900/10 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className={`p-2 bg-gradient-to-br ${config.gradient} rounded-lg shrink-0`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-neutral-900 dark:text-white text-sm truncate">{page.pageName}</h4>
                        <p className="text-xs text-orange-600 dark:text-orange-400">
                          {page.urgentItems > 0 ? `${page.urgentItems} urgentes` : `${page.pendingItems} pendentes`}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">Tudo em dia! 🎉</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        {stats.upcomingEvents.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-neutral-500" />
                Próximos Eventos
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.upcomingEvents.map((event: any, i: number) => (
                <div
                  key={i}
                  className="group flex items-start gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800 transition-all"
                >
                  <div className="flex flex-col items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white shrink-0">
                    <span className="text-xs font-bold uppercase">{new Date(event.date).toLocaleString('pt-BR', { month: 'short' })}</span>
                    <span className="text-xl font-bold">{new Date(event.date).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1 truncate">{event.title || event.name}</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{event.pageName}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {new Date(event.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
