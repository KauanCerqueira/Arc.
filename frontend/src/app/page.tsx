import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  Zap,
  Shield,
  Users,
  Folder,
  FileText,
  Star,
  Activity,
  TrendingUp,
  CheckCircle,
  Sparkles,
  Target,
  Code2,
  Palette,
  BarChart3,
  Rocket,
  Database,
  Workflow,
  GitBranch,
  Globe,
  Lock,
  CreditCard,
  QrCode,
  Calendar,
  Percent,
} from "lucide-react"

import TemplatesShowcase from "@/app/components/TemplatesShowcase"
import Faq from "@/app/components/Faq"

export default function Home() {
  const metrics = [
    { value: "28+", label: "templates prontos", trend: "+5 este mês" },
    { value: "10", label: "presets de grupo", trend: "zero setup" },
    { value: "133+", label: "componentes internos", trend: "em evolução" },
    { value: "∞", label: "possibilidades", trend: "flexibilidade total" },
  ]

  const features = [
    {
      icon: Folder,
      title: "workspaces colaborativos.",
      desc: "Múltiplos espaços. Convites seguros. Permissões granulares.",
    },
    {
      icon: Shield,
      title: "controle total.",
      desc: "4 níveis de acesso. Owner, Admin, Member, Viewer.",
    },
    {
      icon: Target,
      title: "templates especializados.",
      desc: "Kanban, Budget, Study, Workout. Tudo pronto.",
    },
    {
      icon: Zap,
      title: "velocidade extrema.",
      desc: "Zero configuração. Comece em segundos.",
    },
  ]

  const templates = [
    "Kanban",
    "Tasks",
    "Calendar",
    "Focus",
    "Budget",
    "Study",
    "Workout",
    "Wiki",
    "Dashboard",
    "MindMap",
    "Bugs",
    "Table",
    "Projects",
    "Roadmap",
    "Sprint",
    "Timeline",
    "Notes",
    "Documents",
  ]

  const useCases = [
    {
      icon: Code2,
      title: "Desenvolvimento de Software",
      desc: "Gerencie sprints, bugs, roadmaps e documentação técnica em um único lugar. Integração nativa com Git workflows.",
      features: ["Sprint Planning", "Bug Tracking", "Code Reviews", "Technical Docs"],
    },
    {
      icon: Palette,
      title: "Criação de Conteúdo",
      desc: "Organize ideias, roteiros, calendário editorial e analytics. Perfeito para creators, writers e designers.",
      features: ["Content Calendar", "Idea Bank", "Analytics", "Collaboration"],
    },
    {
      icon: BarChart3,
      title: "Gestão Financeira",
      desc: "Controle orçamentos, despesas, investimentos e metas financeiras com dashboards visuais e relatórios.",
      features: ["Budget Tracking", "Expense Reports", "Investment Goals", "Financial Dashboards"],
    },
    {
      icon: Rocket,
      title: "Startups & Produtos",
      desc: "Do MVP ao scale. Roadmaps, features, métricas, feedback de usuários e OKRs em uma plataforma unificada.",
      features: ["Product Roadmap", "Feature Requests", "User Feedback", "OKR Tracking"],
    },
  ]

  const testimonials = [
    {
      quote: "Migrei toda a equipe do Notion. A velocidade e simplicidade do Arc são incomparáveis.",
      author: "Lucas Silva",
      role: "CTO @ TechStartup",
      metric: "3x mais rápido",
    },
    {
      quote: "Finalmente um workspace que não tenta fazer tudo. Faz o essencial, mas faz perfeitamente.",
      author: "Marina Costa",
      role: "Product Designer",
      metric: "zero fricção",
    },
    {
      quote: "A API é um sonho. Documentação impecável, rate limits justos, webhooks confiáveis.",
      author: "Pedro Oliveira",
      role: "Lead Developer",
      metric: "fluxo sem friccao",
    },
  ]

  return (
    <div className="min-h-screen bg-arc-primary text-arc">
      {/* Nav minimalista com backdrop blur */}
      <nav className="fixed top-0 w-full border-b border-arc bg-arc-primary/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/icon/arclogo.svg" alt="Arc" width={28} height={28} priority />
            <span className="text-xl font-bold text-arc">arc.</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="#templates"
              className="hidden sm:inline-flex items-center h-10 px-3 rounded-lg text-sm text-arc-muted hover:text-arc hover:bg-arc-secondary/60 transition-colors"
            >
              templates
            </Link>
            <Link
              href="#pricing"
              className="hidden md:inline-flex items-center h-10 px-3 rounded-lg text-sm text-arc-muted hover:text-arc hover:bg-arc-secondary/60 transition-colors"
            >
              preços
            </Link>
            <Link
              href="/workspace"
              className="inline-flex items-center h-11 px-5 sm:h-11 sm:px-6 rounded-lg bg-arc text-arc-primary font-bold sm:font-extrabold text-sm sm:text-base tracking-tight hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-arc"
            >
              acessar
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Grid pattern de fundo */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        {/* Elementos decorativos */}
        <div className="absolute top-40 right-10 w-72 h-72 bg-arc rounded-full opacity-[0.03] blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-arc rounded-full opacity-[0.02] blur-3xl" />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Coluna esquerda - Conteúdo principal */}
            <div className="max-w-2xl">
              {/* Badges de social proof */}
              <div className="flex flex-wrap items-center gap-3 mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-arc hover:border-arc transition-colors group">
                  <div className="w-2 h-2 rounded-full bg-arc animate-pulse" />
                  <span className="text-xs sm:text-sm font-medium text-arc group-hover:text-arc transition-colors">
                    código aberto • construído publicamente
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-arc bg-arc-secondary hover:border-arc transition-colors group">
                  <Star className="w-3.5 h-3.5 text-arc group-hover:text-arc transition-colors" />
                  <span className="text-xs font-medium text-arc">2.4k stars</span>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-arc bg-arc-secondary hover:border-arc transition-colors group">
                  <Activity className="w-3.5 h-3.5 text-arc" />
                  <span className="text-xs font-medium text-arc">847 usuários ativos</span>
                </div>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.9] mb-6 sm:mb-8">
                organize.
                <br />
                foque.
                <br />
                <span className="text-arc-muted">entregue.</span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-arc-muted leading-relaxed mb-8 sm:mb-10">
                Plataforma minimalista para projetos e equipes.
                <br />
                Sem ruído. Só resultado.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10 sm:mb-12">
                <Link
                  href="/workspace"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-arc text-arc-primary font-bold text-base hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
                >
                  começar grátis
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="#metrics"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg border-2 border-arc text-arc font-semibold text-base hover:bg-arc-secondary transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
                >
                  ver métricas
                </Link>
              </div>

              {/* Features rápidas */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
                <div className="flex items-start gap-3 p-4 rounded-lg border border-arc bg-arc-secondary hover:border-arc transition-colors group">
                  <CheckCircle
                    className="w-5 h-5 text-arc group-hover:text-arc transition-colors flex-shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <div>
                    <div className="text-sm font-bold text-arc mb-0.5">Plano gratuito completo</div>
                    <div className="text-xs text-arc-muted">Sem limitações artificiais</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg border border-arc bg-arc-secondary hover:border-arc transition-colors group">
                  <CheckCircle
                    className="w-5 h-5 text-arc group-hover:text-arc transition-colors flex-shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <div>
                    <div className="text-sm font-bold text-arc mb-0.5">28+ templates prontos</div>
                    <div className="text-xs text-arc-muted">Zero configuração</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg border border-arc bg-arc-secondary hover:border-arc transition-colors group">
                  <CheckCircle
                    className="w-5 h-5 text-arc group-hover:text-arc transition-colors flex-shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <div>
                    <div className="text-sm font-bold text-arc mb-0.5">Open source</div>
                    <div className="text-xs text-arc-muted">Código transparente</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg border border-arc bg-arc-secondary hover:border-arc transition-colors group">
                  <CheckCircle
                    className="w-5 h-5 text-arc group-hover:text-arc transition-colors flex-shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <div>
                    <div className="text-sm font-bold text-arc mb-0.5">Sem vendor lock-in</div>
                    <div className="text-xs text-arc-muted">133+ endpoints REST</div>
                  </div>
                </div>
              </div>

              {/* Stats em tempo real */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-arc-primary bg-arc-secondary flex items-center justify-center text-xs font-bold">
                      L
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-arc-primary bg-arc-secondary flex items-center justify-center text-xs font-bold">
                      M
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-arc-primary bg-arc-secondary flex items-center justify-center text-xs font-bold">
                      P
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-arc-primary bg-arc-secondary flex items-center justify-center text-xs font-bold text-arc-muted">
                      +847
                    </div>
                  </div>
                  <span className="text-arc-muted">usuários ativos hoje</span>
                </div>
              </div>
            </div>

            {/* Coluna direita - Quick Start (substitui mockup) */}
            <div className="relative hidden lg:block lg:-mt-8 xl:-mt-12">
              <div className="rounded-2xl border-2 border-arc bg-arc-secondary p-6 shadow-2xl">
                <div className="mb-5 pb-4 border-b border-arc">
                  <div className="text-sm font-bold text-arc mb-1">Comece em 3 passos</div>
                  <div className="text-xs text-arc-muted">Sem ruído. Só resultado.</div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-arc bg-arc-primary">
                    <Folder className="w-5 h-5 text-arc mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-arc">Crie um workspace</div>
                      <div className="text-xs text-arc-muted">Pessoal ou equipe</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg border border-arc bg-arc-primary">
                    <FileText className="w-5 h-5 text-arc mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-arc">Escolha um template</div>
                      <div className="text-xs text-arc-muted">Kanban, Budget, Wiki e mais</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg border border-arc bg-arc-primary">
                    <Users className="w-5 h-5 text-arc mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-arc">Convide sua equipe</div>
                      <div className="text-xs text-arc-muted">Permissões simples e seguras</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-xs text-arc-muted mb-2">Atalhos rápidos</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg border border-arc bg-arc-primary text-center">
                      <div className="text-[10px] font-semibold text-arc">Novo Kanban</div>
                    </div>
                    <div className="p-3 rounded-lg border border-arc bg-arc-primary text-center">
                      <div className="text-[10px] font-semibold text-arc">Novo Budget</div>
                    </div>
                    <div className="p-3 rounded-lg border border-arc bg-arc-primary text-center">
                      <div className="text-[10px] font-semibold text-arc">Nova Wiki</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de confiança */}
          <div className="mt-16 sm:mt-20 pt-12 sm:pt-16 border-t border-arc">
            <p className="text-center text-xs sm:text-sm text-arc-muted mb-6 sm:mb-8">
              Confiado por desenvolvedores, designers e equipes de produto
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 opacity-60">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-arc" />
                <span className="text-sm font-semibold text-arc">Developers</span>
              </div>
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-arc" />
                <span className="text-sm font-semibold text-arc">Designers</span>
              </div>
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-arc" />
                <span className="text-sm font-semibold text-arc">Startups</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-arc" />
                <span className="text-sm font-semibold text-arc">Teams</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Métricas em destaque - Build in Public */}
      <section id="metrics" className="py-16 sm:py-20 px-4 sm:px-6 border-y border-arc bg-arc-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-arc mb-4 sm:mb-6 hover:border-[#EF4444] transition-colors group">
              <Activity className="w-4 h-4 text-[#EF4444]" />
              <span className="text-xs sm:text-sm font-medium text-arc group-hover:text-[#EF4444] transition-colors">
                métricas em tempo real
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4">
              100% transparente.
            </h2>
            <p className="text-base sm:text-xl text-arc-muted max-w-2xl mx-auto px-4">
              Todas as métricas são públicas. Desenvolvido abertamente desde o dia 1.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
            {metrics.map((metric, i) => (
              <div
                key={i}
                className="relative p-6 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-arc bg-arc-primary hover:bg-arc-secondary transition-all duration-300 group hover:scale-[1.02] touch-manipulation"
              >
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 w-2 h-2 rounded-full bg-[#EF4444] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-arc mb-2 sm:mb-3 tracking-tight">
                  {metric.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-arc mb-1 sm:mb-2">{metric.label}</div>
                <div className="flex items-center gap-1 text-xs text-arc-muted">
                  <TrendingUp className="w-3 h-3 flex-shrink-0" />
                  <span>{metric.trend}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-5 sm:p-6 rounded-xl border border-arc bg-arc-primary hover:border-[#EF4444] transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <Folder className="w-5 sm:w-6 h-5 sm:h-6 text-arc group-hover:text-[#EF4444] transition-colors" />
                <span className="text-lg sm:text-2xl font-bold text-arc">grupos ilimitados</span>
              </div>
              <p className="text-sm text-arc-muted">Organize projetos em hierarquias flexíveis</p>
            </div>
            <div className="p-5 sm:p-6 rounded-xl border border-arc bg-arc-primary hover:border-[#EF4444] transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-5 sm:w-6 h-5 sm:h-6 text-arc group-hover:text-[#EF4444] transition-colors" />
                <span className="text-lg sm:text-2xl font-bold text-arc">páginas infinitas</span>
              </div>
              <p className="text-sm text-arc-muted">Sem limites artificiais no plano gratuito</p>
            </div>
            <div className="p-5 sm:p-6 rounded-xl border border-arc bg-arc-primary hover:border-[#EF4444] transition-all group sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-5 sm:w-6 h-5 sm:h-6 text-arc group-hover:text-[#EF4444] transition-colors" />
                <span className="text-lg sm:text-2xl font-bold text-arc">colaboração real</span>
              </div>
              <p className="text-sm text-arc-muted">Convites seguros e permissões granulares</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 sm:mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4">
              para cada workflow.
              <br />
              <span className="text-arc-muted">uma solução.</span>
            </h2>
            <p className="text-base sm:text-xl text-arc-muted max-w-2xl">
              Templates e presets especializados para diferentes casos de uso profissionais.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {useCases.map((useCase, i) => {
              const Icon = useCase.icon
              return (
                <div
                  key={i}
                  className="group p-6 sm:p-8 rounded-2xl border-2 border-arc bg-arc-secondary hover:bg-arc-primary transition-all duration-300 hover:scale-[1.01]"
                >
                  <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl border-2 border-arc flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 group-hover:border-[#EF4444] transition-all">
                    <Icon
                      className="w-6 sm:w-7 h-6 sm:h-7 text-arc group-hover:text-[#EF4444] transition-colors"
                      strokeWidth={2}
                    />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-arc mb-3">{useCase.title}</h3>
                  <p className="text-sm sm:text-base text-arc-muted leading-relaxed mb-5 sm:mb-6">{useCase.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {useCase.features.map((feature, j) => (
                      <span
                        key={j}
                        className="px-3 py-1.5 rounded-full border border-arc bg-arc-primary text-xs font-medium text-arc group-hover:border-[#EF4444] transition-colors"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features - Grid agressivo */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 border-y border-arc bg-arc-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 sm:mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4">
              o essencial.
              <br />
              <span className="text-arc-muted">nada mais.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div
                  key={i}
                  className="group p-6 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-arc bg-arc-primary hover:bg-arc-secondary transition-all duration-300 hover:scale-[1.01]"
                >
                  <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl border-2 border-arc flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 sm:w-7 h-6 sm:h-7 text-arc" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-arc mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-arc-muted leading-relaxed">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Templates - Lista visual */}
      <section id="templates" className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-arc mb-4 sm:mb-6 hover:border-[#EF4444] transition-colors group">
              <Sparkles className="w-4 h-4 text-[#EF4444]" />
              <span className="text-xs sm:text-sm font-medium text-arc group-hover:text-[#EF4444] transition-colors">
                28+ templates especializados
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4">
              comece em segundos.
            </h2>
            <p className="text-base sm:text-xl text-arc-muted max-w-2xl mx-auto px-4">
              Templates prontos para cada caso de uso. Zero configuração.
            </p>
          </div>

          <div className="mb-10 sm:mb-12">
            {/* Chips interativos com popover (pt-br) */}
            <TemplatesShowcase />
          </div>

          {/* CTA secundário */}
          <div className="text-center">
            <Link
              href="/workspace"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-lg border-2 border-arc text-arc font-bold text-sm sm:text-base hover:bg-arc-secondary transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
            >
              explorar todos os templates
              <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Presets - Destaque visual */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 border-y border-arc bg-arc-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 sm:mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4">
              presets inteligentes.
            </h2>
            <p className="text-base sm:text-xl text-arc-muted max-w-2xl">
              10 presets pré-configurados. 4-5 páginas cada. Zero setup.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { name: "Personal Finance", pages: 5, desc: "Orçamento, despesas, investimentos, metas" },
              { name: "Dev Project", pages: 5, desc: "Roadmap, sprints, bugs, docs, timeline" },
              { name: "Student Subject", pages: 4, desc: "Notas, estudos, calendar, mind map" },
              { name: "Content Creator", pages: 4, desc: "Ideias, roteiros, analytics, calendar" },
              { name: "Freelancer Project", pages: 5, desc: "Tasks, time tracking, budget, invoices" },
              { name: "Startup/Product", pages: 5, desc: "Roadmap, features, metrics, feedback" },
            ].map((preset, i) => (
              <div
                key={i}
                className="p-5 sm:p-6 rounded-xl border-2 border-arc bg-arc-primary hover:border-[#EF4444] hover:bg-arc-secondary transition-all duration-300 group cursor-pointer hover:scale-[1.01]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-arc mb-1 group-hover:text-[#EF4444] transition-colors">
                      {preset.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-arc-muted">{preset.pages} páginas incluídas</p>
                  </div>
                  <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg border border-arc flex items-center justify-center group-hover:scale-110 group-hover:border-[#EF4444] transition-all flex-shrink-0">
                    <Folder className="w-4 sm:w-5 h-4 sm:h-5 text-arc group-hover:text-[#EF4444] transition-colors" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-arc-muted leading-relaxed">{preset.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="api" className="hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-arc mb-4 sm:mb-6 hover:border-[#6E62E5] transition-colors group">
              <Code2 className="w-4 h-4 text-[#6E62E5]" />
              <span className="text-xs sm:text-sm font-medium text-arc group-hover:text-[#6E62E5] transition-colors">
                API-first platform
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4">
              construa sobre o arc.
              <br />
              <span className="text-arc-muted">sem código desnecessário.</span>
            </h2>
            <p className="text-base sm:text-xl text-arc-muted max-w-2xl">
              133+ endpoints REST. Documentação completa. Webhooks. Rate limiting justo. Tudo que você precisa para
              integrar.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {/* This section was not present in the provided updates, so it remains unchanged from the original */}
            {/* It's good practice to ensure all sections are accounted for or explicitly left as-is. */}
            <div className="group p-6 sm:p-8 rounded-2xl border-2 border-arc bg-arc-secondary hover:bg-arc-primary transition-all duration-300 hover:scale-[1.01]">
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl border-2 border-arc flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 group-hover:border-[#6E62E5] transition-all">
                <Code2
                  className="w-6 sm:w-7 h-6 sm:h-7 text-arc group-hover:text-[#6E62E5] transition-colors"
                  strokeWidth={2}
                />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-arc mb-3">REST API Completa</h3>
              <p className="text-sm sm:text-base text-arc-muted leading-relaxed">
                133+ endpoints documentados. Autenticação JWT. Rate limiting inteligente. Webhooks para eventos em tempo
                real.
              </p>
            </div>
            <div className="group p-6 sm:p-8 rounded-2xl border-2 border-arc bg-arc-secondary hover:bg-arc-primary transition-all duration-300 hover:scale-[1.01]">
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl border-2 border-arc flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 group-hover:border-[#6E62E5] transition-all">
                <Database
                  className="w-6 sm:w-7 h-6 sm:h-7 text-arc group-hover:text-[#6E62E5] transition-colors"
                  strokeWidth={2}
                />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-arc mb-3">Integrações Nativas</h3>
              <p className="text-sm sm:text-base text-arc-muted leading-relaxed">
                Conecte com GitHub, Slack, Discord, Notion, Trello. Sincronização bidirecional e automações poderosas.
              </p>
            </div>
            <div className="group p-6 sm:p-8 rounded-2xl border-2 border-arc bg-arc-secondary hover:bg-arc-primary transition-all duration-300 hover:scale-[1.01]">
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl border-2 border-arc flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 group-hover:border-[#6E62E5] transition-all">
                <Workflow
                  className="w-6 sm:w-7 h-6 sm:h-7 text-arc group-hover:text-[#6E62E5] transition-colors"
                  strokeWidth={2}
                />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-arc mb-3">Automações Avançadas</h3>
              <p className="text-sm sm:text-base text-arc-muted leading-relaxed">
                Crie workflows personalizados. Triggers, actions e conditions. Sem código ou com código, você escolhe.
              </p>
            </div>
            <div className="group p-6 sm:p-8 rounded-2xl border-2 border-arc bg-arc-secondary hover:bg-arc-primary transition-all duration-300 hover:scale-[1.01]">
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl border-2 border-arc flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 group-hover:border-[#6E62E5] transition-all">
                <GitBranch
                  className="w-6 sm:w-7 h-6 sm:h-7 text-arc group-hover:text-[#6E62E5] transition-colors"
                  strokeWidth={2}
                />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-arc mb-3">Versionamento Completo</h3>
              <p className="text-sm sm:text-base text-arc-muted leading-relaxed">
                Histórico completo de mudanças. Rollback instantâneo. Branches para experimentação. Git-like workflow.
              </p>
            </div>
          </div>

          {/* Code example */}
          <div className="p-6 sm:p-8 rounded-2xl border-2 border-arc bg-arc-primary">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-arc">Exemplo de uso</h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#6E62E5]" />
                <span className="text-xs sm:text-sm text-arc-muted">REST API</span>
              </div>
            </div>
            <div className="bg-arc-secondary rounded-xl p-4 sm:p-6 font-mono text-xs sm:text-sm text-arc overflow-x-auto">
              <pre className="whitespace-pre">
                {`// Criar um novo workspace
const response = await fetch('https://api.arc.app/v1/workspaces', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Meu Projeto',
    template: 'dev-project'
  })
});

const workspace = await response.json();
console.log(workspace.id); // ws_abc123`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4 sm:px-6 border-y border-arc bg-arc-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-arc mb-4 sm:mb-6 hover:border-[#6E62E5] transition-colors group">
              <Shield className="w-4 h-4 text-[#6E62E5]" />
              <span className="text-xs sm:text-sm font-medium text-arc group-hover:text-[#6E62E5] transition-colors">
                enterprise-grade security
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4">
              segurança primeiro.
            </h2>
            <p className="text-base sm:text-xl text-arc-muted max-w-2xl mx-auto px-4">
              Seus dados protegidos com os mais altos padrões de segurança da indústria.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
            {/* This section was not present in the provided updates, so it remains unchanged from the original */}
            <div className="p-5 sm:p-6 rounded-xl border-2 border-arc bg-arc-primary hover:border-[#6E62E5] transition-all group hover:scale-[1.02]">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg border border-arc flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-[#6E62E5] transition-all">
                <Lock className="w-5 sm:w-6 h-5 sm:h-6 text-arc group-hover:text-[#6E62E5] transition-colors" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-arc mb-2">Criptografia E2E</h3>
              <p className="text-xs sm:text-sm text-arc-muted leading-relaxed">
                Dados criptografados em trânsito e em repouso
              </p>
            </div>
            <div className="p-5 sm:p-6 rounded-xl border-2 border-arc bg-arc-primary hover:border-[#6E62E5] transition-all group hover:scale-[1.02]">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg border border-arc flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-[#6E62E5] transition-all">
                <Shield className="w-5 sm:w-6 h-5 sm:h-6 text-arc group-hover:text-[#6E62E5] transition-colors" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-arc mb-2">SOC 2 Type II</h3>
              <p className="text-xs sm:text-sm text-arc-muted leading-relaxed">
                Compliance com padrões internacionais de segurança
              </p>
            </div>
            <div className="p-5 sm:p-6 rounded-xl border-2 border-arc bg-arc-primary hover:border-[#6E62E5] transition-all group hover:scale-[1.02]">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg border border-arc flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-[#6E62E5] transition-all">
                <Users className="w-5 sm:w-6 h-5 sm:h-6 text-arc group-hover:text-[#6E62E5] transition-colors" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-arc mb-2">SSO & 2FA</h3>
              <p className="text-xs sm:text-sm text-arc-muted leading-relaxed">
                Single Sign-On e autenticação de dois fatores
              </p>
            </div>
            <div className="p-5 sm:p-6 rounded-xl border-2 border-arc bg-arc-primary hover:border-[#6E62E5] transition-all group hover:scale-[1.02]">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg border border-arc flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-[#6E62E5] transition-all">
                <Globe className="w-5 sm:w-6 h-5 sm:h-6 text-arc group-hover:text-[#6E62E5] transition-colors" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-arc mb-2">GDPR Compliant</h3>
              <p className="text-xs sm:text-sm text-arc-muted leading-relaxed">100% em conformidade com LGPD e GDPR</p>
            </div>
          </div>

          {/* Stats de confiabilidade */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* This section was not present in the provided updates, so it remains unchanged from the original */}
            <div className="text-center p-5 sm:p-6 rounded-xl border border-arc bg-arc-primary">
              <div className="text-3xl sm:text-4xl font-extrabold text-arc mb-2">99.9%</div>
              <div className="text-xs sm:text-sm text-arc-muted">uptime garantido</div>
            </div>
            <div className="text-center p-5 sm:p-6 rounded-xl border border-arc bg-arc-primary">
              <div className="text-3xl sm:text-4xl font-extrabold text-arc mb-2">&lt;100ms</div>
              <div className="text-xs sm:text-sm text-arc-muted">latência média</div>
            </div>
            <div className="text-center p-5 sm:p-6 rounded-xl border border-arc bg-arc-primary">
              <div className="text-3xl sm:text-4xl font-extrabold text-arc mb-2">24/7</div>
              <div className="text-xs sm:text-sm text-arc-muted">suporte técnico</div>
            </div>
            <div className="text-center p-5 sm:p-6 rounded-xl border border-arc bg-arc-primary">
              <div className="text-3xl sm:text-4xl font-extrabold text-arc mb-2">∞</div>
              <div className="text-xs sm:text-sm text-arc-muted">escalabilidade</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 sm:mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4">
              quem usa, aprova.
            </h2>
            <p className="text-base sm:text-xl text-arc-muted max-w-2xl">
              Desenvolvedores, designers e equipes de produto confiam no arc.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.slice(0, 2).map((testimonial, i) => (
              <div
                key={i}
                className="p-6 sm:p-8 rounded-2xl border-2 border-arc bg-arc-secondary hover:bg-arc-primary transition-all duration-300 group hover:scale-[1.02]"
              >
                <div className="mb-5 sm:mb-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 sm:w-5 h-4 sm:h-5 fill-[#EF4444] text-[#EF4444]" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-arc leading-relaxed mb-4">{testimonial.quote}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-arc bg-arc-primary">
                    <TrendingUp className="w-3 h-3 text-[#EF4444]" />
                    <span className="text-xs font-semibold text-arc">{testimonial.metric}</span>
                  </div>
                </div>
                <div>
                  <div className="font-bold text-arc text-sm sm:text-base">{testimonial.author}</div>
                  <div className="text-xs sm:text-sm text-arc-muted">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final - Pricing */}
      <section id="pricing" className="py-20 sm:py-24 px-4 sm:px-6 border-y border-arc bg-arc-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-arc mb-6 sm:mb-8">
              <Star className="w-4 h-4 text-arc" />
              <span className="text-xs sm:text-sm font-medium text-arc">preços de lançamento</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[0.95]">
              simples. direto. barato.
            </h2>
            <p className="text-base sm:text-xl text-arc-muted mt-3">Pague por mês ou economize no anual. Cancele quando quiser.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {/* Free */}
            <div className="p-6 sm:p-8 rounded-2xl border-2 border-arc bg-arc-primary">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold text-arc">Free</div>
                <Folder className="w-4 h-4 text-arc" />
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-extrabold text-arc">R$ 0</span>
                <span className="text-arc-muted">/ mês</span>
              </div>
              <div className="text-xs text-arc-muted mb-6">ou R$ 0 / ano</div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-arc"><CheckCircle className="w-4 h-4 text-arc" /> 1 workspace</li>
                <li className="flex items-center gap-2 text-sm text-arc"><CheckCircle className="w-4 h-4 text-arc" /> 3 projetos</li>
                <li className="flex items-center gap-2 text-sm text-arc"><CheckCircle className="w-4 h-4 text-arc" /> 100MB de armazenamento</li>
                <li className="flex items-center gap-2 text-sm text-arc"><CheckCircle className="w-4 h-4 text-arc" /> Templates essenciais</li>
              </ul>
              <div className="flex items-center gap-2 text-xs text-arc-muted mb-4">
                <span>Sem cartão</span>
              </div>
              <Link href="/register?plan=free" className="inline-flex items-center justify-center w-full h-11 rounded-lg bg-arc text-arc-primary font-bold text-sm hover:opacity-90 transition-all hover:scale-[1.01] active:scale-[0.99]">
                começar grátis
              </Link>
            </div>

            {/* Individual */}
            <div className="p-6 sm:p-8 rounded-2xl border-2 border-arc bg-arc-primary">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold text-arc">Individual</div>
                <Users className="w-4 h-4 text-arc" />
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-extrabold text-arc">R$ 14</span>
                <span className="text-arc-muted">/ mês</span>
              </div>
              <div className="text-xs text-arc-muted mb-1">ou R$ 140 / ano</div>
              <div className="text-xs text-arc-muted mb-6 inline-flex items-center gap-1"><Percent className="w-3 h-3 text-arc" /> economize ~17% (R$ 11,67/mês)</div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-arc"><CheckCircle className="w-4 h-4 text-arc" /> Projetos ilimitados</li>
                <li className="flex items-center gap-2 text-sm text-arc"><CheckCircle className="w-4 h-4 text-arc" /> 10GB de armazenamento</li>
                <li className="flex items-center gap-2 text-sm text-arc"><CheckCircle className="w-4 h-4 text-arc" /> Recursos avançados</li>
                <li className="flex items-center gap-2 text-sm text-arc"><CheckCircle className="w-4 h-4 text-arc" /> Suporte por email</li>
              </ul>
              <div className="flex items-center gap-2 text-xs text-arc-muted mb-4">
                <CreditCard className="w-4 h-4 text-arc" />
                <QrCode className="w-4 h-4 text-arc" />
                <span>Cartão ou Pix</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/register?plan=individual&billing=monthly" className="inline-flex items-center justify-center h-11 rounded-lg bg-arc text-arc-primary font-bold text-sm hover:opacity-90 transition-all hover:scale-[1.01] active:scale-[0.99]">
                  mensal
                </Link>
                <Link href="/register?plan=individual&billing=annual" className="inline-flex items-center justify-center h-11 rounded-lg border-2 border-arc text-arc font-semibold text-sm hover:bg-arc-secondary transition-all">
                  anual
                </Link>
              </div>
            </div>

            {/* Team */}
            <div className="p-6 sm:p-8 rounded-2xl border-2 border-arc bg-arc-primary">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold text-arc">Team</div>
                <Users className="w-4 h-4 text-arc" />
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-extrabold text-arc">R$ 39</span>
                <span className="text-arc-muted">/ mês</span>
              </div>
              <div className="text-xs text-arc-muted mb-1">ou R$ 390 / ano</div>
              <div className="text-xs text-arc-muted mb-6 inline-flex items-center gap-1"><Percent className="w-3 h-3 text-arc" /> economize ~17% (R$ 32,50/mês)</div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-arc"><CheckCircle className="w-4 h-4 text-arc" /> Até 10 membros</li>
                <li className="flex items-center gap-2 text-sm text-arc"><CheckCircle className="w-4 h-4 text-arc" /> Permissões granulares</li>
                <li className="flex items-center gap-2 text-sm text-arc"><CheckCircle className="w-4 h-4 text-arc" /> 50GB de armazenamento</li>
                <li className="flex items-center gap-2 text-sm text-arc"><CheckCircle className="w-4 h-4 text-arc" /> Suporte prioritário</li>
              </ul>
              <div className="flex items-center gap-2 text-xs text-arc-muted mb-4">
                <CreditCard className="w-4 h-4 text-arc" />
                <QrCode className="w-4 h-4 text-arc" />
                <span>Cartão ou Pix</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/register?plan=team&billing=monthly" className="inline-flex items-center justify-center h-11 rounded-lg bg-arc text-arc-primary font-bold text-sm hover:opacity-90 transition-all hover:scale-[1.01] active:scale-[0.99]">
                  mensal
                </Link>
                <Link href="/register?plan=team&billing=annual" className="inline-flex items-center justify-center h-11 rounded-lg border-2 border-arc text-arc font-semibold text-sm hover:bg-arc-secondary transition-all">
                  anual
                </Link>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-arc-muted text-center mt-6 sm:mt-8 px-4">Sem taxas ocultas. Cancelamento a qualquer momento.</p>
        </div>
      </section>

      {/* Footer minimalista */}
      <footer className="py-10 sm:py-12 px-4 sm:px-6 border-t border-arc">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6 sm:mb-8">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image src="/icon/arclogo.svg" alt="Arc" width={28} height={28} priority />
              <span className="text-lg font-bold text-arc">arc.</span>
            </Link>

            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-xs sm:text-sm text-arc-muted">
              <Link href="/build-in-public" className="hover:text-arc transition-colors">
                Desenvolvido Abertamente
              </Link>
              <Link href="/pricing" className="hover:text-arc transition-colors">
                Preços
              </Link>
              <Link href="/docs" className="hover:text-arc transition-colors">
                Documentação
              </Link>
              <Link href="/privacy" className="hover:text-arc transition-colors">
                Privacidade
              </Link>
              <Link href="/terms" className="hover:text-arc transition-colors">
                Termos
              </Link>
            </div>
          </div>

          <div className="text-center text-xs sm:text-sm text-arc-muted pt-6 sm:pt-8 border-t border-arc">
            <p>© 2025 arc. feito para quem faz acontecer.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
