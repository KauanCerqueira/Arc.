"use client";

import { useState } from 'react';
import { usePageTemplateData } from '@/core/hooks/usePageTemplateData';
import { WorkspaceTemplateComponentProps } from '@/core/types/workspace.types';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Priority = 'low' | 'medium' | 'high' | 'urgent';
type CardStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';

type Card = {
  id: string;
  title: string;
  description: string;
  status: CardStatus;
  priority: Priority;
  assignee: string;
  tags: string[];
  dueDate: string;
  createdAt: string;
};

type Column = {
  id: CardStatus;
  title: string;
  color: string;
};

const COLUMNS: Column[] = [
  { id: 'backlog', title: 'Backlog', color: 'gray' },
  { id: 'todo', title: 'A Fazer', color: 'blue' },
  { id: 'in-progress', title: 'Em Progresso', color: 'yellow' },
  { id: 'review', title: 'Revisão', color: 'purple' },
  { id: 'done', title: 'Concluído', color: 'green' },
];

const PRIORITY_CONFIG = {
  low: { label: 'Baixa', color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800' },
  medium: { label: 'Média', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  high: { label: 'Alta', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800' },
  urgent: { label: 'Urgente', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' },
};

type KanbanTemplateData = {
  cards: Card[];
};

const DEFAULT_DATA: KanbanTemplateData = {
  cards: [
    {
      id: '1',
      title: 'Implementar autenticação',
      description: 'Adicionar login com Google e GitHub',
      status: 'in-progress',
      priority: 'high',
      assignee: 'João Silva',
      tags: ['Backend', 'Segurança'],
      dueDate: '2025-01-25',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Design da landing page',
      description: 'Criar mockups no Figma',
      status: 'todo',
      priority: 'medium',
      assignee: 'Maria Santos',
      tags: ['Design', 'Frontend'],
      dueDate: '2025-01-30',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Configurar CI/CD',
      description: 'Setup GitHub Actions',
      status: 'backlog',
      priority: 'low',
      assignee: '',
      tags: ['DevOps'],
      dueDate: '',
      createdAt: new Date().toISOString(),
    },
  ],
};

// Componente de Coluna Droppable
function DroppableColumn({ columnId, children }: { columnId: CardStatus; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 overflow-y-auto p-3 md:p-4 space-y-3 transition-colors ${
        isOver ? 'bg-blue-50 dark:bg-blue-900/10' : ''
      }`}
    >
      {children}
    </div>
  );
}

// Componente de Card Draggable
function SortableCard({ card, onClick, isOverdue }: {
  card: Card;
  onClick: () => void;
  isOverdue: (date: string) => boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 md:p-4 hover:shadow-md transition cursor-move group"
    >
      {/* Priority */}
      <div className="flex items-start justify-between mb-3">
        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${PRIORITY_CONFIG[card.priority].color}`}>
          {PRIORITY_CONFIG[card.priority].label}
        </span>
      </div>

      {/* Title */}
      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
        {card.title}
      </h4>

      {/* Description */}
      {card.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {card.description}
        </p>
      )}

      {/* Tags */}
      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {card.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-gray-300 rounded text-xs font-medium border border-gray-200 dark:border-slate-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        {card.assignee && (
          <span className="truncate">{card.assignee.split(' ')[0]}</span>
        )}
        {card.dueDate && (
          <span className={isOverdue(card.dueDate) ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>
            {new Date(card.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData, isSaving } = usePageTemplateData<KanbanTemplateData>(
    groupId,
    pageId,
    DEFAULT_DATA,
  );
  const cards = data.cards ?? [];

  const [showAddCard, setShowAddCard] = useState<CardStatus | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    assignee: '',
    tags: '',
    dueDate: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const updateCards = (updater: (current: Card[]) => Card[]) => {
    setData((current) => ({
      ...current,
      cards: updater(current.cards ?? []),
    }));
  };

  const addCard = (status: CardStatus) => {
    if (!newCard.title.trim()) return;

    const card: Card = {
      id: Date.now().toString(),
      title: newCard.title,
      description: newCard.description,
      status,
      priority: newCard.priority,
      assignee: newCard.assignee,
      tags: newCard.tags.split(',').map(t => t.trim()).filter(t => t),
      dueDate: newCard.dueDate,
      createdAt: new Date().toISOString(),
    };

    updateCards((current) => [...current, card]);
    setNewCard({ title: '', description: '', priority: 'medium', assignee: '', tags: '', dueDate: '' });
    setShowAddCard(null);
  };

  const updateCard = (id: string, updates: Partial<Card>) => {
    updateCards((current) =>
      current.map((card) => (card.id === id ? { ...card, ...updates } : card)),
    );
    if (selectedCard?.id === id) {
      setSelectedCard({ ...selectedCard, ...updates });
    }
  };

  const deleteCard = (id: string) => {
    if (confirm('Excluir este card?')) {
      updateCards((current) => current.filter((card) => card.id !== id));
      setSelectedCard(null);
    }
  };

  const duplicateCard = (card: Card) => {
    const newCard: Card = {
      ...card,
      id: Date.now().toString(),
      title: `${card.title} (cópia)`,
      createdAt: new Date().toISOString(),
    };
    updateCards((current) => [...current, newCard]);
  };

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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = cards.find(c => c.id === active.id);
    setActiveCard(card || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const cardId = active.id as string;
    const overId = over.id as string;

    // Verifica se é uma coluna
    const overColumn = COLUMNS.find(col => col.id === overId);
    if (overColumn) {
      // Atualiza o status do card durante o drag
      updateCards((current) =>
        current.map((card) =>
          card.id === cardId ? { ...card, status: overColumn.id } : card
        )
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const cardId = active.id as string;
    const overId = over.id as string;

    // Verifica se é uma coluna ou outro card
    const overColumn = COLUMNS.find(col => col.id === overId);
    if (overColumn) {
      updateCards((current) =>
        current.map((card) =>
          card.id === cardId ? { ...card, status: overColumn.id } : card
        )
      );
    } else {
      // Se dropado em outro card, pega o status desse card
      const overCard = cards.find(c => c.id === overId);
      if (overCard) {
        updateCards((current) =>
          current.map((card) =>
            card.id === cardId ? { ...card, status: overCard.status } : card
          )
        );
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Quadro Kanban
                </h1>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {filteredCards.length} {filteredCards.length === 1 ? 'card' : 'cards'} • {uniqueAssignees.length} {uniqueAssignees.length === 1 ? 'pessoa' : 'pessoas'}
                  {isSaving && <span className="ml-2 text-blue-600 dark:text-blue-400">Salvando...</span>}
                </p>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="flex-shrink-0 w-40 md:flex-1 md:min-w-[200px] px-3 md:px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-xs md:text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
              />

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
                className="flex-shrink-0 px-3 md:px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-xs md:text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
              >
                <option value="all">Prioridade</option>
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>

              {uniqueAssignees.length > 0 && (
                <select
                  value={filterAssignee}
                  onChange={(e) => setFilterAssignee(e.target.value)}
                  className="flex-shrink-0 px-3 md:px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-xs md:text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                >
                  <option value="all">Pessoa</option>
                  {uniqueAssignees.map(assignee => (
                    <option key={assignee} value={assignee}>{assignee.split(' ')[0]}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="h-full px-4 md:px-6 py-6">
            <div className="flex gap-3 md:gap-4 h-full min-w-max max-w-7xl mx-auto">
              {COLUMNS.map(column => {
                const columnCards = getCardsForColumn(column.id);

                return (
                  <SortableContext
                    key={column.id}
                    id={column.id}
                    items={columnCards.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div
                      id={column.id}
                      className="flex-shrink-0 w-72 md:w-80 flex flex-col bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm"
                    >
                      {/* Column Header */}
                      <div className="p-4 border-b border-gray-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-gray-100">
                              {column.title}
                            </h3>
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                              {columnCards.length}
                            </span>
                          </div>
                          <button
                            onClick={() => setShowAddCard(column.id)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                          >
                            <span className="text-gray-600 dark:text-gray-400 text-lg">+</span>
                          </button>
                        </div>
                      </div>

                      {/* Cards Container */}
                      <DroppableColumn columnId={column.id}>
                        {/* Add Card Form */}
                        {showAddCard === column.id && (
                          <div className="bg-gray-50 dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-700 rounded-xl p-3 md:p-4 space-y-3">
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
                              placeholder="Descrição"
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
                                className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition text-sm"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Cards */}
                        {columnCards.length === 0 && showAddCard !== column.id ? (
                          <div className="text-center py-8 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                            Arraste cards aqui
                          </div>
                        ) : (
                          columnCards.map(card => (
                            <SortableCard
                              key={card.id}
                              card={card}
                              onClick={() => setSelectedCard(card)}
                              isOverdue={isOverdue}
                            />
                          ))
                        )}
                      </DroppableColumn>
                    </div>
                  </SortableContext>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeCard ? (
            <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 md:p-4 w-72 md:w-80 shadow-2xl rotate-3 cursor-grabbing">
              <div className="flex items-start justify-between mb-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${PRIORITY_CONFIG[activeCard.priority].color}`}>
                  {PRIORITY_CONFIG[activeCard.priority].label}
                </span>
              </div>
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                {activeCard.title}
              </h4>
            </div>
          ) : null}
        </DragOverlay>
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-t-2xl md:rounded-2xl w-full md:max-w-2xl shadow-2xl border-t md:border border-gray-200 dark:border-slate-800 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 md:p-6 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-start justify-between gap-4">
                <input
                  type="text"
                  value={selectedCard.title}
                  onChange={(e) => updateCard(selectedCard.id, { title: e.target.value })}
                  className="flex-1 text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 bg-transparent border-none outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-700 rounded px-2 -mx-2 py-1"
                />
                <button
                  onClick={() => setSelectedCard(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  <span className="text-gray-500 text-xl">✕</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
              {/* Status */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {COLUMNS.map(col => (
                    <button
                      key={col.id}
                      onClick={() => updateCard(selectedCard.id, { status: col.id })}
                      className={`flex-shrink-0 px-3 md:px-4 py-2 rounded-xl transition text-xs md:text-sm font-medium ${
                        selectedCard.status === col.id
                          ? 'bg-gray-900 dark:bg-slate-700 text-white'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700'
                      }`}
                    >
                      {col.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={selectedCard.description}
                  onChange={(e) => updateCard(selectedCard.id, { description: e.target.value })}
                  placeholder="Adicione uma descrição..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 resize-none"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prioridade
                </label>
                <div className="grid grid-cols-2 md:flex gap-2">
                  {(Object.keys(PRIORITY_CONFIG) as Priority[]).map(priority => (
                    <button
                      key={priority}
                      onClick={() => updateCard(selectedCard.id, { priority })}
                      className={`px-3 md:px-4 py-2 rounded-xl transition text-xs md:text-sm font-medium border ${
                        selectedCard.priority === priority
                          ? PRIORITY_CONFIG[priority].color
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700'
                      }`}
                    >
                      {PRIORITY_CONFIG[priority].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Responsável
                </label>
                <input
                  type="text"
                  value={selectedCard.assignee}
                  onChange={(e) => updateCard(selectedCard.id, { assignee: e.target.value })}
                  placeholder="Nome da pessoa"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prazo
                </label>
                <input
                  type="date"
                  value={selectedCard.dueDate}
                  onChange={(e) => updateCard(selectedCard.id, { dueDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={selectedCard.tags.join(', ')}
                  onChange={(e) => updateCard(selectedCard.id, { tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                  placeholder="Backend, Bug, Urgente"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 md:p-6 border-t border-gray-200 dark:border-slate-800 flex flex-col-reverse md:flex-row gap-3">
              <button
                onClick={() => {
                  duplicateCard(selectedCard);
                  setSelectedCard(null);
                }}
                className="px-4 py-2.5 text-xs md:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition font-medium border border-gray-200 dark:border-slate-700"
              >
                Duplicar
              </button>
              <button
                onClick={() => deleteCard(selectedCard.id)}
                className="px-4 py-2.5 text-xs md:text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition font-medium border border-red-200 dark:border-red-800"
              >
                Excluir
              </button>
              <button
                onClick={() => setSelectedCard(null)}
                className="md:ml-auto px-6 py-2.5 text-xs md:text-sm bg-gray-900 dark:bg-slate-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition font-medium"
              >
                Salvar e Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  );
}
