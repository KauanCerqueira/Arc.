using Arc.Domain.Entities;

namespace Arc.Domain.Interfaces;

public interface IGroupPermissionRepository
{
    Task<GroupPermission?> GetByIdAsync(Guid id);
    Task<GroupPermission?> GetByGroupAndUserAsync(Guid groupId, Guid userId);
    Task<IEnumerable<GroupPermission>> GetByGroupIdAsync(Guid groupId);
    Task<IEnumerable<GroupPermission>> GetByUserIdAsync(Guid userId);
    Task<GroupPermission> CreateAsync(GroupPermission permission);
    Task UpdateAsync(GroupPermission permission);
    Task DeleteAsync(Guid id);
    Task DeleteByGroupIdAsync(Guid groupId);
    Task<bool> UserHasPermissionAsync(Guid groupId, Guid userId);
}
