"use client";

import React from "react";
import { Menu, ChevronRight } from "lucide-react";
import ThemeToggle from "@/shared/components/ui/ThemeToggle";
import { usePathname } from "next/navigation";
import { useWorkspaceStore } from "@/core/store/workspaceStore";
import teamService from "@/core/services/team.service";
import type { WorkspaceMember } from "@/core/types/team.types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/DropdownMenu";
import { useAuthStore } from "@/core/store/authStore";
import Image from "next/image";

interface HeaderProps {
  sidebarCollapsed: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function SquareHeader({ sidebarCollapsed, setSidebarOpen }: HeaderProps) {
  // no calendar UI here to keep header minimal
  const pathname = usePathname();
  const { workspace } = useWorkspaceStore();
  const [members, setMembers] = React.useState<WorkspaceMember[]>([]);
  const { user, logout } = useAuthStore();

  const breadcrumbs = React.useMemo(() => {
    if (pathname === "/workspace") {
      return [{ label: "Dashboard", href: "/workspace" }];
    }
    const parts = pathname.split("/").filter(Boolean);
    const crumbs: { label: string; href: string }[] = [
      { label: "Dashboard", href: "/workspace" },
    ];
    if (parts.includes("page") && workspace) {
      const groupId = parts[parts.indexOf("group") + 1];
      const pageId = parts[parts.indexOf("page") + 1];
      const group = workspace.groups.find((g) => g.id === groupId);
      if (group) {
        const page = group.pages.find((p) => p.id === pageId);
        if (page) {
          crumbs.push({ label: group.name, href: "/workspace" });
          crumbs.push({ label: page.name, href: pathname });
        }
      }
    }
    return crumbs;
  }, [pathname, workspace]);

  React.useEffect(() => {
    let mounted = true;
    async function loadMembers() {
      try {
        if (!workspace?.id) return;
        const team = await teamService.getTeam(workspace.id);
        if (mounted) setMembers(team.members || []);
      } catch {
        if (mounted) setMembers([]);
      }
    }
    loadMembers();
    return () => {
      mounted = false;
    };
  }, [workspace?.id]);

  const renderAvatar = (m: WorkspaceMember) => {
    const initials = (m.userName || m.userEmail || "?")
      .split(" ")
      .map((p) => p.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return (
      <div
        key={m.id}
        className="relative inline-flex items-center justify-center w-6 h-6 rounded-full bg-arc-secondary text-[10px] font-semibold text-arc"
        title={m.userName}
      >
        {m.userIcon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.userIcon} alt={m.userName} className="w-full h-full rounded-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
    );
  };

  return (
    <header
      className={[
        "h-12 border-b border-arc flex items-center justify-between px-3 md:px-5 bg-arc-secondary backdrop-blur-xl fixed top-0 right-0 z-30 transition-all duration-300",
        sidebarCollapsed ? "md:left-20" : "md:left-64",
        "left-0",
      ].join(" ")}
    >
      {/* Left - Mobile menu + Breadcrumbs */}
      <div className="flex items-center gap-3 flex-1 overflow-hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 hover:bg-arc-secondary rounded-lg transition-colors duration-200 md:hidden flex-shrink-0"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5 text-arc-muted" />
        </button>
        <nav className="hidden md:flex flex-row items-center gap-2 overflow-x-auto scrollbar-hide" style={{ flexWrap: 'nowrap' }}>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-arc-muted flex-shrink-0" />
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-sm font-semibold text-arc whitespace-nowrap flex-shrink-0">
                  {crumb.label}
                </span>
              ) : (
                <a
                  href={crumb.href}
                  className="text-sm text-arc-muted hover:text-arc transition-colors whitespace-nowrap flex-shrink-0"
                >
                  {crumb.label}
                </a>
              )}
            </React.Fragment>
          ))}
        </nav>
        <div className="md:hidden min-w-0">
          <h1 className="text-sm font-semibold text-arc truncate">
            {breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard'}
          </h1>
        </div>
      </div>

      {/* Right - Actions (limpo): tema + membros + perfil */}
      <div className="flex items-center gap-2 md:gap-3">
        <ThemeToggle />
        {members.length > 0 && (
          <div className="hidden md:flex items-center gap-2 text-sm text-arc-muted">
            <div className="flex -space-x-2">
              {members.slice(0, 4).map((m) => (
                <div key={m.id} className="border-2 border-arc rounded-full">
                  {renderAvatar(m)}
                </div>
              ))}
            </div>
            {members.length > 4 && (
              <span className="text-xs text-arc-muted pl-1">+{members.length - 4}</span>
            )}
          </div>
        )}
        {/* Perfil */}
        {/* Perfil (placeholder removido: imagem roxa) */}
        {/* Botão de perfil compacto com iniciais quando não houver ícone */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="inline-flex items-center justify-center rounded-full w-8 h-8 overflow-hidden border border-arc bg-gray-200 text-gray-700 dark:bg-slate-800 dark:text-gray-200 hover:opacity-90"
              aria-label="Abrir menu de perfil"
            >
              {user?.icone ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.icone} alt="Perfil" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-xs font-semibold">
                  {`${user?.nome?.[0] ?? 'U'}${user?.sobrenome?.[0] ?? ''}`.toUpperCase()}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[14rem]">
            <div className="px-3 py-2 text-xs">
              <div className="font-semibold text-arc">{user?.nome} {user?.sobrenome}</div>
              <div className="text-arc-muted">{user?.email}</div>
            </div>
            <DropdownMenuItem asChild>
              <a href="/profile">Meu perfil</a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/settings">Configurações</a>
            </DropdownMenuItem>
            {user?.isMaster && (
              <>
                <DropdownMenuItem asChild>
                  <a href="/analytics">Analytics</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/master/users">Gerenciar Usuários</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/master/promo-codes">Códigos Promocionais</a>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem onClick={() => { logout(); location.href = '/login'; }}>
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
