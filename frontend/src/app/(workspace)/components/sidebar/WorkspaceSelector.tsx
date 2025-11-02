"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Plus, Check, Briefcase, Sparkles } from "lucide-react"

interface WorkspaceSelectorProps {
  currentWorkspace: any
  workspaces: any[]
  onSwitchWorkspace: (workspaceId: string) => void
  onCreateWorkspace: () => void
  collapsed: boolean
}

export function WorkspaceSelector({
  currentWorkspace,
  workspaces,
  onSwitchWorkspace,
  onCreateWorkspace,
  collapsed,
}: WorkspaceSelectorProps) {
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu) {
        const target = event.target as HTMLElement
        if (!target.closest(".workspace-selector")) {
          setShowMenu(false)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showMenu])

  if (collapsed) {
    return (
      <div className="workspace-selector px-2 pb-2">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-full h-10 flex items-center justify-center rounded-lg bg-gray-800 dark:bg-slate-800 text-gray-300 hover:bg-gray-700 dark:hover:bg-slate-700 transition-colors duration-200"
          title={currentWorkspace?.name || "Workspace"}
        >
          <Briefcase className="w-4 h-4" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
            <div className="absolute left-full ml-2 top-0 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-left-2 duration-200">
              <div className="px-3 py-2 border-b border-gray-200 dark:border-slate-800">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Workspaces
                </p>
              </div>

              <div className="py-1 max-h-80 overflow-y-auto">
                {workspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    onClick={() => {
                      onSwitchWorkspace(workspace.id)
                      setShowMenu(false)
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                      workspace.id === currentWorkspace?.id
                        ? "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-semibold text-xs ${
                      workspace.id === currentWorkspace?.id
                        ? "bg-gray-700 dark:bg-slate-700 text-white"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400"
                    }`}>
                      {workspace.name?.charAt(0).toUpperCase() || "W"}
                    </div>
                    <span className="flex-1 truncate font-medium">{workspace.name}</span>
                    {workspace.id === currentWorkspace?.id && (
                      <Check className="w-3.5 h-3.5 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-slate-800 pt-1">
                <button
                  onClick={() => {
                    onCreateWorkspace()
                    setShowMenu(false)
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors font-medium"
                >
                  <div className="w-7 h-7 rounded-lg bg-gray-700 dark:bg-slate-700 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <span>Novo Workspace</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="workspace-selector px-3 pb-3 relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-full bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg p-2.5 flex items-center gap-2.5 transition-colors duration-200 border border-gray-200 dark:border-slate-700"
      >
        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
          <Briefcase className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {currentWorkspace?.name || "Meu Workspace"}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            showMenu ? "rotate-180" : ""
          }`}
        />
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
          <div className="absolute left-3 right-3 top-full mt-1 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-gray-200 dark:border-slate-800 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-3 py-2 border-b border-gray-200 dark:border-slate-800">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Meus Workspaces
              </p>
            </div>

            <div className="py-1 max-h-80 overflow-y-auto">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => {
                    onSwitchWorkspace(workspace.id)
                    setShowMenu(false)
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                    workspace.id === currentWorkspace?.id
                      ? "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-semibold text-xs ${
                    workspace.id === currentWorkspace?.id
                      ? "bg-gray-700 dark:bg-slate-700 text-white"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400"
                  }`}>
                    {workspace.name?.charAt(0).toUpperCase() || "W"}
                  </div>
                  <span className="flex-1 truncate font-medium">{workspace.name}</span>
                  {workspace.id === currentWorkspace?.id && (
                    <Check className="w-3.5 h-3.5 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-slate-800 pt-1">
              <button
                onClick={() => {
                  onCreateWorkspace()
                  setShowMenu(false)
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors font-medium"
              >
                <div className="w-7 h-7 rounded-lg bg-gray-700 dark:bg-slate-700 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <span>Criar Novo Workspace</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
