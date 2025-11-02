"use client"

import { useState } from "react"
import { Search, X, ChevronRight } from "lucide-react"
import { pageTemplates } from "../constants/pageTemplates"
import { templateCategories } from "../constants/templateCategories"

interface PageCreationModalProps {
  show: boolean
  onClose: () => void
  selectedTemplate: string | null
  newPageName: string
  onSelectTemplate: (templateId: string) => void
  onPageNameChange: (name: string) => void
  onCreatePage: () => void
  onBack: () => void
}

export function PageCreationModal({
  show,
  onClose,
  selectedTemplate,
  newPageName,
  onSelectTemplate,
  onPageNameChange,
  onCreatePage,
  onBack,
}: PageCreationModalProps) {
  const [selectedCategory, setSelectedCategory] = useState("todos")
  const [templateSearch, setTemplateSearch] = useState("")

  if (!show) return null

  const filteredTemplates = pageTemplates.filter(template => {
    const matchesCategory = selectedCategory === "todos" || template.category === selectedCategory
    const matchesSearch = template.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
                          template.description.toLowerCase().includes(templateSearch.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const selectedTemplateData = pageTemplates.find((t) => t.id === selectedTemplate)

  const handleClose = () => {
    onClose()
    setSelectedCategory("todos")
    setTemplateSearch("")
  }

  const handleBackClick = () => {
    onBack()
    setSelectedCategory("todos")
    setTemplateSearch("")
  }

  const handleCreatePage = () => {
    if (newPageName.trim()) {
      onCreatePage()
      setSelectedCategory("todos")
      setTemplateSearch("")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-slate-700 flex flex-col">
        {!selectedTemplate ? (
          <>
            {/* Header com busca NO TOPO */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Criar Nova Página
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Escolha um template para começar
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Busca NO TOPO */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  placeholder="Buscar templates..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>

            {/* Categorias horizontais no mobile, sidebar no desktop */}
            <div className="border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 md:hidden overflow-x-auto">
              <div className="flex gap-2 p-3">
                {templateCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      selectedCategory === category.id
                        ? "bg-blue-600 dark:bg-blue-500 text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900"
                    }`}
                  >
                    <span className="text-base">{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Layout: Sidebar de Categorias + Grid de Templates */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar de Categorias - LATERAL (desktop apenas) */}
              <div className="hidden md:block w-48 border-r border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 overflow-y-auto">
                <div className="p-3 space-y-1">
                  {templateCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        selectedCategory === category.id
                          ? "bg-blue-600 dark:bg-blue-500 text-white shadow-lg"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid de Templates */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                {filteredTemplates.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {filteredTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => onSelectTemplate(template.id)}
                        className={`group relative p-4 sm:p-5 bg-gradient-to-br ${template.color} border-2 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-200 text-left`}
                      >
                        {/* Ícone */}
                        <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mb-3 text-3xl sm:text-4xl">
                          {template.icon}
                        </div>

                        {/* Conteúdo */}
                        <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-1.5 line-clamp-1">
                          {template.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {template.description}
                        </p>

                        {/* Hover indicator */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-6 h-6 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg">
                            <ChevronRight className="w-4 h-4 text-gray-900 dark:text-white" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Search className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Nenhum template encontrado
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Tente ajustar os filtros ou buscar por outro termo
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Tela de nomear página */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-800">
              <button
                onClick={handleBackClick}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Voltar
              </button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Nomear Página
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Escolha um nome para sua nova página
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div
                className={`p-6 bg-gradient-to-br ${selectedTemplateData?.color} border-2 rounded-2xl mb-6`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-5xl flex-shrink-0">{selectedTemplateData?.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {selectedTemplateData?.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTemplateData?.description}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nome da página *
                </label>
                <input
                  type="text"
                  value={newPageName}
                  onChange={(e) => onPageNameChange(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCreatePage()}
                  placeholder={`Ex: ${selectedTemplateData?.name} - Projeto X`}
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-base"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-slate-800 flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreatePage}
                disabled={!newPageName.trim()}
                className="flex-1 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                Criar Página
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
