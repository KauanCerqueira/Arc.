"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Shield, AlertCircle, ArrowRight, ArrowLeft, Users } from "lucide-react"

type Step = "plan" | "account" | "workspace"
type PlanType = "FREE" | "BASIC" | "PRO" | "ENTERPRISE"

export default function RegisterPage() {
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState<Step>("plan")
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("FREE")
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly")
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    senha: "",
    confirmPassword: "",
    profissao: "",
    comoConheceu: "",
    workspaceName: "",
    workspaceType: "personal" as "personal" | "team",
  })

  const [localError, setLocalError] = useState<string | null>(null)

  const handlePlanSelect = (plan: PlanType) => {
    setSelectedPlan(plan)
  }

  const handleNextStep = () => {
    if (currentStep === "plan") {
      setCurrentStep("account")
    } else if (currentStep === "account") {
      // Validate before moving to workspace
      if (!formData.nome || !formData.sobrenome || !formData.email || !formData.senha || !formData.confirmPassword) {
        setLocalError("Preencha todos os campos obrigatórios")
        return
      }
      if (formData.senha !== formData.confirmPassword) {
        setLocalError("As senhas não conferem")
        return
      }
      if (formData.senha.length < 8) {
        setLocalError("A senha deve ter pelo menos 8 caracteres")
        return
      }
      setLocalError(null)
      setCurrentStep("workspace")
    }
  }

  const handlePrevStep = () => {
    setLocalError(null)
    if (currentStep === "workspace") {
      setCurrentStep("account")
    } else if (currentStep === "account") {
      setCurrentStep("plan")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log("[v0] Registration data:", { ...formData, selectedPlan, billingInterval })
      router.push("/workspace")
    }, 2000)
  }

  const plansList = [
    {
      type: "FREE" as PlanType,
      name: "Free",
      price: 0,
      description: "Perfeito para começar",
      popular: false,
      features: ["1 workspace", "5 projetos", "1 membro", "1GB armazenamento"],
    },
    {
      type: "BASIC" as PlanType,
      name: "Basic",
      price: billingInterval === "monthly" ? 29 : 290,
      description: "Para indivíduos organizados",
      popular: false,
      features: ["3 workspaces", "50 projetos", "3 membros", "10GB armazenamento"],
    },
    {
      type: "PRO" as PlanType,
      name: "Pro",
      price: billingInterval === "monthly" ? 79 : 790,
      description: "Para profissionais produtivos",
      popular: true,
      features: ["10 workspaces", "Projetos ilimitados", "10 membros", "100GB armazenamento"],
    },
    {
      type: "ENTERPRISE" as PlanType,
      name: "Enterprise",
      price: billingInterval === "monthly" ? 199 : 1990,
      description: "Para equipes e empresas",
      popular: false,
      features: ["Workspaces ilimitados", "Projetos ilimitados", "Membros ilimitados", "1TB armazenamento"],
    },
  ]

  return (
    <div className="min-h-screen bg-arc-primary text-arc">
      {/* Header */}
      <header className="border-b border-arc bg-arc-primary py-4 px-6">
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

        <div className="text-sm text-arc-muted">
          Já tem conta?{" "}
          <Link href="/login" className="text-arc font-semibold hover:text-arc transition-colors">
            Entrar
          </Link>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-center gap-3 mb-12">
          <div
            className={`flex items-center gap-2 transition-all ${currentStep === "plan" ? "text-arc" : (currentStep === "account" || currentStep === "workspace") ? "text-arc-muted" : "text-arc-muted"}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${currentStep === "plan" ? "bg-arc text-arc-primary scale-110" : (currentStep === "account" || currentStep === "workspace") ? "bg-arc text-arc-primary" : "bg-arc-secondary text-arc-muted"}`}
            >
              {currentStep === "account" || currentStep === "workspace" ? <Check className="w-5 h-5" /> : "1"}
            </div>
            <span className="font-semibold hidden sm:block">Plano</span>
          </div>

          <div
            className={`w-12 sm:w-20 h-0.5 transition-all ${currentStep === "account" || currentStep === "workspace" ? "bg-arc" : "bg-arc-secondary"}`}
          ></div>

          <div
            className={`flex items-center gap-2 transition-all ${currentStep === "account" ? "text-arc" : currentStep === "workspace" ? "text-arc-muted" : "text-arc-muted"}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${currentStep === "account" ? "bg-arc text-arc-primary scale-110" : currentStep === "workspace" ? "bg-arc text-arc-primary" : "bg-arc-secondary text-arc-muted"}`}
            >
              {currentStep === "workspace" ? <Check className="w-5 h-5" /> : "2"}
            </div>
            <span className="font-semibold hidden sm:block">Conta</span>
          </div>

          <div
            className={`w-12 sm:w-20 h-0.5 transition-all ${currentStep === "workspace" ? "bg-arc" : "bg-arc-secondary"}`}
          ></div>

          <div
            className={`flex items-center gap-2 transition-all ${currentStep === "workspace" ? "text-arc" : "text-arc-muted"}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${currentStep === "workspace" ? "bg-arc text-arc-primary scale-110" : "bg-arc-secondary text-arc-muted"}`}
            >
              3
            </div>
            <span className="font-semibold hidden sm:block">Workspace</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pb-16">
        {/* Step 1: Plan Selection */}
        {currentStep === "plan" && (
          <div className="space-y-12">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-arc mb-6">
                Escolha seu plano
              </h1>
              <p className="text-xl sm:text-2xl text-arc-muted font-light">Comece grátis e faça upgrade quando quiser</p>
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center">
              <div className="inline-flex bg-arc-secondary rounded-xl p-1.5 border border-arc">
                <button
                  onClick={() => setBillingInterval("monthly")}
                  className={`px-6 sm:px-8 py-3 rounded-lg font-semibold text-sm transition-all ${
                    billingInterval === "monthly" ? "bg-arc text-arc-primary" : "text-arc-muted hover:text-arc"
                  }`}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setBillingInterval("yearly")}
                  className={`px-6 sm:px-8 py-3 rounded-lg font-semibold text-sm transition-all ${
                    billingInterval === "yearly" ? "bg-arc text-arc-primary" : "text-arc-muted hover:text-arc"
                  }`}
                >
                  Anual <span className="text-arc ml-1.5">-17%</span>
                </button>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {plansList.map((plan) => {
                const isSelected = selectedPlan === plan.type

                return (
                  <button
                    key={plan.type}
                    onClick={() => handlePlanSelect(plan.type)}
                    className={`relative p-6 rounded-2xl border-2 transition-all text-left hover:scale-[1.02] ${
                      isSelected ? "border-arc bg-arc-secondary shadow-lg" : "border-arc hover:border-arc"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-arc text-arc-primary text-xs font-bold px-4 py-1.5 rounded-full tracking-wide">
                          POPULAR
                        </span>
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-arc mb-2 tracking-tight">{plan.name}</h3>
                      <p className="text-sm text-arc-muted">{plan.description}</p>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-arc tracking-tight">R$ {plan.price}</span>
                        {plan.price > 0 && (
                          <span className="text-arc-muted text-sm">
                            /{billingInterval === "monthly" ? "mês" : "ano"}
                          </span>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-arc flex items-start gap-2">
                          <Check className="w-4 h-4 text-arc flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isSelected && (
                      <div className="flex items-center justify-center gap-2 text-arc font-semibold pt-4 border-t border-arc">
                        <Check className="w-5 h-5 text-arc" />
                        <span>Selecionado</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={handleNextStep}
                className="px-10 py-5 bg-arc text-arc-primary rounded-xl font-bold text-lg hover:bg-arc/90 transition-all flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Continuar
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Account Creation */}
        {currentStep === "account" && (
          <div className="max-w-2xl mx-auto space-y-10">
            <div className="text-center">
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-arc mb-6">Crie sua conta</h1>
              <p className="text-xl text-arc-muted font-light">Preencha seus dados para começar</p>
            </div>

            {/* Error Alert */}
            {localError && (
              <div className="bg-arc/10 border-2 border-arc rounded-xl p-5 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 text-arc flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-arc">Erro ao criar conta</p>
                  <p className="text-sm text-arc-muted mt-1">{localError}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-arc mb-2 tracking-tight">Nome *</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={50}
                    className="w-full px-5 py-4 border-2 border-arc rounded-xl bg-arc-primary text-arc placeholder:text-arc-muted focus:outline-none focus:ring-2 focus:ring-arc focus:border-arc transition-all font-medium"
                    placeholder="João"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-arc mb-2 tracking-tight">Sobrenome *</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={50}
                    className="w-full px-5 py-4 border-2 border-arc rounded-xl bg-arc-primary text-arc placeholder:text-arc-muted focus:outline-none focus:ring-2 focus:ring-arc focus:border-arc transition-all font-medium"
                    placeholder="Silva"
                    value={formData.sobrenome}
                    onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-arc mb-2 tracking-tight">Email *</label>
                <input
                  type="email"
                  required
                  className="w-full px-5 py-4 border-2 border-arc rounded-xl bg-arc-primary text-arc placeholder:text-arc-muted focus:outline-none focus:ring-2 focus:ring-arc focus:border-arc transition-all font-medium"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-arc mb-2 tracking-tight">Profissão</label>
                  <input
                    type="text"
                    maxLength={100}
                    className="w-full px-5 py-4 border-2 border-arc rounded-xl bg-arc-primary text-arc placeholder:text-arc-muted focus:outline-none focus:ring-2 focus:ring-arc focus:border-arc transition-all font-medium"
                    placeholder="Desenvolvedor"
                    value={formData.profissao}
                    onChange={(e) => setFormData({ ...formData, profissao: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-arc mb-2 tracking-tight">Como nos conheceu?</label>
                  <select
                    className="w-full px-5 py-4 border-2 border-arc rounded-xl bg-arc-primary text-arc focus:outline-none focus:ring-2 focus:ring-arc focus:border-arc transition-all font-medium"
                    value={formData.comoConheceu}
                    onChange={(e) => setFormData({ ...formData, comoConheceu: e.target.value })}
                  >
                    <option value="">Selecione...</option>
                    <option value="Google">Google</option>
                    <option value="Twitter">Twitter</option>
                    <option value="YouTube">YouTube</option>
                    <option value="GitHub">GitHub</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Amigo">Indicação de amigo</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-arc mb-2 tracking-tight">Senha *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    className="w-full px-5 py-4 border-2 border-arc rounded-xl bg-arc-primary text-arc placeholder:text-arc-muted focus:outline-none focus:ring-2 focus:ring-arc focus:border-arc transition-all font-medium"
                    placeholder="Min. 8 caracteres"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-arc mb-2 tracking-tight">Confirmar senha *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    className="w-full px-5 py-4 border-2 border-arc rounded-xl bg-arc-primary text-arc placeholder:text-arc-muted focus:outline-none focus:ring-2 focus:ring-arc focus:border-arc transition-all font-medium"
                    placeholder="Repita a senha"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handlePrevStep}
                className="px-8 py-4 bg-arc-secondary text-arc rounded-xl font-bold hover:bg-arc/10 transition-all flex items-center justify-center gap-2 border-2 border-arc"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </button>
              <button
                onClick={handleNextStep}
                disabled={
                  !formData.nome ||
                  !formData.sobrenome ||
                  !formData.email ||
                  !formData.senha ||
                  !formData.confirmPassword
                }
                className="flex-1 px-8 py-4 bg-arc text-arc-primary rounded-xl font-bold hover:bg-arc/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                Continuar
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Workspace Setup */}
        {currentStep === "workspace" && (
          <div className="max-w-2xl mx-auto space-y-10">
            <div className="text-center">
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-arc mb-6">Configure seu workspace</h1>
              <p className="text-xl text-arc-muted font-light">Último passo antes de começar!</p>
            </div>

            {/* Error Alert */}
            {localError && (
              <div className="bg-arc/10 border-2 border-arc rounded-xl p-5 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 text-arc flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-arc">Erro ao criar conta</p>
                  <p className="text-sm text-arc-muted mt-1">{localError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-sm font-bold text-arc mb-2 tracking-tight">Nome do Workspace *</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  className="w-full px-5 py-4 border-2 border-arc rounded-xl bg-arc-primary text-arc placeholder:text-arc-muted focus:outline-none focus:ring-2 focus:ring-arc focus:border-arc transition-all font-medium"
                  placeholder="Meus Projetos, Empresa X"
                  value={formData.workspaceName}
                  onChange={(e) => setFormData({ ...formData, workspaceName: e.target.value })}
                />
                <p className="text-sm text-arc/50 mt-2">Você pode criar mais workspaces depois</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-arc mb-4 tracking-tight">Tipo de Workspace *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, workspaceType: "personal" })}
                    className={`p-6 rounded-2xl border-2 transition-all text-left hover:scale-[1.02] ${
                      formData.workspaceType === "personal"
                        ? "border-arc bg-arc-secondary shadow-lg"
                        : "border-arc hover:border-arc"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-arc rounded-xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-arc-primary" />
                      </div>
                      <h3 className="font-bold text-arc text-lg tracking-tight">Pessoal</h3>
                    </div>
                    <p className="text-sm text-arc-muted">Para uso individual e projetos pessoais</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, workspaceType: "team" })}
                    className={`p-6 rounded-2xl border-2 transition-all text-left hover:scale-[1.02] ${
                      formData.workspaceType === "team"
                        ? "border-arc bg-arc-secondary shadow-lg"
                        : "border-arc hover:border-arc"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-arc rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-arc-primary" />
                      </div>
                      <h3 className="font-bold text-arc text-lg tracking-tight">Time</h3>
                    </div>
                    <p className="text-sm text-arc-muted">Para colaboração em equipe</p>
                  </button>
                </div>
              </div>

              {/* Selected Plan Summary */}
              <div className="bg-arc-secondary rounded-2xl p-6 border-2 border-arc">
                <h3 className="font-bold text-arc mb-4 text-lg tracking-tight">Resumo do Plano</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-arc-muted font-medium">Plano selecionado:</span>
                    <span className="font-bold text-arc">{plansList.find((p) => p.type === selectedPlan)?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-arc-muted font-medium">Cobrança:</span>
                    <span className="font-bold text-arc capitalize">
                      {billingInterval === "monthly" ? "Mensal" : "Anual"}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-arc flex items-center justify-between">
                    <span className="text-arc-muted font-medium">Valor:</span>
                    <span className="font-bold text-arc text-xl">
                      R$ {plansList.find((p) => p.type === selectedPlan)?.price || 0}
                      {selectedPlan !== "FREE" && (
                        <span className="text-base text-arc-muted">
                          /{billingInterval === "monthly" ? "mês" : "ano"}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-arc/50 text-center">
                Ao criar uma conta, você concorda com nossos{" "}
                <Link href="/terms" className="text-arc font-semibold hover:text-arc transition-colors">
                  Termos de Uso
                </Link>{" "}
                e{" "}
                <Link href="/privacy" className="text-arc font-semibold hover:text-arc transition-colors">
                  Política de Privacidade
                </Link>
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-8 py-4 bg-arc-secondary text-arc rounded-xl font-bold hover:bg-arc/10 transition-all flex items-center justify-center gap-2 border-2 border-arc"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.workspaceName}
                  className="flex-1 px-8 py-4 bg-arc text-arc-primary rounded-xl font-bold hover:bg-arc/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Criando conta...</span>
                    </>
                  ) : (
                    <>
                      <span>Criar Conta</span>
                      <Check className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}




