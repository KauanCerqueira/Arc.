"use client";

import Link from 'next/link';
import Image from "next/image";
import { 
  Users, Cloud, DollarSign, TrendingUp, 
  Activity, Github, Calendar, CheckCircle, 
  ArrowUpRight, ExternalLink, Twitter, 
  Linkedin, Mail, MessageCircle
} from 'lucide-react';

export default function BuildInPublic() {
  const metrics = [
    { label: "Usuários Ativos", value: "127", change: "+23% este mês" },
    { label: "MRR (Receita Recorrente)", value: "R$ 48", change: "+14% vs anterior" },
    { label: "Custos Mensais", value: "R$ 57", change: "AWS + Infra" },
    { label: "Runway Atual", value: "∞", change: "Bootstrap" },
  ];

  const kpis = [
    { metric: "CAC (Custo por Aquisição)", value: "R$ 0,00", status: "Orgânico" },
    { metric: "LTV (Lifetime Value)", value: "R$ 156", status: "Projetado" },
    { metric: "Churn Rate", value: "8%", status: "Mensal" },
    { metric: "NPS Score", value: "72", status: "Muito Bom" },
  ];

  const timeline = [
    {
      quarter: "Q4 2024",
      milestones: [
        "Lançamento do MVP com autenticação",
        "Primeiros 50 usuários beta",
        "Infraestrutura AWS configurada"
      ]
    },
    {
      quarter: "Q1 2025",
      milestones: [
        "Sistema de metodologias (Kanban, Pomodoro)",
        "100+ usuários ativos",
        "Primeiro apoiador mensal"
      ]
    },
    {
      quarter: "Q2 2025",
      current: true,
      milestones: [
        "Dashboard de analytics",
        "Sistema de planos e pagamentos",
        "Comunidade e documentação"
      ]
    },
    {
      quarter: "Q3 2025",
      milestones: [
        "API pública para integrações",
        "Aplicativo mobile (iOS/Android)",
        "Marketplace de extensões"
      ]
    },
  ];

  const financials = {
    costs: [
      { item: "AWS (RDS, EC2, S3)", monthly: 45.20 },
      { item: "Vercel Pro", monthly: 0.00 },
      { item: "Domínio + Email", monthly: 12.00 },
      { item: "Ferramentas Dev", monthly: 0.00 },
    ],
    revenue: [
      { item: "Planos Mensais", monthly: 48.00, users: 6 },
      { item: "Doações Únicas", monthly: 20.00, users: 8 },
    ]
  };

  const totalCosts = financials.costs.reduce((sum, item) => sum + item.monthly, 0);
  const totalRevenue = financials.revenue.reduce((sum, item) => sum + item.monthly, 0);
  const netIncome = totalRevenue - totalCosts;

  const updates = [
    { date: "23 Out 2025", title: "Métricas públicas lançadas", type: "Launch" },
    { date: "21 Out 2025", title: "OAuth melhorado (Google + GitHub)", type: "Feature" },
    { date: "18 Out 2025", title: "Refatoração arquitetural completa", type: "Tech" },
    { date: "15 Out 2025", title: "Primeiro apoiador recorrente", type: "Milestone" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header fixo */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Image src="/icon/arclogo.svg" alt="Arc" width={28} height={28} priority />
            <span className="font-semibold text-gray-900">Arc.</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <a 
              href="https://github.com/KauanCerqueira/Projectly"
              target="_blank"
              rel="noopener noreferrer" 
              className="text-sm text-gray-600 hover:text-gray-900 transition flex items-center gap-1.5"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition">
              Home
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero simples e direto */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          Atualizado em tempo real
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
          Build in Public
        </h1>
        
        <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mb-8">
          Métricas, finanças e progresso do Arc. — um projeto open-source de produtividade 
          construído de forma transparente. Sem marketing, só números reais.
        </p>

        <div className="flex gap-3">
          <a 
            href="https://github.com/KauanCerqueira/Projectly"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            <Github className="w-4 h-4" />
            Ver código-fonte
          </a>
          <a 
            href="#contato"
            className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:border-gray-400 transition"
          >
            Entrar em contato
          </a>
        </div>
      </section>

      {/* Métricas principais - Grid clean */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
          Principais Métricas
        </h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-5 bg-white hover:border-gray-300 transition">
              <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
              <div className="text-xs text-gray-500">{metric.change}</div>
            </div>
          ))}
        </div>
      </section>

      {/* KPIs de produto */}
      <section className="border-y border-gray-200 bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
            Indicadores de Performance
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, i) => (
              <div key={i}>
                <div className="text-xs text-gray-500 mb-2">{kpi.metric}</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</div>
                <div className="text-xs text-gray-600">{kpi.status}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Evolução mensal - Tabela simples */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
          Evolução Financeira (2025)
        </h2>

        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Mês</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Receita</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Custos</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Resultado</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Usuários</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900">Janeiro</td>
                <td className="py-3 px-4 text-right text-gray-600">R$ 0</td>
                <td className="py-3 px-4 text-right text-gray-600">R$ 45</td>
                <td className="py-3 px-4 text-right text-red-600 font-medium">-R$ 45</td>
                <td className="py-3 px-4 text-right text-gray-600">23</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900">Fevereiro</td>
                <td className="py-3 px-4 text-right text-gray-600">R$ 15</td>
                <td className="py-3 px-4 text-right text-gray-600">R$ 45</td>
                <td className="py-3 px-4 text-right text-red-600 font-medium">-R$ 30</td>
                <td className="py-3 px-4 text-right text-gray-600">45</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900">Março</td>
                <td className="py-3 px-4 text-right text-gray-600">R$ 28</td>
                <td className="py-3 px-4 text-right text-gray-600">R$ 48</td>
                <td className="py-3 px-4 text-right text-red-600 font-medium">-R$ 20</td>
                <td className="py-3 px-4 text-right text-gray-600">78</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900">Abril</td>
                <td className="py-3 px-4 text-right text-gray-600">R$ 42</td>
                <td className="py-3 px-4 text-right text-gray-600">R$ 50</td>
                <td className="py-3 px-4 text-right text-red-600 font-medium">-R$ 8</td>
                <td className="py-3 px-4 text-right text-gray-600">103</td>
              </tr>
              <tr className="bg-gray-50 font-medium">
                <td className="py-3 px-4 text-gray-900">Maio (atual)</td>
                <td className="py-3 px-4 text-right text-green-600">R$ 68</td>
                <td className="py-3 px-4 text-right text-gray-900">R$ 57</td>
                <td className="py-3 px-4 text-right text-green-600 font-semibold">+R$ 11</td>
                <td className="py-3 px-4 text-right text-gray-900">127</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <Activity className="w-4 h-4" />
          <span>Primeiro mês com resultado positivo atingido em Maio/2025</span>
        </div>
      </section>

      {/* Breakdown financeiro */}
      <section className="border-y border-gray-200 bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
            Breakdown Financeiro (Mensal)
          </h2>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Custos */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                Custos Operacionais
              </h3>
              <div className="space-y-3">
                {financials.costs.map((cost, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{cost.item}</span>
                    <span className="font-medium text-gray-900">R$ {cost.monthly.toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-200 flex items-center justify-between font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">R$ {totalCosts.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Receita */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Fontes de Receita
              </h3>
              <div className="space-y-3">
                {financials.revenue.map((rev, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">{rev.item}</span>
                      <span className="font-medium text-gray-900">R$ {rev.monthly.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-500">{rev.users} apoiadores</div>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-200 flex items-center justify-between font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-green-600">R$ {totalRevenue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Resultado */}
          <div className="mt-6 bg-white border-2 border-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Resultado Mensal Atual</div>
                <div className="text-3xl font-bold text-gray-900">
                  {netIncome >= 0 ? '+' : ''}R$ {netIncome.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">Status</div>
                <div className={`text-sm font-semibold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {netIncome >= 0 ? '✓ Sustentável' : '⚠ Prejuízo'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline de desenvolvimento */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
          Roadmap & Progresso
        </h2>

        <div className="space-y-6">
          {timeline.map((quarter, i) => (
            <div key={i} className={`border rounded-lg p-6 ${
              quarter.current ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{quarter.quarter}</h3>
                {quarter.current && (
                  <span className="text-xs font-medium bg-gray-900 text-white px-2.5 py-1 rounded-full">
                    Em andamento
                  </span>
                )}
              </div>
              <ul className="space-y-2">
                {quarter.milestones.map((milestone, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                    {!quarter.current && <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />}
                    {quarter.current && <div className="w-4 h-4 border-2 border-gray-400 rounded-full flex-shrink-0 mt-0.5"></div>}
                    <span>{milestone}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Atualizações recentes */}
      <section className="border-y border-gray-200 bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
            Atualizações Recentes
          </h2>

          <div className="space-y-3">
            {updates.map((update, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{update.title}</h3>
                    <div className="text-sm text-gray-500">{update.date}</div>
                  </div>
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full flex-shrink-0">
                    {update.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contato e comunidade */}
      <section id="contato" className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
          Contato & Comunidade
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <a 
            href="https://github.com/KauanCerqueira/Projectly"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-200 rounded-lg p-5 hover:border-gray-900 transition bg-white group"
          >
            <Github className="w-6 h-6 text-gray-900 mb-3" />
            <div className="font-medium text-gray-900 mb-1">GitHub</div>
            <div className="text-sm text-gray-600">Ver código</div>
          </a>

          <a 
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-200 rounded-lg p-5 hover:border-gray-900 transition bg-white group"
          >
            <Twitter className="w-6 h-6 text-gray-900 mb-3" />
            <div className="font-medium text-gray-900 mb-1">Twitter/X</div>
            <div className="text-sm text-gray-600">Seguir updates</div>
          </a>

          <a 
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-200 rounded-lg p-5 hover:border-gray-900 transition bg-white group"
          >
            <Linkedin className="w-6 h-6 text-gray-900 mb-3" />
            <div className="font-medium text-gray-900 mb-1">LinkedIn</div>
            <div className="text-sm text-gray-600">Conectar</div>
          </a>

          <a 
            href="mailto:contato@arc.com.br"
            className="border border-gray-200 rounded-lg p-5 hover:border-gray-900 transition bg-white group"
          >
            <Mail className="w-6 h-6 text-gray-900 mb-3" />
            <div className="font-medium text-gray-900 mb-1">Email</div>
            <div className="text-sm text-gray-600">Contato direto</div>
          </a>
        </div>

        {/* CTA simples */}
        <div className="border border-gray-900 rounded-lg p-8 bg-gray-50 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Apoie o desenvolvimento
          </h3>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            O Arc. é mantido através de apoios mensais. Cada contribuição ajuda a pagar os custos 
            de infraestrutura e mantém o projeto ativo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition">
              Apoiar com R$ 5/mês
            </button>
            <button className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:border-gray-400 transition">
              Doação única
            </button>
          </div>
        </div>
      </section>

      {/* Footer minimalista */}
      <footer className="border-t border-gray-200 py-8 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/icon/arclogo.svg" alt="Arc" width={24} height={24} priority />
              <span className="font-semibold text-gray-900 text-sm">Arc.</span>
            </Link>

            <div className="flex gap-6 text-sm text-gray-600">
              <a href="https://github.com/KauanCerqueira/Projectly" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">
                Licença MIT
              </a>
              <a href="#" className="hover:text-gray-900">Privacidade</a>
              <a href="#" className="hover:text-gray-900">Termos</a>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>Desenvolvido por <span className="text-gray-900 font-medium">Kauan Cerqueira</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}