using Arc.Domain.Entities;

namespace Arc.Domain.Interfaces;

public interface IBudgetRepository
{
    Task<Budget?> GetByIdAsync(Guid id);
    Task<Budget?> GetByIdWithDetailsAsync(Guid id);
    Task<Budget?> GetByBudgetNumberAsync(string budgetNumber);
    Task<List<Budget>> GetByWorkspaceIdAsync(Guid workspaceId);
    Task<List<Budget>> GetByPageIdAsync(Guid pageId);
    Task<Budget> CreateAsync(Budget budget);
    Task<Budget> UpdateAsync(Budget budget);
    Task DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task<string> GenerateBudgetNumberAsync(Guid workspaceId);
}
