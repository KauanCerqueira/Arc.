'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Settings, Shield, Mail, Trash2, Crown, Star, Eye } from 'lucide-react';
import teamService from '@/core/services/team.service';
import { useAuthStore } from '@/core/store/authStore';
import { useWorkspaceStore } from '@/core/store/workspaceStore';
import type { WorkspaceTeam, WorkspaceMember, TeamRole, InviteMemberDto } from '@/core/types/team.types';

const roleLabels: Record<TeamRole, string> = {
  0: 'Proprietário',
  1: 'Admin',
  2: 'Membro',
};

const roleColors: Record<TeamRole, string> = {
  0: 'text-purple-600 bg-purple-50',
  1: 'text-blue-600 bg-blue-50',
  2: 'text-gray-600 bg-gray-50',
};

const roleIcons: Record<TeamRole, React.ReactNode> = {
  0: <Crown className="w-3 h-3" />,
  1: <Star className="w-3 h-3" />,
  2: <Eye className="w-3 h-3" />,
};

export default function TeamSettingsPage() {
  const { user } = useAuthStore();
  const { workspace } = useWorkspaceStore();
  const [team, setTeam] = useState<WorkspaceTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>(2);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    loadTeam();
  }, [workspace?.id]);

  const loadTeam = async () => {
    if (!workspace?.id) return;

    try {
      setLoading(true);
      const data = await teamService.getTeam(workspace.id);
      setTeam(data);
    } catch (error) {
      console.error('Erro ao carregar time:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace?.id || !inviteEmail) return;

    try {
      const inviteData: InviteMemberDto = {
        email: inviteEmail,
        role: inviteRole,
      };

      await teamService.inviteMember(workspace.id, inviteData);
      setInviteEmail('');
      setShowInviteModal(false);
      loadTeam();
    } catch (error) {
      console.error('Erro ao convidar membro:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!workspace?.id) return;
    if (!confirm('Tem certeza que deseja remover este membro?')) return;

    try {
      await teamService.removeMember(workspace.id, memberId);
      loadTeam();
    } catch (error) {
      console.error('Erro ao remover membro:', error);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!workspace?.id) return;

    try {
      await teamService.cancelInvitation(workspace.id, invitationId);
      loadTeam();
    } catch (error) {
      console.error('Erro ao cancelar convite:', error);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: TeamRole) => {
    if (!workspace?.id) return;

    try {
      await teamService.updateMemberRole(workspace.id, memberId, { role: newRole });
      loadTeam();
    } catch (error) {
      console.error('Erro ao atualizar função:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Erro ao carregar informações do time</p>
      </div>
    );
  }

  const isOwner = team.members.some(m => m.userId === user?.userId && m.role === 0);
  const isAdmin = team.members.some(m => m.userId === user?.userId && (m.role === 0 || m.role === 1));

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Time</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Gerencie membros, funções e permissões do workspace
                </p>
              </div>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
              >
                <UserPlus className="w-4 h-4" />
                Convidar Membro
              </button>
            )}
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-gray-500">MEMBROS</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{team.currentMembers}</p>
              <p className="text-xs text-gray-500 mt-1">de {team.maxMembers} disponíveis</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Crown className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-xs font-medium text-gray-500">ADMINS</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {team.members.filter(m => m.role === 0 || m.role === 1).length}
              </p>
              <p className="text-xs text-gray-500 mt-1">administradores ativos</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <Mail className="w-5 h-5 text-yellow-600" />
                </div>
                <span className="text-xs font-medium text-gray-500">CONVITES</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{team.pendingInvitations.length}</p>
              <p className="text-xs text-gray-500 mt-1">aguardando resposta</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-xs font-medium text-gray-500">WORKSPACE</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 truncate">{team.type}</p>
              <p className="text-xs text-gray-500 mt-1">tipo do workspace</p>
            </div>
          </div>
        </div>

        {/* Membros Ativos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              Membros Ativos
              <span className="ml-auto text-sm font-normal text-gray-500">
                {team.members.length} {team.members.length === 1 ? 'membro' : 'membros'}
              </span>
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {team.members.map((member) => (
              <div key={member.id} className="p-6 flex items-center justify-between hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                    {member.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{member.userName}</p>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${roleColors[member.role]} shadow-sm`}>
                        {roleIcons[member.role]}
                        {roleLabels[member.role]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{member.userEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isOwner && member.role !== 0 && (
                    <>
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.id, Number(e.target.value) as TeamRole)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={1}>Admin</option>
                        <option value={2}>Membro</option>
                      </select>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {isAdmin && !isOwner && member.role === 2 && (
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
          </div>
        </div>

        {/* Convites Pendentes */}
        {team.pendingInvitations.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-white">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="p-1.5 bg-yellow-100 rounded-lg">
                  <Mail className="w-5 h-5 text-yellow-600" />
                </div>
                Convites Pendentes
                <span className="ml-auto text-sm font-normal text-gray-500">
                  {team.pendingInvitations.length} {team.pendingInvitations.length === 1 ? 'convite' : 'convites'}
                </span>
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {team.pendingInvitations.map((invitation) => (
                <div key={invitation.id} className="p-6 flex items-center justify-between hover:bg-gradient-to-r hover:from-yellow-50/30 hover:to-transparent transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow-md">
                      <Mail className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{invitation.email}</p>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${roleColors[invitation.role]} shadow-sm`}>
                          {roleIcons[invitation.role]}
                          {roleLabels[invitation.role]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Convidado por <span className="font-medium">{invitation.invitedByUserName}</span> • Expira em <span className="font-medium">{new Date(invitation.expiresAt).toLocaleDateString('pt-BR')}</span>
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleCancelInvitation(invitation.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal de Convite */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Convidar Membro</h3>
              </div>
              <form onSubmit={handleInviteMember} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Função
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(Number(e.target.value) as TeamRole)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {isOwner && <option value={1}>Admin</option>}
                    <option value={2}>Membro</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteEmail('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Enviar Convite
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
