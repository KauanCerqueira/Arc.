using System.Text.Json;
using Arc.Application.DTOs.Templates;
using Arc.Application.Interfaces;
using Arc.Domain.Interfaces;

namespace Arc.Application.Services;

public class TasksService : ITasksService
{
    private readonly IPageRepository _pageRepository;

    public TasksService(IPageRepository pageRepository)
    {
        _pageRepository = pageRepository;
    }

    public async Task<TasksDataDto> GetAsync(Guid pageId, Guid userId)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        var data = JsonSerializer.Deserialize<TasksDataDto>(page.Data) ?? new TasksDataDto();
        return data;
    }

    public async Task<TaskItemDto> AddAsync(Guid pageId, Guid userId, TaskItemDto task)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        var data = JsonSerializer.Deserialize<TasksDataDto>(page.Data) ?? new TasksDataDto();

        task.Id = string.IsNullOrWhiteSpace(task.Id) ? Guid.NewGuid().ToString() : task.Id;
        task.CreatedAt = task.CreatedAt == default ? DateTime.UtcNow : task.CreatedAt;

        data.Tasks.Add(task);

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);

        return task;
    }

    public async Task<TaskItemDto> UpdateAsync(Guid pageId, Guid userId, string taskId, TaskItemDto updated)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        var data = JsonSerializer.Deserialize<TasksDataDto>(page.Data) ?? new TasksDataDto();
        var task = data.Tasks.FirstOrDefault(t => t.Id == taskId)
                   ?? throw new InvalidOperationException("Tarefa não encontrada");

        task.Text = updated.Text;
        task.Priority = updated.Priority;
        task.Category = updated.Category;
        task.Completed = updated.Completed;
        if (updated.Completed && task.CompletedAt == null)
            task.CompletedAt = DateTime.UtcNow;

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);

        return task;
    }

    public async Task<TaskItemDto> ToggleAsync(Guid pageId, Guid userId, string taskId)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        var data = JsonSerializer.Deserialize<TasksDataDto>(page.Data) ?? new TasksDataDto();
        var task = data.Tasks.FirstOrDefault(t => t.Id == taskId)
                   ?? throw new InvalidOperationException("Tarefa não encontrada");

        task.Completed = !task.Completed;
        task.CompletedAt = task.Completed ? DateTime.UtcNow : null;

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);

        return task;
    }

    public async Task DeleteAsync(Guid pageId, Guid userId, string taskId)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        var data = JsonSerializer.Deserialize<TasksDataDto>(page.Data) ?? new TasksDataDto();
        data.Tasks = data.Tasks.Where(t => t.Id != taskId).ToList();

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
    }

    public async Task<TasksStatisticsDto> GetStatisticsAsync(Guid pageId, Guid userId)
    {
        var data = await GetAsync(pageId, userId);
        var total = data.Tasks.Count;
        var completed = data.Tasks.Count(t => t.Completed);
        var pending = total - completed;
        var rate = total > 0 ? Math.Round((double)completed / total * 100, 2) : 0;

        return new TasksStatisticsDto
        {
            Total = total,
            Completed = completed,
            Pending = pending,
            CompletionRate = rate
        };
    }

    private async Task EnsureAccessAsync(Guid pageId, Guid userId)
    {
        var group = await _pageRepository.GetGroupByPageIdAsync(pageId);
        if (group == null)
            throw new InvalidOperationException("Grupo não encontrado para a página");

        var hasAccess = await HasAccessToWorkspace(group.WorkspaceId, userId);
        if (!hasAccess)
            throw new UnauthorizedAccessException("Acesso negado");
    }

    private Task<bool> HasAccessToWorkspace(Guid workspaceId, Guid userId)
    {
        // TODO: Implementar verificação real
        return Task.FromResult(true);
    }
}

