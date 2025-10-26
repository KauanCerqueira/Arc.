using Arc.Domain.Entities;

namespace Arc.Domain.Interfaces;

public interface IGroupRepository
{
    Task<Group?> GetByIdAsync(Guid id);
    Task<Group?> GetWithPagesAsync(Guid id);
    Task<IEnumerable<Group>> GetByWorkspaceIdAsync(Guid workspaceId);
    Task<Group> CreateAsync(Group group);
    Task<Group> UpdateAsync(Group group);
    Task DeleteAsync(Guid id);
    Task ReorderAsync(Guid workspaceId, List<Guid> groupIds);
}
