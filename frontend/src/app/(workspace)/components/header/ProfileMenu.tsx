"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown, User, LogOut, HelpCircle, Settings, Crown, Shield, BarChart3, Users, Ticket } from "lucide-react"
import { useAuthStore } from "@/core/store/authStore"

interface ProfileMenuProps {
  showProfileMenu: boolean
  setShowProfileMenu: (show: boolean) => void
}

export default function ProfileMenu({
  showProfileMenu,
  setShowProfileMenu,
}: ProfileMenuProps) {
  const router = useRouter()
  const { logout, user } = useAuthStore()

  // Helper para gerar iniciais do usuário
  const getUserInitials = () => {
    if (!user) return "U"
    const firstInitial = user.nome?.charAt(0).toUpperCase() || ""
    const lastInitial = user.sobrenome?.charAt(0).toUpperCase() || ""
    return `${firstInitial}${lastInitial}` || "U"
  }

  // Nome completo do usuário
  const getUserFullName = () => {
    if (!user) return "Usuário"
    return `${user.nome} ${user.sobrenome}`.trim() || "Usuário"
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        aria-haspopup="menu"
        aria-expanded={showProfileMenu}
        aria-label="Abrir menu do perfil"
        className={`group relative inline-flex items-center gap-2 h-11 sm:h-9 px-2.5 rounded-2xl sm:rounded-xl border border-gray-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/70 shadow-sm transition-all duration-200 flex-shrink-0 touch-manipulation active:scale-95 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 ${showProfileMenu ? 'ring-2 ring-blue-500/30 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : ''}`}
      >
        <span className="sr-only">Abrir menu do perfil</span>
        {user?.icone ? (
          <img
            src={user.icone}
            alt={getUserFullName()}
            className="w-8 h-8 rounded-xl object-cover shadow-sm ring-1 ring-black/5 dark:ring-white/10"
          />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-sm ring-1 ring-black/5 dark:ring-white/10">
            {getUserInitials()}
          </div>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-600 dark:text-gray-400 hidden sm:block transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
      </button>

      {showProfileMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
          <div role="menu" aria-labelledby="profile-menu" className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 dark:border-slate-800 py-2 z-50 overflow-hidden">
            <div className="absolute -top-2 right-6 h-4 w-4 rotate-45 bg-white dark:bg-slate-900 border-l border-t border-gray-200 dark:border-slate-800"></div>
            <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-3">
                {user?.icone ? (
                  <img
                    src={user.icone}
                    alt={getUserFullName()}
                    className="w-10 h-10 rounded-lg object-cover shadow-md flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-md">
                    {getUserInitials()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">{getUserFullName()}</div>
                    {user?.isMaster && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex-shrink-0">
                        <Crown className="w-3 h-3 text-white" />
                        <span className="text-xs font-semibold text-white">MASTER</span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email || "usuario@email.com"}</div>
                </div>
              </div>
            </div>

            <div className="py-2">
              <Link
                href="/profile"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 active:bg-gray-100 dark:active:bg-slate-800 transition-colors duration-200"
              >
                <User className="w-4 h-4" />
                <span>Perfil</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 active:bg-gray-100 dark:active:bg-slate-800 transition-colors duration-200"
              >
                <Settings className="w-4 h-4" />
                <span>Configurações</span>
              </Link>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 active:bg-gray-100 dark:active:bg-slate-800 transition-colors duration-200">
                <HelpCircle className="w-4 h-4" />
                <span>Ajuda</span>
              </button>
            </div>

            {/* Seção Master */}
            {user?.isMaster && (
              <>
                <div className="border-t border-gray-200 dark:border-slate-800 my-2"></div>
                <div className="py-2">
                  <div className="px-4 py-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      Painel Master
                    </span>
                  </div>

                  <Link
                    href="/analytics"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors duration-200"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Analytics</span>
                  </Link>

                  <Link
                    href="/master/users"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors duration-200"
                  >
                    <Users className="w-4 h-4" />
                    <span>Gerenciar Usuários</span>
                  </Link>

                  <Link
                    href="/master/promo-codes"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors duration-200"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Códigos Promocionais</span>
                  </Link>
                </div>
              </>
            )}

            <div className="border-t border-gray-200 dark:border-slate-800 pt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
