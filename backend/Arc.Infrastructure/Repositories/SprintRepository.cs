using Arc.Domain.Entities;
using Arc.Domain.Interfaces;
using Arc.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Arc.Infrastructure.Repositories;

public class SprintRepository : ISprintRepository
{
    private readonly AppDbContext _context;

    public SprintRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Sprint?> GetByIdAsync(Guid id)
    {
        return await _context.Sprints
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id && s.IsActive);
    }

    public async Task<Sprint?> GetByPageIdAsync(Guid pageId)
    {
        return await _context.Sprints
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.PageId == pageId && s.IsActive);
    }

    public async Task<Sprint?> GetByIdWithTasksAsync(Guid id)
    {
        return await _context.Sprints
            .AsNoTracking()
            .Include(s => s.Tasks.OrderBy(t => t.Order))
                .ThenInclude(t => t.AssignedUser)
            .FirstOrDefaultAsync(s => s.Id == id && s.IsActive);
    }

    public async Task<List<Sprint>> GetByWorkspaceIdAsync(Guid workspaceId)
    {
        return await _context.Sprints
            .AsNoTracking()
            .Where(s => s.WorkspaceId == workspaceId && s.IsActive)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    public async Task<Sprint> CreateAsync(Sprint sprint)
    {
        _context.Sprints.Add(sprint);
        await _context.SaveChangesAsync();
        return sprint;
    }

    public async Task<Sprint> UpdateAsync(Sprint sprint)
    {
        sprint.UpdatedAt = DateTime.UtcNow;
        _context.Sprints.Update(sprint);
        await _context.SaveChangesAsync();
        return sprint;
    }

    public async Task DeleteAsync(Guid id)
    {
        var sprint = await _context.Sprints.FindAsync(id);
        if (sprint != null)
        {
            sprint.IsActive = false;
            sprint.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.Sprints
            .AnyAsync(s => s.Id == id && s.IsActive);
    }
}
