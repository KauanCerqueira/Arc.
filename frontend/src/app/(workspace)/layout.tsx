"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Search,
  Home,
  Star,
  ChevronRight,
  ChevronDown,
  Plus,
  Settings,
  Menu,
  X,
  Bell,
  User,
  LogOut,
  HelpCircle,
  Folder,
  MoreVertical,
  Sparkles,
  Edit2,
  Trash2,
  GripVertical,
  Crown,
  BarChart3,
  Users,
  Ticket,
  Shield,
} from "lucide-react"
import ThemeToggle from "@/shared/components/ui/ThemeToggle"
import { useWorkspaceStore } from "@/core/store/workspaceStore"
import { type TemplateType, GROUP_PRESETS, type GroupPreset } from "@/core/types/workspace.types"
import AuthGuard from "@/core/components/AuthGuard"
import { useAuthStore } from "@/core/store/authStore"
import { useNotifications } from "@/core/hooks/useNotifications"
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

function SortablePage({ page, groupId, pathname, collapsed }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id })

  const { renamePage, deletePage, togglePageFavorite } = useWorkspaceStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(page.name)
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Se collapsed, mostrar apenas o ícone
  if (collapsed) {
    return (
      <div ref={setNodeRef} style={style} className="relative group/page">
        <Link
          href={`/workspace/group/${groupId}/page/${page.id}`}
          className={`flex items-center justify-center p-2 rounded-lg text-sm transition-colors ${
            pathname.includes(page.id)
              ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
          }`}
          title={page.name}
        >
          <span className="text-lg">{page.icon}</span>
        </Link>
      </div>
    )
  }

  const handleRename = () => {
    if (editName.trim() && editName !== page.name) {
      renamePage(groupId, page.id, editName)
    }
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm(`Excluir "${page.name}"?`)) {
      deletePage(groupId, page.id)
      if (pathname.includes(page.id)) {
        router.push("/workspace")
      }
    }
    setShowMenu(false)
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group/page">
      {isEditing ? (
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleRename}
          onKeyPress={(e) => e.key === "Enter" && handleRename()}
          autoFocus
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white shadow-sm"
        />
      ) : (
        <Link
          href={`/workspace/group/${groupId}/page/${page.id}`}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname.includes(page.id)
              ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
          }`}
        >
          <div
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing opacity-0 group-hover/page:opacity-100 transition-opacity duration-200 hidden md:block"
          >
            <GripVertical className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <span className="text-base flex-shrink-0">{page.icon}</span>
          <span className="truncate flex-1 font-medium">{page.name}</span>

          <div className="flex items-center gap-1 opacity-0 group-hover/page:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => {
                e.preventDefault()
                setShowMenu(!showMenu)
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors duration-200"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </Link>
      )}

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
          <div className="absolute right-0 top-8 mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 py-1.5 z-50">
            <button
              onClick={() => {
                setIsEditing(true)
                setShowMenu(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
            >
              <Edit2 className="w-4 h-4" />
              <span>Renomear</span>
            </button>
            <button
              onClick={() => {
                togglePageFavorite(groupId, page.id)
                setShowMenu(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
            >
              <Star className={`w-4 h-4 ${page.favorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
              <span>{page.favorite ? "Remover favorito" : "Adicionar favorito"}</span>
            </button>
            <div className="border-t border-gray-200 dark:border-slate-700 my-1.5"></div>
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user, initializeAuth } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Hook de notificações
  const { notifications, unreadCount, hasCritical } = useNotifications()

  // Inicializar autenticação e carregar preferências
  useEffect(() => {
    // Inicializar auth do localStorage
    initializeAuth()

    // Carregar preferência do sidebar
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved !== null) {
      setSidebarCollapsed(saved === 'true')
    }
  }, [])

  // Salvar preferência do sidebar no localStorage
  const toggleSidebarCollapsed = () => {
    const newValue = !sidebarCollapsed
    setSidebarCollapsed(newValue)
    localStorage.setItem('sidebarCollapsed', String(newValue))
  }

  // Helper para gerar iniciais do usuário
  const getUserInitials = () => {
    if (!user) return "U"
    const firstInitial = user.nome?.charAt(0).toUpperCase() || ""
    const lastInitial = user.sobrenome?.charAt(0).toUpperCase() || ""
    return `${firstInitial}${lastInitial}` || "U"
  }

  // Nome completo do usuário
  const getUserFullName = () => {
    if (!user) return "Usuário"
    return `${user.nome} ${user.sobrenome}`.trim() || "Usuário"
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Modals
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showPageModal, setShowPageModal] = useState<string | null>(null)

  // Group creation
  const [selectedPreset, setSelectedPreset] = useState<GroupPreset | null>(null)
  const [customGroupName, setCustomGroupName] = useState("")

  // Page creation
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [newPageName, setNewPageName] = useState("")

  // Drag and Drop
  const [activeId, setActiveId] = useState<string | null>(null)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editGroupName, setEditGroupName] = useState("")

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  // Store
  const {
    workspace,
    initializeWorkspace,
    addGroup,
    addGroupFromPreset,
    addPage,
    renameGroup,
    deleteGroup,
    toggleGroupExpanded,
    reorderPages,
    getFavoritePages,
    searchPages,
  } = useWorkspaceStore()

  useEffect(() => {
    if (!workspace) {
      initializeWorkspace()
    }
  }, [workspace, initializeWorkspace])

  // Busca
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchPages(searchQuery)
      setSearchResults(results)
      setShowSearchResults(true)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }, [searchQuery, searchPages])

  const favoritePages = getFavoritePages()

  const pageTemplates = [
    {
      id: "blank",
      name: "Documento",
      description: "Página em branco",
      icon: "📝",
      color: "from-gray-50 to-slate-50 border-gray-200",
    },
    {
      id: "tasks",
      name: "Tarefas",
      description: "Lista de tarefas",
      icon: "✅",
      color: "from-blue-50 to-sky-50 border-blue-200",
    },
    {
      id: "kanban",
      name: "Quadro Kanban",
      description: "Colunas visuais",
      icon: "📋",
      color: "from-purple-50 to-violet-50 border-purple-200",
    },
    {
      id: "table",
      name: "Planilha",
      description: "Tabela editável",
      icon: "📊",
      color: "from-green-50 to-emerald-50 border-green-200",
    },
    {
      id: "calendar",
      name: "Calendário",
      description: "Eventos e compromissos",
      icon: "📅",
      color: "from-red-50 to-rose-50 border-red-200",
    },
    {
      id: "projects",
      name: "Projetos",
      description: "Múltiplos projetos",
      icon: "🎯",
      color: "from-orange-50 to-amber-50 border-orange-200",
    },
    {
      id: "bugs",
      name: "Rastreador de Bugs",
      description: "Bugs e problemas",
      icon: "🐛",
      color: "from-pink-50 to-rose-50 border-pink-200",
    },
    {
      id: "study",
      name: "Estudos",
      description: "Materiais de estudo",
      icon: "📚",
      color: "from-indigo-50 to-blue-50 border-indigo-200",
    },
    {
      id: "budget",
      name: "Orçamento",
      description: "Receitas e despesas",
      icon: "💰",
      color: "from-yellow-50 to-amber-50 border-yellow-200",
    },
    {
      id: "focus",
      name: "Pomodoro",
      description: "Pomodoro",
      icon: "🏃",
      color: "from-teal-50 to-cyan-50 border-teal-200",
    },
    {
      id: "flowchart",
      name: "Fluxograma",
      description: "Editor de fluxogramas",
      icon: "🔀",
      color: "from-slate-50 to-gray-50 border-slate-200",
    },
    {
      id: "roadmap",
      name: "Roadmap",
      description: "Planejamento do projeto",
      icon: "🗺️",
      color: "from-emerald-50 to-teal-50 border-emerald-200",
    },
    {
      id: "dashboard",
      name: "Dashboard",
      description: "Dashboard personalizável",
      icon: "📊",
      color: "from-cyan-50 to-blue-50 border-cyan-200",
    },
    {
      id: "mindmap",
      name: "Mapa Mental",
      description: "Mapa Mental visual",
      icon: "🧠",
      color: "from-purple-50 to-pink-50 border-purple-200",
    },{
      id: "notes",
      name: "Notas",
      description: "Notas rápidas",
      icon: "🗒️",
      color: "from-yellow-50 to-orange-50 border-yellow-200",
    },{
      id: "timeline",
      name: "Linha do Tempo",
      description: "Linha do tempo visual",
      icon: "⏳",
      color: "from-indigo-50 to-purple-50 border-indigo-200",
    },{
      id: "wiki",
      name: "Wiki",
      description: "Base de conhecimento",
      icon: "📘",
      color: "from-blue-50 to-cyan-50 border-blue-200",
    },{
      id: "documents",
      name: "Documentos",
      description: "Gerenciar arquivos",
      icon: "📁",
      color: "from-cyan-50 to-blue-50 border-cyan-200",
    },
    {
  id: "business-budget",
  name: "Orçamento Empresarial",
  description: "Gerencie receitas, despesas e relatórios de empresas",
  icon: "🏢",
  color: "from-blue-50 to-indigo-50 border-blue-200",
},
{
  id: "personal-budget",
  name: "Orçamento Pessoal",
  description: "Controle de gastos e planejamento financeiro pessoal",
  icon: "💸",
  color: "from-green-50 to-emerald-50 border-green-200",
},
  ]

  const handleCreateGroup = () => {
    if (selectedPreset) {
      if (selectedPreset.id === "blank") {
        if (!customGroupName.trim()) return
        addGroup(customGroupName)
      } else {
        addGroupFromPreset(selectedPreset)
      }
    }

    setShowGroupModal(false)
    setSelectedPreset(null)
    setCustomGroupName("")
  }

  const handleSelectPreset = (preset: GroupPreset) => {
    setSelectedPreset(preset)
    if (preset.id !== "blank") {
      setCustomGroupName(preset.name)
    }
  }

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId)
  }

  const handleCreatePage = () => {
    if (!showPageModal || !selectedTemplate || !newPageName.trim()) {
      console.error("Erro: Campos inválidos", {
        showPageModal,
        selectedTemplate,
        newPageName: newPageName.trim(),
      })
      alert("Por favor, preencha o nome da página")
      return
    }

    const groupId = showPageModal
    const pageName = newPageName.trim()
    const template = selectedTemplate as TemplateType

    console.log("Criando página:", { groupId, pageName, template })

    const pageId = addPage(groupId, pageName, template)

    console.log("Página criada com ID:", pageId)

    if (pageId) {
      setNewPageName("")
      setSelectedTemplate(null)
      setShowPageModal(null)

      setTimeout(() => {
        router.push(`/workspace/group/${groupId}/page/${pageId}`)
      }, 100)
    } else {
      console.error("addPage retornou undefined")
      alert("Erro ao criar página. Verifique o console.")
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const activePageId = active.id as string
      const overPageId = over.id as string

      workspace?.groups.forEach((group) => {
        const activeIndex = group.pages.findIndex((p) => p.id === activePageId)
        const overIndex = group.pages.findIndex((p) => p.id === overPageId)

        if (activeIndex !== -1 && overIndex !== -1) {
          reorderPages(group.id, activeIndex, overIndex)
        }
      })
    }

    setActiveId(null)
  }

  const handleRenameGroup = (groupId: string) => {
    if (editGroupName.trim() && editGroupName !== workspace?.groups.find((g) => g.id === groupId)?.name) {
      renameGroup(groupId, editGroupName)
    }
    setEditingGroupId(null)
  }

  const handleDeleteGroup = (groupId: string, groupName: string) => {
    if (confirm(`Excluir o grupo "${groupName}" e todas as suas páginas?`)) {
      deleteGroup(groupId)
    }
  }

  const closePageModal = () => {
    setShowPageModal(null)
    setSelectedTemplate(null)
    setNewPageName("")
  }

  const closeGroupModal = () => {
    setShowGroupModal(false)
    setSelectedPreset(null)
    setCustomGroupName("")
  }

  const selectedTemplateData = pageTemplates.find((t) => t.id === selectedTemplate)

  const getPresetColor = (color: string) => {
    const colors: Record<string, string> = {
      gray: "from-gray-50 to-slate-50 border-gray-200",
      blue: "from-blue-50 to-sky-50 border-blue-200",
      purple: "from-purple-50 to-violet-50 border-purple-200",
      green: "from-green-50 to-emerald-50 border-green-200",
      indigo: "from-indigo-50 to-blue-50 border-indigo-200",
      orange: "from-orange-50 to-amber-50 border-orange-200",
      pink: "from-pink-50 to-rose-50 border-pink-200",
      red: "from-red-50 to-rose-50 border-red-200",
      yellow: "from-yellow-50 to-amber-50 border-yellow-200",
    }
    return colors[color] || colors.gray
  }

  return (
    <AuthGuard>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col md:flex-row">
          {/* Sidebar Mobile Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-30"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <aside
            className={`fixed top-0 left-0 h-screen bg-white dark:bg-black border-r border-gray-200 dark:border-gray-900 flex-shrink-0 transition-all duration-300 overflow-hidden flex flex-col z-40 shadow-lg
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            ${sidebarCollapsed ? "md:w-20 w-64" : "w-64"}`}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-900">
              <div className="flex items-center justify-between mb-4">
                <Link href="/workspace" className={`flex items-center gap-3 flex-1 group ${sidebarCollapsed ? 'justify-center' : ''}`}>
                  <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                    <Folder className="w-4 h-4 text-white dark:text-black" />
                  </div>
                  {!sidebarCollapsed && (
                    <span className="font-semibold text-gray-900 dark:text-white transition-colors truncate">
                      {workspace?.name || "Workspace"}
                    </span>
                  )}
                </Link>
                <button
                  onClick={toggleSidebarCollapsed}
                  className="hidden md:block p-1.5 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors duration-200 flex-shrink-0"
                  title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
                >
                  <ChevronRight className={`w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-all duration-200 ${sidebarCollapsed ? '' : 'rotate-180'}`} />
                </button>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors duration-200 md:hidden flex-shrink-0"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white" />
                </button>
              </div>

              {!sidebarCollapsed && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar páginas..."
                    className="w-full pl-9 pr-9 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition-all duration-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors duration-200"
                    >
                      <X className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                    </button>
                  )}

                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl max-h-64 overflow-y-auto z-50">
                    {searchResults.map(({ group, page }) => (
                      <Link
                        key={page.id}
                        href={`/workspace/group/${group.id}/page/${page.id}`}
                        onClick={() => {
                          setSearchQuery("")
                          setShowSearchResults(false)
                          setSidebarOpen(false)
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl"
                      >
                        <span className="text-lg flex-shrink-0">{page.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {page.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {group.icon} {group.name}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                  {showSearchResults && searchResults.length === 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl p-4 text-center text-sm text-gray-500 dark:text-gray-400 z-50">
                      Nenhuma página encontrada
                    </div>
                  )}
                </div>
              )}
            </div>

            <nav className="flex-1 overflow-y-auto p-3 sidebar-scroll">
              <Link
                href="/workspace"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/workspace"
                    ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                title={sidebarCollapsed ? "Início" : ""}
              >
                <Home className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Início</span>}
              </Link>

              {/* Favoritos */}
              {favoritePages.length > 0 && (
                <div className="mt-6">
                  {!sidebarCollapsed ? (
                    <>
                      <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <Star className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Favoritos</span>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {favoritePages.map(({ group, page }) => (
                          <Link
                            key={page.id}
                            href={`/workspace/group/${group.id}/page/${page.id}`}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                              pathname.includes(page.id)
                                ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
                            }`}
                          >
                            <span className="text-base flex-shrink-0">{page.icon}</span>
                            <span className="truncate flex-1 font-medium">{page.name}</span>
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-0.5">
                      {favoritePages.map(({ group, page }) => (
                        <Link
                          key={page.id}
                          href={`/workspace/group/${group.id}/page/${page.id}`}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center justify-center px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                            pathname.includes(page.id)
                              ? "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100 shadow-sm"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                          }`}
                          title={page.name}
                        >
                          <span className="text-base">{page.icon}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Grupos */}
              <div className="mt-6">
                {!sidebarCollapsed ? (
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Grupos
                    </span>
                    <button
                      onClick={() => setShowGroupModal(true)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 flex-shrink-0"
                      title="Novo grupo"
                    >
                      <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center px-3 py-2">
                    <button
                      onClick={() => setShowGroupModal(true)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200"
                      title="Novo grupo"
                    >
                      <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                )}

                <div className="mt-1 space-y-1">
                  {workspace?.groups.map((group) => (
                    <div key={group.id}>
                      {/* Group Header */}
                      {!sidebarCollapsed ? (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors duration-200 group/item">
                          {editingGroupId === group.id ? (
                            <input
                              type="text"
                              value={editGroupName}
                              onChange={(e) => setEditGroupName(e.target.value)}
                              onBlur={() => handleRenameGroup(group.id)}
                              onKeyPress={(e) => e.key === "Enter" && handleRenameGroup(group.id)}
                              autoFocus
                              className="flex-1 px-2 py-1.5 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 shadow-sm"
                            />
                          ) : (
                            <>
                              <button
                                onClick={() => toggleGroupExpanded(group.id)}
                                className="flex items-center gap-2 flex-1 min-w-0 text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                <ChevronRight
                                  className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${group.expanded ? "rotate-90" : ""}`}
                                />
                                <span className="text-base flex-shrink-0">{group.icon}</span>
                                <span className="truncate">{group.name}</span>
                              </button>

                              <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                                <button
                                  onClick={() => setShowPageModal(group.id)}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors duration-200 flex-shrink-0"
                                  title="Nova página"
                                >
                                  <Plus className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingGroupId(group.id)
                                    setEditGroupName(group.name)
                                  }}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors duration-200 flex-shrink-0"
                                  title="Renomear"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                                </button>
                                <button
                                  onClick={() => handleDeleteGroup(group.id, group.name)}
                                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors duration-200 flex-shrink-0"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowPageModal(group.id)}
                          className="w-full flex items-center justify-center px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors duration-200"
                          title={group.name}
                        >
                          <span className="text-base">{group.icon}</span>
                        </button>
                      )}

                      {/* Group Pages - Expanded View */}
                      {!sidebarCollapsed && group.expanded && (
                        <div className="ml-6 mt-0.5 space-y-0.5">
                          <SortableContext items={group.pages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                            {group.pages.map((page) => (
                              <SortablePage key={page.id} page={page} groupId={group.id} pathname={pathname} collapsed={false} />
                            ))}
                          </SortableContext>

                          {group.pages.length === 0 && (
                            <button
                              onClick={() => setShowPageModal(group.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-lg transition-all duration-200"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Adicionar página</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Group Pages - Collapsed View (só ícones) */}
                      {sidebarCollapsed && group.pages.length > 0 && (
                        <div className="mt-0.5 space-y-0.5">
                          {group.pages.map((page) => (
                            <SortablePage key={page.id} page={page} groupId={group.id} pathname={pathname} collapsed={true} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {workspace?.groups.length === 0 && (
                    <button
                      onClick={() => setShowGroupModal(true)}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-6 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-slate-700 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-all duration-200 ${sidebarCollapsed ? 'flex-col' : ''}`}
                      title={sidebarCollapsed ? "Criar primeiro grupo" : ""}
                    >
                      <Plus className="w-4 h-4" />
                      {!sidebarCollapsed && <span>Criar primeiro grupo</span>}
                    </button>
                  )}
                </div>
              </div>
            </nav>

            {/* Sidebar Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-900">
              <Link
                href="/settings"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white transition-all duration-200 ${sidebarCollapsed ? 'justify-center' : ''}`}
                title={sidebarCollapsed ? "Configurações" : ""}
              >
                <Settings className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Configurações</span>}
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <div className={`flex-1 flex flex-col min-w-0 w-full transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
            <header className={`h-16 border-b border-gray-200 dark:border-gray-900 flex items-center justify-between px-4 md:px-6 bg-white dark:bg-black fixed top-0 right-0 z-30 transition-all duration-300 ${sidebarCollapsed ? 'md:left-20' : 'md:left-64'} left-0`}>
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 md:hidden flex-shrink-0"
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <ThemeToggle />

                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 flex-shrink-0 ${
                      showNotifications ? 'bg-gray-100 dark:bg-slate-800' : ''
                    }`}
                  >
                    <Bell className={`w-5 h-5 ${hasCritical ? 'text-red-500 dark:text-red-400 animate-pulse' : 'text-gray-600 dark:text-gray-400'}`} />
                  </button>
                  {unreadCount > 0 && (
                    <span className={`absolute -top-1 -right-1 w-5 h-5 ${hasCritical ? 'bg-red-500 animate-pulse' : 'bg-blue-500'} text-white text-xs font-semibold rounded-full flex items-center justify-center shadow-lg`}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}

                  {/* Painel de Notificações */}
                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                      <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-800 z-50 max-h-[600px] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                          <h3 className="font-bold text-gray-900 dark:text-gray-100">
                            Notificações {unreadCount > 0 && `(${unreadCount})`}
                          </h3>
                          {notifications.length > 0 && (
                            <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                              Marcar todas como lidas
                            </button>
                          )}
                        </div>

                        {/* Notificações */}
                        <div className="overflow-y-auto flex-1">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                              <Bell className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Nenhuma notificação
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Você está em dia!
                              </p>
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-200 dark:divide-slate-800">
                              {notifications.slice(0, 20).map((notification) => (
                                <Link
                                  key={notification.id}
                                  href={`/workspace/group/${notification.groupId}/page/${notification.pageId}`}
                                  onClick={() => setShowNotifications(false)}
                                  className={`block p-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${
                                    notification.priority === 'critical' ? 'bg-red-50/50 dark:bg-red-900/10' :
                                    notification.priority === 'high' ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                                      notification.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/40' :
                                      notification.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/40' :
                                      notification.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/40' :
                                      'bg-blue-100 dark:bg-blue-900/40'
                                    }`}>
                                      {notification.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                          {notification.title}
                                        </h4>
                                        {notification.priority === 'critical' && (
                                          <span className="text-xs px-1.5 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded font-medium">
                                            CRÍTICO
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                                        {notification.message}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        📄 {notification.pageName}
                                      </p>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 20 && (
                          <div className="p-3 border-t border-gray-200 dark:border-slate-800 text-center">
                            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                              Ver todas as notificações ({notifications.length})
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="h-6 w-px bg-gray-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 flex-shrink-0"
                  >
                    {user?.icone ? (
                      <img
                        src={user.icone}
                        alt={getUserFullName()}
                        className="w-8 h-8 rounded-lg object-cover shadow-md"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-md">
                        {getUserInitials()}
                      </div>
                    )}
                    <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400 hidden sm:block" />
                  </button>

                  {showProfileMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-slate-800 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            {user?.icone ? (
                              <img
                                src={user.icone}
                                alt={getUserFullName()}
                                className="w-10 h-10 rounded-lg object-cover shadow-md flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-md">
                                {getUserInitials()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">{getUserFullName()}</div>
                                {user?.isMaster && (
                                  <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex-shrink-0">
                                    <Crown className="w-3 h-3 text-white" />
                                    <span className="text-xs font-semibold text-white">MASTER</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email || "usuario@email.com"}</div>
                            </div>
                          </div>
                        </div>

                        <div className="py-2">
                          <Link
                            href="/profile"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-200"
                          >
                            <User className="w-4 h-4" />
                            <span>Perfil</span>
                          </Link>
                          <Link
                            href="/settings"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-200"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Configurações</span>
                          </Link>
                          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-200">
                            <HelpCircle className="w-4 h-4" />
                            <span>Ajuda</span>
                          </button>
                        </div>

                        {/* Seção Master */}
                        {user?.isMaster && (
                          <>
                            <div className="border-t border-gray-200 dark:border-slate-800 my-2"></div>
                            <div className="py-2">
                              <div className="px-4 py-2 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-amber-500" />
                                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                  Painel Master
                                </span>
                              </div>

                              <Link
                                href="/analytics"
                                onClick={() => setShowProfileMenu(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors duration-200"
                              >
                                <BarChart3 className="w-4 h-4" />
                                <span>Analytics</span>
                              </Link>

                              <Link
                                href="/master/users"
                                onClick={() => setShowProfileMenu(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors duration-200"
                              >
                                <Users className="w-4 h-4" />
                                <span>Gerenciar Usuários</span>
                              </Link>

                              <Link
                                href="/master/promo-codes"
                                onClick={() => setShowProfileMenu(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors duration-200"
                              >
                                <Ticket className="w-4 h-4" />
                                <span>Códigos Promocionais</span>
                              </Link>
                            </div>
                          </>
                        )}

                        <div className="border-t border-gray-200 dark:border-slate-800 pt-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sair</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </header>

            <main className="h-screen overflow-auto bg-gray-50 dark:bg-black pt-16">{children}</main>
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg shadow-xl">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Arrastando...</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showGroupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-slate-800">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {!selectedPreset
                      ? "Criar Novo Grupo"
                      : selectedPreset.id === "blank"
                        ? "Grupo Personalizado"
                        : selectedPreset.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {!selectedPreset ? "Escolha um template ou crie do zero" : selectedPreset.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {!selectedPreset ? (
                <div>
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                      Para Estudos
                    </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {GROUP_PRESETS.filter((p) => p.category === "education").map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-5 bg-gradient-to-br ${getPresetColor(preset.color)} border-2 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-left`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-3xl flex-shrink-0">{preset.icon}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm md:text-base">
                            {preset.name}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {preset.description}
                          </p>
                        </div>
                      </div>
                      {preset.pages.length > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {preset.pages.length} página{preset.pages.length !== 1 ? "s" : ""}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                      Para Trabalho
                    </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {GROUP_PRESETS.filter((p) => p.category === "business").map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-5 bg-gradient-to-br ${getPresetColor(preset.color)} border-2 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-left`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-3xl flex-shrink-0">{preset.icon}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm md:text-base">
                            {preset.name}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {preset.description}
                          </p>
                        </div>
                      </div>
                      {preset.pages.length > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {preset.pages.length} página{preset.pages.length !== 1 ? "s" : ""}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                      Pessoal
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {GROUP_PRESETS.filter((p) => p.category === "personal").map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => handleSelectPreset(preset)}
                          className={`p-5 bg-gradient-to-br ${getPresetColor(preset.color)} border-2 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-left`}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <span className="text-3xl flex-shrink-0">{preset.icon}</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm md:text-base">
                                {preset.name}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                {preset.description}
                              </p>
                            </div>
                          </div>
                          {preset.pages.length > 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              {preset.pages.length} página{preset.pages.length !== 1 ? "s" : ""}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    className={`p-6 bg-gradient-to-br ${getPresetColor(selectedPreset.color)} border-2 rounded-xl mb-6 shadow-sm`}
                  >
                    <div className="flex items-start gap-4 flex-col md:flex-row">
                      <span className="text-5xl flex-shrink-0">{selectedPreset.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                          {selectedPreset.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{selectedPreset.description}</p>
                        {selectedPreset.pages.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {selectedPreset.pages.map((page, idx) => (
                              <div
                                key={idx}
                                className="px-3 py-1.5 bg-white/60 dark:bg-slate-900/60 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 shadow-sm"
                              >
                                {page.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedPreset.id === "blank" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nome do grupo
                      </label>
                      <input
                        type="text"
                        value={customGroupName}
                        onChange={(e) => setCustomGroupName(e.target.value)}
                        placeholder="Ex: Projeto Postora"
                        autoFocus
                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 shadow-sm"
                      />
                    </div>
                  )}

                  {selectedPreset.id !== "blank" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nome do grupo (opcional)
                      </label>
                      <input
                        type="text"
                        value={customGroupName}
                        onChange={(e) => setCustomGroupName(e.target.value)}
                        placeholder={selectedPreset.name}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 shadow-sm"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 pt-4 border-t border-gray-200 dark:border-slate-800 flex gap-3 flex-col sm:flex-row">
              {selectedPreset && (
                <button
                  onClick={() => setSelectedPreset(null)}
                  className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors duration-200 font-medium"
                >
                  Voltar
                </button>
              )}

              <button
                onClick={closeGroupModal}
                className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors duration-200 font-medium"
              >
                Cancelar
              </button>

              {selectedPreset && (
                <button
                  onClick={handleCreateGroup}
                  disabled={selectedPreset.id === "blank" && !customGroupName.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-slate-700 dark:to-slate-600 text-white rounded-xl hover:from-gray-800 hover:to-gray-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  Criar Grupo
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showPageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-slate-800">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {!selectedTemplate ? "Escolha um template" : "Nomeie sua página"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {!selectedTemplate ? "Selecione o tipo de página" : `Template: ${selectedTemplateData?.name}`}
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
              {!selectedTemplate ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {pageTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template.id)}
                      className={`p-5 bg-gradient-to-br ${template.color} border-2 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-left`}
                    >
                      <div className="text-3xl mb-3">{template.icon}</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">{template.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {template.description}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <div
                    className={`p-6 bg-gradient-to-br ${selectedTemplateData?.color} border-2 rounded-xl mb-6 shadow-sm`}
                  >
                    <div className="flex items-start gap-4 flex-col md:flex-row">
                      <div className="text-5xl flex-shrink-0">{selectedTemplateData?.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {selectedTemplateData?.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTemplateData?.description}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome da página
                    </label>
                    <input
                      type="text"
                      value={newPageName}
                      onChange={(e) => setNewPageName(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleCreatePage()}
                      placeholder="Ex: Orçamento Q1 2025"
                      autoFocus
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 shadow-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 pt-4 border-t border-gray-200 dark:border-slate-800 flex gap-3 flex-col sm:flex-row">
              {selectedTemplate && (
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors duration-200 font-medium"
                >
                  Voltar
                </button>
              )}

              <button
                onClick={closePageModal}
                className="flex-1 px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors duration-200 font-medium"
              >
                Cancelar
              </button>

              {selectedTemplate && (
                <button
                  onClick={handleCreatePage}
                  disabled={!newPageName.trim()}
                  className="flex-1 px-5 py-2.5 bg-gray-900 dark:bg-slate-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  Criar Página
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  )
}
