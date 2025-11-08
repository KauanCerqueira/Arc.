"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspaceStore } from "@/core/store/workspaceStore";
import ThemeToggle from "@/shared/components/ui/ThemeToggle";
import { useNotifications } from "@/core/hooks/useNotifications";
import { useAuthStore } from "@/core/store/authStore";
import {
  Bell,
  LayoutGrid,
  Circle,
  Star,
  FileCheck,
  FileText,
  Calendar as CalendarIcon,
  Users,
  Building,
  ChevronDown,
  Paperclip,
  Folder,
  Mail,
  MoreHorizontal,
  Briefcase,
  Rocket,
  Tag,
  ListChecks,
  HelpCircle,
  ArrowUpRight,
  Layers,
  CreditCard,
  Navigation,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  Zap,
} from "lucide-react";
import { getPageIcon } from "@/app/(workspace)/components/sidebar/pageIcons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/DropdownMenu";

interface SidebarProps {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
  onAddGroup?: () => void;
  onAddPage?: (groupId: string) => void;
  onCreateWorkspace?: () => void;
}

function SidebarItem({
  icon,
  label,
  badge,
  active,
  collapsed,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  active?: boolean;
  collapsed?: boolean;
}) {
  return (
    <button
      className={[
        "w-full flex items-center justify-between px-2 py-1.5 h-auto text-xs rounded-lg transition-colors",
        active
          ? "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50",
        collapsed ? "justify-center" : "",
      ].join(" ")}
      type="button"
    >
      <div className="flex items-center gap-2">
        {icon}
        {!collapsed && <span>{label}</span>}
      </div>
      {!collapsed && badge && (
        <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {badge}
        </div>
      )}
    </button>
  );
}

function SidebarSection({
  title,
  children,
  collapsed,
}: {
  title: string;
  children: React.ReactNode;
  collapsed?: boolean;
}) {
  return (
    <div className="mb-6">
      {!collapsed && (
        <div className="flex items-center gap-2 px-1 mb-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{title}</span>
          <ChevronDown className="w-3 h-3" />
        </div>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export default function SquareSidebar({
  sidebarOpen,
  sidebarCollapsed,
  onClose,
  onToggleCollapse,
  onAddGroup,
  onAddPage,
  onCreateWorkspace,
}: SidebarProps) {
  const pathname = usePathname();
  const {
    workspace,
    workspaces,
    switchWorkspace,
    getFavoritePages,
    toggleGroupExpanded,
    updateGroup,
  } = useWorkspaceStore();
  const favoritePages = getFavoritePages();
  const [favoritesExpanded, setFavoritesExpanded] = React.useState(true);
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotifications();

  // OpÃ§Ãµes de Ã­cone e cor do grupo
  const iconOptions = [
    { key: 'folder', Icon: Folder, label: 'Pasta' },
    { key: 'briefcase', Icon: Briefcase, label: 'Projetos' },
    { key: 'rocket', Icon: Rocket, label: 'LanÃ§amentos' },
    { key: 'tag', Icon: Tag, label: 'Tags' },
    { key: 'list', Icon: ListChecks, label: 'Tarefas' },
    { key: 'users', Icon: Users, label: 'Equipe' },
    { key: 'calendar', Icon: CalendarIcon, label: 'Agenda' },
    { key: 'star', Icon: Star, label: 'Favoritos' },
  ];
  const colorOptions = ['#0ea5e9','#8b5cf6','#f59e0b','#10b981','#ef4444','#d946ef','#14b8a6','#64748b'];

  const getGroupIcon = (icon?: string) => {
    const found = iconOptions.find(o => o.key === icon);
    return found?.Icon || Folder;
  };

  // Editor flutuante do grupo
  const [editingGroupId, setEditingGroupId] = React.useState<string | null>(null);
  const [tempIcon, setTempIcon] = React.useState<string | undefined>(undefined);
  const [tempColor, setTempColor] = React.useState<string | undefined>(undefined);
  const editingGroup = workspace?.groups.find(g => g.id === editingGroupId);
  React.useEffect(() => {
    if (editingGroup) {
      setTempIcon(editingGroup.icon);
      setTempColor(editingGroup.color);
    }
  }, [editingGroupId]);

  // Fechar com ESC
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEditingGroupId(null);
    };
    if (editingGroupId) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editingGroupId]);
  const totalPages = workspace?.groups.reduce((sum, g) => sum + g.pages.length, 0) || 0;

  return (
    <aside
      className={[
        "fixed top-0 left-0 h-screen bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 flex-shrink-0 transition-all duration-300 overflow-visible flex flex-col z-40",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        sidebarCollapsed ? "md:w-20 w-64" : "w-64",
      ].join(" ")}
    >
      {/* Sidebar Header */}
      <div className={sidebarCollapsed ? "px-2 py-2" : "p-0"}>
        <div className="flex items-center justify-between px-3 pt-2 pb-2">
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 md:hidden"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Brand + workspace switcher */}
        <div className="px-4 pt-1 pb-2">
          <div className={["flex items-center", sidebarCollapsed ? "justify-center" : "justify-start"].join(" ") }>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 h-auto p-0 hover:bg-transparent min-w-0">
                  <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-sm shadow flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                    SU
                  </div>
                  {!sidebarCollapsed && (
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[11rem]">
                        {workspace?.name || "Workspace"}
                      </span>
                      <ChevronDown className="w-3 h-3 text-gray-500 flex-shrink-0" />
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                {workspaces.map(w => (
                  <DropdownMenuItem key={w.id} onClick={() => switchWorkspace(w.id)}>
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-sm shadow flex items-center justify-center text-white text-xs font-semibold">
                        {w.name.slice(0,2).toUpperCase()}
                      </div>
                      <span className="font-medium">{w.name}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {workspace && (
                  <Link href="/workspace/settings" onClick={onClose}>
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4" />
                      <span>Configurações</span>
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator />
                <Link href="/workspace/create" onClick={onClose}>
                  <DropdownMenuItem>
                    <Plus className="w-4 h-4" />
                    <span>Criar workspace</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>

          {/* Quick stats */}
          {!sidebarCollapsed && workspace && (
            <div className="mt-3 text-xs text-arc-muted flex items-center gap-3">
              <span><strong>{workspace.groups.length}</strong> grupos</span>
              <span className="w-px h-4 bg-arc-border inline-block" />
              <span><strong>{totalPages}</strong> páginas</span>
            </div>
          )}

          {/* Search (sem suggestions por enquanto) */}
          <div className="mt-4 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="search"
              placeholder="Search anything"
              className="pl-8 pr-10 text-xs h-8 w-full rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-700"
            />
            {!sidebarCollapsed && (
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded px-1 text-xs">/</kbd>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Top actions: Notifications, Dashboard, Settings */}
        <div className="space-y-1 mb-2">
          <Link
            href="/notifications"
            onClick={onClose}
            className={[
              "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
              pathname.startsWith("/notifications")
                ? "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm dark:shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)]"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50",
              sidebarCollapsed ? "justify-center" : "",
            ].join(" ")}
            title={sidebarCollapsed ? "Notificações" : ""}
          >
            <Bell className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Notificações</span>}
            {!sidebarCollapsed && unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">{unreadCount}</span>
            )}
          </Link>

          <Link
            href="/workspace"
            onClick={onClose}
            className={[
              "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
              pathname === "/workspace"
                ? "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm dark:shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)]"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50",
              sidebarCollapsed ? "justify-center" : "",
            ].join(" ")}
            title={sidebarCollapsed ? "InÃ­cio" : ""}
          >
            <LayoutGrid className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="whitespace-nowrap overflow-hidden text-ellipsis">Início</span>}
          </Link>

          <Link
            href="/settings"
            onClick={onClose}
            className={[
              "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
              pathname.startsWith("/settings")
                ? "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm dark:shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)]"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50",
              sidebarCollapsed ? "justify-center" : "",
            ].join(" ")}
            title={sidebarCollapsed ? "ConfiguraÃ§Ãµes" : ""}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="whitespace-nowrap overflow-hidden text-ellipsis">Configurações</span>}
          </Link>

          <Link
            href="/integrations"
            onClick={onClose}
            className={[
              "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
              pathname.startsWith("/integrations")
                ? "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm dark:shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)]"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50",
              sidebarCollapsed ? "justify-center" : "",
            ].join(" ")}
            title={sidebarCollapsed ? "Integrações" : ""}
          >
            <Zap className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="whitespace-nowrap overflow-hidden text-ellipsis">Integrações</span>}
          </Link>
        </div>

        {/* Favoritos */}
        {favoritePages.length > 0 && (
          <div className={sidebarCollapsed ? "pt-2" : "pt-3"}>
            {!sidebarCollapsed && (
              <button
                onClick={() => setFavoritesExpanded((v) => !v)}
                className="flex items-center gap-2 px-2 py-1.5 mb-1 w-full text-left"
              >
                <Star className="w-4 h-4 text-gray-900 dark:text-gray-100 fill-current" />
                <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Favoritos</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800"></div>
                <ChevronDown className={["w-3 h-3 transition-transform", favoritesExpanded ? "rotate-0" : "-rotate-90"].join(" ")} />
              </button>
            )}
            {favoritesExpanded && (
              <div className="space-y-0.5">
                {favoritePages.map(({ group, page }) => (
                  <Link
                    key={page.id}
                    href={`/workspace/group/${group.id}/page/${page.id}`}
                    onClick={onClose}
                    className={[
                      "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-all duration-200",
                      pathname.includes(page.id)
                        ? "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50",
                      sidebarCollapsed ? "justify-center" : "",
                    ].join(" ")}
                    title={sidebarCollapsed ? page.name : ""}
                  >
                    {/* Removed unrelated icon; only page name */}
                    {!sidebarCollapsed && <span className="truncate flex-1 font-medium">{page.name}</span>}
                    {sidebarCollapsed && <span className="sr-only">{page.name}</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Grupos */}
        <div className="mt-4">
          <div className="flex items-center justify-between px-2 mb-1">
            {!sidebarCollapsed && (
              <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Grupos</span>
            )}
            <button
              onClick={() => onAddGroup && onAddGroup()}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
              title="Adicionar grupo"
            >
              <Plus className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="space-y-0.5">
            {workspace?.groups.map((group) => (
              <div key={group.id} className="rounded-lg">
                <div
                  className={[
                    "w-full flex items-center justify-between px-2 py-2 h-auto text-sm rounded-lg transition-colors",
                    "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/50",
                  ].join(" ")}
                >
                  <button
                    onClick={() => toggleGroupExpanded(group.id)}
                    className="flex items-center gap-2 min-w-0"
                    title={group.name}
                  >
                    <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0">
                      {React.createElement(getGroupIcon(group.icon), { className: 'w-4 h-4', style: { color: group.color || undefined } })}
                    </div>
                    {!sidebarCollapsed && (
                      <span className="font-medium truncate max-w-[11rem]">{group.name}</span>
                    )}
                  </button>

                  {!sidebarCollapsed && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-arc-muted">{group.pages.length}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800" aria-label="OpÃ§Ãµes do grupo">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[12rem]">
                          <Link
                            href={`/workspace/group/${group.id}/manage`}
                            className="block px-2 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-slate-800 rounded"
                            onClick={onClose}
                          >
                            Gerenciar grupo
                          </Link>
                          <button
                            className="w-full text-left px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            onClick={async () => {
                              const ok = window.confirm('Deseja excluir este grupo?');
                              if (ok) {
                                const fn = useWorkspaceStore.getState().deleteGroup;
                                if (fn) await fn(group.id);
                              }
                            }}
                          >
                            Excluir grupo
                          </button>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>

                {group.expanded && (
                  <div className="ml-2 pl-2 border-l border-gray-200 dark:border-slate-800">
                    {group.pages.map((page) => {
                      const iconCfg = getPageIcon(page.template || "blank");
                      const Icon = iconCfg.icon;
                      return (
                        <Link
                          key={page.id}
                          href={`/workspace/group/${group.id}/page/${page.id}`}
                          onClick={onClose}
                          className={[
                            "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm",
                            pathname.includes(page.id)
                              ? "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50",
                          ].join(" ")}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="truncate">{page.name}</span>
                        </Link>
                      );
                    })}
                    <button
                      onClick={() => onAddPage && onAddPage(group.id)}
                      className="mt-1 mb-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" /> Nova pÃ¡gina
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conta / SessÃ£o */}
      <div className="mt-auto p-4 border-t border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-800/10 dark:bg-white/10 flex items-center justify-center border border-arc overflow-hidden">
                {user?.icone ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.icone} alt="Perfil" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-[10px] font-semibold text-gray-400">
                    {`${user?.nome?.[0] ?? 'U'}${user?.sobrenome?.[0] ?? ''}`.toUpperCase()}
                  </span>
                )}
              </div>
            {!sidebarCollapsed && (
              <Link href="/profile" className="leading-tight hover:underline">
                <div className="text-sm font-medium text-arc">{user?.nome} {user?.sobrenome}</div>
                <div className="text-xs text-arc-muted">{user?.email}</div>
              </Link>
            )}
            </div>
            <button
              onClick={() => { logout(); location.href = '/login'; }}
              className="text-xs px-2 py-1 border border-arc rounded-md hover:bg-gray-50 dark:hover:bg-slate-800"
              title="Sair"
            >
              Sair
            </button>
          </div>
      </div>

      {/* Editor flutuante de Grupo (gloss overlay) */}
      {editingGroup && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setEditingGroupId(null)}
          />
          <div className="relative z-50 max-w-xl w-[92%] md:w-[560px] mx-auto mt-24 rounded-xl border border-arc bg-arc-secondary shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-arc">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center shadow-sm ring-1 ring-arc bg-white/40 dark:bg-white/5">
                  {React.createElement(getGroupIcon(tempIcon), { className: 'w-4 h-4', style: { color: tempColor || undefined } })}
                </div>
                <span className="font-semibold text-arc truncate max-w-[18rem]">Editar grupo: {editingGroup.name}</span>
              </div>
              <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800" onClick={() => setEditingGroupId(null)} aria-label="Fechar">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-4 py-3">
              <div className="text-xs text-arc-muted mb-2">Ãcone</div>
              <div className="grid grid-cols-10 gap-2 mb-4">
                {iconOptions.map(({ key, Icon }) => (
                  <button
                    key={key}
                    className={`flex items-center justify-center w-8 h-8 rounded-md border ${tempIcon===key? 'border-arc bg-arc-secondary' : 'border-transparent hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                    onClick={() => setTempIcon(key)}
                    title={key}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>

              <div className="text-xs text-arc-muted mb-2">Cor do Ã­cone</div>
              <div className="grid grid-cols-10 gap-2 mb-4">
                {colorOptions.map((hex) => (
                  <button
                    key={hex}
                    className={`w-6 h-6 rounded-full border ${tempColor===hex? 'border-arc' : 'border-transparent'} hover:opacity-90`}
                    style={{ backgroundColor: hex }}
                    onClick={() => setTempColor(hex)}
                    aria-label={`Cor ${hex}`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-arc">
                <button
                  className="px-3 py-1.5 text-sm rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={async () => {
                    if (!editingGroup) return;
                    const ok = window.confirm('Tem certeza que deseja excluir este grupo? Todas as pÃ¡ginas dentro dele podem ser afetadas.');
                    if (ok) {
                      try {
                        const fn = useWorkspaceStore.getState().deleteGroup;
                        if (fn) await fn(editingGroup.id);
                      } catch {}
                      setEditingGroupId(null);
                    }
                  }}
                >
                  Excluir grupo
                </button>
                <button
                  className="px-3 py-1.5 text-sm rounded-md border border-arc hover:bg-gray-50 dark:hover:bg-slate-800"
                  onClick={() => setEditingGroupId(null)}
                >
                  Cancelar
                </button>
                <button
                  className="px-3 py-1.5 text-sm rounded-md bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90"
                  onClick={async () => {
                    await updateGroup(editingGroup.id, { icon: tempIcon, color: tempColor });
                    setEditingGroupId(null);
                  }}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </aside>
  );
}

