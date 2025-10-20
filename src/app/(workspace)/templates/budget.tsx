"use client";

import { useState } from 'react';
import { Plus, Trash2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

type BudgetItem = {
  id: number;
  name: string;
  value: number;
  type: 'income' | 'expense';
  category: string;
};

export default function BudgetTemplate() {
  const [items, setItems] = useState<BudgetItem[]>([
    { id: 1, name: 'Pagamento Cliente A', value: 5000, type: 'income', category: 'Receita' },
    { id: 2, name: 'Hospedagem', value: 200, type: 'expense', category: 'Infraestrutura' },
    { id: 3, name: 'Design Assets', value: 150, type: 'expense', category: 'Design' },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    value: '',
    type: 'expense' as 'income' | 'expense',
    category: ''
  });

  const addItem = () => {
    if (!newItem.name.trim() || !newItem.value) return;

    setItems([...items, {
      id: Date.now(),
      name: newItem.name,
      value: parseFloat(newItem.value),
      type: newItem.type,
      category: newItem.category || (newItem.type === 'income' ? 'Receita' : 'Despesa')
    }]);

    setNewItem({ name: '', value: '', type: 'expense', category: '' });
    setShowAddForm(false);
  };

  const deleteItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const totalIncome = items
    .filter(item => item.type === 'income')
    .reduce((sum, item) => sum + item.value, 0);

  const totalExpense = items
    .filter(item => item.type === 'expense')
    .reduce((sum, item) => sum + item.value, 0);

  const balance = totalIncome - totalExpense;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700">Receitas</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">{formatCurrency(totalIncome)}</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-700">Despesas</span>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-900">{formatCurrency(totalExpense)}</div>
        </div>

        <div className={`bg-gradient-to-br ${balance >= 0 ? 'from-blue-50 to-indigo-50 border-blue-200' : 'from-orange-50 to-amber-50 border-orange-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Saldo</span>
            <DollarSign className="w-5 h-5 text-gray-600" />
          </div>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
            {formatCurrency(balance)}
          </div>
        </div>
      </div>

      {/* Botão Adicionar */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="mb-6 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Adicionar Item
      </button>

      {/* Formulário */}
      {showAddForm && (
        <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Ex: Pagamento freelancer"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor
              </label>
              <input
                type="number"
                value={newItem.value}
                onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                placeholder="0.00"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value as 'income' | 'expense' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="income">Receita</option>
                <option value="expense">Despesa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <input
                type="text"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                placeholder="Ex: Design, Marketing"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={addItem}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
            >
              Adicionar
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de Itens */}
      <div className="space-y-3">
        {/* Receitas */}
        {items.filter(i => i.type === 'income').length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Receitas
            </h3>
            {items.filter(item => item.type === 'income').map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition mb-2"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.category}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold text-green-600">
                    {formatCurrency(item.value)}
                  </span>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Despesas */}
        {items.filter(i => i.type === 'expense').length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              Despesas
            </h3>
            {items.filter(item => item.type === 'expense').map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition mb-2"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.category}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold text-red-600">
                    -{formatCurrency(item.value)}
                  </span>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}