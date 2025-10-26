'use client'

import { useState } from 'react'
import {
  FileText,
  Folder,
  Upload,
  Search,
  Star,
  MoreVertical,
  Download,
  Trash2,
  Edit2,
  Share2,
  Grid3x3,
  List,
  ArrowUpDown,
  Filter,
  Plus,
  FolderPlus,
  Eye,
  Copy,
  ChevronRight,
  File,
  Image,
  FileCode,
  Archive,
  X,
  Tag,
  Calendar,
  HardDrive,
} from 'lucide-react'

type ViewMode = 'grid' | 'list'
type SortBy = 'name' | 'date' | 'size' | 'type'
type SortOrder = 'asc' | 'desc'

type Document = {
  id: string
  name: string
  type: 'pdf' | 'doc' | 'image' | 'code' | 'archive' | 'other'
  size: number
  folder: string
  tags: string[]
  favorite: boolean
  lastModified: Date
  author: string
}

type Folder = {
  id: string
  name: string
  parent: string | null
  color: string
}

export default function DocumentsTemplate() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Especificações Técnicas.pdf',
      type: 'pdf',
      size: 2457600,
      folder: 'docs',
      tags: ['importante', 'técnico'],
      favorite: true,
      lastModified: new Date('2025-01-15'),
      author: 'João Silva',
    },
    {
      id: '2',
      name: 'Diagrama de Arquitetura.png',
      type: 'image',
      size: 876544,
      folder: 'design',
      tags: ['arquitetura', 'visual'],
      favorite: false,
      lastModified: new Date('2025-01-14'),
      author: 'Maria Costa',
    },
    {
      id: '3',
      name: 'Código Fonte.zip',
      type: 'archive',
      size: 5242880,
      folder: 'code',
      tags: ['código', 'backup'],
      favorite: true,
      lastModified: new Date('2025-01-12'),
      author: 'João Silva',
    },
    {
      id: '4',
      name: 'Contrato Cliente.docx',
      type: 'doc',
      size: 1228800,
      folder: 'docs',
      tags: ['contrato', 'legal'],
      favorite: false,
      lastModified: new Date('2025-01-10'),
      author: 'Ana Santos',
    },
  ])

  const [folders, setFolders] = useState<Folder[]>([
    { id: 'docs', name: 'Documentação', parent: null, color: 'blue' },
    { id: 'design', name: 'Design', parent: null, color: 'purple' },
    { id: 'code', name: 'Código', parent: null, color: 'green' },
  ])

  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [showMenu, setShowMenu] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  // Formatar tamanho de arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Formatar data
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  // Ícone por tipo de arquivo
  const getFileIcon = (type: Document['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />
      case 'doc':
        return <FileText className="w-5 h-5 text-blue-600" />
      case 'image':
        return <Image className="w-5 h-5 text-purple-600" />
      case 'code':
        return <FileCode className="w-5 h-5 text-green-600" />
      case 'archive':
        return <Archive className="w-5 h-5 text-orange-600" />
      default:
        return <File className="w-5 h-5 text-gray-600" />
    }
  }

  // Cor de fundo por tipo
  const getTypeColor = (type: Document['type']) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800'
      case 'doc':
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
      case 'image':
        return 'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800'
      case 'code':
        return 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800'
      case 'archive':
        return 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800'
      default:
        return 'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700'
    }
  }

  // Filtrar e ordenar documentos
  const getFilteredDocs = () => {
    let filtered = documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesFolder = currentFolder === null || doc.folder === currentFolder
      return matchesSearch && matchesFolder
    })

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'date':
          comparison = b.lastModified.getTime() - a.lastModified.getTime()
          break
        case 'size':
          comparison = a.size - b.size
          break
        case 'type':
          comparison = a.type.localeCompare(b.type)
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }

  const filteredDocs = getFilteredDocs()
  const totalSize = documents.reduce((acc, doc) => acc + doc.size, 0)
  const favoriteDocs = documents.filter(doc => doc.favorite)

  // Toggle favorito
  const toggleFavorite = (id: string) => {
    setDocuments(docs => docs.map(doc =>
      doc.id === id ? { ...doc, favorite: !doc.favorite } : doc
    ))
  }

  // Toggle seleção
  const toggleSelection = (id: string) => {
    setSelectedDocs(prev =>
      prev.includes(id)
        ? prev.filter(docId => docId !== id)
        : [...prev, id]
    )
  }

  // Deletar documento
  const deleteDocument = (id: string) => {
    if (confirm('Excluir este documento?')) {
      setDocuments(docs => docs.filter(doc => doc.id !== id))
      setSelectedDocs(prev => prev.filter(docId => docId !== id))
    }
    setShowMenu(null)
  }

  // Breadcrumb
  const getBreadcrumb = () => {
    if (!currentFolder) return []
    const folder = folders.find(f => f.id === currentFolder)
    return folder ? [folder] : []
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex-none border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {/* Top Bar */}
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gerenciador de Documentos</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {documents.length} documentos • {formatFileSize(totalSize)} total
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFolderModal(true)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition flex items-center gap-2 font-medium"
              >
                <FolderPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Nova Pasta</span>
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar documentos, tags..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode */}
              <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                >
                  <Grid3x3 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                >
                  <List className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                </button>
              </div>

              {/* Sort */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-')
                  setSortBy(by as SortBy)
                  setSortOrder(order as SortOrder)
                }}
                className="px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
              >
                <option value="name-asc">Nome (A-Z)</option>
                <option value="name-desc">Nome (Z-A)</option>
                <option value="date-desc">Mais Recente</option>
                <option value="date-asc">Mais Antigo</option>
                <option value="size-asc">Menor Tamanho</option>
                <option value="size-desc">Maior Tamanho</option>
              </select>
            </div>
          </div>
        </div>

        {/* Breadcrumb e Pastas */}
        <div className="px-4 md:px-6 pb-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <button
              onClick={() => setCurrentFolder(null)}
              className={`hover:text-gray-900 dark:hover:text-gray-100 transition ${currentFolder === null ? 'text-gray-900 dark:text-gray-100 font-medium' : ''}`}
            >
              Todos os Arquivos
            </button>
            {getBreadcrumb().map((folder) => (
              <div key={folder.id} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 dark:text-gray-100 font-medium">{folder.name}</span>
              </div>
            ))}
          </div>

          {/* Pastas */}
          {currentFolder === null && (
            <div className="flex gap-2 flex-wrap">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setCurrentFolder(folder.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all hover:shadow-md ${
                    folder.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' :
                    folder.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300' :
                    'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  <span className="font-medium">{folder.name}</span>
                  <span className="text-xs opacity-75">
                    ({documents.filter(d => d.folder === folder.id).length})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-slate-950">
        {/* Favoritos */}
        {currentFolder === null && favoriteDocs.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Favoritos</h2>
            </div>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}>
              {favoriteDocs.map((doc) => (
                viewMode === 'grid' ? (
                  <DocumentGridCard key={doc.id} doc={doc} />
                ) : (
                  <DocumentListRow key={doc.id} doc={doc} />
                )
              ))}
            </div>
          </div>
        )}

        {/* Todos os Documentos */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {currentFolder ? folders.find(f => f.id === currentFolder)?.name : 'Todos os Documentos'}
          </h2>

          {filteredDocs.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}>
              {filteredDocs.map((doc) => (
                viewMode === 'grid' ? (
                  <DocumentGridCard key={doc.id} doc={doc} />
                ) : (
                  <DocumentListRow key={doc.id} doc={doc} />
                )
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Nenhum documento encontrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery ? 'Tente uma busca diferente' : 'Faça upload do seu primeiro documento'}
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium inline-flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Fazer Upload
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-slate-800">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Upload de Documentos</h2>
              <button onClick={() => setShowUploadModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-12 text-center hover:border-blue-500 dark:hover:border-blue-500 transition cursor-pointer">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Suporta PDF, DOC, imagens, arquivos ZIP e mais
                </p>
              </div>
            </div>

            <div className="p-6 pt-4 border-t border-gray-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Fazer Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-slate-800">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Nova Pasta</h2>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome da Pasta
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Ex: Contratos"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                autoFocus
              />
            </div>

            <div className="p-6 pt-4 border-t border-gray-200 dark:border-slate-800 flex gap-3">
              <button
                onClick={() => {
                  setShowFolderModal(false)
                  setNewFolderName('')
                }}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // Criar pasta
                  setShowFolderModal(false)
                  setNewFolderName('')
                }}
                disabled={!newFolderName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Grid Card Component
  function DocumentGridCard({ doc }: { doc: Document }) {
    return (
      <div className={`rounded-xl border-2 p-4 hover:shadow-lg transition-all cursor-pointer group ${getTypeColor(doc.type)}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getFileIcon(doc.type)}
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">{doc.type}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(doc.id)
              }}
              className="p-1 hover:bg-white/50 dark:hover:bg-black/20 rounded transition opacity-0 group-hover:opacity-100"
            >
              <Star className={`w-4 h-4 ${doc.favorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1 hover:bg-white/50 dark:hover:bg-black/20 rounded transition opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate" title={doc.name}>
          {doc.name}
        </h3>

        <div className="flex flex-wrap gap-1 mb-3">
          {doc.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-white/60 dark:bg-black/20 rounded-full text-gray-700 dark:text-gray-300">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>{formatFileSize(doc.size)}</span>
          <span>{formatDate(doc.lastModified)}</span>
        </div>
      </div>
    )
  }

  // List Row Component
  function DocumentListRow({ doc }: { doc: Document }) {
    return (
      <div className={`rounded-lg border p-3 hover:shadow-md transition-all cursor-pointer group ${getTypeColor(doc.type)}`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getFileIcon(doc.type)}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{doc.name}</h3>
              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                <span>{doc.author}</span>
                <span>•</span>
                <span>{formatDate(doc.lastModified)}</span>
                <span>•</span>
                <span>{formatFileSize(doc.size)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {doc.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs px-2 py-1 bg-white/60 dark:bg-black/20 rounded-full text-gray-700 dark:text-gray-300">
                {tag}
              </span>
            ))}

            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(doc.id)
              }}
              className="p-1.5 hover:bg-white/50 dark:hover:bg-black/20 rounded transition opacity-0 group-hover:opacity-100"
            >
              <Star className={`w-4 h-4 ${doc.favorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
            </button>

            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 hover:bg-white/50 dark:hover:bg-black/20 rounded transition opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    )
  }
}
