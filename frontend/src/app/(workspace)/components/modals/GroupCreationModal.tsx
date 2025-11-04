"use client"

import { X, FolderPlus, ChevronLeft } from "lucide-react"
import { GROUP_PRESETS_WITH_ICONS, type GroupPresetWithIcon } from "../constants/groupPresets"
import { useState } from "react"

interface GroupCreationModalProps {
  show: boolean
  onClose: () => void
  selectedPreset: any | null
  customGroupName: string
  onSelectPreset: (preset: any) => void
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
  const [searchTerm, setSearchTerm] = useState("")

  if (!show) return null

  const getPresetColor = (color: string) => {
    const colors: Record<string, string> = {
      gray: "from-gray-50 to-slate-50 border-gray-200 dark:from-gray-900/50 dark:to-slate-900/50 dark:border-gray-700",
      blue: "from-blue-50 to-sky-50 border-blue-200 dark:from-blue-900/30 dark:to-sky-900/30 dark:border-blue-700",
      purple: "from-purple-50 to-violet-50 border-purple-200 dark:from-purple-900/30 dark:to-violet-900/30 dark:border-purple-700",
      green: "from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-700",
      indigo: "from-indigo-50 to-blue-50 border-indigo-200 dark:from-indigo-900/30 dark:to-blue-900/30 dark:border-indigo-700",
      orange: "from-orange-50 to-amber-50 border-orange-200 dark:from-orange-900/30 dark:to-amber-900/30 dark:border-orange-700",
      pink: "from-pink-50 to-rose-50 border-pink-200 dark:from-pink-900/30 dark:to-rose-900/30 dark:border-pink-700",
      red: "from-red-50 to-rose-50 border-red-200 dark:from-red-900/30 dark:to-rose-900/30 dark:border-red-700",
      yellow: "from-yellow-50 to-amber-50 border-yellow-200 dark:from-yellow-900/30 dark:to-amber-900/30 dark:border-yellow-700",
      emerald: "from-emerald-50 to-teal-50 border-emerald-200 dark:from-emerald-900/30 dark:to-teal-900/30 dark:border-emerald-700",
    }
    return colors[color] || colors.gray
  }

  const filteredPresets = GROUP_PRESETS_WITH_ICONS.filter((preset) =>
    preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    preset.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const presetsByCategory = {
    education: filteredPresets.filter((p) => p.category === "education"),
    business: filteredPresets.filter((p) => p.category === "business"),
    personal: filteredPresets.filter((p) => p.category === "personal"),
    finance: filteredPresets.filter((p) => p.category === "finance"),
    development: filteredPresets.filter((p) => p.category === "development"),
    creative: filteredPresets.filter((p) => p.category === "creative"),
  }

  const selectedPresetWithIcon = selectedPreset
    ? GROUP_PRESETS_WITH_ICONS.find((p) => p.id === selectedPreset.id)
    : null

  const handleClose = () => {
    setSearchTerm("")
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-slate-800">
        {!selectedPreset ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-900">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FolderPlus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Criar Novo Grupo
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      Escolha um template ou crie do zero
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Search */}
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar templates..."
                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Content */}
            <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Educação */}
              {presetsByCategory.education.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-5 bg-green-500 rounded-full"></div>
                    Para Estudos
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {presetsByCategory.education.map((preset) => {
                      const Icon = preset.iconComponent
                      return (
                        <button
                          key={preset.id}
                          onClick={() => onSelectPreset(preset)}
                          className={`group p-5 bg-gradient-to-br ${getPresetColor(preset.color)} border-2 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-left`}
                        >
                          <div className="flex items-start gap-4 mb-3">
                            <div className={`w-12 h-12 rounded-xl ${preset.iconColor.replace('text-', 'bg-').replace('-600', '-100')} dark:bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-6 h-6 ${preset.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-base">
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
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Negócios */}
              {presetsByCategory.business.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                    Para Trabalho
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {presetsByCategory.business.map((preset) => {
                      const Icon = preset.iconComponent
                      return (
                        <button
                          key={preset.id}
                          onClick={() => onSelectPreset(preset)}
                          className={`group p-5 bg-gradient-to-br ${getPresetColor(preset.color)} border-2 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-left`}
                        >
                          <div className="flex items-start gap-4 mb-3">
                            <div className={`w-12 h-12 rounded-xl ${preset.iconColor.replace('text-', 'bg-').replace('-600', '-100')} dark:bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-6 h-6 ${preset.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-base">
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
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Finanças */}
              {presetsByCategory.finance.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
                    Finanças
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {presetsByCategory.finance.map((preset) => {
                      const Icon = preset.iconComponent
                      return (
                        <button
                          key={preset.id}
                          onClick={() => onSelectPreset(preset)}
                          className={`group p-5 bg-gradient-to-br ${getPresetColor(preset.color)} border-2 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-left`}
                        >
                          <div className="flex items-start gap-4 mb-3">
                            <div className={`w-12 h-12 rounded-xl ${preset.iconColor.replace('text-', 'bg-').replace('-600', '-100')} dark:bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-6 h-6 ${preset.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-base">
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
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Desenvolvimento */}
              {presetsByCategory.development.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
                    Desenvolvimento
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {presetsByCategory.development.map((preset) => {
                      const Icon = preset.iconComponent
                      return (
                        <button
                          key={preset.id}
                          onClick={() => onSelectPreset(preset)}
                          className={`group p-5 bg-gradient-to-br ${getPresetColor(preset.color)} border-2 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-left`}
                        >
                          <div className="flex items-start gap-4 mb-3">
                            <div className={`w-12 h-12 rounded-xl ${preset.iconColor.replace('text-', 'bg-').replace('-600', '-100')} dark:bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-6 h-6 ${preset.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-base">
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
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Pessoal */}
              {presetsByCategory.personal.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-5 bg-orange-500 rounded-full"></div>
                    Pessoal
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {presetsByCategory.personal.map((preset) => {
                      const Icon = preset.iconComponent
                      return (
                        <button
                          key={preset.id}
                          onClick={() => onSelectPreset(preset)}
                          className={`group p-5 bg-gradient-to-br ${getPresetColor(preset.color)} border-2 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-left`}
                        >
                          <div className="flex items-start gap-4 mb-3">
                            <div className={`w-12 h-12 rounded-xl ${preset.iconColor.replace('text-', 'bg-').replace('-600', '-100')} dark:bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-6 h-6 ${preset.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-base">
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
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Criativo */}
              {presetsByCategory.creative.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-5 bg-pink-500 rounded-full"></div>
                    Criativo
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {presetsByCategory.creative.map((preset) => {
                      const Icon = preset.iconComponent
                      return (
                        <button
                          key={preset.id}
                          onClick={() => onSelectPreset(preset)}
                          className={`group p-5 bg-gradient-to-br ${getPresetColor(preset.color)} border-2 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-left`}
                        >
                          <div className="flex items-start gap-4 mb-3">
                            <div className={`w-12 h-12 rounded-xl ${preset.iconColor.replace('text-', 'bg-').replace('-600', '-100')} dark:bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-6 h-6 ${preset.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-base">
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
                      )
                    })}
                  </div>
                </div>
              )}

              {filteredPresets.length === 0 && (
                <div className="text-center py-16">
                  <FolderPlus className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Nenhum template encontrado
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Tente ajustar a busca
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Tela de confirmação */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-800">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {selectedPresetWithIcon?.id === "blank" ? "Grupo Personalizado" : selectedPresetWithIcon?.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {selectedPresetWithIcon?.description}
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {selectedPresetWithIcon && (
                <div
                  className={`p-6 bg-gradient-to-br ${getPresetColor(selectedPresetWithIcon.color)} border-2 rounded-xl mb-6 shadow-sm`}
                >
                  <div className="flex items-start gap-4 flex-col md:flex-row">
                    <div className={`w-16 h-16 rounded-xl ${selectedPresetWithIcon.iconColor.replace('text-', 'bg-').replace('-600', '-100')} dark:bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
                      {(() => {
                        const Icon = selectedPresetWithIcon.iconComponent
                        return <Icon className={`w-8 h-8 ${selectedPresetWithIcon.iconColor}`} />
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {selectedPresetWithIcon.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{selectedPresetWithIcon.description}</p>
                      {selectedPresetWithIcon.pages.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedPresetWithIcon.pages.map((page, idx) => (
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
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {selectedPresetWithIcon?.id === "blank" ? "Nome do grupo *" : "Nome do grupo (opcional)"}
                </label>
                <input
                  type="text"
                  value={customGroupName}
                  onChange={(e) => onCustomGroupNameChange(e.target.value)}
                  placeholder={selectedPresetWithIcon?.id === "blank" ? "Ex: Projeto Postora" : selectedPresetWithIcon?.name}
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 shadow-sm"
                />
              </div>
            </div>

            <div className="p-6 pt-4 border-t border-gray-200 dark:border-slate-800 flex gap-3 flex-col sm:flex-row">
              <button
                onClick={handleClose}
                className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors duration-200 font-medium"
              >
                Cancelar
              </button>

              <button
                onClick={onCreateGroup}
                disabled={selectedPresetWithIcon?.id === "blank" && !customGroupName.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-600 dark:to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                Criar Grupo
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
