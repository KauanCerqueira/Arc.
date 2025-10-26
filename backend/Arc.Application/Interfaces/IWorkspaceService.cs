using Arc.Application.DTOs.Workspace;

namespace Arc.Application.Interfaces;

public interface IWorkspaceService
{
    Task<WorkspaceDto> GetByUserIdAsync(Guid userId);
    Task<WorkspaceWithGroupsDto> GetWithGroupsAndPagesAsync(Guid userId);
    Task<WorkspaceDto> CreateAsync(Guid userId, CreateWorkspaceRequestDto request);
    Task<WorkspaceDto> UpdateAsync(Guid userId, UpdateWorkspaceRequestDto request);
    Task<WorkspaceSettingsDto> UpdateSettingsAsync(Guid userId, UpdateWorkspaceSettingsRequestDto request);
}
