using Arc.Application.DTOs.Workspace;

namespace Arc.Application.Interfaces;

public interface IWorkspaceService
{
    Task<WorkspaceDto> GetByUserIdAsync(Guid userId);
    Task<List<WorkspaceDto>> GetAllByUserIdAsync(Guid userId);
    Task<WorkspaceDto> GetByIdAsync(Guid userId, Guid workspaceId);
    Task<WorkspaceWithGroupsDto> GetWithGroupsAndPagesAsync(Guid userId, Guid workspaceId);
    Task<WorkspaceDto> CreateAsync(Guid userId, CreateWorkspaceRequestDto request);
    Task<WorkspaceDto> UpdateAsync(Guid userId, Guid workspaceId, UpdateWorkspaceRequestDto request);
    Task<WorkspaceSettingsDto> UpdateSettingsAsync(Guid userId, UpdateWorkspaceSettingsRequestDto request);
    Task DeleteAsync(Guid userId, Guid workspaceId);
}
