using Arc.Domain.Entities;
using Arc.Domain.Enums;

namespace Arc.Domain.Interfaces;

public interface IWorkspaceInvitationRepository
{
    Task<WorkspaceInvitation?> GetByIdAsync(Guid id);
    Task<WorkspaceInvitation?> GetByTokenAsync(string token);
    Task<IEnumerable<WorkspaceInvitation>> GetByWorkspaceIdAsync(Guid workspaceId);
    Task<IEnumerable<WorkspaceInvitation>> GetByEmailAsync(string email);
    Task<IEnumerable<WorkspaceInvitation>> GetPendingByEmailAsync(string email);
    Task<WorkspaceInvitation> CreateAsync(WorkspaceInvitation invitation);
    Task UpdateAsync(WorkspaceInvitation invitation);
    Task DeleteAsync(Guid id);
    Task<bool> HasPendingInvitationAsync(Guid workspaceId, string email);
}
