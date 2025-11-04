using System.Text.Json;
using Arc.Application.DTOs.BusinessBudget;
using Arc.Application.Interfaces;
using Arc.Domain.Interfaces;

namespace Arc.Application.Services;

public class BusinessBudgetService : IBusinessBudgetService
{
    private readonly IPageRepository _pageRepository;

    public BusinessBudgetService(IPageRepository pageRepository)
    {
        _pageRepository = pageRepository;
    }

    public async Task<BusinessBudgetDataDto> GetAsync(Guid pageId, Guid userId)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<BusinessBudgetDataDto>(page.Data) ?? new BusinessBudgetDataDto();
        Recalc(data);
        return data;
    }

    public async Task<BusinessTransactionDto> AddAsync(Guid pageId, Guid userId, BusinessTransactionDto tx)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<BusinessBudgetDataDto>(page.Data) ?? new BusinessBudgetDataDto();

        tx.Id = string.IsNullOrWhiteSpace(tx.Id) ? Guid.NewGuid().ToString() : tx.Id;
        data.Transactions.Add(tx);
        Recalc(data);

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
        return tx;
    }

    public async Task<BusinessTransactionDto> UpdateAsync(Guid pageId, Guid userId, string txId, BusinessTransactionDto updated)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<BusinessBudgetDataDto>(page.Data) ?? new BusinessBudgetDataDto();
        var tx = data.Transactions.FirstOrDefault(t => t.Id == txId) ?? throw new InvalidOperationException("Transação não encontrada");

        tx.Type = updated.Type;
        tx.Amount = updated.Amount;
        tx.Category = updated.Category;
        tx.ProjectId = updated.ProjectId;
        tx.Date = updated.Date;
        Recalc(data);

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
        return tx;
    }

    public async Task DeleteAsync(Guid pageId, Guid userId, string txId)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<BusinessBudgetDataDto>(page.Data) ?? new BusinessBudgetDataDto();
        data.Transactions = data.Transactions.Where(t => t.Id != txId).ToList();
        Recalc(data);
        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
    }

    private static void Recalc(BusinessBudgetDataDto data)
    {
        data.TotalRevenue = data.Transactions.Where(t => t.Type == "revenue").Sum(t => t.Amount);
        data.TotalExpense = data.Transactions.Where(t => t.Type == "expense").Sum(t => t.Amount);
        data.Balance = data.TotalRevenue - data.TotalExpense + data.MRR;
    }

    private async Task EnsureAccessAsync(Guid pageId, Guid userId)
    {
        var group = await _pageRepository.GetGroupByPageIdAsync(pageId) ?? throw new InvalidOperationException("Grupo não encontrado para a página");
        var has = await HasAccessToWorkspace(group.WorkspaceId, userId);
        if (!has) throw new UnauthorizedAccessException("Acesso negado");
    }

    private Task<bool> HasAccessToWorkspace(Guid workspaceId, Guid userId) => Task.FromResult(true);
}

