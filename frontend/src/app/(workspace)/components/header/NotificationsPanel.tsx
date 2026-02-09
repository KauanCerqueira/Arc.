"use client"

import { useRef, useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"
import { useNotifications } from "@/core/hooks/useNotifications"
import notificationsService from "@/core/services/notifications.service"

interface NotificationsPanelProps {
  showNotifications: boolean
  setShowNotifications: (show: boolean) => void
}

export default function NotificationsPanel({
  showNotifications,
  setShowNotifications,
}: NotificationsPanelProps) {
  const { notifications, hasCritical } = useNotifications()
  const [refreshKey, setRefreshKey] = useState(0)

  // Escutar mudanças no serviço de notificações
  useEffect(() => {
    const cleanup = notificationsService.onUpdate(() => {
      setRefreshKey(k => k + 1)
    })
    return cleanup
  }, [])

  // Calcular notificações não lidas usando o serviço (com refreshKey para forçar recálculo)
  const unreadNotifications = useMemo(() => {
    return notifications.filter(n => !notificationsService.isRead(n.id) && !notificationsService.isArchived(n.id))
  }, [notifications, refreshKey])

  const unreadCount = unreadNotifications.length
  const isSmallBadge = unreadCount > 0 && unreadCount < 10

  const [notifDragOffset, setNotifDragOffset] = useState(0)
  const notifTouchStartY = useRef<number | null>(null)

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        aria-label="Notificações"
        aria-haspopup="dialog"
        aria-expanded={showNotifications}
        className={`group relative inline-flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-2xl sm:rounded-xl border flex-shrink-0 transition-all duration-200 shadow-sm touch-manipulation active:scale-95
          border-gray-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/70
          hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 ${
            showNotifications ? 'ring-2 ring-blue-500/30 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : ''
          }`}
      >
        <span className="sr-only">Abrir notificações</span>
        <Bell className={`w-5 h-5 stroke-[1.75] transition-colors ${hasCritical ? 'text-red-500 dark:text-red-400 animate-pulse' : 'text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100'}`} />
      </button>
      {unreadCount > 0 && (
        <>
          {!showNotifications && (
            <span className={`absolute -top-1 -right-1 inline-flex ${isSmallBadge ? 'h-2.5 w-2.5' : 'h-3 w-3'} rounded-full ${hasCritical ? 'bg-red-400' : 'bg-blue-400'} opacity-75 animate-ping`} />
          )}
          {isSmallBadge ? (
            <span className={`absolute -top-1 -right-1 h-2.5 w-2.5 ${hasCritical ? 'bg-red-500' : 'bg-blue-500'} rounded-full shadow-lg ring-2 ring-white dark:ring-slate-900`} />
          ) : (
            <span className={`absolute -top-1 -right-1 w-5 h-5 ${hasCritical ? 'bg-red-500 animate-pulse' : 'bg-blue-500'} text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-slate-900`}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </>
      )}

      {/* Painel de Notificações */}
      {showNotifications && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
          <div
            role="dialog"
            aria-modal="true"
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 dark:border-slate-800 z-50 max-h-[70vh] sm:max-h-[600px] overflow-hidden flex flex-col"
            onTouchStart={(e) => { notifTouchStartY.current = e.touches[0].clientY; setNotifDragOffset(0) }}
            onTouchMove={(e) => { if (notifTouchStartY.current === null) return; const dy = e.touches[0].clientY - notifTouchStartY.current; if (dy > 0) setNotifDragOffset(Math.min(dy, 160)) }}
            onTouchEnd={() => { if (notifDragOffset > 60) setShowNotifications(false); setNotifDragOffset(0); notifTouchStartY.current = null }}
            style={{ transform: notifDragOffset ? `translateY(${notifDragOffset}px)` : undefined, transition: 'transform 200ms ease' }}
          >
            {/* caret/arrow indicator (desktop) */}
            <div className="absolute -top-2 right-6 h-4 w-4 rotate-45 bg-white dark:bg-slate-900 border-l border-t border-gray-200 dark:border-slate-800"></div>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-10 bg-white dark:bg-slate-900 backdrop-blur-sm">
              <h3 className="font-bold text-gray-900 dark:text-gray-100">
                Notificações {unreadCount > 0 && `(${unreadCount})`}
              </h3>
              {unreadCount > 0 && (
                <Link
                  href="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Ver todas
                </Link>
              )}
            </div>

            {/* Notificações */}
            <div className="overflow-y-auto flex-1 overscroll-contain">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nenhuma notificação
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Você está em dia!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-slate-800">
                  {unreadNotifications.slice(0, 20).map((notification) => (
                    <Link
                      key={notification.id}
                      href={`/workspace/group/${notification.groupId}/page/${notification.pageId}`}
                      onClick={() => setShowNotifications(false)}
                      className={`block p-4 sm:p-3 hover:bg-gray-50 dark:hover:bg-slate-800 active:bg-gray-100 dark:active:bg-slate-800 transition-colors ${
                        notification.priority === 'critical' ? 'bg-red-50/50 dark:bg-red-900/10' :
                        notification.priority === 'high' ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-11 h-11 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-xl ${
                          notification.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/40' :
                          notification.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/40' :
                          notification.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/40' :
                          'bg-blue-100 dark:bg-blue-900/40'
                        }`}>
                          {notification.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {notification.title}
                            </h4>
                            {notification.priority === 'critical' && (
                              <span className="text-xs px-1.5 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded font-medium">
                                CRÍTICO
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            📄 {notification.pageName}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-slate-800 text-center">
                <Link
                  href="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Ver todas as notificações {notifications.length > 20 && `(${notifications.length})`}
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
