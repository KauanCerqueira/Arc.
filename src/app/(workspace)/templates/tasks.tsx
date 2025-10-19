"use client";

import { useState } from 'react';
import { Plus, Check, Circle, Clock } from 'lucide-react';

type Task = {
  id: number;
  title: string;
  completed: boolean;
  date?: string;
};

export default function TasksTemplate() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Revisar documentação', completed: false, date: '2025-01-20' },
    { id: 2, title: 'Implementar feature X', completed: true, date: '2025-01-19' },
    { id: 3, title: 'Reunião com cliente', completed: false, date: '2025-01-21' },
  ]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const addTask = () => {
    if (!newTask.trim()) return;
    
    setTasks([...tasks, {
      id: Date.now(),
      title: newTask,
      completed: false,
    }]);
    setNewTask('');
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const pendingCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Stats */}
      <div className="flex items-center gap-6 mb-6 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{pendingCount} pendente{pendingCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{tasks.length - pendingCount} concluída{tasks.length - pendingCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
            filter === 'all' 
              ? 'bg-gray-900 dark:bg-slate-700 text-white' 
              : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
            filter === 'pending' 
              ? 'bg-gray-900 dark:bg-slate-700 text-white' 
              : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
          }`}
        >
          Pendentes
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
            filter === 'completed' 
              ? 'bg-gray-900 dark:bg-slate-700 text-white' 
              : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
          }`}
        >
          Concluídas
        </button>
      </div>

      {/* Add Task */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          placeholder="Adicionar tarefa..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        />
        <button
          onClick={addTask}
          className="px-4 py-2 bg-gray-900 dark:bg-slate-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-slate-600 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition group"
          >
            <button
              onClick={() => toggleTask(task.id)}
              className="flex-shrink-0"
            >
              {task.completed ? (
                <div className="w-5 h-5 bg-green-500 dark:bg-green-600 rounded flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              ) : (
                <Circle className="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400" />
              )}
            </button>

            <div className="flex-1">
              <div className={`${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                {task.title}
              </div>
              {task.date && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.date}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Nenhuma tarefa {filter === 'pending' ? 'pendente' : filter === 'completed' ? 'concluída' : ''}
        </div>
      )}
    </div>
  );
}