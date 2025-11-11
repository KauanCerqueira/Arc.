using Arc.Application.DTOs.Budget;

namespace Arc.Application.Interfaces;

public interface IBudgetService
{
    // CRUD Operations
    Task<BudgetResponseDto> CreateBudgetAsync(CreateBudgetDto dto, Guid userId);
    Task<BudgetResponseDto> GetBudgetByIdAsync(Guid budgetId, Guid userId);
    Task<List<BudgetResponseDto>> GetBudgetsByWorkspaceAsync(Guid workspaceId, Guid userId);
    Task<List<BudgetResponseDto>> GetBudgetsByPageAsync(Guid pageId, Guid userId);
    Task<BudgetResponseDto> UpdateBudgetAsync(Guid budgetId, UpdateBudgetDto dto, Guid userId);
    Task DeleteBudgetAsync(Guid budgetId, Guid userId);

    // Status Management
    Task<BudgetResponseDto> SendBudgetAsync(Guid budgetId, Guid userId);
    Task<BudgetResponseDto> ApproveBudgetAsync(Guid budgetId, Guid userId);
    Task<BudgetResponseDto> RejectBudgetAsync(Guid budgetId, Guid userId);

    // Calculations
    Task<QuickCalculationResultDto> QuickCalculateAsync(QuickCalculationDto dto);
    Task<BudgetResponseDto> RecalculateBudgetAsync(Guid budgetId, Guid userId);

    // Templates
    Task<List<BudgetTemplateDto>> GetTemplatesAsync();
    Task<BudgetResponseDto> CreateFromTemplateAsync(string templateName, Guid workspaceId, Guid pageId, Guid userId);

    // PDF Generation
    Task<byte[]> GeneratePdfAsync(Guid budgetId, GeneratePdfDto dto, Guid userId);

    // Analytics
    Task<Dictionary<string, object>> GetBudgetAnalyticsAsync(Guid workspaceId, Guid userId);
}
