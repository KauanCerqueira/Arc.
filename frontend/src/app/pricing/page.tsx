"use client";

import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, ArrowRight, Heart, Zap, Crown } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function PricingPage() {
  const plans = [
    {
      name: "Gratuito",
      price: "R$ 0",
      period: "para sempre",
      icon: Heart,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      description: "Perfeito para começar e explorar",
      features: [
        "3 workspaces",
        "10 projetos por workspace",
        "Todas as 4 metodologias (Kanban, Pomodoro, GTD, Estudo)",
        "Análises básicas",
        "Armazenamento de 500MB",
        "Suporte por email",
      ],
      cta: "Começar grátis",
      href: "/register",
      popular: false,
    },
    {
      name: "Apoiador",
      price: "R$ 5",
      period: "/mês",
      icon: Zap,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-500",
      description: "Ajude o projeto e ganhe recursos extras",
      features: [
        "Tudo do Gratuito, mais:",
        "10 workspaces",
        "Projetos ilimitados",
        "Análises avançadas com gráficos",
        "Armazenamento de 5GB",
        "Histórico de 6 meses",
        "Prioridade no suporte",
        "Badge de apoiador 💙",
      ],
      cta: "Apoiar projeto",
      href: "/register",
      popular: true,
    },
    {
      name: "Pro",
      price: "R$ 15",
      period: "/mês",
      icon: Crown,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      description: "Para profissionais e equipes pequenas",
      features: [
        "Tudo do Apoiador, mais:",
        "Workspaces ilimitados",
        "Colaboração em tempo real (até 5 membros)",
        "Integrações (Slack, Discord, GitHub)",
        "Armazenamento de 20GB",
        "Histórico ilimitado",
        "Templates personalizados",
        "API de acesso",
        "Suporte prioritário",
      ],
      cta: "Começar Pro",
      href: "/register",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icon/arclogo.svg" alt="Arc" width={32} height={32} priority />
            <span className="text-xl font-semibold text-gray-900">Arc.</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition">
              Home
            </Link>
            <Link href="/build-in-public" className="text-sm text-gray-600 hover:text-gray-900 transition">
              Transparência
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Heart className="w-4 h-4" />
          Preços honestos, sem pegadinhas
        </div>

        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Planos acessíveis para todos
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Nosso objetivo não é lucro máximo, mas criar uma ferramenta útil e sustentável.
          Por isso nossos preços são justos e transparentes.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-2xl mx-auto">
          <p className="text-sm text-gray-700">
            <strong>100% Build in Public:</strong> Todos os custos e receitas são públicos.
            Veja exatamente para onde vai seu apoio na{' '}
            <Link href="/build-in-public" className="text-blue-700 font-semibold hover:underline">
              página de métricas
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <div
                key={i}
                className={`rounded-2xl border-2 ${plan.borderColor} p-8 bg-white relative ${
                  plan.popular ? 'shadow-xl' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Mais popular
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <div className={`w-12 h-12 ${plan.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${plan.iconColor}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={plan.href}
                  className={`w-full py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 mb-8 ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'border-2 border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Comparação detalhada
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Recurso</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-900">Gratuito</th>
                <th className="text-center py-4 px-6 font-semibold text-blue-600">Apoiador</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-900">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                ['Workspaces', '3', '10', 'Ilimitado'],
                ['Projetos por workspace', '10', 'Ilimitado', 'Ilimitado'],
                ['Metodologias', '4', '4', '4'],
                ['Armazenamento', '500MB', '5GB', '20GB'],
                ['Histórico', '30 dias', '6 meses', 'Ilimitado'],
                ['Colaboradores', '1 (você)', '1 (você)', 'Até 5'],
                ['Análises', 'Básicas', 'Avançadas', 'Avançadas + API'],
                ['Integrações', '❌', '❌', '✅'],
                ['Suporte', 'Email', 'Prioritário', 'Prioritário'],
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium text-gray-900">{row[0]}</td>
                  <td className="py-4 px-6 text-center text-gray-600">{row[1]}</td>
                  <td className="py-4 px-6 text-center text-gray-900 font-medium">{row[2]}</td>
                  <td className="py-4 px-6 text-center text-gray-600">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Perguntas frequentes
        </h2>

        <div className="space-y-6">
          {[
            {
              q: 'Posso cancelar a qualquer momento?',
              a: 'Sim! Sem contratos ou taxas de cancelamento. Cancele quando quiser.',
            },
            {
              q: 'O plano gratuito tem prazo?',
              a: 'Não! O plano gratuito é para sempre, não é um trial.',
            },
            {
              q: 'Para onde vai meu apoio?',
              a: 'Custos de infraestrutura (AWS, banco de dados) e desenvolvimento. Tudo é público na página Build in Public.',
            },
            {
              q: 'Posso mudar de plano depois?',
              a: 'Sim! Você pode fazer upgrade ou downgrade a qualquer momento.',
            },
            {
              q: 'Aceitam outros métodos de pagamento?',
              a: 'Sim! PIX, cartão de crédito e débito. Em breve boleto.',
            },
          ].map((faq, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Experimente grátis agora
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Comece com o plano gratuito. Sem cartão de crédito necessário.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition"
          >
            Criar conta grátis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-600">
          <p>© 2025 Arc. • Feito para a comunidade</p>
        </div>
      </footer>
    </div>
  );
}
