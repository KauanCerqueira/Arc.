using Arc.Application.DTOs.Templates;

namespace Arc.Application.Interfaces;

public interface ITasksService
{
    Task<TasksDataDto> GetAsync(Guid pageId, Guid userId);
    Task<TaskItemDto> AddAsync(Guid pageId, Guid userId, TaskItemDto task);
    Task<TaskItemDto> UpdateAsync(Guid pageId, Guid userId, string taskId, TaskItemDto updated);
    Task<TaskItemDto> ToggleAsync(Guid pageId, Guid userId, string taskId);
    Task DeleteAsync(Guid pageId, Guid userId, string taskId);
    Task<TasksStatisticsDto> GetStatisticsAsync(Guid pageId, Guid userId);
}

