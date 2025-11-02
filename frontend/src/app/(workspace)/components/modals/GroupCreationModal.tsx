"use client"

import { Sparkles } from "lucide-react"
import { GROUP_PRESETS, type GroupPreset } from "@/core/types/workspace.types"

interface GroupCreationModalProps {
  show: boolean
  onClose: () => void
  selectedPreset: GroupPreset | null
  customGroupName: string
  onSelectPreset: (preset: GroupPreset) => void
  onCustomGroupNameChange: (name: string) => void
  onCreateGroup: () => void
  onBack: () => void
}

export function GroupCreationModal({
  show,
  onClose,
  selectedPreset,
  customGroupName,
  onSelectPreset,
  onCustomGroupNameChange,
  onCreateGroup,
  onBack,
}: GroupCreationModalProps) {
  if (!show) return null

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
                      onClick={() => onSelectPreset(preset)}
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
                      onClick={() => onSelectPreset(preset)}
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
                      onClick={() => onSelectPreset(preset)}
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
                    onChange={(e) => onCustomGroupNameChange(e.target.value)}
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
                    onChange={(e) => onCustomGroupNameChange(e.target.value)}
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
              onClick={onBack}
              className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors duration-200 font-medium"
            >
              Voltar
            </button>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors duration-200 font-medium"
          >
            Cancelar
          </button>

          {selectedPreset && (
            <button
              onClick={onCreateGroup}
              disabled={selectedPreset.id === "blank" && !customGroupName.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-slate-700 dark:to-slate-600 text-white rounded-xl hover:from-gray-800 hover:to-gray-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              Criar Grupo
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
