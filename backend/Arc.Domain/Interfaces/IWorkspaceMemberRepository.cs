using Arc.Domain.Entities;
using Arc.Domain.Enums;

namespace Arc.Domain.Interfaces;

public interface IWorkspaceMemberRepository
{
    Task<WorkspaceMember?> GetByIdAsync(Guid id);
    Task<WorkspaceMember?> GetByWorkspaceAndUserAsync(Guid workspaceId, Guid userId);
    Task<IEnumerable<WorkspaceMember>> GetByWorkspaceIdAsync(Guid workspaceId);
    Task<IEnumerable<WorkspaceMember>> GetByUserIdAsync(Guid userId);
    Task<int> GetMemberCountAsync(Guid workspaceId);
    Task<WorkspaceMember> CreateAsync(WorkspaceMember member);
    Task UpdateAsync(WorkspaceMember member);
    Task DeleteAsync(Guid id);
    Task<bool> IsUserMemberAsync(Guid workspaceId, Guid userId);
    Task<TeamRole?> GetUserRoleAsync(Guid workspaceId, Guid userId);
}
