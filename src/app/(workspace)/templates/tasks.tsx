"use client";

import { useState } from 'react';
import { 
  Plus, Check, Circle, Clock, Calendar, Tag, 
  Trash2, Edit2, X, Star, Flag, ChevronDown,
  Filter, Search, MoreVertical, CheckCircle2,
  AlertCircle, Flame, SortAsc
} from 'lucide-react';

type Priority = 'none' | 'low' | 'medium' | 'high' | 'urgent';
type TaskCategory = 'personal' | 'work' | 'study' | 'health' | 'other';

type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  category: TaskCategory;
  dueDate: string;
  tags: string[];
  favorite: boolean;
  createdAt: Date;
  completedAt?: Date;
  subtasks: SubTask[];
};

type SubTask = {
  id: number;
  title: string;
  completed: boolean;
};

const PRIORITY_CONFIG = {
  none: { label: 'Sem prioridade', color: 'gray', icon: Circle },
  low: { label: 'Baixa', color: 'blue', icon: Circle },
  medium: { label: 'Média', color: 'yellow', icon: Flag },
  high: { label: 'Alta', color: 'orange', icon: Flag },
  urgent: { label: 'Urgente', color: 'red', icon: Flame },
};

const CATEGORY_CONFIG = {
  personal: { label: 'Pessoal', color: 'purple', emoji: '👤' },
  work: { label: 'Trabalho', color: 'blue', emoji: '💼' },
  study: { label: 'Estudos', color: 'green', emoji: '📚' },
  health: { label: 'Saúde', color: 'pink', emoji: '❤️' },
  other: { label: 'Outros', color: 'gray', emoji: '📌' },
};

export default function TasksTemplate() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Revisar documentação do projeto',
      description: 'Revisar e atualizar toda a documentação técnica',
      completed: false,
      priority: 'high',
      category: 'work',
      dueDate: '2025-01-25',
      tags: ['Documentação', 'Urgente'],
      favorite: true,
      createdAt: new Date('2025-01-20'),
      subtasks: [
        { id: 1, title: 'Revisar README', completed: true },
        { id: 2, title: 'Atualizar API docs', completed: false },
      ],
    },
    {
      id: 2,
      title: 'Implementar feature de autenticação',
      description: 'OAuth 2.0 com Google e GitHub',
      completed: false,
      priority: 'urgent',
      category: 'work',
      dueDate: '2025-01-22',
      tags: ['Backend', 'Segurança'],
      favorite: false,
      createdAt: new Date('2025-01-19'),
      subtasks: [],
    },
    {
      id: 3,
      title: 'Estudar React Server Components',
      description: '',
      completed: true,
      priority: 'medium',
      category: 'study',
      dueDate: '2025-01-20',
      tags: ['React', 'Next.js'],
      favorite: false,
      createdAt: new Date('2025-01-18'),
      completedAt: new Date('2025-01-20'),
      subtasks: [],
    },
  ]);

  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created' | 'dueDate' | 'priority'>('created');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    category: 'personal' as TaskCategory,
    dueDate: '',
    tags: '',
  });

  const addTask = () => {
    if (!newTask.trim()) return;

    const task: Task = {
      id: Date.now(),
      title: newTask,
      description: '',
      completed: false,
      priority: 'none',
      category: 'other',
      dueDate: '',
      tags: [],
      favorite: false,
      createdAt: new Date(),
      subtasks: [],
    };

    setTasks([task, ...tasks]);
    setNewTask('');
  };

  const addDetailedTask = () => {
    if (!newTaskForm.title.trim()) return;

    const task: Task = {
      id: Date.now(),
      title: newTaskForm.title,
      description: newTaskForm.description,
      completed: false,
      priority: newTaskForm.priority,
      category: newTaskForm.category,
      dueDate: newTaskForm.dueDate,
      tags: newTaskForm.tags.split(',').map(t => t.trim()).filter(t => t),
      favorite: false,
      createdAt: new Date(),
      subtasks: [],
    };

    setTasks([task, ...tasks]);
    setNewTaskForm({ 
      title: '', 
      description: '', 
      priority: 'medium', 
      category: 'personal', 
      dueDate: '', 
      tags: '' 
    });
    setShowAddForm(false);
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { 
            ...task, 
            completed: !task.completed,
            completedAt: !task.completed ? new Date() : undefined
          } 
        : task
    ));
  };

  const updateTask = (id: number, updates: Partial<Task>) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, ...updates } : task));
    if (selectedTask?.id === id) {
      setSelectedTask({ ...selectedTask, ...updates });
    }
  };

  const deleteTask = (id: number) => {
    if (confirm('Excluir esta tarefa?')) {
      setTasks(tasks.filter(task => task.id !== id));
      setSelectedTask(null);
    }
  };

  const toggleFavorite = (id: number) => {
    updateTask(id, { favorite: !tasks.find(t => t.id === id)?.favorite });
  };

  const addSubtask = (taskId: number, subtaskTitle: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !subtaskTitle.trim()) return;

    const newSubtask: SubTask = {
      id: Date.now(),
      title: subtaskTitle,
      completed: false,
    };

    updateTask(taskId, { 
      subtasks: [...task.subtasks, newSubtask] 
    });
  };

  const toggleSubtask = (taskId: number, subtaskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    updateTask(taskId, {
      subtasks: task.subtasks.map(st => 
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      ),
    });
  };

  // Filtros e ordenação
  const filteredTasks = tasks
    .filter(task => {
      const matchesCompletion = 
        filter === 'all' ? true :
        filter === 'pending' ? !task.completed :
        task.completed;
      
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
      const matchesFavorite = !showFavoritesOnly || task.favorite;
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCompletion && matchesPriority && matchesCategory && matchesFavorite && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'priority') {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  // Stats
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
    overdue: tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length,
    today: tasks.filter(t => !t.completed && t.dueDate === new Date().toISOString().split('T')[0]).length,
  };

  const isOverdue = (dueDate: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const isToday = (dueDate: string) => {
    if (!dueDate) return false;
    return new Date(dueDate).toDateString() === new Date().toDateString();
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header com Stats */}
      <div className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Pendentes</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.pending}</div>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="text-xs text-green-600 dark:text-green-400 mb-1">Concluídas</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="text-xs text-red-600 dark:text-red-400 mb-1">Atrasadas</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</div>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
            <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">Hoje</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.today}</div>
          </div>
        </div>

        {/* Quick Add */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="Adicionar tarefa rápida... (pressione Enter)"
              className="w-full pl-4 pr-10 py-3 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
            <button
              onClick={addTask}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-3 bg-gray-900 dark:bg-slate-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition font-medium whitespace-nowrap"
          >
            Tarefa Detalhada
          </button>
        </div>

        {/* Detailed Add Form */}
        {showAddForm && (
          <div className="mb-6 p-6 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Nova Tarefa</h3>
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
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  placeholder="Título da tarefa *"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                />
              </div>

              <div className="md:col-span-2">
                <textarea
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                  placeholder="Descrição (opcional)"
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 resize-none"
                />
              </div>

              <select
                value={newTaskForm.priority}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value as Priority })}
                className="px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
              >
                {Object.entries(PRIORITY_CONFIG).map(([key, value]) => (
                  <option key={key} value={key}>{value.label}</option>
                ))}
              </select>

              <select
                value={newTaskForm.category}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, category: e.target.value as TaskCategory })}
                className="px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
              >
                {Object.entries(CATEGORY_CONFIG).map(([key, value]) => (
                  <option key={key} value={key}>{value.emoji} {value.label}</option>
                ))}
              </select>

              <input
                type="date"
                value={newTaskForm.dueDate}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                className="px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
              />

              <input
                type="text"
                value={newTaskForm.tags}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, tags: e.target.value })}
                placeholder="Tags (separadas por vírgula)"
                className="px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
              />
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={addDetailedTask}
                disabled={!newTaskForm.title.trim()}
                className="px-6 py-2.5 bg-gray-900 dark:bg-slate-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Criar Tarefa
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tarefas..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
            />
          </div>

          <div className="flex bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === 'all' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === 'pending' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === 'completed' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Concluídas
            </button>
          </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
            className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
          >
            <option value="all">Todas Prioridades</option>
            {Object.entries(PRIORITY_CONFIG).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
          >
            <option value="created">Mais Recentes</option>
            <option value="dueDate">Prazo</option>
            <option value="priority">Prioridade</option>
          </select>

          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`p-2 rounded-xl transition ${
              showFavoritesOnly
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Star className={`w-5 h-5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-gray-600 dark:text-gray-400">
              Nenhuma tarefa encontrada
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const PriorityIcon = PRIORITY_CONFIG[task.priority].icon;
            const priorityColor = PRIORITY_CONFIG[task.priority].color;
            const categoryConfig = CATEGORY_CONFIG[task.category];
            const completedSubtasks = task.subtasks.filter(st => st.completed).length;

            return (
              <div
                key={task.id}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 hover:shadow-lg transition group"
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex-shrink-0 mt-1"
                  >
                    {task.completed ? (
                      <div className="w-6 h-6 bg-green-500 dark:bg-green-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-gray-300 dark:border-slate-600 rounded-lg hover:border-gray-400 dark:hover:border-slate-500 transition"></div>
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      <h3
                        onClick={() => setSelectedTask(task)}
                        className={`flex-1 font-semibold cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition ${
                          task.completed 
                            ? 'line-through text-gray-500 dark:text-gray-400' 
                            : 'text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {task.title}
                      </h3>

                      <button
                        onClick={() => toggleFavorite(task.id)}
                        className="flex-shrink-0"
                      >
                        <Star className={`w-5 h-5 ${task.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 hover:text-yellow-400'} transition`} />
                      </button>
                    </div>

                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {task.priority !== 'none' && (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 bg-${priorityColor}-100 dark:bg-${priorityColor}-900/30 text-${priorityColor}-700 dark:text-${priorityColor}-400 rounded-lg text-xs font-medium`}>
                          <PriorityIcon className="w-3 h-3" />
                          {PRIORITY_CONFIG[task.priority].label}
                        </span>
                      )}

                      <span className={`inline-flex items-center gap-1 px-2 py-1 bg-${categoryConfig.color}-100 dark:bg-${categoryConfig.color}-900/30 text-${categoryConfig.color}-700 dark:text-${categoryConfig.color}-400 rounded-lg text-xs font-medium`}>
                        <span>{categoryConfig.emoji}</span>
                        {categoryConfig.label}
                      </span>

                      {task.dueDate && (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                          isOverdue(task.dueDate) && !task.completed
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            : isToday(task.dueDate)
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300'
                        }`}>
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </span>
                      )}

                      {task.subtasks.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          {completedSubtasks}/{task.subtasks.length}
                        </span>
                      )}

                      {task.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Subtasks */}
                    {task.subtasks.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-800 space-y-2">
                        {task.subtasks.map(subtask => (
                          <div key={subtask.id} className="flex items-center gap-2">
                            <button
                              onClick={() => toggleSubtask(task.id, subtask.id)}
                              className="flex-shrink-0"
                            >
                              {subtask.completed ? (
                                <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              ) : (
                                <div className="w-4 h-4 border-2 border-gray-300 dark:border-slate-600 rounded hover:border-gray-400 transition"></div>
                              )}
                            </button>
                            <span className={`text-sm ${
                              subtask.completed 
                                ? 'line-through text-gray-500 dark:text-gray-400' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {subtask.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl shadow-2xl border border-gray-200 dark:border-slate-800 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <button
                    onClick={() => toggleTask(selectedTask.id)}
                    className="flex-shrink-0 mt-1"
                  >
                    {selectedTask.completed ? (
                      <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center shadow-lg">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 border-2 border-gray-300 dark:border-slate-600 rounded-lg hover:border-gray-400 transition"></div>
                    )}
                  </button>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={selectedTask.title}
                      onChange={(e) => updateTask(selectedTask.id, { title: e.target.value })}
                      className="text-2xl font-bold text-gray-900 dark:text-gray-100 bg-transparent border-none outline-none w-full focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-700 rounded px-2 -mx-2"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={selectedTask.description}
                  onChange={(e) => updateTask(selectedTask.id, { description: e.target.value })}
                  placeholder="Adicione uma descrição..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 resize-none"
                />
              </div>

              {/* Priority & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prioridade
                  </label>
                  <select
                    value={selectedTask.priority}
                    onChange={(e) => updateTask(selectedTask.id, { priority: e.target.value as Priority })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                  >
                    {Object.entries(PRIORITY_CONFIG).map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoria
                  </label>
                  <select
                    value={selectedTask.category}
                    onChange={(e) => updateTask(selectedTask.id, { category: e.target.value as TaskCategory })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                  >
                    {Object.entries(CATEGORY_CONFIG).map(([key, value]) => (
                      <option key={key} value={key}>{value.emoji} {value.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prazo
                </label>
                <input
                  type="date"
                  value={selectedTask.dueDate}
                  onChange={(e) => updateTask(selectedTask.id, { dueDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={selectedTask.tags.join(', ')}
                  onChange={(e) => updateTask(selectedTask.id, { tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                  placeholder="Ex: Urgente, Backend, Bug"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                />
              </div>

              {/* Subtasks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subtarefas
                </label>
                <div className="space-y-2 mb-3">
                  {selectedTask.subtasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <button
                        onClick={() => toggleSubtask(selectedTask.id, subtask.id)}
                        className="flex-shrink-0"
                      >
                        {subtask.completed ? (
                          <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 dark:border-slate-600 rounded hover:border-gray-400 transition"></div>
                        )}
                      </button>
                      <span className={`flex-1 text-sm ${
                        subtask.completed 
                          ? 'line-through text-gray-500 dark:text-gray-400' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Nova subtarefa (Enter para adicionar)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.currentTarget;
                      addSubtask(selectedTask.id, input.value);
                      input.value = '';
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                />
              </div>

              {/* Info */}
              {selectedTask.completedAt && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    ✅ Concluída em {selectedTask.completedAt.toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-0 border-t border-gray-200 dark:border-slate-800 flex gap-3">
              <button
                onClick={() => toggleFavorite(selectedTask.id)}
                className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition font-medium flex items-center gap-2"
              >
                <Star className={`w-4 h-4 ${selectedTask.favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                {selectedTask.favorite ? 'Desfavoritar' : 'Favoritar'}
              </button>
              <button
                onClick={() => deleteTask(selectedTask.id)}
                className="px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition font-medium"
              >
                Excluir
              </button>
              <button
                onClick={() => setSelectedTask(null)}
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