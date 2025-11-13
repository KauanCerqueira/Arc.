"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/shared/components/ui/Button"
import { Badge } from "@/shared/components/ui/Badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Workflow
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
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Integrações & Automações</h1>
        <p className="text-muted-foreground">
          Conecte o Arc com suas ferramentas favoritas e automatize seu fluxo de trabalho
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as "integrations" | "automations")} className="mb-6">
        <TabsList>
          <TabsTrigger value="integrations" className="gap-2">
            <Zap className="w-4 h-4" />
            Integrações
          </TabsTrigger>
          <TabsTrigger value="automations" className="gap-2">
            <Workflow className="w-4 h-4" />
            Automações
          </TabsTrigger>
        </TabsList>

        {/* TAB: Integrações */}
        <TabsContent value="integrations" className="mt-6">

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disponíveis</p>
                <p className="text-2xl font-bold">{availableIntegrations.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em breve</p>
                <p className="text-2xl font-bold">{comingSoonCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{integrations.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="productivity">Produtividade</TabsTrigger>
          <TabsTrigger value="development">Desenvolvimento</TabsTrigger>
          <TabsTrigger value="communication">Comunicação</TabsTrigger>
          <TabsTrigger value="automation">Automação</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredIntegrations.map((integration) => {
          const IntegrationComponent = integration.component

          return (
            <Card key={integration.id} className="relative overflow-hidden">
              {integration.status === "coming-soon" && (
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary">Em breve</Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-white dark:bg-gray-800 p-1.5 flex-shrink-0">
                    <img
                      src={integration.icon}
                      alt={integration.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1">{integration.name}</CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Features */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Recursos:</p>
                  <div className="flex flex-wrap gap-2">
                    {integration.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Integration Component or Coming Soon */}
                {integration.status === "available" && IntegrationComponent ? (
                  <IntegrationComponent />
                ) : (
                  <div className="flex items-center justify-center py-8 text-center">
                    <div>
                      <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Esta integração estará disponível em breve
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
        </TabsContent>

        {/* TAB: Automações */}
        <TabsContent value="automations" className="mt-6">
          {/* Stats de Automações */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{automationStats?.totalAutomations || 0}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <Workflow className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ativas</p>
                    <p className="text-2xl font-bold">{automationStats?.enabledAutomations || 0}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Em execução</p>
                    <p className="text-2xl font-bold">{automationStats?.runningAutomations || 0}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Itens processados</p>
                    <p className="text-2xl font-bold">{automationStats?.totalItemsProcessed || 0}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Automation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loadingAvailable ? (
              <div className="col-span-2 text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Carregando automações...</p>
              </div>
            ) : automationsWithConfig.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <Workflow className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma automação disponível</h3>
                <p className="text-sm text-muted-foreground">
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
        </TabsContent>
      </Tabs>

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
