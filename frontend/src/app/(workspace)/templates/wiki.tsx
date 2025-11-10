"use client"

import { useState, useMemo } from 'react'
import { usePageTemplateData } from '@/core/hooks/usePageTemplateData'
import { WorkspaceTemplateComponentProps } from '@/core/types/workspace.types'
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  FileText,
  Tag,
  User,
  Menu,
  X,
  MoreHorizontal,
  Edit3,
  Star,
  Hash,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import dynamic from 'next/dynamic'

// Importar o Blank dinamicamente para evitar problemas de SSR
const BlankTemplate = dynamic(() => import('./blank'), { ssr: false })

type WikiArticle = {
  id: string
  title: string
  content: string // Agora armazena o HTML do blank
  tags: string[]
  author: string
  createdAt: string
  updatedAt: string
  published: boolean
  favorite: boolean
}

const DEFAULT_ARTICLES: WikiArticle[] = [
  {
    id: '1',
    title: 'Bem-vindo ao Arc.',
    content: '<h1>Bem-vindo ao Arc.</h1><p>Arc. é uma plataforma de gerenciamento de projetos moderna e flexível.</p>',
    tags: ['introdução', 'guia'],
    author: 'Admin',
    createdAt: new Date(2025, 0, 1).toISOString(),
    updatedAt: new Date(2025, 0, 15).toISOString(),
    published: true,
    favorite: true,
  },
]

type WikiData = {
  articles: WikiArticle[]
  editingArticleId: string | null
}

const DEFAULT_DATA: WikiData = {
  articles: DEFAULT_ARTICLES,
  editingArticleId: null,
}

export default function Wiki({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData } = usePageTemplateData<WikiData>(groupId, pageId, DEFAULT_DATA)
  const articles = data.articles ?? DEFAULT_ARTICLES
  const editingArticleId = data.editingArticleId ?? null

  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    editingArticleId || articles[0]?.id || null
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTag, setFilterTag] = useState<string>('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const selectedArticle = selectedArticleId
    ? articles.find((article) => article.id === selectedArticleId) ?? null
    : null

  const allTags = useMemo(() => Array.from(new Set(articles.flatMap((a) => a.tags))), [articles])

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesTag = filterTag === 'all' || article.tags.includes(filterTag)
    return matchesSearch && matchesTag
  })

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  const createArticle = () => {
    const newArticle: WikiArticle = {
      id: `article-${Date.now()}`,
      title: 'Novo Artigo',
      content: '<p>Escreva seu conteúdo aqui...</p>',
      tags: [],
      author: 'Você',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      published: false,
      favorite: false,
    }

    setData((current) => ({
      ...current,
      articles: [...(current.articles || []), newArticle],
      editingArticleId: newArticle.id,
    }))
    setSelectedArticleId(newArticle.id)
    setSidebarOpen(false)
  }

  const deleteArticle = (id: string) => {
    if (confirm('Deletar este artigo?')) {
      const nextArticles = articles.filter((a) => a.id !== id)
      setData((current) => ({
        ...current,
        articles: nextArticles,
        editingArticleId: null,
      }))

      if (selectedArticleId === id) {
        setSelectedArticleId(nextArticles[0]?.id || null)
      }
    }
    setOpenMenuId(null)
  }

  const togglePublished = (id: string) => {
    setData((current) => ({
      ...current,
      articles: (current.articles || []).map((a) =>
        a.id === id ? { ...a, published: !a.published, updatedAt: new Date().toISOString() } : a
      ),
    }))
    setOpenMenuId(null)
  }

  const toggleFavorite = (id: string) => {
    setData((current) => ({
      ...current,
      articles: (current.articles || []).map((a) =>
        a.id === id ? { ...a, favorite: !a.favorite, updatedAt: new Date().toISOString() } : a
      ),
    }))
    setOpenMenuId(null)
  }

  const startEditing = (id: string) => {
    setData((current) => ({
      ...current,
      editingArticleId: id,
    }))
    setSelectedArticleId(id)
    setSidebarOpen(false)
    setOpenMenuId(null)
  }

  const stopEditing = () => {
    setData((current) => ({
      ...current,
      editingArticleId: null,
    }))
  }

  const updateArticleContent = (id: string, content: string) => {
    setData((current) => ({
      ...current,
      articles: (current.articles || []).map((a) =>
        a.id === id ? { ...a, content, updatedAt: new Date().toISOString() } : a
      ),
    }))
  }

  const updateArticleTitle = (id: string, title: string) => {
    setData((current) => ({
      ...current,
      articles: (current.articles || []).map((a) =>
        a.id === id ? { ...a, title, updatedAt: new Date().toISOString() } : a
      ),
    }))
  }

  const updateArticleTags = (id: string, tags: string[]) => {
    setData((current) => ({
      ...current,
      articles: (current.articles || []).map((a) =>
        a.id === id ? { ...a, tags, updatedAt: new Date().toISOString() } : a
      ),
    }))
  }

  const addTag = (id: string, tag: string) => {
    const trimmedTag = tag.trim()
    if (!trimmedTag) return

    setData((current) => ({
      ...current,
      articles: (current.articles || []).map((a) => {
        if (a.id === id && !a.tags.includes(trimmedTag)) {
          return { ...a, tags: [...a.tags, trimmedTag], updatedAt: new Date().toISOString() }
        }
        return a
      }),
    }))
  }

  const removeTag = (id: string, tag: string) => {
    setData((current) => ({
      ...current,
      articles: (current.articles || []).map((a) =>
        a.id === id ? { ...a, tags: a.tags.filter((t) => t !== tag), updatedAt: new Date().toISOString() } : a
      ),
    }))
  }

  const isEditing = editingArticleId === selectedArticleId

  return (
    <div className="h-full flex bg-arc-primary">
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed md:relative inset-y-0 left-0 z-50 md:z-0 w-80 border-r border-arc bg-arc-primary flex flex-col transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex-shrink-0 p-4 border-b border-arc">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-arc">Wiki</h2>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 hover:bg-arc-secondary rounded">
              <X className="w-5 h-5 text-arc-muted" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-arc-muted w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar artigos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Filter Tags */}
          {allTags.length > 0 && (
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="w-full px-3 py-2 border border-arc rounded-lg bg-arc-secondary text-arc text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Articles List */}
        <div className="flex-1 overflow-y-auto p-3">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-8 px-4">
              <FileText className="w-12 h-12 text-arc-muted mx-auto mb-3 opacity-50" />
              <p className="text-sm text-arc-muted">
                {searchQuery || filterTag !== 'all' ? 'Nenhum artigo encontrado' : 'Nenhum artigo ainda'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => {
                    setSelectedArticleId(article.id)
                    setSidebarOpen(false)
                  }}
                  className={cn(
                    'group relative p-3 rounded-lg border border-arc cursor-pointer transition-all',
                    selectedArticle?.id === article.id
                      ? 'bg-arc-secondary shadow-sm'
                      : 'hover:bg-arc-secondary/50'
                  )}
                >
                  {/* Menu */}
                  <div className="absolute top-2 right-2">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuId(openMenuId === article.id ? null : article.id)
                        }}
                        className="p-1 hover:bg-arc-primary rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="w-4 h-4 text-arc-muted" />
                      </button>

                      {openMenuId === article.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 top-8 z-20 w-44 bg-arc-primary border border-arc rounded-lg shadow-lg py-1">
                            <button
                              onClick={() => startEditing(article.id)}
                              className="w-full px-4 py-2 text-left text-sm text-arc hover:bg-arc-secondary transition-colors flex items-center gap-2"
                            >
                              <Edit3 className="w-4 h-4" />
                              Editar
                            </button>
                            <button
                              onClick={() => toggleFavorite(article.id)}
                              className="w-full px-4 py-2 text-left text-sm text-arc hover:bg-arc-secondary transition-colors flex items-center gap-2"
                            >
                              <Star className={cn('w-4 h-4', article.favorite && 'fill-yellow-500 text-yellow-500')} />
                              {article.favorite ? 'Desfavoritar' : 'Favoritar'}
                            </button>
                            <button
                              onClick={() => togglePublished(article.id)}
                              className="w-full px-4 py-2 text-left text-sm text-arc hover:bg-arc-secondary transition-colors flex items-center gap-2"
                            >
                              {article.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              {article.published ? 'Tornar rascunho' : 'Publicar'}
                            </button>
                            <button
                              onClick={() => deleteArticle(article.id)}
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

                  <div className="flex items-start gap-2 mb-2 pr-8">
                    {article.favorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0 mt-0.5" />}
                    <h3 className="font-medium text-arc text-sm flex-1 line-clamp-2">{article.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-arc-muted mb-2">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(article.updatedAt)}</span>
                    {!article.published && (
                      <>
                        <span>•</span>
                        <span className="text-yellow-600 dark:text-yellow-400">Rascunho</span>
                      </>
                    )}
                  </div>

                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-arc-primary border border-arc rounded text-xs text-arc-muted"
                        >
                          {tag}
                        </span>
                      ))}
                      {article.tags.length > 3 && (
                        <span className="text-xs text-arc-muted">+{article.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Article Button */}
        <div className="flex-shrink-0 p-4 border-t border-arc">
          <Button onClick={createArticle} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Novo Artigo
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-arc-primary border-b border-arc backdrop-blur-sm bg-opacity-95">
          <div className="px-3 sm:px-6 py-2.5 sm:py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 hover:bg-arc-secondary rounded-lg">
                  <Menu className="w-5 h-5 text-arc" />
                </button>

                {selectedArticle && (
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        value={selectedArticle.title}
                        onChange={(e) => updateArticleTitle(selectedArticle.id, e.target.value)}
                        className="w-full bg-transparent border-none text-base sm:text-lg font-semibold text-arc focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 -ml-2"
                      />
                    ) : (
                      <h1 className="text-base sm:text-lg font-semibold text-arc truncate">{selectedArticle.title}</h1>
                    )}
                    <div className="flex items-center gap-2 text-xs text-arc-muted mt-0.5">
                      <User className="w-3 h-3" />
                      <span>{selectedArticle.author}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(selectedArticle.updatedAt)}</span>
                    </div>
                  </div>
                )}
              </div>

              {selectedArticle && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isEditing ? (
                    <Button onClick={stopEditing} size="sm" variant="outline">
                      Concluir Edição
                    </Button>
                  ) : (
                    <Button onClick={() => startEditing(selectedArticle.id)} size="sm">
                      <Edit3 className="w-4 h-4 sm:mr-1.5" />
                      <span className="hidden sm:inline">Editar</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedArticle ? (
            isEditing ? (
              // Modo de Edição com Blank Template
              <div className="h-full flex flex-col">
                {/* Tags Manager */}
                <div className="border-b border-arc bg-arc-secondary px-3 sm:px-6 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 text-arc-muted flex-shrink-0">
                      <Hash className="w-4 h-4" />
                      <span className="text-xs font-medium">Tags:</span>
                    </div>
                    <div className="flex flex-wrap gap-2 flex-1">
                      {selectedArticle.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => removeTag(selectedArticle.id, tag)}
                          className="group inline-flex items-center gap-1 px-2.5 py-1 bg-arc-primary border border-arc rounded-full text-xs font-medium text-arc hover:border-red-500 hover:text-red-600 transition-colors"
                        >
                          <Hash className="w-3 h-3" />
                          <span>{tag}</span>
                          <X className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                      <input
                        type="text"
                        placeholder="Digite e pressione Enter..."
                        className="flex-1 min-w-[150px] px-3 py-1 text-xs bg-transparent border border-arc rounded-full text-arc placeholder-arc-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.currentTarget
                            if (input.value.trim()) {
                              addTag(selectedArticle.id, input.value)
                              input.value = ''
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Editor */}
                <div className="flex-1 overflow-y-auto">
                  <BlankTemplate
                    groupId={groupId}
                    pageId={`${pageId}-${selectedArticle.id}`}
                    onContentChange={(content) => updateArticleContent(selectedArticle.id, content)}
                    initialContent={selectedArticle.content}
                  />
                </div>
              </div>
            ) : (
              // Modo de Visualização
              <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
                {selectedArticle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-arc">
                    {selectedArticle.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-arc-secondary border border-arc rounded-full text-sm font-medium text-arc"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div
                  className="prose prose-gray dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                />
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6">
              <div className="w-16 h-16 mb-4 bg-arc-secondary rounded-lg flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-arc-muted" />
              </div>
              <h3 className="text-lg font-semibold text-arc mb-2">Selecione um artigo</h3>
              <p className="text-arc-muted text-center mb-6">Escolha um artigo na barra lateral ou crie um novo</p>
              <Button onClick={createArticle}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Artigo
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
