'use client'

import { useState } from 'react'
import { usePageTemplateData } from '@/core/hooks/usePageTemplateData'
import { WorkspaceTemplateComponentProps } from '@/core/types/workspace.types'
import {
  Cloud,
  Search,
  Upload,
  Star,
  MoreHorizontal,
  Folder,
  FileText,
  Image,
  FileCode,
  Archive,
  File,
  Download,
  Trash2,
  Share2,
  ExternalLink,
  Grid3x3,
  List,
  RefreshCw,
  Link as LinkIcon,
  FolderOpen,
  Clock,
  Users,
  Filter,
  ChevronRight,
  Plus,
  X,
  Check,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'

type ViewMode = 'grid' | 'list'
type FilterMode = 'all' | 'my-drive' | 'shared' | 'recent' | 'starred'

type GoogleDriveFile = {
  id: string
  name: string
  mimeType: string
  size: number
  modifiedTime: string
  createdTime: string
  owners: string[]
  shared: boolean
  starred: boolean
  webViewLink: string
  thumbnailLink?: string
  iconLink: string
}

type DocumentsTemplateData = {
  files: GoogleDriveFile[]
  connected: boolean
  lastSync?: string
  currentFolder?: string
}

const DEFAULT_DATA: DocumentsTemplateData = {
  files: [],
  connected: false,
}

export default function DocumentsTemplate({ groupId, pageId }: WorkspaceTemplateComponentProps) {
  const { data, setData } = usePageTemplateData<DocumentsTemplateData>(groupId, pageId, DEFAULT_DATA)
  const files = data.files ?? []
  const isConnected = data.connected ?? false

  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Formatar tamanho de arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  // Formatar data relativa
  const formatRelativeDate = (isoDate: string): string => {
    const date = new Date(isoDate)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hoje'
    if (diffDays === 1) return 'Ontem'
    if (diffDays < 7) return `${diffDays} dias atrás`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Ícone por tipo de arquivo
  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('folder')) return <Folder className="w-5 h-5 text-blue-500" />
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />
    if (mimeType.includes('image')) return <Image className="w-5 h-5 text-purple-500" />
    if (mimeType.includes('document') || mimeType.includes('word'))
      return <FileText className="w-5 h-5 text-blue-500" />
    if (mimeType.includes('sheet') || mimeType.includes('excel'))
      return <FileCode className="w-5 h-5 text-green-500" />
    if (mimeType.includes('zip') || mimeType.includes('archive'))
      return <Archive className="w-5 h-5 text-orange-500" />
    return <File className="w-5 h-5 text-arc-muted" />
  }

  // Filtrar arquivos
  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      filterMode === 'all' ||
      (filterMode === 'starred' && file.starred) ||
      (filterMode === 'shared' && file.shared) ||
      (filterMode === 'recent' && new Date(file.modifiedTime).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000)
    return matchesSearch && matchesFilter
  })

  // Conectar ao Google Drive
  const connectGoogleDrive = () => {
    // Simular conexão
    setData((prev) => ({ ...prev, connected: true, lastSync: new Date().toISOString() }))
    // TODO: Implementar OAuth2 real com Google Drive API
  }

  // Refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setData((prev) => ({ ...prev, lastSync: new Date().toISOString() }))
      setIsRefreshing(false)
    }, 1000)
  }

  // Toggle favorito
  const toggleStar = (id: string) => {
    setData((prev) => ({
      ...prev,
      files: prev.files.map((file) => (file.id === id ? { ...file, starred: !file.starred } : file)),
    }))
    setOpenMenuId(null)
  }

  // Deletar arquivo
  const deleteFile = (id: string) => {
    if (confirm('Remover este arquivo do workspace?')) {
      setData((prev) => ({
        ...prev,
        files: prev.files.filter((file) => file.id !== id),
      }))
    }
    setOpenMenuId(null)
  }

  return (
    <div className="h-full flex flex-col bg-arc-primary">
      {/* Header Fixo */}
      <div className="sticky top-0 z-10 bg-arc-primary border-b border-arc backdrop-blur-sm bg-opacity-95">
        <div className="px-3 sm:px-6 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-base sm:text-lg font-semibold text-arc">Documentos</h1>
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
              {/* View Mode */}
              <div className="hidden sm:flex border border-arc rounded-lg p-0.5 bg-arc-secondary">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-1.5 rounded transition-colors',
                    viewMode === 'grid' ? 'bg-arc-primary shadow-sm' : 'hover:bg-arc-primary/50'
                  )}
                >
                  <Grid3x3 className="w-3.5 h-3.5 text-arc" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-1.5 rounded transition-colors',
                    viewMode === 'list' ? 'bg-arc-primary shadow-sm' : 'hover:bg-arc-primary/50'
                  )}
                >
                  <List className="w-3.5 h-3.5 text-arc" />
                </button>
              </div>

              {/* Refresh */}
              {isConnected && (
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-1.5 hover:bg-arc-secondary rounded-lg transition-colors"
                  title="Sincronizar"
                >
                  <RefreshCw className={cn('w-4 h-4 text-arc-muted', isRefreshing && 'animate-spin')} />
                </button>
              )}

              {/* Upload */}
              {isConnected && (
                <Button onClick={() => setShowUploadModal(true)} size="sm" className="h-8 px-2.5">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1.5">Upload</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isConnected ? (
        /* Estado Não Conectado */
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Cloud className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-arc mb-3">Conecte seu Google Drive</h2>
            <p className="text-arc-muted mb-8 leading-relaxed">
              Acesse, organize e compartilhe seus arquivos diretamente do Google Drive. Mantenha tudo sincronizado em
              um só lugar.
            </p>
            <Button onClick={connectGoogleDrive} className="mx-auto">
              <Cloud className="w-4 h-4 mr-2" />
              Conectar Google Drive
            </Button>
            <p className="text-xs text-arc-muted mt-4">
              Você será redirecionado para fazer login com sua conta Google
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Filtros */}
          <div className="px-3 sm:px-6 py-3 border-b border-arc">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setFilterMode('all')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                  filterMode === 'all'
                    ? 'bg-arc-secondary text-arc shadow-sm'
                    : 'text-arc-muted hover:text-arc hover:bg-arc-secondary/50'
                )}
              >
                Todos os arquivos
              </button>
              <button
                onClick={() => setFilterMode('recent')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5',
                  filterMode === 'recent'
                    ? 'bg-arc-secondary text-arc shadow-sm'
                    : 'text-arc-muted hover:text-arc hover:bg-arc-secondary/50'
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                Recentes
              </button>
              <button
                onClick={() => setFilterMode('starred')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5',
                  filterMode === 'starred'
                    ? 'bg-arc-secondary text-arc shadow-sm'
                    : 'text-arc-muted hover:text-arc hover:bg-arc-secondary/50'
                )}
              >
                <Star className="w-3.5 h-3.5" />
                Favoritos
              </button>
              <button
                onClick={() => setFilterMode('shared')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5',
                  filterMode === 'shared'
                    ? 'bg-arc-secondary text-arc shadow-sm'
                    : 'text-arc-muted hover:text-arc hover:bg-arc-secondary/50'
                )}
              >
                <Users className="w-3.5 h-3.5" />
                Compartilhados
              </button>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            {filteredFiles.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 mx-auto mb-4 bg-arc-secondary rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-8 h-8 text-arc-muted" />
                  </div>
                  <h2 className="text-lg font-semibold text-arc mb-2">
                    {searchQuery ? 'Nenhum arquivo encontrado' : 'Nenhum arquivo ainda'}
                  </h2>
                  <p className="text-sm text-arc-muted mb-6">
                    {searchQuery
                      ? 'Tente buscar por outro termo'
                      : 'Faça upload de arquivos ou sincronize com seu Google Drive'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setShowUploadModal(true)} variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Fazer Upload
                    </Button>
                  )}
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid View */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="group relative border border-arc rounded-lg p-4 bg-arc-secondary hover:shadow-md transition-all cursor-pointer"
                  >
                    {/* Menu */}
                    <div className="absolute top-2 right-2">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === file.id ? null : file.id)}
                          className="p-1 hover:bg-arc-primary rounded transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="w-4 h-4 text-arc-muted" />
                        </button>

                        {openMenuId === file.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute right-0 top-8 z-20 w-44 bg-arc-primary border border-arc rounded-lg shadow-lg py-1">
                              <button
                                onClick={() => toggleStar(file.id)}
                                className="w-full px-4 py-2 text-left text-sm text-arc hover:bg-arc-secondary transition-colors flex items-center gap-2"
                              >
                                <Star
                                  className={cn('w-4 h-4', file.starred && 'fill-yellow-500 text-yellow-500')}
                                />
                                {file.starred ? 'Remover favorito' : 'Adicionar favorito'}
                              </button>
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full px-4 py-2 text-left text-sm text-arc hover:bg-arc-secondary transition-colors flex items-center gap-2"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Abrir no Drive
                              </a>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(file.webViewLink)
                                  setOpenMenuId(null)
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-arc hover:bg-arc-secondary transition-colors flex items-center gap-2"
                              >
                                <LinkIcon className="w-4 h-4" />
                                Copiar link
                              </button>
                              <button
                                onClick={() => deleteFile(file.id)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Remover
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0">{getFileIcon(file.mimeType)}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-arc text-sm mb-1 truncate" title={file.name}>
                          {file.name}
                        </h3>
                        <p className="text-xs text-arc-muted">{formatFileSize(file.size)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-arc">
                      <span className="text-xs text-arc-muted">{formatRelativeDate(file.modifiedTime)}</span>
                      {file.starred && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
                      {file.shared && <Users className="w-3.5 h-3.5 text-blue-500" />}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-2">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="group border border-arc rounded-lg p-3 bg-arc-secondary hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">{getFileIcon(file.mimeType)}</div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-arc text-sm mb-0.5 truncate">{file.name}</h3>
                        <div className="flex items-center gap-3 text-xs text-arc-muted">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{formatRelativeDate(file.modifiedTime)}</span>
                          {file.owners.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{file.owners[0]}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {file.starred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                        {file.shared && <Users className="w-4 h-4 text-blue-500" />}

                        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === file.id ? null : file.id)}
                            className="p-1 hover:bg-arc-primary rounded transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4 text-arc-muted" />
                          </button>

                          {openMenuId === file.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                              <div className="absolute right-0 top-8 z-20 w-44 bg-arc-primary border border-arc rounded-lg shadow-lg py-1">
                                <button
                                  onClick={() => toggleStar(file.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-arc hover:bg-arc-secondary transition-colors flex items-center gap-2"
                                >
                                  <Star
                                    className={cn('w-4 h-4', file.starred && 'fill-yellow-500 text-yellow-500')}
                                  />
                                  {file.starred ? 'Remover favorito' : 'Adicionar favorito'}
                                </button>
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full px-4 py-2 text-left text-sm text-arc hover:bg-arc-secondary transition-colors flex items-center gap-2"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Abrir no Drive
                                </a>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(file.webViewLink)
                                    setOpenMenuId(null)
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-arc hover:bg-arc-secondary transition-colors flex items-center gap-2"
                                >
                                  <LinkIcon className="w-4 h-4" />
                                  Copiar link
                                </button>
                                <button
                                  onClick={() => deleteFile(file.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Remover
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rodapé com informações */}
          {isConnected && files.length > 0 && (
            <div className="border-t border-arc px-3 sm:px-6 py-2">
              <div className="flex items-center justify-between text-xs text-arc-muted">
                <span>
                  {filteredFiles.length} de {files.length} arquivos
                </span>
                {data.lastSync && (
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3 h-3" />
                    Sincronizado {formatRelativeDate(data.lastSync)}
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-arc-primary rounded-2xl w-full max-w-lg shadow-2xl border border-arc">
            <div className="p-6 border-b border-arc flex items-center justify-between">
              <h2 className="text-xl font-bold text-arc">Upload para Google Drive</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 hover:bg-arc-secondary rounded transition-colors"
              >
                <X className="w-5 h-5 text-arc" />
              </button>
            </div>

            <div className="p-6">
              <div className="border-2 border-dashed border-arc rounded-xl p-12 text-center hover:border-blue-500 transition cursor-pointer">
                <Upload className="w-12 h-12 mx-auto text-arc-muted mb-4" />
                <p className="text-arc font-medium mb-2">Arraste arquivos aqui ou clique para selecionar</p>
                <p className="text-sm text-arc-muted">Os arquivos serão enviados para o seu Google Drive</p>
              </div>
            </div>

            <div className="p-6 pt-4 border-t border-arc flex justify-end gap-3">
              <Button onClick={() => setShowUploadModal(false)} variant="outline" size="sm">
                Cancelar
              </Button>
              <Button onClick={() => setShowUploadModal(false)} size="sm">
                Fazer Upload
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
