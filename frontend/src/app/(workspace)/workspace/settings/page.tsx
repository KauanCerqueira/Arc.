"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWorkspaceStore } from "@/core/store/workspaceStore"
import { useAuthStore } from "@/core/store/authStore"
import masterService from "@/core/services/master.service"
import {
  Users,
  Settings,
  Trash2,
  Upload,
  Mail,
  Shield,
  FileText,
  Copy,
  Check,
  Crown,
  UserPlus,
  X,
  Database,
  ToggleLeft,
  ToggleRight
} from "lucide-react"
import { Button } from "@/shared/components/ui/Button"
import { Badge } from "@/shared/components/ui/Badge"

interface WorkspaceMember {
  id: string
  name: string
  email: string
  role: "owner" | "admin" | "member" | "guest"
  avatar?: string
  joinedAt: Date
}

interface PermissionSettings {
  membersCanCreateGroups: boolean
  membersCanInvite: boolean
  isPublic: boolean
  guestsCanComment: boolean
  membersCanDelete: boolean
  requireApproval: boolean
}

interface MasterUser {
  id: string
  nome: string
  sobrenome: string
  email: string
  ativo: boolean
  isMaster: boolean
}

export default function WorkspaceSettingsPage() {
  const router = useRouter()
  const { workspace, updateWorkspace, deleteWorkspace, initializeWorkspace } = useWorkspaceStore()
  const { user } = useAuthStore()

  const [activeTab, setActiveTab] = useState<"general" | "members" | "permissions" | "danger" | "master">("general")

  // Ensure workspace is loaded
  useEffect(() => {
    if (!workspace) {
      initializeWorkspace()
    }
  }, [workspace, initializeWorkspace])

  // General Settings
  const [workspaceName, setWorkspaceName] = useState(workspace?.name || "")
  const [workspaceDescription, setWorkspaceDescription] = useState("")
  const [workspaceIcon, setWorkspaceIcon] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Members
  const [members, setMembers] = useState<WorkspaceMember[]>([
    {
      id: "1",
      name: `${user?.nome || ""} ${user?.sobrenome || ""}`.trim() || "Você",
      email: user?.email || "",
      role: "owner",
      joinedAt: new Date()
    }
  ])
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "member" | "guest">("member")
  const [showInviteSuccess, setShowInviteSuccess] = useState(false)

  // Permissions
  const [permissions, setPermissions] = useState<PermissionSettings>({
    membersCanCreateGroups: true,
    membersCanInvite: true,
    isPublic: false,
    guestsCanComment: true,
    membersCanDelete: false,
    requireApproval: false
  })
  const [permissionsSaved, setPermissionsSaved] = useState(false)

  // Master Settings
  const [masterUsers, setMasterUsers] = useState<MasterUser[]>([])
  const [loadingMasterUsers, setLoadingMasterUsers] = useState(false)
  const [seedingData, setSeedingData] = useState(false)

  // Invite Link
  const [inviteLink, setInviteLink] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (workspace) {
      setWorkspaceName(workspace.name)
      // Generate invite link
      const link = `${window.location.origin}/invite/${workspace.id}`
      setInviteLink(link)
    }
  }, [workspace])

  // Load master users if user is master
  useEffect(() => {
    if (user?.isMaster && activeTab === "master") {
      loadMasterUsers()
    }
  }, [user, activeTab])

  const loadMasterUsers = async () => {
    setLoadingMasterUsers(true)
    try {
      const users = await masterService.getAllUsers()
      setMasterUsers(users)
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
    } finally {
      setLoadingMasterUsers(false)
    }
  }

  const handleSaveGeneral = async () => {
    if (workspace && workspaceName.trim()) {
      try {
        await updateWorkspace(workspace.id, {
          name: workspaceName,
          description: workspaceDescription,
          icon: workspaceIcon
        })
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } catch (error) {
        alert("Erro ao salvar configurações")
      }
    }
  }

  const handleInviteMember = () => {
    if (!inviteEmail.trim()) return

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inviteEmail)) {
      alert("Por favor, insira um email válido")
      return
    }

    // Verificar se o email já está na lista
    if (members.some(m => m.email === inviteEmail)) {
      alert("Este email já foi convidado")
      return
    }

    const newMember: WorkspaceMember = {
      id: Date.now().toString(),
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      joinedAt: new Date()
    }

    setMembers([...members, newMember])
    setInviteEmail("")
    setShowInviteSuccess(true)
    setTimeout(() => setShowInviteSuccess(false), 3000)
  }

  const handleRemoveMember = (memberId: string) => {
    const member = members.find(m => m.id === memberId)
    if (!member) return

    if (confirm(`Tem certeza que deseja remover ${member.name} do workspace?`)) {
      setMembers(members.filter(m => m.id !== memberId))
    }
  }

  const handleChangeRole = (memberId: string, newRole: "admin" | "member" | "guest") => {
    setMembers(members.map(m =>
      m.id === memberId ? { ...m, role: newRole } : m
    ))
  }

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const togglePermission = (key: keyof PermissionSettings) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSavePermissions = () => {
    // Aqui você salvaria as permissões no backend
    console.log("Salvando permissões:", permissions)
    setPermissionsSaved(true)
    setTimeout(() => setPermissionsSaved(false), 3000)
  }

  const handleDeleteWorkspace = async () => {
    if (!workspace) return

    const confirmation = prompt(
      `Para confirmar a exclusão, digite o nome do workspace: "${workspace.name}"`
    )

    if (confirmation === workspace.name) {
      try {
        await deleteWorkspace(workspace.id)
        router.push("/workspace")
      } catch (error) {
        alert("Erro ao excluir workspace")
      }
    } else if (confirmation !== null) {
      alert("Nome incorreto. Workspace não foi excluído.")
    }
  }

  // Master functions
  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await masterService.toggleUserStatus(userId, !currentStatus)
      await loadMasterUsers()
    } catch (error) {
      alert("Erro ao alterar status do usuário")
    }
  }

  const handleToggleUserMaster = async (userId: string, currentMaster: boolean) => {
    try {
      await masterService.toggleUserMaster(userId, !currentMaster)
      await loadMasterUsers()
    } catch (error) {
      alert("Erro ao alterar permissões master")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.")) {
      try {
        await masterService.deleteUser(userId)
        await loadMasterUsers()
      } catch (error) {
        alert("Erro ao excluir usuário")
      }
    }
  }

  const handleSeedMvpData = async () => {
    if (!confirm("Tem certeza que deseja popular o banco de dados com dados de exemplo? Esta ação pode criar muitos registros.")) {
      return
    }

    setSeedingData(true)
    try {
      const result = await masterService.seedMvpData()
      alert(`Dados criados com sucesso!\n\nWorkspaces: ${result.workspacesCreated}\nGrupos: ${result.groupsCreated}\nPáginas: ${result.pagesCreated}`)
      await initializeWorkspace() // Reload workspace data
    } catch (error) {
      alert("Erro ao criar dados de exemplo")
    } finally {
      setSeedingData(false)
    }
  }

  if (!workspace) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-arc-muted">Carregando workspace...</p>
        </div>
      </div>
    )
  }

  const roleColors = {
    owner: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-900/50",
    admin: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
    member: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
    guest: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-900/50"
  }

  const roleLabels = {
    owner: "Proprietário",
    admin: "Administrador",
    member: "Membro",
    guest: "Convidado"
  }

  const tabs = [
    { id: "general", label: "Geral", icon: Settings },
    { id: "members", label: "Membros", icon: Users, badge: members.length },
    { id: "permissions", label: "Permissões", icon: Shield },
    { id: "danger", label: "Zona de Perigo", icon: Trash2, color: "red" },
    ...(user?.isMaster ? [{ id: "master", label: "Master", icon: Crown, color: "yellow" }] : [])
  ]

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-arc mb-2">Configurações do Workspace</h1>
        <p className="text-arc-muted">Gerencie as configurações, membros e permissões do workspace "{workspace.name}"</p>
        {user?.isMaster && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm">
            <Crown className="w-4 h-4" />
            Modo Master Ativo
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-arc mb-6 overflow-x-auto">
        <div className="flex gap-6 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const color = tab.color === "red" ? "red" : tab.color === "yellow" ? "yellow" : "purple"

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-1 border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? `border-${color}-500 text-arc`
                    : "border-transparent text-arc-muted hover:text-arc"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                  {tab.badge !== undefined && <Badge variant="secondary">{tab.badge}</Badge>}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* General Tab */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <div className="bg-arc-secondary border border-arc rounded-lg p-6">
              <h2 className="text-xl font-semibold text-arc mb-4">Informações Gerais</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-arc mb-2">
                    Nome do Workspace *
                  </label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full px-4 py-2 bg-arc-primary border border-arc rounded-lg text-arc focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Meu Workspace"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-arc mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={workspaceDescription}
                    onChange={(e) => setWorkspaceDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-arc-primary border border-arc rounded-lg text-arc focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                    rows={3}
                    placeholder="Descreva o propósito deste workspace..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-arc mb-2">
                    Ícone do Workspace
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                      {workspaceName.slice(0, 2).toUpperCase() || "WS"}
                    </div>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Imagem
                    </Button>
                  </div>
                </div>

                {saveSuccess && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <Check className="w-4 h-4" />
                    Configurações salvas com sucesso!
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <Button onClick={handleSaveGeneral} disabled={!workspaceName.trim()}>
                    Salvar Alterações
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setWorkspaceName(workspace.name)
                      setWorkspaceDescription("")
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>

            {/* Workspace Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-arc-secondary border border-arc rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="text-sm text-arc-muted mb-1">Total de Grupos</div>
                <div className="text-2xl font-bold text-arc">{workspace.groups.length}</div>
              </div>
              <div className="bg-arc-secondary border border-arc rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="text-sm text-arc-muted mb-1">Total de Páginas</div>
                <div className="text-2xl font-bold text-arc">
                  {workspace.groups.reduce((sum, g) => sum + g.pages.length, 0)}
                </div>
              </div>
              <div className="bg-arc-secondary border border-arc rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="text-sm text-arc-muted mb-1">Membros</div>
                <div className="text-2xl font-bold text-arc">{members.length}</div>
              </div>
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="space-y-6">
            {/* Invite Members */}
            <div className="bg-arc-secondary border border-arc rounded-lg p-6">
              <h2 className="text-xl font-semibold text-arc mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Convidar Membros
              </h2>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleInviteMember()}
                    className="flex-1 px-4 py-2 bg-arc-primary border border-arc rounded-lg text-arc focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="email@exemplo.com"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="px-4 py-2 bg-arc-primary border border-arc rounded-lg text-arc focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="member">Membro</option>
                    <option value="admin">Administrador</option>
                    <option value="guest">Convidado</option>
                  </select>
                  <Button onClick={handleInviteMember} disabled={!inviteEmail.trim()}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Convidar
                  </Button>
                </div>

                {showInviteSuccess && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <Check className="w-4 h-4" />
                    Convite enviado com sucesso para {inviteEmail}!
                  </div>
                )}

                <div className="pt-4 border-t border-arc">
                  <p className="text-sm text-arc-muted mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Ou compartilhe o link de convite:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inviteLink}
                      readOnly
                      className="flex-1 px-4 py-2 bg-arc-primary border border-arc rounded-lg text-arc text-sm"
                    />
                    <Button variant="outline" onClick={copyInviteLink}>
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Members List */}
            <div className="bg-arc-secondary border border-arc rounded-lg p-6">
              <h2 className="text-xl font-semibold text-arc mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Membros do Workspace ({members.length})
              </h2>

              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-arc-primary border border-arc rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-arc truncate">{member.name}</span>
                          {member.role === "owner" && <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                        </div>
                        <span className="text-sm text-arc-muted truncate block">{member.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      {member.role !== "owner" ? (
                        <select
                          value={member.role}
                          onChange={(e) => handleChangeRole(member.id, e.target.value as any)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer ${roleColors[member.role]}`}
                        >
                          <option value="admin">Administrador</option>
                          <option value="member">Membro</option>
                          <option value="guest">Convidado</option>
                        </select>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${roleColors[member.role]}`}>
                          {roleLabels[member.role]}
                        </span>
                      )}

                      {member.role !== "owner" && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 transition-colors"
                          title="Remover membro"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === "permissions" && (
          <div className="space-y-6">
            <div className="bg-arc-secondary border border-arc rounded-lg p-6">
              <h2 className="text-xl font-semibold text-arc mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Configurações de Permissões
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-arc-primary border border-arc rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <div className="font-medium text-arc">Permitir membros criarem grupos</div>
                    <div className="text-sm text-arc-muted mt-1">Membros podem criar novos grupos no workspace</div>
                  </div>
                  <button
                    onClick={() => togglePermission('membersCanCreateGroups')}
                    className="ml-4"
                    title={permissions.membersCanCreateGroups ? "Desativar" : "Ativar"}
                  >
                    {permissions.membersCanCreateGroups ? (
                      <ToggleRight className="w-10 h-10 text-purple-500" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-arc-primary border border-arc rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <div className="font-medium text-arc">Permitir membros convidarem outros</div>
                    <div className="text-sm text-arc-muted mt-1">Membros podem enviar convites para o workspace</div>
                  </div>
                  <button
                    onClick={() => togglePermission('membersCanInvite')}
                    className="ml-4"
                    title={permissions.membersCanInvite ? "Desativar" : "Ativar"}
                  >
                    {permissions.membersCanInvite ? (
                      <ToggleRight className="w-10 h-10 text-purple-500" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-arc-primary border border-arc rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <div className="font-medium text-arc">Workspace público</div>
                    <div className="text-sm text-arc-muted mt-1">Qualquer pessoa com o link pode visualizar</div>
                  </div>
                  <button
                    onClick={() => togglePermission('isPublic')}
                    className="ml-4"
                    title={permissions.isPublic ? "Desativar" : "Ativar"}
                  >
                    {permissions.isPublic ? (
                      <ToggleRight className="w-10 h-10 text-purple-500" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-arc-primary border border-arc rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <div className="font-medium text-arc">Convidados podem comentar</div>
                    <div className="text-sm text-arc-muted mt-1">Convidados têm permissão para comentar em páginas</div>
                  </div>
                  <button
                    onClick={() => togglePermission('guestsCanComment')}
                    className="ml-4"
                    title={permissions.guestsCanComment ? "Desativar" : "Ativar"}
                  >
                    {permissions.guestsCanComment ? (
                      <ToggleRight className="w-10 h-10 text-purple-500" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-arc-primary border border-arc rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <div className="font-medium text-arc">Membros podem deletar páginas</div>
                    <div className="text-sm text-arc-muted mt-1">Permite que membros excluam páginas que criaram</div>
                  </div>
                  <button
                    onClick={() => togglePermission('membersCanDelete')}
                    className="ml-4"
                    title={permissions.membersCanDelete ? "Desativar" : "Ativar"}
                  >
                    {permissions.membersCanDelete ? (
                      <ToggleRight className="w-10 h-10 text-purple-500" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-arc-primary border border-arc rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <div className="font-medium text-arc">Requer aprovação para novos membros</div>
                    <div className="text-sm text-arc-muted mt-1">Convites precisam ser aprovados por um administrador</div>
                  </div>
                  <button
                    onClick={() => togglePermission('requireApproval')}
                    className="ml-4"
                    title={permissions.requireApproval ? "Desativar" : "Ativar"}
                  >
                    {permissions.requireApproval ? (
                      <ToggleRight className="w-10 h-10 text-purple-500" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {permissionsSaved && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mt-4">
                  <Check className="w-4 h-4" />
                  Permissões salvas com sucesso!
                </div>
              )}

              <div className="pt-4 mt-4 border-t border-arc">
                <Button onClick={handleSavePermissions}>
                  Salvar Permissões
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone Tab */}
        {activeTab === "danger" && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Zona de Perigo
            </h2>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/30 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-arc mb-1">Excluir Workspace</div>
                  <div className="text-sm text-arc-muted">
                    Esta ação é irreversível. Todos os grupos, páginas e dados serão perdidos permanentemente.
                    <br />
                    <strong>Total de {workspace.groups.length} grupos e {workspace.groups.reduce((sum, g) => sum + g.pages.length, 0)} páginas serão excluídos.</strong>
                  </div>
                </div>
                <Button variant="destructive" onClick={handleDeleteWorkspace}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Workspace
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Master Tab - Only visible for master users */}
        {activeTab === "master" && user?.isMaster && (
          <div className="space-y-6">
            {/* Seed Data */}
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-700 dark:text-yellow-400 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Dados de Demonstração
              </h2>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-yellow-200 dark:border-yellow-900/30 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-arc mb-1">Criar Dados MVP</div>
                    <div className="text-sm text-arc-muted">
                      Popula o banco de dados com workspaces, grupos e páginas de exemplo para demonstração.
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleSeedMvpData}
                    disabled={seedingData}
                  >
                    {seedingData ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Criando...
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4 mr-2" />
                        Criar Dados
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* User Management */}
            <div className="bg-arc-secondary border border-arc rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-arc flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Gerenciar Usuários
                </h2>
                <Button variant="outline" size="sm" onClick={loadMasterUsers} disabled={loadingMasterUsers}>
                  {loadingMasterUsers ? "Carregando..." : "Atualizar"}
                </Button>
              </div>

              {loadingMasterUsers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                  <p className="text-arc-muted text-sm">Carregando usuários...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {masterUsers.map((masterUser) => (
                    <div
                      key={masterUser.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-arc-primary border border-arc rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {masterUser.nome.slice(0, 1)}{masterUser.sobrenome.slice(0, 1)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-arc truncate">
                              {masterUser.nome} {masterUser.sobrenome}
                            </span>
                            {masterUser.isMaster && <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                            {!masterUser.ativo && (
                              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-xs flex-shrink-0">
                                Inativo
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-arc-muted truncate block">{masterUser.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleUserStatus(masterUser.id, masterUser.ativo)}
                        >
                          {masterUser.ativo ? "Desativar" : "Ativar"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleUserMaster(masterUser.id, masterUser.isMaster)}
                        >
                          {masterUser.isMaster ? "Remover Master" : "Tornar Master"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(masterUser.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {masterUsers.length === 0 && (
                    <div className="text-center py-8 text-arc-muted">
                      Nenhum usuário encontrado
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
