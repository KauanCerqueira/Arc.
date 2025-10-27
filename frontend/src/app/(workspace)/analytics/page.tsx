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
      router.push('/workspace');
      return;
    }

    fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Carregando analytics...</div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Erro: {error || 'Não foi possível carregar os dados'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Visão geral das métricas do sistema
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">Total de Usuários</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{analytics.totalUsers}</div>
            <div className="text-sm text-gray-500 mt-1">
              {analytics.activeUsers} ativos
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">Workspaces</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{analytics.totalWorkspaces}</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">Projetos</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{analytics.totalProjects}</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">Crescimento</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {analytics.userGrowth[analytics.userGrowth.length - 1]?.count || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">Último mês</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Crescimento de Usuários
            </h3>
            <div className="space-y-3">
              {analytics.userGrowth.slice(-6).map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-600 w-20">{item.month}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full flex items-center justify-end px-2"
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
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Distribuição de Profissões
            </h3>
            <div className="space-y-2">
              {analytics.professionDistribution.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{item.profissao}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Source Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Como nos Conheceram
            </h3>
            <div className="space-y-3">
              {analytics.sourceDistribution.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-700 w-20">{item.source}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-green-600 h-full flex items-center justify-end px-2"
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
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Usuários Recentes
            </h3>
            <div className="space-y-3">
              {analytics.recentUsers.slice(0, 5).map((user, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-gray-600">
                      {user.nome[0]}{user.sobrenome[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {user.nome} {user.sobrenome}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                    {user.profissao && (
                      <div className="text-xs text-gray-600 mt-1">{user.profissao}</div>
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
