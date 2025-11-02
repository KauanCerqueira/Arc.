"use client"

import Link from "next/link"
import { Home, Star, Plus, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useWorkspaceStore } from "@/core/store/workspaceStore"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { WorkspaceSelector } from "./WorkspaceSelector"
import { SearchBar } from "./SearchBar"
import { GroupItem } from "./GroupItem"
import { getPageIcon } from "./pageIcons"

interface SidebarProps {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  pathname: string
  onClose: () => void
  onToggleCollapse: () => void
  onAddGroup: () => void
  onAddPage: (groupId: string) => void
  activeId: string | null
  onDragStart: (event: any) => void
  onDragEnd: (event: any) => void
  sensors: any
  workspaces: any[]
  onSwitchWorkspace: (workspaceId: string) => void
  onCreateWorkspace: () => void
}

export function Sidebar({
  sidebarOpen,
  sidebarCollapsed,
  pathname,
  onClose,
  onToggleCollapse,
  onAddGroup,
  onAddPage,
  activeId,
  onDragStart,
  onDragEnd,
  sensors,
  workspaces,
  onSwitchWorkspace,
  onCreateWorkspace,
}: SidebarProps) {
  const {
    workspace,
    deleteGroup,
    renameGroup,
    toggleGroupExpanded,
    getFavoritePages,
    searchPages,
  } = useWorkspaceStore()

  const favoritePages = getFavoritePages()

  const handleRenameGroup = (groupId: string, newName: string) => {
    renameGroup(groupId, newName)
  }

  const handleDeleteGroup = (groupId: string, groupName: string) => {
    deleteGroup(groupId)
  }

  const handleToggleExpanded = (groupId: string) => {
    toggleGroupExpanded(groupId)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <aside
        className={`fixed top-0 left-0 h-screen bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 flex-shrink-0 transition-all duration-300 overflow-hidden flex flex-col z-40
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${sidebarCollapsed ? "md:w-20 w-64" : "w-64"}`}
      >
        {/* Sidebar Header */}
        <div className={`border-b border-gray-200 dark:border-slate-800 ${sidebarCollapsed ? "px-2 py-2" : "p-0"}`}>
          <div className="flex items-center justify-between px-3 pt-2 pb-2">
            <div className={`flex-1 ${sidebarCollapsed ? "flex justify-center" : ""}`}>
              <button
                onClick={onToggleCollapse}
                className={`hidden md:flex items-center justify-center p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 ${
                  sidebarCollapsed ? "w-full" : ""
                }`}
                title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                )}
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 md:hidden"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Workspace Selector */}
          {!sidebarCollapsed && (
            <WorkspaceSelector
              currentWorkspace={workspace}
              workspaces={workspaces}
              onSwitchWorkspace={onSwitchWorkspace}
              onCreateWorkspace={onCreateWorkspace}
              collapsed={sidebarCollapsed}
            />
          )}

          {/* Search Bar */}
          {!sidebarCollapsed && (
            <div className="px-3 pb-2">
              <SearchBar
                onSearch={searchPages}
                onResultClick={onClose}
                collapsed={sidebarCollapsed}
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {/* Home Link */}
          <Link
            href="/workspace"
            onClick={onClose}
            className={`flex items-center gap-2 px-2 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              pathname === "/workspace"
                ? "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white"
            } ${sidebarCollapsed ? "justify-center" : ""}`}
            title={sidebarCollapsed ? "Início" : ""}
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>Início</span>}
          </Link>

          {/* Favoritos Section */}
          {favoritePages.length > 0 && (
            <div className={`${sidebarCollapsed ? "pt-2" : "pt-3"}`}>
              {!sidebarCollapsed && (
                <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                  <Star className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                  <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Favoritos
                  </span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800"></div>
                </div>
              )}

              <div className="space-y-0.5">
                {favoritePages.map(({ group, page }) => {
                  const iconConfig = getPageIcon(page.template || "blank")
                  const IconComponent = iconConfig.icon

                  return (
                    <Link
                      key={page.id}
                      href={`/workspace/group/${group.id}/page/${page.id}`}
                      onClick={onClose}
                      className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-all duration-200 ${
                        pathname.includes(page.id)
                          ? "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                      } ${sidebarCollapsed ? "justify-center" : ""}`}
                      title={sidebarCollapsed ? page.name : ""}
                    >
                      {sidebarCollapsed ? (
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconConfig.bgColor} ${iconConfig.bgColorDark}`}>
                          <IconComponent className={`w-4 h-4 ${iconConfig.color}`} />
                        </div>
                      ) : (
                        <>
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${iconConfig.bgColor} ${iconConfig.bgColorDark}`}>
                            <IconComponent className={`w-4 h-4 ${iconConfig.color}`} />
                          </div>
                          <span className="truncate flex-1 font-medium">{page.name}</span>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
                        </>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Grupos Section */}
          <div className={`${favoritePages.length > 0 || !sidebarCollapsed ? "pt-3" : "pt-2"}`}>
            {!sidebarCollapsed ? (
              <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Grupos
                  </span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800"></div>
                </div>
                <button
                  onClick={onAddGroup}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 hover:scale-110 flex-shrink-0"
                  title="Novo grupo"
                >
                  <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center mb-1">
                <button
                  onClick={onAddGroup}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 hover:scale-110"
                  title="Novo grupo"
                >
                  <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            )}

            {/* Lista de Grupos */}
            <div className="space-y-1">
              {workspace?.groups.map((group) => (
                <GroupItem
                  key={group.id}
                  group={group}
                  pathname={pathname}
                  collapsed={sidebarCollapsed}
                  onAddPage={onAddPage}
                  onRenameGroup={handleRenameGroup}
                  onDeleteGroup={handleDeleteGroup}
                  onToggleExpanded={handleToggleExpanded}
                />
              ))}

              {/* Placeholder quando não há grupos */}
              {workspace?.groups.length === 0 && !sidebarCollapsed && (
                <button
                  onClick={onAddGroup}
                  className="w-full flex flex-col items-center justify-center gap-2 px-3 py-6 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-slate-600 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200"
                >
                  <Plus className="w-6 h-6" />
                  <div className="text-center">
                    <p className="font-semibold">Criar primeiro grupo</p>
                    <p className="text-xs mt-1">Organize suas páginas em grupos</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Sidebar Footer removed: settings button no longer shown */}
      </aside>
    </DndContext>
  )
}
