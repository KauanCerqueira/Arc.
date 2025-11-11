using Arc.Application.DTOs.Sprint;

namespace Arc.Application.Interfaces;

public interface ISprintService
{
    // Sprint CRUD
    Task<SprintResponseDto> CreateSprintAsync(CreateSprintDto dto, Guid userId);
    Task<SprintResponseDto> GetSprintByIdAsync(Guid sprintId, Guid userId);
    Task<SprintResponseDto> GetSprintByPageIdAsync(Guid pageId, Guid userId);
    Task<SprintResponseDto> UpdateSprintAsync(Guid sprintId, UpdateSprintDto dto, Guid userId);
    Task DeleteSprintAsync(Guid sprintId, Guid userId);
    Task<List<SprintResponseDto>> GetSprintsByWorkspaceIdAsync(Guid workspaceId, Guid userId);

    // Sprint Task CRUD
    Task<SprintTaskResponseDto> CreateTaskAsync(Guid sprintId, CreateSprintTaskDto dto, Guid userId);
    Task<SprintTaskResponseDto> GetTaskByIdAsync(Guid taskId, Guid userId);
    Task<SprintTaskResponseDto> UpdateTaskAsync(Guid taskId, UpdateSprintTaskDto dto, Guid userId);
    Task DeleteTaskAsync(Guid taskId, Guid userId);
    Task<List<SprintTaskResponseDto>> GetTasksBySprintIdAsync(Guid sprintId, Guid userId);

    // Sprint Analytics
    Task<SprintStatisticsDto> GetStatisticsAsync(Guid sprintId, Guid userId);
    Task<SprintVelocityDto> GetVelocityAsync(Guid workspaceId, Guid userId);

    // Export
    Task<byte[]> ExportSprintAsync(Guid sprintId, Guid userId, string format);
}
