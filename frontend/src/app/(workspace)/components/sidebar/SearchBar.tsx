"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Search, X } from "lucide-react"
import { getPageIcon } from "./pageIcons"

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
}

interface SearchResult {
  group: Group
  page: Page
}

interface SearchBarProps {
  onSearch: (query: string) => SearchResult[]
  onResultClick?: () => void
  collapsed: boolean
}

export function SearchBar({ onSearch, onResultClick, collapsed }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Realizar busca quando query muda
  useEffect(() => {
    if (query.trim()) {
      const searchResults = onSearch(query)
      setResults(searchResults)
      setShowResults(true)
      setSelectedIndex(0)
    } else {
      setResults([])
      setShowResults(false)
    }
  }, [query, onSearch])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
        break
      case "Escape":
        e.preventDefault()
        setShowResults(false)
        inputRef.current?.blur()
        break
    }
  }

  const handleClear = () => {
    setQuery("")
    setResults([])
    setShowResults(false)
    inputRef.current?.focus()
  }

  const handleResultClick = () => {
    setQuery("")
    setResults([])
    setShowResults(false)
    onResultClick?.()
  }

  // Destacar termo pesquisado
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text

    const parts = text.split(new RegExp(`(${query})`, "gi"))
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={index} className="bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 px-0.5 rounded">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    )
  }

  if (collapsed) return null

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setShowResults(true)}
          placeholder="Buscar páginas..."
          className="w-full pl-8 pr-8 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-slate-500 focus:border-transparent transition-all duration-200 hover:bg-gray-50 dark:hover:bg-slate-700"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 hover:scale-110"
            title="Limpar busca"
          >
            <X className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-xl max-h-80 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {results.length > 0 ? (
            <>
              <div className="px-2.5 py-1.5 border-b border-gray-200 dark:border-slate-800">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {results.length} resultado{results.length !== 1 ? "s" : ""} encontrado{results.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="py-1">
                {results.map(({ group, page }, index) => {
                  const iconConfig = getPageIcon(page.template || "blank")
                  const IconComponent = iconConfig.icon

                  return (
                    <Link
                      key={page.id}
                      href={`/workspace/group/${group.id}/page/${page.id}`}
                      onClick={handleResultClick}
                      className={`flex items-center gap-2 px-2.5 py-2 transition-all duration-200 ${
                        index === selectedIndex
                          ? "bg-gray-100 dark:bg-slate-800"
                          : "hover:bg-gray-50 dark:hover:bg-slate-800/50"
                      } first:rounded-t-xl last:rounded-b-xl`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconConfig.bgColor} ${iconConfig.bgColorDark}`}
                      >
                        <IconComponent className={`w-4 h-4 ${iconConfig.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {highlightMatch(page.name, query)}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center bg-gray-700 dark:bg-slate-700`}
                          >
                            <span className="text-xs">{group.icon}</span>
                          </div>
                          <span className="truncate">{group.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {page.favorite && (
                          <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" title="Página favorita"></div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="px-3 py-6 text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Nenhuma página encontrada</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tente buscar com outros termos
              </p>
            </div>
          )}

          {/* Dica de navegação por teclado */}
          {results.length > 0 && (
            <div className="px-2.5 py-1.5 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Use <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded text-xs">↑</kbd>
                {" "}e{" "}
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded text-xs">↓</kbd>
                {" "}para navegar
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
