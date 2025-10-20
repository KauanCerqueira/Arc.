"use client";

import { useState } from 'react';
import { 
  Plus, Folder, Users, Calendar, MoreVertical, TrendingUp,
  Clock, Target, Star, Archive, Trash2, Edit2, X,
  CheckCircle2, AlertCircle, Pause, Play, Filter,
  BarChart3, Activity, DollarSign
} from 'lucide-react';

type ProjectStatus = 'planning' | 'active' | 'paused' | 'review' | 'completed' | 'archived';
type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

type Project = {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  team: string[];
  deadline: string;
  startDate: string;
  color: string;
  tasksTotal: number;
  tasksCompleted: number;
  budget?: number;
  spent?: number;
  favorite: boolean;
  client?: string;
};

const PROJECT_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-cyan-500',
  'bg-amber-500',
  'bg-teal-500',
];

const STATUS_CONFIG = {
  planning: { label: 'Planejamento', color: 'gray', icon: Calendar },
  active: { label: 'Em Andamento', color: 'blue', icon: Activity },
  paused: { label: 'Pausado', color: 'yellow', icon: Pause },
  review: { label: 'Em Revisão', color: 'purple', icon: AlertCircle },
  completed: { label: 'Concluído', color: 'green', icon: CheckCircle2 },
  archived: { label: 'Arquivado', color: 'gray', icon: Archive },
};

const PRIORITY_CONFIG = {
  low: { label: 'Baixa', color: 'gray' },
  medium: { label: 'Média', color: 'blue' },
  high: { label: 'Alta', color: 'orange' },
  critical: { label: 'Crítica', color: 'red' },
};

export default function ProjectsTemplate() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Redesign completo do site institucional com nova identidade visual',
      status: 'active',
      priority: 'high',
      progress: 65,
      team: ['João Silva', 'Maria Santos', 'Pedro Costa'],
      deadline: '2025-02-15',
      startDate: '2025-01-05',
      color: 'bg-blue-500',
      tasksTotal: 24,
      tasksCompleted: 16,
      budget: 50000,
      spent: 32500,
      favorite: true,
      client: 'Tech Corp',
    },
    {
      id: 2,
      name: 'App Mobile',
      description: 'Desenvolvimento do aplicativo iOS e Android',
      status: 'active',
      priority: 'critical',
      progress: 40,
      team: ['Ana Lima', 'Carlos Souza'],
      deadline: '2025-03-20',
      startDate: '2025-01-10',
      color: 'bg-purple-500',
      tasksTotal: 32,
      tasksCompleted: 13,
      budget: 80000,
      spent: 28000,
      favorite: false,
      client: 'StartupXYZ',
    },
    {
      id: 3,
      name: 'Marketing Q1',
      description: 'Campanhas de marketing para o primeiro trimestre',
      status: 'paused',
      priority: 'medium',
      progress: 25,
      team: ['Fernanda Costa'],
      deadline: '2025-01-30',
      startDate: '2025-01-01',
      color: 'bg-orange-500',
      tasksTotal: 15,
      tasksCompleted: 4,
      budget: 20000,
      spent: 5000,
      favorite: false,
    },
    {
      id: 4,
      name: 'API Integration',
      description: 'Integração com APIs de terceiros',
      status: 'completed',
      priority: 'medium',
      progress: 100,
      team: ['Pedro Costa', 'João Silva'],
      deadline: '2025-01-15',
      startDate: '2024-12-20',
      color: 'bg-green-500',
      tasksTotal: 12,
      tasksCompleted: 12,
      budget: 15000,
      spent: 14500,
      favorite: false,
      client: 'Tech Corp',
    },
  ]);

  const [view, setView] = useState<'grid' | 'list' | 'board'>('grid');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<ProjectPriority | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    client: '',
    deadline: '',
    team: '',
    budget: '',
    priority: 'medium' as ProjectPriority,
  });

  const addProject = () => {
    if (!newProject.name.trim()) return;

    const randomColor = PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)];

    const project: Project = {
      id: Date.now(),
      name: newProject.name,
      description: newProject.description,
      status: 'planning',
      priority: newProject.priority,
      progress: 0,
      team: newProject.team.split(',').map(t => t.trim()).filter(t => t),
      deadline: newProject.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startDate: new Date().toISOString().split('T')[0],
      color: randomColor,
      tasksTotal: 0,
      tasksCompleted: 0,
      budget: parseFloat(newProject.budget) || undefined,
      spent: 0,
      favorite: false,
      client: newProject.client,
    };

    setProjects([...projects, project]);
    setNewProject({ name: '', description: '', client: '', deadline: '', team: '', budget: '', priority: 'medium' });
    setShowAddForm(false);
  };

  const updateProject = (id: number, updates: Partial<Project>) => {
    setProjects(projects.map(p => p.id === id ? { ...p, ...updates } : p));
    if (selectedProject?.id === id) {
      setSelectedProject({ ...selectedProject, ...updates });
    }
  };

  const deleteProject = (id: number) => {
    if (confirm('Excluir este projeto?')) {
      setProjects(projects.filter(p => p.id !== id));
      setSelectedProject(null);
    }
  };

  const toggleFavorite = (id: number) => {
    updateProject(id, { favorite: !projects.find(p => p.id === id)?.favorite });
  };

  // Filtros
  const filteredProjects = projects.filter(project => {
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
    const matchesFavorite = !showFavoritesOnly || project.favorite;
    return matchesStatus && matchesPriority && matchesFavorite;
  });

  // Stats
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    paused: projects.filter(p => p.status === 'paused').length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    totalSpent: projects.reduce((sum, p) => sum + (p.spent || 0), 0),
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date() && new Date(deadline).toDateString() !== new Date().toDateString();
  };

  const getDaysRemaining = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header com Stats */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Projetos
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Em Andamento</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.active}</div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="text-xs text-green-600 dark:text-green-400 mb-1">Concluídos</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Orçamento Total</div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(stats.totalBudget)}</div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Gasto Total</div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(stats.totalSpent)}</div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ProjectStatus | 'all')}
              className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
            >
              <option value="all">Todos Status</option>
              {Object.entries(STATUS_CONFIG).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as ProjectPriority | 'all')}
              className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
            >
              <option value="all">Todas Prioridades</option>
              {Object.entries(PRIORITY_CONFIG).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>

            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                showFavoritesOnly
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Star className={`w-4 h-4 inline mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              Favoritos
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
              <button
                onClick={() => setView('grid')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  view === 'grid' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Grade
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  view === 'list' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => setView('board')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  view === 'board' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Quadro
              </button>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-gray-900 dark:bg-slate-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition flex items-center gap-2 font-medium shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Novo Projeto
            </button>
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Novo Projeto</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="Nome do projeto *"
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                />
              </div>

              <div className="md:col-span-2">
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Descrição"
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 resize-none"
                />
              </div>

              <input
                type="text"
                value={newProject.client}
                onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                placeholder="Cliente"
                className="px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
              />

              <input
                type="date"
                value={newProject.deadline}
                onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                className="px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
              />

              <input
                type="text"
                value={newProject.team}
                onChange={(e) => setNewProject({ ...newProject, team: e.target.value })}
                placeholder="Equipe (separado por vírgula)"
                className="px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
              />

              <input
                type="number"
                value={newProject.budget}
                onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                placeholder="Orçamento (R$)"
                step="0.01"
                className="px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
              />

              <select
                value={newProject.priority}
                onChange={(e) => setNewProject({ ...newProject, priority: e.target.value as ProjectPriority })}
                className="px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
              >
                {Object.entries(PRIORITY_CONFIG).map(([key, value]) => (
                  <option key={key} value={key}>{value.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={addProject}
                disabled={!newProject.name.trim()}
                className="px-6 py-2.5 bg-gray-900 dark:bg-slate-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Criar Projeto
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {view === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filteredProjects.map((project) => {
              const statusConfig = STATUS_CONFIG[project.status];
              const StatusIcon = statusConfig.icon;
              const priorityConfig = PRIORITY_CONFIG[project.priority];
              const daysRemaining = getDaysRemaining(project.deadline);

              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-xl transition cursor-pointer group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-12 h-12 ${project.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <Folder className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate">
                          {project.name}
                        </h3>
                        {project.client && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {project.client}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(project.id);
                      }}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                    >
                      <Star className={`w-5 h-5 ${project.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Status & Priority */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 bg-${statusConfig.color}-100 dark:bg-${statusConfig.color}-900/30 text-${statusConfig.color}-700 dark:text-${statusConfig.color}-400 rounded-lg text-xs font-medium flex items-center gap-1.5`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusConfig.label}
                    </span>
                    <span className={`px-3 py-1 bg-${priorityConfig.color}-100 dark:bg-${priorityConfig.color}-900/30 text-${priorityConfig.color}-700 dark:text-${priorityConfig.color}-400 rounded-lg text-xs font-medium`}>
                      {priorityConfig.label}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{project.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`${project.color} h-2 transition-all duration-500`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>{project.tasksCompleted} de {project.tasksTotal} tarefas</span>
                    </div>
                  </div>

                  {/* Budget */}
                  {project.budget && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Orçamento</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {project.spent && project.budget ? ((project.spent / project.budget) * 100).toFixed(0) : 0}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">{formatCurrency(project.spent || 0)}</span>
                        <span className="text-gray-600 dark:text-gray-400">{formatCurrency(project.budget)}</span>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-800">
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{project.team.length}</span>
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      isOverdue(project.deadline) 
                        ? 'text-red-600 dark:text-red-400 font-semibold' 
                        : daysRemaining <= 7
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      <Calendar className="w-4 h-4" />
                      <span>
                        {isOverdue(project.deadline) 
                          ? 'Atrasado' 
                          : daysRemaining === 0
                          ? 'Hoje'
                          : `${daysRemaining}d`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === 'list' && (
          <div className="space-y-3 max-w-7xl mx-auto">
            {filteredProjects.map((project) => {
              const statusConfig = STATUS_CONFIG[project.status];
              const StatusIcon = statusConfig.icon;
              const priorityConfig = PRIORITY_CONFIG[project.priority];

              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-lg transition cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${project.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <Folder className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate">
                          {project.name}
                        </h3>
                        {project.favorite && (
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {project.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 flex-shrink-0">
                      <span className={`px-3 py-1 bg-${statusConfig.color}-100 dark:bg-${statusConfig.color}-900/30 text-${statusConfig.color}-700 dark:text-${statusConfig.color}-400 rounded-lg text-xs font-medium flex items-center gap-1.5`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig.label}
                      </span>

                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {project.progress}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {project.tasksCompleted}/{project.tasksTotal}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{project.team.length}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(project.deadline).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === 'board' && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => {
              const StatusIcon = config.icon;
              const statusProjects = filteredProjects.filter(p => p.status === status);

              return (
                <div
                  key={status}
                  className="flex-shrink-0 w-80 bg-gray-50 dark:bg-slate-900 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`w-5 h-5 text-${config.color}-600 dark:text-${config.color}-400`} />
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {config.label}
                      </h3>
                      <span className="px-2 py-0.5 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                        {statusProjects.length}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {statusProjects.map(project => (
                      <div
                        key={project.id}
                        onClick={() => setSelectedProject(project)}
                        className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl p-4 hover:shadow-lg transition cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-10 h-10 ${project.color} rounded-lg flex items-center justify-center`}>
                            <Folder className="w-5 h-5 text-white" />
                          </div>
                          {project.favorite && (
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          )}
                        </div>

                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
                          {project.name}
                        </h4>

                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-3">
                          <span>{project.progress}%</span>
                          <span>{project.tasksCompleted}/{project.tasksTotal}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{project.team.length}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(project.deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <p className="text-gray-600 dark:text-gray-400">
              Nenhum projeto encontrado
            </p>
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl shadow-2xl border border-gray-200 dark:border-slate-800 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-16 h-16 ${selectedProject.color} rounded-2xl flex items-center justify-center shadow-xl`}>
                    <Folder className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {selectedProject.name}
                    </h2>
                    {selectedProject.client && (
                      <p className="text-gray-600 dark:text-gray-400">
                        Cliente: {selectedProject.client}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Status do Projeto
                </label>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                    const StatusIcon = config.icon;
                    return (
                      <button
                        key={status}
                        onClick={() => updateProject(selectedProject.id, { status: status as ProjectStatus })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                          selectedProject.status === status
                            ? `bg-${config.color}-100 dark:bg-${config.color}-900/30 text-${config.color}-700 dark:text-${config.color}-400 border-2 border-${config.color}-500`
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={selectedProject.description}
                  onChange={(e) => updateProject(selectedProject.id, { description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 resize-none"
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Progresso</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {selectedProject.progress}%
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tarefas</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {selectedProject.tasksCompleted}/{selectedProject.tasksTotal}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Equipe</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {selectedProject.team.length}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Prazo</div>
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {new Date(selectedProject.deadline).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              {/* Budget */}
              {selectedProject.budget && (
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Orçamento</h4>
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {selectedProject.spent && selectedProject.budget 
                        ? ((selectedProject.spent / selectedProject.budget) * 100).toFixed(0) 
                        : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-700 dark:text-gray-300">Gasto</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(selectedProject.spent || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Total</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(selectedProject.budget)}
                    </span>
                  </div>
                </div>
              )}

              {/* Team */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Equipe
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.team.map((member, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium"
                    >
                      {member}
                    </span>
                  ))}
                  {selectedProject.team.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Nenhum membro na equipe
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-0 border-t border-gray-200 dark:border-slate-800 flex gap-3">
              <button
                onClick={() => toggleFavorite(selectedProject.id)}
                className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition font-medium flex items-center gap-2"
              >
                <Star className={`w-4 h-4 ${selectedProject.favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                {selectedProject.favorite ? 'Remover Favorito' : 'Favoritar'}
              </button>
              <button
                onClick={() => deleteProject(selectedProject.id)}
                className="px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition font-medium"
              >
                Excluir
              </button>
              <button
                onClick={() => setSelectedProject(null)}
                className="ml-auto px-6 py-2.5 bg-gray-900 dark:bg-slate-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}