using Arc.Domain.Entities;
using Arc.Domain.Enums;
using Arc.Domain.Interfaces;
using Arc.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Arc.Infrastructure.Repositories;

public class WorkspaceInvitationRepository : IWorkspaceInvitationRepository
{
    private readonly AppDbContext _context;

    public WorkspaceInvitationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<WorkspaceInvitation?> GetByIdAsync(Guid id)
    {
        return await _context.WorkspaceInvitations
            .Include(i => i.Workspace)
            .Include(i => i.InvitedByUser)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<WorkspaceInvitation?> GetByTokenAsync(string token)
    {
        return await _context.WorkspaceInvitations
            .Include(i => i.Workspace)
            .Include(i => i.InvitedByUser)
            .FirstOrDefaultAsync(i => i.InvitationToken == token);
    }

    public async Task<IEnumerable<WorkspaceInvitation>> GetByWorkspaceIdAsync(Guid workspaceId)
    {
        return await _context.WorkspaceInvitations
            .Include(i => i.InvitedByUser)
            .Where(i => i.WorkspaceId == workspaceId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<WorkspaceInvitation>> GetByEmailAsync(string email)
    {
        return await _context.WorkspaceInvitations
            .Include(i => i.Workspace)
            .Include(i => i.InvitedByUser)
            .Where(i => i.Email.ToLower() == email.ToLower())
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<WorkspaceInvitation>> GetPendingByEmailAsync(string email)
    {
        return await _context.WorkspaceInvitations
            .Include(i => i.Workspace)
            .Include(i => i.InvitedByUser)
            .Where(i => i.Email.ToLower() == email.ToLower()
                     && i.Status == InvitationStatus.Pending
                     && i.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    public async Task<WorkspaceInvitation> CreateAsync(WorkspaceInvitation invitation)
    {
        _context.WorkspaceInvitations.Add(invitation);
        await _context.SaveChangesAsync();
        return invitation;
    }

    public async Task UpdateAsync(WorkspaceInvitation invitation)
    {
        _context.WorkspaceInvitations.Update(invitation);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var invitation = await GetByIdAsync(id);
        if (invitation != null)
        {
            _context.WorkspaceInvitations.Remove(invitation);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> HasPendingInvitationAsync(Guid workspaceId, string email)
    {
        return await _context.WorkspaceInvitations
            .AnyAsync(i => i.WorkspaceId == workspaceId
                        && i.Email.ToLower() == email.ToLower()
                        && i.Status == InvitationStatus.Pending
                        && i.ExpiresAt > DateTime.UtcNow);
    }
}
