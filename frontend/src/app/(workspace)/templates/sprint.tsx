"use client";

import { useState } from 'react';
import { Plus, Calendar, Target, TrendingUp } from 'lucide-react';

type SprintTask = {
  id: number;
  title: string;
  points: number;
  status: 'backlog' | 'todo' | 'in_progress' | 'done';
  assignee?: string;
};

export default function SprintTemplate() {
  const [sprintName, setSprintName] = useState('Sprint 1');
  const [sprintGoal, setSprintGoal] = useState('Implementar autenticação e dashboard inicial');
  const [startDate] = useState('2025-01-20');
  const [endDate] = useState('2025-02-03');
  
  const [tasks, setTasks] = useState<SprintTask[]>([
    { id: 1, title: 'Criar tela de login', points: 5, status: 'done', assignee: 'João' },
    { id: 2, title: 'Implementar API de auth', points: 8, status: 'done', assignee: 'Maria' },
    { id: 3, title: 'Dashboard principal', points: 13, status: 'in_progress', assignee: 'Pedro' },
    { id: 4, title: 'Testes unitários', points: 5, status: 'todo', assignee: 'Ana' },
    { id: 5, title: 'Documentação API', points: 3, status: 'todo' },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', points: 5 });

  const addTask = () => {
    if (!newTask.title.trim()) return;

    setTasks([...tasks, {
      id: Date.now(),
      title: newTask.title,
      points: newTask.points,
      status: 'backlog'
    }]);

    setNewTask({ title: '', points: 5 });
    setShowAddForm(false);
  };

  const updateTaskStatus = (id: number, status: SprintTask['status']) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, status } : task));
  };

  const totalPoints = tasks.reduce((sum, task) => sum + task.points, 0);
  const completedPoints = tasks
    .filter(task => task.status === 'done')
    .reduce((sum, task) => sum + task.points, 0);
  const progress = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  const getStatusColor = (status: SprintTask['status']) => {
    const colors = {
      backlog: 'bg-gray-100 text-gray-700 border-gray-300',
      todo: 'bg-blue-100 text-blue-700 border-blue-300',
      in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      done: 'bg-green-100 text-green-700 border-green-300'
    };
    return colors[status];
  };

  const getStatusLabel = (status: SprintTask['status']) => {
    const labels = {
      backlog: 'Backlog',
      todo: 'A Fazer',
      in_progress: 'Em Progresso',
      done: 'Concluído'
    };
    return labels[status];
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header do Sprint */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={sprintName}
              onChange={(e) => setSprintName(e.target.value)}
              className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none w-full mb-2"
            />
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{startDate} - {endDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                <span>{totalPoints} pontos totais</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meta do Sprint
          </label>
          <textarea
            value={sprintGoal}
            onChange={(e) => setSprintGoal(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Progresso</span>
            <span className="text-gray-600">{completedPoints} / {totalPoints} pontos ({progress}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { status: 'backlog', label: 'Backlog', color: 'from-gray-50 to-slate-50 border-gray-200' },
          { status: 'todo', label: 'A Fazer', color: 'from-blue-50 to-sky-50 border-blue-200' },
          { status: 'in_progress', label: 'Em Progresso', color: 'from-yellow-50 to-amber-50 border-yellow-200' },
          { status: 'done', label: 'Concluído', color: 'from-green-50 to-emerald-50 border-green-200' }
        ].map(({ status, label, color }) => {
          const count = tasks.filter(t => t.status === status).length;
          const points = tasks.filter(t => t.status === status).reduce((sum, t) => sum + t.points, 0);
          
          return (
            <div key={status} className={`bg-gradient-to-br ${color} border rounded-xl p-4`}>
              <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-xs text-gray-500 mt-1">{points} pontos</div>
            </div>
          );
        })}
      </div>

      {/* Add Button */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="mb-6 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Adicionar Tarefa
      </button>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título da Tarefa
              </label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Ex: Criar componente de usuário"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story Points
              </label>
              <select
                value={newTask.points}
                onChange={(e) => setNewTask({ ...newTask, points: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                {[1, 2, 3, 5, 8, 13, 21].map(p => (
                  <option key={p} value={p}>{p} pontos</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={addTask}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
            >
              Adicionar
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition"
          >
            <div className="flex-1">
              <div className="font-medium text-gray-900 mb-1">{task.title}</div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {task.points} pts
                </span>
                {task.assignee && (
                  <span>• {task.assignee}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {['backlog', 'todo', 'in_progress', 'done'].map((status) => (
                <button
                  key={status}
                  onClick={() => updateTaskStatus(task.id, status as SprintTask['status'])}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    task.status === status
                      ? getStatusColor(status as SprintTask['status'])
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {getStatusLabel(status as SprintTask['status'])}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}