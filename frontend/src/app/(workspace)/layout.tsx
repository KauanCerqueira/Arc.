"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useWorkspaceStore } from "@/core/store/workspaceStore"
import { type TemplateType, type GroupPreset } from "@/core/types/workspace.types"
import AuthGuard from "@/core/components/AuthGuard"
import { useAuthStore } from "@/core/store/authStore"
import { WorkspaceCreationModal } from "./components/modals/WorkspaceCreationModal"
import { GroupCreationModal } from "./components/modals/GroupCreationModal"
import { PageCreationModal } from "./components/modals/PageCreationModal"
import SquareSidebar from "./components/square/SquareSidebar"
import SquareHeader from "./components/square/SquareHeader"
import { useTheme } from "@/core/context/ThemeContext"
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

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const router = useRouter()
  const { initializeAuth } = useAuthStore()
  const {
    workspace,
    workspaces,
    initializeWorkspace,
    switchWorkspace,
    createWorkspace,
    loadAllWorkspaces,
    addPage,
    addGroup,
    addGroupFromPreset,
    reorderPages,
  } = useWorkspaceStore()

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Modal State
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState("")
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showPageModal, setShowPageModal] = useState<string | null>(null)

  // Group creation state
  const [selectedPreset, setSelectedPreset] = useState<GroupPreset | null>(null)
  const [customGroupName, setCustomGroupName] = useState("")

  // Page creation state
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [newPageName, setNewPageName] = useState("")

  // Drag and Drop state
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  // Inicializar autenticação e workspace
  useEffect(() => {
    initializeAuth()

    if (!workspace) {
      initializeWorkspace()
    }

    loadAllWorkspaces()

    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved !== null) {
      setSidebarCollapsed(saved === 'true')
    }
  }, [])

  // Log para debug
  useEffect(() => {
    console.log('🔍 DEBUG - Workspaces:', workspaces)
    console.log('🔍 DEBUG - Current Workspace:', workspace)
  }, [workspaces, workspace])

  // Sidebar toggle handler
  const toggleSidebarCollapsed = () => {
    const newValue = !sidebarCollapsed
    setSidebarCollapsed(newValue)
    localStorage.setItem('sidebarCollapsed', String(newValue))
  }

  // Workspace handlers
  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return
    const newId = await createWorkspace(newWorkspaceName)
    if (newId) {
      setNewWorkspaceName("")
      setShowCreateWorkspace(false)
      router.push('/workspace')
    }
  }

  const handleSwitchWorkspace = async (workspaceId: string) => {
    await switchWorkspace(workspaceId)
    router.push('/workspace')
  }

  // Group creation handlers
  const handleCreateGroup = () => {
    if (selectedPreset) {
      if (selectedPreset.id === "blank") {
        if (!customGroupName.trim()) return
        addGroup(customGroupName)
      } else {
        // Pass custom name if provided, otherwise preset will use its default name
        addGroupFromPreset(selectedPreset, customGroupName.trim() || undefined)
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

  const closeGroupModal = () => {
    setShowGroupModal(false)
    setSelectedPreset(null)
    setCustomGroupName("")
  }

  // Page creation handlers
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
      return
    }

    const groupId = showPageModal
    const pageName = newPageName.trim()
    const template = selectedTemplate as TemplateType

    console.log("Criando página:", { groupId, pageName, template })

    try {
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
        alert("Erro ao criar página. Tente novamente.")
      }
    } catch (error) {
      console.error("Erro ao criar página:", error)
      alert("Erro ao criar página. Verifique o console.")
    }
  }

  const closePageModal = () => {
    setShowPageModal(null)
    setSelectedTemplate(null)
    setNewPageName("")
  }

  // Drag and Drop handlers
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

  return (
    <AuthGuard>
      <div className={theme === 'dark' ? 'dark' : ''}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="min-h-screen bg-arc-primary text-arc flex flex-col md:flex-row">
          {/* Sidebar Mobile Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-30"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <SquareSidebar
            sidebarOpen={sidebarOpen}
            sidebarCollapsed={sidebarCollapsed}
            onClose={() => setSidebarOpen(false)}
            onToggleCollapse={toggleSidebarCollapsed}
            onAddGroup={() => setShowGroupModal(true)}
            onAddPage={(groupId) => setShowPageModal(groupId)}
            onCreateWorkspace={() => setShowCreateWorkspace(true)}
          />

          {/* Main Content */}
          <div className={`flex-1 flex flex-col min-w-0 w-full transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} relative`}>
            <SquareHeader
              sidebarCollapsed={sidebarCollapsed}
              setSidebarOpen={setSidebarOpen}
              className="md:hidden"
            />
            <main className="h-screen overflow-auto bg-arc-primary pt-12 md:pt-0">{children}</main>
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="px-3 py-2 bg-arc-secondary border border-arc rounded-lg shadow-xl">
              <span className="text-sm font-medium text-arc">Arrastando...</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <GroupCreationModal
        show={showGroupModal}
        onClose={closeGroupModal}
        selectedPreset={selectedPreset}
        customGroupName={customGroupName}
        onSelectPreset={handleSelectPreset}
        onCustomGroupNameChange={setCustomGroupName}
        onCreateGroup={handleCreateGroup}
        onBack={() => setSelectedPreset(null)}
      />

      <PageCreationModal
        show={!!showPageModal}
        onClose={closePageModal}
        selectedTemplate={selectedTemplate}
        newPageName={newPageName}
        onSelectTemplate={handleSelectTemplate}
        onPageNameChange={setNewPageName}
        onCreatePage={handleCreatePage}
        onBack={() => setSelectedTemplate(null)}
      />

      <WorkspaceCreationModal
        show={showCreateWorkspace}
        onClose={() => setShowCreateWorkspace(false)}
        workspaceName={newWorkspaceName}
        onWorkspaceNameChange={setNewWorkspaceName}
        onCreateWorkspace={handleCreateWorkspace}
      />
      </div>
    </AuthGuard>
  )
}
