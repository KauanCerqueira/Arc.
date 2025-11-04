using System.Text.Json;
using Arc.Application.DTOs.Templates;
using Arc.Application.Interfaces;
using Arc.Domain.Interfaces;

namespace Arc.Application.Services;

public class BudgetService : IBudgetService
{
    private readonly IPageRepository _pageRepository;

    public BudgetService(IPageRepository pageRepository)
    {
        _pageRepository = pageRepository;
    }

    public async Task<BudgetDataDto> GetAsync(Guid pageId, Guid userId)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<BudgetDataDto>(page.Data) ?? new BudgetDataDto();
        Recalc(data);
        return data;
    }

    public async Task<BudgetItemDto> AddItemAsync(Guid pageId, Guid userId, BudgetItemDto item)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<BudgetDataDto>(page.Data) ?? new BudgetDataDto();

        item.Id = string.IsNullOrWhiteSpace(item.Id) ? Guid.NewGuid().ToString() : item.Id;
        data.Items.Add(item);
        Recalc(data);

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);

        return item;
    }

    public async Task DeleteItemAsync(Guid pageId, Guid userId, string itemId)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<BudgetDataDto>(page.Data) ?? new BudgetDataDto();
        data.Items = data.Items.Where(i => i.Id != itemId).ToList();
        Recalc(data);
        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
    }

    public async Task<BudgetStatisticsDto> GetStatisticsAsync(Guid pageId, Guid userId)
    {
        var data = await GetAsync(pageId, userId);
        return new BudgetStatisticsDto
        {
            TotalIncome = data.TotalIncome,
            TotalExpense = data.TotalExpense,
            Balance = data.Balance,
            ItemCount = data.Items.Count
        };
    }

    private static void Recalc(BudgetDataDto data)
    {
        data.TotalIncome = data.Items.Where(i => i.Type == "income").Sum(i => i.Amount);
        data.TotalExpense = data.Items.Where(i => i.Type == "expense").Sum(i => i.Amount);
        data.Balance = data.TotalIncome - data.TotalExpense;
    }

    private async Task EnsureAccessAsync(Guid pageId, Guid userId)
    {
        var group = await _pageRepository.GetGroupByPageIdAsync(pageId) ?? throw new InvalidOperationException("Grupo não encontrado para a página");
        var has = await HasAccessToWorkspace(group.WorkspaceId, userId);
        if (!has) throw new UnauthorizedAccessException("Acesso negado");
    }

    private Task<bool> HasAccessToWorkspace(Guid workspaceId, Guid userId) => Task.FromResult(true);
}

