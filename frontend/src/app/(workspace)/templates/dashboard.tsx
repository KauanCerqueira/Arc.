"use client";

import Link from 'next/link';
import {
  FileText,
  FolderOpen,
  Plus,
  Star,
  Activity,
  Users,
  ArrowRight,
  Settings,
  MoreHorizontal,
  Search,
  CheckCircle2,
  Zap,
  BarChart2,
  HardDrive,
  ChevronDown,
  Filter,
  Pin,
  Save,
  LayoutDashboard,
  Bell,
  Calendar as CalendarIcon,
  Clock,
  Download,
  Share2,
  Inbox,
  Target,
  TrendingUp,
  AlertTriangle,
  PieChart,
  Layers,
  Command,
  ListTodo,
  Bug,
  CalendarDays,
  AlertCircle
} from 'lucide-react';
import { useWorkspaceStore } from '@/core/store/workspaceStore';
import { useState, useEffect, useMemo } from 'react';
import { getPageIcon } from '../components/sidebar/pageIcons';

// --- Types & Helpers ---

type PageStats = {
  pageId: string;
  pageName: string;
  groupName: string;
  groupId: string;
  pageIcon: any;
  template: string;
  totalItems: number;
  completedItems: number;
  pendingItems: number;
  progressPercentage: number;
  lastUpdated: Date;
  summary: string;
  urgentItems: number;
  overdueItems: number;
};

// Helper function to aggregate data (Logic from Template)
const aggregatePageData = (page: any, groupName: string, groupId: string): PageStats => {
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
      urgentItems = tasks.filter((t: any) => !t.completed && t.priority === 'high').length;
      overdueItems = tasks.filter((t: any) => {
        if (!t.dueDate || t.completed) return false;
        return new Date(t.dueDate) < today;
      }).length;
      summary = `${completedItems}/${totalItems} tarefas`;
      break;
    case 'kanban':
      const cards = data.cards || [];
      totalItems = cards.length;
      completedItems = cards.filter((c: any) => c.status === 'done').length;
      pendingItems = cards.filter((c: any) => c.status !== 'done').length;
      urgentItems = cards.filter((c: any) => c.status !== 'done' && (c.priority === 'urgent' || c.priority === 'high')).length;
      overdueItems = cards.filter((c: any) => {
        if (!c.dueDate || c.status === 'done') return false;
        return new Date(c.dueDate) < today;
      }).length;
      summary = `${completedItems}/${totalItems} cards`;
      break;
    case 'bugs':
      const bugs = data.bugs || [];
      totalItems = bugs.length;
      completedItems = bugs.filter((b: any) => b.status === 'resolved' || b.status === 'closed').length;
      pendingItems = bugs.filter((b: any) => b.status !== 'resolved' && b.status !== 'closed').length;
      urgentItems = bugs.filter((b: any) => (b.status !== 'resolved' && b.status !== 'closed') && (b.severity === 'critical' || b.severity === 'high')).length;
      summary = `${pendingItems} bugs ativos`;
      break;
    case 'calendar':
      const events = data.events || [];
      totalItems = events.length;
      pendingItems = events.filter((e: any) => new Date(e.date) >= today).length;
      summary = `${pendingItems} eventos futuros`;
      break;
    case 'projects':
    case 'table':
      const items = data.rows || data.projects || [];
      totalItems = items.length;
      completedItems = items.filter((i: any) => i.completed || i.status === 'completed').length;
      pendingItems = totalItems - completedItems;
      summary = `${totalItems} registros`;
      break;
    default:
      summary = 'Documento';
      break;
  }

  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const iconConfig = getPageIcon(page.template || 'blank');

  return {
    pageId: page.id,
    pageName: page.name,
    groupName,
    groupId,
    pageIcon: iconConfig.icon,
    template: page.template || 'blank',
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

// --- Visual Components ---

const ProgressBar = ({ progress, color = "bg-neutral-900 dark:bg-white" }: { progress: number, color?: string }) => (
  <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
    <div 
      className={`h-full rounded-full transition-all duration-500 ${color}`} 
      style={{ width: `${Math.min(Math.max(progress, 5), 100)}%` }}
    ></div>
  </div>
);

const AvatarStack = ({ users, limit = 3 }: { users: any[], limit?: number }) => (
  <div className="flex -space-x-2">
    {users.slice(0, limit).map((u, i) => (
      <div 
        key={i} 
        className="w-7 h-7 rounded-full border-2 border-white dark:border-neutral-900 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-600 dark:text-neutral-300"
        title={u.name}
      >
        {u.initials}
      </div>
    ))}
  </div>
);

export default function WorkspaceHome() {
  const { workspace, isLoading, initializeWorkspace } = useWorkspaceStore();
  const [activeTab, setActiveTab] = useState<"overview" | "projects" | "analytics" | "team">("overview");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Auto-reload workspace
  useEffect(() => {
    if (!workspace && !isLoading) {
      initializeWorkspace();
    }
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay("Bom dia");
    else if (hour < 18) setTimeOfDay("Boa tarde");
    else setTimeOfDay("Boa noite");
  }, [workspace, isLoading, initializeWorkspace]);

  // --- Data Aggregation Logic (Workspace Level) ---
  const stats = useMemo(() => {
    if (!workspace) return null;

    // 1. Aggregate all pages from all groups
    const allPagesStats: PageStats[] = workspace.groups.flatMap(group => 
      group.pages.map(page => aggregatePageData(page, group.name, group.id))
    );

    // 2. Global Counts
    const totalPages = allPagesStats.length;
    const totalTasks = allPagesStats.reduce((sum, p) => sum + p.totalItems, 0);
    const totalCompleted = allPagesStats.reduce((sum, p) => sum + p.completedItems, 0);
    const totalPending = allPagesStats.reduce((sum, p) => sum + p.pendingItems, 0);
    const totalUrgent = allPagesStats.reduce((sum, p) => sum + p.urgentItems, 0);
    const totalOverdue = allPagesStats.reduce((sum, p) => sum + p.overdueItems, 0);
    const overallProgress = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;

    // 3. Upcoming Events (Global)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const events = workspace.groups.flatMap(group => 
      group.pages
        .filter(p => p.template === 'calendar')
        .flatMap(p => {
          const pEvents = p.data?.events || [];
          return pEvents.map((e: any) => ({ ...e, pageId: p.id, pageName: p.name, groupName: group.name }));
        })
    ).filter((e: any) => {
      const d = new Date(e.date);
      d.setHours(0,0,0,0);
      return d >= today;
    }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

    // 4. Due/Urgent Tasks (Global)
    const urgentTasksList = workspace.groups.flatMap(group => 
      group.pages.flatMap(p => {
        const items = [];
        if (p.template === 'tasks') items.push(...(p.data?.tasks || []).map((t:any) => ({...t, type: 'task', pageId: p.id, pageName: p.name, groupName: group.name})));
        if (p.template === 'kanban') items.push(...(p.data?.cards || []).map((c:any) => ({...c, title: c.title, type: 'card', pageId: p.id, pageName: p.name, groupName: group.name})));
        return items;
      })
    ).filter((t: any) => {
      if (t.completed || t.status === 'done') return false;
      const isHighPriority = t.priority === 'high' || t.priority === 'urgent';
      const isDueSoon = t.dueDate && new Date(t.dueDate) <= new Date(Date.now() + 3 * 86400000);
      return isHighPriority || isDueSoon;
    }).sort((a: any, b: any) => {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return dateA - dateB;
    }).slice(0, 6);

    // 5. Needs Attention & Active
    const needsAttention = allPagesStats
      .filter(p => p.totalItems > 0 && p.progressPercentage < 100 && (p.urgentItems > 0 || p.overdueItems > 0))
      .sort((a, b) => (b.urgentItems + b.overdueItems) - (a.urgentItems + a.overdueItems))
      .slice(0, 4);

    const mostActivePages = allPagesStats
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
      .slice(0, 6);

    return {
      totalPages,
      totalTasks,
      totalCompleted,
      totalPending,
      totalUrgent,
      totalOverdue,
      overallProgress,
      events,
      urgentTasksList,
      needsAttention,
      mostActivePages
    };
  }, [workspace]);

  if (isLoading || !workspace || !stats) {
    return (
      <div className="flex h-full items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-neutral-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-mono text-neutral-500 uppercase tracking-widest animate-pulse">Carregando Sistema...</p>
        </div>
      </div>
    );
  }

  const getTemplateColor = (template: string) => {
    const colors: Record<string, string> = {
      tasks: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800',
      kanban: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800',
      bugs: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800',
      calendar: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800',
      projects: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800',
      table: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800',
      blank: 'text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800',
    };
    return colors[template] || colors.blank;
  };

  return (
    <div className="flex h-full flex-col bg-neutral-50 dark:bg-neutral-950 font-sans overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
      
      {/* --- HEADER POWER USER --- */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-neutral-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-neutral-900 font-bold text-xl shadow-lg">
                {workspace.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-lg font-bold text-neutral-900 dark:text-white leading-none">
                  {workspace.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 uppercase tracking-wider border border-neutral-200 dark:border-neutral-700">
                    Enterprise
                  </span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Online
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 w-64 focus-within:w-80 transition-all group">
                <Search className="w-4 h-4 text-neutral-400 group-focus-within:text-neutral-900 dark:group-focus-within:text-white mr-2" />
                <input 
                  type="text" 
                  placeholder="Buscar páginas, tarefas..." 
                  className="bg-transparent border-none outline-none text-sm w-full text-neutral-900 dark:text-white placeholder:text-neutral-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="text-[10px] font-mono text-neutral-400 border border-neutral-300 dark:border-neutral-600 px-1.5 py-0.5 rounded bg-white dark:bg-neutral-900">⌘K</span>
              </div>
              <div className="h-6 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-1"></div>
              <button className="relative p-2.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-all">
                <Bell className="w-5 h-5" />
                {stats.totalUrgent > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-neutral-900"></span>}
              </button>
              <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <Plus className="w-4 h-4" />
                <span>Novo Projeto</span>
              </button>
            </div>
          </div>

          <nav className="flex items-center gap-6 border-t border-neutral-100 dark:border-neutral-800/50 pt-2 -mb-4 overflow-x-auto scrollbar-hide">
            {[
              { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
              { id: "projects", label: "Projetos", icon: FolderOpen },
              { id: "analytics", label: "Analytics", icon: BarChart2 },
              { id: "team", label: "Equipe", icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`group flex items-center gap-2 pb-4 text-sm font-medium transition-all relative ${
                    isActive ? "text-neutral-900 dark:text-white" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"}`} />
                  {tab.label}
                  {isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-neutral-900 dark:bg-white rounded-t-full"></span>}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* 1. Hero / Welcome */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-end">
              <div>
                <h2 className="text-3xl md:text-4xl font-light text-neutral-900 dark:text-white mb-2">
                  {timeOfDay}, <span className="font-bold">Time.</span>
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 max-w-lg">
                  Resumo global do workspace. Existem <span className="font-medium text-neutral-900 dark:text-white underline decoration-neutral-300 underline-offset-4">{stats.totalPending} itens pendentes</span> e {stats.urgentTasksList.length} prioridades para hoje.
                </p>
              </div>
              <div className="flex gap-3">
                 <button className="px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 transition-colors flex items-center gap-2 shadow-sm">
                    <Download className="w-4 h-4" /> Relatório
                 </button>
                 <button className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:opacity-90 transition-colors flex items-center gap-2 shadow-sm">
                    <Target className="w-4 h-4" /> Metas
                 </button>
              </div>
            </div>

            {/* 2. Critical Alerts (If Any) */}
            {(stats.totalOverdue > 0 || stats.totalUrgent > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.totalOverdue > 0 && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-lg text-red-600 dark:text-red-400">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-red-900 dark:text-red-100 text-lg">{stats.totalOverdue} Itens Atrasados</h4>
                      <p className="text-sm text-red-700 dark:text-red-300">Requerem atenção imediata.</p>
                    </div>
                  </div>
                )}
                {stats.totalUrgent > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-lg text-amber-600 dark:text-amber-400">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900 dark:text-amber-100 text-lg">{stats.totalUrgent} Itens Urgentes</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">Alta prioridade detectada.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. Stats Grid (Replaces the simple template stats with High Density cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Pages - Inverted Style */}
              <div className="bg-neutral-900 dark:bg-white p-6 rounded-2xl shadow-xl text-white dark:text-neutral-900 relative overflow-hidden group">
                 <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 dark:bg-neutral-900/10 rounded-full blur-3xl translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform"></div>
                 <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                       <FileText className="w-6 h-6 opacity-80" />
                       <span className="text-xs font-bold bg-white/20 dark:bg-neutral-900/10 px-2 py-1 rounded">+New</span>
                    </div>
                    <h3 className="text-4xl font-bold tracking-tight">{stats.totalPages}</h3>
                    <p className="text-xs font-medium uppercase tracking-wider opacity-60 mt-1">Páginas Ativas</p>
                 </div>
              </div>

              {/* Total Items */}
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                 <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                       <Layers className="w-5 h-5" />
                    </div>
                 </div>
                 <h3 className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.totalTasks}</h3>
                 <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mt-1">Itens Totais</p>
              </div>

              {/* Completed */}
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                 <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                       <CheckCircle2 className="w-5 h-5" />
                    </div>
                 </div>
                 <h3 className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.totalCompleted}</h3>
                 <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mt-1">Concluídos</p>
              </div>

              {/* Pending */}
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                 <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                       <Clock className="w-5 h-5" />
                    </div>
                 </div>
                 <h3 className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.totalPending}</h3>
                 <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mt-1">Pendentes</p>
              </div>
            </div>

            {/* 4. Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* LEFT COLUMN (2/3) */}
              <div className="xl:col-span-2 space-y-8">
                
                {/* Overall Progress & Needs Attention */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-neutral-500" /> Progresso do Workspace
                    </h3>
                    <span className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.overallProgress.toFixed(0)}%</span>
                  </div>
                  
                  <div className="mb-8">
                    <ProgressBar progress={stats.overallProgress} color="bg-gradient-to-r from-blue-600 to-purple-600" />
                    <div className="flex justify-between mt-2 text-xs text-neutral-500 font-medium">
                      <span>0%</span>
                      <span>Metas Globais</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {stats.needsAttention.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Requer Atenção
                      </h4>
                      <div className="space-y-2">
                        {stats.needsAttention.map(page => (
                           <Link 
                              key={page.pageId} 
                              href={`/workspace/group/${page.groupId}/page/${page.pageId}`}
                              className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-100 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all group"
                           >
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-md bg-white dark:bg-neutral-900 flex items-center justify-center border border-neutral-200 dark:border-neutral-700 text-lg">
                                    <page.pageIcon className="w-4 h-4" />
                                 </div>
                                 <div>
                                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">{page.pageName}</p>
                                    <p className="text-xs text-neutral-500">{page.summary} • {page.urgentItems} urgentes</p>
                                 </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
                           </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Urgent / Due Tasks Grid */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <ListTodo className="w-5 h-5 text-neutral-500" /> Tarefas Prioritárias
                    </h3>
                    <Link href="#" className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white">Ver tudo</Link>
                  </div>
                  
                  {stats.urgentTasksList.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {stats.urgentTasksList.map((task: any, idx: number) => (
                          <Link
                            key={`${task.pageId}-${idx}`}
                            href={`/workspace/group/${workspace.groups.find(g => g.name === task.groupName)?.id}/page/${task.pageId}`}
                            className={`p-4 rounded-xl border-l-4 hover:shadow-md transition-all bg-white dark:bg-neutral-900 border-y border-r border-neutral-200 dark:border-neutral-800 ${
                               task.priority === 'urgent' || task.priority === 'high' ? 'border-l-red-500' : 'border-l-amber-500'
                            }`}
                          >
                             <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                   task.priority === 'urgent' || task.priority === 'high' 
                                   ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                                   : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                                }`}>
                                   {task.priority || 'Alta'}
                                </span>
                                <span className="text-[10px] text-neutral-400">
                                   {task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR', {day:'2-digit', month:'short'}) : 'Sem prazo'}
                                </span>
                             </div>
                             <h4 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1 mb-1">{task.title || task.taskTitle}</h4>
                             <p className="text-xs text-neutral-500 flex items-center gap-1">
                                <FileText className="w-3 h-3" /> {task.pageName}
                             </p>
                          </Link>
                       ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl">
                      <CheckCircle2 className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                      <p className="text-neutral-500 text-sm">Tudo em dia! Nenhuma tarefa urgente.</p>
                    </div>
                  )}
                </div>

                {/* Active Pages Grid */}
                <div>
                   <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
                      <Zap className="w-5 h-5 text-neutral-500" /> Páginas Mais Ativas
                   </h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {stats.mostActivePages.map((page) => {
                         const colorClass = getTemplateColor(page.template);
                         return (
                            <Link 
                               key={page.pageId}
                               href={`/workspace/group/${page.groupId}/page/${page.pageId}`}
                               className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-sm transition-all"
                            >
                               <div className="flex items-start justify-between mb-3">
                                  <div className={`p-2 rounded-lg ${colorClass.split(' ')[2]} bg-opacity-20`}>
                                     <page.pageIcon className={`w-5 h-5 ${colorClass.split(' ')[0]}`} />
                                  </div>
                                  <Activity className="w-4 h-4 text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
                               </div>
                               <h4 className="font-bold text-sm text-neutral-900 dark:text-white truncate mb-1">{page.pageName}</h4>
                               <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                                  <span className="truncate max-w-[80px]">{page.groupName}</span>
                                  <span>•</span>
                                  <span>{page.lastUpdated.toLocaleDateString()}</span>
                               </div>
                            </Link>
                         )
                      })}
                   </div>
                </div>

              </div>

              {/* RIGHT COLUMN (1/3) */}
              <div className="space-y-8">
                
                {/* Upcoming Events Card */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-5 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-neutral-500" /> Próximos Eventos
                  </h3>
                  
                  {stats.events.length > 0 ? (
                     <div className="space-y-4">
                        {stats.events.map((event: any, i: number) => (
                           <Link 
                              key={i} 
                              href={`/workspace/group/${workspace.groups.find(g => g.name === event.groupName)?.id}/page/${event.pageId}`}
                              className="flex gap-4 group"
                           >
                              <div className="flex flex-col items-center justify-center w-12 h-12 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shrink-0">
                                 <span className="text-[10px] font-bold text-neutral-500 uppercase">{new Date(event.date).toLocaleString('pt-BR', { month: 'short' })}</span>
                                 <span className="text-lg font-bold text-neutral-900 dark:text-white">{new Date(event.date).getDate()}</span>
                              </div>
                              <div className="min-w-0">
                                 <h4 className="text-sm font-bold text-neutral-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {event.title || event.name}
                                 </h4>
                                 <p className="text-xs text-neutral-500 truncate mt-0.5">{event.pageName}</p>
                                 <div className="flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3 text-neutral-400" />
                                    <span className="text-[10px] text-neutral-400">
                                       {new Date(event.date).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}
                                    </span>
                                 </div>
                              </div>
                           </Link>
                        ))}
                     </div>
                  ) : (
                     <div className="text-center py-8">
                        <CalendarIcon className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                        <p className="text-xs text-neutral-500">Sem eventos próximos.</p>
                     </div>
                  )}
                  <button className="w-full mt-6 py-2 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-bold text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                     Ver Calendário Completo
                  </button>
                </div>

                {/* Workspace Structure Summary */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                   <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-5 flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-neutral-500" /> Estrutura
                   </h3>
                   <div className="space-y-1">
                      {workspace.groups.slice(0, 5).map(group => (
                         <div key={group.id} className="flex items-center justify-between p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                               <span className="text-lg">{group.icon}</span>
                               <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white">{group.name}</span>
                            </div>
                            <span className="text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded-full">
                               {group.pages.length}
                            </span>
                         </div>
                      ))}
                   </div>
                   <Link href="#" className="block mt-4 text-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                      Gerenciar Grupos
                   </Link>
                </div>

              </div>
            </div>

          </div>
        )}

        {activeTab !== "overview" && (
           <div className="flex flex-col items-center justify-center h-[50vh] text-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                 <Layers className="w-8 h-8 text-neutral-400" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Módulo {activeTab}</h2>
              <p className="text-neutral-500 max-w-xs mx-auto text-sm">
                 Esta seção está sendo otimizada para o novo design system.
              </p>
              <button onClick={() => setActiveTab('overview')} className="mt-6 text-xs font-bold text-neutral-900 dark:text-white underline underline-offset-4">Voltar</button>
           </div>
        )}
      </main>
    </div>
  );
}