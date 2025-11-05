"use client"

import React from "react"
import { useParams, useRouter } from "next/navigation"
import { useWorkspaceStore } from "@/core/store/workspaceStore"
import {
  Folder,
  Briefcase,
  Rocket,
  Tag,
  ListChecks,
  Users,
  Calendar as CalendarIcon,
  Star,
  ArrowLeft,
  Trash2,
  Save,
  UserPlus,
  Crown,
  Shield,
  User,
  MoreVertical,
  FileText,
  Settings,
  Palette,
} from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/Button"
import { Input } from "@/shared/components/ui/Input"
import { Textarea } from "@/shared/components/ui/Textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/Dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/Select"
import Link from "next/link"

const iconOptions = [
  { key: "folder", Icon: Folder, label: "Pasta" },
  { key: "briefcase", Icon: Briefcase, label: "Projetos" },
  { key: "rocket", Icon: Rocket, label: "Lançamentos" },
  { key: "tag", Icon: Tag, label: "Tags" },
  { key: "list", Icon: ListChecks, label: "Tarefas" },
  { key: "users", Icon: Users, label: "Equipe" },
  { key: "calendar", Icon: CalendarIcon, label: "Agenda" },
  { key: "star", Icon: Star, label: "Favoritos" },
]

const colorOptions = [
  { hex: "#0ea5e9", name: "Azul" },
  { hex: "#8b5cf6", name: "Roxo" },
  { hex: "#f59e0b", name: "Laranja" },
  { hex: "#10b981", name: "Verde" },
  { hex: "#ef4444", name: "Vermelho" },
  { hex: "#d946ef", name: "Rosa" },
  { hex: "#14b8a6", name: "Turquesa" },
  { hex: "#64748b", name: "Cinza" },
]

type MemberRole = "owner" | "admin" | "member"

interface Member {
  id: string
  name: string
  email: string
  role: MemberRole
  avatar?: string
  joinedAt: Date
}

export default function ManageGroupPage() {
  const params = useParams<{ groupId: string }>()
  const router = useRouter()
  const { getGroup, updateGroup, deleteGroup } = useWorkspaceStore()

  const groupId = params?.groupId as string
  const group = getGroup(groupId)

  // Estados
  const [activeTab, setActiveTab] = React.useState<"info" | "members" | "pages" | "settings">("info")
  const [icon, setIcon] = React.useState<string | undefined>(group?.icon)
  const [color, setColor] = React.useState<string | undefined>(group?.color)
  const [groupName, setGroupName] = React.useState(group?.name || "")
  const [groupDescription, setGroupDescription] = React.useState("")

  // Modals
  const [addMemberModal, setAddMemberModal] = React.useState(false)
  const [newMemberEmail, setNewMemberEmail] = React.useState("")
  const [newMemberRole, setNewMemberRole] = React.useState<MemberRole>("member")

  // Mock de membros (substituir com dados reais do backend)
  const [members, setMembers] = React.useState<Member[]>([
    {
      id: "1",
      name: "Você",
      email: "voce@exemplo.com",
      role: "owner",
      joinedAt: new Date("2024-01-01"),
    },
  ])

  React.useEffect(() => {
    if (group) {
      setIcon(group.icon)
      setColor(group.color)
      setGroupName(group.name)
    }
  }, [group])

  if (!group) {
    return (
      <div className="min-h-screen bg-arc-primary p-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-arc hover:opacity-70 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="mt-4 text-arc-muted">Grupo não encontrado.</div>
      </div>
    )
  }

  const CurrentIcon = (iconOptions.find((o) => o.key === icon)?.Icon || Folder) as React.ComponentType<any>

  const handleSaveChanges = async () => {
    await updateGroup(groupId, { icon, color, name: groupName })
  }

  const handleDeleteGroup = async () => {
    const ok = window.confirm(`Tem certeza que deseja excluir o grupo "${group.name}"? Esta ação não pode ser desfeita.`)
    if (!ok) return
    await deleteGroup(groupId)
    router.push("/workspace")
  }

  const handleAddMember = () => {
    if (!newMemberEmail) return
    const newMember: Member = {
      id: Date.now().toString(),
      name: newMemberEmail.split("@")[0],
      email: newMemberEmail,
      role: newMemberRole,
      joinedAt: new Date(),
    }
    setMembers([...members, newMember])
    setNewMemberEmail("")
    setNewMemberRole("member")
    setAddMemberModal(false)
  }

  const handleRemoveMember = (memberId: string) => {
    const member = members.find((m) => m.id === memberId)
    if (!member) return
    const ok = window.confirm(`Remover ${member.name} do grupo?`)
    if (!ok) return
    setMembers(members.filter((m) => m.id !== memberId))
  }

  const handleChangeRole = (memberId: string, newRole: MemberRole) => {
    setMembers(members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)))
  }

  const getRoleIcon = (role: MemberRole) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-yellow-600" />
      case "admin":
        return <Shield className="w-4 h-4 text-blue-600" />
      case "member":
        return <User className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-arc-primary">
      {/* Header */}
      <div className="border-b-2 border-arc bg-arc-secondary">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm font-semibold text-arc hover:opacity-70 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveChanges}
                className="inline-flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Salvar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteGroup}
                className="inline-flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Excluir
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center border-2 border-arc"
              style={{ backgroundColor: color || "#64748b" }}
            >
              <CurrentIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-arc tracking-tight">{group.name}</h1>
              <p className="text-sm text-arc-muted mt-1">
                {group.pages.length} páginas • {members.length} {members.length === 1 ? "membro" : "membros"}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-6 border-b border-arc">
            {[
              { key: "info", label: "Informações", icon: FileText },
              { key: "members", label: "Membros", icon: Users },
              { key: "pages", label: "Páginas", icon: Folder },
              { key: "settings", label: "Configurações", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors",
                    activeTab === tab.key
                      ? "border-arc text-arc"
                      : "border-transparent text-arc-muted hover:text-arc hover:border-arc/30"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Tab: Informações */}
        {activeTab === "info" && (
          <div className="space-y-6">
            <div className="bg-arc-secondary border-2 border-arc rounded-xl p-6">
              <h2 className="text-xl font-bold text-arc mb-4">Informações básicas</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-arc mb-2">Nome do grupo</label>
                  <Input
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Nome do grupo"
                    className="max-w-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-arc mb-2">Descrição</label>
                  <Textarea
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    placeholder="Adicione uma descrição para este grupo..."
                    className="max-w-2xl"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-arc mb-2">Criado em</label>
                  <p className="text-sm text-arc-muted">{group.createdAt.toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            </div>

            <div className="bg-arc-secondary border-2 border-arc rounded-xl p-6">
              <h2 className="text-xl font-bold text-arc mb-4">Estatísticas</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-arc-primary rounded-lg border border-arc">
                  <div className="text-3xl font-extrabold text-arc">{group.pages.length}</div>
                  <div className="text-sm text-arc-muted mt-1">Páginas criadas</div>
                </div>
                <div className="p-4 bg-arc-primary rounded-lg border border-arc">
                  <div className="text-3xl font-extrabold text-arc">{members.length}</div>
                  <div className="text-sm text-arc-muted mt-1">Membros ativos</div>
                </div>
                <div className="p-4 bg-arc-primary rounded-lg border border-arc">
                  <div className="text-3xl font-extrabold text-arc">
                    {Math.floor((new Date().getTime() - group.createdAt.getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm text-arc-muted mt-1">Dias de existência</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Membros */}
        {activeTab === "members" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-arc">Membros do grupo</h2>
                <p className="text-sm text-arc-muted mt-1">Gerencie quem tem acesso a este grupo</p>
              </div>
              <Button onClick={() => setAddMemberModal(true)} className="inline-flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Adicionar membro
              </Button>
            </div>

            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-arc-secondary border-2 border-arc rounded-xl p-4 flex items-center justify-between hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-arc flex items-center justify-center">
                      <span className="text-lg font-bold text-arc-primary">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-arc">{member.name}</span>
                        {getRoleIcon(member.role)}
                      </div>
                      <div className="text-sm text-arc-muted">{member.email}</div>
                      <div className="text-xs text-arc-muted mt-0.5">
                        Entrou em {member.joinedAt.toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={member.role}
                      onValueChange={(value) => handleChangeRole(member.id, value as MemberRole)}
                      disabled={member.role === "owner"}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Membro</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="owner" disabled>
                          Proprietário
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {member.role !== "owner" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal: Adicionar Membro */}
            <Dialog open={addMemberModal} onOpenChange={setAddMemberModal}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar membro</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-arc mb-2">Email</label>
                    <Input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-arc mb-2">Função</label>
                    <Select value={newMemberRole} onValueChange={(value) => setNewMemberRole(value as MemberRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Membro</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <Button onClick={handleAddMember} className="flex-1">
                      Adicionar
                    </Button>
                    <Button variant="outline" onClick={() => setAddMemberModal(false)} className="flex-1">
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Tab: Páginas */}
        {activeTab === "pages" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-arc">Páginas do grupo</h2>
              <p className="text-sm text-arc-muted mt-1">Todas as páginas criadas neste grupo</p>
            </div>

            {group.pages.length === 0 ? (
              <div className="bg-arc-secondary border-2 border-arc rounded-xl p-12 text-center">
                <Folder className="w-12 h-12 text-arc-muted mx-auto mb-4" />
                <p className="text-arc-muted">Nenhuma página criada ainda</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.pages.map((page) => {
                  const PageIcon = iconOptions.find((o) => o.key === page.icon)?.Icon || FileText
                  return (
                    <Link
                      key={page.id}
                      href={`/workspace/group/${groupId}/page/${page.id}`}
                      className="bg-arc-secondary border-2 border-arc rounded-xl p-6 hover:border-gray-300 transition-colors group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center bg-arc"
                        >
                          <PageIcon className="w-6 h-6 text-white" />
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-arc-primary rounded">
                          <MoreVertical className="w-4 h-4 text-arc" />
                        </button>
                      </div>
                      <h3 className="font-bold text-arc mb-1 line-clamp-2">{page.name}</h3>
                      <p className="text-xs text-arc-muted">Template: {page.template}</p>
                      <p className="text-xs text-arc-muted mt-1">
                        Criado em {page.createdAt.toLocaleDateString("pt-BR")}
                      </p>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab: Configurações */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="bg-arc-secondary border-2 border-arc rounded-xl p-6">
              <h2 className="text-xl font-bold text-arc mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" /> Aparência do grupo
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-arc mb-3">Ícone</label>
                  <div className="grid grid-cols-8 md:grid-cols-12 gap-2">
                    {iconOptions.map(({ key, Icon }) => (
                      <button
                        key={key}
                        className={cn(
                          "flex items-center justify-center w-12 h-12 rounded-lg border-2 transition-all hover:scale-105",
                          icon === key
                            ? "border-arc bg-arc text-arc-primary shadow-lg"
                            : "border-gray-300 hover:border-arc"
                        )}
                        onClick={() => setIcon(key)}
                        title={key}
                      >
                        <Icon className="w-6 h-6" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-arc mb-3">Cor do ícone</label>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                    {colorOptions.map(({ hex, name }) => (
                      <button
                        key={hex}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:scale-105",
                          color === hex ? "border-arc shadow-lg" : "border-transparent hover:border-gray-300"
                        )}
                        onClick={() => setColor(hex)}
                      >
                        <div className="w-10 h-10 rounded-full" style={{ backgroundColor: hex }} />
                        <span className="text-xs text-arc-muted font-medium">{name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-arc">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center border-2 border-arc"
                      style={{ backgroundColor: color || "#64748b" }}
                    >
                      <CurrentIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-arc">Preview</p>
                      <p className="text-xs text-arc-muted">Assim ficará o ícone do grupo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border-2 border-red-600 rounded-xl p-6">
              <h2 className="text-xl font-bold text-red-600 mb-2">Zona de perigo</h2>
              <p className="text-sm text-red-600 mb-4">Ações irreversíveis. Tenha cuidado ao prosseguir.</p>
              <Button variant="destructive" onClick={handleDeleteGroup} className="inline-flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Excluir grupo permanentemente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
