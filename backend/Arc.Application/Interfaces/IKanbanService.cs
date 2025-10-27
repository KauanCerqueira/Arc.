using Arc.Application.DTOs.Kanban;

namespace Arc.Application.Interfaces;

public interface IKanbanService
{
    Task<KanbanStatisticsDto> GetStatisticsAsync(Guid pageId, Guid userId);
    Task<byte[]> ExportKanbanAsync(Guid pageId, Guid userId, string format);
}
