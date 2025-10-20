"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Zap, Shield, TrendingUp } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não conferem!');
      return;
    }
    console.log('Registro:', formData);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 py-4 px-6">
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

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Crie sua conta gratuita
          </h1>
          <p className="text-xl text-gray-600">
            Comece a organizar seus projetos em menos de 2 minutos
          </p>
        </div>

        {/* Benefits Bar */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          {[
            { icon: CheckCircle, text: "Grátis" },
            { icon: Shield, text: "Seguro" },
            { icon: Zap, text: "Rápido" },
            { icon: TrendingUp, text: "4 métodos" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Icon className="w-5 h-5 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">{item.text}</span>
              </div>
            );
          })}
        </div>

        {/* Social Buttons */}
        <div className="space-y-3 mb-8">
          <button className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Cadastrar com Google
          </button>

          <button className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Cadastrar com GitHub
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">ou cadastre-se com email</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome completo
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-base"
              placeholder="Ex: João Silva"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email profissional
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-base"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-base"
                placeholder="Min. 6 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmar senha
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-base"
                placeholder="Repita a senha"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all text-lg shadow-lg hover:shadow-xl"
          >
            Criar Conta Gratuita
          </button>
        </form>

        {/* Terms */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Ao criar uma conta, você concorda com nossos{' '}
          <Link href="/terms" className="text-gray-700 font-medium hover:underline">
            Termos de Uso
          </Link>
          {' '}e{' '}
          <Link href="/privacy" className="text-gray-700 font-medium hover:underline">
            Política de Privacidade
          </Link>
        </p>

        {/* Testimonial */}
        <div className="mt-12 bg-gray-50 rounded-2xl p-8 border border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              M
            </div>
            <div>
              <p className="text-gray-700 mb-3 leading-relaxed">
                "Finalmente consigo ver todos os meus projetos em um lugar só. O Arc. mudou completamente como eu trabalho e organizo minhas tarefas."
              </p>
              <div>
                <div className="font-semibold text-gray-900">Marina Souza</div>
                <div className="text-sm text-gray-600">Designer de Produto</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-3 gap-6 text-center pb-12">
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-1">12.5K</div>
            <div className="text-sm text-gray-600">Usuários ativos</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-1">89K</div>
            <div className="text-sm text-gray-600">Projetos criados</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-1">4.8/5</div>
            <div className="text-sm text-gray-600">Avaliação média</div>
          </div>
        </div>
      </main>
    </div>
  );
}