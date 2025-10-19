"use client";

import { useState } from 'react';
import { Plus, Folder, Users, Calendar, MoreVertical, TrendingUp } from 'lucide-react';

type ProjectStatus = 'active' | 'paused' | 'completed';

type Project = {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  team: string[];
  deadline: string;
  color: string;
  tasksTotal: number;
  tasksCompleted: number;
};

export default function ProjectsTemplate() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Redesign completo do site institucional',
      status: 'active',
      progress: 65,
      team: ['João Silva', 'Maria Santos', 'Pedro Costa'],
      deadline: '2025-02-15',
      color: 'bg-blue-500',
      tasksTotal: 24,
      tasksCompleted: 16
    },
    {
      id: 2,
      name: 'App Mobile',
      description: 'Desenvolvimento do aplicativo iOS e Android',
      status: 'active',
      progress: 40,
      team: ['Ana Lima', 'Carlos Souza'],
      deadline: '2025-03-20',
      color: 'bg-purple-500',
      tasksTotal: 32,
      tasksCompleted: 13
    },
    {
      id: 3,
      name: 'Marketing Q1',
      description: 'Campanhas de marketing para o primeiro trimestre',
      status: 'paused',
      progress: 25,
      team: ['Fernanda Costa'],
      deadline: '2025-01-30',
      color: 'bg-orange-500',
      tasksTotal: 15,
      tasksCompleted: 4
    },
    {
      id: 4,
      name: 'API Integration',
      description: 'Integração com APIs de terceiros',
      status: 'completed',
      progress: 100,
      team: ['Pedro Costa', 'João Silva'],
      deadline: '2025-01-15',
      color: 'bg-green-500',
      tasksTotal: 12,
      tasksCompleted: 12
    },
  ]);

  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  const addProject = () => {
    if (!newProject.name.trim()) return;

    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    setProjects([...projects, {
      id: Date.now(),
      name: newProject.name,
      description: newProject.description,
      status: 'active',
      progress: 0,
      team: [],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      color: randomColor,
      tasksTotal: 0,
      tasksCompleted: 0
    }]);

    setNewProject({ name: '', description: '' });
    setShowAddForm(false);
  };

  const getStatusBadge = (status: ProjectStatus) => {
    const badges = {
      active: { label: 'Ativo', class: 'bg-green-100 text-green-700' },
      paused: { label: 'Pausado', class: 'bg-yellow-100 text-yellow-700' },
      completed: { label: 'Concluído', class: 'bg-blue-100 text-blue-700' }
    };
    return badges[status];
  };

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4" />
            <span>{activeProjects} projeto{activeProjects !== 1 ? 's' : ''} ativo{activeProjects !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{completedProjects} concluído{completedProjects !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                view === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Grade
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Lista
            </button>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Projeto
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <input
            type="text"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            placeholder="Nome do projeto"
            className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <textarea
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            placeholder="Descrição"
            rows={2}
            className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={addProject}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
            >
              Criar Projeto
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

      {/* Projects Grid/List */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const badge = getStatusBadge(project.status);
            return (
              <div
                key={project.id}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 hover:shadow-sm transition cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${project.color} rounded-lg flex items-center justify-center`}>
                      <Folder className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${badge.class}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Progresso</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${project.color} h-2 rounded-full transition-all`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{project.team.length} membro{project.team.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{project.deadline}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                  {project.tasksCompleted} de {project.tasksTotal} tarefa{project.tasksTotal !== 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((project) => {
            const badge = getStatusBadge(project.status);
            return (
              <div
                key={project.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 ${project.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Folder className="w-5 h-5 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{project.description}</p>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${badge.class}`}>
                      {badge.label}
                    </span>

                    <div className="text-sm text-gray-600 text-right">
                      <div className="font-medium">{project.progress}%</div>
                      <div className="text-xs">{project.tasksCompleted}/{project.tasksTotal}</div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{project.team.length}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{project.deadline}</span>
                    </div>

                    <button className="opacity-0 group-hover:opacity-100 transition">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}