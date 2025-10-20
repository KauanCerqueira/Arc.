"use client";

import { useState } from 'react';
import { 
  Plus, Trash2, Edit2, X, MoreVertical, Calendar,
  User, Tag, Clock, AlertCircle, CheckCircle2,
  Circle, Flame, ArrowRight, Filter, Search
} from 'lucide-react';

type Priority = 'low' | 'medium' | 'high' | 'urgent';
type CardStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';

type Card = {
  id: number;
  title: string;
  description: string;
  status: CardStatus;
  priority: Priority;
  assignee: string;
  tags: string[];
  dueDate: string;
  createdAt: Date;
};

type Column = {
  id: CardStatus;
  title: string;
  color: string;
  icon: any;
  limit?: number;
};

const COLUMNS: Column[] = [
  { id: 'backlog', title: 'Backlog', color: 'gray', icon: Circle },
  { id: 'todo', title: 'A Fazer', color: 'blue', icon: AlertCircle },
  { id: 'in-progress', title: 'Em Progresso', color: 'yellow', icon: Clock },
  { id: 'review', title: 'Revisão', color: 'purple', icon: CheckCircle2 },
  { id: 'done', title: 'Concluído', color: 'green', icon: CheckCircle2 },
];

const PRIORITY_CONFIG = {
  low: { label: 'Baixa', color: 'gray', icon: Circle },
  medium: { label: 'Média', color: 'blue', icon: Circle },
  high: { label: 'Alta', color: 'orange', icon: Flame },
  urgent: { label: 'Urgente', color: 'red', icon: Flame },
};

export default function KanbanTemplate() {
  const [cards, setCards] = useState<Card[]>([
    {
      id: 1,
      title: 'Implementar autenticação',
      description: 'Adicionar login com Google e GitHub',
      status: 'in-progress',
      priority: 'high',
      assignee: 'João Silva',
      tags: ['Backend', 'Segurança'],
      dueDate: '2025-01-25',
      createdAt: new Date(),
    },
    {
      id: 2,
      title: 'Design da landing page',
      description: 'Criar mockups no Figma',
      status: 'todo',
      priority: 'medium',
      assignee: 'Maria Santos',
      tags: ['Design', 'Frontend'],
      dueDate: '2025-01-30',
      createdAt: new Date(),
    },
    {
      id: 3,
      title: 'Configurar CI/CD',
      description: 'Setup GitHub Actions',
      status: 'backlog',
      priority: 'low',
      assignee: '',
      tags: ['DevOps'],
      dueDate: '',
      createdAt: new Date(),
    },
  ]);

  const [showAddCard, setShowAddCard] = useState<CardStatus | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterAssignee, setFilterAssignee] = useState('all');

  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    assignee: '',
    tags: '',
    dueDate: '',
  });

  const addCard = (status: CardStatus) => {
    if (!newCard.title.trim()) return;

    const card: Card = {
      id: Date.now(),
      title: newCard.title,
      description: newCard.description,
      status,
      priority: newCard.priority,
      assignee: newCard.assignee,
      tags: newCard.tags.split(',').map(t => t.trim()).filter(t => t),
      dueDate: newCard.dueDate,
      createdAt: new Date(),
    };

    setCards([...cards, card]);
    setNewCard({ title: '', description: '', priority: 'medium', assignee: '', tags: '', dueDate: '' });
    setShowAddCard(null);
  };

  const updateCard = (id: number, updates: Partial<Card>) => {
    setCards(cards.map(card => card.id === id ? { ...card, ...updates } : card));
  };

  const deleteCard = (id: number) => {
    if (confirm('Excluir este card?')) {
      setCards(cards.filter(card => card.id !== id));
      setSelectedCard(null);
    }
  };

  const moveCard = (cardId: number, newStatus: CardStatus) => {
    updateCard(cardId, { status: newStatus });
  };

  const duplicateCard = (card: Card) => {
    const newCard: Card = {
      ...card,
      id: Date.now(),
      title: `${card.title} (cópia)`,
      createdAt: new Date(),
    };
    setCards([...cards, newCard]);
  };

  // Filtros
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         card.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || card.priority === filterPriority;
    const matchesAssignee = filterAssignee === 'all' || card.assignee === filterAssignee;
    return matchesSearch && matchesPriority && matchesAssignee;
  });

  const getCardsForColumn = (status: CardStatus) => {
    return filteredCards.filter(card => card.status === status);
  };

  const uniqueAssignees = Array.from(new Set(cards.map(c => c.assignee).filter(a => a)));

  const isOverdue = (dueDate: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Quadro Kanban
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {filteredCards.length} {filteredCards.length === 1 ? 'card' : 'cards'} • {uniqueAssignees.length} {uniqueAssignees.length === 1 ? 'pessoa' : 'pessoas'}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cards..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
            />
          </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
            className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
          >
            <option value="all">Todas Prioridades</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>

          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
          >
            <option value="all">Todas Pessoas</option>
            {uniqueAssignees.map(assignee => (
              <option key={assignee} value={assignee}>{assignee}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full min-w-max">
          {COLUMNS.map(column => {
            const columnCards = getCardsForColumn(column.id);
            const ColumnIcon = column.icon;

            return (
              <div
                key={column.id}
                className="flex-shrink-0 w-80 flex flex-col bg-gray-50 dark:bg-slate-900 rounded-2xl"
              >
                {/* Column Header */}
                <div className="p-4 border-b border-gray-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ColumnIcon className={`w-5 h-5 text-${column.color}-600 dark:text-${column.color}-400`} />
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {column.title}
                      </h3>
                      <span className="px-2 py-0.5 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                        {columnCards.length}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowAddCard(column.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg transition"
                    >
                      <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                  {column.limit && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Limite: {columnCards.length}/{column.limit}
                    </div>
                  )}
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {/* Add Card Form */}
                  {showAddCard === column.id && (
                    <div className="bg-white dark:bg-slate-950 border-2 border-gray-300 dark:border-slate-700 rounded-xl p-4 space-y-3">
                      <input
                        type="text"
                        value={newCard.title}
                        onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
                        placeholder="Título do card"
                        autoFocus
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                      />
                      <textarea
                        value={newCard.description}
                        onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
                        placeholder="Descrição (opcional)"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => addCard(column.id)}
                          disabled={!newCard.title.trim()}
                          className="flex-1 px-3 py-2 bg-gray-900 dark:bg-slate-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-slate-600 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Adicionar
                        </button>
                        <button
                          onClick={() => setShowAddCard(null)}
                          className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Cards */}
                  {columnCards.length === 0 && showAddCard !== column.id ? (
                    <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                      Nenhum card
                    </div>
                  ) : (
                    columnCards.map(card => {
                      const PriorityIcon = PRIORITY_CONFIG[card.priority].icon;
                      const priorityColor = PRIORITY_CONFIG[card.priority].color;

                      return (
                        <div
                          key={card.id}
                          onClick={() => setSelectedCard(card)}
                          className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl p-4 hover:shadow-lg transition cursor-pointer group"
                        >
                          {/* Priority & Menu */}
                          <div className="flex items-start justify-between mb-3">
                            <div className={`flex items-center gap-1 px-2 py-1 bg-${priorityColor}-100 dark:bg-${priorityColor}-900/30 rounded-lg`}>
                              <PriorityIcon className={`w-3 h-3 text-${priorityColor}-600 dark:text-${priorityColor}-400`} />
                              <span className={`text-xs font-medium text-${priorityColor}-700 dark:text-${priorityColor}-400`}>
                                {PRIORITY_CONFIG[card.priority].label}
                              </span>
                            </div>
                          </div>

                          {/* Title */}
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                            {card.title}
                          </h4>

                          {/* Description */}
                          {card.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {card.description}
                            </p>
                          )}

                          {/* Tags */}
                          {card.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {card.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-gray-300 rounded text-xs font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                            {card.assignee && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{card.assignee.split(' ')[0]}</span>
                              </div>
                            )}
                            {card.dueDate && (
                              <div className={`flex items-center gap-1 ${isOverdue(card.dueDate) ? 'text-red-600 dark:text-red-400 font-semibold' : ''}`}>
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(card.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-slate-800 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <input
                    type="text"
                    value={selectedCard.title}
                    onChange={(e) => updateCard(selectedCard.id, { title: e.target.value })}
                    className="text-2xl font-bold text-gray-900 dark:text-gray-100 bg-transparent border-none outline-none w-full focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-700 rounded px-2 -mx-2"
                  />
                </div>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="flex gap-2 flex-wrap">
                  {COLUMNS.map(col => {
                    const ColIcon = col.icon;
                    return (
                      <button
                        key={col.id}
                        onClick={() => updateCard(selectedCard.id, { status: col.id })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                          selectedCard.status === col.id
                            ? `bg-${col.color}-100 dark:bg-${col.color}-900/30 text-${col.color}-700 dark:text-${col.color}-400 border-2 border-${col.color}-500`
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <ColIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{col.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={selectedCard.description}
                  onChange={(e) => updateCard(selectedCard.id, { description: e.target.value })}
                  placeholder="Adicione uma descrição..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 resize-none"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prioridade
                </label>
                <div className="flex gap-2">
                  {(Object.keys(PRIORITY_CONFIG) as Priority[]).map(priority => {
                    const PriorityIcon = PRIORITY_CONFIG[priority].icon;
                    const color = PRIORITY_CONFIG[priority].color;
                    return (
                      <button
                        key={priority}
                        onClick={() => updateCard(selectedCard.id, { priority })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                          selectedCard.priority === priority
                            ? `bg-${color}-100 dark:bg-${color}-900/30 text-${color}-700 dark:text-${color}-400 border-2 border-${color}-500`
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <PriorityIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{PRIORITY_CONFIG[priority].label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Responsável
                </label>
                <input
                  type="text"
                  value={selectedCard.assignee}
                  onChange={(e) => updateCard(selectedCard.id, { assignee: e.target.value })}
                  placeholder="Nome da pessoa"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prazo
                </label>
                <input
                  type="date"
                  value={selectedCard.dueDate}
                  onChange={(e) => updateCard(selectedCard.id, { dueDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={selectedCard.tags.join(', ')}
                  onChange={(e) => updateCard(selectedCard.id, { tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                  placeholder="Ex: Frontend, Bug, Urgente"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-0 border-t border-gray-200 dark:border-slate-800 flex gap-3">
              <button
                onClick={() => {
                  duplicateCard(selectedCard);
                  setSelectedCard(null);
                }}
                className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition font-medium"
              >
                Duplicar
              </button>
              <button
                onClick={() => deleteCard(selectedCard.id)}
                className="px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition font-medium"
              >
                Excluir
              </button>
              <button
                onClick={() => setSelectedCard(null)}
                className="ml-auto px-6 py-2.5 bg-gray-900 dark:bg-slate-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}