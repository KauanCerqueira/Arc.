"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/core/store/authStore';
import { useRouter } from 'next/navigation';
import {
  Users, TrendingUp, Briefcase, Globe,
  Calendar, BarChart3, PieChart, Activity
} from 'lucide-react';

interface Analytics {
  totalUsers: number;
  activeUsers: number;
  totalWorkspaces: number;
  totalProjects: number;
  userGrowth: { month: string; count: number }[];
  professionDistribution: { profissao: string; count: number }[];
  sourceDistribution: { source: string; count: number }[];
  recentUsers: {
    nome: string;
    sobrenome: string;
    email: string;
    profissao: string | null;
    comoConheceu: string | null;
    criadoEm: string;
  }[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is master
    if (user && !user.isMaster) {
      console.log('❌ Usuário não é master:', user);
      router.push('/workspace');
      return;
    }

    if (user && user.isMaster) {
      console.log('✅ Usuário é master, carregando analytics...');
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('auth_token'); // Corrigido: auth_token (com underscore)
      console.log('🔑 Token:', token ? 'existe' : 'não existe');
      console.log('🌐 API URL:', process.env.NEXT_PUBLIC_API_URL);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', errorText);
        throw new Error(`Erro ao buscar analytics: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Analytics carregado:', data);
      setAnalytics(data);
    } catch (err: any) {
      console.error('❌ Erro completo:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="text-gray-600 dark:text-gray-400">Carregando analytics...</div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950 p-4">
        <div className="text-red-600 dark:text-red-400 text-center mb-4">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="font-semibold text-lg mb-2">Erro ao carregar Analytics</div>
          <div className="text-sm">{error || 'Não foi possível carregar os dados'}</div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visão geral das métricas do sistema
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Usuários</div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalUsers}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {analytics.activeUsers} ativos
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Workspaces</div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalWorkspaces}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Projetos</div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalProjects}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Crescimento</div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {analytics.userGrowth[analytics.userGrowth.length - 1]?.count || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Último mês</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* User Growth Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Crescimento de Usuários
            </h3>
            <div className="space-y-3">
              {analytics.userGrowth.slice(-6).map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">{item.month}</div>
                  <div className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-full flex items-center justify-end px-2"
                      style={{
                        width: `${(item.count / Math.max(...analytics.userGrowth.map(g => g.count))) * 100}%`,
                      }}
                    >
                      <span className="text-xs font-semibold text-white">{item.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Profession Distribution */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Distribuição de Profissões
            </h3>
            <div className="space-y-2">
              {analytics.professionDistribution.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.profissao}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Source Distribution */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Como nos Conheceram
            </h3>
            <div className="space-y-3">
              {analytics.sourceDistribution.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20">{item.source}</div>
                  <div className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-green-600 dark:bg-green-500 h-full flex items-center justify-end px-2"
                      style={{
                        width: `${(item.count / Math.max(...analytics.sourceDistribution.map(s => s.count))) * 100}%`,
                      }}
                    >
                      <span className="text-xs font-semibold text-white">{item.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Usuários Recentes
            </h3>
            <div className="space-y-3">
              {analytics.recentUsers.slice(0, 5).map((user, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-slate-800 last:border-0">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {user.nome[0]}{user.sobrenome[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.nome} {user.sobrenome}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                    {user.profissao && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{user.profissao}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
