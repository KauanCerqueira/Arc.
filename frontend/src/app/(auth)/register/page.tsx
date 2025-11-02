"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Zap, Shield, TrendingUp, AlertCircle, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/core/store/authStore';
import { PlanType, PLANS } from '@/core/types/subscription.types';

type Step = 'plan' | 'account' | 'workspace';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error } = useAuthStore();

  const [currentStep, setCurrentStep] = useState<Step>('plan');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(PlanType.FREE);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    email: '',
    senha: '',
    confirmPassword: '',
    profissao: '',
    comoConheceu: '',
    workspaceName: '',
    workspaceType: 'personal' as 'personal' | 'team'
  });

  const [localError, setLocalError] = useState<string | null>(null);

  const handlePlanSelect = (plan: PlanType) => {
    setSelectedPlan(plan);
  };

  const handleNextStep = () => {
    if (currentStep === 'plan') {
      setCurrentStep('account');
    } else if (currentStep === 'account') {
      setCurrentStep('workspace');
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 'workspace') {
      setCurrentStep('account');
    } else if (currentStep === 'account') {
      setCurrentStep('plan');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validate password match
    if (formData.senha !== formData.confirmPassword) {
      setLocalError('As senhas não conferem!');
      return;
    }

    // Validate password requirements
    if (formData.senha.length < 8) {
      setLocalError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    try {
      await register({
        nome: formData.nome,
        sobrenome: formData.sobrenome,
        email: formData.email,
        senha: formData.senha,
        profissao: formData.profissao || undefined,
        comoConheceu: formData.comoConheceu || undefined,
        selectedPlan,
        workspaceName: formData.workspaceName,
        workspaceType: formData.workspaceType
      });

      // Redirect to workspace on success
      router.push('/workspace');
    } catch (err: any) {
      setLocalError(err.message || 'Erro ao criar conta. Tente novamente.');
    }
  };

  const plansList = [
    {
      type: PlanType.FREE,
      name: 'Free',
      price: 0,
      description: 'Perfeito para começar',
      popular: false
    },
    {
      type: PlanType.BASIC,
      name: 'Basic',
      price: billingInterval === 'monthly' ? 5 : 50,
      description: 'Para indivíduos organizados',
      popular: false
    },
    {
      type: PlanType.PRO,
      name: 'Pro',
      price: billingInterval === 'monthly' ? 15 : 150,
      description: 'Para profissionais produtivos',
      popular: true
    },
    {
      type: PlanType.ENTERPRISE,
      name: 'Enterprise',
      price: billingInterval === 'monthly' ? 50 : 500,
      description: 'Para equipes e empresas',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 py-3 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl font-semibold text-gray-900">Arc.</span>
          </Link>

          <div className="text-sm text-gray-600">
            Já tem conta?{' '}
            <Link href="/login" className="text-gray-900 font-semibold hover:underline">
              Entrar
            </Link>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${currentStep === 'plan' ? 'text-gray-900' : currentStep === 'account' || currentStep === 'workspace' ? 'text-gray-400' : 'text-gray-300'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${currentStep === 'plan' ? 'bg-gray-900 text-white' : (currentStep === 'account' || currentStep === 'workspace') ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-400'}`}>
              {currentStep === 'account' || currentStep === 'workspace' ? <Check className="w-5 h-5" /> : '1'}
            </div>
            <span className="font-medium">Plano</span>
          </div>

          <div className="w-16 h-0.5 bg-gray-200"></div>

          <div className={`flex items-center gap-2 ${currentStep === 'account' ? 'text-gray-900' : currentStep === 'workspace' ? 'text-gray-400' : 'text-gray-300'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${currentStep === 'account' ? 'bg-gray-900 text-white' : currentStep === 'workspace' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-400'}`}>
              {currentStep === 'workspace' ? <Check className="w-5 h-5" /> : '2'}
            </div>
            <span className="font-medium">Conta</span>
          </div>

          <div className="w-16 h-0.5 bg-gray-200"></div>

          <div className={`flex items-center gap-2 ${currentStep === 'workspace' ? 'text-gray-900' : 'text-gray-300'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${currentStep === 'workspace' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
              3
            </div>
            <span className="font-medium">Workspace</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 pb-12">
        {/* Step 1: Plan Selection */}
        {currentStep === 'plan' && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Escolha seu plano
              </h1>
              <p className="text-xl text-gray-600">
                Comece grátis e faça upgrade quando quiser
              </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center">
              <div className="inline-flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setBillingInterval('monthly')}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    billingInterval === 'monthly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setBillingInterval('yearly')}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    billingInterval === 'yearly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Anual <span className="text-green-600 text-sm ml-1">(economize 17%)</span>
                </button>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-4 gap-4">
              {plansList.map((plan) => {
                const planDetails = PLANS[plan.type];
                const isSelected = selectedPlan === plan.type;

                return (
                  <button
                    key={plan.type}
                    onClick={() => handlePlanSelect(plan.type)}
                    className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                          POPULAR
                        </span>
                      </div>
                    )}

                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">
                          R$ {plan.price}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-gray-600">
                            /{billingInterval === 'monthly' ? 'mês' : 'ano'}
                          </span>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-2 mb-4">
                      <li className="text-sm text-gray-700 flex items-center gap-2">
                        <Check className="w-4 h-4 text-gray-900" />
                        {planDetails.limits.maxWorkspaces === -1 ? 'Workspaces ilimitados' : `${planDetails.limits.maxWorkspaces} workspace${planDetails.limits.maxWorkspaces > 1 ? 's' : ''}`}
                      </li>
                      <li className="text-sm text-gray-700 flex items-center gap-2">
                        <Check className="w-4 h-4 text-gray-900" />
                        {planDetails.limits.maxProjects === -1 ? 'Projetos ilimitados' : `${planDetails.limits.maxProjects} projetos`}
                      </li>
                      <li className="text-sm text-gray-700 flex items-center gap-2">
                        <Check className="w-4 h-4 text-gray-900" />
                        {planDetails.limits.maxTeamMembers === -1 ? 'Membros ilimitados' : `${planDetails.limits.maxTeamMembers} membro${planDetails.limits.maxTeamMembers > 1 ? 's' : ''}`}
                      </li>
                      <li className="text-sm text-gray-700 flex items-center gap-2">
                        <Check className="w-4 h-4 text-gray-900" />
                        {planDetails.limits.maxStorageMB / 1024}GB armazenamento
                      </li>
                    </ul>

                    {isSelected && (
                      <div className="flex items-center justify-center gap-2 text-gray-900 font-medium">
                        <Check className="w-5 h-5" />
                        <span>Selecionado</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleNextStep}
                className="px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all flex items-center gap-2"
              >
                Continuar
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Account Creation */}
        {currentStep === 'account' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Crie sua conta
              </h1>
              <p className="text-xl text-gray-600">
                Preencha seus dados para começar
              </p>
            </div>

            {/* Error Alert */}
            {(error || localError) && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Erro ao criar conta</p>
                  <p className="text-sm text-red-700 mt-1">{localError || error}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={50}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                    placeholder="Ex: João"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sobrenome
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={50}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                    placeholder="Ex: Silva"
                    value={formData.sobrenome}
                    onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Profissão (opcional)
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                    placeholder="Ex: Desenvolvedor"
                    value={formData.profissao}
                    onChange={(e) => setFormData({ ...formData, profissao: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Como nos conheceu?
                  </label>
                  <select
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Senha
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                    placeholder="Min. 8 caracteres"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmar senha
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                    placeholder="Repita a senha"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handlePrevStep}
                className="px-8 py-4 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </button>
              <button
                onClick={handleNextStep}
                disabled={!formData.nome || !formData.sobrenome || !formData.email || !formData.senha || !formData.confirmPassword}
                className="flex-1 px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Workspace Setup */}
        {currentStep === 'workspace' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Configure seu workspace
              </h1>
              <p className="text-xl text-gray-600">
                Último passo antes de começar!
              </p>
            </div>

            {/* Error Alert */}
            {(error || localError) && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Erro ao criar conta</p>
                  <p className="text-sm text-red-700 mt-1">{localError || error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome do Workspace
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                  placeholder="Ex: Meus Projetos, Empresa X"
                  value={formData.workspaceName}
                  onChange={(e) => setFormData({ ...formData, workspaceName: e.target.value })}
                />
                <p className="text-sm text-gray-600 mt-2">Você pode criar mais workspaces depois</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tipo de Workspace
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, workspaceType: 'personal' })}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      formData.workspaceType === 'personal'
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Pessoal</h3>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Para uso individual e projetos pessoais</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, workspaceType: 'team' })}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      formData.workspaceType === 'team'
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Time</h3>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Para colaboração em equipe</p>
                  </button>
                </div>
              </div>

              {/* Selected Plan Summary */}
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Resumo do Plano</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Plano selecionado:</span>
                  <span className="font-semibold text-gray-900">{plansList.find(p => p.type === selectedPlan)?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Valor:</span>
                  <span className="font-semibold text-gray-900">
                    R$ {plansList.find(p => p.type === selectedPlan)?.price || 0}
                    {selectedPlan !== PlanType.FREE && `/${billingInterval === 'monthly' ? 'mês' : 'ano'}`}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center">
                Ao criar uma conta, você concorda com nossos{' '}
                <Link href="/terms" className="text-gray-700 font-medium hover:underline">
                  Termos de Uso
                </Link>
                {' '}e{' '}
                <Link href="/privacy" className="text-gray-700 font-medium hover:underline">
                  Política de Privacidade
                </Link>
              </p>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-8 py-4 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.workspaceName}
                  className="flex-1 px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
}
