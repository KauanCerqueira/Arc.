"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/core/store/authStore';

const REMEMBER_ME_KEY = 'remember_me_email';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Carregar email salvo ao montar o componente
  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBER_ME_KEY);
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    try {
      await login({
        email: formData.email,
        senha: formData.senha,
      });

      // Salvar ou remover email do localStorage baseado no checkbox
      if (rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, formData.email);
      } else {
        localStorage.removeItem(REMEMBER_ME_KEY);
      }

      // Redirect to workspace on success
      router.push('/workspace');
    } catch (err: any) {
      setLocalError(err.message || 'Erro ao fazer login. Tente novamente.');
    }
  };

  const benefits = [
    {
      icon: CheckCircle,
      title: "Projetos organizados",
      description: "Gerencie tudo em um só lugar com as metodologias que você já conhece"
    },
    {
      icon: TrendingUp,
      title: "Análise inteligente",
      description: "Descubra padrões de produtividade e otimize seu tempo"
    },
    {
      icon: Zap,
      title: "Múltiplas metodologias",
      description: "Alterne entre Kanban, Pomodoro, GTD e Estudo quando quiser"
    }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Lado Esquerdo - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo e voltar */}
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <span className="text-xl font-semibold text-gray-900">Arc.</span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bem-vindo de volta
            </h1>
            <p className="text-gray-600">
              Entre na sua conta para continuar
            </p>
          </div>

          {/* Error Alert */}
          {(error || localError) && (
            <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">Erro ao fazer login</p>
                <p className="text-sm text-red-700">{localError || error}</p>
              </div>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <input
                type="password"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
                className="w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-gray-900"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                Lembrar de mim
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">ou</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="space-y-2.5">
            <button className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition text-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </button>

            <button className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition text-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Continuar com GitHub
            </button>
          </div>

          {/* Cadastro */}
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link href="/register" className="text-gray-900 font-semibold hover:underline">
                Cadastre-se grátis
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Lado Direito - Benefícios */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 border-l border-gray-200 items-center justify-center p-8">
        <div className="max-w-lg">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Organize seus projetos como nunca antes
            </h2>
            <p className="text-gray-600">
              Mais de 12 mil pessoas já estão usando o Arc..
            </p>
          </div>

          {/* Benefits List */}
          <div className="space-y-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Screenshot Preview */}
          <div className="mt-8 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              <div className="h-2 bg-gray-200 rounded w-5/6"></div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="h-12 bg-blue-100 rounded"></div>
                <div className="h-12 bg-green-100 rounded"></div>
                <div className="h-12 bg-purple-100 rounded"></div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-gray-900">12.5K</div>
              <div className="text-xs text-gray-600">Usuários</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">89K</div>
              <div className="text-xs text-gray-600">Projetos</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">4.8/5</div>
              <div className="text-xs text-gray-600">Avaliação</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}