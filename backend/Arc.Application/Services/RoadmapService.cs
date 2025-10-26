using System.Text.Json;
using Arc.Application.DTOs.Roadmap;
using Arc.Application.Interfaces;
using Arc.Domain.Interfaces;

namespace Arc.Application.Services;

public class RoadmapService : IRoadmapService
{
    private readonly IPageRepository _pageRepository;

    public RoadmapService(IPageRepository pageRepository)
    {
        _pageRepository = pageRepository;
    }

    public async Task<RoadmapDataDto> GetRoadmapDataAsync(Guid pageId, Guid userId)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        // Verificar acesso
        var group = await _pageRepository.GetGroupByPageIdAsync(pageId);
        if (group == null || !await HasAccessToWorkspace(group.WorkspaceId, userId))
        {
            throw new UnauthorizedAccessException("Acesso negado");
        }

        var items = JsonSerializer.Deserialize<List<RoadmapItemDto>>(page.Data)
            ?? new List<RoadmapItemDto>();

        var statistics = GenerateStatistics(items);

        return new RoadmapDataDto
        {
            Items = items,
            Statistics = statistics
        };
    }

    public async Task<RoadmapStatisticsDto> GetStatisticsAsync(Guid pageId, Guid userId)
    {
        var data = await GetRoadmapDataAsync(pageId, userId);
        return data.Statistics ?? new RoadmapStatisticsDto();
    }

    public async Task<RoadmapItemDto> AddItemAsync(Guid pageId, Guid userId, RoadmapItemDto item)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        // Verificar acesso
        var group = await _pageRepository.GetGroupByPageIdAsync(pageId);
        if (group == null || !await HasAccessToWorkspace(group.WorkspaceId, userId))
        {
            throw new UnauthorizedAccessException("Acesso negado");
        }

        var items = JsonSerializer.Deserialize<List<RoadmapItemDto>>(page.Data)
            ?? new List<RoadmapItemDto>();

        // Gerar novo ID se não fornecido
        if (string.IsNullOrEmpty(item.Id))
        {
            item.Id = Guid.NewGuid().ToString();
        }

        items.Add(item);

        page.Data = JsonSerializer.Serialize(items);
        page.AtualizadoEm = DateTime.UtcNow;

        await _pageRepository.UpdateAsync(page);

        return item;
    }

    public async Task<RoadmapItemDto> UpdateItemAsync(Guid pageId, Guid userId, string itemId, RoadmapItemDto item)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        // Verificar acesso
        var group = await _pageRepository.GetGroupByPageIdAsync(pageId);
        if (group == null || !await HasAccessToWorkspace(group.WorkspaceId, userId))
        {
            throw new UnauthorizedAccessException("Acesso negado");
        }

        var items = JsonSerializer.Deserialize<List<RoadmapItemDto>>(page.Data)
            ?? new List<RoadmapItemDto>();

        var existingItem = items.FirstOrDefault(i => i.Id == itemId)
            ?? throw new InvalidOperationException("Item não encontrado");

        // Atualizar propriedades
        existingItem.Title = item.Title;
        existingItem.Description = item.Description;
        existingItem.Status = item.Status;
        existingItem.Quarter = item.Quarter;
        existingItem.Priority = item.Priority;

        page.Data = JsonSerializer.Serialize(items);
        page.AtualizadoEm = DateTime.UtcNow;

        await _pageRepository.UpdateAsync(page);

        return existingItem;
    }

    public async Task DeleteItemAsync(Guid pageId, Guid userId, string itemId)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        // Verificar acesso
        var group = await _pageRepository.GetGroupByPageIdAsync(pageId);
        if (group == null || !await HasAccessToWorkspace(group.WorkspaceId, userId))
        {
            throw new UnauthorizedAccessException("Acesso negado");
        }

        var items = JsonSerializer.Deserialize<List<RoadmapItemDto>>(page.Data)
            ?? new List<RoadmapItemDto>();

        items = items.Where(i => i.Id != itemId).ToList();

        page.Data = JsonSerializer.Serialize(items);
        page.AtualizadoEm = DateTime.UtcNow;

        await _pageRepository.UpdateAsync(page);
    }

    public async Task<List<RoadmapItemDto>> FilterItemsAsync(Guid pageId, Guid userId, FilterRoadmapRequestDto filter)
    {
        var data = await GetRoadmapDataAsync(pageId, userId);
        var items = data.Items;

        if (!string.IsNullOrEmpty(filter.Status))
        {
            items = items.Where(i => i.Status == filter.Status).ToList();
        }

        if (!string.IsNullOrEmpty(filter.Quarter))
        {
            items = items.Where(i => i.Quarter == filter.Quarter).ToList();
        }

        if (!string.IsNullOrEmpty(filter.Priority))
        {
            items = items.Where(i => i.Priority == filter.Priority).ToList();
        }

        return items;
    }

    private RoadmapStatisticsDto GenerateStatistics(List<RoadmapItemDto> items)
    {
        var stats = new RoadmapStatisticsDto
        {
            TotalItems = items.Count,
            PlannedItems = items.Count(i => i.Status == "planned"),
            InProgressItems = items.Count(i => i.Status == "in-progress"),
            CompletedItems = items.Count(i => i.Status == "completed"),
            HighPriorityItems = items.Count(i => i.Priority == "high"),
            MediumPriorityItems = items.Count(i => i.Priority == "medium"),
            LowPriorityItems = items.Count(i => i.Priority == "low"),
            ItemsByQuarter = items.GroupBy(i => i.Quarter)
                .ToDictionary(g => g.Key, g => g.Count())
        };

        stats.CompletionPercentage = items.Count > 0
            ? Math.Round((double)stats.CompletedItems / items.Count * 100, 2)
            : 0;

        return stats;
    }

    private async Task<bool> HasAccessToWorkspace(Guid workspaceId, Guid userId)
    {
        // Implementar verificação de acesso
        return await Task.FromResult(true);
    }
}
