using Arc.Application.DTOs.Templates;

namespace Arc.Application.Interfaces;

public interface IFocusService
{
    Task<FocusDataDto> GetAsync(Guid pageId, Guid userId);
    Task<PomodoroSessionDto> StartSessionAsync(Guid pageId, Guid userId, PomodoroSessionDto session);
    Task<PomodoroSessionDto> CompleteSessionAsync(Guid pageId, Guid userId, string sessionId);
    Task<FocusStatisticsDto> GetStatisticsAsync(Guid pageId, Guid userId);
}

