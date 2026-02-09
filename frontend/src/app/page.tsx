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
import RotatingText from "@/app/components/RotatingText"

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
      quote: "A comunidade é incrível. Sugeriu uma feature na sexta, entrou no roadmap na segunda. Isso é ouvir usuário de verdade.",
      author: "Marina Costa",
      role: "Product Designer",
      metric: "voz que importa",
    },
    {
      quote: "Finalmente encontrei um produto onde posso contribuir. GitHub aberto, roadmap público, comunidade ativa no Discord. Build in public do jeito certo.",
      author: "Pedro Oliveira",
      role: "Lead Developer",
      metric: "transparência total",
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

      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 overflow-hidden">
        {/* Grid pattern de fundo */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        {/* Elementos decorativos */}
        <div className="absolute top-40 right-10 w-72 h-72 bg-arc rounded-full opacity-[0.03] blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-arc rounded-full opacity-[0.02] blur-3xl" />

        <div className="max-w-7xl mx-auto relative w-full py-20">
          <div className="text-center">
            {/* Oferta irresistível com comparação */}
            <div className="flex flex-col items-center gap-4 mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#10b981] text-white font-bold hover:bg-[#059669] transition-colors animate-pulse">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm sm:text-base">
                  PRIMEIROS 1.000 NUNCA PAGAM • RESTAM 153 VAGAS
                </span>
              </div>

              {/* Mini comparação de preços */}
              <div className="flex items-center gap-4 text-xs sm:text-sm">
                <div className="text-arc-muted line-through">Notion: R$ 70/mês</div>
                <div className="text-arc-muted line-through">Asana: R$ 84/mês</div>
                <div className="text-arc font-bold">Arc: R$ 0 (pra sempre)</div>
              </div>
            </div>

            {/* Título com texto rotativo */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.1] mb-6 sm:mb-8 px-4">
              seu workspace de{" "}
              <RotatingText
                words={["projetos.", "equipes.", "ideias.", "metas.", "caos."]}
                className="text-arc"
              />
              <br />
              <span className="text-arc-muted">em 2 minutos.</span>
            </h1>

            {/* Subtítulo mais agressivo */}
            <div className="max-w-4xl mx-auto mb-10 sm:mb-12 px-4">
              <p className="text-xl sm:text-2xl md:text-3xl text-arc font-bold mb-4">
                Menos blá-blá, mais resultado.
              </p>
              <p className="text-base sm:text-lg text-arc-muted leading-relaxed">
                Enquanto você gasta <span className="font-bold text-arc">R$ 840/ano</span> no Notion (e mais R$ 97 em templates),
                aqui você tem <span className="font-bold text-arc">tudo grátis</span>. Pra sempre.
                <br />
                <span className="text-sm sm:text-base mt-2 block">
                  28+ templates prontos • Zero configuração • Velocidade 3x maior
                </span>
              </p>
            </div>

            {/* CTA Principal Melhorado */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-xl bg-arc text-arc-primary font-extrabold text-lg hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-arc/30"
              >
                <Rocket className="w-6 h-6" />
                começar grátis agora
                <ArrowRight className="w-6 h-6" />
              </Link>
              <div className="flex flex-col items-center sm:items-start gap-1">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#EF4444] text-[#EF4444]" />
                  ))}
                </div>
                <span className="text-xs text-arc-muted">2.4k desenvolvedores já escolheram</span>
              </div>
            </div>

            {/* Redutores de risco VISUAIS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-16 sm:mb-20">
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-arc bg-arc-secondary/50">
                <CheckCircle className="w-6 h-6 text-[#10b981]" />
                <span className="font-bold text-arc text-sm">Zero Cartão</span>
                <span className="text-xs text-arc-muted">Só email. Sem pegadinha.</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-arc bg-arc-secondary/50">
                <Zap className="w-6 h-6 text-[#10b981]" />
                <span className="font-bold text-arc text-sm">Pronto em 2min</span>
                <span className="text-xs text-arc-muted">Do cadastro à produção.</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-arc bg-arc-secondary/50">
                <Sparkles className="w-6 h-6 text-[#10b981]" />
                <span className="font-bold text-arc text-sm">Grátis pra Sempre</span>
                <span className="text-xs text-arc-muted">Early adopters nunca pagam.</span>
              </div>
            </div>

            {/* Comece em 3 passos - Visual minimalista */}
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-arc mb-2">
                  comece em 3 passos.
                </h3>
                <p className="text-base sm:text-lg text-arc-muted">
                  Sem ruído. Só resultado. E você faz parte da história.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
                {/* Passo 1 */}
                <div className="group p-6 sm:p-8 rounded-2xl border-2 border-arc bg-arc-secondary hover:bg-arc-primary transition-all duration-300 hover:scale-[1.02]">
                  <div className="w-14 h-14 rounded-xl bg-arc text-arc-primary flex items-center justify-center mb-5 mx-auto font-extrabold text-2xl group-hover:scale-110 transition-transform">
                    1
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <Folder className="w-8 h-8 text-arc" />
                    <div className="text-center">
                      <div className="text-lg font-bold text-arc mb-1">Crie workspace</div>
                      <div className="text-sm text-arc-muted">Pessoal ou equipe</div>
                    </div>
                  </div>
                </div>

                {/* Passo 2 */}
                <div className="group p-6 sm:p-8 rounded-2xl border-2 border-arc bg-arc-secondary hover:bg-arc-primary transition-all duration-300 hover:scale-[1.02]">
                  <div className="w-14 h-14 rounded-xl bg-arc text-arc-primary flex items-center justify-center mb-5 mx-auto font-extrabold text-2xl group-hover:scale-110 transition-transform">
                    2
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <FileText className="w-8 h-8 text-arc" />
                    <div className="text-center">
                      <div className="text-lg font-bold text-arc mb-1">Escolha template</div>
                      <div className="text-sm text-arc-muted">Kanban, Budget, Wiki...</div>
                    </div>
                  </div>
                </div>

                {/* Passo 3 */}
                <div className="group p-6 sm:p-8 rounded-2xl border-2 border-arc bg-arc-secondary hover:bg-arc-primary transition-all duration-300 hover:scale-[1.02]">
                  <div className="w-14 h-14 rounded-xl bg-arc text-arc-primary flex items-center justify-center mb-5 mx-auto font-extrabold text-2xl group-hover:scale-110 transition-transform">
                    3
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <Zap className="w-8 h-8 text-arc" />
                    <div className="text-center">
                      <div className="text-lg font-bold text-arc mb-1">Comece a produzir</div>
                      <div className="text-sm text-arc-muted">Zero fricção</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de confiança com prova social melhorada */}
          <div className="mt-16 sm:mt-20 pt-12 sm:pt-16 border-t border-arc">
            <p className="text-center text-xs sm:text-sm text-arc-muted mb-6 sm:mb-8">
              Construído com a comunidade, para a comunidade
            </p>

            {/* Logos de tipos de usuários - Prova Social */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <div className="flex flex-col items-center gap-3 p-5 rounded-xl border border-arc bg-arc-secondary/50 hover:bg-arc-secondary transition-colors group">
                <div className="w-12 h-12 rounded-lg border border-arc bg-arc-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Code2 className="w-6 h-6 text-arc" />
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-arc">Dev Teams</div>
                  <div className="text-xs text-arc-muted">Sprint • Roadmap • Bugs</div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 p-5 rounded-xl border border-arc bg-arc-secondary/50 hover:bg-arc-secondary transition-colors group">
                <div className="w-12 h-12 rounded-lg border border-arc bg-arc-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Palette className="w-6 h-6 text-arc" />
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-arc">Designers</div>
                  <div className="text-xs text-arc-muted">Portfolio • Calendar</div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 p-5 rounded-xl border border-arc bg-arc-secondary/50 hover:bg-arc-secondary transition-colors group">
                <div className="w-12 h-12 rounded-lg border border-arc bg-arc-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Rocket className="w-6 h-6 text-arc" />
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-arc">Startups</div>
                  <div className="text-xs text-arc-muted">Product • OKRs</div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 p-5 rounded-xl border border-arc bg-arc-secondary/50 hover:bg-arc-secondary transition-colors group">
                <div className="w-12 h-12 rounded-lg border border-arc bg-arc-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-arc" />
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-arc">Freelancers</div>
                  <div className="text-xs text-arc-muted">Projects • Invoices</div>
                </div>
              </div>
            </div>

            {/* Estatísticas sociais */}
            <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 text-xs sm:text-sm text-arc-muted">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#EF4444] fill-[#EF4444]" />
                <span>2.4k stars no GitHub</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#10b981]" />
                <span>Open source • MIT License</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#EF4444]" />
                <span>Pronto em &lt; 2min</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparação de Preços - Destruindo a Concorrência */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-arc-primary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-arc mb-4 sm:mb-6 hover:border-[#EF4444] transition-colors group">
              <TrendingUp className="w-4 h-4 text-[#EF4444]" />
              <span className="text-xs sm:text-sm font-medium text-arc group-hover:text-[#EF4444] transition-colors">
                compare você mesmo
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4">
              eles cobram R$ 70-84/mês.
              <br />
              <span className="text-[#10b981]">nós: R$ 0 (e depois R$ 15).</span>
            </h2>
            <p className="text-base sm:text-xl text-arc-muted max-w-2xl mx-auto mb-8">
              Ferramentas de produtividade viraram máquinas de sugar dinheiro. Chega.
            </p>

            {/* Destaque do Arc ANTES da tabela */}
            <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white mb-12">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Sparkles className="w-6 h-6 animate-pulse" />
                <h3 className="text-2xl sm:text-3xl font-extrabold">Arc é GRÁTIS (pra sempre)</h3>
              </div>
              <p className="text-base sm:text-lg mb-4">
                Early adopters nunca pagam. Quem entrar depois paga apenas <span className="font-extrabold">R$ 15-20/mês</span>
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 rounded-lg bg-white/10">
                  <div className="font-bold">Notion cobra</div>
                  <div className="text-2xl font-extrabold">R$ 70/mês</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/10">
                  <div className="font-bold">Arc cobra</div>
                  <div className="text-2xl font-extrabold">R$ 0-15/mês</div>
                </div>
              </div>
              <p className="text-xs mt-4 opacity-90">
                Nosso preço futuro é quase custo de servidor. Sem margem absurda. Sem exploração.
              </p>
            </div>
          </div>

          {/* Título da tabela */}
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-arc mb-2">
              Comparação detalhada:
            </h3>
            <p className="text-sm text-arc-muted">
              Preços reais (janeiro 2025) • Os da <span className="text-[#EF4444] font-bold">concorrência</span> vs{" "}
              <span className="text-[#10b981] font-bold">Arc</span>
            </p>
          </div>

          {/* Tabela de Comparação */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Notion */}
            <div className="p-6 sm:p-8 rounded-2xl border-2 border-[#EF4444] bg-arc-secondary relative overflow-hidden opacity-75">
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#EF4444] text-white text-xs font-bold">
                CONCORRENTE
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-extrabold text-arc mb-2">Notion</h3>
                <div className="text-4xl font-extrabold text-arc mb-1">R$ 70<span className="text-lg text-arc-muted">/mês</span></div>
                <div className="text-sm text-arc-muted">R$ 840/ano por pessoa</div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <span className="text-[#EF4444] mt-1">✗</span>
                  <span className="text-sm text-arc-muted">Templates pagos à parte (R$ 97+)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#EF4444] mt-1">✗</span>
                  <span className="text-sm text-arc-muted">Lento pra caramba</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#EF4444] mt-1">✗</span>
                  <span className="text-sm text-arc-muted">1 semana pra configurar direito</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#EF4444] mt-1">✗</span>
                  <span className="text-sm text-arc-muted">Limites ridículos no plano básico</span>
                </div>
              </div>
              <div className="text-xs text-arc-muted text-center py-3 px-4 rounded-lg bg-arc-primary/50">
                💸 Gasto em 1 ano: R$ 937+
              </div>
            </div>

            {/* Asana/Monday */}
            <div className="p-6 sm:p-8 rounded-2xl border-2 border-[#EF4444] bg-arc-secondary relative overflow-hidden opacity-75">
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#EF4444] text-white text-xs font-bold">
                CONCORRENTE
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-extrabold text-arc mb-2">Asana</h3>
                <div className="text-4xl font-extrabold text-arc mb-1">R$ 84<span className="text-lg text-arc-muted">/mês</span></div>
                <div className="text-sm text-arc-muted">R$ 1.008/ano por pessoa</div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <span className="text-[#EF4444] mt-1">✗</span>
                  <span className="text-sm text-arc-muted">Interface confusa demais</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#EF4444] mt-1">✗</span>
                  <span className="text-sm text-arc-muted">Features básicas no paywall</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#EF4444] mt-1">✗</span>
                  <span className="text-sm text-arc-muted">Time pequeno paga preço enterprise</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#EF4444] mt-1">✗</span>
                  <span className="text-sm text-arc-muted">Curva de aprendizado brutal</span>
                </div>
              </div>
              <div className="text-xs text-arc-muted text-center py-3 px-4 rounded-lg bg-arc-primary/50">
                💸 Gasto em 1 ano: R$ 1.008
              </div>
            </div>

            {/* Arc */}
            <div className="p-6 sm:p-8 rounded-2xl border-4 border-[#10b981] bg-gradient-to-br from-arc-primary to-arc-secondary relative overflow-hidden shadow-2xl shadow-[#10b981]/30 scale-105">
              <div className="absolute -top-3 -right-3 px-4 py-2 rounded-full bg-[#10b981] text-white text-sm font-extrabold animate-pulse shadow-lg">
                VOCÊ AQUI 👈
              </div>
              <div className="mb-6 mt-4">
                <h3 className="text-2xl font-extrabold text-arc mb-2">Arc</h3>
                <div className="text-5xl font-extrabold text-[#10b981] mb-1">R$ 0<span className="text-lg text-arc-muted">/mês</span></div>
                <div className="text-sm font-bold text-[#10b981]">Grátis pra sempre (beta)</div>
                <div className="text-xs text-arc-muted mt-1">Futuro: R$ 15-20/mês (preço de custo)</div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#10b981] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-arc">28+ templates prontos (grátis)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#10b981] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-arc">3x mais rápido</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#10b981] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-arc">Pronto em 2 minutos</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#10b981] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-arc">Tudo liberado. Sem paywall.</span>
                </div>
              </div>
              <div className="text-xs font-bold text-[#10b981] text-center py-3 px-4 rounded-lg bg-arc-primary border-2 border-[#10b981]">
                💰 Você economiza: R$ 840-1.008/ano
              </div>
            </div>
          </div>

          {/* CTA Pós-Comparação */}
          <div className="text-center">
            <p className="text-sm sm:text-base text-arc-muted mb-4">
              Quer pagar <span className="font-bold text-arc">R$ 840/ano no Notion</span> ou ter{" "}
              <span className="font-bold text-[#10b981]">tudo grátis no Arc</span>?
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-arc text-arc-primary font-bold text-base hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              <Rocket className="w-5 h-5" />
              óbvio que vou pro Arc
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Manifesto */}
          <div className="max-w-4xl mx-auto p-8 sm:p-10 rounded-2xl border-2 border-arc bg-arc-secondary mt-12">
            <div className="text-center mb-6">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-arc mb-3">
                nossa filosofia é simples:
              </h3>
              <p className="text-sm text-arc-muted">
                Chega de ferramenta explorando usuário. Aqui construímos juntos.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Users className="w-6 h-6 text-[#10b981] flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-arc mb-1">Comunidade &gt; Lucro</h4>
                  <p className="text-sm text-arc-muted">
                    Crescemos COM você, não às suas custas. Sua voz importa. Seu voto conta. Você molda o produto.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-arc flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-arc mb-1">Produtividade &gt; Features</h4>
                  <p className="text-sm text-arc-muted">
                    Menos features inúteis. Mais foco no que realmente importa: entregar resultado.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-arc flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-arc mb-1">Transparência &gt; Marketing</h4>
                  <p className="text-sm text-arc-muted">
                    Código aberto, métricas públicas, sem joguinho. Você sabe exatamente o que tá usando.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="w-6 h-6 text-arc flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-arc mb-1">Preço Justo &gt; Exploração</h4>
                  <p className="text-sm text-arc-muted">
                    Quando cobrarmos (no futuro), será 3x mais barato que a concorrência. Promessa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Comunidade */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-y border-arc bg-arc-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-arc mb-4 sm:mb-6 hover:border-[#10b981] transition-colors group">
              <Users className="w-4 h-4 text-[#10b981]" />
              <span className="text-xs sm:text-sm font-medium text-arc group-hover:text-[#10b981] transition-colors">
                open source • build in public
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4">
              construído COM você.
              <br />
              <span className="text-arc-muted">não PARA você.</span>
            </h2>
            <p className="text-base sm:text-xl text-arc-muted max-w-2xl mx-auto">
              Arc não é só uma ferramenta. É uma comunidade construindo o workspace ideal. Juntos.
            </p>
          </div>

          {/* Grid de Comunidade */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Roadmap Público */}
            <div className="p-8 rounded-2xl border-2 border-arc bg-arc-primary hover:border-[#10b981] transition-all group">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#10b981] text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-arc mb-2">Roadmap 100% Público</h3>
                  <p className="text-sm sm:text-base text-arc-muted leading-relaxed">
                    Vote nas features que você quer. Acompanhe o desenvolvimento em tempo real. Sem segredos,
                    sem surpresas. Você decide o que vem por aí.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1.5 rounded-full bg-arc-secondary text-xs font-medium text-arc border border-arc">
                  GitHub Discussions
                </div>
                <div className="px-3 py-1.5 rounded-full bg-arc-secondary text-xs font-medium text-arc border border-arc">
                  Votação de Features
                </div>
                <div className="px-3 py-1.5 rounded-full bg-arc-secondary text-xs font-medium text-arc border border-arc">
                  Updates Semanais
                </div>
              </div>
            </div>

            {/* Discord/Comunidade */}
            <div className="p-8 rounded-2xl border-2 border-arc bg-arc-primary hover:border-[#10b981] transition-all group">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#10b981] text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-arc mb-2">Comunidade Ativa</h3>
                  <p className="text-sm sm:text-base text-arc-muted leading-relaxed">
                    Discord ativo, GitHub aberto, sessões ao vivo. Tire dúvidas, sugira melhorias,
                    compartilhe seus workflows. Aqui ninguém é só número.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1.5 rounded-full bg-arc-secondary text-xs font-medium text-arc border border-arc">
                  Discord Ativo
                </div>
                <div className="px-3 py-1.5 rounded-full bg-arc-secondary text-xs font-medium text-arc border border-arc">
                  GitHub Público
                </div>
                <div className="px-3 py-1.5 rounded-full bg-arc-secondary text-xs font-medium text-arc border border-arc">
                  Live Coding
                </div>
              </div>
            </div>

            {/* Feedback Importa */}
            <div className="p-8 rounded-2xl border-2 border-arc bg-arc-primary hover:border-[#10b981] transition-all group">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#10b981] text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-arc mb-2">Seu Feedback Importa</h3>
                  <p className="text-sm sm:text-base text-arc-muted leading-relaxed">
                    Bugs reportados são consertados em horas, não semanas. Features pedidas pela comunidade
                    vão pro topo da lista. Você molda o produto.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                  <span className="text-arc-muted">Resposta média: &lt; 2h</span>
                </div>
              </div>
            </div>

            {/* Early Adopters são Lendas */}
            <div className="p-8 rounded-2xl border-2 border-arc bg-arc-primary hover:border-[#10b981] transition-all group">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#10b981] text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-arc mb-2">Early Adopters = Lendas</h3>
                  <p className="text-sm sm:text-base text-arc-muted leading-relaxed">
                    Badge especial, nome nos créditos, acesso antecipado a features, canal VIP no Discord.
                    Vocês estão construindo isso com a gente.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1.5 rounded-full bg-[#10b981] text-white text-xs font-bold border border-[#10b981]">
                  🏆 Badge Exclusivo
                </div>
                <div className="px-3 py-1.5 rounded-full bg-arc-secondary text-xs font-medium text-arc border border-arc">
                  Nome nos Créditos
                </div>
                <div className="px-3 py-1.5 rounded-full bg-arc-secondary text-xs font-medium text-arc border border-arc">
                  Canal VIP
                </div>
              </div>
            </div>
          </div>

          {/* Stats da Comunidade */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center p-6 rounded-xl border border-arc bg-arc-primary">
              <div className="text-3xl sm:text-4xl font-extrabold text-arc mb-2">2.4k</div>
              <div className="text-xs sm:text-sm text-arc-muted">Stars no GitHub</div>
            </div>
            <div className="text-center p-6 rounded-xl border border-arc bg-arc-primary">
              <div className="text-3xl sm:text-4xl font-extrabold text-arc mb-2">100%</div>
              <div className="text-xs sm:text-sm text-arc-muted">Open Source</div>
            </div>
            <div className="text-center p-6 rounded-xl border border-arc bg-arc-primary">
              <div className="text-3xl sm:text-4xl font-extrabold text-arc mb-2">12h</div>
              <div className="text-xs sm:text-sm text-arc-muted">Média fix de bugs</div>
            </div>
            <div className="text-center p-6 rounded-xl border border-arc bg-arc-primary">
              <div className="text-3xl sm:text-4xl font-extrabold text-arc mb-2">Semanal</div>
              <div className="text-xs sm:text-sm text-arc-muted">Updates públicos</div>
            </div>
          </div>

          {/* CTA Comunidade */}
          <div className="mt-12 text-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-arc mb-4">
              Quer fazer parte da história?
            </h3>
            <p className="text-base text-arc-muted mb-6 max-w-2xl mx-auto">
              Os primeiros 1.000 usuários vão moldar o futuro do Arc. Seu feedback, suas ideias, seus votos.
              Não é só usar. É construir junto.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-arc text-arc-primary font-bold text-base hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              <Users className="w-5 h-5" />
              entrar pra comunidade
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Vídeo Demo - CRÍTICO para conversão */}
      <section id="demo" className="py-16 sm:py-20 px-4 sm:px-6 border-y border-arc bg-arc-primary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-arc mb-4 sm:mb-6 hover:border-[#EF4444] transition-colors group">
              <Zap className="w-4 h-4 text-[#EF4444]" />
              <span className="text-xs sm:text-sm font-medium text-arc group-hover:text-[#EF4444] transition-colors">
                veja na prática
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4">
              enquanto você configura notion,
              <br />
              <span className="text-arc-muted">nós já entregamos.</span>
            </h2>
            <p className="text-base sm:text-xl text-arc-muted max-w-2xl mx-auto">
              Sério. Cronômetro na mão: 2 minutos do cadastro até produzir de verdade.
            </p>
          </div>

          {/* Video Player - Placeholder para demo real */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-arc bg-arc-secondary shadow-2xl group">
            <div className="aspect-video w-full flex items-center justify-center bg-gradient-to-br from-arc-secondary to-arc-primary relative">
              {/* Placeholder - substituir por vídeo real */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-arc text-arc-primary flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform cursor-pointer shadow-lg">
                    <svg
                      className="w-8 h-8 ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-lg font-bold text-arc">Assista a demonstração completa</p>
                  <p className="text-sm text-arc-muted mt-1">2min • Sem áudio necessário</p>
                </div>
              </div>

              {/* Grid pattern overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000004_1px,transparent_1px),linear-gradient(to_bottom,#00000004_1px,transparent_1px)] bg-[size:2rem_2rem]" />
            </div>

            {/* Video Stats */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-3 bg-arc-primary/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-arc">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
                  <span className="font-medium text-arc">Demonstração ao vivo</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-arc-primary/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-arc">
                <Zap className="w-4 h-4 text-arc" />
                <span className="font-medium text-arc">Setup em 2 minutos</span>
              </div>
            </div>
          </div>

          {/* Benefícios rápidos após o vídeo */}
          <div className="grid sm:grid-cols-3 gap-4 mt-8 sm:mt-10">
            <div className="text-center p-5 rounded-xl border border-arc bg-arc-secondary hover:border-[#EF4444] transition-colors">
              <div className="text-3xl sm:text-4xl font-extrabold text-arc mb-2">2min</div>
              <p className="text-sm text-arc-muted">Do cadastro ao primeiro projeto</p>
            </div>
            <div className="text-center p-5 rounded-xl border border-arc bg-arc-secondary hover:border-[#EF4444] transition-colors">
              <div className="text-3xl sm:text-4xl font-extrabold text-arc mb-2">0</div>
              <p className="text-sm text-arc-muted">Configurações necessárias</p>
            </div>
            <div className="text-center p-5 rounded-xl border border-arc bg-arc-secondary hover:border-[#EF4444] transition-colors">
              <div className="text-3xl sm:text-4xl font-extrabold text-arc mb-2">28+</div>
              <p className="text-sm text-arc-muted">Templates prontos para usar</p>
            </div>
          </div>

          {/* CTA após o vídeo */}
          <div className="text-center mt-10 sm:mt-12">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-arc text-arc-primary font-bold text-base hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              <Rocket className="w-5 h-5" />
              começar agora grátis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-xs text-arc-muted mt-3">Sem cartão de crédito • Pronto em menos de 2min</p>
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
              zero frescura.
              <br />
              <span className="text-arc-muted">100% transparente.</span>
            </h2>
            <p className="text-base sm:text-xl text-arc-muted max-w-2xl mx-auto px-4">
              Código aberto. Métricas públicas. Sem joguinho de marketing.
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
              sem features inúteis.
              <br />
              <span className="text-arc-muted">só o que importa.</span>
            </h2>
            <p className="text-base sm:text-xl text-arc-muted max-w-2xl">
              Cansei de ferramenta que faz café. Aqui é direto: organiza, executa, entrega.
            </p>
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

      {/* CTA Intermediário - Após Features */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 sm:p-12 rounded-2xl border-2 border-arc bg-gradient-to-br from-arc-primary to-arc-secondary text-center">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-arc mb-4">
              cansou de perder tempo?
            </h3>
            <p className="text-base sm:text-lg text-arc-muted mb-6 sm:mb-8">
              Enquanto você lê isso, alguém já criou um workspace e tá produzindo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-arc text-arc-primary font-bold text-base hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                <Rocket className="w-5 h-5" />
                criar workspace grátis
                <ArrowRight className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2 text-sm text-arc-muted">
                <CheckCircle className="w-4 h-4 text-[#10b981]" />
                <span>Sem cartão • 100% grátis</span>
              </div>
            </div>
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
              chega de template pago.
              <br />
              <span className="text-arc-muted">28+ de graça.</span>
            </h2>
            <p className="text-base sm:text-xl text-arc-muted max-w-2xl mx-auto px-4">
              Enquanto você gasta R$ 97 num template do Notion, aqui tem 28+ prontos. De graça. Sempre.
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
              presets prontos.
              <br />
              <span className="text-arc-muted">só escolher e sair usando.</span>
            </h2>
            <p className="text-base sm:text-xl text-arc-muted max-w-2xl">
              10 presets completos. 4-5 páginas cada. Literalmente clica e já era.
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
              seus dados.
              <br />
              <span className="text-arc-muted">nossas mãos não.</span>
            </h2>
            <p className="text-base sm:text-xl text-arc-muted max-w-2xl mx-auto px-4">
              Criptografia E2E, código open source, compliance total. Não vendemos seus dados. Nunca.
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
              eles migraram.
              <br />
              <span className="text-arc-muted">você é o próximo?</span>
            </h2>
            <p className="text-base sm:text-xl text-arc-muted max-w-2xl">
              Galera que cansou de Notion lento, Trello limitado e Asana confuso.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, i) => (
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

      {/* CTA Final - Beta Gratuita */}
      <section id="pricing" className="py-20 sm:py-24 px-4 sm:px-6 border-y border-arc bg-arc-secondary">
        <div className="max-w-6xl mx-auto">
          {/* Banner de urgência/escassez */}
          <div className="mb-10 sm:mb-12 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-5 h-5 animate-pulse" />
              <span className="text-lg sm:text-xl font-extrabold">ÚLTIMA CHAMADA BETA</span>
            </div>
            <p className="text-sm sm:text-base opacity-90">
              Primeiros 1.000 usuários nunca pagam. Literalmente. Restam <span className="font-bold">153 vagas.</span>
            </p>
          </div>

          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-arc mb-6 sm:mb-8 bg-arc-primary">
              <Star className="w-4 h-4 text-arc" />
              <span className="text-xs sm:text-sm font-bold text-arc">BETA • 100% GRÁTIS • ZERO FRESCURA</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[0.95]">
              R$ 588/ano?
              <br />
              <span className="text-arc-muted">não nesta vida.</span>
            </h2>
            <p className="text-base sm:text-xl text-arc-muted mt-3 max-w-2xl mx-auto">
              Early adopters <span className="font-bold text-arc">nunca pagam</span>. Quando lançarmos os planos, você mantém tudo grátis. Pra sempre.
              <br />
              <span className="text-sm mt-3 block">
                (E pros que entrarem depois? Preço justo: <span className="font-bold text-arc">R$ 15-20/mês</span>. 3x mais barato que a concorrência.)
              </span>
              <br />
              Sem cartão. Sem trial fake. Sem exploração.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Beta Plan - Destaque único */}
            <div className="p-8 sm:p-12 rounded-2xl border-2 border-arc bg-arc-primary shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-extrabold text-arc">Plano Beta</div>
                  <span className="px-3 py-1 rounded-full bg-arc text-arc-primary text-xs font-bold">GRÁTIS</span>
                </div>
                <Sparkles className="w-6 h-6 text-arc" />
              </div>

              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-6xl sm:text-7xl font-extrabold text-arc">R$ 0</span>
                <span className="text-xl text-arc-muted">durante toda a beta</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mb-8">
                <div className="flex items-center gap-2 text-sm sm:text-base text-arc">
                  <CheckCircle className="w-5 h-5 text-arc flex-shrink-0" />
                  <span className="font-medium">Workspaces ilimitados</span>
                </div>
                <div className="flex items-center gap-2 text-sm sm:text-base text-arc">
                  <CheckCircle className="w-5 h-5 text-arc flex-shrink-0" />
                  <span className="font-medium">Projetos ilimitados</span>
                </div>
                <div className="flex items-center gap-2 text-sm sm:text-base text-arc">
                  <CheckCircle className="w-5 h-5 text-arc flex-shrink-0" />
                  <span className="font-medium">Todos os templates</span>
                </div>
                <div className="flex items-center gap-2 text-sm sm:text-base text-arc">
                  <CheckCircle className="w-5 h-5 text-arc flex-shrink-0" />
                  <span className="font-medium">Colaboração em equipe</span>
                </div>
                <div className="flex items-center gap-2 text-sm sm:text-base text-arc">
                  <CheckCircle className="w-5 h-5 text-arc flex-shrink-0" />
                  <span className="font-medium">Análises avançadas</span>
                </div>
                <div className="flex items-center gap-2 text-sm sm:text-base text-arc">
                  <CheckCircle className="w-5 h-5 text-arc flex-shrink-0" />
                  <span className="font-medium">Armazenamento generoso</span>
                </div>
                <div className="flex items-center gap-2 text-sm sm:text-base text-arc">
                  <CheckCircle className="w-5 h-5 text-arc flex-shrink-0" />
                  <span className="font-medium">Suporte prioritário</span>
                </div>
                <div className="flex items-center gap-2 text-sm sm:text-base text-arc">
                  <CheckCircle className="w-5 h-5 text-arc flex-shrink-0" />
                  <span className="font-medium">Badge exclusivo de beta tester</span>
                </div>
              </div>

              <div className="bg-arc-secondary border border-arc rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-arc flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-arc mb-1">Por que tá de graça?</p>
                    <p className="text-xs sm:text-sm text-arc-muted leading-relaxed">
                      Beta = grátis pra sempre pros early adopters. Simples. Você nos ajuda a crescer,
                      nós te damos tudo grátis. Sem renovação, sem pegadinha. Pra vida.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/register"
                className="inline-flex items-center justify-center w-full h-16 rounded-xl bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white font-extrabold text-lg hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-[#EF4444]/30"
              >
                <Rocket className="w-6 h-6 mr-2" />
                GARANTIR MINHA VAGA GRÁTIS AGORA
                <ArrowRight className="w-6 h-6 ml-2" />
              </Link>

              <div className="mt-4 text-center">
                <p className="text-sm font-bold text-arc mb-2">
                  ⚡ Última chance de garantir benefícios vitalícios
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-arc-muted">
                  <CheckCircle className="w-4 h-4 text-[#10b981]" />
                  <span>Restam apenas 153 vagas para early adopters</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-arc-muted text-center mt-8 px-4">
            ✓ Zero cartão • ✓ Pronto em 2min • ✓ Cancele quando quiser (mas é grátis, então... 🤷)
          </p>
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
