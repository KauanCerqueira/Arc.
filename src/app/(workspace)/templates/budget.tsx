"use client";

import { useState } from 'react';
import { 
  Plus, Trash2, DollarSign, TrendingUp, TrendingDown, 
  AlertCircle, CheckCircle2, Code, Palette, Laptop,
  Clock, Users, Server, Zap, Calculator, Edit2, X
} from 'lucide-react';

type CostItem = {
  id: number;
  name: string;
  hours: number;
  hourlyRate: number;
  quantity: number;
  category: 'development' | 'design' | 'infrastructure' | 'team' | 'other';
};

type Project = {
  name: string;
  client: string;
  deadline: string;
  margin: number; // Margem de lucro desejada (%)
  items: CostItem[];
  clientBudget: number; // Quanto o cliente está disposto a pagar
};

const CATEGORIES = [
  { id: 'development', name: 'Desenvolvimento', icon: Code, color: 'blue' },
  { id: 'design', name: 'Design', icon: Palette, color: 'purple' },
  { id: 'infrastructure', name: 'Infraestrutura', icon: Server, color: 'green' },
  { id: 'team', name: 'Equipe', icon: Users, color: 'orange' },
  { id: 'other', name: 'Outros', icon: Zap, color: 'gray' },
];

const HOURLY_RATES = {
  development: [
    { label: 'Júnior', value: 50 },
    { label: 'Pleno', value: 100 },
    { label: 'Sênior', value: 150 },
    { label: 'Especialista', value: 250 },
  ],
  design: [
    { label: 'UI/UX Júnior', value: 60 },
    { label: 'UI/UX Pleno', value: 120 },
    { label: 'UI/UX Sênior', value: 180 },
    { label: 'Creative Director', value: 300 },
  ],
};

export default function BudgetTemplate() {
  const [project, setProject] = useState<Project>({
    name: 'Novo Projeto',
    client: '',
    deadline: '',
    margin: 30,
    items: [
      { id: 1, name: 'Frontend React', hours: 80, hourlyRate: 100, quantity: 1, category: 'development' },
      { id: 2, name: 'Backend Node.js', hours: 60, hourlyRate: 100, quantity: 1, category: 'development' },
      { id: 3, name: 'UI/UX Design', hours: 40, hourlyRate: 120, quantity: 1, category: 'design' },
      { id: 4, name: 'Servidor VPS', hours: 0, hourlyRate: 0, quantity: 12, category: 'infrastructure' },
    ],
    clientBudget: 0,
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    hours: '',
    hourlyRate: '',
    quantity: '1',
    category: 'development' as CostItem['category'],
  });

  const addItem = () => {
    if (!newItem.name.trim()) return;

    setProject({
      ...project,
      items: [...project.items, {
        id: Date.now(),
        name: newItem.name,
        hours: parseFloat(newItem.hours) || 0,
        hourlyRate: parseFloat(newItem.hourlyRate) || 0,
        quantity: parseFloat(newItem.quantity) || 1,
        category: newItem.category,
      }],
    });

    setNewItem({ name: '', hours: '', hourlyRate: '', quantity: '1', category: 'development' });
    setShowAddForm(false);
  };

  const deleteItem = (id: number) => {
    if (confirm('Excluir este item?')) {
      setProject({
        ...project,
        items: project.items.filter(item => item.id !== id),
      });
    }
  };

  const updateItem = (id: number, updates: Partial<CostItem>) => {
    setProject({
      ...project,
      items: project.items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  // Cálculos
  const totalCost = project.items.reduce((sum, item) => {
    const itemCost = (item.hours * item.hourlyRate * item.quantity);
    return sum + itemCost;
  }, 0);

  const totalHours = project.items.reduce((sum, item) => sum + (item.hours * item.quantity), 0);

  const profitAmount = totalCost * (project.margin / 100);
  const finalPrice = totalCost + profitAmount;

  const isViable = project.clientBudget > 0 && project.clientBudget >= finalPrice;
  const viabilityPercentage = project.clientBudget > 0 ? (finalPrice / project.clientBudget) * 100 : 0;

  // Agrupar por categoria
  const groupedItems = project.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CostItem[]>);

  const categoryTotals = Object.entries(groupedItems).map(([category, items]) => ({
    category,
    total: items.reduce((sum, item) => sum + (item.hours * item.hourlyRate * item.quantity), 0),
    hours: items.reduce((sum, item) => sum + (item.hours * item.quantity), 0),
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header do Projeto */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 mb-6 shadow-sm">
        {editingProject ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome do Projeto
                </label>
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => setProject({ ...project, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cliente
                </label>
                <input
                  type="text"
                  value={project.client}
                  onChange={(e) => setProject({ ...project, client: e.target.value })}
                  placeholder="Nome do cliente"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prazo de Entrega
                </label>
                <input
                  type="date"
                  value={project.deadline}
                  onChange={(e) => setProject({ ...project, deadline: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Orçamento do Cliente (opcional)
                </label>
                <input
                  type="number"
                  value={project.clientBudget || ''}
                  onChange={(e) => setProject({ ...project, clientBudget: parseFloat(e.target.value) || 0 })}
                  placeholder="R$ 0,00"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                />
              </div>
            </div>
            <button
              onClick={() => setEditingProject(false)}
              className="px-4 py-2 bg-gray-900 dark:bg-slate-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition font-medium"
            >
              Salvar Informações
            </button>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {project.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                {project.client && <span>Cliente: {project.client}</span>}
                {project.deadline && <span>Prazo: {new Date(project.deadline).toLocaleDateString('pt-BR')}</span>}
              </div>
            </div>
            <button
              onClick={() => setEditingProject(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <Edit2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Coluna Principal - Itens */}
        <div className="xl:col-span-2 space-y-6">
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Custo Total</span>
                <Calculator className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(totalCost)}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Lucro ({project.margin}%)</span>
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(profitAmount)}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Preço Final</span>
                <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(finalPrice)}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Horas</span>
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {totalHours}h
              </div>
            </div>
          </div>

          {/* Itens do Orçamento */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Itens do Orçamento
              </h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2.5 bg-gray-900 dark:bg-slate-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition flex items-center gap-2 font-medium shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Adicionar Item
              </button>
            </div>

            {/* Form Adicionar */}
            {showAddForm && (
              <div className="mb-6 p-6 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Novo Item</h3>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Descrição *
                    </label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="Ex: Desenvolvimento Frontend"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categoria *
                    </label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value as CostItem['category'] })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Horas
                    </label>
                    <input
                      type="number"
                      value={newItem.hours}
                      onChange={(e) => setNewItem({ ...newItem, hours: e.target.value })}
                      placeholder="0"
                      step="0.5"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Valor/Hora (R$)
                    </label>
                    <input
                      type="number"
                      value={newItem.hourlyRate}
                      onChange={(e) => setNewItem({ ...newItem, hourlyRate: e.target.value })}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                      placeholder="1"
                      step="1"
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={addItem}
                    disabled={!newItem.name.trim()}
                    className="px-6 py-2.5 bg-gray-900 dark:bg-slate-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Adicionar
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Lista de Itens por Categoria */}
            <div className="space-y-6">
              {CATEGORIES.map(category => {
                const categoryItems = groupedItems[category.id] || [];
                if (categoryItems.length === 0) return null;

                const CategoryIcon = category.icon;
                const categoryTotal = categoryItems.reduce((sum, item) => sum + (item.hours * item.hourlyRate * item.quantity), 0);

                return (
                  <div key={category.id}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 bg-${category.color}-100 dark:bg-${category.color}-900/30 rounded-xl flex items-center justify-center`}>
                        <CategoryIcon className={`w-5 h-5 text-${category.color}-600 dark:text-${category.color}-400`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{category.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(categoryTotal)}</p>
                      </div>
                    </div>

                    <div className="space-y-2 ml-13">
                      {categoryItems.map(item => {
                        const itemTotal = item.hours * item.hourlyRate * item.quantity;
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:shadow-md transition group"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                                {item.name}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                <span>{item.hours}h</span>
                                <span>•</span>
                                <span>{formatCurrency(item.hourlyRate)}/h</span>
                                <span>•</span>
                                <span>x{item.quantity}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {formatCurrency(itemTotal)}
                              </div>
                            </div>

                            <button
                              onClick={() => deleteItem(item.id)}
                              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {project.items.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nenhum item adicionado
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Clique em "Adicionar Item" para começar
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Análise */}
        <div className="space-y-6">
          {/* Margem de Lucro */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Margem de Lucro
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={project.margin}
                onChange={(e) => setProject({ ...project, margin: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 min-w-[60px] text-right">
                {project.margin}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[10, 20, 30, 40, 50].map(margin => (
                <button
                  key={margin}
                  onClick={() => setProject({ ...project, margin })}
                  className={`px-3 py-2 rounded-lg border transition ${
                    project.margin === margin
                      ? 'bg-gray-900 dark:bg-slate-700 text-white border-gray-900 dark:border-slate-700'
                      : 'bg-white dark:bg-slate-950 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                  }`}
                >
                  {margin}%
                </button>
              ))}
            </div>
          </div>

          {/* Viabilidade */}
          {project.clientBudget > 0 && (
            <div className={`border rounded-2xl p-6 shadow-sm ${
              isViable
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                {isViable ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <h3 className="font-semibold text-green-900 dark:text-green-100">Projeto Viável!</h3>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    <h3 className="font-semibold text-red-900 dark:text-red-100">Orçamento Insuficiente</h3>
                  </>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className={isViable ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                    Orçamento Cliente
                  </span>
                  <span className={`font-bold ${isViable ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                    {formatCurrency(project.clientBudget)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className={isViable ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                    Seu Preço
                  </span>
                  <span className={`font-bold ${isViable ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                    {formatCurrency(finalPrice)}
                  </span>
                </div>

                <div className="pt-3 border-t border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className={isViable ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                      Diferença
                    </span>
                    <span className={`font-bold ${isViable ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                      {formatCurrency(Math.abs(project.clientBudget - finalPrice))}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white dark:bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isViable
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-red-500 to-rose-500'
                      }`}
                      style={{ width: `${Math.min(viabilityPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-center mt-2 font-medium">
                    {viabilityPercentage.toFixed(0)}% do orçamento
                  </div>
                </div>

                {!isViable && (
                  <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <p className="text-xs text-red-800 dark:text-red-200 font-medium">
                      💡 Sugestão: {project.clientBudget < totalCost 
                        ? 'O orçamento não cobre nem os custos. Renegocie com o cliente.'
                        : 'Reduza a margem de lucro ou otimize os custos do projeto.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Distribuição de Custos */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Distribuição de Custos
            </h3>
            <div className="space-y-3">
              {categoryTotals.sort((a, b) => b.total - a.total).map(({ category, total, hours }) => {
                const percentage = totalCost > 0 ? (total / totalCost) * 100 : 0;
                const categoryData = CATEGORIES.find(c => c.id === category);
                const CategoryIcon = categoryData?.icon || Code;
                
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{categoryData?.name}</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(total)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r from-${categoryData?.color}-500 to-${categoryData?.color}-600`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[50px] text-right">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {hours}h de trabalho
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sugestões de Valores/Hora */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
              💡 Referência de Valores/Hora
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Desenvolvimento
                </h4>
                <div className="space-y-1">
                  {HOURLY_RATES.development.map(rate => (
                    <div key={rate.label} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{rate.label}</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(rate.value)}/h
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Design
                </h4>
                <div className="space-y-1">
                  {HOURLY_RATES.design.map(rate => (
                    <div key={rate.label} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{rate.label}</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(rate.value)}/h
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Resumo Final */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 shadow-xl text-white">
            <h3 className="font-bold text-xl mb-4">Resumo do Orçamento</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <span className="text-gray-300">Custo de Produção</span>
                <span className="font-semibold">{formatCurrency(totalCost)}</span>
              </div>
              
              <div className="flex items-center justify-between py-3 pt-4 border-t border-white/20">
                <span className="text-lg font-medium">Valor a Cobrar</span>
                <span className="text-3xl font-bold text-white">
                  {formatCurrency(finalPrice)}
                </span>
              </div>

              <div className="mt-4 p-3 bg-white/10 rounded-lg">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Total de Horas</span>
                  <span className="font-semibold">{totalHours}h</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Valor Médio/Hora</span>
                  <span className="font-semibold">
                    {totalHours > 0 ? formatCurrency(finalPrice / totalHours) : 'R$ 0,00'}/h
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dicas */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Dicas de Precificação
            </h3>
            <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>Margem de lucro ideal: 30-40% para projetos estáveis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>Sempre adicione 20-30% de buffer para imprevistos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>Considere custos indiretos (impostos, ferramentas, etc)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>Divida o pagamento em milestones para melhor fluxo de caixa</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );}