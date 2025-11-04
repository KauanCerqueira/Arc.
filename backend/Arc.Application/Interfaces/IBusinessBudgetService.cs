using Arc.Application.DTOs.BusinessBudget;

namespace Arc.Application.Interfaces;

public interface IBusinessBudgetService
{
    Task<BusinessBudgetDataDto> GetAsync(Guid pageId, Guid userId);
    Task<BusinessTransactionDto> AddAsync(Guid pageId, Guid userId, BusinessTransactionDto tx);
    Task<BusinessTransactionDto> UpdateAsync(Guid pageId, Guid userId, string txId, BusinessTransactionDto updated);
    Task DeleteAsync(Guid pageId, Guid userId, string txId);
}

