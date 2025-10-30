"use client";

import Link from 'next/link';
import { FileText, Clock, FolderOpen, Plus, Sparkles, X, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { useWorkspaceStore } from '@/core/store/workspaceStore';
import { useState, useEffect } from 'react';
import { GROUP_PRESETS } from '@/core/types/workspace.types';

export default function WorkspaceHome() {
  const { workspace, workspaces, createWorkspace, renameWorkspace, deleteWorkspace, switchWorkspace, loadAllWorkspaces } = useWorkspaceStore();
  const [showQuickStart, setShowQuickStart] = useState(true);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);
  const [editingWorkspaceName, setEditingWorkspaceName] = useState('');
  const [workspaceMenuId, setWorkspaceMenuId] = useState<string | null>(null);

  useEffect(() => {
    loadAllWorkspaces();
  }, [loadAllWorkspaces]);

  const totalGroups = workspace?.groups.length || 0;
  const totalPages = workspace?.groups.reduce((sum, group) => sum + group.pages.length, 0) || 0;
  
  const recentPages = workspace?.groups
    .flatMap(group => 
      group.pages.map(page => ({
        ...page,
        groupId: group.id,
        groupName: group.name,
        groupIcon: group.icon,
      }))
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6) || [];

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `Há ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    if (hours < 24) return `Há ${hours} hora${hours !== 1 ? 's' : ''}`;
    if (days === 1) return 'Ontem';
    if (days < 7) return `Há ${days} dias`;
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const stats = [
    { 
      label: 'Grupos criados', 
      value: totalGroups.toString(), 
      icon: FolderOpen, 
      gradient: 'from-blue-500 to-cyan-500',
      bgLight: 'bg-blue-50',
      bgDark: 'dark:bg-blue-950/40',
      borderLight: 'border-blue-200',
      borderDark: 'dark:border-blue-800/50',
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    { 
      label: 'Páginas criadas', 
      value: totalPages.toString(), 
      icon: FileText, 
      gradient: 'from-purple-500 to-pink-500',
      bgLight: 'bg-purple-50',
      bgDark: 'dark:bg-purple-950/40',
      borderLight: 'border-purple-200',
      borderDark: 'dark:border-purple-800/50',
      iconBg: 'bg-purple-100 dark:bg-purple-900/40',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    { 
      label: 'Última atividade', 
      value: recentPages.length > 0 ? getRelativeTime(recentPages[0].updatedAt) : 'Nenhuma', 
      icon: Clock, 
      gradient: 'from-green-500 to-emerald-500',
      bgLight: 'bg-green-50',
      bgDark: 'dark:bg-green-950/40',
      borderLight: 'border-green-200',
      borderDark: 'dark:border-green-800/50',
      iconBg: 'bg-green-100 dark:bg-green-900/40',
      iconColor: 'text-green-600 dark:text-green-400'
    },
  ];

  const popularPresets = GROUP_PRESETS.filter(p =>
    ['freelancer-project', 'dev-project', 'student-subject', 'personal-goals'].includes(p.id)
  );

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    await createWorkspace(newWorkspaceName);
    setNewWorkspaceName('');
    setShowCreateWorkspace(false);
  };

  const handleRenameWorkspace = async (workspaceId: string) => {
    if (!editingWorkspaceName.trim()) return;
    await renameWorkspace(workspaceId, editingWorkspaceName);
    setEditingWorkspaceId(null);
    setEditingWorkspaceName('');
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    if (confirm('Tem certeza que deseja deletar este workspace? Esta ação não pode ser desfeita.')) {
      await deleteWorkspace(workspaceId);
      setWorkspaceMenuId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Meus Workspaces
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300">
            Gerencie todos os seus espaços de trabalho
          </p>
        </div>

        {/* All Workspaces */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Todos os Workspaces
            </h2>
            <button
              onClick={() => setShowCreateWorkspace(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold text-sm"
            >
              <Plus className="w-4 h-4" />
              Novo Workspace
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                className={`group relative bg-white dark:bg-gray-900 border-2 rounded-xl p-6 transition-all ${
                  workspace?.id === ws.id
                    ? 'border-blue-600 shadow-lg'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md'
                }`}
              >
                {editingWorkspaceId === ws.id ? (
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={editingWorkspaceName}
                      onChange={(e) => setEditingWorkspaceName(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameWorkspace(ws.id);
                        if (e.key === 'Escape') setEditingWorkspaceId(null);
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRenameWorkspace(ws.id)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditingWorkspaceId(null)}
                        className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition text-sm font-medium"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <h3
                        onClick={() => switchWorkspace(ws.id)}
                        className="text-lg font-bold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition"
                      >
                        {ws.name}
                      </h3>
                      <div className="relative">
                        <button
                          onClick={() => setWorkspaceMenuId(workspaceMenuId === ws.id ? null : ws.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>
                        {workspaceMenuId === ws.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => {
                                setEditingWorkspaceId(ws.id);
                                setEditingWorkspaceName(ws.name);
                                setWorkspaceMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg transition"
                            >
                              <Edit2 className="w-4 h-4" />
                              Renomear
                            </button>
                            {workspaces.length > 1 && (
                              <button
                                onClick={() => handleDeleteWorkspace(ws.id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                                Deletar
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FolderOpen className="w-4 h-4" />
                        <span>{ws.groups.length} grupos</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FileText className="w-4 h-4" />
                        <span>{ws.groups.reduce((sum, g) => sum + g.pages.length, 0)} páginas</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>Atualizado {getRelativeTime(ws.updatedAt)}</span>
                      </div>
                    </div>

                    {workspace?.id !== ws.id && (
                      <button
                        onClick={() => switchWorkspace(ws.id)}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
                      >
                        Abrir Workspace
                      </button>
                    )}
                    {workspace?.id === ws.id && (
                      <div className="text-center text-sm font-medium text-blue-600 dark:text-blue-400">
                        Workspace Atual
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Create Workspace Modal */}
        {showCreateWorkspace && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full border-2 border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Novo Workspace
                </h2>
                <button
                  onClick={() => setShowCreateWorkspace(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Crie um novo espaço de trabalho para organizar seus projetos
              </p>
              <input
                type="text"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="Nome do workspace"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 mb-6"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkspace()}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleCreateWorkspace}
                  disabled={!newWorkspaceName.trim()}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition font-semibold"
                >
                  Criar Workspace
                </button>
                <button
                  onClick={() => setShowCreateWorkspace(false)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Current Workspace Stats */}
        {workspace && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Workspace Atual: {workspace.name}
              </h2>
            </div>

            {/* Quick Start */}
            {totalGroups === 0 && showQuickStart && (
              <div className="mb-6 md:mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800/50 rounded-2xl p-4 md:p-8 relative">
            <button
              onClick={() => setShowQuickStart(false)}
              className="absolute top-3 md:top-4 right-3 md:right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-1"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              
              <div className="flex-1">
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 md:mb-2">
                  Comece sua jornada!
                </h2>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 md:mb-6">
                  Crie seu primeiro grupo e organize seus projetos, estudos ou tarefas pessoais.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {popularPresets.map((preset) => (
                    <Link
                      key={preset.id}
                      href="/workspace"
                      className="p-3 md:p-4 bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-xl hover:shadow-md hover:border-gray-300 dark:hover:border-slate-600 transition group"
                    >
                      <div className="text-2xl md:text-3xl mb-2">{preset.icon}</div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-xs md:text-sm mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-2">
                        {preset.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {preset.pages.length} pgs
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-900 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-black rounded-lg flex items-center justify-center border dark:border-gray-800">
                    <Icon className="w-5 h-5 text-gray-700 dark:text-white" />
                  </div>
                </div>
                <div className="text-3xl font-semibold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Pages */}
        {recentPages.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                Páginas Recentes
              </h2>
              <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                {recentPages.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentPages.map((page) => (
                <Link
                  key={page.id}
                  href={`/workspace/group/${page.groupId}/page/${page.id}`}
                  className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-900 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="text-2xl flex-shrink-0">{page.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                        {page.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-300">
                        <span>{page.groupIcon}</span>
                        <span className="truncate">{page.groupName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-300">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{getRelativeTime(page.updatedAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          totalGroups > 0 && (
            <div className="text-center py-12 md:py-16">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 md:w-10 md:h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Nenhuma página ainda
              </h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6">
                Adicione páginas aos seus grupos para começar
              </p>
            </div>
          )
        )}

        {/* Grupos Vazios */}
        {workspace?.groups.some(g => g.pages.length === 0) && (
          <div className="mt-8 md:mt-12">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-6">
              Grupos sem Páginas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspace.groups
                .filter(g => g.pages.length === 0)
                .map((group) => (
                  <div
                    key={group.id}
                    className="p-4 md:p-6 bg-gray-50 dark:bg-slate-800/30 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl hover:border-gray-400 dark:hover:border-slate-600 transition"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl md:text-3xl flex-shrink-0">{group.icon}</span>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm md:text-base truncate">
                        {group.name}
                      </h3>
                    </div>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Adicione a primeira página
                    </p>
                    <Link
                      href="/workspace"
                      className="inline-flex items-center gap-2 text-xs md:text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Página
                    </Link>
                  </div>
                ))}
            </div>
            </div>
            )}

            {/* Call to Action */}
            {totalGroups === 0 && !showQuickStart && (
          <div className="text-center py-12 md:py-20">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-xl">
              <Plus className="w-10 h-10 md:w-12 md:h-12 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 md:mb-4">
              Seu workspace está vazio
            </h2>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6 md:mb-8 max-w-md mx-auto px-4">
              Comece criando seu primeiro grupo. Organize projetos, estudos ou tarefas do seu jeito!
            </p>
            <Link
              href="/workspace"
              className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition font-semibold shadow-lg text-sm md:text-base"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              Criar Primeiro Grupo
              </Link>
            </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}