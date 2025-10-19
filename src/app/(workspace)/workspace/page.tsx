"use client";

import Link from 'next/link';
import { FileText, Clock, TrendingUp } from 'lucide-react';

export default function WorkspaceHome() {
  const recentPages = [
    { id: 1, name: 'Roadmap e Tarefas', template: 'kanban', updatedAt: 'Há 2 horas', icon: '📋' },
    { id: 2, name: 'Bugs do Projeto', template: 'bugs', updatedAt: 'Ontem', icon: '🐛' },
    { id: 3, name: 'Clientes 2025', template: 'table', updatedAt: 'Há 3 dias', icon: '📊' },
    { id: 4, name: 'Minhas Tarefas', template: 'tasks', updatedAt: 'Há 1 semana', icon: '✅' },
  ];

  const stats = [
    { label: 'Páginas criadas', value: '12', icon: FileText, color: 'bg-blue-100 text-blue-600' },
    { label: 'Tarefas concluídas', value: '45', icon: TrendingUp, color: 'bg-green-100 text-green-600' },
    { label: 'Horas trabalhadas', value: '24h', icon: Clock, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo de volta!</h1>
        <p className="text-gray-600">Continue de onde parou</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Pages */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Páginas recentes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentPages.map((page) => (
            <Link
              key={page.id}
              href={`/workspace/page/${page.id}?template=${page.template}`}
              className="group bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 hover:shadow-sm transition"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{page.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition">
                    {page.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Editado {page.updatedAt}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}