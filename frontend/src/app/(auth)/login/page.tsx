"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle,
  TrendingUp,
  Zap,
  AlertCircle,
  Folder,
  Users,
  Activity,
  Sparkles,
  ArrowRight,
  Star,
  Code2,
  Rocket,
  Eye,
  EyeOff
} from "lucide-react"
import { useAuthStore } from "@/core/store/authStore"

export default function LoginPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  })

  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const login = useAuthStore((s) => s.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login({ email: formData.email, senha: formData.senha, rememberMe })

      if (rememberMe) {
        localStorage.setItem("remember_me_email", formData.email)
      } else {
        localStorage.removeItem("remember_me_email")
      }

      await new Promise(resolve => setTimeout(resolve, 100))
      window.location.href = "/workspace"
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const benefits = [
    {
      icon: Zap,
      title: "28+ templates prontos",
      description: "Do Kanban ao Budget. Zero configuração, total produtividade.",
    },
    {
      icon: Users,
      title: "Comunidade ativa",
      description: "Discord, GitHub público, roadmap com votação. Você molda o produto.",
    },
    {
      icon: Sparkles,
      title: "100% grátis na beta",
      description: "Early adopters nunca pagam. Acesso vitalício garantido.",
    },
  ]

  return (
    <div className="min-h-screen flex bg-arc-primary relative overflow-hidden">
      {/* Elementos decorativos globais */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-arc rounded-full opacity-[0.02] blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-arc rounded-full opacity-[0.02] blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Lado Esquerdo - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 overflow-y-auto relative z-10">
        <div className="w-full max-w-md">
          {/* Logo e voltar */}
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <Image
                src="/icon/arclogo.svg"
                alt="Arc"
                width={32}
                height={32}
                priority
                className="group-hover:opacity-80 transition-opacity"
              />
              <span className="text-xl font-bold text-arc group-hover:opacity-80 transition-opacity">arc.</span>
            </Link>

            {/* Badge de comunidade */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-arc">
              <div className="w-1.5 h-1.5 rounded-full bg-arc animate-pulse" />
              <span className="text-xs font-semibold text-arc-muted">2.4k online</span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-arc mb-3 tracking-tight">
              bem-vindo de volta.
            </h1>
            <p className="text-base text-arc-muted">
              Continue de onde parou. Sua comunidade te espera.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-[#EF4444]/10 border-2 border-[#EF4444]/20 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-arc">Erro ao fazer login</p>
                <p className="text-sm text-arc-muted mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-arc mb-2">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3.5 border-2 border-arc rounded-xl bg-arc-primary text-arc placeholder:text-arc-muted focus:outline-none focus:ring-2 focus:ring-arc focus:border-arc transition-all min-h-[52px] font-medium hover:border-arc/80"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-arc">Senha</label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-arc-muted hover:text-arc transition-colors font-medium"
                >
                  Esqueceu?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-3.5 pr-12 border-2 border-arc rounded-xl bg-arc-primary text-arc placeholder:text-arc-muted focus:outline-none focus:ring-2 focus:ring-arc focus:border-arc transition-all min-h-[52px] font-medium hover:border-arc/80"
                  placeholder="••••••••"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-arc-muted hover:text-arc transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 border-2 border-arc rounded text-arc focus:ring-2 focus:ring-arc cursor-pointer transition-all"
              />
              <label
                htmlFor="remember"
                className="ml-2.5 text-sm text-arc-muted cursor-pointer select-none font-medium"
              >
                Lembrar de mim
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-arc text-arc-primary py-4 rounded-xl font-extrabold hover:opacity-90 transition-all shadow-2xl shadow-arc/30 disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] flex items-center justify-center text-base hover:scale-[1.02] active:scale-[0.98] group"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-arc-primary border-t-transparent rounded-full animate-spin"></div>
                  <span>Entrando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Entrar no Arc</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-arc/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-arc-primary text-arc-muted font-medium">ou continue com</span>
            </div>
          </div>

          {/* Social Login - Melhorado */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-3.5 border-2 border-arc rounded-xl font-semibold text-arc hover:bg-arc-secondary transition-all text-sm min-h-[52px] hover:scale-[1.02] active:scale-[0.98] group">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="hidden sm:inline">Google</span>
            </button>

            <button className="flex items-center justify-center gap-2 px-4 py-3.5 border-2 border-arc rounded-xl font-semibold text-arc hover:bg-arc-secondary transition-all text-sm min-h-[52px] hover:scale-[1.02] active:scale-[0.98] group">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="hidden sm:inline">GitHub</span>
            </button>
          </div>

          {/* Cadastro */}
          <div className="mt-8 text-center">
            <p className="text-sm text-arc-muted">
              Não tem uma conta?{" "}
              <Link href="/register" className="text-arc font-bold hover:text-arc transition-colors inline-flex items-center gap-1 group">
                Cadastre-se grátis
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </p>
          </div>

          {/* Trust badges */}
          <div className="mt-8 pt-6 border-t border-arc/30">
            <div className="flex items-center justify-center gap-4 text-xs text-arc-muted">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-arc" />
                <span>100% Grátis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-arc" />
                <span>Open Source</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-arc" />
                <span>Sem Cartão</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Direito - Benefícios TURBINADO */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-arc-secondary to-arc-primary border-l-2 border-arc items-center justify-center p-12 relative overflow-hidden">
        {/* Pattern de fundo */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50" />

        {/* Blobs animados */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-arc rounded-full opacity-[0.03] blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-arc rounded-full opacity-[0.03] blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="max-w-lg relative z-10">
          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-arc mb-6">
              <Sparkles className="w-4 h-4 text-arc" />
              <span className="text-sm font-bold text-arc">construído COM a comunidade</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-extrabold text-arc mb-4 tracking-tight leading-tight">
              organize. foque.
              <br />
              <span className="text-arc-muted">entregue.</span>
            </h2>
            <p className="text-base text-arc-muted leading-relaxed">
              Junte-se a <span className="font-bold text-arc">2.4k+ pessoas</span> construindo o workspace ideal. Juntos.
            </p>
          </div>

          {/* Benefits Cards - Minimal */}
          <div className="space-y-4 mb-10">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div
                  key={index}
                  className="group p-5 rounded-xl border border-arc bg-arc-primary hover:bg-arc-secondary transition-all"
                >
                  <div className="flex gap-3 items-start">
                    <Icon className="w-5 h-5 text-arc flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <div className="flex-1">
                      <h3 className="font-bold text-arc mb-1 text-base">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-arc-muted leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Stats Visuais */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 rounded-xl bg-arc-primary border border-arc hover:border-arc transition-colors group">
              <div className="text-2xl font-extrabold text-arc mb-1 group-hover:scale-110 transition-transform">2.4k</div>
              <div className="text-[10px] text-arc-muted font-medium uppercase tracking-wider">Usuários</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-arc-primary border border-arc hover:border-arc transition-colors group">
              <div className="text-2xl font-extrabold text-arc mb-1 group-hover:scale-110 transition-transform">28+</div>
              <div className="text-[10px] text-arc-muted font-medium uppercase tracking-wider">Templates</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-arc-primary border border-arc hover:border-arc transition-colors group">
              <div className="text-2xl font-extrabold text-arc mb-1 group-hover:scale-110 transition-transform">100%</div>
              <div className="text-[10px] text-arc-muted font-medium uppercase tracking-wider">Grátis</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-arc-primary border border-arc hover:border-arc transition-colors group">
              <div className="flex items-center justify-center gap-0.5 mb-1">
                <Star className="w-3 h-3 fill-[#EF4444] text-[#EF4444]" />
                <span className="text-2xl font-extrabold text-arc group-hover:scale-110 transition-transform">4.8</span>
              </div>
              <div className="text-[10px] text-arc-muted font-medium uppercase tracking-wider">Rating</div>
            </div>
          </div>

          {/* Testimonial rápido */}
          <div className="p-6 rounded-xl bg-arc-primary border border-arc relative overflow-hidden">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full border-2 border-arc-primary bg-arc flex items-center justify-center text-xs font-bold text-arc-primary">
                  L
                </div>
                <div className="w-7 h-7 rounded-full border-2 border-arc-primary bg-arc flex items-center justify-center text-xs font-bold text-arc-primary">
                  M
                </div>
                <div className="w-7 h-7 rounded-full border-2 border-arc-primary bg-arc flex items-center justify-center text-xs font-bold text-arc-primary">
                  P
                </div>
              </div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-arc text-arc" />
                ))}
              </div>
            </div>
            <p className="text-sm text-arc-muted italic leading-relaxed">
              "A comunidade é incrível. Sugeriu uma feature na sexta, entrou no roadmap na segunda.
              <span className="font-bold text-arc"> Isso é ouvir usuário de verdade.</span>"
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
