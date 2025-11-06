"use client"

import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/Button"
import { Badge } from "@/shared/components/ui/Badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/Dialog"
import {
  Calendar,
  CheckSquare,
  FileText,
  Mail,
  Users,
  RefreshCw,
  Settings,
  ExternalLink,
  Power,
  Check,
  X,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GoogleConfig {
  isEnabled: boolean
  syncCalendar: boolean
  syncTasks: boolean
  syncDrive: boolean
  syncDocs: boolean
  syncSheets: boolean
  syncGmail: boolean
  syncContacts: boolean
  lastSync?: string
}

export default function GoogleIntegration() {
  const { toast } = useToast()
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [config, setConfig] = useState<GoogleConfig>({
    isEnabled: false,
    syncCalendar: true,
    syncTasks: true,
    syncDrive: false,
    syncDocs: false,
    syncSheets: false,
    syncGmail: false,
    syncContacts: false
  })

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      const response = await fetch("/api/google/config", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIsConnected(true)
        setConfig(data)
      } else {
        setIsConnected(false)
      }
    } catch (error) {
      console.error("Erro ao verificar conexão:", error)
      setIsConnected(false)
    }
  }

  const handleConnect = async () => {
    setIsLoading(true)
    try {
      // Obter URL de autorização OAuth
      const response = await fetch("/api/auth/oauth/google", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      if (response.ok) {
        const { authUrl } = await response.json()
        // Redirecionar para autorização do Google
        window.location.href = authUrl
      } else {
        throw new Error("Falha ao obter URL de autorização")
      }
    } catch (error) {
      console.error("Erro ao conectar:", error)
      toast({
        title: "Erro",
        description: "Falha ao conectar com Google Workspace",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/google/disable", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      if (response.ok) {
        setIsConnected(false)
        setConfig({
          isEnabled: false,
          syncCalendar: true,
          syncTasks: true,
          syncDrive: false,
          syncDocs: false,
          syncSheets: false,
          syncGmail: false,
          syncContacts: false
        })
        toast({
          title: "Desconectado",
          description: "Integração com Google Workspace desativada"
        })
      }
    } catch (error) {
      console.error("Erro ao desconectar:", error)
      toast({
        title: "Erro",
        description: "Falha ao desconectar Google Workspace",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch("/api/google/sync", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
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
        description: "Falha ao sincronizar com Google Workspace",
        variant: "destructive"
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/google/configure", {
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
    { name: "Calendar", icon: Calendar, enabled: config.syncCalendar, key: "syncCalendar" },
    { name: "Tasks", icon: CheckSquare, enabled: config.syncTasks, key: "syncTasks" },
    { name: "Drive", icon: FileText, enabled: config.syncDrive, key: "syncDrive" },
    { name: "Docs", icon: FileText, enabled: config.syncDocs, key: "syncDocs" },
    { name: "Sheets", icon: FileText, enabled: config.syncSheets, key: "syncSheets" },
    { name: "Gmail", icon: Mail, enabled: config.syncGmail, key: "syncGmail" },
    { name: "Contacts", icon: Users, enabled: config.syncContacts, key: "syncContacts" }
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

      {/* Actions */}
      {!isConnected ? (
        <Button
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <ExternalLink className="mr-2 h-4 w-4" />
          Conectar Google Workspace
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
          <p className="text-sm font-medium mb-3">Serviços ativos:</p>
          <div className="grid grid-cols-3 gap-2">
            {features.filter(f => f.enabled).map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.name}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs">{feature.name}</span>
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
            <DialogTitle>Configurações do Google Workspace</DialogTitle>
            <DialogDescription>
              Escolha quais serviços do Google você deseja sincronizar com o Arc
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <Label htmlFor={feature.key} className="cursor-pointer">
                      {feature.name}
                    </Label>
                  </div>
                  <Switch
                    id={feature.key}
                    checked={config[feature.key as keyof GoogleConfig] as boolean}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, [feature.key]: checked })
                    }
                  />
                </div>
              )
            })}
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
