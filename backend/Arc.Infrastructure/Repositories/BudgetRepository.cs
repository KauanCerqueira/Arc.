using Arc.Domain.Entities;
using Arc.Domain.Interfaces;
using Arc.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Arc.Infrastructure.Repositories;

public class BudgetRepository : IBudgetRepository
{
    private readonly AppDbContext _context;

    public BudgetRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Budget?> GetByIdAsync(Guid id)
    {
        return await _context.Budgets
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == id && b.IsActive);
    }

    public async Task<Budget?> GetByIdWithDetailsAsync(Guid id)
    {
        return await _context.Budgets
            .AsNoTracking()
            .Include(b => b.Items.OrderBy(i => i.Order))
            .Include(b => b.Phases.OrderBy(p => p.Order))
            .FirstOrDefaultAsync(b => b.Id == id && b.IsActive);
    }

    public async Task<Budget?> GetByBudgetNumberAsync(string budgetNumber)
    {
        return await _context.Budgets
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.BudgetNumber == budgetNumber && b.IsActive);
    }

    public async Task<List<Budget>> GetByWorkspaceIdAsync(Guid workspaceId)
    {
        return await _context.Budgets
            .AsNoTracking()
            .Where(b => b.WorkspaceId == workspaceId && b.IsActive)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Budget>> GetByPageIdAsync(Guid pageId)
    {
        return await _context.Budgets
            .AsNoTracking()
            .Include(b => b.Items)
            .Include(b => b.Phases)
            .Where(b => b.PageId == pageId && b.IsActive)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<Budget> CreateAsync(Budget budget)
    {
        _context.Budgets.Add(budget);
        await _context.SaveChangesAsync();
        return budget;
    }

    public async Task<Budget> UpdateAsync(Budget budget)
    {
        budget.UpdatedAt = DateTime.UtcNow;
        _context.Budgets.Update(budget);
        await _context.SaveChangesAsync();
        return budget;
    }

    public async Task DeleteAsync(Guid id)
    {
        var budget = await _context.Budgets.FindAsync(id);
        if (budget != null)
        {
            budget.IsActive = false;
            budget.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.Budgets.AnyAsync(b => b.Id == id && b.IsActive);
    }

    public async Task<string> GenerateBudgetNumberAsync(Guid workspaceId)
    {
        var year = DateTime.UtcNow.Year;
        var month = DateTime.UtcNow.Month;

        var count = await _context.Budgets
            .Where(b => b.WorkspaceId == workspaceId &&
                       b.CreatedAt.Year == year &&
                       b.CreatedAt.Month == month)
            .CountAsync();

        return $"ARC-{year}{month:D2}-{(count + 1):D4}";
    }
}
