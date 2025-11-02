"use client"

import { useState } from "react"
import { ChevronRight, Plus, Edit2, Trash2, Folder } from "lucide-react"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { SortablePage } from "./SortablePage"

interface Page {
  id: string
  name: string
  icon: string
  template?: string
  favorite?: boolean
}

interface Group {
  id: string
  name: string
  icon: string
  pages: Page[]
  expanded: boolean
}

interface GroupItemProps {
  group: Group
  pathname: string
  collapsed: boolean
  onAddPage: (groupId: string) => void
  onRenameGroup: (groupId: string, newName: string) => void
  onDeleteGroup: (groupId: string, groupName: string) => void
  onToggleExpanded: (groupId: string) => void
}

export function GroupItem({
  group,
  pathname,
  collapsed,
  onAddPage,
  onRenameGroup,
  onDeleteGroup,
  onToggleExpanded,
}: GroupItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(group.name)
  const [showMenu, setShowMenu] = useState(false)

  const { setNodeRef, isOver } = useDroppable({
    id: `group-${group.id}`,
    data: {
      type: "group",
      groupId: group.id,
    },
  })

  const handleRename = () => {
    if (editName.trim() && editName !== group.name) {
      onRenameGroup(group.id, editName)
    }
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm(`Excluir o grupo "${group.name}" e todas as suas páginas?`)) {
      onDeleteGroup(group.id, group.name)
    }
    setShowMenu(false)
  }

  // Modo collapsed - mostrar apenas ícone do grupo
  if (collapsed) {
    return (
      <div className="relative">
        <button
          onClick={() => onToggleExpanded(group.id)}
          className={`w-full flex items-center justify-center p-2 rounded-lg transition-all duration-200 ${
            group.expanded
              ? "bg-gray-100 dark:bg-slate-800"
              : "hover:bg-gray-50 dark:hover:bg-slate-800/50"
          }`}
          title={`${group.name} (${group.pages.length} páginas)`}
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200 ${
            group.expanded
              ? "bg-gray-200 dark:bg-slate-700"
              : "bg-gray-100 dark:bg-slate-800"
          }`}>
            <Folder className="w-4.5 h-4.5 text-gray-600 dark:text-gray-400" />
          </div>
        </button>

        {/* Mostrar páginas do grupo quando collapsed e expandido */}
        {group.expanded && group.pages.length > 0 && (
          <div className="mt-1 space-y-1 pb-2">
            {group.pages.map((page) => (
              <SortablePage key={page.id} page={page} groupId={group.id} pathname={pathname} collapsed={true} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Modo expandido - mostrar tudo
  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl transition-all duration-200 ${
        isOver ? "bg-gray-100 dark:bg-slate-800 ring-2 ring-gray-400 dark:ring-slate-600 ring-offset-2 dark:ring-offset-slate-900" : ""
      }`}
    >
      {/* Header do grupo */}
      <div className="group/group">
        {isEditing ? (
          <div className="px-2 py-1.5">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyPress={(e) => e.key === "Enter" && handleRename()}
              autoFocus
              className="w-full px-2 py-1.5 text-sm bg-white dark:bg-slate-900 border-2 border-gray-400 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-slate-500 shadow-sm"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all duration-200 relative">
            <button
              onClick={() => onToggleExpanded(group.id)}
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              <ChevronRight
                className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 text-gray-500 dark:text-gray-400 ${
                  group.expanded ? "rotate-90" : ""
                }`}
              />
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                <Folder className="w-4.5 h-4.5 text-gray-600 dark:text-gray-400" />
              </div>
              <span className="flex-1 text-sm font-semibold text-gray-900 dark:text-white overflow-hidden text-ellipsis whitespace-nowrap">{group.name}</span>
            </button>

            <div className="flex items-center gap-0.5 opacity-0 group-hover/group:opacity-100 transition-opacity duration-200 flex-shrink-0">
              <button
                onClick={() => onAddPage(group.id)}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-all duration-200"
                title="Nova página"
              >
                <Plus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-all duration-200"
                title="Mais opções"
              >
                <Edit2 className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        )}

        {/* Menu de contexto do grupo */}
        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
            <div className="absolute right-2 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 py-1 z-50 animate-in fade-in duration-150">
              <button
                onClick={() => {
                  setIsEditing(true)
                  setShowMenu(false)
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span className="font-medium">Renomear</span>
              </button>
              <div className="border-t border-gray-200 dark:border-slate-700 my-0.5"></div>
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="font-medium">Excluir</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Lista de páginas do grupo */}
      {group.expanded && (
        <div className="ml-4 mt-0.5 space-y-0.5 pb-1">
          <SortableContext items={group.pages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            {group.pages.map((page) => (
              <SortablePage key={page.id} page={page} groupId={group.id} pathname={pathname} collapsed={false} />
            ))}
          </SortableContext>

          {/* Botão de adicionar página quando grupo está vazio */}
          {group.pages.length === 0 && (
            <button
              onClick={() => onAddPage(group.id)}
              className="w-full flex items-center gap-2 px-2 py-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-600"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="font-medium">Adicionar primeira página</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
