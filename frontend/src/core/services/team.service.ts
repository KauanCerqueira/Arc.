import api from './api.service';
import type {
  WorkspaceTeam,
  WorkspaceMember,
  WorkspaceInvitation,
  AddMemberDto,
  UpdateMemberRoleDto,
  InviteMemberDto,
  GroupPermission,
  SetGroupPermissionDto,
  UpgradeWorkspaceDto,
  PagePermission,
  SetPagePermissionDto,
} from '../types/team.types';

class TeamService {
  /**
   * Obtém as informações do time do workspace
   */
  async getTeam(workspaceId: string): Promise<WorkspaceTeam> {
    const response = await api.get<WorkspaceTeam>(`/workspaces/${workspaceId}/team`);
    return response.data;
  }

  /**
   * Adiciona um membro ao workspace
   */
  async addMember(workspaceId: string, data: AddMemberDto): Promise<WorkspaceMember> {
    const response = await api.post<WorkspaceMember>(`/workspaces/${workspaceId}/team/members`, data);
    return response.data;
  }

  /**
   * Remove um membro do workspace
   */
  async removeMember(workspaceId: string, memberId: string): Promise<void> {
    await api.delete(`/workspaces/${workspaceId}/team/members/${memberId}`);
  }

  /**
   * Atualiza a função de um membro
   */
  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    data: UpdateMemberRoleDto
  ): Promise<WorkspaceMember> {
    const response = await api.put<WorkspaceMember>(
      `/workspaces/${workspaceId}/team/members/${memberId}/role`,
      data
    );
    return response.data;
  }

  /**
   * Envia um convite para o workspace
   */
  async inviteMember(workspaceId: string, data: InviteMemberDto): Promise<WorkspaceInvitation> {
    const response = await api.post<WorkspaceInvitation>(
      `/workspaces/${workspaceId}/team/invitations`,
      data
    );
    return response.data;
  }

  /**
   * Cancela um convite pendente
   */
  async cancelInvitation(workspaceId: string, invitationId: string): Promise<void> {
    await api.delete(`/workspaces/${workspaceId}/team/invitations/${invitationId}`);
  }

  /**
   * Obtém convites pendentes do usuário
   */
  async getPendingInvitations(): Promise<WorkspaceInvitation[]> {
    const response = await api.get<WorkspaceInvitation[]>('/invitations/pending');
    return response.data;
  }

  /**
   * Aceita um convite
   */
  async acceptInvitation(invitationToken: string): Promise<WorkspaceMember> {
    const response = await api.post<WorkspaceMember>(`/invitations/${invitationToken}/accept`);
    return response.data;
  }

  /**
   * Recusa um convite
   */
  async declineInvitation(invitationToken: string): Promise<void> {
    await api.post(`/invitations/${invitationToken}/decline`);
  }

  /**
   * Faz upgrade do workspace (aumenta limite de membros)
   */
  async upgradeWorkspace(workspaceId: string, data: UpgradeWorkspaceDto): Promise<void> {
    await api.post(`/workspaces/${workspaceId}/team/upgrade`, data);
  }

  /**
   * Define permissões de um membro em um grupo
   */
  async setGroupPermission(
    workspaceId: string,
    data: SetGroupPermissionDto
  ): Promise<GroupPermission> {
    const response = await api.post<GroupPermission>(
      `/workspaces/${workspaceId}/team/permissions`,
      data
    );
    return response.data;
  }

  /**
   * Obtém permissões de um grupo
   */
  async getGroupPermissions(workspaceId: string, groupId: string): Promise<GroupPermission[]> {
    const response = await api.get<GroupPermission[]>(
      `/workspaces/${workspaceId}/team/groups/${groupId}/permissions`
    );
    return response.data;
  }

  /**
   * Remove uma permissão de grupo
   */
  async removeGroupPermission(workspaceId: string, permissionId: string): Promise<void> {
    await api.delete(`/workspaces/${workspaceId}/team/permissions/${permissionId}`);
  }

  /**
   * Define permissões de um membro em uma página
   */
  async setPagePermission(
    workspaceId: string,
    data: SetPagePermissionDto
  ): Promise<PagePermission> {
    const response = await api.post<PagePermission>(
      `/workspaces/${workspaceId}/team/page-permissions`,
      data
    );
    return response.data;
  }

  /**
   * Obtém permissões de uma página
   */
  async getPagePermissions(workspaceId: string, pageId: string): Promise<PagePermission[]> {
    const response = await api.get<PagePermission[]>(
      `/workspaces/${workspaceId}/team/pages/${pageId}/permissions`
    );
    return response.data;
  }

  /**
   * Remove uma permissão de página
   */
  async removePagePermission(workspaceId: string, permissionId: string): Promise<void> {
    await api.delete(`/workspaces/${workspaceId}/team/page-permissions/${permissionId}`);
  }
}

export default new TeamService();
