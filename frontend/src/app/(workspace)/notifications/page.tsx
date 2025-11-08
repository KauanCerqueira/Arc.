"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useNotifications } from "@/core/hooks/useNotifications"
import { useAuthStore } from "@/core/store/authStore"
import {
  Check,
  Filter,
  Search,
  ArrowRight,
  Dot,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Trash2,
  Archive,
  Bell,
  BellOff,
  Star,
  Clock,
  Calendar,
  User,
  CheckCheck,
  X,
  Mail,
  MailOpen,
  Settings,
  Pin,
  Share2
} from "lucide-react"
import { Button } from "@/shared/components/ui/Button"

type LocalReadMap = Record<string, boolean>
type LocalPinMap = Record<string, boolean>
type LocalArchiveMap = Record<string, boolean>
type Reaction = { likes: number; dislikes: number; self: "like" | "dislike" | null }
type Comment = { id: string; author: string; avatar?: string; text: string; at: Date }

interface NotificationFilter {
  type: "all" | "unread" | "read" | "pinned" | "archived"
  priority: "all" | "critical" | "high" | "medium" | "low"
  dateRange: "all" | "today" | "week" | "month"
}

function timeAgo(date: Date) {
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return `${Math.floor(diff)}s atrás`
  if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`
  return new Date(date).toLocaleDateString('pt-BR')
}

function formatDate(date: Date) {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function NotificationsInboxPage() {
  const { notifications } = useNotifications()
  const { user } = useAuthStore()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filter, setFilter] = useState<NotificationFilter>({
    type: "all",
    priority: "all",
    dateRange: "all"
  })

  // Local state management
  const [localRead, setLocalRead] = useState<LocalReadMap>({})
  const [localPinned, setLocalPinned] = useState<LocalPinMap>({})
  const [localArchived, setLocalArchived] = useState<LocalArchiveMap>({})
  const [deleted, setDeleted] = useState<Set<string>>(new Set())

  // Comments and reactions
  const [commentDraft, setCommentDraft] = useState<string>("")
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [reactions, setReactions] = useState<Record<string, Reaction>>({})

  // Filter notifications
  const filtered = notifications
    .filter((n) => !deleted.has(n.id))
    .filter((n) => {
      // Archive filter
      if (filter.type === "archived" && !localArchived[n.id]) return false
      if (filter.type !== "archived" && localArchived[n.id]) return false

      // Type filter
      if (filter.type === "unread" && isRead(n.id)) return false
      if (filter.type === "read" && !isRead(n.id)) return false
      if (filter.type === "pinned" && !localPinned[n.id]) return false

      // Priority filter
      if (filter.priority !== "all" && n.priority !== filter.priority) return false

      // Date range filter
      if (filter.dateRange !== "all") {
        const now = Date.now()
        const notifTime = n.timestamp.getTime()
        const diff = now - notifTime

        if (filter.dateRange === "today" && diff > 86400000) return false
        if (filter.dateRange === "week" && diff > 604800000) return false
        if (filter.dateRange === "month" && diff > 2592000000) return false
      }

      // Search filter
      const q = query.trim().toLowerCase()
      if (q && !(
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.pageName.toLowerCase().includes(q)
      )) return false

      return true
    })
    .sort((a, b) => {
      // Pinned first
      if (localPinned[a.id] && !localPinned[b.id]) return -1
      if (!localPinned[a.id] && localPinned[b.id]) return 1

      // Then by timestamp
      return b.timestamp.getTime() - a.timestamp.getTime()
    })

  const selected = filtered.find((n) => n.id === selectedId) || filtered[0] || null

  useEffect(() => {
    if (!selectedId && filtered.length > 0) setSelectedId(filtered[0].id)
  }, [filtered.length, selectedId])

  // State management functions
  const isRead = (id: string) => localRead[id] || false
  const isPinned = (id: string) => localPinned[id] || false
  const isArchived = (id: string) => localArchived[id] || false

  const markAsRead = (id: string) => setLocalRead((m) => ({ ...m, [id]: true }))
  const markAsUnread = (id: string) => setLocalRead((m) => ({ ...m, [id]: false }))
  const togglePin = (id: string) => setLocalPinned((m) => ({ ...m, [id]: !m[id] }))
  const toggleArchive = (id: string) => setLocalArchived((m) => ({ ...m, [id]: !m[id] }))
  const deleteNotification = (id: string) => setDeleted((s) => new Set([...s, id]))

  const markAllAsRead = () => {
    const newRead: LocalReadMap = {}
    filtered.forEach(n => { newRead[n.id] = true })
    setLocalRead(prev => ({ ...prev, ...newRead }))
  }

  // Priority colors and icons
  const priorityConfig: Record<string, { color: string; bgColor: string; label: string }> = {
    critical: { color: "text-red-600 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30", label: "Crítico" },
    high: { color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-100 dark:bg-orange-900/30", label: "Alto" },
    medium: { color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30", label: "Médio" },
    low: { color: "text-gray-600 dark:text-gray-400", bgColor: "bg-gray-100 dark:bg-gray-800", label: "Baixo" },
  }

  // Reactions
  const toggleReaction = (id: string, kind: "like" | "dislike") => {
    setReactions((r) => {
      const current: Reaction = r[id] || { likes: 0, dislikes: 0, self: null }
      let { likes, dislikes, self } = current

      if (kind === "like") {
        if (self === "like") {
          likes -= 1
          self = null
        } else {
          likes += 1
          if (self === "dislike") dislikes -= 1
          self = "like"
        }
      } else {
        if (self === "dislike") {
          dislikes -= 1
          self = null
        } else {
          dislikes += 1
          if (self === "like") likes -= 1
          self = "dislike"
        }
      }

      return { ...r, [id]: { likes: Math.max(0, likes), dislikes: Math.max(0, dislikes), self } }
    })
  }

  // Comments
  const submitComment = (id: string) => {
    const text = commentDraft.trim()
    if (!text) return

    const newComment: Comment = {
      id: `${Date.now()}`,
      author: `${user?.nome || "Você"} ${user?.sobrenome || ""}`.trim(),
      avatar: user?.icone,
      text,
      at: new Date()
    }

    setComments((c) => ({ ...c, [id]: [...(c[id] || []), newComment] }))
    setCommentDraft("")
  }

  const deleteComment = (notifId: string, commentId: string) => {
    setComments((c) => ({
      ...c,
      [notifId]: (c[notifId] || []).filter(com => com.id !== commentId)
    }))
  }

  // Share notification
  const shareNotification = (notification: any) => {
    const text = `${notification.title}\n\n${notification.message}\n\nVer mais: ${window.location.origin}/workspace/group/${notification.groupId}/page/${notification.pageId}`

    if (navigator.share) {
      navigator.share({
        title: notification.title,
        text: notification.message,
        url: `${window.location.origin}/workspace/group/${notification.groupId}/page/${notification.pageId}`
      }).catch(() => {
        navigator.clipboard.writeText(text)
        alert("Link copiado para a área de transferência!")
      })
    } else {
      navigator.clipboard.writeText(text)
      alert("Notificação copiada para a área de transferência!")
    }
  }

  // Stats
  const unreadCount = filtered.filter(n => !isRead(n.id)).length
  const pinnedCount = filtered.filter(n => isPinned(n.id)).length
  const archivedCount = notifications.filter(n => isArchived(n.id) && !deleted.has(n.id)).length

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-12 bg-arc-primary">
      {/* Sidebar - Lista de notificações */}
      <aside className="md:col-span-5 lg:col-span-4 border-r border-arc h-[calc(100vh-0px)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-arc-primary px-4 py-3 border-b border-arc">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-arc flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações
            </h2>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs px-2 py-1 rounded-md bg-arc-secondary hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                  title="Marcar todas como lidas"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-md transition-colors ${showFilters ? 'bg-arc-secondary' : 'hover:bg-arc-secondary'}`}
                title="Filtros"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-arc-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar notificações..."
              className="pl-9 pr-3 h-9 w-full rounded-lg border border-arc bg-arc-secondary text-sm outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-3 p-3 bg-arc-secondary rounded-lg space-y-3 border border-arc">
              <div>
                <label className="text-xs font-medium text-arc-muted mb-1 block">Tipo</label>
                <select
                  value={filter.type}
                  onChange={(e) => setFilter({ ...filter, type: e.target.value as any })}
                  className="w-full px-2 py-1.5 text-sm rounded-md border border-arc bg-arc-primary outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Todas</option>
                  <option value="unread">Não lidas</option>
                  <option value="read">Lidas</option>
                  <option value="pinned">Fixadas</option>
                  <option value="archived">Arquivadas</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-arc-muted mb-1 block">Prioridade</label>
                <select
                  value={filter.priority}
                  onChange={(e) => setFilter({ ...filter, priority: e.target.value as any })}
                  className="w-full px-2 py-1.5 text-sm rounded-md border border-arc bg-arc-primary outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Todas</option>
                  <option value="critical">Crítico</option>
                  <option value="high">Alto</option>
                  <option value="medium">Médio</option>
                  <option value="low">Baixo</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-arc-muted mb-1 block">Período</label>
                <select
                  value={filter.dateRange}
                  onChange={(e) => setFilter({ ...filter, dateRange: e.target.value as any })}
                  className="w-full px-2 py-1.5 text-sm rounded-md border border-arc bg-arc-primary outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Todo período</option>
                  <option value="today">Hoje</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mês</option>
                </select>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="mt-3 flex items-center gap-3 text-xs text-arc-muted">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              {unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'}
            </span>
            {pinnedCount > 0 && (
              <span className="flex items-center gap-1">
                <Pin className="w-3.5 h-3.5" />
                {pinnedCount} {pinnedCount === 1 ? 'fixada' : 'fixadas'}
              </span>
            )}
            {archivedCount > 0 && (
              <span className="flex items-center gap-1">
                <Archive className="w-3.5 h-3.5" />
                {archivedCount} {archivedCount === 1 ? 'arquivada' : 'arquivadas'}
              </span>
            )}
          </div>
        </div>

        {/* Lista de notificações */}
        <div className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-2">
            {filtered.map((n) => {
              const config = priorityConfig[n.priority]
              const pinned = isPinned(n.id)
              const read = isRead(n.id)

              return (
                <li key={n.id}>
                  <button
                    onClick={() => {
                      setSelectedId(n.id)
                      if (!read) markAsRead(n.id)
                    }}
                    className={[
                      "w-full text-left px-3 py-3 rounded-lg border transition-all",
                      selectedId === n.id
                        ? "bg-arc-secondary border-purple-500 shadow-sm"
                        : "border-arc hover:bg-arc-secondary hover:shadow-sm",
                      !read && "font-semibold"
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                        <Dot className={["w-6 h-6", config.color].join(" ")} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className={`text-sm truncate ${!read ? 'font-semibold' : 'font-medium'} text-arc`}>
                            {n.title}
                          </span>
                          <span className="text-xs text-arc-muted whitespace-nowrap flex-shrink-0">
                            {timeAgo(n.timestamp)}
                          </span>
                        </div>

                        <div className="text-xs text-arc-muted truncate mb-2">{n.message}</div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
                            {config.label}
                          </span>
                          {pinned && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                              <Pin className="w-3 h-3" />
                              Fixada
                            </span>
                          )}
                          {!read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full ml-auto" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}

            {filtered.length === 0 && (
              <li className="text-center py-12">
                <BellOff className="w-12 h-12 mx-auto mb-3 text-arc-muted opacity-50" />
                <p className="text-sm text-arc-muted">Nenhuma notificação encontrada</p>
              </li>
            )}
          </ul>
        </div>
      </aside>

      {/* Detalhe da notificação */}
      <section className="md:col-span-7 lg:col-span-8 h-[calc(100vh-0px)] overflow-y-auto">
        {selected ? (
          <div className="p-6 space-y-6">
            {/* Header com ações */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-arc">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${priorityConfig[selected.priority].bgColor} ${priorityConfig[selected.priority].color}`}>
                    {priorityConfig[selected.priority].label}
                  </span>
                  <span className="text-xs text-arc-muted flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(selected.timestamp)}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-arc mb-1">{selected.title}</h1>
                <p className="text-sm text-arc-muted flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {selected.pageName}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => togglePin(selected.id)}
                  className={`p-2 rounded-lg border transition-colors ${isPinned(selected.id) ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 text-yellow-700 dark:text-yellow-400' : 'border-arc hover:bg-arc-secondary'}`}
                  title={isPinned(selected.id) ? "Desafixar" : "Fixar"}
                >
                  <Pin className="w-4 h-4" />
                </button>

                <button
                  onClick={() => shareNotification(selected)}
                  className="p-2 rounded-lg border border-arc hover:bg-arc-secondary transition-colors"
                  title="Compartilhar"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => toggleArchive(selected.id)}
                  className="p-2 rounded-lg border border-arc hover:bg-arc-secondary transition-colors"
                  title={isArchived(selected.id) ? "Desarquivar" : "Arquivar"}
                >
                  <Archive className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    deleteNotification(selected.id)
                    setSelectedId(null)
                  }}
                  className="p-2 rounded-lg border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {!isRead(selected.id) ? (
                  <button
                    onClick={() => markAsRead(selected.id)}
                    className="px-3 py-2 text-xs border border-arc rounded-lg hover:bg-arc-secondary transition-colors flex items-center gap-1"
                  >
                    <MailOpen className="w-3.5 h-3.5" />
                    Marcar como lida
                  </button>
                ) : (
                  <button
                    onClick={() => markAsUnread(selected.id)}
                    className="px-3 py-2 text-xs border border-arc rounded-lg hover:bg-arc-secondary transition-colors flex items-center gap-1"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Marcar como não lida
                  </button>
                )}
              </div>
            </div>

            {/* Mensagem */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-arc whitespace-pre-wrap leading-relaxed">{selected.message}</p>
            </div>

            {/* Reações e ação */}
            <div className="flex items-center gap-3 pt-4 border-t border-arc">
              <button
                className={`inline-flex items-center gap-2 text-sm rounded-lg px-3 py-2 border transition-colors ${
                  reactions[selected.id]?.self === 'like'
                    ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400'
                    : 'border-arc hover:bg-arc-secondary'
                }`}
                onClick={() => toggleReaction(selected.id, 'like')}
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="font-medium">{reactions[selected.id]?.likes ?? 0}</span>
              </button>

              <button
                className={`inline-flex items-center gap-2 text-sm rounded-lg px-3 py-2 border transition-colors ${
                  reactions[selected.id]?.self === 'dislike'
                    ? 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400'
                    : 'border-arc hover:bg-arc-secondary'
                }`}
                onClick={() => toggleReaction(selected.id, 'dislike')}
              >
                <ThumbsDown className="w-4 h-4" />
                <span className="font-medium">{reactions[selected.id]?.dislikes ?? 0}</span>
              </button>

              <Link
                href={`/workspace/group/${selected.groupId}/page/${selected.pageId}`}
                className="inline-flex items-center gap-2 text-sm border border-arc rounded-lg px-4 py-2 hover:bg-arc-secondary ml-auto transition-colors font-medium"
              >
                Abrir página
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Comentários */}
            <div className="mt-8 pt-6 border-t border-arc space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-arc">
                <MessageCircle className="w-5 h-5" />
                Comentários ({(comments[selected.id] || []).length})
              </div>

              {/* Lista de comentários */}
              <div className="space-y-4">
                {(comments[selected.id] || []).map((c) => (
                  <div key={c.id} className="flex items-start gap-3 p-3 bg-arc-secondary rounded-lg border border-arc">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {c.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.avatar} alt={c.author} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        c.author.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-medium text-arc">{c.author}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-arc-muted flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo(c.at)}
                          </span>
                          <button
                            onClick={() => deleteComment(selected.id, c.id)}
                            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                            title="Excluir comentário"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-arc whitespace-pre-wrap">{c.text}</p>
                    </div>
                  </div>
                ))}

                {(comments[selected.id] || []).length === 0 && (
                  <div className="text-center py-6 text-sm text-arc-muted">
                    Nenhum comentário ainda. Seja o primeiro a comentar!
                  </div>
                )}
              </div>

              {/* Caixa de novo comentário */}
              <div className="bg-arc-secondary border border-arc rounded-lg p-4">
                <label className="text-sm font-medium text-arc mb-2 block">
                  Adicionar comentário
                </label>
                <textarea
                  className="w-full min-h-24 rounded-lg border border-arc bg-arc-primary p-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Escreva seu comentário..."
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      submitComment(selected.id)
                    }
                  }}
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-arc-muted">
                    Ctrl+Enter para enviar
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCommentDraft("")}
                      disabled={!commentDraft.trim()}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => submitComment(selected.id)}
                      disabled={!commentDraft.trim()}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Enviar Comentário
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-arc-muted opacity-50" />
              <p className="text-arc-muted">Selecione uma notificação para visualizar</p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
