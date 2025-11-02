"use client"

import { X } from "lucide-react"

interface WorkspaceCreationModalProps {
  show: boolean
  onClose: () => void
  workspaceName: string
  onWorkspaceNameChange: (name: string) => void
  onCreateWorkspace: () => void
}

export function WorkspaceCreationModal({
  show,
  onClose,
  workspaceName,
  onWorkspaceNameChange,
  onCreateWorkspace,
}: WorkspaceCreationModalProps) {
  if (!show) return null

  const handleClose = () => {
    onClose()
    onWorkspaceNameChange("")
  }

  const handleCreate = () => {
    if (workspaceName.trim()) {
      onCreateWorkspace()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full border-2 border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Novo Workspace
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Crie um novo espaço de trabalho para organizar seus projetos
        </p>
        <input
          type="text"
          value={workspaceName}
          onChange={(e) => onWorkspaceNameChange(e.target.value)}
          placeholder="Nome do workspace"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 mb-6"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <div className="flex gap-3">
          <button
            onClick={handleCreate}
            disabled={!workspaceName.trim()}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition font-semibold"
          >
            Criar Workspace
          </button>
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
