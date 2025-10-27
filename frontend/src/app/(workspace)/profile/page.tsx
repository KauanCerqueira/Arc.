"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/core/store/authStore";
import { User, Mail, Calendar, Edit, Settings } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuthStore();

  useEffect(() => {
    // Refresh profile data when page loads
    refreshProfile();
  }, [refreshProfile]);

  // Gera iniciais do usu�rio
  const getUserInitials = () => {
    if (!user) return "U";
    const firstInitial = user.nome?.charAt(0).toUpperCase() || "";
    const lastInitial = user.sobrenome?.charAt(0).toUpperCase() || "";
    return `${firstInitial}${lastInitial}` || "U";
  };

  const getUserFullName = () => {
    if (!user) return "Usu�rio";
    return `${user.nome} ${user.sobrenome}`.trim() || "Usu�rio";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header com a��es */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Meu Perfil
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Visualize e gerencie suas informa��es pessoais
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/settings"
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-slate-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configura��es</span>
            </Link>
          </div>
        </div>

        {/* Card de Perfil */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border-2 border-gray-900 dark:border-slate-700 overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-slate-700 dark:to-slate-600"></div>

          {/* Informa��es do Perfil */}
          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-16 mb-6">
              {user.icone ? (
                <img
                  src={user.icone}
                  alt={getUserFullName()}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-2xl"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-4xl border-4 border-white dark:border-slate-900 shadow-2xl">
                  {getUserInitials()}
                </div>
              )}

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {getUserFullName()}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              </div>

              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-900 dark:border-slate-700 text-gray-900 dark:text-gray-100 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <Edit className="w-4 h-4" />
                <span>Editar Perfil</span>
              </Link>
            </div>

            {/* Informa��es Detalhadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Nome Completo */}
              <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Nome Completo
                  </span>
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {getUserFullName()}
                </p>
              </div>

              {/* Email */}
              <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </span>
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Bio
                  </span>
                </div>
                <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                  {user.bio}
                </p>
              </div>
            )}

            {/* Informa��es Adicionais */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4">
                Informa��es da Conta
              </h3>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  Membro desde {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
