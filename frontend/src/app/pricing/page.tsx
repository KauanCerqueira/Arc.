"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, Heart, Rocket, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function PricingPage() {
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

      {/* Hero - Beta Announcement */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 text-purple-700 px-6 py-3 rounded-full text-sm font-bold mb-8 shadow-sm">
          <Sparkles className="w-5 h-5" />
          VERSÃO BETA - GRATUITA
        </div>

        <h1 className="text-6xl font-extrabold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
          100% Gratuito durante a Beta
        </h1>
        <p className="text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
          Estamos lançando a <strong>versão beta do Arc</strong> e todas as funcionalidades
          estão disponíveis <strong>gratuitamente</strong> para os primeiros usuários!
        </p>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-8 max-w-3xl mx-auto mb-12">
          <div className="flex items-start gap-4 text-left">
            <Heart className="w-12 h-12 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Por que está gratuito?</h3>
              <p className="text-gray-700 leading-relaxed">
                Queremos testar, melhorar e crescer junto com vocês! Durante o período beta
                (próximos 3-6 meses), tudo é gratuito. Seu feedback é essencial para construirmos
                a melhor ferramenta de produtividade possível.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/register"
          className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
        >
          <Rocket className="w-6 h-6" />
          Começar grátis agora
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* What's Included */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-gray-200">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">
          O que você ganha na Beta
        </h2>
        <p className="text-center text-gray-600 mb-16 text-lg">
          Acesso completo a todas as funcionalidades premium
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-gray-400 transition-all">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Funcionalidades Ilimitadas</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Workspaces ilimitados</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Projetos e páginas ilimitadas</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Todos os templates disponíveis</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Análises e dashboards avançados</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-gray-400 transition-all">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recursos Premium</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Colaboração em equipe</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Histórico completo</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Armazenamento generoso</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Suporte prioritário</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-gray-400 transition-all">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Benefícios Beta</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Influencie o desenvolvimento</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Acesso antecipado a novidades</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Badge exclusivo de beta tester</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Condições especiais no futuro</span>
              </li>
            </ul>
          </div>
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
              q: 'Por quanto tempo será gratuito?',
              a: 'A versão beta estará disponível gratuitamente pelos próximos 3-6 meses. Vamos avisar com antecedência sobre qualquer mudança.',
            },
            {
              q: 'Preciso cadastrar cartão de crédito?',
              a: 'Não! Absolutamente nenhum dado de pagamento é necessário. Basta criar sua conta e começar a usar.',
            },
            {
              q: 'O que acontece depois da beta?',
              a: 'Continuaremos com um plano gratuito robusto. Beta testers terão condições especiais e benefícios exclusivos.',
            },
            {
              q: 'Meus dados estarão seguros?',
              a: 'Sim! Mesmo sendo beta, levamos segurança muito a sério. Todos os dados são criptografados e armazenados com segurança.',
            },
            {
              q: 'Como posso ajudar o projeto?',
              a: 'Use o Arc, dê feedback honesto, reporte bugs e compartilhe com amigos. Seu envolvimento é o que mais importa agora!',
            },
          ].map((faq, i) => (
            <div key={i} className="border-2 border-gray-200 rounded-xl p-6 hover:border-gray-400 transition-all">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">{faq.q}</h3>
              <p className="text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
          <h2 className="text-5xl font-bold mb-6">
            Seja um dos primeiros!
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Crie sua conta agora e aproveite acesso completo e gratuito a todas
            as funcionalidades durante o período beta.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-3 bg-white text-gray-900 px-10 py-5 rounded-2xl text-lg font-bold hover:scale-105 transition-all shadow-xl"
          >
            <Rocket className="w-6 h-6" />
            Criar conta grátis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-600">
          <p>© 2025 Arc. • Feito para a comunidade • Versão Beta</p>
        </div>
      </footer>
    </div>
  );
}
