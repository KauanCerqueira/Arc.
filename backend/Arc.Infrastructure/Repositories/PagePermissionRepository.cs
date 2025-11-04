using Arc.Domain.Entities;
using Arc.Domain.Interfaces;
using Arc.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Arc.Infrastructure.Repositories;

public class PagePermissionRepository : IPagePermissionRepository
{
    private readonly AppDbContext _context;

    public PagePermissionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagePermission?> GetByIdAsync(Guid id)
    {
        return await _context.PagePermissions
            .Include(p => p.User)
            .Include(p => p.Page)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<PagePermission?> GetByPageAndUserAsync(Guid pageId, Guid userId)
    {
        return await _context.PagePermissions
            .Include(p => p.User)
            .Include(p => p.Page)
            .FirstOrDefaultAsync(p => p.PageId == pageId && p.UserId == userId);
    }

    public async Task<IEnumerable<PagePermission>> GetByPageIdAsync(Guid pageId)
    {
        return await _context.PagePermissions
            .Include(p => p.User)
            .Include(p => p.Page)
            .Where(p => p.PageId == pageId)
            .ToListAsync();
    }

    public async Task<IEnumerable<PagePermission>> GetByUserIdAsync(Guid userId)
    {
        return await _context.PagePermissions
            .Include(p => p.User)
            .Include(p => p.Page)
            .Where(p => p.UserId == userId)
            .ToListAsync();
    }

    public async Task<PagePermission> CreateAsync(PagePermission permission)
    {
        _context.PagePermissions.Add(permission);
        await _context.SaveChangesAsync();
        return permission;
    }

    public async Task<PagePermission> UpdateAsync(PagePermission permission)
    {
        permission.UpdatedAt = DateTime.UtcNow;
        _context.PagePermissions.Update(permission);
        await _context.SaveChangesAsync();
        return permission;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var permission = await _context.PagePermissions.FindAsync(id);
        if (permission == null)
            return false;

        _context.PagePermissions.Remove(permission);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> HasPermissionAsync(Guid pageId, Guid userId, string permissionType)
    {
        var permission = await GetByPageAndUserAsync(pageId, userId);
        if (permission == null)
            return false;

        return permissionType.ToLower() switch
        {
            "view" => permission.CanView,
            "edit" => permission.CanEdit,
            "comment" => permission.CanComment,
            "delete" => permission.CanDelete,
            "share" => permission.CanShare,
            _ => false
        };
    }
}
