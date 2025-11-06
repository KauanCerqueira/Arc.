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
  AlertCircle
} from "lucide-react"
import GoogleIntegration from "./components/GoogleIntegration"
import GitHubIntegration from "./components/GitHubIntegration"

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState("all")

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

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Integrações</h1>
        <p className="text-muted-foreground">
          Conecte o Arc com suas ferramentas favoritas e automatize seu fluxo de trabalho
        </p>
      </div>

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
    </div>
  )
}
