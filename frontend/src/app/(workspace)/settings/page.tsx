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
  Mail,
  Image,
  CreditCard,
  Plus,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import billingService, { type PaymentMethod } from "@/core/services/billing.service";
import PaymentWallet from "@/app/(workspace)/components/payments/PaymentWallet";

type ThemeMode = "light" | "dark" | "system";

export default function SettingsPage() {
  const { user, updateProfile, updatePassword, refreshProfile, isLoading } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"profile" | "password" | "appearance" | "notifications" | "payments">("profile");

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

  // Appearance
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("theme") as ThemeMode) || "system";
  });

  // Notifications (client only)
  const [emailNotifs, setEmailNotifs] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const v = localStorage.getItem("notifs_email");
    return v === null ? true : v === "1";
  });
  const [productNotifs, setProductNotifs] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const v = localStorage.getItem("notifs_product");
    return v === null ? true : v === "1";
  });

  // Payments
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [showNewCard, setShowNewCard] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpMonth, setCardExpMonth] = useState("");
  const [cardExpYear, setCardExpYear] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardError, setCardError] = useState("");

  // Init
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

  // Load payment methods
  useEffect(() => {
    const load = async () => {
      setIsLoadingCards(true);
      try {
        const list = await billingService.getPaymentMethods();
        if (!list || list.length === 0) {
          // Seed one demo card so the UI can be previewed
          const demo = await billingService.addPaymentMethod({
            brand: 'mastercard',
            last4: '6576',
            expMonth: 12,
            expYear: new Date().getFullYear() + 2,
          });
          setMethods(demo);
        } else {
          setMethods(list);
        }
      } finally {
        setIsLoadingCards(false);
      }
    };
    load();
  }, []);

  // Apply theme
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
    try {
      localStorage.setItem("theme", theme);
    } catch {}

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => {
      if (theme === "system") root.classList.toggle("dark", e.matches);
    };
    mq.addEventListener?.("change", listener);
    return () => mq.removeEventListener?.("change", listener);
  }, [theme]);

  // Persist notifications
  useEffect(() => {
    try {
      localStorage.setItem("notifs_email", emailNotifs ? "1" : "0");
      localStorage.setItem("notifs_product", productNotifs ? "1" : "0");
    } catch {}
  }, [emailNotifs, productNotifs]);

  // Helpers
  const getUserInitials = () => {
    if (!user) return "U";
    const a = user.nome?.charAt(0).toUpperCase() || "";
    const b = user.sobrenome?.charAt(0).toUpperCase() || "";
    return `${a}${b}` || "U";
  };

  // Submit handlers
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
      setTimeout(() => setProfileSuccess(false), 2500);
    } catch (err: any) {
      setProfileError(err?.message || "Erro ao atualizar perfil");
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
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!strong.test(novaSenha)) {
      setPasswordError("A senha precisa de maiúscula, minúscula, número e especial");
      return;
    }

    try {
      await updatePassword({ senhaAtual, novaSenha });
      setPasswordSuccess(true);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setTimeout(() => setPasswordSuccess(false), 2500);
    } catch (err: any) {
      setPasswordError(err?.message || "Erro ao atualizar senha");
    }
  };

  // Tabs config
  const tabs = useMemo(
    () => [
      { id: "profile", name: "Perfil", icon: User },
      { id: "password", name: "Senha", icon: Lock },
      { id: "appearance", name: "Aparência", icon: Palette },
      { id: "notifications", name: "Notificações", icon: Bell },
      { id: "payments", name: "Pagamentos", icon: CreditCard },
    ],
    []
  );

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">Configurações</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie suas informações, segurança e aparência</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((t) => {
                const Icon = t.icon as any;
                const active = activeTab === (t.id as any);
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                      active
                        ? "bg-gray-900 dark:bg-slate-800 text-white shadow"
                        : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-900"
                    }`}
                  >
                    <Icon className="w-5 h-5" /> {t.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === "profile" && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Editar Perfil</h2>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6 pb-6 border-b border-gray-200 dark:border-slate-800">
                    <div className="flex-shrink-0">
                      {icone ? (
                        <img
                          src={icone}
                          alt="Preview"
                          className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-300 dark:border-slate-700 shadow"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl border-2 border-gray-300 dark:border-slate-700 shadow">
                          {getUserInitials()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Foto de Perfil</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cole a URL de uma imagem no campo abaixo</p>
                    </div>
                  </div>

                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Nome *</label>
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
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Sobrenome *</label>
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
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Conte um pouco sobre você..."
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 shadow-sm resize-none"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{bio.length}/500 caracteres</p>
                  </div>

                  {/* URL da Foto */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">URL da Foto de Perfil</label>
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4 text-gray-500" />
                      <input
                        type="url"
                        value={icone}
                        onChange={(e) => setIcone(e.target.value)}
                        placeholder="https://exemplo.com/sua-foto.jpg"
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Messages */}
                  {profileSuccess && (
                    <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-green-700 dark:text-green-300 font-medium">Perfil atualizado com sucesso!</span>
                    </div>
                  )}
                  {profileError && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <span className="text-red-700 dark:text-red-300 font-medium">{profileError}</span>
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
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Segurança</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  {/* Senha atual */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Senha atual *</label>
                    <input
                      type="password"
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                      placeholder="Sua senha atual"
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 shadow-sm"
                      required
                    />
                  </div>

                  {/* Nova senha */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Nova senha *</label>
                    <input
                      type="password"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder="Digite a nova senha"
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-600 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 shadow-sm"
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Mínimo 8 caracteres, com maiúscula, minúscula, número e especial</p>
                  </div>

                  {/* Confirmar */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Confirmar nova senha *</label>
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
                      <span className="text-green-700 dark:text-green-300 font-medium">Senha atualizada com sucesso!</span>
                    </div>
                  )}
                  {passwordError && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <span className="text-red-700 dark:text-red-300 font-medium">{passwordError}</span>
                    </div>
                  )}

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

            {activeTab === "appearance" && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Aparência</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Tema</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setTheme("light")}
                        className={`flex items-center gap-2 p-4 rounded-xl border transition ${
                          theme === "light"
                            ? "border-gray-900 dark:border-slate-600 ring-2 ring-gray-300 dark:ring-slate-600"
                            : "border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                        }`}
                        aria-pressed={theme === "light"}
                      >
                        <Sun className="w-4 h-4" /> Claro
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme("dark")}
                        className={`flex items-center gap-2 p-4 rounded-xl border transition ${
                          theme === "dark"
                            ? "border-gray-900 dark:border-slate-600 ring-2 ring-gray-300 dark:ring-slate-600"
                            : "border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                        }`}
                        aria-pressed={theme === "dark"}
                      >
                        <Moon className="w-4 h-4" /> Escuro
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme("system")}
                        className={`flex items-center gap-2 p-4 rounded-xl border transition ${
                          theme === "system"
                            ? "border-gray-900 dark:border-slate-600 ring-2 ring-gray-300 dark:ring-slate-600"
                            : "border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                        }`}
                        aria-pressed={theme === "system"}
                      >
                        <Monitor className="w-4 h-4" /> Sistema
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">O tema é salvo no seu dispositivo.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "payments" && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-4 md:p-6">
                <PaymentWallet
                  title="Minha Carteira"
                  userName={`${user?.nome ?? ''} ${user?.sobrenome ?? ''}`}
                  items={methods as any}
                  isLoading={isLoadingCards}
                  onAddNew={() => { setShowNewCard(true); setCardError(''); }}
                  onSetDefault={async (id) => { const list = await billingService.setDefaultPaymentMethod(id); setMethods(list); }}
                  onDelete={async (id) => { if (confirm('Remover este cartão?')) { const list = await billingService.deletePaymentMethod(id); setMethods(list); } }}
                  onEdit={(id) => { /* futuro: abrir modal de edição */ }}
                />

                {/* Add card modal */}
                {showNewCard && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
                      <div className="p-5 border-b border-gray-200 dark:border-slate-800">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Adicionar cartão</h3>
                      </div>
                      <div className="p-5 space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Nome no cartão</label>
                          <input value={cardName} onChange={(e)=>setCardName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100" placeholder="Como aparece no cartão" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Número do cartão</label>
                          <input value={cardNumber} onChange={(e)=>setCardNumber(e.target.value.replace(/[^\d ]/g,''))} inputMode="numeric" placeholder="4242 4242 4242 4242" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100" />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Mês</label>
                            <input value={cardExpMonth} onChange={(e)=>setCardExpMonth(e.target.value.replace(/[^\d]/g,'').slice(0,2))} placeholder="MM" className="w-full px-3 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Ano</label>
                            <input value={cardExpYear} onChange={(e)=>setCardExpYear(e.target.value.replace(/[^\d]/g,'').slice(0,4))} placeholder="AAAA" className="w-full px-3 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">CVC</label>
                            <input value={cardCvc} onChange={(e)=>setCardCvc(e.target.value.replace(/[^\d]/g,'').slice(0,4))} placeholder="CVC" className="w-full px-3 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100" />
                          </div>
                        </div>
                        {cardError && (
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
                            <AlertCircle className="w-4 h-4" /> {cardError}
                          </div>
                        )}
                      </div>
                      <div className="p-5 pt-0 flex gap-3">
                        <button onClick={()=>{setShowNewCard(false); setCardError("");}} className="flex-1 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300">Cancelar</button>
                        <button
                          onClick={async ()=>{
                            // simple validations
                            const num = cardNumber.replace(/\s+/g,'');
                            const luhn = (s:string)=>{let sum=0; let dbl=false; for(let i=s.length-1;i>=0;i--){let d=+s[i]; if(dbl){d*=2; if(d>9)d-=9;} sum+=d; dbl=!dbl;} return sum%10===0}
                            if(!cardName.trim()) return setCardError('Informe o nome no cartão');
                            if(num.length<13 || !luhn(num)) return setCardError('Número do cartão inválido');
                            const m = +cardExpMonth; const y = +cardExpYear; const now=new Date(); const year = y<100?2000+y:y; const valid = m>=1&&m<=12&&year>=now.getFullYear();
                            if(!valid) return setCardError('Validade inválida');
                            if(cardCvc.length<3) return setCardError('CVC inválido');
                            setCardError('');
                            const brand = num.startsWith('4')?'visa': num.startsWith('5')?'mastercard': num.startsWith('3')?'amex':'card';
                            const updated = await billingService.addPaymentMethod({
                              brand,
                              last4: num.slice(-4),
                              expMonth: parseInt(cardExpMonth||'0'),
                              expYear: parseInt(cardExpYear||'0'),
                            });
                            setMethods(updated);
                            setShowNewCard(false);
                            setCardName(''); setCardNumber(''); setCardExpMonth(''); setCardExpYear(''); setCardCvc('');
                          }}
                          className="flex-1 px-4 py-3 rounded-xl bg-gray-900 dark:bg-slate-700 text-white hover:bg-gray-800 dark:hover:bg-slate-600"
                        >Adicionar</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Notificações</h2>
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">Atualizações por e-mail</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receber alertas importantes e mudanças de status</p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={emailNotifs}
                        onChange={(e) => setEmailNotifs(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-gray-900 dark:peer-checked:bg-slate-600 relative transition">
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition ${emailNotifs ? 'translate-x-5' : ''}`}></div>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">Novidades do produto</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Dicas, melhorias e lançamentos ocasionais</p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={productNotifs}
                        onChange={(e) => setProductNotifs(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-gray-900 dark:peer-checked:bg-slate-600 relative transition">
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition ${productNotifs ? 'translate-x-5' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
