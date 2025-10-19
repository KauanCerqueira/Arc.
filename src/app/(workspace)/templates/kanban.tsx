"use client";

import { useState } from 'react';
import { Plus, MoreVertical, User } from 'lucide-react';

type Task = {
  id: number;
  title: string;
  description?: string;
  assignee?: string;
  priority?: 'low' | 'medium' | 'high';
};

type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

export default function KanbanTemplate() {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'todo',
      title: 'A Fazer',
      tasks: [
        { id: 1, title: 'Design da landing page', assignee: 'João Silva', priority: 'high' },
        { id: 2, title: 'Configurar banco de dados', assignee: 'Maria Santos', priority: 'medium' },
      ]
    },
    {
      id: 'in_progress',
      title: 'Em Progresso',
      tasks: [
        { id: 3, title: 'Implementar autenticação', assignee: 'Pedro Costa', priority: 'high' },
      ]
    },
    {
      id: 'review',
      title: 'Em Revisão',
      tasks: [
        { id: 4, title: 'Criar componentes do dashboard', assignee: 'Ana Lima', priority: 'medium' },
      ]
    },
    {
      id: 'done',
      title: 'Concluído',
      tasks: [
        { id: 5, title: 'Setup do projeto', assignee: 'João Silva', priority: 'low' },
      ]
    },
  ]);

  const [newTaskColumn, setNewTaskColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const addTask = (columnId: string) => {
    if (!newTaskTitle.trim()) return;

    setColumns(columns.map(col => {
      if (col.id === columnId) {
        return {
          ...col,
          tasks: [...col.tasks, {
            id: Date.now(),
            title: newTaskTitle,
            priority: 'medium'
          }]
        };
      }
      return col;
    }));

    setNewTaskTitle('');
    setNewTaskColumn(null);
  };

  const getPriorityColor = (priority?: 'low' | 'medium' | 'high') => {
    const colors = {
      low: 'bg-blue-100 text-blue-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-red-100 text-red-700'
    };
    return priority ? colors[priority] : 'bg-gray-100 text-gray-700';
  };

  const getColumnColor = (columnId: string) => {
    const colors = {
      todo: 'border-t-gray-400',
      in_progress: 'border-t-blue-500',
      review: 'border-t-yellow-500',
      done: 'border-t-green-500'
    };
    return colors[columnId as keyof typeof colors];
  };

  return (
    <div className="h-full overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80">
            {/* Column Header */}
            <div className={`bg-white border-t-4 ${getColumnColor(column.id)} rounded-t-lg p-4 border-x border-gray-200`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <span className="text-sm text-gray-500">{column.tasks.length}</span>
              </div>
              
              {newTaskColumn === column.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask(column.id)}
                    placeholder="Título da tarefa..."
                    autoFocus
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => addTask(column.id)}
                      className="px-3 py-1 text-sm bg-gray-900 text-white rounded hover:bg-gray-800 transition"
                    >
                      Adicionar
                    </button>
                    <button
                      onClick={() => {
                        setNewTaskColumn(null);
                        setNewTaskTitle('');
                      }}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setNewTaskColumn(column.id)}
                  className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar tarefa
                </button>
              )}
            </div>

            {/* Tasks */}
            <div className="space-y-3 p-4 bg-gray-50 border-x border-b border-gray-200 rounded-b-lg min-h-[400px]">
              {column.tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900 flex-1">
                      {task.title}
                    </h4>
                    <button className="opacity-0 group-hover:opacity-100 transition">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  {task.description && (
                    <p className="text-xs text-gray-600 mb-3">{task.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    {task.assignee && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <User className="w-3 h-3" />
                        <span>{task.assignee}</span>
                      </div>
                    )}
                    
                    {task.priority && (
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'low' && 'Baixa'}
                        {task.priority === 'medium' && 'Média'}
                        {task.priority === 'high' && 'Alta'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}