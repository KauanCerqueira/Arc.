"use client"

import React, { useState, useEffect } from "react"
import { Menu, ChevronRight } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import ThemeToggle from "@/shared/components/ui/ThemeToggle"
import NotificationsPanel from "./NotificationsPanel"
import ProfileMenu from "./ProfileMenu"
import { useWorkspaceStore } from "@/core/store/workspaceStore"

interface HeaderProps {
  sidebarCollapsed: boolean
  setSidebarOpen: (open: boolean) => void
}

export default function Header({ sidebarCollapsed, setSidebarOpen }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const { workspace } = useWorkspaceStore()
  const pathname = usePathname()

  // Parsear breadcrumbs do pathname
  const getBreadcrumbs = () => {
    if (pathname === '/workspace') {
      return [{ label: 'Dashboard', href: '/workspace' }]
    }

    const parts = pathname.split('/').filter(Boolean)
    const breadcrumbs: { label: string; href: string }[] = [
      { label: 'Dashboard', href: '/workspace' }
    ]

    // Se está em uma página específica
    if (parts.includes('page') && workspace) {
      const groupId = parts[parts.indexOf('group') + 1]
      const pageId = parts[parts.indexOf('page') + 1]

      const group = workspace.groups.find(g => g.id === groupId)
      if (group) {
        const page = group.pages.find(p => p.id === pageId)
        if (page) {
          breadcrumbs.push({ label: group.name, href: '/workspace' })
          breadcrumbs.push({ label: page.name, href: pathname })
        }
      }
    }

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  // Fechar painel de notificações com ESC
  useEffect(() => {
    if (!showNotifications) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowNotifications(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [showNotifications])

  // Fechar menu de perfil com ESC
  useEffect(() => {
    if (!showProfileMenu) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowProfileMenu(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [showProfileMenu])

  const totalPages = workspace?.groups.reduce((sum, group) => sum + group.pages.length, 0) || 0

  return (
    <header className={`h-16 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl fixed top-0 right-0 z-30 transition-all duration-300 ${sidebarCollapsed ? 'md:left-20' : 'md:left-64'} left-0`}>
      {/* Left Side - Mobile Menu & Breadcrumbs */}
      <div className="flex items-center gap-3 flex-1 overflow-hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 md:hidden flex-shrink-0"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>

        {/* Breadcrumbs Navigation */}
        <nav className="hidden md:flex flex-row items-center gap-2 overflow-x-auto scrollbar-hide" style={{ flexWrap: 'nowrap' }}>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap flex-shrink-0">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap flex-shrink-0"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Mobile - Current Page Title */}
        <div className="md:hidden min-w-0">
          <h1 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard'}
          </h1>
        </div>
      </div>

      {/* Center - Quick Stats */}
      <div className="hidden lg:flex items-center gap-4 px-4">
        <div className="flex items-center gap-3 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg">
          <div className="text-xs">
            <span className="font-bold text-gray-900 dark:text-white">{workspace?.groups.length || 0}</span>
            <span className="text-gray-600 dark:text-gray-400 ml-1">grupos</span>
          </div>
          <div className="w-px h-4 bg-gray-300 dark:bg-slate-700"></div>
          <div className="text-xs">
            <span className="font-bold text-gray-900 dark:text-white">{totalPages}</span>
            <span className="text-gray-600 dark:text-gray-400 ml-1">páginas</span>
          </div>
        </div>
      </div>

      {/* Right Side - Actions */}
      <div className="flex items-center gap-1">
        <ThemeToggle />

        <NotificationsPanel
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
        />

        <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

        <ProfileMenu
          showProfileMenu={showProfileMenu}
          setShowProfileMenu={setShowProfileMenu}
        />
      </div>
    </header>
  )
}
