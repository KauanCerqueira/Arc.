"use client";

import { useState } from 'react';

type Task = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  tags: string[];
  createdAt: Date;
};

const PRIORITIES = {
  low: { label: 'Baixa', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  medium: { label: 'Média', color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800' },
  high: { label: 'Alta', color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' },
};

export default function TasksTemplate() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Implementar autenticação',
      description: 'Adicionar OAuth 2.0 com Google',
      completed: false,
      priority: 'high',
      dueDate: '2025-01-25',
      tags: ['Backend', 'Segurança'],
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'Escrever testes unitários',
      description: 'Cobertura de 80% do código',
      completed: false,
      priority: 'medium',
      dueDate: '2025-01-28',
      tags: ['Testing'],
      createdAt: new Date(),
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    dueDate: '',
    tags: '',
  });

  const addTask = () => {
    if (!newTask.title.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      completed: false,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      tags: newTask.tags.split(',').map(t => t.trim()).filter(t => t),
      createdAt: new Date(),
    };
    setTasks([task, ...tasks]);
    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', tags: '' });
    setShowForm(false);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    if (confirm('Excluir tarefa?')) {
      setTasks(tasks.filter(t => t.id !== id));
      if (selectedTask?.id === id) setSelectedTask(null);
    }
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
    if (selectedTask?.id === id) {
      setSelectedTask({ ...selectedTask, ...updates });
    }
  };

  const isOverdue = (date: string) => {
    if (!date) return false;
    return new Date(date) < new Date() && !new Date(date).toDateString().startsWith(new Date().toDateString());
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
  };

  const pendingTasks = tasks.filter(t => !t.completed).sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const filteredTasks = filterPriority === 'all' ? pendingTasks : pendingTasks.filter(t => t.priority === filterPriority);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Minhas Tarefas
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {stats.completed} de {stats.total} concluídas
                    </p>
                  </div>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-slate-700 hover:bg-gray-800 dark:hover:bg-slate-600 rounded-lg transition"
                  >
                    Nova Tarefa
                  </button>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-900 dark:bg-slate-600 transition-all duration-500" 
                    style={{ width: `${(stats.completed / stats.total) * 100 || 0}%` }} 
                  />
                </div>
              </div>

              <div className="p-6">
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {['all', 'high', 'medium', 'low'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setFilterPriority(filter)}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition ${
                        filterPriority === filter 
                          ? 'bg-gray-900 dark:bg-slate-700 text-white' 
                          : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
                      }`}
                    >
                      {filter === 'all' ? 'Todas' : PRIORITIES[filter as keyof typeof PRIORITIES].label}
                    </button>
                  ))}
                </div>

                {showForm && (
                  <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Nova Tarefa
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Título
                        </label>
                        <input 
                          type="text" 
                          value={newTask.title} 
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} 
                          placeholder="Nome da tarefa" 
                          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Descrição
                        </label>
                        <textarea 
                          value={newTask.description} 
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} 
                          placeholder="Detalhes da tarefa" 
                          rows={2} 
                          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Prioridade
                          </label>
                          <select 
                            value={newTask.priority} 
                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })} 
                            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                          >
                            <option value="low">Baixa</option>
                            <option value="medium">Média</option>
                            <option value="high">Alta</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Prazo
                          </label>
                          <input 
                            type="date" 
                            value={newTask.dueDate} 
                            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} 
                            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tags
                          </label>
                          <input 
                            type="text" 
                            value={newTask.tags} 
                            onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })} 
                            placeholder="Backend, API" 
                            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button 
                          onClick={addTask} 
                          disabled={!newTask.title.trim()} 
                          className="flex-1 px-4 py-3 bg-gray-900 dark:bg-slate-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Criar Tarefa
                        </button>
                        <button 
                          onClick={() => setShowForm(false)} 
                          className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition font-medium"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">✓</div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {filterPriority === 'all' ? 'Nenhuma tarefa pendente' : 'Nenhuma tarefa nesta categoria'}
                      </p>
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <div 
                        key={task.id} 
                        onClick={() => setSelectedTask(task)} 
                        className="group bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }} 
                            className="flex-shrink-0 mt-0.5"
                          >
                            {task.completed ? (
                              <div className="w-6 h-6 bg-gray-900 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm">✓</span>
                              </div>
                            ) : (
                              <div className="w-6 h-6 border-2 border-gray-300 dark:border-slate-600 rounded-lg hover:border-gray-900 dark:hover:border-slate-400 transition"></div>
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-sm font-semibold mb-1 ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${PRIORITIES[task.priority].color}`}>
                                {PRIORITIES[task.priority].label}
                              </span>
                              {task.dueDate && (
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${isOverdue(task.dueDate) && !task.completed ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-600'}`}>
                                  {new Date(task.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                </span>
                              )}
                              {task.tags.slice(0, 2).map((tag, i) => (
                                <span key={i} className="inline-flex items-center px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium border border-gray-200 dark:border-slate-600">
                                  {tag}
                                </span>
                              ))}
                              {task.tags.length > 2 && (
                                <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-medium border border-gray-200 dark:border-slate-600">
                                  +{task.tags.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} 
                            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition opacity-0 group-hover:opacity-100"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {tasks.filter(t => t.completed).length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Concluídas ({tasks.filter(t => t.completed).length})
                    </h3>
                    <div className="space-y-3">
                      {tasks.filter(t => t.completed).map((task) => (
                        <div 
                          key={task.id} 
                          onClick={() => setSelectedTask(task)} 
                          className="group bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 cursor-pointer hover:shadow-sm transition"
                        >
                          <div className="flex items-start gap-3">
                            <button onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}>
                              <div className="w-6 h-6 bg-gray-900 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm">✓</span>
                              </div>
                            </button>
                            <div className="flex-1 min-w-0">
                              <h3 className="line-through text-gray-500 dark:text-gray-400 text-sm font-semibold">
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">
                                  {task.description}
                                </p>
                              )}
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} 
                              className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition opacity-0 group-hover:opacity-100"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-6">Estatísticas</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Pendentes</span>
                    <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Concluídas</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedTask && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-slate-800">
              <div className="p-6 border-b border-gray-200 dark:border-slate-800">
                <div className="flex items-start justify-between gap-4">
                  <button 
                    onClick={() => toggleTask(selectedTask.id)} 
                    className="flex-shrink-0 mt-1"
                  >
                    {selectedTask.completed ? (
                      <div className="w-7 h-7 bg-gray-900 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                        <span className="text-white">✓</span>
                      </div>
                    ) : (
                      <div className="w-7 h-7 border-2 border-gray-300 dark:border-slate-600 rounded-lg hover:border-gray-900 dark:hover:border-slate-400 transition"></div>
                    )}
                  </button>
                  <input 
                    type="text" 
                    value={selectedTask.title} 
                    onChange={(e) => updateTask(selectedTask.id, { title: e.target.value })} 
                    className="flex-1 text-xl font-bold text-gray-900 dark:text-gray-100 bg-transparent outline-none border-b-2 border-transparent focus:border-gray-900 dark:focus:border-slate-600 px-0 py-1"
                  />
                  <button 
                    onClick={() => setSelectedTask(null)} 
                    className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                  >
                    <span className="text-gray-500 text-xl">✕</span>
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea 
                    value={selectedTask.description} 
                    onChange={(e) => updateTask(selectedTask.id, { description: e.target.value })} 
                    placeholder="Adicionar descrição" 
                    rows={3} 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prioridade
                    </label>
                    <select 
                      value={selectedTask.priority} 
                      onChange={(e) => updateTask(selectedTask.id, { priority: e.target.value as any })} 
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prazo
                    </label>
                    <input 
                      type="date" 
                      value={selectedTask.dueDate} 
                      onChange={(e) => updateTask(selectedTask.id, { dueDate: e.target.value })} 
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags
                    </label>
                    <input 
                      type="text" 
                      value={selectedTask.tags.join(', ')} 
                      onChange={(e) => updateTask(selectedTask.id, { tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })} 
                      placeholder="Backend, API" 
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-800">
                  <button 
                    onClick={() => deleteTask(selectedTask.id)} 
                    className="px-6 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition"
                  >
                    Excluir Tarefa
                  </button>
                  <button 
                    onClick={() => setSelectedTask(null)} 
                    className="ml-auto px-8 py-3 bg-gray-900 dark:bg-slate-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition font-medium"
                  >
                    Salvar e Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}