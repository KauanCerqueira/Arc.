"use client";

import Link from 'next/link';
import { FileText, Clock, TrendingUp, FolderOpen, Plus, Sparkles, X } from 'lucide-react';
import { useWorkspaceStore } from '@/core/store/workspaceStore';
import { useState } from 'react';
import { GROUP_PRESETS } from '@/core/types/workspace.types';

export default function WorkspaceHome() {
  const { workspace } = useWorkspaceStore();
  const [showQuickStart, setShowQuickStart] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1 md:mb-2">
            Bem-vindo de volta!
          </h1>
          <p className="text-sm md:text-lg text-gray-600 dark:text-gray-400">
            {workspace?.name || 'Meu Workspace'}
          </p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label} 
                className={`${stat.bgLight} ${stat.bgDark} border-2 ${stat.borderLight} ${stat.borderDark} rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition`}
              >
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.iconBg} rounded-xl flex items-center justify-center shadow-sm`}>
                    <Icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {recentPages.map((page) => (
                <Link
                  key={page.id}
                  href={`/workspace/group/${page.groupId}/page/${page.id}`}
                  className="group bg-white dark:bg-slate-800/50 border-2 border-gray-200 dark:border-slate-700/50 rounded-xl p-4 md:p-5 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-lg transition"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-2xl md:text-3xl flex-shrink-0">{page.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate text-sm md:text-base">
                        {page.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{page.groupIcon}</span>
                        <span className="truncate">{page.groupName}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 dark:text-gray-400">
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
      </div>
    </div>
  );
}