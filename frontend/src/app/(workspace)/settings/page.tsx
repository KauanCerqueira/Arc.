"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/core/store/authStore";
import { User, Lock, Save, Loader2, Check, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { user, updateProfile, updatePassword, refreshProfile, isLoading } = useAuthStore();

  // Profile form state
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [bio, setBio] = useState("");
  const [icone, setIcone] = useState("");

  // Password form state
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // UI state
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    if (user) {
      setNome(user.nome || "");
      setSobrenome(user.sobrenome || "");
      setBio(user.bio || "");
      setIcone(user.icone || "");
    }
  }, [user]);

  // Gera iniciais do usuário
  const getUserInitials = () => {
    if (!user) return "U";
    const firstInitial = user.nome?.charAt(0).toUpperCase() || "";
    const lastInitial = user.sobrenome?.charAt(0).toUpperCase() || "";
    return `${firstInitial}${lastInitial}` || "U";
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess(false);

    if (!nome.trim() || !sobrenome.trim()) {
      setProfileError("Nome e sobrenome são obrigatórios");
      return;
    }

    if (nome.length < 2 || nome.length > 50) {
      setProfileError("Nome deve ter entre 2 e 50 caracteres");
      return;
    }

    if (sobrenome.length < 2 || sobrenome.length > 50) {
      setProfileError("Sobrenome deve ter entre 2 e 50 caracteres");
      return;
    }

    if (bio && bio.length > 500) {
      setProfileError("Bio deve ter no máximo 500 caracteres");
      return;
    }

    try {
      await updateProfile({
        nome: nome.trim(),
        sobrenome: sobrenome.trim(),
        bio: bio.trim() || undefined,
        icone: icone.trim() || undefined,
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error: any) {
      setProfileError(error.message || "Erro ao atualizar perfil");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setPasswordError("Todos os campos são obrigatórios");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setPasswordError("As senhas não conferem");
      return;
    }

    if (novaSenha.length < 8) {
      setPasswordError("A nova senha deve ter no mínimo 8 caracteres");
      return;
    }

    // Validação de senha forte
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(novaSenha)) {
      setPasswordError(
        "A senha deve conter: letra maiúscula, minúscula, número e caractere especial (@$!%*?&)"
      );
      return;
    }

    try {
      await updatePassword({
        senhaAtual,
        novaSenha,
      });
      setPasswordSuccess(true);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error: any) {
      setPasswordError(error.message || "Erro ao atualizar senha");
    }
  };

  const tabs = [
    { id: "profile", name: "Perfil", icon: User },
    { id: "password", name: "Senha", icon: Lock },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 dark:border-slate-700 border-t-gray-900 dark:border-t-slate-300 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Configurações
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie suas informações pessoais e segurança
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-gray-900 dark:bg-slate-800 text-white shadow-lg"
                        : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-900"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === "profile" && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border-2 border-gray-900 dark:border-slate-700 p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Editar Perfil
                </h2>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Avatar Preview */}
                  <div className="flex items-center gap-6 pb-6 border-b border-gray-200 dark:border-slate-800">
                    <div className="flex-shrink-0">
                      {icone ? (
                        <img
                          src={icone}
                          alt="Preview"
                          className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-900 dark:border-slate-700 shadow-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl border-2 border-gray-900 dark:border-slate-700 shadow-lg">
                          {getUserInitials()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Foto de Perfil
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cole a URL de uma imagem no campo abaixo
                      </p>
                    </div>
                  </div>

                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu primeiro nome"
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 shadow-sm"
                      required
                    />
                  </div>

                  {/* Sobrenome */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Sobrenome *
                    </label>
                    <input
                      type="text"
                      value={sobrenome}
                      onChange={(e) => setSobrenome(e.target.value)}
                      placeholder="Seu sobrenome"
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 shadow-sm"
                      required
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Conte um pouco sobre você..."
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 shadow-sm resize-none"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {bio.length}/500 caracteres
                    </p>
                  </div>

                  {/* URL do Ícone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      URL da Foto de Perfil
                    </label>
                    <input
                      type="url"
                      value={icone}
                      onChange={(e) => setIcone(e.target.value)}
                      placeholder="https://exemplo.com/sua-foto.jpg"
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 shadow-sm"
                    />
                  </div>

                  {/* Messages */}
                  {profileSuccess && (
                    <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-green-700 dark:text-green-300 font-medium">
                        Perfil atualizado com sucesso!
                      </span>
                    </div>
                  )}

                  {profileError && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <span className="text-red-700 dark:text-red-300 font-medium">
                        {profileError}
                      </span>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-slate-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Salvar Alterações</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "password" && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border-2 border-gray-900 dark:border-slate-700 p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Alterar Senha
                </h2>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  {/* Senha Atual */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Senha Atual *
                    </label>
                    <input
                      type="password"
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                      placeholder="Digite sua senha atual"
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 shadow-sm"
                      required
                    />
                  </div>

                  {/* Nova Senha */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Nova Senha *
                    </label>
                    <input
                      type="password"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder="Digite a nova senha"
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 shadow-sm"
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial
                    </p>
                  </div>

                  {/* Confirmar Senha */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Confirmar Nova Senha *
                    </label>
                    <input
                      type="password"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      placeholder="Confirme a nova senha"
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 shadow-sm"
                      required
                    />
                  </div>

                  {/* Messages */}
                  {passwordSuccess && (
                    <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-green-700 dark:text-green-300 font-medium">
                        Senha atualizada com sucesso!
                      </span>
                    </div>
                  )}

                  {passwordError && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <span className="text-red-700 dark:text-red-300 font-medium">
                        {passwordError}
                      </span>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-slate-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Atualizando...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        <span>Atualizar Senha</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
