"use client";

import { useState } from 'react';
import { usePageTemplateData } from '@/core/hooks/usePageTemplateData';
import { WorkspaceTemplateComponentProps } from '@/core/types/workspace.types';
import {
  Plus, Trash2, DollarSign, TrendingUp, TrendingDown,
  Wallet, ShoppingCart, Home, Car, Utensils, Heart,
  Plane, Smartphone, Edit2, X, Save
} from 'lucide-react';

type Expense = {
  id: string;
  description: string;
  amount: number;
  category: 'housing' | 'food' | 'transport' | 'health' | 'entertainment' | 'education' | 'other';
  type: 'fixed' | 'variable';
  paid: boolean;
};

type Income = {
  id: string;
  source: string;
  amount: number;
};

type Budget = {
  month: string;
  incomes: Income[];
  expenses: Expense[];
  savingsGoal: number;
};

const CATEGORIES = [
  { id: 'housing', name: 'Moradia', icon: Home, color: 'blue' },
  { id: 'food', name: 'Alimentação', icon: Utensils, color: 'green' },
  { id: 'transport', name: 'Transporte', icon: Car, color: 'purple' },
  { id: 'health', name: 'Saúde', icon: Heart, color: 'red' },
  { id: 'entertainment', name: 'Lazer', icon: Plane, color: 'orange' },
  { id: 'education', name: 'Educação', icon: Smartphone, color: 'indigo' },
  { id: 'other', name: 'Outros', icon: ShoppingCart, color: 'gray' },
];

const DEFAULT_BUDGET: Budget = {
  month: new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
  incomes: [
    { id: '1', source: 'Salário', amount: 5000 },
  ],
  expenses: [
    { id: '1', description: 'Aluguel', amount: 1500, category: 'housing', type: 'fixed', paid: true },
    { id: '2', description: 'Supermercado', amount: 800, category: 'food', type: 'variable', paid: false },
    { id: '3', description: 'Combustível', amount: 400, category: 'transport', type: 'variable', paid: false },
  ],
  savingsGoal: 1000,
};

type PersonalBudgetData = {
  budget: Budget;
};

const DEFAULT_DATA: PersonalBudgetData = {
  budget: DEFAULT_BUDGET,
};

export default function PersonalBudgetTemplate({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData } = usePageTemplateData<PersonalBudgetData>(groupId, pageId, DEFAULT_DATA);
  const budget = data.budget ?? DEFAULT_BUDGET;

  const updateBudget = (updater: Budget | ((current: Budget) => Budget)) => {
    setData((current) => {
      const currentBudget = current.budget ?? DEFAULT_BUDGET;
      const nextBudget = typeof updater === 'function'
        ? (updater as (current: Budget) => Budget)(JSON.parse(JSON.stringify(currentBudget)))
        : updater;
      return {
        ...current,
        budget: nextBudget,
      };
    });
  };

  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newIncome, setNewIncome] = useState({ source: '', amount: '' });
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'other' as Expense['category'],
    type: 'variable' as 'fixed' | 'variable',
  });

  const totalIncome = budget.incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = budget.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const balance = totalIncome - totalExpenses;
  const savingsProgress = budget.savingsGoal > 0 ? (balance / budget.savingsGoal) * 100 : 0;

  const addIncome = () => {
    if (!newIncome.source.trim() || !newIncome.amount) return;
    updateBudget((current) => ({
      ...current,
      incomes: [
        ...current.incomes,
        {
          id: `${Date.now()}`,
          source: newIncome.source,
          amount: parseFloat(newIncome.amount),
        },
      ],
    }));
    setNewIncome({ source: '', amount: '' });
    setShowAddIncome(false);
  };

  const addExpense = () => {
    if (!newExpense.description.trim() || !newExpense.amount) return;
    updateBudget((current) => ({
      ...current,
      expenses: [
        ...current.expenses,
        {
          id: `${Date.now()}`,
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
          category: newExpense.category,
          type: newExpense.type,
          paid: false,
        },
      ],
    }));
    setNewExpense({ description: '', amount: '', category: 'other', type: 'variable' });
    setShowAddExpense(false);
  };

  const deleteIncome = (id: string) => {
    updateBudget((current) => ({
      ...current,
      incomes: current.incomes.filter((income) => income.id !== id),
    }));
  };

  const deleteExpense = (id: string) => {
    updateBudget((current) => ({
      ...current,
      expenses: current.expenses.filter((expense) => expense.id !== id),
    }));
  };

  const togglePaid = (id: string) => {
    updateBudget((current) => ({
      ...current,
      expenses: current.expenses.map((expense) =>
        expense.id === id ? { ...expense, paid: !expense.paid } : expense,
      ),
    }));
  };

  const expensesByCategory = CATEGORIES.map(cat => ({
    ...cat,
    total: budget.expenses
      .filter(exp => exp.category === cat.id)
      .reduce((sum, exp) => sum + exp.amount, 0),
  })).filter(cat => cat.total > 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Orçamento Pessoal
        </h1>
        <p className="text-gray-600 dark:text-gray-300">{budget.month}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Receitas</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            R$ {totalIncome.toFixed(2)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Despesas</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            R$ {totalExpenses.toFixed(2)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 ${balance >= 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-red-100 dark:bg-red-900/30'} rounded-lg flex items-center justify-center`}>
              <Wallet className={`w-5 h-5 ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Saldo</span>
          </div>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            R$ {balance.toFixed(2)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Meta Economia</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            R$ {budget.savingsGoal.toFixed(2)}
          </p>
          <div className="mt-2 bg-gray-200 dark:bg-gray-800 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(savingsProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incomes */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Receitas</h2>
            <button
              onClick={() => setShowAddIncome(true)}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>

          {showAddIncome && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <input
                type="text"
                placeholder="Fonte de renda"
                value={newIncome.source}
                onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
                className="w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <input
                type="number"
                placeholder="Valor"
                value={newIncome.amount}
                onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                className="w-full mb-3 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <div className="flex gap-2">
                <button onClick={addIncome} className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Save className="w-4 h-4 inline mr-1" />
                  Salvar
                </button>
                <button onClick={() => setShowAddIncome(false)} className="px-3 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {budget.incomes.map((income) => (
              <div key={income.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{income.source}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    R$ {income.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => deleteIncome(income.id)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Despesas</h2>
            <button
              onClick={() => setShowAddExpense(true)}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>

          {showAddExpense && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <input
                type="text"
                placeholder="Descrição"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                className="w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <input
                type="number"
                placeholder="Valor"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as Expense['category'] })}
                className="w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <select
                value={newExpense.type}
                onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value as 'fixed' | 'variable' })}
                className="w-full mb-3 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="fixed">Fixa</option>
                <option value="variable">Variável</option>
              </select>
              <div className="flex gap-2">
                <button onClick={addExpense} className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <Save className="w-4 h-4 inline mr-1" />
                  Salvar
                </button>
                <button onClick={() => setShowAddExpense(false)} className="px-3 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {budget.expenses.map((expense) => {
              const category = CATEGORIES.find(c => c.id === expense.category);
              const Icon = category?.icon || ShoppingCart;

              return (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={expense.paid}
                      onChange={() => togglePaid(expense.id)}
                      className="w-4 h-4"
                    />
                    <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <div className="flex-1">
                      <p className={`font-medium text-gray-900 dark:text-white ${expense.paid ? 'line-through opacity-60' : ''}`}>
                        {expense.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {category?.name} • {expense.type === 'fixed' ? 'Fixa' : 'Variável'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      R$ {expense.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {expensesByCategory.length > 0 && (
        <div className="mt-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Despesas por Categoria
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {expensesByCategory.map((cat) => {
              const Icon = cat.icon;
              const percentage = ((cat.total / totalExpenses) * 100).toFixed(1);

              return (
                <div key={cat.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {cat.name}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    R$ {cat.total.toFixed(2)}
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
