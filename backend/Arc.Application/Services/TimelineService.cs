using System.Text.Json;
using Arc.Application.DTOs.Timeline;
using Arc.Application.Interfaces;
using Arc.Domain.Interfaces;

namespace Arc.Application.Services;

public class TimelineService : ITimelineService
{
    private readonly IPageRepository _pageRepository;

    public TimelineService(IPageRepository pageRepository)
    {
        _pageRepository = pageRepository;
    }

    public async Task<TimelineDataDto> GetAsync(Guid pageId, Guid userId)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        return JsonSerializer.Deserialize<TimelineDataDto>(page.Data) ?? new TimelineDataDto();
    }

    public async Task<TimelineItemDto> AddAsync(Guid pageId, Guid userId, TimelineItemDto item)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<TimelineDataDto>(page.Data) ?? new TimelineDataDto();

        item.Id = string.IsNullOrWhiteSpace(item.Id) ? Guid.NewGuid().ToString() : item.Id;
        data.Items.Add(item);

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
        return item;
    }

    public async Task<TimelineItemDto> UpdateAsync(Guid pageId, Guid userId, string itemId, TimelineItemDto updated)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<TimelineDataDto>(page.Data) ?? new TimelineDataDto();
        var item = data.Items.FirstOrDefault(i => i.Id == itemId) ?? throw new InvalidOperationException("Item não encontrado");

        item.Title = updated.Title;
        item.Date = updated.Date;
        item.Description = updated.Description;
        item.Status = updated.Status;
        item.Color = updated.Color;

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
        return item;
    }

    public async Task DeleteAsync(Guid pageId, Guid userId, string itemId)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<TimelineDataDto>(page.Data) ?? new TimelineDataDto();
        data.Items = data.Items.Where(i => i.Id != itemId).ToList();
        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
    }

    private async Task EnsureAccessAsync(Guid pageId, Guid userId)
    {
        var group = await _pageRepository.GetGroupByPageIdAsync(pageId) ?? throw new InvalidOperationException("Grupo não encontrado para a página");
        var has = await HasAccessToWorkspace(group.WorkspaceId, userId);
        if (!has) throw new UnauthorizedAccessException("Acesso negado");
    }

    private Task<bool> HasAccessToWorkspace(Guid workspaceId, Guid userId) => Task.FromResult(true);
}

