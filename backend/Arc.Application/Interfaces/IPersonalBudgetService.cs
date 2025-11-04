using Arc.Application.DTOs.PersonalBudget;

namespace Arc.Application.Interfaces;

public interface IPersonalBudgetService
{
    Task<PersonalBudgetDataDto> GetAsync(Guid pageId, Guid userId);
    Task<PersonalTransactionDto> AddAsync(Guid pageId, Guid userId, PersonalTransactionDto tx);
    Task<PersonalTransactionDto> UpdateAsync(Guid pageId, Guid userId, string txId, PersonalTransactionDto updated);
    Task DeleteAsync(Guid pageId, Guid userId, string txId);
}

