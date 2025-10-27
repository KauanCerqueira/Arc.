using Arc.Domain.Entities;
using Arc.Domain.Enums;
using Arc.Domain.Interfaces;
using Arc.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Arc.Infrastructure.Repositories;

public class WorkspaceMemberRepository : IWorkspaceMemberRepository
{
    private readonly AppDbContext _context;

    public WorkspaceMemberRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<WorkspaceMember?> GetByIdAsync(Guid id)
    {
        return await _context.WorkspaceMembers
            .Include(m => m.User)
            .Include(m => m.Workspace)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<WorkspaceMember?> GetByWorkspaceAndUserAsync(Guid workspaceId, Guid userId)
    {
        return await _context.WorkspaceMembers
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.WorkspaceId == workspaceId && m.UserId == userId);
    }

    public async Task<IEnumerable<WorkspaceMember>> GetByWorkspaceIdAsync(Guid workspaceId)
    {
        return await _context.WorkspaceMembers
            .Include(m => m.User)
            .Where(m => m.WorkspaceId == workspaceId && m.IsActive)
            .OrderBy(m => m.JoinedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<WorkspaceMember>> GetByUserIdAsync(Guid userId)
    {
        return await _context.WorkspaceMembers
            .Include(m => m.Workspace)
            .Where(m => m.UserId == userId && m.IsActive)
            .ToListAsync();
    }

    public async Task<int> GetMemberCountAsync(Guid workspaceId)
    {
        return await _context.WorkspaceMembers
            .CountAsync(m => m.WorkspaceId == workspaceId && m.IsActive);
    }

    public async Task<WorkspaceMember> CreateAsync(WorkspaceMember member)
    {
        _context.WorkspaceMembers.Add(member);
        await _context.SaveChangesAsync();
        return member;
    }

    public async Task UpdateAsync(WorkspaceMember member)
    {
        _context.WorkspaceMembers.Update(member);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var member = await GetByIdAsync(id);
        if (member != null)
        {
            _context.WorkspaceMembers.Remove(member);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> IsUserMemberAsync(Guid workspaceId, Guid userId)
    {
        return await _context.WorkspaceMembers
            .AnyAsync(m => m.WorkspaceId == workspaceId && m.UserId == userId && m.IsActive);
    }

    public async Task<TeamRole?> GetUserRoleAsync(Guid workspaceId, Guid userId)
    {
        var member = await _context.WorkspaceMembers
            .FirstOrDefaultAsync(m => m.WorkspaceId == workspaceId && m.UserId == userId && m.IsActive);
        return member?.Role;
    }
}
