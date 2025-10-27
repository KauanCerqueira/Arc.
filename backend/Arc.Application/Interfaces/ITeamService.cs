using Arc.Application.DTOs.Team;

namespace Arc.Application.Interfaces;

public interface ITeamService
{
    Task<WorkspaceTeamDto> GetTeamAsync(Guid workspaceId, Guid userId);
    Task<WorkspaceMemberDto> AddMemberAsync(Guid workspaceId, Guid userId, AddMemberDto dto);
    Task<bool> RemoveMemberAsync(Guid workspaceId, Guid userId, Guid memberId);
    Task<WorkspaceMemberDto> UpdateMemberRoleAsync(Guid workspaceId, Guid userId, Guid memberId, UpdateMemberRoleDto dto);
    Task<WorkspaceInvitationDto> InviteMemberAsync(Guid workspaceId, Guid userId, InviteMemberDto dto);
    Task<bool> CancelInvitationAsync(Guid workspaceId, Guid userId, Guid invitationId);
    Task<WorkspaceMemberDto> AcceptInvitationAsync(Guid userId, string invitationToken);
    Task<bool> DeclineInvitationAsync(Guid userId, string invitationToken);
    Task<IEnumerable<WorkspaceInvitationDto>> GetPendingInvitationsAsync(string email);
    Task<bool> UpgradeWorkspaceAsync(Guid workspaceId, Guid userId, int maxMembers);
    Task<GroupPermissionDto> SetGroupPermissionAsync(Guid workspaceId, Guid userId, SetGroupPermissionDto dto);
    Task<IEnumerable<GroupPermissionDto>> GetGroupPermissionsAsync(Guid groupId, Guid userId);
    Task<bool> RemoveGroupPermissionAsync(Guid workspaceId, Guid userId, Guid permissionId);
}
