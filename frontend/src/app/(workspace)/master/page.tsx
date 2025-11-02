"use client";

import { useState, useEffect } from 'react';
import { Users, CreditCard, Tag, TrendingUp, Crown, Shield, BarChart3, DollarSign } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function MasterDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    promoCodesUsed: 0,
    freeUsers: 0,
    basicUsers: 0,
    proUsers: 0,
    enterpriseUsers: 0
  });

  useEffect(() => {
    // TODO: Fetch real stats from API
    setStats({
      totalUsers: 1250,
      activeSubscriptions: 450,
      totalRevenue: 125000,
      promoCodesUsed: 89,
      freeUsers: 800,
      basicUsers: 200,
      proUsers: 220,
      enterpriseUsers: 30
    });
  }, []);

  const quickActions = [
    {
      title: 'Gerenciar Usuários',
      description: 'Visualizar e gerenciar todos os usuários do sistema',
      icon: Users,
      href: '/master/users',
      color: 'blue'
    },
    {
      title: 'Assinaturas',
      description: 'Gerenciar planos e assinaturas de usuários',
      icon: CreditCard,
      href: '/master/subscriptions',
      color: 'purple'
    },
    {
      title: 'Códigos Promocionais',
      description: 'Criar e gerenciar códigos de desconto',
      icon: Tag,
      href: '/master/promo-codes',
      color: 'green'
    },
    {
      title: 'Analytics',
      description: 'Visualizar estatísticas e métricas do sistema',
      icon: BarChart3,
      href: '/analytics',
      color: 'orange'
    }
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400',
      hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400',
      hover: 'hover:bg-green-100 dark:hover:bg-green-900/30'
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      icon: 'text-orange-600 dark:text-orange-400',
      hover: 'hover:bg-orange-100 dark:hover:bg-orange-900/30'
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
          <Crown className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Painel Master
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Controle total do sistema Arc.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {stats.totalUsers.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total de Usuários
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {stats.activeSubscriptions.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Assinaturas Ativas
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            R$ {(stats.totalRevenue / 1000).toFixed(1)}k
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Receita Total (MRR)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <Tag className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {stats.promoCodesUsed}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Promos Utilizados
          </div>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Distribuição por Plano
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {stats.freeUsers}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Free</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {((stats.freeUsers / stats.totalUsers) * 100).toFixed(1)}%
            </div>
          </div>

          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">
              {stats.basicUsers}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">Basic</div>
            <div className="text-xs text-blue-500 dark:text-blue-500">
              {((stats.basicUsers / stats.totalUsers) * 100).toFixed(1)}%
            </div>
          </div>

          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-1">
              {stats.proUsers}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400 mb-2">Pro</div>
            <div className="text-xs text-purple-500 dark:text-purple-500">
              {((stats.proUsers / stats.totalUsers) * 100).toFixed(1)}%
            </div>
          </div>

          <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-1">
              {stats.enterpriseUsers}
            </div>
            <div className="text-sm text-amber-600 dark:text-amber-400 mb-2">Enterprise</div>
            <div className="text-xs text-amber-500 dark:text-amber-500">
              {((stats.enterpriseUsers / stats.totalUsers) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const colors = colorClasses[action.color as keyof typeof colorClasses];

            return (
              <Link
                key={action.href}
                href={action.href}
                className={`${colors.bg} ${colors.hover} p-6 rounded-xl border border-transparent hover:border-gray-300 dark:hover:border-slate-600 transition-all group`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
            Acesso Privilegiado
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Você está usando uma conta master com acesso total ao sistema. Todas as ações são registradas e monitoradas.
          </p>
        </div>
      </div>
    </div>
  );
}
