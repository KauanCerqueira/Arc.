"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, TrendingUp, Zap, AlertCircle, Folder, Users, Activity } from "lucide-react"
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
  const login = useAuthStore((s) => s.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Simular login - substituir com lógica real
      await login({ email: formData.email, senha: formData.senha, rememberMe })

      // Salvar email se remember me estiver marcado
      if (rememberMe) {
        localStorage.setItem("remember_me_email", formData.email)
      } else {
        localStorage.removeItem("remember_me_email")
      }

      // Pequeno delay para garantir que cookies sejam salvos antes do redirect
      await new Promise(resolve => setTimeout(resolve, 100))

      // Redirect to workspace on success (hard reload to ensure cookies are read by middleware)
      window.location.href = "/workspace"
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const benefits = [
    {
      icon: CheckCircle,
      title: "Projetos organizados",
      description: "Gerencie tudo em um só lugar com metodologias que você já conhece",
    },
    {
      icon: TrendingUp,
      title: "Análise inteligente",
      description: "Descubra padrões de produtividade e otimize seu tempo",
    },
    {
      icon: Zap,
      title: "28+ templates prontos",
      description: "Kanban, Budget, Study, Workout e muito mais. Zero configuração.",
    },
  ]

  return (
    <div className="min-h-screen flex bg-arc-primary">
      {/* Lado Esquerdo - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo e voltar */}
          <div className="mb-8">
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
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-arc mb-3 tracking-tight">bem-vindo de volta.</h1>
            <p className="text-base text-arc-muted">Entre na sua conta para continuar organizando seus projetos.</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-arc-secondary border-2 border-arc rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-arc flex-shrink-0 mt-0.5" />
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
                className="w-full px-4 py-3.5 border-2 border-arc rounded-lg bg-arc-primary text-arc placeholder:text-arc-muted focus:outline-none focus:ring-2 focus:ring-arc focus:border-arc transition-all min-h-[48px] font-medium"
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
                  Esqueceu a senha?
                </Link>
              </div>
              <input
                type="password"
                required
                className="w-full px-4 py-3.5 border-2 border-arc rounded-lg bg-arc-primary text-arc placeholder:text-arc-muted focus:outline-none focus:ring-2 focus:ring-arc focus:border-arc transition-all min-h-[48px] font-medium"
                placeholder="••••••••"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              />
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
              className="w-full bg-arc text-arc-primary py-3.5 rounded-lg font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] flex items-center justify-center text-base hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-arc-primary border-t-transparent rounded-full animate-spin"></div>
                  <span>Entrando...</span>
                </div>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-arc"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-arc-primary text-arc-muted font-medium">ou continue com</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-arc rounded-lg font-semibold text-arc-primary bg-arc hover:opacity-90 active:opacity-80 transition-all text-sm min-h-[48px] hover:scale-[1.01] active:scale-[0.99]">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              Continuar com Google
            </button>

            <button className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-arc rounded-lg font-semibold text-arc-primary bg-arc hover:opacity-90 active:opacity-80 transition-all text-sm min-h-[48px] hover:scale-[1.01] active:scale-[0.99]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continuar com GitHub
            </button>
          </div>

          {/* Cadastro */}
          <div className="mt-6 text-center">
            <p className="text-sm text-arc-muted">
              Não tem uma conta?{" "}
              <Link href="/register" className="text-arc font-bold hover:text-arc transition-colors">
                Cadastre-se grátis
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Lado Direito - Benefícios */}
      <div className="hidden lg:flex lg:w-1/2 bg-arc-secondary border-l-2 border-arc items-center justify-center p-12 relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-arc rounded-full opacity-[0.03] blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-arc rounded-full opacity-[0.02] blur-3xl" />

        <div className="max-w-lg relative z-10">
          {/* Header */}
          <div className="mb-10">
            <h2 className="text-4xl font-extrabold text-arc mb-4 tracking-tight leading-tight">
              organize seus projetos como nunca antes.
            </h2>
            <p className="text-base text-arc-muted leading-relaxed">
              Mais de 12 mil pessoas já estão usando o arc. para gerenciar seus projetos e aumentar a produtividade.
            </p>
          </div>

          {/* Benefits List */}
          <div className="space-y-6 mb-10">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="flex gap-4 group">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-arc rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-arc-primary" strokeWidth={2} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-arc mb-1.5 text-lg">{benefit.title}</h3>
                    <p className="text-sm text-arc-muted leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Screenshot Preview */}
          <div className="bg-arc-primary rounded-2xl border-2 border-arc p-6 shadow-2xl mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-arc"></div>
              <div className="w-3 h-3 rounded-full bg-arc-muted/30"></div>
              <div className="w-3 h-3 rounded-full bg-arc-muted/30"></div>
            </div>
            <div className="space-y-3">
              <div className="h-2 bg-arc-secondary rounded w-3/4"></div>
              <div className="h-2 bg-arc-secondary rounded w-1/2"></div>
              <div className="h-2 bg-arc-secondary rounded w-5/6"></div>
              <div className="grid grid-cols-3 gap-3 mt-5">
                <div className="h-16 bg-arc/10 rounded-lg border border-arc/20 flex items-center justify-center">
                  <Folder className="w-6 h-6 text-arc" />
                </div>
                <div className="h-16 bg-arc/10 rounded-lg border border-arc/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-arc" />
                </div>
                <div className="h-16 bg-arc/10 rounded-lg border border-arc/20 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-arc" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="p-4 rounded-xl border border-arc bg-arc-primary hover:border-arc transition-colors">
              <div className="text-3xl font-extrabold text-arc mb-1">12.5K</div>
              <div className="text-xs text-arc-muted font-medium">Usuários</div>
            </div>
            <div className="p-4 rounded-xl border border-arc bg-arc-primary hover:border-arc transition-colors">
              <div className="text-3xl font-extrabold text-arc mb-1">89K</div>
              <div className="text-xs text-arc-muted font-medium">Projetos</div>
            </div>
            <div className="p-4 rounded-xl border border-arc bg-arc-primary hover:border-arc transition-colors">
              <div className="text-3xl font-extrabold text-arc mb-1">4.8/5</div>
              <div className="text-xs text-arc-muted font-medium">Avaliação</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

