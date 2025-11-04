using System.Text.Json;
using Arc.Application.DTOs.Templates;
using Arc.Application.Interfaces;
using Arc.Domain.Interfaces;

namespace Arc.Application.Services;

public class FocusService : IFocusService
{
    private readonly IPageRepository _pageRepository;

    public FocusService(IPageRepository pageRepository)
    {
        _pageRepository = pageRepository;
    }

    public async Task<FocusDataDto> GetAsync(Guid pageId, Guid userId)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<FocusDataDto>(page.Data) ?? new FocusDataDto();
        data.TotalSessions = data.Sessions.Count;
        data.TotalMinutes = data.Sessions.Sum(s => s.Duration);
        return data;
    }

    public async Task<PomodoroSessionDto> StartSessionAsync(Guid pageId, Guid userId, PomodoroSessionDto session)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<FocusDataDto>(page.Data) ?? new FocusDataDto();

        session.Id = string.IsNullOrWhiteSpace(session.Id) ? Guid.NewGuid().ToString() : session.Id;
        session.StartTime = session.StartTime == default ? DateTime.UtcNow : session.StartTime;
        data.Sessions.Add(session);
        data.TotalSessions = data.Sessions.Count;
        data.TotalMinutes = data.Sessions.Sum(s => s.Duration);

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
        return session;
    }

    public async Task<PomodoroSessionDto> CompleteSessionAsync(Guid pageId, Guid userId, string sessionId)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<FocusDataDto>(page.Data) ?? new FocusDataDto();
        var session = data.Sessions.FirstOrDefault(s => s.Id == sessionId) ?? throw new InvalidOperationException("Sessão não encontrada");

        session.Completed = true;
        session.EndTime = DateTime.UtcNow;

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
        return session;
    }

    public async Task<FocusStatisticsDto> GetStatisticsAsync(Guid pageId, Guid userId)
    {
        var data = await GetAsync(pageId, userId);
        var completed = data.Sessions.Count(s => s.Completed);
        var minutes = data.TotalMinutes;
        return new FocusStatisticsDto
        {
            TotalSessions = data.TotalSessions,
            CompletedSessions = completed,
            TotalMinutes = minutes,
            TotalHours = Math.Round(minutes / 60.0, 2)
        };
    }

    private async Task EnsureAccessAsync(Guid pageId, Guid userId)
    {
        var group = await _pageRepository.GetGroupByPageIdAsync(pageId) ?? throw new InvalidOperationException("Grupo não encontrado para a página");
        var has = await HasAccessToWorkspace(group.WorkspaceId, userId);
        if (!has) throw new UnauthorizedAccessException("Acesso negado");
    }

    private Task<bool> HasAccessToWorkspace(Guid workspaceId, Guid userId) => Task.FromResult(true);
}

