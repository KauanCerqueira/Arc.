using Arc.Domain.Entities;
using Arc.Domain.Interfaces;
using Arc.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Arc.Infrastructure.Repositories;

public class SprintTaskRepository : ISprintTaskRepository
{
    private readonly AppDbContext _context;

    public SprintTaskRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SprintTask?> GetByIdAsync(Guid id)
    {
        return await _context.SprintTasks
            .AsNoTracking()
            .Include(t => t.AssignedUser)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<List<SprintTask>> GetBySprintIdAsync(Guid sprintId)
    {
        return await _context.SprintTasks
            .AsNoTracking()
            .Include(t => t.AssignedUser)
            .Where(t => t.SprintId == sprintId)
            .OrderBy(t => t.Order)
            .ToListAsync();
    }

    public async Task<SprintTask> CreateAsync(SprintTask task)
    {
        _context.SprintTasks.Add(task);
        await _context.SaveChangesAsync();
        return task;
    }

    public async Task<SprintTask> UpdateAsync(SprintTask task)
    {
        task.UpdatedAt = DateTime.UtcNow;
        _context.SprintTasks.Update(task);
        await _context.SaveChangesAsync();
        return task;
    }

    public async Task DeleteAsync(Guid id)
    {
        var task = await _context.SprintTasks.FindAsync(id);
        if (task != null)
        {
            _context.SprintTasks.Remove(task);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.SprintTasks.AnyAsync(t => t.Id == id);
    }

    public async Task<int> GetMaxOrderBySprintIdAsync(Guid sprintId)
    {
        var maxOrder = await _context.SprintTasks
            .Where(t => t.SprintId == sprintId)
            .MaxAsync(t => (int?)t.Order);

        return maxOrder ?? 0;
    }
}
