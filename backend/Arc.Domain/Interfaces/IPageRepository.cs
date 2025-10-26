using Arc.Domain.Entities;

namespace Arc.Domain.Interfaces;

public interface IPageRepository
{
    Task<Page?> GetByIdAsync(Guid id);
    Task<Group?> GetGroupByPageIdAsync(Guid pageId);
    Task<IEnumerable<Page>> GetByGroupIdAsync(Guid groupId);
    Task<IEnumerable<Page>> GetFavoritesByWorkspaceIdAsync(Guid workspaceId);
    Task<IEnumerable<Page>> SearchAsync(Guid workspaceId, string query);
    Task<Page> CreateAsync(Page page);
    Task<Page> UpdateAsync(Page page);
    Task DeleteAsync(Guid id);
    Task ReorderAsync(Guid groupId, List<Guid> pageIds);
    Task MoveToGroupAsync(Guid pageId, Guid newGroupId);
}
