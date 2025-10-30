using Arc.Domain.Entities;

namespace Arc.Domain.Interfaces;

public interface IWorkspaceRepository
{
    Task<Workspace?> GetByIdAsync(Guid id);
    Task<Workspace?> GetByUserIdAsync(Guid userId);
    Task<List<Workspace>> GetAllByUserIdAsync(Guid userId);
    Task<Workspace?> GetWithGroupsAndPagesAsync(Guid userId, Guid workspaceId);
    Task<Workspace> CreateAsync(Workspace workspace);
    Task<Workspace> UpdateAsync(Workspace workspace);
    Task DeleteAsync(Guid id);
    Task<IEnumerable<Workspace>> GetAllAsync();
}
