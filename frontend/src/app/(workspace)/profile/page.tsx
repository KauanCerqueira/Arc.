"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/core/store/authStore";
import { useWorkspaceStore } from "@/core/store/workspaceStore";
import {
  User,
  Mail,
  Calendar,
  Edit,
  Settings,
  Star,
  FolderTree,
  FileText,
  LogOut,
  Copy as CopyIcon,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshProfile, logout } = useAuthStore();
  const { workspace, workspaces, getFavoritePages } = useWorkspaceStore();

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const getUserInitials = () => {
    if (!user) return "U";
    const firstInitial = user.nome?.charAt(0).toUpperCase() || "";
    const lastInitial = user.sobrenome?.charAt(0).toUpperCase() || "";
    return `${firstInitial}${lastInitial}` || "U";
  };

  const getUserFullName = () => {
    if (!user) return "Usuário";
    return `${user.nome ?? ""} ${user.sobrenome ?? ""}`.trim() || "Usuário";
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copiado para a área de transferência");
    } catch {}
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 dark:border-slate-700 border-t-gray-900 dark:border-t-slate-300 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  const groupsCount = workspace?.groups.length ?? 0;
  const pagesCount = workspace?.groups.reduce((acc, g) => acc + g.pages.length, 0) ?? 0;
  const favoritesCount = getFavoritePages().length;
  const workspacesCount = workspaces.length;

  return (
    <div className="bg-gray-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Meu Perfil</h1>
            <p className="text-gray-600 dark:text-gray-400">Seus dados e preferências</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900 dark:bg-slate-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition"
              title="Configurações"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configurações</span>
            </Link>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div className="h-24 sm:h-28 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-slate-700 dark:to-slate-600"></div>
          <div className="px-5 sm:px-8 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-12 sm:-mt-14 mb-4">
              {user.icone ? (
                <img
                  src={user.icone}
                  alt={getUserFullName()}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-xl"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl sm:text-4xl border-4 border-white dark:border-slate-900 shadow-xl">
                  {getUserInitials()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{getUserFullName()}</h2>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1">
                  <Mail className="w-4 h-4" />
                  <button
                    onClick={() => copyToClipboard(user.email)}
                    className="inline-flex items-center gap-1 hover:underline"
                    title="Copiar e-mail"
                  >
                    {user.email}
                    <CopyIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <Link
                href="/settings"
                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-900 dark:text-gray-100"
              >
                <Edit className="w-4 h-4" /> Editar Perfil
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Workspaces</span>
                  <FolderTree className="w-4 h-4 text-gray-400" />
                </div>
                <div className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{workspacesCount}</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Grupos</span>
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <div className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{groupsCount}</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Páginas</span>
                  <FileText className="w-4 h-4 text-gray-400" />
                </div>
                <div className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{pagesCount}</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Favoritos</span>
                  <Star className="w-4 h-4 text-amber-500" />
                </div>
                <div className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{favoritesCount}</div>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="p-5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Informações pessoais</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Nome</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{getUserFullName()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">E-mail</span>
                    <button onClick={() => copyToClipboard(user.email)} className="font-medium text-gray-900 dark:text-gray-100 hover:underline flex items-center gap-1">
                      {user.email}
                      <CopyIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {user.bio && (
                  <div className="mt-4">
                    <span className="block text-sm text-gray-500 mb-1">Bio</span>
                    <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">{user.bio}</p>
                  </div>
                )}
              </div>

              <div className="p-5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Informações da conta</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Membro desde</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</span>
                  </div>
                  {workspace?.settings && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Tema</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{workspace.settings.theme === 'dark' ? 'Escuro' : 'Claro'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Idioma</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{workspace.settings.language}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Fuso horário</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{workspace.settings.timezone}</span>
                      </div>
                    </>
                  )}
                </div>
                <Link href="/settings" className="inline-flex items-center gap-2 mt-4 text-sm text-gray-700 dark:text-gray-300 hover:underline">
                  <Edit className="w-4 h-4" /> Ajustar preferências
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

