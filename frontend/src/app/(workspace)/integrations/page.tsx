"use client"

import { useState } from "react"
import {
  Check,
  ExternalLink,
  Calendar,
  Mail,
  FileText,
  CheckSquare,
  Github,
  GitPullRequest,
  GitBranch,
  GitCommit,
  Settings,
  Zap,
  RefreshCw,
  Shield,
  AlertCircle,
  Workflow,
  Loader2,
  Sparkles,
  Globe,
  Link as LinkIcon,
  Activity
} from "lucide-react"
import GoogleIntegration from "./components/GoogleIntegration"
import GitHubIntegration from "./components/GitHubIntegration"
import AutomationCard from "./components/AutomationCard"
import AutomationSettingsModal from "./components/AutomationSettingsModal"
import { useAvailableAutomations, useUserAutomations, useAutomationStats } from "@/core/hooks/useAutomations"
import { AutomationDto, AutomationDefinitionDto } from "@/core/types/automation.types"

export default function IntegrationsPage() {
  const [mainTab, setMainTab] = useState<"integrations" | "automations">("integrations")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedAutomation, setSelectedAutomation] = useState<{
    definition: AutomationDefinitionDto;
    automation?: AutomationDto;
  } | null>(null)

  // Queries para automações
  const { data: availableAutomations, isLoading: loadingAvailable } = useAvailableAutomations()
  const { data: userAutomations, isLoading: loadingUser } = useUserAutomations()
  const { data: automationStats } = useAutomationStats()

  const integrations = [
    {
      id: "google",
      name: "Google Workspace",
      description: "Sincronize tarefas, calendários e documentos com o Google",
      icon: "https://www.gstatic.com/images/branding/product/2x/google_workspace_96dp.png",
      category: "productivity",
      status: "available",
      features: ["Calendar", "Tasks", "Drive", "Docs", "Sheets", "Gmail"],
      component: GoogleIntegration
    },
    {
      id: "github",
      name: "GitHub",
      description: "Integre issues, pull requests e repositórios",
      icon: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
      category: "development",
      status: "available",
      features: ["Issues", "Pull Requests", "Repositories", "Commits"],
      component: GitHubIntegration
    },
    {
      id: "slack",
      name: "Slack",
      description: "Receba notificações e crie tarefas via Slack",
      icon: "https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png",
      category: "communication",
      status: "coming-soon",
      features: ["Notifications", "Commands", "Channels"]
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Conecte com 8.000+ aplicativos via automação",
      icon: "https://cdn.zapier.com/storage/services/6cf3f5a0c8491f21c2c4c3cbb9c4f4c4.png",
      category: "automation",
      status: "coming-soon",
      features: ["Webhooks", "Triggers", "Actions"]
    }
  ]

  const filteredIntegrations = activeTab === "all"
    ? integrations
    : integrations.filter(i => i.category === activeTab)

  const availableIntegrations = integrations.filter(i => i.status === "available")
  const comingSoonCount = integrations.filter(i => i.status === "coming-soon").length

  // Combina automações disponíveis com configuradas
  const automationsWithConfig = (availableAutomations || []).map((definition) => {
    const userAutomation = (userAutomations || []).find(
      (ua) => ua.automationType === definition.type
    )
    return { definition, automation: userAutomation }
  })

  const handleConfigureAutomation = (definition: AutomationDefinitionDto, automation?: AutomationDto) => {
    setSelectedAutomation({ definition, automation })
  }

  const handleCloseModal = () => {
    setSelectedAutomation(null)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8 lg:py-12">

        {/* HERO SECTION */}
        <div className="mb-12 lg:mb-16">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-full">
                conectividade
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-gray-900 dark:text-white mb-6">
              Conecte tudo.<br />Automatize tudo.
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
              Integre suas ferramentas favoritas e crie automações poderosas para otimizar seu fluxo de trabalho.
            </p>
          </div>

          {/* Quick Info Pills */}
          <div className="flex flex-wrap gap-3 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold">{availableIntegrations.length} Disponíveis</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 dark:border-slate-800 rounded-full">
              <Workflow className="w-3.5 h-3.5 text-gray-900 dark:text-white" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">{automationStats?.totalAutomations || 0} Automações</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 dark:border-slate-800 rounded-full">
              <Activity className="w-3.5 h-3.5 text-gray-900 dark:text-white" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">{automationStats?.enabledAutomations || 0} Ativas</span>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b-2 border-gray-200 dark:border-slate-800">
            {[
              { id: "integrations", name: "Integrações", icon: Zap },
              { id: "automations", name: "Automações", icon: Workflow },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = mainTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setMainTab(tab.id as any)}
                  className={`
                    flex items-center gap-2 px-5 py-3 rounded-t-lg font-bold text-sm whitespace-nowrap transition-all duration-200 border-b-2
                    ${isActive
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-transparent hover:bg-gray-100 dark:hover:bg-slate-900'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" strokeWidth={2.5} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="pb-12">{mainTab === "integrations" ? (
            /* TAB: INTEGRAÇÕES */
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">{/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-green-100 dark:bg-green-950 flex items-center justify-center">
                      <Check className="w-7 h-7 text-green-600 dark:text-green-400" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                    {availableIntegrations.length}
                  </div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Disponíveis</p>
                </div>

                <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                      <Sparkles className="w-7 h-7 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                    {comingSoonCount}
                  </div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Em breve</p>
                </div>

                <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                      <LinkIcon className="w-7 h-7 text-purple-600 dark:text-purple-400" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                    {integrations.length}
                  </div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</p>
                </div>
              </div>

              {/* Category Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { id: "all", name: "Todas" },
                  { id: "productivity", name: "Produtividade" },
                  { id: "development", name: "Desenvolvimento" },
                  { id: "communication", name: "Comunicação" },
                  { id: "automation", name: "Automação" },
                ].map((category) => {
                  const isActive = activeTab === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveTab(category.id)}
                      className={`
                        px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-200
                        ${isActive
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                          : 'bg-white dark:bg-slate-950 text-gray-500 dark:text-gray-400 border-2 border-gray-200 dark:border-slate-800 hover:border-gray-400 dark:hover:border-slate-600'
                        }
                      `}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>

              {/* Integration Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredIntegrations.map((integration) => {
                  const IntegrationComponent = integration.component

                  return (
                    <div key={integration.id} className="relative bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-gray-400 dark:hover:border-slate-600 transition-all duration-200">
                      {integration.status === "coming-soon" && (
                        <div className="absolute top-6 right-6 z-10">
                          <span className="inline-flex px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full">
                            Em breve
                          </span>
                        </div>
                      )}

                      {/* Header */}
                      <div className="p-8 border-b-2 border-gray-200 dark:border-slate-800">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-slate-900 p-2 flex-shrink-0 border-2 border-gray-200 dark:border-slate-800">
                            <img
                              src={integration.icon}
                              alt={integration.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                              {integration.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {integration.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-8">
                        {/* Features */}
                        <div className="mb-6">
                          <p className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">Recursos</p>
                          <div className="flex flex-wrap gap-2">
                            {integration.features.map((feature) => (
                              <span
                                key={feature}
                                className="px-3 py-1.5 text-xs font-bold bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-lg"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Integration Component or Coming Soon */}
                        {integration.status === "available" && IntegrationComponent ? (
                          <IntegrationComponent />
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
                            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-900 flex items-center justify-center mb-4">
                              <Sparkles className="w-8 h-8 text-gray-400 dark:text-gray-600" strokeWidth={2.5} />
                            </div>
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                              Disponível em breve
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (

            /* TAB: AUTOMAÇÕES */
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Stats de Automações */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                      <Workflow className="w-7 h-7 text-purple-600 dark:text-purple-400" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                    {automationStats?.totalAutomations || 0}
                  </div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</p>
                </div>

                <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-green-100 dark:bg-green-950 flex items-center justify-center">
                      <Check className="w-7 h-7 text-green-600 dark:text-green-400" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                    {automationStats?.enabledAutomations || 0}
                  </div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ativas</p>
                </div>

                <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                      <RefreshCw className="w-7 h-7 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                    {automationStats?.runningAutomations || 0}
                  </div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Em execução</p>
                </div>

                <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                      <Zap className="w-7 h-7 text-orange-600 dark:text-orange-400" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                    {automationStats?.totalItemsProcessed || 0}
                  </div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Processados</p>
                </div>
              </div>

              {/* Automation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loadingAvailable ? (
                  <div className="col-span-2 flex flex-col items-center justify-center py-20">
                    <div className="relative w-16 h-16 mb-6">
                      <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-slate-700 opacity-20"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-gray-900 dark:border-white border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Carregando automações</p>
                  </div>
                ) : automationsWithConfig.length === 0 ? (
                  <div className="col-span-2 flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-950 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl">
                    <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-slate-900 flex items-center justify-center mb-6">
                      <Workflow className="w-12 h-12 text-gray-400 dark:text-gray-600" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
                      Nenhuma automação disponível
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      As automações estarão disponíveis em breve.
                    </p>
                  </div>
                ) : (
                  automationsWithConfig.map(({ definition, automation }) => (
                    <AutomationCard
                      key={definition.type}
                      definition={definition}
                      automation={automation}
                      onConfigure={handleConfigureAutomation}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Configuração */}
      {selectedAutomation && (
        <AutomationSettingsModal
          isOpen={!!selectedAutomation}
          onClose={handleCloseModal}
          definition={selectedAutomation.definition}
          automation={selectedAutomation.automation}
        />
      )}
    </div>
  )
}
