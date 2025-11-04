using Arc.Application.DTOs.Templates;

namespace Arc.Application.Interfaces;

public interface IBudgetService
{
    Task<BudgetDataDto> GetAsync(Guid pageId, Guid userId);
    Task<BudgetItemDto> AddItemAsync(Guid pageId, Guid userId, BudgetItemDto item);
    Task DeleteItemAsync(Guid pageId, Guid userId, string itemId);
    Task<BudgetStatisticsDto> GetStatisticsAsync(Guid pageId, Guid userId);
}

