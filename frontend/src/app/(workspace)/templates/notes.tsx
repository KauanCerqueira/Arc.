"use client";

import { useState } from 'react';
import { usePageTemplateData } from '@/core/hooks/usePageTemplateData';
import { WorkspaceTemplateComponentProps } from '@/core/types/workspace.types';
import { Plus, Search, Star, Trash2, Edit2, Hash, Archive } from 'lucide-react';

type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  favorite: boolean;
  archived: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
};

const NOTE_COLORS = [
  { name: 'Amarelo', class: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700' },
  { name: 'Verde', class: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700' },
  { name: 'Azul', class: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' },
  { name: 'Rosa', class: 'bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700' },
  { name: 'Roxo', class: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700' },
  { name: 'Laranja', class: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700' },
];

type NotesTemplateData = {
  notes: Note[];
};

const DEFAULT_NOTES: Note[] = [
    {
      id: '1',
      title: 'Ideias para Features',
      content: '- Sistema de notificações em tempo real\n- Dark mode automático baseado em horário\n- Integração com Slack\n- Templates customizáveis\n- Exportar para PDF',
      tags: ['ideias', 'features'],
      favorite: true,
      archived: false,
      color: NOTE_COLORS[0].class,
      createdAt: new Date(2025, 0, 10).toISOString(),
      updatedAt: new Date(2025, 0, 15).toISOString(),
    },
    {
      id: '2',
      title: 'Reunião com Cliente',
      content: 'Pontos discutidos:\n- Prazo: 30 dias\n- Budget: R$ 15.000\n- Features prioritárias: Auth + Dashboard\n- Próxima reunião: 22/01',
      tags: ['reunião', 'cliente'],
      favorite: false,
      archived: false,
      color: NOTE_COLORS[2].class,
      createdAt: new Date(2025, 0, 12).toISOString(),
      updatedAt: new Date(2025, 0, 12).toISOString(),
    },
    {
      id: '3',
      title: 'Links Úteis',
      content: 'Documentação:\n- Next.js Docs\n- Tailwind CSS\n- PostgreSQL Guide\n\nFerramentas:\n- Figma para design\n- Linear para tasks\n- Vercel para deploy',
      tags: ['recursos', 'dev'],
      favorite: true,
      archived: false,
      color: NOTE_COLORS[1].class,
      createdAt: new Date(2025, 0, 8).toISOString(),
      updatedAt: new Date(2025, 0, 14).toISOString(),
    },
    {
      id: '4',
      title: 'Bugs para Corrigir',
      content: '1. Loading spinner não aparece no login\n2. Dark mode quebra em algumas páginas\n3. Tabela não responsiva no mobile\n4. Validação de email aceita formato inválido',
      tags: ['bugs', 'urgent'],
      favorite: false,
      archived: false,
      color: NOTE_COLORS[3].class,
      createdAt: new Date(2025, 0, 16).toISOString(),
      updatedAt: new Date(2025, 0, 16).toISOString(),
    },
    {
      id: '5',
      title: 'Aprendizados da Sprint',
      content: 'O que funcionou:\n- Daily meetings às 9h\n- Code reviews em pares\n\nO que melhorar:\n- Estimativas mais precisas\n- Documentação em tempo real',
      tags: ['retrospectiva', 'agile'],
      favorite: false,
      archived: false,
      color: NOTE_COLORS[4].class,
      createdAt: new Date(2025, 0, 14).toISOString(),
      updatedAt: new Date(2025, 0, 14).toISOString(),
    },
  ];

const DEFAULT_DATA: NotesTemplateData = {
  notes: DEFAULT_NOTES,
};

export default function Notes({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData } = usePageTemplateData<NotesTemplateData>(groupId, pageId, DEFAULT_DATA);
  const notes = data.notes ?? DEFAULT_NOTES;

  const updateNotes = (updater: Note[] | ((current: Note[]) => Note[])) => {
    setData((current) => {
      const currentNotes = current.notes ?? DEFAULT_NOTES;
      const nextNotes =
        typeof updater === 'function'
          ? (updater as (current: Note[]) => Note[])(JSON.parse(JSON.stringify(currentNotes)))
          : updater;
      return {
        ...current,
        notes: nextNotes,
      };
    });
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'all' | 'favorites' | 'archived'>('all');

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)));

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'all' || note.tags.includes(selectedTag);
    const matchesView = viewMode === 'all' ? !note.archived :
                       viewMode === 'favorites' ? note.favorite && !note.archived :
                       note.archived;
    return matchesSearch && matchesTag && matchesView;
  });

  const toggleFavorite = (id: string) => {
    updateNotes(current =>
      current.map(note =>
        note.id === id ? { ...note, favorite: !note.favorite } : note
      )
    );
  };

  const toggleArchive = (id: string) => {
    updateNotes(current =>
      current.map(note =>
        note.id === id ? { ...note, archived: !note.archived } : note
      )
    );
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-auto">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Notas Rápidas</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Capture ideias, lembretes e anotações importantes
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Todas as tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setViewMode('favorites')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'favorites'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              <Star size={16} />
              Favoritas
            </button>
            <button
              onClick={() => setViewMode('archived')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'archived'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              <Archive size={16} />
              Arquivadas
            </button>
          </div>

          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors">
            <Plus size={18} />
            Nova Nota
          </button>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`${note.color} border-2 rounded-xl p-4 transition-all hover:shadow-lg group`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex-1">
                  {note.title}
                </h3>
                <button
                  onClick={() => toggleFavorite(note.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Star
                    size={18}
                    className={note.favorite ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600 dark:text-gray-400'}
                  />
                </button>
              </div>

              <div className="text-sm text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line line-clamp-6">
                {note.content}
              </div>

              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {note.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white/50 dark:bg-black/20 border border-gray-300 dark:border-gray-600 rounded text-xs font-medium text-gray-700 dark:text-gray-300"
                    >
                      <Hash size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex-1 p-2 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 transition-colors">
                  <Edit2 size={14} className="mx-auto" />
                </button>
                <button
                  onClick={() => toggleArchive(note.id)}
                  className="flex-1 p-2 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <Archive size={14} className="mx-auto" />
                </button>
                <button className="flex-1 p-2 bg-white/50 dark:bg-black/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  <Trash2 size={14} className="mx-auto" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Nenhuma nota encontrada
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total de Notas</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {notes.filter(n => !n.archived).length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Favoritas</div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {notes.filter(n => n.favorite && !n.archived).length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Tags Únicas</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {allTags.length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Arquivadas</div>
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {notes.filter(n => n.archived).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
