"use client";

import { useState } from 'react';
import { usePageTemplateData } from '@/core/hooks/usePageTemplateData';
import { WorkspaceTemplateComponentProps } from '@/core/types/workspace.types';
import {
  Plus, Trash2, DollarSign, TrendingUp, TrendingDown,
  Building2, Users, Briefcase, ShoppingBag, Zap, Settings,
  X, Save, PieChart, BarChart3
} from 'lucide-react';

type BudgetItem = {
  id: string;
  description: string;
  budgeted: number;
  actual: number;
  category: 'revenue' | 'cogs' | 'operating' | 'marketing' | 'rd' | 'admin';
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
};

type Budget = {
  year: number;
  company: string;
  items: BudgetItem[];
};

const CATEGORIES = [
  { id: 'revenue', name: 'Receitas', icon: TrendingUp, color: 'green', type: 'income' },
  { id: 'cogs', name: 'Custo de Vendas', icon: ShoppingBag, color: 'orange', type: 'expense' },
  { id: 'operating', name: 'Despesas Operacionais', icon: Settings, color: 'blue', type: 'expense' },
  { id: 'marketing', name: 'Marketing e Vendas', icon: Briefcase, color: 'purple', type: 'expense' },
  { id: 'rd', name: 'P&D / Tecnologia', icon: Zap, color: 'indigo', type: 'expense' },
  { id: 'admin', name: 'Administrativo', icon: Users, color: 'gray', type: 'expense' },
];

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

const DEFAULT_BUDGET: Budget = {
  year: new Date().getFullYear(),
  company: 'Minha Empresa',
  items: [
    { id: '1', description: 'Vendas de Produtos', budgeted: 500000, actual: 480000, category: 'revenue', quarter: 'Q1' },
    { id: '2', description: 'Vendas de Serviços', budgeted: 300000, actual: 320000, category: 'revenue', quarter: 'Q1' },
    { id: '3', description: 'Custo de Produção', budgeted: 200000, actual: 195000, category: 'cogs', quarter: 'Q1' },
    { id: '4', description: 'Salários', budgeted: 250000, actual: 250000, category: 'operating', quarter: 'Q1' },
    { id: '5', description: 'Campanhas Digitais', budgeted: 50000, actual: 55000, category: 'marketing', quarter: 'Q1' },
  ],
};

type BusinessBudgetData = {
  budget: Budget;
};

const DEFAULT_DATA: BusinessBudgetData = {
  budget: DEFAULT_BUDGET,
};

export default function BusinessBudgetTemplate({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData } = usePageTemplateData<BusinessBudgetData>(groupId, pageId, DEFAULT_DATA);
  const budget = data.budget ?? DEFAULT_BUDGET;

  const updateBudget = (updater: Budget | ((current: Budget) => Budget)) => {
    setData((current) => {
      const currentBudget = current.budget ?? DEFAULT_BUDGET;
      const nextBudget =
        typeof updater === 'function'
          ? (updater as (current: Budget) => Budget)(JSON.parse(JSON.stringify(currentBudget)))
          : updater;
      return {
        ...current,
        budget: nextBudget,
      };
    });
  };

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4' | 'all'>('all');
  const [newItem, setNewItem] = useState({
    description: '',
    budgeted: '',
    actual: '',
    category: 'revenue' as BudgetItem['category'],
    quarter: 'Q1' as BudgetItem['quarter'],
  });

  const addItem = () => {
    if (!newItem.description.trim()) return;
    updateBudget((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          id: `${Date.now()}`,
          description: newItem.description,
          budgeted: parseFloat(newItem.budgeted) || 0,
          actual: parseFloat(newItem.actual) || 0,
          category: newItem.category,
          quarter: newItem.quarter,
        },
      ],
    }));
    setNewItem({ description: '', budgeted: '', actual: '', category: 'revenue', quarter: 'Q1' });
    setShowAddForm(false);
  };

  const deleteItem = (id: string) => {
    updateBudget((current) => ({
      ...current,
      items: current.items.filter((item) => item.id !== id),
    }));
  };

  const filteredItems = selectedQuarter === 'all'
    ? budget.items
    : budget.items.filter(item => item.quarter === selectedQuarter);

  const totalRevenue = filteredItems
    .filter(item => CATEGORIES.find(c => c.id === item.category)?.type === 'income')
    .reduce((sum, item) => sum + item.actual, 0);

  const totalExpenses = filteredItems
    .filter(item => CATEGORIES.find(c => c.id === item.category)?.type === 'expense')
    .reduce((sum, item) => sum + item.actual, 0);

  const totalBudgetedRevenue = filteredItems
    .filter(item => CATEGORIES.find(c => c.id === item.category)?.type === 'income')
    .reduce((sum, item) => sum + item.budgeted, 0);

  const totalBudgetedExpenses = filteredItems
    .filter(item => CATEGORIES.find(c => c.id === item.category)?.type === 'expense')
    .reduce((sum, item) => sum + item.budgeted, 0);

  const netProfit = totalRevenue - totalExpenses;
  const budgetedProfit = totalBudgetedRevenue - totalBudgetedExpenses;
  const variance = netProfit - budgetedProfit;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  const expensesByCategory = CATEGORIES
    .filter(cat => cat.type === 'expense')
    .map(cat => ({
      ...cat,
      total: filteredItems
        .filter(item => item.category === cat.id)
        .reduce((sum, item) => sum + item.actual, 0),
    }))
    .filter(cat => cat.total > 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Orçamento Empresarial
        </h1>
        <div className="flex items-center gap-4">
          <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <p className="text-gray-600 dark:text-gray-300">{budget.company} • {budget.year}</p>
        </div>
      </div>

      {/* Quarter Selector */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setSelectedQuarter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedQuarter === 'all'
              ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          Anual
        </button>
        {QUARTERS.map((q) => (
          <button
            key={q}
            onClick={() => setSelectedQuarter(q as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedQuarter === q
                ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Receita Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            R$ {(totalRevenue / 1000).toFixed(0)}k
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Orçado: R$ {(totalBudgetedRevenue / 1000).toFixed(0)}k
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Despesas Totais</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            R$ {(totalExpenses / 1000).toFixed(0)}k
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Orçado: R$ {(totalBudgetedExpenses / 1000).toFixed(0)}k
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 ${netProfit >= 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-red-100 dark:bg-red-900/30'} rounded-lg flex items-center justify-center`}>
              <DollarSign className={`w-5 h-5 ${netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Lucro Líquido</span>
          </div>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            R$ {(netProfit / 1000).toFixed(0)}k
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Margem: {profitMargin}%
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 ${variance >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'} rounded-lg flex items-center justify-center`}>
              <BarChart3 className={`w-5 h-5 ${variance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`} />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Variância</span>
          </div>
          <p className={`text-2xl font-bold ${variance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
            {variance >= 0 ? '+' : ''}{(variance / 1000).toFixed(0)}k
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            vs. Orçado
          </p>
        </div>
      </div>

      {/* Add Button */}
      <div className="mb-4">
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar Linha
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-6 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Nova Linha Orçamentária</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Descrição"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value as BudgetItem['category'] })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Valor Orçado"
              value={newItem.budgeted}
              onChange={(e) => setNewItem({ ...newItem, budgeted: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <input
              type="number"
              placeholder="Valor Real"
              value={newItem.actual}
              onChange={(e) => setNewItem({ ...newItem, actual: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <select
              value={newItem.quarter}
              onChange={(e) => setNewItem({ ...newItem, quarter: e.target.value as BudgetItem['quarter'] })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {QUARTERS.map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addItem}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 inline mr-1" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Budget Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Trimestre
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Orçado
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Real
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Variância
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredItems.map((item) => {
                const category = CATEGORIES.find(c => c.id === item.category);
                const Icon = category?.icon || DollarSign;
                const variance = item.actual - item.budgeted;
                const isIncome = category?.type === 'income';

                return (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.description}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {category?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.quarter}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-gray-900 dark:text-white">
                        R$ {item.budgeted.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`text-sm font-medium ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        R$ {item.actual.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`text-sm font-medium ${
                        (isIncome && variance > 0) || (!isIncome && variance < 0)
                          ? 'text-green-600 dark:text-green-400'
                          : variance === 0
                          ? 'text-gray-600 dark:text-gray-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {variance >= 0 ? '+' : ''}R$ {variance.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Breakdown */}
      {expensesByCategory.length > 0 && (
        <div className="mt-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Distribuição de Despesas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {expensesByCategory.map((cat) => {
              const Icon = cat.icon;
              const percentage = totalExpenses > 0 ? ((cat.total / totalExpenses) * 100).toFixed(1) : '0';

              return (
                <div key={cat.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {cat.name}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    R$ {(cat.total / 1000).toFixed(0)}k
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {percentage}% do total
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
