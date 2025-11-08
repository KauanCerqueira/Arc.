"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useWorkspaceStore } from "@/core/store/workspaceStore"
import {
  Briefcase,
  Users,
  Rocket,
  GraduationCap,
  Heart,
  Home,
  Sparkles,
  ChevronRight,
  Check,
  ArrowLeft,
  Folder,
  ListChecks,
  Calendar,
  FileText,
  Image,
  Code,
  Zap,
  X
} from "lucide-react"
import { Button } from "@/shared/components/ui/Button"
import { Badge } from "@/shared/components/ui/Badge"

interface WorkspaceTemplate {
  id: string
  name: string
  description: string
  icon: any
  color: string
  groups: {
    name: string
    icon: string
    color: string
    pages: {
      name: string
      template: string
    }[]
  }[]
}

const workspaceTemplates: WorkspaceTemplate[] = [
  {
    id: "blank",
    name: "Workspace em Branco",
    description: "Comece do zero e construa seu workspace do seu jeito",
    icon: Sparkles,
    color: "from-gray-500 to-gray-700",
    groups: []
  },
  {
    id: "business",
    name: "Negócios",
    description: "Perfeito para empresas e equipes corporativas",
    icon: Briefcase,
    color: "from-blue-500 to-blue-700",
    groups: [
      {
        name: "Projetos",
        icon: "briefcase",
        color: "#0ea5e9",
        pages: [
          { name: "Roadmap 2024", template: "kanban" },
          { name: "Tarefas da Semana", template: "tasks" },
          { name: "Documentos", template: "documents" }
        ]
      },
      {
        name: "Equipe",
        icon: "users",
        color: "#8b5cf6",
        pages: [
          { name: "Calendário de Reuniões", template: "calendar" },
          { name: "OKRs", template: "table" },
          { name: "Onboarding", template: "documents" }
        ]
      },
      {
        name: "Recursos",
        icon: "folder",
        color: "#f59e0b",
        pages: [
          { name: "Links Úteis", template: "links" },
          { name: "Templates", template: "documents" }
        ]
      }
    ]
  },
  {
    id: "startup",
    name: "Startup",
    description: "Para startups em crescimento acelerado",
    icon: Rocket,
    color: "from-purple-500 to-pink-600",
    groups: [
      {
        name: "Produto",
        icon: "rocket",
        color: "#8b5cf6",
        pages: [
          { name: "Product Roadmap", template: "kanban" },
          { name: "Backlog", template: "tasks" },
          { name: "User Stories", template: "table" },
          { name: "Métricas", template: "analytics" }
        ]
      },
      {
        name: "Marketing",
        icon: "tag",
        color: "#d946ef",
        pages: [
          { name: "Campanhas", template: "kanban" },
          { name: "Conteúdo", template: "calendar" },
          { name: "Analytics", template: "analytics" }
        ]
      },
      {
        name: "Vendas",
        icon: "briefcase",
        color: "#10b981",
        pages: [
          { name: "Pipeline", template: "kanban" },
          { name: "Leads", template: "table" },
          { name: "Metas", template: "tasks" }
        ]
      }
    ]
  },
  {
    id: "education",
    name: "Educação",
    description: "Ideal para escolas, cursos e estudantes",
    icon: GraduationCap,
    color: "from-green-500 to-emerald-700",
    groups: [
      {
        name: "Disciplinas",
        icon: "briefcase",
        color: "#10b981",
        pages: [
          { name: "Matemática", template: "documents" },
          { name: "Português", template: "documents" },
          { name: "Inglês", template: "documents" }
        ]
      },
      {
        name: "Tarefas",
        icon: "list",
        color: "#f59e0b",
        pages: [
          { name: "Trabalhos Pendentes", template: "tasks" },
          { name: "Provas", template: "calendar" }
        ]
      },
      {
        name: "Recursos",
        icon: "folder",
        color: "#0ea5e9",
        pages: [
          { name: "Materiais de Estudo", template: "documents" },
          { name: "Links Úteis", template: "links" }
        ]
      }
    ]
  },
  {
    id: "personal",
    name: "Pessoal",
    description: "Para organizar sua vida pessoal e projetos",
    icon: Home,
    color: "from-orange-500 to-red-600",
    groups: [
      {
        name: "Vida Pessoal",
        icon: "star",
        color: "#f59e0b",
        pages: [
          { name: "Diário", template: "documents" },
          { name: "Metas 2024", template: "tasks" },
          { name: "Hábitos", template: "table" }
        ]
      },
      {
        name: "Finanças",
        icon: "briefcase",
        color: "#10b981",
        pages: [
          { name: "Orçamento Mensal", template: "table" },
          { name: "Investimentos", template: "analytics" }
        ]
      },
      {
        name: "Projetos",
        icon: "rocket",
        color: "#8b5cf6",
        pages: [
          { name: "Side Projects", template: "kanban" },
          { name: "Ideias", template: "documents" }
        ]
      }
    ]
  },
  {
    id: "creative",
    name: "Criativo",
    description: "Para designers, criadores de conteúdo e artistas",
    icon: Heart,
    color: "from-pink-500 to-rose-600",
    groups: [
      {
        name: "Projetos Criativos",
        icon: "briefcase",
        color: "#d946ef",
        pages: [
          { name: "Portfolio", template: "gallery" },
          { name: "Em Andamento", template: "kanban" },
          { name: "Inspirações", template: "gallery" }
        ]
      },
      {
        name: "Conteúdo",
        icon: "calendar",
        color: "#f59e0b",
        pages: [
          { name: "Calendário Editorial", template: "calendar" },
          { name: "Ideias de Posts", template: "documents" },
          { name: "Analytics", template: "analytics" }
        ]
      },
      {
        name: "Recursos",
        icon: "folder",
        color: "#0ea5e9",
        pages: [
          { name: "Assets", template: "documents" },
          { name: "Ferramentas", template: "links" }
        ]
      }
    ]
  }
]

export default function CreateWorkspacePage() {
  const router = useRouter()
  const { createWorkspace, addGroup, addGroupFromPreset, addPage } = useWorkspaceStore()

  const [step, setStep] = useState<"template" | "details" | "members">("template")
  const [selectedTemplate, setSelectedTemplate] = useState<WorkspaceTemplate | null>(null)

  // Details
  const [workspaceName, setWorkspaceName] = useState("")
  const [workspaceDescription, setWorkspaceDescription] = useState("")

  // Members
  const [inviteEmails, setInviteEmails] = useState<string[]>([])
  const [currentEmail, setCurrentEmail] = useState("")

  const handleSelectTemplate = (template: WorkspaceTemplate) => {
    setSelectedTemplate(template)
    setWorkspaceName(template.name)
    setStep("details")
  }

  const handleAddEmail = () => {
    if (currentEmail && currentEmail.includes("@")) {
      setInviteEmails([...inviteEmails, currentEmail])
      setCurrentEmail("")
    }
  }

  const handleRemoveEmail = (email: string) => {
    setInviteEmails(inviteEmails.filter(e => e !== email))
  }

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim() || !selectedTemplate) return

    // Criar workspace
    const workspaceId = await createWorkspace(workspaceName)

    if (workspaceId && selectedTemplate.groups.length > 0) {
      // Criar grupos e páginas do template
      for (const groupData of selectedTemplate.groups) {
        const groupId = await addGroup(groupData.name)

        if (groupId) {
          // Criar páginas do grupo
          for (const pageData of groupData.pages) {
            await addPage(groupId, pageData.name, pageData.template as any)
          }
        }
      }
    }

    // Redirecionar para o workspace
    router.push("/workspace")
  }

  return (
    <div className="min-h-screen bg-arc-primary">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => {
              if (step === "details") setStep("template")
              else if (step === "members") setStep("details")
              else router.push("/workspace")
            }}
            className="flex items-center gap-2 text-arc-muted hover:text-arc mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          <h1 className="text-3xl font-bold text-arc mb-2">Criar Novo Workspace</h1>
          <p className="text-arc-muted">Configure seu workspace em poucos passos</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
              step === "template" ? "bg-purple-500 text-white" : "bg-purple-500 text-white"
            }`}>
              {step !== "template" ? <Check className="w-5 h-5" /> : "1"}
            </div>
            <span className={`text-sm font-medium ${step === "template" ? "text-arc" : "text-arc-muted"}`}>
              Template
            </span>
          </div>

          <ChevronRight className="w-5 h-5 text-arc-muted" />

          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
              step === "details" ? "bg-purple-500 text-white" :
              step === "members" ? "bg-purple-500 text-white" :
              "bg-gray-200 dark:bg-slate-800 text-arc-muted"
            }`}>
              {step === "members" ? <Check className="w-5 h-5" /> : "2"}
            </div>
            <span className={`text-sm font-medium ${step === "details" ? "text-arc" : "text-arc-muted"}`}>
              Detalhes
            </span>
          </div>

          <ChevronRight className="w-5 h-5 text-arc-muted" />

          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
              step === "members" ? "bg-purple-500 text-white" : "bg-gray-200 dark:bg-slate-800 text-arc-muted"
            }`}>
              3
            </div>
            <span className={`text-sm font-medium ${step === "members" ? "text-arc" : "text-arc-muted"}`}>
              Membros
            </span>
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-5xl mx-auto">
          {/* Template Selection */}
          {step === "template" && (
            <div>
              <h2 className="text-2xl font-semibold text-arc mb-6 text-center">
                Escolha um template para começar
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workspaceTemplates.map((template) => {
                  const Icon = template.icon
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="group bg-arc-secondary border-2 border-arc hover:border-purple-500 rounded-xl p-6 text-left transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                    >
                      <div className={`w-16 h-16 bg-gradient-to-br ${template.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      <h3 className="text-lg font-semibold text-arc mb-2">{template.name}</h3>
                      <p className="text-sm text-arc-muted mb-4">{template.description}</p>

                      {template.groups.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-arc-muted">
                          <Folder className="w-3 h-3" />
                          <span>{template.groups.length} grupos pré-configurados</span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Workspace Details */}
          {step === "details" && selectedTemplate && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-arc mb-6 text-center">
                Personalize seu workspace
              </h2>

              <div className="bg-arc-secondary border border-arc rounded-xl p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-arc mb-2">
                    Nome do Workspace *
                  </label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full px-4 py-3 bg-arc-primary border border-arc rounded-lg text-arc focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Minha Empresa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-arc mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={workspaceDescription}
                    onChange={(e) => setWorkspaceDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-arc-primary border border-arc rounded-lg text-arc focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                    rows={3}
                    placeholder="Descreva o propósito deste workspace..."
                  />
                </div>

                {selectedTemplate.groups.length > 0 && (
                  <div className="pt-6 border-t border-arc">
                    <h3 className="font-semibold text-arc mb-4">O que será criado:</h3>

                    <div className="space-y-3">
                      {selectedTemplate.groups.map((group, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-arc-primary border border-arc rounded-lg">
                          <Folder className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" style={{ color: group.color }} />
                          <div className="flex-1">
                            <div className="font-medium text-arc text-sm">{group.name}</div>
                            <div className="text-xs text-arc-muted mt-1">
                              {group.pages.length} páginas: {group.pages.map(p => p.name).join(", ")}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setStep("template")} className="flex-1">
                    Voltar
                  </Button>
                  <Button
                    onClick={() => setStep("members")}
                    disabled={!workspaceName.trim()}
                    className="flex-1"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Invite Members */}
          {step === "members" && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-arc mb-2 text-center">
                Convide membros para o workspace
              </h2>
              <p className="text-arc-muted text-center mb-8">Você pode pular e convidar depois</p>

              <div className="bg-arc-secondary border border-arc rounded-xl p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-arc mb-2">
                    Email dos membros
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={currentEmail}
                      onChange={(e) => setCurrentEmail(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddEmail()}
                      className="flex-1 px-4 py-3 bg-arc-primary border border-arc rounded-lg text-arc focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="email@exemplo.com"
                    />
                    <Button onClick={handleAddEmail}>Adicionar</Button>
                  </div>
                </div>

                {inviteEmails.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-arc mb-3">
                      Membros convidados ({inviteEmails.length})
                    </div>
                    <div className="space-y-2">
                      {inviteEmails.map((email, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-arc-primary border border-arc rounded-lg"
                        >
                          <span className="text-sm text-arc">{email}</span>
                          <button
                            onClick={() => handleRemoveEmail(email)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setStep("details")} className="flex-1">
                    Voltar
                  </Button>
                  <Button onClick={handleCreateWorkspace} className="flex-1">
                    <Check className="w-4 h-4 mr-2" />
                    Criar Workspace
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
