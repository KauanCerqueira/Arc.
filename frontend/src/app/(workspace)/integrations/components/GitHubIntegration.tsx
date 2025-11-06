"use client"

import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/Button"
import { Badge } from "@/shared/components/ui/Badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/shared/components/ui/Input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/Dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/Select"
import {
  Github,
  GitPullRequest,
  GitBranch,
  GitCommit,
  RefreshCw,
  Settings,
  ExternalLink,
  Power,
  Loader2,
  BookOpen
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GitHubConfig {
  isEnabled: boolean
  syncIssues: boolean
  syncPullRequests: boolean
  syncCommits: boolean
  defaultRepository?: string
  autoCreateIssues: boolean
  lastSync?: string
}

interface Repository {
  id: number
  name: string
  fullName: string
  isPrivate: boolean
}

export default function GitHubIntegration() {
  const { toast } = useToast()
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [config, setConfig] = useState<GitHubConfig>({
    isEnabled: false,
    syncIssues: true,
    syncPullRequests: true,
    syncCommits: false,
    autoCreateIssues: false
  })

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      const response = await fetch("/api/github/config", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIsConnected(true)
        setConfig(data)
        loadRepositories()
      } else {
        setIsConnected(false)
      }
    } catch (error) {
      console.error("Erro ao verificar conexão:", error)
      setIsConnected(false)
    }
  }

  const loadRepositories = async () => {
    try {
      const response = await fetch("/api/github/repositories", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRepositories(data)
      }
    } catch (error) {
      console.error("Erro ao carregar repositórios:", error)
    }
  }

  const handleConnect = async () => {
    setIsLoading(true)
    try {
      // Obter URL de autorização OAuth
      const response = await fetch("/api/auth/oauth/github", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      if (response.ok) {
        const { authUrl } = await response.json()
        // Redirecionar para autorização do GitHub
        window.location.href = authUrl
      } else {
        throw new Error("Falha ao obter URL de autorização")
      }
    } catch (error) {
      console.error("Erro ao conectar:", error)
      toast({
        title: "Erro",
        description: "Falha ao conectar com GitHub",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/github/disable", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      if (response.ok) {
        setIsConnected(false)
        setRepositories([])
        setConfig({
          isEnabled: false,
          syncIssues: true,
          syncPullRequests: true,
          syncCommits: false,
          autoCreateIssues: false
        })
        toast({
          title: "Desconectado",
          description: "Integração com GitHub desativada"
        })
      }
    } catch (error) {
      console.error("Erro ao desconectar:", error)
      toast({
        title: "Erro",
        description: "Falha ao desconectar GitHub",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch("/api/github/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          repositories: config.defaultRepository ? [config.defaultRepository] : []
        })
      })

      if (response.ok) {
        const status = await response.json()
        toast({
          title: "Sincronização concluída",
          description: `${status.itemsSynced || 0} itens sincronizados com sucesso`
        })
        checkConnection()
      }
    } catch (error) {
      console.error("Erro ao sincronizar:", error)
      toast({
        title: "Erro",
        description: "Falha ao sincronizar com GitHub",
        variant: "destructive"
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/github/configure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(config)
      })

      if (response.ok) {
        toast({
          title: "Configurações salvas",
          description: "Suas preferências foram atualizadas"
        })
        setShowSettings(false)
      }
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    { name: "Issues", icon: BookOpen, enabled: config.syncIssues },
    { name: "Pull Requests", icon: GitPullRequest, enabled: config.syncPullRequests },
    { name: "Commits", icon: GitCommit, enabled: config.syncCommits }
  ]

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-300"}`} />
          <span className="text-sm font-medium">
            {isConnected ? "Conectado" : "Desconectado"}
          </span>
        </div>
        {isConnected && config.lastSync && (
          <span className="text-xs text-muted-foreground">
            Última sync: {new Date(config.lastSync).toLocaleString("pt-BR")}
          </span>
        )}
      </div>

      {/* Repository Info */}
      {isConnected && repositories.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Github className="h-4 w-4" />
          <span>{repositories.length} repositório(s) encontrado(s)</span>
        </div>
      )}

      {/* Actions */}
      {!isConnected ? (
        <Button
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Github className="mr-2 h-4 w-4" />
          Conectar GitHub
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleSync}
              disabled={isSyncing}
              variant="outline"
              size="sm"
            >
              {isSyncing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Sincronizar
            </Button>
            <Button
              onClick={() => setShowSettings(true)}
              variant="outline"
              size="sm"
            >
              <Settings className="mr-2 h-4 w-4" />
              Configurar
            </Button>
          </div>
          <Button
            onClick={handleDisconnect}
            disabled={isLoading}
            variant="destructive"
            size="sm"
            className="w-full"
          >
            <Power className="mr-2 h-4 w-4" />
            Desconectar
          </Button>
        </div>
      )}

      {/* Active Features */}
      {isConnected && (
        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-3">Recursos ativos:</p>
          <div className="grid grid-cols-3 gap-2">
            {features.filter(f => f.enabled).map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.name}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-center">{feature.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurações do GitHub</DialogTitle>
            <DialogDescription>
              Escolha quais recursos do GitHub você deseja sincronizar com o Arc
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Repository Selection */}
            <div className="space-y-2">
              <Label htmlFor="repository">Repositório padrão</Label>
              <Select
                value={config.defaultRepository}
                onValueChange={(value) =>
                  setConfig({ ...config, defaultRepository: value })
                }
              >
                <SelectTrigger id="repository">
                  <SelectValue placeholder="Selecione um repositório" />
                </SelectTrigger>
                <SelectContent>
                  {repositories.map((repo) => (
                    <SelectItem key={repo.id} value={repo.fullName}>
                      <div className="flex items-center gap-2">
                        {repo.fullName}
                        {repo.isPrivate && (
                          <Badge variant="secondary" className="text-xs">
                            Privado
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Repositório usado para sincronização automática
              </p>
            </div>

            {/* Sync Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <Label htmlFor="sync-issues" className="cursor-pointer">
                    Sincronizar Issues
                  </Label>
                </div>
                <Switch
                  id="sync-issues"
                  checked={config.syncIssues}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, syncIssues: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GitPullRequest className="h-5 w-5 text-muted-foreground" />
                  <Label htmlFor="sync-prs" className="cursor-pointer">
                    Sincronizar Pull Requests
                  </Label>
                </div>
                <Switch
                  id="sync-prs"
                  checked={config.syncPullRequests}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, syncPullRequests: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GitCommit className="h-5 w-5 text-muted-foreground" />
                  <Label htmlFor="sync-commits" className="cursor-pointer">
                    Sincronizar Commits
                  </Label>
                </div>
                <Switch
                  id="sync-commits"
                  checked={config.syncCommits}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, syncCommits: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Github className="h-5 w-5 text-muted-foreground" />
                  <Label htmlFor="auto-create" className="cursor-pointer">
                    Criar Issues automaticamente
                  </Label>
                </div>
                <Switch
                  id="auto-create"
                  checked={config.autoCreateIssues}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, autoCreateIssues: checked })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSettings} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
