using Arc.Application.DTOs.Sprint;

namespace Arc.Application.Interfaces;

public interface ISprintService
{
    Task<SprintStatisticsDto> GetStatisticsAsync(Guid pageId, Guid userId);
    Task<byte[]> ExportSprintAsync(Guid pageId, Guid userId, string format);
}
