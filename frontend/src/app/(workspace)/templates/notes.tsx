"use client"

import { useState } from 'react'
import { usePageTemplateData } from '@/core/hooks/usePageTemplateData'
import { WorkspaceTemplateComponentProps } from '@/core/types/workspace.types'
import { Plus, Search, Star, Trash2, Hash, Archive } from 'lucide-react'

type Note = {
  id: string
  title: string
  content: string
  tags: string[]
  favorite: boolean
  archived: boolean
  color: string
  createdAt: string
  updatedAt: string
}

const NOTE_COLORS = [
  { id: 'yellow', name: 'Amarelo', class: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700' },
  { id: 'green', name: 'Verde', class: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700' },
  { id: 'blue', name: 'Azul', class: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' },
  { id: 'pink', name: 'Rosa', class: 'bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700' },
  { id: 'purple', name: 'Roxo', class: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700' },
  { id: 'orange', name: 'Laranja', class: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700' },
]

type NotesTemplateData = {
  notes: Note[]
}

const DEFAULT_DATA: NotesTemplateData = {
  notes: [],
}

export default function Notes({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData } = usePageTemplateData<NotesTemplateData>(groupId, pageId, DEFAULT_DATA)
  const notes = data.notes ?? []

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'all' | 'favorites' | 'archived'>('all')

  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags)))

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = selectedTag === 'all' || note.tags.includes(selectedTag)
    const matchesView =
      viewMode === 'all'
        ? !note.archived
        : viewMode === 'favorites'
        ? note.favorite && !note.archived
        : note.archived
    return matchesSearch && matchesTag && matchesView
  })

  const addNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'Nova Nota',
      content: '',
      tags: [],
      favorite: false,
      archived: false,
      color: NOTE_COLORS[0].class,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setData((current) => ({
      ...current,
      notes: [...(current.notes || []), newNote],
    }))
  }

  const updateNote = (id: string, updates: Partial<Note>) => {
    setData((current) => ({
      ...current,
      notes: (current.notes || []).map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
      ),
    }))
  }

  const deleteNote = (id: string) => {
    if (confirm('Deletar esta nota?')) {
      setData((current) => ({
        ...current,
        notes: (current.notes || []).filter((n) => n.id !== id),
      }))
    }
  }

  const toggleFavorite = (id: string) => {
    updateNote(id, { favorite: !notes.find((n) => n.id === id)?.favorite })
  }

  const toggleArchive = (id: string) => {
    updateNote(id, { archived: !notes.find((n) => n.id === id)?.archived })
  }

  if (notes.length === 0 && viewMode === 'all' && !searchQuery) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
            <span className="text-4xl">📝</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Comece suas anotações</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Capture ideias, lembretes e anotações importantes
          </p>
          <button
            onClick={addNote}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Criar Primeira Nota
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <div className="flex-none border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notas</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {filteredNotes.length} {filteredNotes.length === 1 ? 'nota' : 'notas'}
            </p>
          </div>
          <button
            onClick={addNote}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Nota
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Buscar notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas as tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setViewMode('favorites')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'favorites'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
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
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <Archive size={16} />
              Arquivadas
            </button>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredNotes.map((note) => (
              <div key={note.id} className={`${note.color} border-2 rounded-xl p-4 transition-all hover:shadow-lg group`}>
                <div className="flex items-start justify-between mb-3">
                  <input
                    type="text"
                    value={note.title}
                    onChange={(e) => updateNote(note.id, { title: e.target.value })}
                    className="flex-1 text-lg font-bold text-gray-900 dark:text-gray-100 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 -ml-2"
                  />
                  <button onClick={() => toggleFavorite(note.id)} className="ml-2">
                    <Star
                      size={18}
                      className={note.favorite ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600 dark:text-gray-400'}
                    />
                  </button>
                </div>

                <textarea
                  value={note.content}
                  onChange={(e) => updateNote(note.id, { content: e.target.value })}
                  className="w-full text-sm text-gray-700 dark:text-gray-300 mb-4 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-2 -m-2 resize-none min-h-[100px]"
                  placeholder="Escreva aqui..."
                />

                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {note.tags.map((tag) => (
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
                  <button
                    onClick={() => toggleArchive(note.id)}
                    className="flex-1 p-2 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 transition-colors text-xs"
                  >
                    <Archive size={14} className="mx-auto" />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="flex-1 p-2 bg-white/50 dark:bg-black/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors text-xs"
                  >
                    <Trash2 size={14} className="mx-auto" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Nenhuma nota encontrada</p>
            <p className="text-sm">Tente ajustar os filtros ou criar uma nova nota</p>
          </div>
        )}
      </div>
    </div>
  )
}
