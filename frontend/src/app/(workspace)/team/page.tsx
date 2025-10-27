"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/core/store/authStore";
import { useWorkspaceStore } from "@/core/store/workspaceStore";
import teamService from "@/core/services/team.service";
import {
  Users,
  UserPlus,
  Mail,
  Crown,
  Shield,
  User,
  X,
  Check,
  Clock,
  Trash2,
  ArrowUpCircle,
  Settings,
} from "lucide-react";
import type {
  WorkspaceTeam,
  TeamRole,
  InviteMemberDto,
} from "@/core/types/team.types";

const TEAM_ROLE_LABELS = {
  0: "Dono",
  1: "Admin",
  2: "Membro",
};

const TEAM_ROLE_ICONS = {
  0: Crown,
  1: Shield,
  2: User,
};

export default function TeamPage() {
  const { user } = useAuthStore();
  const { workspace } = useWorkspaceStore();
  const [team, setTeam] = useState<WorkspaceTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"members" | "invitations">("members");

  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>(2);
  const [newMaxMembers, setNewMaxMembers] = useState(5);

  useEffect(() => {
    if (workspace) {
      fetchTeam();
    }
  }, [workspace]);

  const fetchTeam = async () => {
    if (!workspace) return;

    try {
      setLoading(true);
      setError(null);
      const data = await teamService.getTeam(workspace.id);
      setTeam(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao carregar time");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!workspace || !inviteEmail) return;

    try {
      const data: InviteMemberDto = {
        email: inviteEmail,
        role: inviteRole,
      };
      await teamService.inviteMember(workspace.id, data);
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteRole(2);
      fetchTeam();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erro ao enviar convite");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!workspace || !confirm("Deseja realmente remover este membro?")) return;

    try {
      await teamService.removeMember(workspace.id, memberId);
      fetchTeam();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erro ao remover membro");
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!workspace || !confirm("Deseja realmente cancelar este convite?")) return;

    try {
      await teamService.cancelInvitation(workspace.id, invitationId);
      fetchTeam();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erro ao cancelar convite");
    }
  };

  const handleUpgrade = async () => {
    if (!workspace) return;

    try {
      await teamService.upgradeWorkspace(workspace.id, { maxMembers: newMaxMembers });
      setShowUpgradeModal(false);
      fetchTeam();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erro ao fazer upgrade");
    }
  };

  const getRoleIcon = (role: TeamRole) => {
    const Icon = TEAM_ROLE_ICONS[role];
    return <Icon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Carregando time...</div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Erro: {error || "Não foi possível carregar o time"}</div>
      </div>
    );
  }

  const isOwner = workspace?.id === user?.userId;
  const canManageTeam = isOwner;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Time</h1>
              <p className="text-gray-600">{team.workspaceName}</p>
            </div>
            {canManageTeam && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  Upgrade
                </button>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Convidar Membro
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {team.currentMembers} / {team.maxMembers}
                  </div>
                  <div className="text-sm text-gray-600">Membros</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {team.pendingInvitations.length}
                  </div>
                  <div className="text-sm text-gray-600">Convites Pendentes</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  {team.type === 0 ? (
                    <User className="w-5 h-5 text-purple-600" />
                  ) : (
                    <Users className="w-5 h-5 text-purple-600" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {team.type === 0 ? "Individual" : "Time"}
                  </div>
                  <div className="text-xs text-gray-600">Tipo de Workspace</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab("members")}
                className={`pb-3 px-1 font-medium transition-colors ${
                  activeTab === "members"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Membros ({team.members.length})
              </button>
              <button
                onClick={() => setActiveTab("invitations")}
                className={`pb-3 px-1 font-medium transition-colors ${
                  activeTab === "invitations"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Convites ({team.pendingInvitations.length})
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === "members" && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="divide-y divide-gray-200">
              {team.members.map((member) => (
                <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {member.userIcon ? (
                        <span className="text-lg">{member.userIcon}</span>
                      ) : (
                        <span className="text-sm font-semibold text-gray-600">
                          {member.userName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{member.userName}</div>
                      <div className="text-sm text-gray-600">{member.userEmail}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                      {getRoleIcon(member.role)}
                      <span className="text-sm font-medium text-gray-700">
                        {TEAM_ROLE_LABELS[member.role]}
                      </span>
                    </div>

                    {canManageTeam && member.userId !== user?.userId && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {team.members.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Nenhum membro adicionado ainda
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "invitations" && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="divide-y divide-gray-200">
              {team.pendingInvitations.map((invitation) => (
                <div key={invitation.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{invitation.email}</div>
                      <div className="text-sm text-gray-600">
                        Convidado por {invitation.invitedByUserName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 rounded-lg">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-700">Pendente</span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                      {getRoleIcon(invitation.role)}
                      <span className="text-sm font-medium text-gray-700">
                        {TEAM_ROLE_LABELS[invitation.role]}
                      </span>
                    </div>

                    {canManageTeam && (
                      <button
                        onClick={() => handleCancelInvitation(invitation.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {team.pendingInvitations.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Nenhum convite pendente
                </div>
              )}
            </div>
          </div>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Convidar Membro</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="usuario@exemplo.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Função
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(Number(e.target.value) as TeamRole)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={2}>Membro</option>
                    <option value={1}>Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleInviteMember}
                  disabled={!inviteEmail}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Enviar Convite
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Upgrade do Workspace</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número máximo de membros
                  </label>
                  <input
                    type="number"
                    min={team.maxMembers}
                    value={newMaxMembers}
                    onChange={(e) => setNewMaxMembers(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Limite atual: {team.maxMembers} membros
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-900">
                    <strong>Plano Team:</strong> Até 5 membros inclusos no plano base. Membros adicionais custam R$ 10/mês por membro.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpgrade}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Confirmar Upgrade
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
