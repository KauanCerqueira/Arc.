"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, MoreVertical, Edit2, Star, Trash2 } from "lucide-react"
import { useWorkspaceStore } from "@/core/store/workspaceStore"
import { getPageIcon } from "./pageIcons"

interface SortablePageProps {
  page: {
    id: string
    name: string
    icon: string
    template?: string
    favorite?: boolean
  }
  groupId: string
  pathname: string
  collapsed: boolean
}

export function SortablePage({ page, groupId, pathname, collapsed }: SortablePageProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id })

  const { renamePage, deletePage, togglePageFavorite } = useWorkspaceStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(page.name)
  const [showMenu, setShowMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState<"bottom" | "top">("bottom")
  const buttonRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  // Calcular posição do menu para não sair da tela
  useEffect(() => {
    if (showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const menuHeight = 180 // altura aproximada do menu

      if (spaceBelow < menuHeight && rect.top > menuHeight) {
        setMenuPosition("top")
      } else {
        setMenuPosition("bottom")
      }
    }
  }, [showMenu])

  // Obter configuração do ícone baseado no template
  const iconConfig = getPageIcon(page.template || "blank")
  const IconComponent = iconConfig.icon

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
          className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 ${
            pathname.includes(page.id)
              ? "bg-gray-100 dark:bg-slate-800"
              : "hover:bg-gray-50 dark:hover:bg-slate-800/50"
          }`}
          title={page.name}
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconConfig.bgColor} ${iconConfig.bgColorDark}`}>
            <IconComponent className={`w-4.5 h-4.5 ${iconConfig.color}`} />
          </div>
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
          className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-900 border-2 border-violet-500 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 shadow-sm"
        />
      ) : (
        <Link
          href={`/workspace/group/${groupId}/page/${page.id}`}
          className={`flex items-center gap-2.5 px-2 py-2.5 rounded-lg text-sm transition-all duration-200 ${
            pathname.includes(page.id)
              ? "bg-violet-50 dark:bg-violet-900/20 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:scale-[1.02]"
          }`}
        >
          <div
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing opacity-0 group-hover/page:opacity-100 transition-opacity duration-200 hidden md:block"
          >
            <GripVertical className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
          </div>

          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${iconConfig.bgColor} ${iconConfig.bgColorDark}`}>
            <IconComponent className={`w-4 h-4 ${iconConfig.color}`} />
          </div>

          <span className="truncate flex-1 font-medium">{page.name}</span>

          {page.favorite && (
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
          )}

          <div className="flex items-center gap-1 opacity-0 group-hover/page:opacity-100 transition-opacity duration-200">
            <button
              ref={buttonRef}
              onClick={(e) => {
                e.preventDefault()
                setShowMenu(!showMenu)
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md transition-all duration-200"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </Link>
      )}

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
          <div className={`absolute right-0 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 py-1 z-50 animate-in fade-in duration-150 ${
            menuPosition === "top" ? "bottom-full mb-1" : "top-full mt-1"
          }`}>
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
            <button
              onClick={() => {
                togglePageFavorite(groupId, page.id)
                setShowMenu(false)
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
            >
              <Star className={`w-3.5 h-3.5 ${page.favorite ? "fill-amber-400 text-amber-400" : ""}`} />
              <span className="font-medium">{page.favorite ? "Desfavoritar" : "Favoritar"}</span>
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
  )
}

