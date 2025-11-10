"use client"

import { useState } from 'react'
import { usePageTemplateData } from '@/core/hooks/usePageTemplateData'
import { WorkspaceTemplateComponentProps } from '@/core/types/workspace.types'
import { Plus, Search, Star, Trash2, Hash, Archive, StickyNote, MoreHorizontal, GripVertical } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'

type Note = {
  id: string
  title: string
  content: string
  tags: string[]
  favorite: boolean
  archived: boolean
  createdAt: string
  updatedAt: string
}

interface NotesTemplateData extends Record<string, unknown> {
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [draggedNote, setDraggedNote] = useState<Note | null>(null)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [isDraggable, setIsDraggable] = useState<string | null>(null)

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
    setOpenMenuId(null)
  }

  const toggleFavorite = (id: string) => {
    const note = notes.find((n) => n.id === id)
    if (note) {
      updateNote(id, { favorite: !note.favorite })
    }
    setOpenMenuId(null)
  }

  const toggleArchive = (id: string) => {
    const note = notes.find((n) => n.id === id)
    if (note) {
      updateNote(id, { archived: !note.archived })
    }
    setOpenMenuId(null)
  }

  const addTag = (noteId: string, tagInput: string) => {
    const tag = tagInput.trim()
    if (!tag) return

    const note = notes.find((n) => n.id === noteId)
    if (note && !note.tags.includes(tag)) {
      updateNote(noteId, { tags: [...note.tags, tag] })
    }
  }

  const removeTag = (noteId: string, tagToRemove: string) => {
    const note = notes.find((n) => n.id === noteId)
    if (note) {
      updateNote(noteId, { tags: note.tags.filter(t => t !== tagToRemove) })
    }
  }

  const handleDragStart = (note: Note, e: React.DragEvent) => {
    if (isDraggable !== note.id) {
      e.preventDefault()
      return
    }
    setDraggedNote(note)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetIndex: number) => {
    if (!draggedNote) return

    const currentIndex = filteredNotes.findIndex(n => n.id === draggedNote.id)
    if (currentIndex === targetIndex) return

    const reorderedNotes = [...notes]
    const draggedIndex = reorderedNotes.findIndex(n => n.id === draggedNote.id)
    const [removed] = reorderedNotes.splice(draggedIndex, 1)

    // Calculate the actual target index in the full notes array
    const targetNote = filteredNotes[targetIndex]
    const actualTargetIndex = reorderedNotes.findIndex(n => n.id === targetNote.id)

    reorderedNotes.splice(actualTargetIndex, 0, removed)

    setData(prev => ({ ...prev, notes: reorderedNotes }))
    setDraggedNote(null)
    setIsDraggable(null)
  }

  const handleDragEnd = () => {
    setDraggedNote(null)
    setIsDraggable(null)
  }

  return (
    <div className="h-full flex flex-col bg-arc-primary">
      {/* Header Fixo */}
      <div className="sticky top-0 z-10 bg-arc-primary border-b border-arc backdrop-blur-sm bg-opacity-95">
        <div className="px-3 sm:px-6 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <h1 className="text-base sm:text-lg font-semibold text-arc">Notas</h1>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-arc-muted w-3.5 h-3.5" />
                <Input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* View Mode Tabs */}
              <div className="hidden sm:flex border border-arc rounded-lg p-0.5 bg-arc-secondary">
                <button
                  onClick={() => setViewMode('all')}
                  className={cn(
                    'px-2.5 py-1 rounded text-xs transition-colors',
                    viewMode === 'all' ? 'bg-arc-primary shadow-sm text-arc' : 'text-arc-muted hover:text-arc'
                  )}
                >
                  Todas
                </button>
                <button
                  onClick={() => setViewMode('favorites')}
                  className={cn(
                    'px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1',
                    viewMode === 'favorites' ? 'bg-arc-primary shadow-sm text-arc' : 'text-arc-muted hover:text-arc'
                  )}
                >
                  <Star className="w-3 h-3" />
                  <span>Favoritas</span>
                </button>
                <button
                  onClick={() => setViewMode('archived')}
                  className={cn(
                    'px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1',
                    viewMode === 'archived' ? 'bg-arc-primary shadow-sm text-arc' : 'text-arc-muted hover:text-arc'
                  )}
                >
                  <Archive className="w-3 h-3" />
                  <span>Arquivadas</span>
                </button>
              </div>

              {/* Mobile View Mode */}
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as any)}
                className="sm:hidden px-2 py-1 border border-arc rounded-lg bg-arc-secondary text-arc text-xs focus:outline-none focus:ring-2 focus:ring-arc h-8"
              >
                <option value="all">Todas</option>
                <option value="favorites">Favoritas</option>
                <option value="archived">Arquivadas</option>
              </select>

              {/* Tags Filter */}
              {allTags.length > 0 && (
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="hidden md:block px-2 py-1 border border-arc rounded-lg bg-arc-secondary text-arc text-xs focus:outline-none focus:ring-2 focus:ring-arc h-8 max-w-[120px]"
                >
                  <option value="all">Todas tags</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      #{tag}
                    </option>
                  ))}
                </select>
              )}

              <Button onClick={addNote} size="sm" className="h-8 px-2.5">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        {notes.length === 0 && viewMode === 'all' && !searchQuery ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 bg-arc-secondary rounded-lg flex items-center justify-center">
                <StickyNote className="w-8 h-8 text-arc-muted" />
              </div>
              <h2 className="text-lg font-semibold text-arc mb-2">Nenhuma nota ainda</h2>
              <p className="text-sm text-arc-muted mb-6">
                Capture ideias, lembretes e anotações importantes
              </p>
              <Button onClick={addNote} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Nota
              </Button>
            </div>
          </div>
        ) : filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredNotes.map((note, index) => (
              <div
                key={note.id}
                draggable={isDraggable === note.id}
                onDragStart={(e) => handleDragStart(note, e)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "group relative border border-arc rounded-lg p-4 bg-gray-100 dark:bg-gray-800 hover:shadow-md transition-all",
                  isDraggable === note.id && "cursor-move opacity-50"
                )}
              >
                {/* Drag Handle */}
                <div
                  className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                  onMouseDown={() => setIsDraggable(note.id)}
                  onMouseUp={() => setIsDraggable(null)}
                >
                  <GripVertical className="w-4 h-4 text-arc-muted" />
                </div>

                {/* Menu Button */}
                <div className="absolute top-2 right-2">
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === note.id ? null : note.id)}
                      className="p-1 hover:bg-arc-secondary rounded transition-colors cursor-pointer"
                    >
                      <MoreHorizontal className="w-4 h-4 text-arc-muted hover:text-arc" />
                    </button>

                    {/* Dropdown Menu */}
                    {openMenuId === note.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 top-8 z-20 w-44 bg-arc-primary border border-arc rounded-lg shadow-lg py-1">
                          <button
                            onClick={() => toggleFavorite(note.id)}
                            className="w-full px-4 py-2 text-left text-sm text-arc hover:bg-arc-secondary transition-colors flex items-center gap-2"
                          >
                            <Star className={cn(
                              'w-4 h-4',
                              note.favorite && 'fill-yellow-500 text-yellow-500'
                            )} />
                            {note.favorite ? 'Desfavoritar' : 'Favoritar'}
                          </button>
                          <button
                            onClick={() => toggleArchive(note.id)}
                            className="w-full px-4 py-2 text-left text-sm text-arc hover:bg-arc-secondary transition-colors flex items-center gap-2"
                          >
                            <Archive className="w-4 h-4" />
                            {note.archived ? 'Desarquivar' : 'Arquivar'}
                          </button>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Deletar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Header */}
                <div className="mb-3 pl-6 pr-6">
                  <input
                    type="text"
                    value={note.title}
                    onChange={(e) => updateNote(note.id, { title: e.target.value })}
                    onFocus={() => setEditingNoteId(note.id)}
                    className="w-full font-semibold text-arc bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-arc rounded px-2 -ml-2 py-1"
                    placeholder="Título da nota"
                  />
                </div>

                {/* Content */}
                <textarea
                  value={note.content}
                  onChange={(e) => updateNote(note.id, { content: e.target.value })}
                  onFocus={() => setEditingNoteId(note.id)}
                  className="w-full text-sm text-arc mb-3 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-arc rounded p-2 -m-2 resize-none min-h-[140px] leading-relaxed"
                  placeholder="Escreva aqui..."
                />

                {/* Tags */}
                <div className="mb-3">
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {note.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => removeTag(note.id, tag)}
                          className="group/tag inline-flex items-center gap-1 px-2 py-0.5 bg-arc-primary border border-arc rounded text-xs text-arc-muted hover:text-red-600 hover:border-red-600 transition-colors"
                        >
                          <Hash className="w-3 h-3" />
                          <span>{tag}</span>
                          <span className="opacity-0 group-hover/tag:opacity-100">×</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {editingNoteId === note.id && (
                    <input
                      type="text"
                      placeholder="Adicionar tag (Enter)..."
                      className="w-full text-xs px-2 py-1 bg-arc-primary border border-arc rounded text-arc placeholder-arc-muted focus:outline-none focus:ring-1 focus:ring-arc"
                      onBlur={() => {
                        // Delay to allow tag addition before hiding
                        setTimeout(() => setEditingNoteId(null), 200)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement
                          addTag(note.id, input.value)
                          input.value = ''
                        }
                      }}
                    />
                  )}
                </div>

                {/* Timestamp */}
                <div className="pt-3 border-t border-arc">
                  <p className="text-xs text-arc-muted">
                    {new Date(note.updatedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Search className="w-12 h-12 mx-auto mb-3 text-arc-muted opacity-50" />
              <p className="text-arc font-medium mb-1">Nenhuma nota encontrada</p>
              <p className="text-sm text-arc-muted">Tente ajustar os filtros ou criar uma nova nota</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
