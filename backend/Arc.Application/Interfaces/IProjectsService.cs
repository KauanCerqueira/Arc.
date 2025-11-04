using Arc.Application.DTOs.Templates;

namespace Arc.Application.Interfaces;

public interface IProjectsService
{
    Task<ProjectsDataDto> GetAsync(Guid pageId, Guid userId);
    Task<ProjectDto> AddAsync(Guid pageId, Guid userId, ProjectDto project);
    Task<ProjectDto> UpdateAsync(Guid pageId, Guid userId, string projectId, ProjectDto updated);
    Task DeleteAsync(Guid pageId, Guid userId, string projectId);
}

