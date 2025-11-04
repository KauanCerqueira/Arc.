using System.Text.Json;
using Arc.Application.DTOs.Templates;
using Arc.Application.Interfaces;
using Arc.Domain.Interfaces;

namespace Arc.Application.Services;

public class ProjectsService : IProjectsService
{
    private readonly IPageRepository _pageRepository;

    public ProjectsService(IPageRepository pageRepository)
    {
        _pageRepository = pageRepository;
    }

    public async Task<ProjectsDataDto> GetAsync(Guid pageId, Guid userId)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        return JsonSerializer.Deserialize<ProjectsDataDto>(page.Data) ?? new ProjectsDataDto();
    }

    public async Task<ProjectDto> AddAsync(Guid pageId, Guid userId, ProjectDto project)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<ProjectsDataDto>(page.Data) ?? new ProjectsDataDto();

        project.Id = string.IsNullOrWhiteSpace(project.Id) ? Guid.NewGuid().ToString() : project.Id;
        data.Projects.Add(project);

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
        return project;
    }

    public async Task<ProjectDto> UpdateAsync(Guid pageId, Guid userId, string projectId, ProjectDto updated)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<ProjectsDataDto>(page.Data) ?? new ProjectsDataDto();
        var project = data.Projects.FirstOrDefault(p => p.Id == projectId) ?? throw new InvalidOperationException("Projeto não encontrado");

        project.Name = updated.Name;
        project.Description = updated.Description;
        project.Status = updated.Status;
        project.Progress = updated.Progress;
        project.Deadline = updated.Deadline;
        project.Tags = updated.Tags;

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
        return project;
    }

    public async Task DeleteAsync(Guid pageId, Guid userId, string projectId)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<ProjectsDataDto>(page.Data) ?? new ProjectsDataDto();
        data.Projects = data.Projects.Where(p => p.Id != projectId).ToList();
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

