"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, AlertCircle, ArrowRight, Zap, Timer, Sparkles, Eye, EyeOff } from "lucide-react"
import authService from "@/core/services/auth.service"
import workspaceService from "@/core/services/workspace.service"
import workspaceInviteService from "@/core/services/workspace-invite.service"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams?.get("invite")

  const [isLoading, setIsLoading] = useState(false)
  const [startTime] = useState(Date.now())
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    workspaceName: "",
  })

  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    setIsLoading(true)

    // Validações simples
    if (!formData.nome || !formData.email || !formData.senha || !formData.workspaceName) {
      setLocalError("Preencha todos os campos")
      setIsLoading(false)
      return
    }

    if (formData.senha.length < 8) {
      setLocalError("Senha muito curta. Mínimo 8 caracteres.")
      setIsLoading(false)
      return
    }

    try {
      // 1. Registrar usuário
      const registerResponse = await authService.register({
        nome: formData.nome,
        sobrenome: "",
        email: formData.email,
        senha: formData.senha,
        bio: "",
        icone: "",
        profissao: "",
        comoConheceu: ""
      })

      // 2. Salvar autenticação
      await authService.saveAuthData(registerResponse, true)

      // 3. Se tiver convite, aceitar. Se não, criar workspace
      if (inviteToken) {
        const inviteResponse = await workspaceInviteService.acceptInvite({
          token: inviteToken
        })

        await new Promise(resolve => setTimeout(resolve, 300))

        if (inviteResponse.success && inviteResponse.workspaceId) {
          router.push(`/workspace?id=${inviteResponse.workspaceId}`)
        } else {
          router.push(`/workspace`)
        }
      } else {
        await workspaceService.createWorkspace({
          nome: formData.workspaceName
        })

        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000)
        console.log(`Registro completo em ${elapsedSeconds}s`)

        router.push("/workspace")
      }
    } catch (error: any) {
      console.error("Error registering:", error)
      setLocalError(error.message || "Algo deu errado. Tenta de novo.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-arc-primary flex items-center justify-center p-4">
      {/* Background decorativo sutil */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-arc rounded-full opacity-[0.02] blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-arc rounded-full opacity-[0.02] blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-6">
            <Image
              src="/icon/arclogo.svg"
              alt="Arc"
              width={40}
              height={40}
              priority
              className="group-hover:opacity-80 transition-opacity"
            />
            <span className="text-2xl font-extrabold text-arc group-hover:opacity-80 transition-opacity">arc.</span>
          </Link>
        </div>

        {/* Header agressivo */}
        <div className="text-center mb-10">
          {inviteToken ? (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-arc mb-6">
                <Sparkles className="w-4 h-4 text-arc" />
                <span className="text-sm font-bold text-arc">Você foi convidado</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-arc mb-4 tracking-tight">
                preenche isso aí.
                <br />
                <span className="text-arc-muted">aceita o convite.</span>
              </h1>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-arc mb-6">
                <Timer className="w-4 h-4 text-arc animate-pulse" />
                <span className="text-sm font-bold text-arc">promessa: 2 minutos</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-arc mb-4 tracking-tight">
                sem enrolação.
                <br />
                <span className="text-arc-muted">4 campos. pronto.</span>
              </h1>
              <p className="text-base sm:text-lg text-arc-muted max-w-lg mx-auto">
                Nome, email, senha, workspace.
                <br />
                <span className="font-bold text-arc">30 segundos e você já tá produzindo.</span>
              </p>
            </>
          )}
        </div>

        {/* Form Card */}
        <div className="bg-arc-primary border-2 border-arc rounded-2xl p-6 sm:p-8 mb-6">
          {/* Error */}
          {localError && (
            <div className="mb-6 bg-arc/5 border border-arc rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 text-arc flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-arc">Opa, erro aqui</p>
                <p className="text-sm text-arc-muted mt-0.5">{localError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome */}
            <div>
              <label className="block text-sm font-bold text-arc mb-2">
                Como você se chama?
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={50}
                className="w-full px-4 py-3.5 border-2 border-arc rounded-xl bg-arc-primary text-arc placeholder:text-arc-muted focus:outline-none focus:ring-2 focus:ring-arc transition-all font-medium"
                placeholder="João, Maria, Zé..."
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                disabled={isLoading}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-arc mb-2">
                Seu melhor email
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3.5 border-2 border-arc rounded-xl bg-arc-primary text-arc placeholder:text-arc-muted focus:outline-none focus:ring-2 focus:ring-arc transition-all font-medium"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
              />
              <p className="text-xs text-arc-muted mt-1.5">Zero spam. Nunca. Promessa.</p>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-bold text-arc mb-2">
                Cria uma senha (8+ caracteres)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  className="w-full px-4 py-3.5 pr-12 border-2 border-arc rounded-xl bg-arc-primary text-arc placeholder:text-arc-muted focus:outline-none focus:ring-2 focus:ring-arc transition-all font-medium"
                  placeholder="••••••••"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  disabled={isLoading}
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

            {/* Workspace name - só se não tiver convite */}
            {!inviteToken && (
              <div>
                <label className="block text-sm font-bold text-arc mb-2">
                  Nome do seu workspace
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  className="w-full px-4 py-3.5 border-2 border-arc rounded-xl bg-arc-primary text-arc placeholder:text-arc-muted focus:outline-none focus:ring-2 focus:ring-arc transition-all font-medium"
                  placeholder="Meus Projetos, Empresa X, Freelances..."
                  value={formData.workspaceName}
                  onChange={(e) => setFormData({ ...formData, workspaceName: e.target.value })}
                  disabled={isLoading}
                />
                <p className="text-xs text-arc-muted mt-1.5">Cria mais depois se quiser. Fácil.</p>
              </div>
            )}

            {/* CTA Button */}
            <button
              type="submit"
              disabled={isLoading || !formData.nome || !formData.email || !formData.senha || (!inviteToken && !formData.workspaceName)}
              className="w-full bg-arc text-arc-primary py-4 rounded-xl font-extrabold hover:opacity-90 transition-all shadow-2xl shadow-arc/30 disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] flex items-center justify-center text-base hover:scale-[1.02] active:scale-[0.98] group"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-arc-primary border-t-transparent rounded-full animate-spin"></div>
                  <span>{inviteToken ? "Criando conta..." : "Criando workspace..."}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span>{inviteToken ? "Aceitar Convite" : "Criar Conta (leva 30s)"}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>

            {/* Checklist rápido - só se NÃO tiver convite */}
            {!inviteToken && (
              <div className="pt-4 border-t border-arc/30">
                <p className="text-xs font-bold text-arc mb-3">O que acontece quando você clicar:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-arc-muted">
                    <Check className="w-3.5 h-3.5 text-arc flex-shrink-0" />
                    <span>Conta criada em 2 segundos</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-arc-muted">
                    <Check className="w-3.5 h-3.5 text-arc flex-shrink-0" />
                    <span>Workspace com 28+ templates prontos</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-arc-muted">
                    <Check className="w-3.5 h-3.5 text-arc flex-shrink-0" />
                    <span>Zero configuração. Já começa produzindo.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-arc-muted">
                    <Check className="w-3.5 h-3.5 text-arc flex-shrink-0" />
                    <span>100% grátis. Sem cartão. Sem pegadinha.</span>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="text-center space-y-4">
          <p className="text-sm text-arc-muted">
            Já tem conta?{" "}
            <Link href="/login" className="text-arc font-bold hover:opacity-80 transition-opacity inline-flex items-center gap-1 group">
              Entra aqui
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </p>

          <p className="text-xs text-arc-muted max-w-md mx-auto">
            Ao criar conta, você concorda com nossos{" "}
            <Link href="/terms" className="text-arc font-semibold hover:opacity-80">Termos</Link>
            {" "}e{" "}
            <Link href="/privacy" className="text-arc font-semibold hover:opacity-80">Privacidade</Link>.
            Mas relaxa, não tem pegadinha.
          </p>

          {/* Trust badges minimalistas */}
          <div className="flex items-center justify-center gap-6 pt-4">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-arc" />
              <span className="text-xs text-arc-muted">100% Grátis</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-arc" />
              <span className="text-xs text-arc-muted">Open Source</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-arc" />
              <span className="text-xs text-arc-muted">Sem Cartão</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
