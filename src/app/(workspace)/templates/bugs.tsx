"use client";

import { useState } from 'react';
import { Plus, Bug, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

type BugStatus = 'open' | 'in_progress' | 'resolved';
type BugPriority = 'low' | 'medium' | 'high' | 'critical';

type BugItem = {
  id: number;
  title: string;
  description: string;
  status: BugStatus;
  priority: BugPriority;
  assignee?: string;
  createdAt: string;
};

export default function BugsTemplate() {
  const [bugs, setBugs] = useState<BugItem[]>([
    {
      id: 1,
      title: 'Botão de login não funciona no Safari',
      description: 'Usuários relatam que o botão não responde',
      status: 'open',
      priority: 'high',
      assignee: 'João Silva',
      createdAt: '2025-01-18'
    },
    {
      id: 2,
      title: 'Erro 500 ao criar projeto',
      description: 'API retorna erro interno',
      status: 'in_progress',
      priority: 'critical',
      assignee: 'Maria Santos',
      createdAt: '2025-01-17'
    },
    {
      id: 3,
      title: 'Layout quebrado em mobile',
      description: 'Sidebar não fecha corretamente',
      status: 'resolved',
      priority: 'medium',
      assignee: 'Pedro Costa',
      createdAt: '2025-01-15'
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newBug, setNewBug] = useState({
    title: '',
    description: '',
    priority: 'medium' as BugPriority
  });

  const addBug = () => {
    if (!newBug.title.trim()) return;

    setBugs([...bugs, {
      id: Date.now(),
      title: newBug.title,
      description: newBug.description,
      status: 'open',
      priority: newBug.priority,
      createdAt: new Date().toISOString().split('T')[0]
    }]);

    setNewBug({ title: '', description: '', priority: 'medium' });
    setShowAddForm(false);
  };

  const updateStatus = (id: number, status: BugStatus) => {
    setBugs(bugs.map(bug => bug.id === id ? { ...bug, status } : bug));
  };

  const getPriorityColor = (priority: BugPriority) => {
    const colors = {
      low: 'bg-blue-100 text-blue-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700'
    };
    return colors[priority];
  };

  const getStatusIcon = (status: BugStatus) => {
    switch(status) {
      case 'open': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'resolved': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusLabel = (status: BugStatus) => {
    const labels = {
      open: 'Aberto',
      in_progress: 'Em Progresso',
      resolved: 'Resolvido'
    };
    return labels[status];
  };

  const openCount = bugs.filter(b => b.status === 'open').length;
  const inProgressCount = bugs.filter(b => b.status === 'in_progress').length;
  const resolvedCount = bugs.filter(b => b.status === 'resolved').length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Stats */}
      <div className="flex items-center gap-6 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-gray-600">{openCount} aberto{openCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-yellow-500" />
          <span className="text-gray-600">{inProgressCount} em progresso</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-gray-600">{resolvedCount} resolvido{resolvedCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="mb-6 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Reportar Bug
      </button>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <input
            type="text"
            value={newBug.title}
            onChange={(e) => setNewBug({ ...newBug, title: e.target.value })}
            placeholder="Título do bug"
            className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <textarea
            value={newBug.description}
            onChange={(e) => setNewBug({ ...newBug, description: e.target.value })}
            placeholder="Descrição detalhada"
            rows={3}
            className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
          />
          <div className="flex items-center gap-3">
            <select
              value={newBug.priority}
              onChange={(e) => setNewBug({ ...newBug, priority: e.target.value as BugPriority })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
            <button
              onClick={addBug}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
            >
              Adicionar
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Bugs List */}
      <div className="space-y-3">
        {bugs.map((bug) => (
          <div
            key={bug.id}
            className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                <Bug className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-gray-900 font-medium mb-1">{bug.title}</h3>
                  <p className="text-sm text-gray-600">{bug.description}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(bug.priority)}`}>
                {bug.priority === 'low' && 'Baixa'}
                {bug.priority === 'medium' && 'Média'}
                {bug.priority === 'high' && 'Alta'}
                {bug.priority === 'critical' && 'Crítica'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{bug.createdAt}</span>
                {bug.assignee && <span>• {bug.assignee}</span>}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateStatus(bug.id, 'open')}
                  className={`px-3 py-1 rounded text-xs font-medium transition ${
                    bug.status === 'open' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Aberto
                </button>
                <button
                  onClick={() => updateStatus(bug.id, 'in_progress')}
                  className={`px-3 py-1 rounded text-xs font-medium transition ${
                    bug.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Em Progresso
                </button>
                <button
                  onClick={() => updateStatus(bug.id, 'resolved')}
                  className={`px-3 py-1 rounded text-xs font-medium transition ${
                    bug.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Resolvido
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}