using Arc.Domain.Entities;

namespace Arc.Domain.Interfaces;

public interface ISprintRepository
{
    Task<Sprint?> GetByIdAsync(Guid id);
    Task<Sprint?> GetByPageIdAsync(Guid pageId);
    Task<Sprint?> GetByIdWithTasksAsync(Guid id);
    Task<List<Sprint>> GetByWorkspaceIdAsync(Guid workspaceId);
    Task<Sprint> CreateAsync(Sprint sprint);
    Task<Sprint> UpdateAsync(Sprint sprint);
    Task DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
}
