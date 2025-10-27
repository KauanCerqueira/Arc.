using System.Text.Json;
using Arc.Application.DTOs.Sprint;
using Arc.Application.Interfaces;
using Arc.Domain.Interfaces;

namespace Arc.Application.Services;

public class SprintService : ISprintService
{
    private readonly IPageRepository _pageRepository;

    public SprintService(IPageRepository pageRepository)
    {
        _pageRepository = pageRepository;
    }

    public async Task<SprintStatisticsDto> GetStatisticsAsync(Guid pageId, Guid userId)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        var sprint = JsonSerializer.Deserialize<SprintDataDto>(page.Data)
            ?? new SprintDataDto();

        var now = DateTime.UtcNow;
        var totalDays = (sprint.SprintInfo.EndDate - sprint.SprintInfo.StartDate).Days;
        var daysElapsed = Math.Max(0, (now - sprint.SprintInfo.StartDate).Days);
        var daysRemaining = Math.Max(0, (sprint.SprintInfo.EndDate - now).Days);

        var stats = new SprintStatisticsDto
        {
            TotalTasks = sprint.Tasks.Count,
            CompletedTasks = sprint.Tasks.Count(t => t.Status == "done"),
            InProgressTasks = sprint.Tasks.Count(t => t.Status == "in_progress"),
            TodoTasks = sprint.Tasks.Count(t => t.Status == "todo"),
            TotalStoryPoints = sprint.Tasks.Sum(t => t.StoryPoints),
            CompletedStoryPoints = sprint.Tasks.Where(t => t.Status == "done").Sum(t => t.StoryPoints),
            DaysRemaining = daysRemaining,
            DaysElapsed = daysElapsed,
            TasksByType = new Dictionary<string, int>(),
            TasksByStatus = new Dictionary<string, int>(),
            TasksByAssignee = new Dictionary<string, int>(),
            BurndownData = new List<BurndownPointDto>()
        };

        // Calcular porcentagem de conclusão
        if (stats.TotalStoryPoints > 0)
        {
            stats.CompletionPercentage = (double)stats.CompletedStoryPoints / stats.TotalStoryPoints * 100;
        }

        // Calcular velocidade por dia
        if (daysElapsed > 0)
        {
            stats.VelocityPerDay = (double)stats.CompletedStoryPoints / daysElapsed;
        }

        // Contar por tipo
        foreach (var task in sprint.Tasks)
        {
            if (!stats.TasksByType.ContainsKey(task.Type))
            {
                stats.TasksByType[task.Type] = 0;
            }
            stats.TasksByType[task.Type]++;

            if (!stats.TasksByStatus.ContainsKey(task.Status))
            {
                stats.TasksByStatus[task.Status] = 0;
            }
            stats.TasksByStatus[task.Status]++;

            if (!string.IsNullOrEmpty(task.AssignedTo))
            {
                if (!stats.TasksByAssignee.ContainsKey(task.AssignedTo))
                {
                    stats.TasksByAssignee[task.AssignedTo] = 0;
                }
                stats.TasksByAssignee[task.AssignedTo]++;
            }
        }

        // Gerar dados de burndown
        stats.BurndownData = GenerateBurndownData(sprint, totalDays, daysElapsed);

        return stats;
    }

    private List<BurndownPointDto> GenerateBurndownData(SprintDataDto sprint, int totalDays, int daysElapsed)
    {
        var burndownData = new List<BurndownPointDto>();
        var totalPoints = sprint.Tasks.Sum(t => t.StoryPoints);

        for (int day = 0; day <= Math.Min(daysElapsed, totalDays); day++)
        {
            var currentDate = sprint.SprintInfo.StartDate.AddDays(day);
            var idealRemaining = totalPoints - (int)((double)totalPoints / totalDays * day);

            // Calcular pontos realmente restantes neste dia
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

    public async Task<byte[]> ExportSprintAsync(Guid pageId, Guid userId, string format)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        var sprint = JsonSerializer.Deserialize<SprintDataDto>(page.Data)
            ?? new SprintDataDto();

        return format.ToLower() switch
        {
            "json" => System.Text.Encoding.UTF8.GetBytes(JsonSerializer.Serialize(sprint, new JsonSerializerOptions
            {
                WriteIndented = true
            })),
            "csv" => ExportToCsv(sprint),
            "md" => ExportToMarkdown(sprint),
            _ => throw new NotSupportedException($"Formato '{format}' não suportado")
        };
    }

    private byte[] ExportToCsv(SprintDataDto sprint)
    {
        var lines = new List<string>
        {
            "ID,Title,Description,Status,Type,Story Points,Priority,Assigned To,Tags,Completed At"
        };

        foreach (var task in sprint.Tasks)
        {
            var line = $"{EscapeCsv(task.Id)}," +
                      $"{EscapeCsv(task.Title)}," +
                      $"{EscapeCsv(task.Description)}," +
                      $"{EscapeCsv(task.Status)}," +
                      $"{EscapeCsv(task.Type)}," +
                      $"{task.StoryPoints}," +
                      $"{EscapeCsv(task.Priority)}," +
                      $"{EscapeCsv(task.AssignedTo)}," +
                      $"{EscapeCsv(string.Join(";", task.Tags))}," +
                      $"{task.CompletedAt?.ToString("yyyy-MM-dd") ?? ""}";
            lines.Add(line);
        }

        return System.Text.Encoding.UTF8.GetBytes(string.Join("\n", lines));
    }

    private byte[] ExportToMarkdown(SprintDataDto sprint)
    {
        var lines = new List<string>
        {
            $"# Sprint: {sprint.SprintInfo.Name}",
            "",
            $"**Goal:** {sprint.SprintInfo.Goal}",
            $"**Duration:** {sprint.SprintInfo.StartDate:yyyy-MM-dd} to {sprint.SprintInfo.EndDate:yyyy-MM-dd}",
            $"**Status:** {sprint.SprintInfo.Status}",
            $"**Total Story Points:** {sprint.SprintInfo.TotalStoryPoints}",
            "",
            "## Tasks",
            "",
            "| Title | Status | Type | Points | Assigned To |",
            "|-------|--------|------|--------|-------------|"
        };

        foreach (var task in sprint.Tasks)
        {
            lines.Add($"| {task.Title} | {task.Status} | {task.Type} | {task.StoryPoints} | {task.AssignedTo} |");
        }

        return System.Text.Encoding.UTF8.GetBytes(string.Join("\n", lines));
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
}
