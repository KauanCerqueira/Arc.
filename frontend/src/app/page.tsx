"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef } from "react"
import {
  ArrowRight,
  Zap,
  Shield,
  Users,
  Folder,
  Target,
  Code2,
  BarChart3,
  Rocket,
  GitBranch,
  Globe,
  Heart,
  Github,
  MessageCircle,
  Layout,
  CheckCircle,
  Timer,
  Wallet,
  BookOpen,
  Dumbbell,
  FileText,
  BarChart2,
  Brain,
  Bug,
  Table2,
  FolderKanban,
  Map,
  Repeat,
  Clock,
  StickyNote,
  File,
  Columns3,
  Calendar,
  Linkedin,
  Mail,
  Server,
  Database,
  HardDrive,
  Coffee,
} from "lucide-react"

import RotatingText from "@/app/components/RotatingText"

/* ─── template data (mirrors TemplatesShowcase.tsx) ─── */
const templateCards = [
  { id: "kanban", icon: Columns3, name: "kanban.", desc: "sprints, bugs e fluxo contínuo." },
  { id: "tasks", icon: CheckCircle, name: "tasks.", desc: "to-dos, checklists e backlog." },
  { id: "calendar", icon: Calendar, name: "calendar.", desc: "prazos, entregas e agenda." },
  { id: "focus", icon: Timer, name: "focus.", desc: "pomodoro e blocos de tempo." },
  { id: "budget", icon: Wallet, name: "budget.", desc: "controle financeiro e saldo." },
  { id: "study", icon: BookOpen, name: "study.", desc: "trilhas e revisões espaçadas." },
  { id: "workout", icon: Dumbbell, name: "workout.", desc: "treinos, séries e evolução." },
  { id: "wiki", icon: FileText, name: "wiki.", desc: "docs, onboarding e padrões." },
  { id: "dashboard", icon: BarChart2, name: "dashboard.", desc: "KPIs, gráficos e alertas." },
  { id: "mindmap", icon: Brain, name: "mindmap.", desc: "brainstorm e mapa de ideias." },
  { id: "bugs", icon: Bug, name: "bugs.", desc: "issues, prioridade e SLA." },
  { id: "table", icon: Table2, name: "table.", desc: "dados, filtros e inventários." },
  { id: "projects", icon: FolderKanban, name: "projects.", desc: "OKRs, escopo e status." },
  { id: "roadmap", icon: Map, name: "roadmap.", desc: "marcos, quarters e releases." },
  { id: "sprint", icon: Repeat, name: "sprint.", desc: "metas, capacidade e retro." },
  { id: "timeline", icon: Clock, name: "timeline.", desc: "log diário e decisões." },
  { id: "notes", icon: StickyNote, name: "notes.", desc: "rascunhos e atas." },
  { id: "documents", icon: File, name: "documents.", desc: "contratos e materiais." },
]

const features = [
  {
    icon: Folder,
    title: "workspaces colaborativos.",
    desc: "múltiplos espaços. convites seguros. permissões granulares.",
    detail: "owner / admin / member / viewer",
  },
  {
    icon: Shield,
    title: "controle total.",
    desc: "4 níveis de acesso. quem vê, quem edita, quem administra.",
    detail: "segurança por design",
  },
  {
    icon: Target,
    title: "templates especializados.",
    desc: "kanban, budget, study, workout. 18+ prontos para uso.",
    detail: "zero configuração",
  },
  {
    icon: Zap,
    title: "velocidade extrema.",
    desc: "comece em segundos. sem tutorial. sem fricção.",
    detail: "load < 200ms",
  },
  {
    icon: Code2,
    title: "open source.",
    desc: "código aberto no GitHub. roadmap público. transparência total.",
    detail: "MIT license",
  },
  {
    icon: Globe,
    title: "comunidade ativa.",
    desc: "discord, PRs, feedback direto. construído por quem usa.",
    detail: "build in public",
  },
]

const testimonials = [
  {
    quote: "migrei toda a equipe do Notion. a velocidade e simplicidade do arc são incomparáveis.",
    author: "lucas silva",
    role: "CTO @ TechStartup",
    metric: "3x mais rápido",
  },
  {
    quote: "a comunidade é incrível. sugeri uma feature na sexta, entrou no roadmap na segunda.",
    author: "marina costa",
    role: "Product Designer",
    metric: "voz que importa",
  },
  {
    quote: "finalmente posso contribuir. GitHub aberto, roadmap público, discord ativo. build in public do jeito certo.",
    author: "pedro oliveira",
    role: "Lead Developer",
    metric: "transparência total",
  },
]

const steps = [
  { n: "01", title: "crie.", desc: "workspace pronto em 10 segundos. sem cadastro longo." },
  { n: "02", title: "escolha.", desc: "18+ templates prontos. kanban, budget, wiki, sprint." },
  { n: "03", title: "convide.", desc: "compartilhe link. 4 níveis de permissão. controle total." },
  { n: "04", title: "entregue.", desc: "dashboards, timelines e métricas. sem planilha." },
]

export default function Home() {
  const spotlightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const grid = spotlightRef.current
    if (!grid) return
    const handler = (e: MouseEvent) => {
      const rect = grid.getBoundingClientRect()
      grid.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`)
      grid.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`)
    }
    grid.addEventListener("mousemove", handler)
    return () => grid.removeEventListener("mousemove", handler)
  }, [])

  return (
    <div className="min-h-screen bg-arc-primary text-arc relative">
      {/* ── Global background layers ── */}
      <div className="fixed inset-0 pointer-events-none z-0 technical-grid" />
      <div className="fixed inset-0 pointer-events-none z-0 structure-lines mx-auto border-x border-arc">
        <div className="absolute left-1/4 h-full w-px" />
        <div className="absolute left-2/4 h-full w-px" />
        <div className="absolute left-3/4 h-full w-px" />
      </div>

      {/* ═══════════════════════════════════
          NAVBAR — glassmorphic floating pill
      ═══════════════════════════════════ */}
      <div className="fixed z-50 flex w-full top-4 sm:top-6 px-4 sm:px-6 justify-center">
        <nav className="flex items-center backdrop-blur-xl bg-arc-secondary/40 border border-arc/50 rounded-full px-2 sm:px-3 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] gap-1 sm:gap-2">
          {/* Center nav links */}
          <div className="hidden md:flex items-center gap-0.5">
            {[
              { href: "#features", label: "features" },
              { href: "#templates", label: "templates" },
              { href: "#community", label: "comunidade" },
              { href: "/open", label: "custos abertos" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-4 py-1.5 rounded-full text-[12px] text-arc-muted hover:text-arc hover:bg-arc-primary/50 font-medium transition-all tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: social icons + CTA */}
          <div className="flex items-center gap-1 sm:gap-2">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hidden lg:flex w-8 h-8 items-center justify-center rounded-full text-arc-muted hover:text-arc hover:bg-arc-primary/50 transition-all" aria-label="GitHub">
              <Github className="w-4 h-4" strokeWidth={1.5} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hidden lg:flex w-8 h-8 items-center justify-center rounded-full text-arc-muted hover:text-arc hover:bg-arc-primary/50 transition-all" aria-label="LinkedIn">
              <Linkedin className="w-4 h-4" strokeWidth={1.5} />
            </a>
            <div className="hidden lg:block h-4 w-px bg-arc/20 mx-1" />
            <Link
              href="/register"
              className="inline-flex items-center h-8 sm:h-9 px-4 sm:px-5 rounded-full bg-arc text-arc-primary font-bold text-xs tracking-tight hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              começar grátis
            </Link>
          </div>
        </nav>
      </div>

      <main className="relative z-10">
        {/* ═══════════════════════════════════
            HERO
        ═══════════════════════════════════ */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-20 sm:pb-32 pt-24 sm:pt-28 border-b border-arc">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text */}
            <div>
              {/* Status badge — simplified */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 border border-[#6E62E5]/30 rounded-full bg-[#6E62E5]/5 reveal">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6E62E5] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6E62E5]" />
                </span>
                <span className="text-[10px] font-mono text-[#6E62E5] tracking-widest">
                  open source
                </span>
              </div>

              {/* Headline */}
              <h1 className="reveal reveal-d1 text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tighter leading-[0.92] mb-6 sm:mb-8">
                seu workspace de{" "}
                <RotatingText
                  words={["projetos.", "equipes.", "ideias.", "metas.", "caos."]}
                  className="text-arc"
                />
              </h1>

              <p className="text-base sm:text-lg text-arc-muted max-w-lg leading-relaxed font-light mb-8 reveal reveal-d2">
                gestão de projetos open source. 18+ templates, comunidade ativa e custos 100% transparentes.
              </p>

              {/* CTA row */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-5 reveal reveal-d3">
                <Link
                  href="/register"
                  className="group relative px-7 py-3.5 bg-arc text-arc-primary text-sm font-bold tracking-tight overflow-hidden hover:opacity-90 transition-all magnetic-btn shadow-lg rounded-xl"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    criar workspace
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 px-5 py-3.5 border border-arc rounded-xl text-sm text-arc-muted hover:text-arc hover:border-[#6E62E5]/40 transition-all"
                >
                  <Github className="w-4 h-4" strokeWidth={1.5} />
                  ver código
                </a>
              </div>

              {/* Metrics strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-arc reveal reveal-d4">
                {[
                  { value: "18+", label: "templates" },
                  { value: "R$0", label: "para sempre" },
                  { value: "133+", label: "componentes" },
                  { value: "MIT", label: "license" },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="text-xl sm:text-2xl font-mono font-bold text-arc">{m.value}</div>
                    <div className="text-[10px] sm:text-xs text-arc-muted mt-1">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Floating glass cards visual */}
            <div className="hidden lg:flex relative h-[500px] items-center justify-center">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#6E62E5]/5 via-transparent to-transparent rounded-3xl" />

              {/* Card stack — simulating the app UI */}
              <div className="relative w-full max-w-[420px] mx-auto">
                {/* Card 1: Kanban preview */}
                <div className="absolute top-0 left-0 w-[320px] bg-arc-secondary border border-arc rounded-2xl p-5 shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-500 z-30">
                  <div className="flex items-center gap-2 mb-4">
                    <Columns3 className="w-4 h-4 text-[#6E62E5]" strokeWidth={1.5} />
                    <span className="text-xs font-mono font-bold text-arc">kanban.</span>
                  </div>
                  <div className="flex gap-2">
                    {["a fazer", "fazendo", "pronto"].map((col) => (
                      <div key={col} className="flex-1 rounded-lg bg-arc-primary/60 p-2">
                        <div className="text-[9px] font-mono text-arc-muted mb-2">{col}</div>
                        <div className="space-y-1.5">
                          <div className="h-6 rounded bg-arc-primary border border-arc" />
                          <div className="h-6 rounded bg-arc-primary border border-arc" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 2: Budget preview */}
                <div className="absolute top-24 right-0 w-[280px] bg-arc-secondary border border-arc rounded-2xl p-5 shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-500 z-20">
                  <div className="flex items-center gap-2 mb-4">
                    <Wallet className="w-4 h-4 text-[#10b981]" strokeWidth={1.5} />
                    <span className="text-xs font-mono font-bold text-arc">budget.</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-arc-muted">receita</span>
                      <span className="text-xs font-mono text-[#10b981]">R$ 4.200</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-arc-primary">
                      <div className="h-full w-3/4 rounded-full bg-[#10b981]" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-arc-muted">despesas</span>
                      <span className="text-xs font-mono text-[#EB5757]">R$ 2.800</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-arc-primary">
                      <div className="h-full w-1/2 rounded-full bg-[#EB5757]" />
                    </div>
                  </div>
                </div>

                {/* Card 3: Status badge */}
                <div className="absolute bottom-8 left-8 w-[200px] bg-arc text-arc-primary border border-arc rounded-2xl p-4 shadow-xl transform -rotate-1 hover:rotate-0 transition-transform duration-500 z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                    <span className="text-[10px] font-mono tracking-widest opacity-70">online agora</span>
                  </div>
                  <div className="text-2xl font-bold font-mono">42</div>
                  <div className="text-[10px] font-mono opacity-60">workspaces ativos.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            MARQUEE — tool logos
        ═══════════════════════════════════ */}
        <div className="border-b border-arc bg-arc-secondary/30 py-4 sm:py-6">
          <div className="max-w-[1400px] mx-auto overflow-hidden marquee-mask">
            <div className="marquee-track opacity-30 hover:opacity-60 transition-opacity items-center text-arc">
              {["Next.js", "React", "TypeScript", "Tailwind", "Supabase", "PostgreSQL", "Docker", "Vercel", "GitHub", "Discord",
                "Next.js", "React", "TypeScript", "Tailwind", "Supabase", "PostgreSQL", "Docker", "Vercel", "GitHub", "Discord"
              ].map((name, i) => (
                <span key={i} className="text-xs sm:text-sm font-mono whitespace-nowrap tracking-wider">{name}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════
            FEATURES — spotlight bento grid
        ═══════════════════════════════════ */}
        <section id="features" className="border-b border-arc bg-arc-primary py-16 sm:py-24 relative">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-20 gap-4">
              <div>
                <div className="text-[10px] font-mono text-arc-muted mb-3 sm:mb-4 tracking-widest">
                  01 — capabilities
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-arc max-w-2xl leading-[1.05]">
                  tudo que você precisa.{" "}
                  <span className="text-arc-muted">nada que não precisa.</span>
                </h2>
              </div>
              <div className="hidden md:block text-right">
                <div className="text-[10px] font-mono text-arc-muted mb-1 tracking-widest">architecture</div>
                <div className="text-arc font-mono text-sm">v1.0</div>
              </div>
            </div>

            {/* Bento grid */}
            <div ref={spotlightRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-arc-border border border-arc overflow-hidden spotlight-grid rounded-2xl">
              {features.map((f, i) => {
                const Icon = f.icon
                return (
                  <div key={f.title} className="group bg-arc-primary p-6 sm:p-8 lg:p-10 hover:bg-arc-secondary transition-colors relative spotlight-card">
                    {/* Top accent line on hover */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#6E62E5]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="mb-6 sm:mb-8 text-arc-muted group-hover:text-[#6E62E5] transition-colors">
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-arc mb-4 sm:mb-6">{f.title}</h3>
                    <p className="text-xs sm:text-sm text-arc-muted leading-relaxed mb-3 sm:mb-4">{f.desc}</p>
                    <div className="text-[10px] font-mono text-arc-muted tracking-widest border-t border-arc pt-3 sm:pt-4">
                      {f.detail}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            TEMPLATES WALL — The Substrate
        ═══════════════════════════════════ */}
        <section id="templates" className="relative bg-arc-primary border-b border-arc overflow-hidden">
          <div className="max-w-[1400px] mx-auto relative z-10 flex flex-col md:flex-row min-h-[700px] sm:min-h-[850px]">
            {/* Left: text content */}
            <div className="w-full md:w-[42%] px-4 sm:px-6 py-16 sm:py-24 md:py-32 flex flex-col justify-center relative z-20">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-[#6E62E5]/30 rounded-full bg-[#6E62E5]/5 self-start">
                <div className="w-1.5 h-1.5 bg-[#6E62E5] rounded-full status-pulse" />
                <span className="text-[10px] font-mono text-[#6E62E5] tracking-widest">
                  02 — templates
                </span>
              </div>

              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-arc mb-6 sm:mb-8 leading-[0.92]">
                18+ templates.
                <br />
                <span className="text-arc-muted">zero config.</span>
              </h2>

              <div className="space-y-6 sm:space-y-8 max-w-sm">
                <p className="text-arc-muted text-sm sm:text-base lg:text-lg font-light leading-relaxed">
                  cada template resolve um problema real. kanban para sprints, budget para finanças, wiki para documentação. pronto para usar em segundos.
                </p>

                <div className="flex flex-col gap-3 sm:gap-4">
                  {[
                    { icon: Layout, label: "gestão visual.", detail: "kanban / calendar / dashboard" },
                    { icon: Wallet, label: "controle financeiro.", detail: "budget / table / projects" },
                    { icon: BookOpen, label: "conhecimento.", detail: "wiki / notes / documents" },
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.label} className="flex items-center gap-3 sm:gap-4 group cursor-default">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-arc bg-arc-secondary flex items-center justify-center group-hover:border-[#6E62E5]/30 transition-all flex-shrink-0">
                          <Icon className="w-4 h-4 text-arc-muted group-hover:text-[#6E62E5] transition-colors" strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="text-arc text-xs sm:text-sm font-medium">{item.label}</div>
                          <div className="text-[10px] text-arc-muted font-mono tracking-wider">{item.detail}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="pt-4 sm:pt-8">
                  <Link href="/register" className="shiny-cta inline-flex items-center min-h-0">
                    <span>usar templates</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: 3D wall */}
            <div className="hidden md:block absolute right-[-5%] top-[-10%] bottom-[-10%] w-[65%] wall-container overflow-hidden pointer-events-none">
              <div className="wall-grid h-full w-full flex gap-5 px-8">
                {/* Column 1 — scroll up */}
                <div className="wall-col-up flex flex-col gap-5 w-full">
                  {[...templateCards.slice(0, 6), ...templateCards.slice(0, 6)].map((t, i) => {
                    const Icon = t.icon
                    return (
                      <div key={`${t.id}-a-${i}`} className="wall-card rounded-xl p-5 aspect-[4/3] flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <Icon className="w-6 h-6 text-arc" strokeWidth={1.5} />
                          <div className="w-1.5 h-1.5 rounded-full bg-[#6E62E5] shadow-[0_0_8px_#6E62E5]" />
                        </div>
                        <div>
                          <div className="text-sm font-mono text-arc">{t.name}</div>
                          <div className="text-[9px] font-mono text-arc-muted">{t.desc}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Column 2 — scroll down */}
                <div className="wall-col-down flex flex-col gap-5 w-full pt-12">
                  {[...templateCards.slice(6, 12), ...templateCards.slice(6, 12)].map((t, i) => {
                    const Icon = t.icon
                    return (
                      <div key={`${t.id}-b-${i}`} className="wall-card rounded-xl p-5 aspect-[4/3] flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <Icon className="w-6 h-6 text-arc" strokeWidth={1.5} />
                          <div className="w-1.5 h-1.5 rounded-full bg-[#6E62E5] shadow-[0_0_8px_#6E62E5]" />
                        </div>
                        <div>
                          <div className="text-sm font-mono text-arc">{t.name}</div>
                          <div className="text-[9px] font-mono text-arc-muted">{t.desc}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Column 3 — scroll up */}
                <div className="wall-col-up flex flex-col gap-5 w-full pt-24 hidden lg:flex">
                  {[...templateCards.slice(12, 18), ...templateCards.slice(12, 18)].map((t, i) => {
                    const Icon = t.icon
                    return (
                      <div key={`${t.id}-c-${i}`} className="wall-card rounded-xl p-5 aspect-[4/3] flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <Icon className="w-6 h-6 text-arc" strokeWidth={1.5} />
                          <div className="w-1.5 h-1.5 rounded-full bg-[#6E62E5] shadow-[0_0_8px_#6E62E5]" />
                        </div>
                        <div>
                          <div className="text-sm font-mono text-arc">{t.name}</div>
                          <div className="text-[9px] font-mono text-arc-muted">{t.desc}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Masking gradients */}
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)] via-transparent to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)] via-transparent to-[var(--bg-primary)] z-10 pointer-events-none opacity-60" />
            </div>

            {/* Mobile: horizontal scroll */}
            <div className="md:hidden px-4 pb-12 overflow-x-auto scrollbar-hide">
              <div className="flex gap-4" style={{ width: "max-content" }}>
                {templateCards.slice(0, 8).map((t) => {
                  const Icon = t.icon
                  return (
                    <div key={t.id} className="w-[200px] flex-shrink-0 border border-arc rounded-xl p-4 bg-arc-secondary">
                      <Icon className="w-5 h-5 text-[#6E62E5] mb-3" strokeWidth={1.5} />
                      <div className="text-sm font-mono font-bold text-arc">{t.name}</div>
                      <div className="text-[11px] text-arc-muted mt-1">{t.desc}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            PIPELINE — How it works
        ═══════════════════════════════════ */}
        <section className="border-b border-arc bg-arc-primary py-16 sm:py-24 lg:py-32 overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="text-[10px] font-mono text-arc-muted mb-10 sm:mb-12 tracking-widest">
              03 — pipeline
            </div>

            <div className="relative mt-8 sm:mt-16 lg:mt-20">
              {/* Connecting line — desktop only */}
              <div className="hidden md:block absolute top-[27px] left-0 w-full h-px bg-arc-border z-0" />
              <div className="hidden md:block absolute top-[27px] left-0 w-1/4 h-px bg-gradient-to-r from-transparent via-[#6E62E5]/40 to-transparent z-0 pipeline-shimmer" />

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 relative z-10">
                {steps.map((s) => (
                  <div key={s.n} className="group hover:-translate-y-1 transition-transform duration-300 cursor-default">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-arc-secondary border border-arc rounded-full flex items-center justify-center mb-6 sm:mb-8 group-hover:border-[#6E62E5]/50 transition-colors relative shadow-sm">
                      <span className="text-xs sm:text-sm font-mono text-arc">{s.n}</span>
                      {s.n === "04" && (
                        <div className="absolute w-2 h-2 bg-[#10b981] rounded-full top-0 right-0 animate-pulse" />
                      )}
                    </div>
                    <h4 className="text-lg sm:text-xl text-arc font-bold mb-2 sm:mb-3">{s.title}</h4>
                    <p className="text-xs sm:text-sm text-arc-muted leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            TESTIMONIALS
        ═══════════════════════════════════ */}
        <section className="border-b border-arc bg-arc-primary py-16 sm:py-20 relative">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="text-[10px] font-mono text-arc-muted mb-10 sm:mb-16 tracking-widest flex items-center gap-2">
              <span className="w-1 h-1 bg-[#6E62E5] rounded-full status-pulse" />
              04 — comunidade
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className="p-6 sm:p-8 border border-arc bg-arc-secondary rounded-2xl hover:bg-arc-primary transition-colors group relative">
                  <div className="text-2xl sm:text-3xl text-arc-muted/20 mb-3 sm:mb-4 font-serif">&ldquo;</div>
                  <p className="text-arc-muted text-xs sm:text-sm mb-5 sm:mb-6 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-arc text-xs font-bold">{t.author}</div>
                      <div className="text-[10px] text-arc-muted font-mono">{t.role}</div>
                    </div>
                    <div className="px-2 py-1 border border-arc rounded-full text-[9px] font-mono text-arc-muted">
                      {t.metric}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            COMMUNITY & OPEN SOURCE
        ═══════════════════════════════════ */}
        <section id="community" className="py-16 sm:py-24 lg:py-32 bg-arc-primary border-b border-arc relative">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-16 lg:mb-20 border-b border-arc pb-8 sm:pb-10 gap-4">
              <div>
                <div className="text-[10px] font-mono text-arc-muted mb-3 sm:mb-4 tracking-widest">
                  05 — open source
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-arc">
                  feito pela comunidade.
                  <br />
                  <span className="text-arc-muted">para a comunidade.</span>
                </h2>
              </div>
              <p className="text-arc-muted text-xs sm:text-sm max-w-sm md:text-right">
                não esperamos lucro. esperamos impacto.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Card 1: Contribute */}
              <div className="group border border-arc p-6 sm:p-8 lg:p-10 bg-arc-secondary hover:bg-arc-primary transition-all duration-500 relative overflow-hidden rounded-2xl">
                <div className="absolute top-0 right-0 p-3 sm:p-4">
                  <Github className="w-6 h-6 sm:w-8 sm:h-8 text-arc opacity-20 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                </div>
                <div className="mb-8 sm:mb-12">
                  <h3 className="text-xl sm:text-2xl font-bold text-arc mb-2">contribute.</h3>
                  <p className="text-xs sm:text-sm text-arc-muted">código aberto. PRs welcome.</p>
                </div>
                <div className="grid grid-cols-2 gap-y-3 sm:gap-y-4 mb-8 sm:mb-12">
                  {["MIT license", "roadmap público", "issues abertas", "code review"].map((item) => (
                    <div key={item} className="text-xs sm:text-sm text-arc-muted flex items-center gap-2">
                      <div className="w-1 h-1 bg-arc rounded-full flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-full py-3 border border-arc text-[11px] font-mono tracking-widest text-arc-muted hover:text-arc hover:border-[#6E62E5] transition-colors rounded-lg flex items-center justify-center gap-2">
                  <Github className="w-3 h-3" />
                  ver no GitHub
                </a>
              </div>

              {/* Card 2: Community — highlighted */}
              <div className="group border border-arc p-6 sm:p-8 lg:p-10 bg-arc text-arc-primary transition-all duration-500 relative overflow-hidden rounded-2xl shadow-2xl">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-arc-primary border border-arc rounded-full shadow-sm">
                  <span className="text-[10px] font-mono text-arc tracking-widest">ativo</span>
                </div>
                <div className="absolute top-0 right-0 p-3 sm:p-4">
                  <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-arc-primary opacity-20 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                </div>
                <div className="mb-8 sm:mb-12">
                  <h3 className="text-xl sm:text-2xl font-bold text-arc-primary mb-2">community.</h3>
                  <p className="text-xs sm:text-sm text-arc-primary/70">troca de ideias. suporte real.</p>
                </div>
                <div className="grid grid-cols-2 gap-y-3 sm:gap-y-4 mb-8 sm:mb-12">
                  {["Discord ativo", "feedback direto", "feature requests", "build in public"].map((item) => (
                    <div key={item} className="text-xs sm:text-sm text-arc-primary/80 flex items-center gap-2">
                      <div className="w-1 h-1 bg-arc-primary rounded-full flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
                <button className="w-full py-3 bg-arc-primary text-arc text-[11px] font-bold tracking-widest hover:opacity-90 transition-colors rounded-lg">
                  entrar no Discord
                </button>
              </div>

              {/* Card 3: Sponsor */}
              <div className="group border border-arc p-6 sm:p-8 lg:p-10 bg-arc-secondary hover:bg-arc-primary transition-all duration-500 relative overflow-hidden rounded-2xl sm:col-span-2 lg:col-span-1">
                <div className="absolute top-0 right-0 p-3 sm:p-4">
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-arc opacity-20 group-hover:opacity-100 group-hover:text-[#EB5757] transition-all" strokeWidth={1.5} />
                </div>
                <div className="mb-8 sm:mb-12">
                  <h3 className="text-xl sm:text-2xl font-bold text-arc mb-2">sponsor.</h3>
                  <p className="text-xs sm:text-sm text-arc-muted">ajude a manter o projeto vivo.</p>
                </div>
                <div className="grid grid-cols-2 gap-y-3 sm:gap-y-4 mb-8 sm:mb-12">
                  {["sem anúncios", "sem data selling", "indie project", "coffee money"].map((item) => (
                    <div key={item} className="text-xs sm:text-sm text-arc-muted flex items-center gap-2">
                      <div className="w-1 h-1 bg-arc rounded-full flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
                <button className="w-full py-3 border border-arc text-[11px] font-mono tracking-widest text-arc-muted hover:text-arc hover:border-[#EB5757] transition-colors rounded-lg flex items-center justify-center gap-2">
                  <Heart className="w-3 h-3" />
                  apoiar projeto
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            FAQ
        ═══════════════════════════════════ */}
        <section className="border-b border-arc bg-arc-primary py-16 sm:py-24 lg:py-32 relative">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
              <div className="lg:col-span-4">
                <div className="text-[10px] font-mono text-arc-muted mb-3 sm:mb-4 tracking-widest">06 — faq</div>
                <h2 className="text-3xl sm:text-4xl text-arc font-bold tracking-tight mb-4 sm:mb-6">
                  dúvidas
                  <br />
                  frequentes.
                </h2>
                <p className="text-xs sm:text-sm text-arc-muted max-w-xs leading-relaxed">
                  respostas diretas para as perguntas mais comuns.
                </p>
              </div>
              <div className="lg:col-span-8 border-t border-arc">
                {[
                  { q: "arc é mesmo 100% grátis?", a: "sim. arc é open source e sempre será gratuito. sem trial, sem plano pago escondido. o código é aberto e você pode hospedar onde quiser." },
                  { q: "posso usar para meu time?", a: "sim. workspaces colaborativos com 4 níveis de permissão (owner, admin, member, viewer). convide por link e gerencie acessos." },
                  { q: "quais templates estão disponíveis?", a: "18+ templates prontos: kanban, tasks, calendar, focus, budget, study, workout, wiki, dashboard, mindmap, bugs, table, projects, roadmap, sprint, timeline, notes e documents." },
                  { q: "como posso contribuir?", a: "o repositório é aberto no GitHub. PRs são bem-vindos. temos issues marcadas como 'good first issue' para quem está começando. participe também no Discord." },
                ].map((item, i) => (
                  <details key={i} className="group border-b border-arc">
                    <summary className="flex justify-between items-center py-4 sm:py-6 cursor-pointer list-none outline-none">
                      <span className="text-arc font-medium tracking-tight text-sm sm:text-base">{item.q}</span>
                      <span className="text-arc-muted font-mono text-xs group-open:rotate-45 transition-transform duration-300 flex-shrink-0 ml-4">+</span>
                    </summary>
                    <div className="pb-4 sm:pb-6 text-arc-muted text-xs sm:text-sm leading-relaxed max-w-2xl">
                      <p>{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            TRANSPARENT COSTS — "custo aberto"
        ═══════════════════════════════════ */}
        <section className="py-16 sm:py-24 lg:py-32 bg-arc-primary border-b border-arc relative">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="relative z-10 w-full bg-arc text-arc-primary border border-arc rounded-2xl sm:rounded-3xl overflow-hidden isolate shadow-2xl">
              {/* Background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#6E62E5]/10 rounded-full blur-[100px] pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2">
                {/* Left: The message */}
                <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
                  <div className="text-[10px] font-mono text-arc-primary/40 mb-4 sm:mb-6 tracking-widest">
                    07 — transparência
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter text-arc-primary mb-4 sm:mb-6 leading-[0.92]">
                    custo aberto.
                    <br />
                    <span className="text-[#6E62E5]">lucro zero.</span>
                  </h2>
                  <p className="text-arc-primary/50 text-sm sm:text-base leading-relaxed max-w-md mb-8 sm:mb-10">
                    isso é quanto custa manter o arc no ar todo mês. sem esconder nada.
                    se quiser ajudar, ótimo. se não, apenas use.
                  </p>

                  <div className="flex flex-wrap items-center gap-4">
                    <Link href="/register" className="group px-7 py-3.5 bg-arc-primary text-arc text-sm font-bold tracking-tight rounded-xl hover:opacity-90 transition-all magnetic-btn">
                      <span className="flex items-center gap-2">
                        apenas usar
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Link>
                    <button className="group flex items-center gap-2 px-5 py-3.5 border border-arc-primary/20 rounded-xl text-sm text-arc-primary/70 hover:text-arc-primary hover:border-[#EB5757]/40 transition-all">
                      <Heart className="w-4 h-4 group-hover:text-[#EB5757] transition-colors" strokeWidth={1.5} />
                      ajudar a dividir a conta
                    </button>
                  </div>
                </div>

                {/* Right: Cost breakdown */}
                <div className="p-8 sm:p-12 lg:p-16 border-t lg:border-t-0 lg:border-l border-arc-primary/10">
                  <div className="space-y-5">
                    {[
                      { icon: Server, label: "servidor (VPS)", cost: "R$ 45", detail: "2 vCPU / 4GB RAM" },
                      { icon: Database, label: "banco de dados", cost: "R$ 0", detail: "PostgreSQL self-hosted" },
                      { icon: Globe, label: "domínio + DNS", cost: "R$ 8", detail: ".dev / Cloudflare" },
                      { icon: HardDrive, label: "storage / CDN", cost: "R$ 0", detail: "Vercel (free tier)" },
                      { icon: Coffee, label: "café do dev", cost: "R$ 30", detail: "essencial." },
                    ].map((item) => {
                      const Icon = item.icon
                      return (
                        <div key={item.label} className="flex items-center justify-between group">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-9 h-9 rounded-lg bg-arc-primary/10 flex items-center justify-center">
                              <Icon className="w-4 h-4 text-arc-primary/50 group-hover:text-[#6E62E5] transition-colors" strokeWidth={1.5} />
                            </div>
                            <div>
                              <div className="text-sm text-arc-primary font-medium">{item.label}</div>
                              <div className="text-[10px] font-mono text-arc-primary/40">{item.detail}</div>
                            </div>
                          </div>
                          <div className="text-sm font-mono font-bold text-arc-primary">{item.cost}</div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Total */}
                  <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-arc-primary/10 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-arc-primary/40 font-mono tracking-widest">custo total / mês</div>
                      <div className="text-[10px] text-arc-primary/30 font-mono">receita: R$ 0</div>
                    </div>
                    <div className="text-3xl sm:text-4xl font-mono font-bold text-arc-primary">
                      R$ 83
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            FOOTER
        ═══════════════════════════════════ */}
        <footer className="bg-arc-primary pt-16 sm:pt-24 lg:pt-32 pb-8 sm:pb-12 border-t border-arc">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            {/* Top: brand + tagline */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-16 lg:mb-20 gap-6 sm:gap-8">
              <div>
                <div className="text-[14vw] sm:text-[10vw] md:text-[7vw] leading-[0.85] font-extrabold tracking-tighter text-arc opacity-90 select-none cursor-default">
                  arc.
                </div>
                <p className="text-sm sm:text-base text-arc-muted mt-2 sm:mt-3 max-w-sm">
                  mantido por pessoas, não por empresas.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:gap-4 md:text-right">
                <Link href="/register" className="group text-base sm:text-lg text-arc hover:text-[#6E62E5] transition-colors font-medium flex items-center gap-2 md:justify-end">
                  criar workspace
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <p className="text-xs sm:text-sm text-arc-muted max-w-xs">
                  código, café e comunidade. é tudo que precisa.
                </p>
              </div>
            </div>

            {/* Link matrix — 5 columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8 border-t border-arc pt-8 sm:pt-10">
              <div>
                <h4 className="text-[10px] font-mono text-arc-muted mb-3 sm:mb-4 tracking-widest">produto</h4>
                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-arc-muted">
                  <li><Link href="#features" className="hover:text-arc transition-colors">features</Link></li>
                  <li><Link href="#templates" className="hover:text-arc transition-colors">templates</Link></li>
                  <li><Link href="/open" className="hover:text-arc transition-colors">custos abertos</Link></li>
                  <li><Link href="#" className="hover:text-arc transition-colors">changelog</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] font-mono text-arc-muted mb-3 sm:mb-4 tracking-widest">comunidade</h4>
                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-arc-muted">
                  <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-arc transition-colors">GitHub</a></li>
                  <li><a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className="hover:text-arc transition-colors">Discord</a></li>
                  <li><Link href="#community" className="hover:text-arc transition-colors">contribuir</Link></li>
                  <li><button className="hover:text-arc transition-colors text-left">sponsor</button></li>
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] font-mono text-arc-muted mb-3 sm:mb-4 tracking-widest">social</h4>
                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-arc-muted">
                  <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-arc transition-colors">Twitter / X</a></li>
                  <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-arc transition-colors">LinkedIn</a></li>
                  <li><a href="mailto:contato@arc.dev" className="hover:text-arc transition-colors">contato</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] font-mono text-arc-muted mb-3 sm:mb-4 tracking-widest">legal</h4>
                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-arc-muted">
                  <li><Link href="#" className="hover:text-arc transition-colors">privacidade</Link></li>
                  <li><Link href="#" className="hover:text-arc transition-colors">termos</Link></li>
                  <li><Link href="#" className="hover:text-arc transition-colors">MIT license</Link></li>
                </ul>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <h4 className="text-[10px] font-mono text-arc-muted mb-3 sm:mb-4 tracking-widest">status</h4>
                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-arc-muted">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#10b981] rounded-full status-pulse" />
                    sistema online
                  </li>
                  <li>custos: R$ 83/mês</li>
                  <li>receita: R$ 0</li>
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-arc flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-[10px] font-mono text-arc-muted tracking-widest">
                © 2025 arc. software livre, como deve ser.
              </p>
              <div className="flex items-center gap-4">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-arc-muted hover:text-arc transition-colors">
                  <Github className="w-4 h-4" strokeWidth={1.5} />
                </a>
                <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className="text-arc-muted hover:text-arc transition-colors">
                  <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-arc-muted hover:text-arc transition-colors">
                  <Linkedin className="w-4 h-4" strokeWidth={1.5} />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
