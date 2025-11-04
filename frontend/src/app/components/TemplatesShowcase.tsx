"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { pageTemplates } from "@/app/(workspace)/components/constants/pageTemplates"

type Chip = {
  id: string
  label: string
}

// Ordem e rótulos iguais aos chips do hero
const chips: Chip[] = [
  { id: "kanban", label: "Kanban" },
  { id: "tasks", label: "Tasks" },
  { id: "calendar", label: "Calendar" },
  { id: "focus", label: "Focus" },
  { id: "budget", label: "Budget" },
  { id: "study", label: "Study" },
  { id: "workout", label: "Workout" },
  { id: "wiki", label: "Wiki" },
  { id: "dashboard", label: "Dashboard" },
  { id: "mindmap", label: "MindMap" },
  { id: "bugs", label: "Bugs" },
  { id: "table", label: "Table" },
  { id: "projects", label: "Projects" },
  { id: "roadmap", label: "Roadmap" },
  { id: "sprint", label: "Sprint" },
  { id: "timeline", label: "Timeline" },
  { id: "notes", label: "Notes" },
  { id: "documents", label: "Documents" },
]

function getTemplateData(id: string) {
  return pageTemplates.find((t) => t.id === id)
}

export default function TemplatesShowcase() {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const computePosition = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect()
    const width = 320
    const padding = 16
    let left = rect.left + rect.width / 2 - width / 2
    const maxLeft = window.innerWidth - width - padding
    if (left < padding) left = padding
    if (left > maxLeft) left = maxLeft
    const estimatedHeight = 180
    // Prefer abrir abaixo; se no couber, abre acima
    let top = rect.bottom + 12
    if (top + estimatedHeight > window.innerHeight - padding) {
      top = Math.max(padding, rect.top - estimatedHeight - 12)
    }
    setPos({ top, left })
  }

  const onChipClick = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget as HTMLElement
    setAnchorEl(el)
    computePosition(el)
    setSelectedId(id)
    setOpen(true)
  }

  // Reposiciona enquanto rola / redimensiona para acompanhar o boto
  useEffect(() => {
    if (!open || !anchorEl) return
    const handle = () => computePosition(anchorEl)
    handle()
    window.addEventListener('scroll', handle, true)
    window.addEventListener('resize', handle)
    return () => {
      window.removeEventListener('scroll', handle, true)
      window.removeEventListener('resize', handle)
    }
  }, [open, anchorEl])

  const selected = selectedId ? getTemplateData(selectedId) : null
  const SelectedIcon = selected?.iconComponent

  const details: Record<string, { intro: string; bullets: string[] }> = {
    kanban: {
      intro: "Quadro visual para acompanhar tarefas em colunas (a fazer → fazendo → pronto). Ótimo para fluxo contínuo.",
      bullets: [
        "Sprints, bugs e tarefas do dia",
        "Visão por responsável e por status",
        "WIP e limites de coluna",
      ],
    },
    tasks: {
      intro: "Lista simples com prioridade, responsáveis e datas. Enxuta para controles pessoais e checklists.",
      bullets: ["To‑dos diários", "Checklists operacionais", "Backlog rápido"],
    },
    calendar: {
      intro: "Agenda visual para compromissos, entregas e marcos. Sincroniza metas por período.",
      bullets: ["Reuniões e prazos", "Entregas por semana", "Planejamento mensal"],
    },
    focus: {
      intro: "Modo foco com Pomodoro e blocos de concentração. Minimize distrações e acompanhe sessões.",
      bullets: ["Blocos de 25/50 min", "Logs de foco", "Metas de horas"],
    },
    budget: {
      intro: "Controle de orçamento geral: entradas, saídas e saldo por categoria.",
      bullets: ["Planejamento de gastos", "Relatórios rápidos", "Categorias personalizadas"],
    },
    study: {
      intro: "Organize matérias, conteúdos e revisões. Acompanhe progresso e cronograma de estudos.",
      bullets: ["Trilhas de estudo", "Progresso por tema", "Revisões espaçadas"],
    },
    workout: {
      intro: "Planeje treinos, séries e cargas. Registre evolução por grupo muscular.",
      bullets: ["Rotinas semanais", "Carga e repetições", "Histórico de PR"],
    },
    wiki: {
      intro: "Base de conhecimento viva para times. Documente processos, decisões e padrões.",
      bullets: ["Padrões de engenharia", "Onboarding", "FAQ interno"],
    },
    dashboard: {
      intro: "Painel com métricas chaves e gráficos. Uma visão de saúde do projeto/negócio.",
      bullets: ["KPIs atualizados", "Visão executiva", "Alertas simples"],
    },
    mindmap: {
      intro: "Mapa mental para brainstorm e organização de ideias de forma visual.",
      bullets: ["Ideação", "Estrutura de conteúdos", "Exploração de temas"],
    },
    bugs: {
      intro: "Rastreador de bugs e issues com status, prioridade e responsável.",
      bullets: ["Pipeline de correção", "SLA simples", "Integração com sprints"],
    },
    table: {
      intro: "Tabela estilo planilha para dados estruturados e filtros rápidos.",
      bullets: ["Inventários", "Listas mestras", "Catálogos"],
    },
    projects: {
      intro: "Visão macro de projetos, objetivos e entregas. Acompanhe escopo e status.",
      bullets: ["OKRs simples", "Status semanal", "Riscos e bloqueios"],
    },
    roadmap: {
      intro: "Cronograma de alto nível com fases e marcos. Alinha produto e operações.",
      bullets: ["Quarter planning", "Marcos de release", "Dependências"],
    },
    sprint: {
      intro: "Planejamento ágil de sprints com metas, tarefas e retrospectiva.",
      bullets: ["Meta da sprint", "Capacidade do time", "Review/retro"],
    },
    timeline: {
      intro: "Linha do tempo para eventos e histórico. Ótimo para logs de projeto e comunicação.",
      bullets: ["Log diário", "Histórico de decisões", "Eventos chave"],
    },
    notes: {
      intro: "Notas rápidas com formatação mínima. Ideal para rascunhos e reuniões.",
      bullets: ["Ata de reunião", "Ideias soltas", "Anotações pessoais"],
    },
    documents: {
      intro: "Repositório de documentos e arquivos com organização simples.",
      bullets: ["Contratos e PDFs", "Propostas", "Materiais de apoio"],
    },
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {chips.map((chip) => (
          <div
            key={chip.id}
            onClick={(e) => onChipClick(chip.id, e)}
            className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-full border-2 border-arc bg-arc-secondary hover:bg-arc hover:text-arc-primary text-arc font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 touch-manipulation"
          >
            {chip.label}
          </div>
        ))}
      </div>

      {open && selected && (
        <>
          {/* overlay para fechar */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          {/* popover */}
          <div
            className="fixed z-50 w-[320px] rounded-xl border-2 border-arc bg-arc-primary shadow-2xl"
            style={{ top: pos.top, left: pos.left }}
            role="dialog"
            aria-modal="true"
          >
            <div className="p-4 flex items-start gap-3">
              {SelectedIcon && (
                <div className="w-9 h-9 rounded-lg border border-arc bg-arc-secondary flex items-center justify-center flex-shrink-0">
                  <SelectedIcon className="w-4 h-4 text-arc" />
                </div>
              )}
              <div>
                <div className="text-sm font-bold text-arc">{selected.name}</div>
                <div className="text-xs text-arc-muted mt-0.5">{details[selected.id]?.intro || selected.description}</div>
              </div>
            </div>

            <div className="px-4 pb-3">
              {details[selected.id]?.bullets?.length ? (
                <ul className="list-disc list-inside space-y-1 text-xs text-arc-muted">
                  {details[selected.id].bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="px-4 pb-4">
              <Link
                href={`/register?template=${selected.id}`}
                className="inline-flex items-center justify-center w-full h-9 rounded-lg bg-arc text-arc-primary font-bold text-xs hover:opacity-90 transition-all hover:scale-[1.01] active:scale-95"
              >
                usar este template
              </Link>

              <div className="mt-3 flex items-center justify-between text-[11px] text-arc-muted">
                <span>Categoria: {selected.category}</span>
                <button onClick={() => setOpen(false)} className="underline hover:text-arc">fechar</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
