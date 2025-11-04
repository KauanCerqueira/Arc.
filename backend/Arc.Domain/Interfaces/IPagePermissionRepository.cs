using Arc.Domain.Entities;

namespace Arc.Domain.Interfaces;

public interface IPagePermissionRepository
{
    Task<PagePermission?> GetByIdAsync(Guid id);
    Task<PagePermission?> GetByPageAndUserAsync(Guid pageId, Guid userId);
    Task<IEnumerable<PagePermission>> GetByPageIdAsync(Guid pageId);
    Task<IEnumerable<PagePermission>> GetByUserIdAsync(Guid userId);
    Task<PagePermission> CreateAsync(PagePermission permission);
    Task<PagePermission> UpdateAsync(PagePermission permission);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> HasPermissionAsync(Guid pageId, Guid userId, string permissionType);
}
