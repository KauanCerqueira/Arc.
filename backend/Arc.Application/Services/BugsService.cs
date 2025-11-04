using System.Text.Json;
using Arc.Application.DTOs.Templates;
using Arc.Application.Interfaces;
using Arc.Domain.Interfaces;

namespace Arc.Application.Services;

public class BugsService : IBugsService
{
    private readonly IPageRepository _pageRepository;

    public BugsService(IPageRepository pageRepository)
    {
        _pageRepository = pageRepository;
    }

    public async Task<BugsDataDto> GetAsync(Guid pageId, Guid userId)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        return JsonSerializer.Deserialize<BugsDataDto>(page.Data) ?? new BugsDataDto();
    }

    public async Task<BugDto> AddAsync(Guid pageId, Guid userId, BugDto bug)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<BugsDataDto>(page.Data) ?? new BugsDataDto();

        bug.Id = string.IsNullOrWhiteSpace(bug.Id) ? Guid.NewGuid().ToString() : bug.Id;
        bug.CreatedAt = bug.CreatedAt == default ? DateTime.UtcNow : bug.CreatedAt;
        data.Bugs.Add(bug);

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
        return bug;
    }

    public async Task<BugDto> UpdateAsync(Guid pageId, Guid userId, string bugId, BugDto updated)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<BugsDataDto>(page.Data) ?? new BugsDataDto();
        var bug = data.Bugs.FirstOrDefault(b => b.Id == bugId) ?? throw new InvalidOperationException("Bug não encontrado");

        bug.Title = updated.Title;
        bug.Description = updated.Description;
        bug.Status = updated.Status;
        bug.Priority = updated.Priority;
        bug.AssignedTo = updated.AssignedTo;
        if (updated.Status == "resolved" && bug.ResolvedAt == null)
            bug.ResolvedAt = DateTime.UtcNow;

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
        return bug;
    }

    public async Task DeleteAsync(Guid pageId, Guid userId, string bugId)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<BugsDataDto>(page.Data) ?? new BugsDataDto();
        data.Bugs = data.Bugs.Where(b => b.Id != bugId).ToList();
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

