"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/core/store/authStore";
import {
  User,
  Lock,
  Save,
  Loader2,
  Check,
  AlertCircle,
  Palette,
  Sun,
  Moon,
  Monitor,
  Bell,
  Image as ImageIcon,
  Users,
  ArrowRight,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  Mail,
  Globe
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ThemeMode = "light" | "dark" | "system";

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateProfile, updatePassword, refreshProfile, isLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "appearance" | "notifications" | "team">("profile");

  // --- STATES ---
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [bio, setBio] = useState("");
  const [icone, setIcone] = useState("");

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("theme") as ThemeMode) || "system";
  });

  const [emailNotifs, setEmailNotifs] = useState<boolean>(true);
  const [productNotifs, setProductNotifs] = useState<boolean>(true);

  // --- EFFECTS ---
  useEffect(() => { refreshProfile(); }, [refreshProfile]);

  useEffect(() => {
    if (user) {
      setNome(user.nome || "");
      setSobrenome(user.sobrenome || "");
      setBio(user.bio || "");
      setIcone(user.icone || "");
    }
  }, [user]);

  // Theme Logic
  useEffect(() => {
    const root = document.documentElement;
    const apply = (mode: ThemeMode) => {
      if (mode === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.classList.toggle("dark", prefersDark);
      } else {
        root.classList.toggle("dark", mode === "dark");
      }
    };
    apply(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);


  // --- HANDLERS ---
  const getUserInitials = () => {
    if (!user) return "U";
    return `${user.nome?.charAt(0) || ""}${user.sobrenome?.charAt(0) || ""}`.toUpperCase() || "U";
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(""); setProfileSuccess(false);
    try {
      await updateProfile({ nome, sobrenome, bio, icone });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err?.message || "Erro ao atualizar");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(""); setPasswordSuccess(false);
    if (novaSenha !== confirmarSenha) return setPasswordError("Senhas não conferem");
    try {
      await updatePassword({ senhaAtual, novaSenha });
      setPasswordSuccess(true);
      setSenhaAtual(""); setNovaSenha(""); setConfirmarSenha("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err?.message || "Erro ao atualizar senha");
    }
  };


  // --- NAVIGATION CONFIG ---
  const tabs = [
    { id: "profile", name: "Perfil", icon: User },
    { id: "password", name: "Segurança", icon: Shield },
    { id: "appearance", name: "Aparência", icon: Palette },
    { id: "notifications", name: "Notificações", icon: Bell },
    { id: "team", name: "Time", icon: Users },
  ];

  if (!user) return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-slate-700 opacity-20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-gray-900 dark:border-white border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">carregando</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8 lg:py-12">

        {/* HERO SECTION */}
        <div className="mb-12 lg:mb-16">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-full">
                configurações
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-gray-900 dark:text-white mb-6">
              Personalize sua<br />experiência.
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
              Controle total sobre perfil, segurança, aparência e preferências em um só lugar.
            </p>
          </div>

          {/* Quick Info Pills */}
          <div className="flex flex-wrap gap-3 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold">{user.nome} {user.sobrenome}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 dark:border-slate-800 rounded-full">
              <Mail className="w-3.5 h-3.5 text-gray-900 dark:text-white" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">{user.email}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 dark:border-slate-800 rounded-full">
              <Globe className="w-3.5 h-3.5 text-gray-900 dark:text-white" />
              <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">{theme}</span>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b-2 border-gray-200 dark:border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-2 px-5 py-3 rounded-t-lg font-bold text-sm whitespace-nowrap transition-all duration-200 border-b-2
                    ${isActive
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-transparent hover:bg-gray-100 dark:hover:bg-slate-900'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" strokeWidth={2.5} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="pb-12">
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 lg:p-12">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10 pb-10 border-b-2 border-gray-200 dark:border-slate-800">
                  {icone ? (
                    <img src={icone} alt="Profile" className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-200 dark:border-slate-800" />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center text-3xl font-black border-2 border-gray-200 dark:border-slate-800">
                      {getUserInitials()}
                    </div>
                  )}
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                      {user.nome || 'Usuário'} {user.sobrenome}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{user.email}</p>
                    <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-slate-900 transition-all text-sm">
                      <ImageIcon className="w-4 h-4" strokeWidth={2.5} />
                      Alterar Foto
                    </button>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Nome</label>
                      <input
                        value={nome} onChange={(e) => setNome(e.target.value)}
                        className="w-full px-5 py-3.5 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl text-gray-900 dark:text-white font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-gray-900 dark:focus:border-white transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Sobrenome</label>
                      <input
                        value={sobrenome} onChange={(e) => setSobrenome(e.target.value)}
                        className="w-full px-5 py-3.5 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl text-gray-900 dark:text-white font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-gray-900 dark:focus:border-white transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Bio</label>
                    <textarea
                      value={bio} onChange={(e) => setBio(e.target.value)} rows={4} maxLength={500}
                      className="w-full px-5 py-3.5 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl text-gray-900 dark:text-white font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-gray-900 dark:focus:border-white transition-all outline-none resize-none"
                      placeholder="Conte um pouco sobre você..."
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-2">{bio.length}/500</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Avatar URL</label>
                    <input
                      value={icone} onChange={(e) => setIcone(e.target.value)} placeholder="https://..."
                      className="w-full px-5 py-3.5 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl text-gray-900 dark:text-white font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-gray-900 dark:focus:border-white transition-all outline-none"
                    />
                  </div>

                  {profileSuccess && (
                    <div className="flex items-center gap-3 px-5 py-4 bg-green-50 dark:bg-green-950 border-2 border-green-500 rounded-xl animate-in fade-in slide-in-from-top-2">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400" strokeWidth={2.5} />
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">Perfil atualizado com sucesso!</span>
                    </div>
                  )}

                  {profileError && (
                    <div className="flex items-center gap-3 px-5 py-4 bg-red-50 dark:bg-red-950 border-2 border-red-500 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" strokeWidth={2.5} />
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">{profileError}</span>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} /> : <Save className="w-5 h-5" strokeWidth={2.5} />}
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* PASSWORD TAB */}
          {activeTab === "password" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 lg:p-12 max-w-3xl">
                <div className="flex items-center gap-4 mb-8 pb-8 border-b-2 border-gray-200 dark:border-slate-800">
                  <div className="w-14 h-14 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
                    <Shield className="w-7 h-7 text-white dark:text-gray-900" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Alterar Senha</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mantenha sua conta segura</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Senha Atual</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={senhaAtual}
                        onChange={e => setSenhaAtual(e.target.value)}
                        className="w-full px-5 py-3.5 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl text-gray-900 dark:text-white font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-gray-900 dark:focus:border-white transition-all outline-none pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" strokeWidth={2.5} /> : <Eye className="w-5 h-5" strokeWidth={2.5} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Nova Senha</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={novaSenha}
                        onChange={e => setNovaSenha(e.target.value)}
                        className="w-full px-5 py-3.5 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl text-gray-900 dark:text-white font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-gray-900 dark:focus:border-white transition-all outline-none pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" strokeWidth={2.5} /> : <Eye className="w-5 h-5" strokeWidth={2.5} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Confirmar Senha</label>
                    <input
                      type="password"
                      value={confirmarSenha}
                      onChange={e => setConfirmarSenha(e.target.value)}
                      className="w-full px-5 py-3.5 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl text-gray-900 dark:text-white font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-gray-900 dark:focus:border-white transition-all outline-none"
                    />
                  </div>

                  {passwordSuccess && (
                    <div className="flex items-center gap-3 px-5 py-4 bg-green-50 dark:bg-green-950 border-2 border-green-500 rounded-xl animate-in fade-in slide-in-from-top-2">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400" strokeWidth={2.5} />
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">Senha atualizada com sucesso!</span>
                    </div>
                  )}

                  {passwordError && (
                    <div className="flex items-center gap-3 px-5 py-4 bg-red-50 dark:bg-red-950 border-2 border-red-500 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" strokeWidth={2.5} />
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">{passwordError}</span>
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={!novaSenha || !senhaAtual}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Lock className="w-5 h-5" strokeWidth={2.5} />
                      Atualizar Senha
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === "appearance" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 lg:p-12">
                <div className="flex items-center gap-4 mb-8 pb-8 border-b-2 border-gray-200 dark:border-slate-800">
                  <div className="w-14 h-14 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
                    <Palette className="w-7 h-7 text-white dark:text-gray-900" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Aparência</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Escolha o tema da interface</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button
                    onClick={() => setTheme("light")}
                    className={`
                      group relative p-8 border-2 rounded-2xl transition-all duration-200
                      ${theme === 'light'
                        ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-slate-900'
                        : 'border-gray-200 dark:border-slate-800 hover:border-gray-400 dark:hover:border-slate-600'
                      }
                    `}
                  >
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl border-2 border-gray-200 dark:border-slate-800 bg-white flex items-center justify-center">
                      <Sun className="w-8 h-8 text-yellow-500" strokeWidth={2.5} />
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">Claro</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Tema light</div>
                    </div>
                    {theme === 'light' && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center">
                          <Check className="w-4 h-4 text-white dark:text-gray-900" strokeWidth={3} />
                        </div>
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => setTheme("dark")}
                    className={`
                      group relative p-8 border-2 rounded-2xl transition-all duration-200
                      ${theme === 'dark'
                        ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-slate-900'
                        : 'border-gray-200 dark:border-slate-800 hover:border-gray-400 dark:hover:border-slate-600'
                      }
                    `}
                  >
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl border-2 border-gray-200 dark:border-slate-800 bg-slate-900 flex items-center justify-center">
                      <Moon className="w-8 h-8 text-blue-400" strokeWidth={2.5} />
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">Escuro</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Tema dark</div>
                    </div>
                    {theme === 'dark' && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center">
                          <Check className="w-4 h-4 text-white dark:text-gray-900" strokeWidth={3} />
                        </div>
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => setTheme("system")}
                    className={`
                      group relative p-8 border-2 rounded-2xl transition-all duration-200
                      ${theme === 'system'
                        ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-slate-900'
                        : 'border-gray-200 dark:border-slate-800 hover:border-gray-400 dark:hover:border-slate-600'
                      }
                    `}
                  >
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl border-2 border-gray-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-900 flex items-center justify-center">
                      <Monitor className="w-8 h-8 text-gray-600" strokeWidth={2.5} />
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">Sistema</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Auto</div>
                    </div>
                    {theme === 'system' && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center">
                          <Check className="w-4 h-4 text-white dark:text-gray-900" strokeWidth={3} />
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 lg:p-12">
                <div className="flex items-center gap-4 mb-8 pb-8 border-b-2 border-gray-200 dark:border-slate-800">
                  <div className="w-14 h-14 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
                    <Bell className="w-7 h-7 text-white dark:text-gray-900" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Notificações</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Configure suas preferências</p>
                  </div>
                </div>

                <div className="space-y-4 max-w-3xl">
                  {[
                    {
                      label: "Atualizações do Produto",
                      description: "Receba novidades sobre features e melhorias",
                      icon: Sparkles,
                      checked: productNotifs,
                      onChange: setProductNotifs
                    },
                    {
                      label: "Alertas de Segurança",
                      description: "Notificações sobre logins e mudanças de senha",
                      icon: Shield,
                      checked: emailNotifs,
                      onChange: setEmailNotifs
                    }
                  ].map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-6 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl hover:border-gray-400 dark:hover:border-slate-600 transition-all duration-200"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-white dark:text-gray-900" strokeWidth={2.5} />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">{item.label}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={(e) => item.onChange(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-8 bg-gray-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-700 after:border-2 after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-gray-900 dark:peer-checked:bg-white"></div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}


          {/* TEAM TAB */}
          {activeTab === "team" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-16 text-center max-w-3xl mx-auto">
                <div className="w-24 h-24 bg-gray-900 dark:bg-white rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <Users className="w-12 h-12 text-white dark:text-gray-900" strokeWidth={2.5} />
                </div>
                <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Gerenciamento de Time</h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-10">
                  Convide membros, defina permissões e organize seus grupos de trabalho em um painel dedicado.
                </p>
                <Link
                  href="/workspace/settings"
                  className="inline-flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-10 py-5 rounded-xl font-bold hover:opacity-90 transition-all text-lg"
                >
                  Gerenciar Workspace
                  <ArrowRight className="w-6 h-6" strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
