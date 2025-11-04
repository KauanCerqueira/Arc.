"use client";

import Link from 'next/link';
import {
  FileText,
  Clock,
  FolderOpen,
  Plus,
  Star,
  TrendingUp,
  Calendar,
  Activity,
  BarChart3,
  Users,
  Target,
  ArrowRight,
  Settings,
  Shield,
  UserPlus
} from 'lucide-react';
import { useWorkspaceStore } from '@/core/store/workspaceStore';
import { useState, useEffect, useMemo } from 'react';
import { getPageIcon } from '../components/sidebar/pageIcons';

export default function WorkspaceHome() {
  const { workspace, getFavoritePages } = useWorkspaceStore();

  const totalGroups = workspace?.groups.length || 0;
  const totalPages = workspace?.groups.reduce((sum, group) => sum + group.pages.length, 0) || 0;
  const favoritePages = getFavoritePages();

  const recentPages = useMemo(() => {
    return workspace?.groups
      .flatMap(group =>
        group.pages.map(page => ({
          ...page,
          groupId: group.id,
          groupName: group.name,
          groupIcon: group.icon,
        }))
      )
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 8) || [];
  }, [workspace]);

  // Estatísticas por grupo
  const groupStats = useMemo(() => {
    return workspace?.groups.map(group => ({
      ...group,
      pageCount: group.pages.length,
      lastUpdated: group.pages.length > 0
        ? new Date(Math.max(...group.pages.map(p => new Date(p.updatedAt).getTime())))
        : new Date(group.createdAt)
    }))
    .sort((a, b) => b.pageCount - a.pageCount)
    .slice(0, 6) || [];
  }, [workspace]);

  // Atividade recente (últimos 7 dias)
  const recentActivity = useMemo(() => {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    return workspace?.groups
      .flatMap(group =>
        group.pages
          .filter(page => new Date(page.updatedAt) >= last7Days)
          .map(page => ({ ...page, groupName: group.name }))
      )
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5) || [];
  }, [workspace]);

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days}d`;
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const stats = [
    {
      label: 'Total de Grupos',
      value: totalGroups.toString(),
      icon: FolderOpen,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      trend: '+2 este mês'
    },
    {
      label: 'Total de Páginas',
      value: totalPages.toString(),
      icon: FileText,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      trend: `${recentActivity.length} novos`
    },
    {
      label: 'Páginas Favoritas',
      value: favoritePages.length.toString(),
      icon: Star,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      trend: 'Acesso rápido'
    },
    {
      label: 'Atividade Recente',
      value: recentActivity.length.toString(),
      icon: Activity,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
      trend: 'Últimos 7 dias'
    },
  ];

  if (!workspace) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 dark:border-slate-700 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Bem-vindo ao <span className="font-semibold text-gray-900 dark:text-white">{workspace.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {stat.label}
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <TrendingUp className="w-3 h-3" />
                  <span>{stat.trend}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions - Team Management (Arc style) */}
        <div className="rounded-xl p-6 border border-arc bg-arc-secondary">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg border border-arc flex items-center justify-center">
                  <Users className="w-5 h-5 text-arc" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-arc">Gerenciar time.</h3>
                  <p className="text-sm text-arc-muted">Convites, permissões e funções de equipe</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
                <div className="rounded-md px-3 py-2 border border-arc">
                  <div className="flex items-center gap-2 text-sm text-arc">
                    <UserPlus className="w-4 h-4 text-arc-muted" />
                    <span className="text-arc-muted">Convidar membros</span>
                  </div>
                </div>
                <div className="rounded-md px-3 py-2 border border-arc">
                  <div className="flex items-center gap-2 text-sm text-arc">
                    <Shield className="w-4 h-4 text-arc-muted" />
                    <span className="text-arc-muted">Configurar permissões</span>
                  </div>
                </div>
                <div className="rounded-md px-3 py-2 border border-arc">
                  <div className="flex items-center gap-2 text-sm text-arc">
                    <Settings className="w-4 h-4 text-arc-muted" />
                    <span className="text-arc-muted">Gerenciar funções</span>
                  </div>
                </div>
              </div>
            </div>
            <Link
              href="/settings/team"
              className="ml-6 px-4 py-2 rounded-[8px] border border-arc text-arc hover:bg-arc-secondary transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              Acessar
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Páginas Favoritas */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Páginas Favoritas
                  </h2>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{favoritePages.length}</span>
              </div>

              {favoritePages.length > 0 ? (
                <div className="space-y-2">
                  {favoritePages.slice(0, 5).map(({ group, page }) => {
                    const iconConfig = getPageIcon(page.template || 'blank');
                    const IconComponent = iconConfig.icon;
                    return (
                      <Link
                        key={page.id}
                        href={`/workspace/group/${group.id}/page/${page.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group"
                      >
                        <div className={`w-10 h-10 rounded-lg ${iconConfig.bgColor} ${iconConfig.bgColorDark} flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className={`w-5 h-5 ${iconConfig.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {page.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {group.name}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 flex-shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">Nenhuma página favorita ainda</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Adicione páginas aos favoritos para acesso rápido</p>
                </div>
              )}
            </div>
          </div>

          {/* Atividade Recente */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Atividade Recente
              </h2>
            </div>

            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((page) => (
                  <div key={page.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {page.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {page.groupName}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {getRelativeTime(page.updatedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma atividade recente</p>
              </div>
            )}
          </div>
        </div>

        {/* Grupos Overview */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Visão Geral dos Grupos
              </h2>
            </div>
          </div>

          {groupStats.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupStats.map((group) => (
                <Link
                  key={group.id}
                  href="/workspace"
                  className="group p-4 border-2 border-gray-200 dark:border-slate-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{group.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {group.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {group.pageCount} {group.pageCount === 1 ? 'página' : 'páginas'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{getRelativeTime(group.lastUpdated)}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${Math.min((group.pageCount / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Nenhum grupo criado
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Comece criando seu primeiro grupo para organizar suas páginas
              </p>
              <Link
                href="/workspace"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
              >
                <Plus className="w-5 h-5" />
                Criar Primeiro Grupo
              </Link>
            </div>
          )}
        </div>

        {/* Páginas Recentes */}
        {recentPages.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Páginas Recentes
                </h2>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{recentPages.length}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentPages.map((page) => {
                const iconConfig = getPageIcon(page.template || 'blank');
                const IconComponent = iconConfig.icon;
                return (
                  <Link
                    key={page.id}
                    href={`/workspace/group/${page.groupId}/page/${page.id}`}
                    className="group p-4 border border-gray-200 dark:border-slate-800 rounded-lg hover:border-gray-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg ${iconConfig.bgColor} ${iconConfig.bgColorDark} flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className={`w-5 h-5 ${iconConfig.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {page.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {page.groupName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{getRelativeTime(page.updatedAt)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
