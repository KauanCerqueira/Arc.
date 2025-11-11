using System.Text.Json;
using Arc.Application.DTOs.Sprint;
using Arc.Application.Interfaces;
using Arc.Domain.Entities;
using Arc.Domain.Interfaces;
using DomainTaskStatus = Arc.Domain.Entities.TaskStatus;

namespace Arc.Application.Services;

public class SprintService : ISprintService
{
    private readonly ISprintRepository _sprintRepository;
    private readonly ISprintTaskRepository _taskRepository;
    private readonly IWorkspaceRepository _workspaceRepository;
    private readonly IWorkspaceMemberRepository _workspaceMemberRepository;

    public SprintService(
        ISprintRepository sprintRepository,
        ISprintTaskRepository taskRepository,
        IWorkspaceRepository workspaceRepository,
        IWorkspaceMemberRepository workspaceMemberRepository)
    {
        _sprintRepository = sprintRepository;
        _taskRepository = taskRepository;
        _workspaceRepository = workspaceRepository;
        _workspaceMemberRepository = workspaceMemberRepository;
    }

    #region Sprint CRUD

    public async Task<SprintResponseDto> CreateSprintAsync(CreateSprintDto dto, Guid userId)
    {
        // Verificar permissões
        await ValidateWorkspaceAccessAsync(dto.WorkspaceId, userId);

        var sprint = new Sprint
        {
            Id = Guid.NewGuid(),
            WorkspaceId = dto.WorkspaceId,
            PageId = dto.PageId,
            Name = dto.Name,
            Goal = dto.Goal,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Status = SprintStatus.Planned,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsActive = true
        };

        var created = await _sprintRepository.CreateAsync(sprint);
        return MapToResponseDto(created);
    }

    public async Task<SprintResponseDto> GetSprintByIdAsync(Guid sprintId, Guid userId)
    {
        var sprint = await _sprintRepository.GetByIdWithTasksAsync(sprintId)
            ?? throw new InvalidOperationException("Sprint não encontrado");

        await ValidateWorkspaceAccessAsync(sprint.WorkspaceId, userId);

        return MapToResponseDto(sprint);
    }

    public async Task<SprintResponseDto> GetSprintByPageIdAsync(Guid pageId, Guid userId)
    {
        var sprint = await _sprintRepository.GetByPageIdAsync(pageId);
        if (sprint == null)
        {
            throw new InvalidOperationException("Sprint não encontrado para esta página");
        }

        await ValidateWorkspaceAccessAsync(sprint.WorkspaceId, userId);

        // Carregar com tarefas
        sprint = await _sprintRepository.GetByIdWithTasksAsync(sprint.Id);
        return MapToResponseDto(sprint!);
    }

    public async Task<SprintResponseDto> UpdateSprintAsync(Guid sprintId, UpdateSprintDto dto, Guid userId)
    {
        var sprint = await _sprintRepository.GetByIdAsync(sprintId)
            ?? throw new InvalidOperationException("Sprint não encontrado");

        await ValidateWorkspaceAccessAsync(sprint.WorkspaceId, userId);

        sprint.Name = dto.Name;
        sprint.Goal = dto.Goal;
        sprint.StartDate = dto.StartDate;
        sprint.EndDate = dto.EndDate;

        if (Enum.TryParse<SprintStatus>(dto.Status, true, out var status))
        {
            sprint.Status = status;
        }

        var updated = await _sprintRepository.UpdateAsync(sprint);
        return MapToResponseDto(updated);
    }

    public async Task DeleteSprintAsync(Guid sprintId, Guid userId)
    {
        var sprint = await _sprintRepository.GetByIdAsync(sprintId)
            ?? throw new InvalidOperationException("Sprint não encontrado");

        await ValidateWorkspaceAccessAsync(sprint.WorkspaceId, userId);

        await _sprintRepository.DeleteAsync(sprintId);
    }

    public async Task<List<SprintResponseDto>> GetSprintsByWorkspaceIdAsync(Guid workspaceId, Guid userId)
    {
        await ValidateWorkspaceAccessAsync(workspaceId, userId);

        var sprints = await _sprintRepository.GetByWorkspaceIdAsync(workspaceId);
        return sprints.Select(MapToResponseDto).ToList();
    }

    #endregion

    #region Sprint Task CRUD

    public async Task<SprintTaskResponseDto> CreateTaskAsync(Guid sprintId, CreateSprintTaskDto dto, Guid userId)
    {
        var sprint = await _sprintRepository.GetByIdAsync(sprintId)
            ?? throw new InvalidOperationException("Sprint não encontrado");

        await ValidateWorkspaceAccessAsync(sprint.WorkspaceId, userId);

        var maxOrder = await _taskRepository.GetMaxOrderBySprintIdAsync(sprintId);

        var task = new SprintTask
        {
            Id = Guid.NewGuid(),
            SprintId = sprintId,
            Title = dto.Title,
            Description = dto.Description,
            StoryPoints = dto.StoryPoints,
            Status = MapToTaskStatus(dto.Status),
            Priority = MapToTaskPriority(dto.Priority),
            Type = MapToTaskType(dto.Type),
            AssignedTo = dto.AssignedTo,
            Tags = dto.Tags,
            Order = maxOrder + 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _taskRepository.CreateAsync(task);

        // Atualizar total de story points do sprint
        await UpdateSprintStoryPointsAsync(sprintId);

        return MapToTaskResponseDto(created);
    }

    public async Task<SprintTaskResponseDto> GetTaskByIdAsync(Guid taskId, Guid userId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId)
            ?? throw new InvalidOperationException("Tarefa não encontrada");

        var sprint = await _sprintRepository.GetByIdAsync(task.SprintId)
            ?? throw new InvalidOperationException("Sprint não encontrado");

        await ValidateWorkspaceAccessAsync(sprint.WorkspaceId, userId);

        return MapToTaskResponseDto(task);
    }

    public async Task<SprintTaskResponseDto> UpdateTaskAsync(Guid taskId, UpdateSprintTaskDto dto, Guid userId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId)
            ?? throw new InvalidOperationException("Tarefa não encontrada");

        var sprint = await _sprintRepository.GetByIdAsync(task.SprintId)
            ?? throw new InvalidOperationException("Sprint não encontrado");

        await ValidateWorkspaceAccessAsync(sprint.WorkspaceId, userId);

        var oldStatus = task.Status;

        if (dto.Title != null) task.Title = dto.Title;
        if (dto.Description != null) task.Description = dto.Description;
        if (dto.StoryPoints.HasValue) task.StoryPoints = dto.StoryPoints.Value;
        if (dto.Status != null) task.Status = MapToTaskStatus(dto.Status);
        if (dto.Priority != null) task.Priority = MapToTaskPriority(dto.Priority);
        if (dto.Type != null) task.Type = MapToTaskType(dto.Type);
        if (dto.AssignedTo.HasValue) task.AssignedTo = dto.AssignedTo.Value == Guid.Empty ? null : dto.AssignedTo.Value;
        if (dto.Tags != null) task.Tags = dto.Tags;

        // Se mudou para "done", setar CompletedAt
        if (oldStatus != DomainTaskStatus.Done && task.Status == DomainTaskStatus.Done)
        {
            task.CompletedAt = DateTime.UtcNow;
        }
        else if (task.Status != DomainTaskStatus.Done)
        {
            task.CompletedAt = null;
        }

        var updated = await _taskRepository.UpdateAsync(task);

        // Atualizar total de story points do sprint
        await UpdateSprintStoryPointsAsync(task.SprintId);

        return MapToTaskResponseDto(updated);
    }

    public async Task DeleteTaskAsync(Guid taskId, Guid userId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId)
            ?? throw new InvalidOperationException("Tarefa não encontrada");

        var sprint = await _sprintRepository.GetByIdAsync(task.SprintId)
            ?? throw new InvalidOperationException("Sprint não encontrado");

        await ValidateWorkspaceAccessAsync(sprint.WorkspaceId, userId);

        await _taskRepository.DeleteAsync(taskId);

        // Atualizar total de story points do sprint
        await UpdateSprintStoryPointsAsync(task.SprintId);
    }

    public async Task<List<SprintTaskResponseDto>> GetTasksBySprintIdAsync(Guid sprintId, Guid userId)
    {
        var sprint = await _sprintRepository.GetByIdAsync(sprintId)
            ?? throw new InvalidOperationException("Sprint não encontrado");

        await ValidateWorkspaceAccessAsync(sprint.WorkspaceId, userId);

        var tasks = await _taskRepository.GetBySprintIdAsync(sprintId);
        return tasks.Select(MapToTaskResponseDto).ToList();
    }

    #endregion

    #region Analytics

    public async Task<SprintStatisticsDto> GetStatisticsAsync(Guid sprintId, Guid userId)
    {
        var sprint = await _sprintRepository.GetByIdWithTasksAsync(sprintId)
            ?? throw new InvalidOperationException("Sprint não encontrado");

        await ValidateWorkspaceAccessAsync(sprint.WorkspaceId, userId);

        var now = DateTime.UtcNow;
        var totalDays = (sprint.EndDate - sprint.StartDate).Days;
        var daysElapsed = Math.Max(0, (now - sprint.StartDate).Days);
        var daysRemaining = Math.Max(0, (sprint.EndDate - now).Days);

        var stats = new SprintStatisticsDto
        {
            TotalTasks = sprint.Tasks.Count,
            CompletedTasks = sprint.Tasks.Count(t => t.Status == DomainTaskStatus.Done),
            InProgressTasks = sprint.Tasks.Count(t => t.Status == DomainTaskStatus.InProgress),
            TodoTasks = sprint.Tasks.Count(t => t.Status == DomainTaskStatus.Backlog),
            TotalStoryPoints = sprint.Tasks.Sum(t => t.StoryPoints),
            CompletedStoryPoints = sprint.Tasks.Where(t => t.Status == DomainTaskStatus.Done).Sum(t => t.StoryPoints),
            DaysRemaining = daysRemaining,
            DaysElapsed = daysElapsed,
            TasksByType = new Dictionary<string, int>(),
            TasksByStatus = new Dictionary<string, int>(),
            TasksByAssignee = new Dictionary<string, int>(),
            BurndownData = new List<BurndownPointDto>()
        };

        if (stats.TotalStoryPoints > 0)
        {
            stats.CompletionPercentage = (double)stats.CompletedStoryPoints / stats.TotalStoryPoints * 100;
        }

        if (daysElapsed > 0)
        {
            stats.VelocityPerDay = (double)stats.CompletedStoryPoints / daysElapsed;
        }

        // Contar por tipo, status e assignee
        foreach (var task in sprint.Tasks)
        {
            var type = task.Type.ToString();
            if (!stats.TasksByType.ContainsKey(type))
                stats.TasksByType[type] = 0;
            stats.TasksByType[type]++;

            var status = task.Status.ToString();
            if (!stats.TasksByStatus.ContainsKey(status))
                stats.TasksByStatus[status] = 0;
            stats.TasksByStatus[status]++;

            if (task.AssignedTo.HasValue)
            {
                var assignee = task.AssignedUser?.Nome ?? task.AssignedTo.ToString()!;
                if (!stats.TasksByAssignee.ContainsKey(assignee))
                    stats.TasksByAssignee[assignee] = 0;
                stats.TasksByAssignee[assignee]++;
            }
        }

        stats.BurndownData = GenerateBurndownData(sprint, totalDays, daysElapsed);

        return stats;
    }

    public async Task<SprintVelocityDto> GetVelocityAsync(Guid workspaceId, Guid userId)
    {
        await ValidateWorkspaceAccessAsync(workspaceId, userId);

        var sprints = await _sprintRepository.GetByWorkspaceIdAsync(workspaceId);
        var completedSprints = sprints.Where(s => s.Status == SprintStatus.Completed).ToList();

        var velocityDto = new SprintVelocityDto
        {
            TotalSprints = completedSprints.Count,
            SprintHistory = new List<SprintVelocityPointDto>()
        };

        foreach (var sprint in completedSprints)
        {
            var sprintWithTasks = await _sprintRepository.GetByIdWithTasksAsync(sprint.Id);
            if (sprintWithTasks != null)
            {
                velocityDto.SprintHistory.Add(new SprintVelocityPointDto
                {
                    SprintName = sprint.Name,
                    CommittedPoints = sprint.CommittedStoryPoints,
                    CompletedPoints = sprintWithTasks.Tasks.Where(t => t.Status == DomainTaskStatus.Done).Sum(t => t.StoryPoints),
                    StartDate = sprint.StartDate,
                    EndDate = sprint.EndDate
                });
            }
        }

        if (velocityDto.SprintHistory.Any())
        {
            velocityDto.AverageVelocity = velocityDto.SprintHistory.Average(s => s.CompletedPoints);
        }

        return velocityDto;
    }

    #endregion

    #region Export

    public async Task<byte[]> ExportSprintAsync(Guid sprintId, Guid userId, string format)
    {
        var sprint = await _sprintRepository.GetByIdWithTasksAsync(sprintId)
            ?? throw new InvalidOperationException("Sprint não encontrado");

        await ValidateWorkspaceAccessAsync(sprint.WorkspaceId, userId);

        return format.ToLower() switch
        {
            "json" => ExportToJson(sprint),
            "csv" => ExportToCsv(sprint),
            "md" => ExportToMarkdown(sprint),
            _ => throw new NotSupportedException($"Formato '{format}' não suportado")
        };
    }

    private byte[] ExportToJson(Sprint sprint)
    {
        var dto = MapToResponseDto(sprint);
        return System.Text.Encoding.UTF8.GetBytes(JsonSerializer.Serialize(dto, new JsonSerializerOptions
        {
            WriteIndented = true
        }));
    }

    private byte[] ExportToCsv(Sprint sprint)
    {
        var lines = new List<string>
        {
            "ID,Title,Description,Status,Type,Story Points,Priority,Assigned To,Tags,Completed At"
        };

        foreach (var task in sprint.Tasks)
        {
            var line = $"{EscapeCsv(task.Id.ToString())}," +
                      $"{EscapeCsv(task.Title)}," +
                      $"{EscapeCsv(task.Description)}," +
                      $"{EscapeCsv(task.Status.ToString())}," +
                      $"{EscapeCsv(task.Type.ToString())}," +
                      $"{task.StoryPoints}," +
                      $"{EscapeCsv(task.Priority.ToString())}," +
                      $"{EscapeCsv(task.AssignedUser?.Nome ?? "")}," +
                      $"{EscapeCsv(string.Join(";", task.Tags))}," +
                      $"{task.CompletedAt?.ToString("yyyy-MM-dd") ?? ""}";
            lines.Add(line);
        }

        return System.Text.Encoding.UTF8.GetBytes(string.Join("\n", lines));
    }

    private byte[] ExportToMarkdown(Sprint sprint)
    {
        var lines = new List<string>
        {
            $"# Sprint: {sprint.Name}",
            "",
            $"**Goal:** {sprint.Goal}",
            $"**Duration:** {sprint.StartDate:yyyy-MM-dd} to {sprint.EndDate:yyyy-MM-dd}",
            $"**Status:** {sprint.Status}",
            $"**Total Story Points:** {sprint.TotalStoryPoints}",
            "",
            "## Tasks",
            "",
            "| Title | Status | Type | Points | Assigned To |",
            "|-------|--------|------|--------|-------------|"
        };

        foreach (var task in sprint.Tasks)
        {
            lines.Add($"| {task.Title} | {task.Status} | {task.Type} | {task.StoryPoints} | {task.AssignedUser?.Nome ?? ""} |");
        }

        return System.Text.Encoding.UTF8.GetBytes(string.Join("\n", lines));
    }

    #endregion

    #region Helper Methods

    private async Task ValidateWorkspaceAccessAsync(Guid workspaceId, Guid userId)
    {
        var member = await _workspaceMemberRepository.GetByWorkspaceAndUserAsync(workspaceId, userId);
        if (member == null)
        {
            throw new UnauthorizedAccessException("Você não tem acesso a este workspace");
        }
    }

    private async Task UpdateSprintStoryPointsAsync(Guid sprintId)
    {
        var sprint = await _sprintRepository.GetByIdWithTasksAsync(sprintId);
        if (sprint != null)
        {
            sprint.TotalStoryPoints = sprint.Tasks.Sum(t => t.StoryPoints);
            sprint.CommittedStoryPoints = sprint.Tasks.Where(t => t.Status != DomainTaskStatus.Backlog).Sum(t => t.StoryPoints);
            await _sprintRepository.UpdateAsync(sprint);
        }
    }

    private List<BurndownPointDto> GenerateBurndownData(Sprint sprint, int totalDays, int daysElapsed)
    {
        var burndownData = new List<BurndownPointDto>();
        var totalPoints = sprint.Tasks.Sum(t => t.StoryPoints);

        for (int day = 0; day <= Math.Min(daysElapsed, totalDays); day++)
        {
            var currentDate = sprint.StartDate.AddDays(day);
            var idealRemaining = totalPoints - (int)((double)totalPoints / totalDays * day);

            var completedByDate = sprint.Tasks
                .Where(t => t.CompletedAt.HasValue && t.CompletedAt.Value.Date <= currentDate.Date)
                .Sum(t => t.StoryPoints);

            var actualRemaining = totalPoints - completedByDate;

            burndownData.Add(new BurndownPointDto
            {
                Date = currentDate,
                IdealRemaining = Math.Max(0, idealRemaining),
                ActualRemaining = Math.Max(0, actualRemaining)
            });
        }

        return burndownData;
    }

    private SprintResponseDto MapToResponseDto(Sprint sprint)
    {
        return new SprintResponseDto
        {
            Id = sprint.Id,
            WorkspaceId = sprint.WorkspaceId,
            PageId = sprint.PageId,
            Name = sprint.Name,
            Goal = sprint.Goal,
            StartDate = sprint.StartDate,
            EndDate = sprint.EndDate,
            TotalStoryPoints = sprint.TotalStoryPoints,
            CommittedStoryPoints = sprint.CommittedStoryPoints,
            Status = sprint.Status.ToString(),
            CreatedAt = sprint.CreatedAt,
            UpdatedAt = sprint.UpdatedAt,
            Tasks = sprint.Tasks?.Select(MapToTaskResponseDto).ToList() ?? new List<SprintTaskResponseDto>()
        };
    }

    private SprintTaskResponseDto MapToTaskResponseDto(SprintTask task)
    {
        return new SprintTaskResponseDto
        {
            Id = task.Id,
            SprintId = task.SprintId,
            Title = task.Title,
            Description = task.Description,
            StoryPoints = task.StoryPoints,
            Status = task.Status.ToString().ToLower(),
            Priority = task.Priority.ToString().ToLower(),
            Type = task.Type.ToString().ToLower(),
            AssignedTo = task.AssignedTo,
            AssignedUserName = task.AssignedUser?.Nome,
            Tags = task.Tags,
            CreatedAt = task.CreatedAt,
            CompletedAt = task.CompletedAt,
            UpdatedAt = task.UpdatedAt,
            Order = task.Order
        };
    }

    private DomainTaskStatus MapToTaskStatus(string status)
    {
        return status.ToLower() switch
        {
            "backlog" => DomainTaskStatus.Backlog,
            "in-progress" => DomainTaskStatus.InProgress,
            "inprogress" => DomainTaskStatus.InProgress,
            "done" => DomainTaskStatus.Done,
            _ => DomainTaskStatus.Backlog
        };
    }

    private TaskPriority MapToTaskPriority(string priority)
    {
        return priority.ToLower() switch
        {
            "low" => TaskPriority.Low,
            "medium" => TaskPriority.Medium,
            "high" => TaskPriority.High,
            "urgent" => TaskPriority.Urgent,
            _ => TaskPriority.Medium
        };
    }

    private TaskType MapToTaskType(string type)
    {
        return type.ToLower() switch
        {
            "task" => TaskType.Task,
            "bug" => TaskType.Bug,
            "feature" => TaskType.Feature,
            _ => TaskType.Task
        };
    }

    private string EscapeCsv(string value)
    {
        if (string.IsNullOrEmpty(value))
            return "";

        if (value.Contains(",") || value.Contains("\"") || value.Contains("\n"))
        {
            return $"\"{value.Replace("\"", "\"\"")}\"";
        }

        return value;
    }

    #endregion
}
