using Arc.Domain.Entities;
using Arc.Domain.Interfaces;
using Arc.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Arc.Infrastructure.Repositories;

public class GroupPermissionRepository : IGroupPermissionRepository
{
    private readonly AppDbContext _context;

    public GroupPermissionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<GroupPermission?> GetByIdAsync(Guid id)
    {
        return await _context.GroupPermissions
            .Include(p => p.User)
            .Include(p => p.Group)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<GroupPermission?> GetByGroupAndUserAsync(Guid groupId, Guid userId)
    {
        return await _context.GroupPermissions
            .FirstOrDefaultAsync(p => p.GroupId == groupId && p.UserId == userId);
    }

    public async Task<IEnumerable<GroupPermission>> GetByGroupIdAsync(Guid groupId)
    {
        return await _context.GroupPermissions
            .Include(p => p.User)
            .Where(p => p.GroupId == groupId)
            .ToListAsync();
    }

    public async Task<IEnumerable<GroupPermission>> GetByUserIdAsync(Guid userId)
    {
        return await _context.GroupPermissions
            .Include(p => p.Group)
            .Where(p => p.UserId == userId)
            .ToListAsync();
    }

    public async Task<GroupPermission> CreateAsync(GroupPermission permission)
    {
        _context.GroupPermissions.Add(permission);
        await _context.SaveChangesAsync();
        return permission;
    }

    public async Task UpdateAsync(GroupPermission permission)
    {
        permission.UpdatedAt = DateTime.UtcNow;
        _context.GroupPermissions.Update(permission);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var permission = await GetByIdAsync(id);
        if (permission != null)
        {
            _context.GroupPermissions.Remove(permission);
            await _context.SaveChangesAsync();
        }
    }

    public async Task DeleteByGroupIdAsync(Guid groupId)
    {
        var permissions = await _context.GroupPermissions
            .Where(p => p.GroupId == groupId)
            .ToListAsync();

        _context.GroupPermissions.RemoveRange(permissions);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> UserHasPermissionAsync(Guid groupId, Guid userId)
    {
        return await _context.GroupPermissions
            .AnyAsync(p => p.GroupId == groupId && p.UserId == userId);
    }
}
