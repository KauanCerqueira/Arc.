using System.Text.Json;
using Arc.Application.DTOs.Kanban;
using Arc.Application.Interfaces;
using Arc.Domain.Interfaces;

namespace Arc.Application.Services;

public class KanbanService : IKanbanService
{
    private readonly IPageRepository _pageRepository;

    public KanbanService(IPageRepository pageRepository)
    {
        _pageRepository = pageRepository;
    }

    public async Task<KanbanStatisticsDto> GetStatisticsAsync(Guid pageId, Guid userId)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        var kanban = JsonSerializer.Deserialize<KanbanDataDto>(page.Data)
            ?? new KanbanDataDto();

        var stats = new KanbanStatisticsDto
        {
            TotalColumns = kanban.Columns.Count,
            TotalCards = kanban.Columns.Sum(c => c.Cards.Count),
            CompletedCards = 0,
            OverdueCards = 0,
            HighPriorityCards = 0,
            CardsByColumn = new Dictionary<string, int>(),
            CardsByPriority = new Dictionary<string, int>
            {
                { "low", 0 },
                { "medium", 0 },
                { "high", 0 },
                { "urgent", 0 }
            },
            ColumnsOverWipLimit = new List<string>()
        };

        var now = DateTime.UtcNow;

        foreach (var column in kanban.Columns)
        {
            stats.CardsByColumn[column.Title] = column.Cards.Count;

            // Verificar limite WIP
            if (column.WipLimit > 0 && column.Cards.Count > column.WipLimit)
            {
                stats.ColumnsOverWipLimit.Add(column.Title);
            }

            foreach (var card in column.Cards)
            {
                // Contar por prioridade
                if (stats.CardsByPriority.ContainsKey(card.Priority))
                {
                    stats.CardsByPriority[card.Priority]++;
                }

                // Contar cards de alta prioridade
                if (card.Priority == "high" || card.Priority == "urgent")
                {
                    stats.HighPriorityCards++;
                }

                // Contar cards atrasados
                if (card.DueDate.HasValue && card.DueDate.Value < now && !card.CompletedAt.HasValue)
                {
                    stats.OverdueCards++;
                }

                // Contar cards completados
                if (card.CompletedAt.HasValue)
                {
                    stats.CompletedCards++;
                }
            }
        }

        return stats;
    }

    public async Task<byte[]> ExportKanbanAsync(Guid pageId, Guid userId, string format)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        var kanban = JsonSerializer.Deserialize<KanbanDataDto>(page.Data)
            ?? new KanbanDataDto();

        return format.ToLower() switch
        {
            "json" => System.Text.Encoding.UTF8.GetBytes(JsonSerializer.Serialize(kanban, new JsonSerializerOptions
            {
                WriteIndented = true
            })),
            "csv" => ExportToCsv(kanban),
            _ => throw new NotSupportedException($"Formato '{format}' não suportado")
        };
    }

    private byte[] ExportToCsv(KanbanDataDto kanban)
    {
        var lines = new List<string>
        {
            "Column,Card Title,Description,Priority,Tags,Assigned To,Due Date,Created At,Completed At"
        };

        foreach (var column in kanban.Columns)
        {
            foreach (var card in column.Cards)
            {
                var line = $"{EscapeCsv(column.Title)}," +
                          $"{EscapeCsv(card.Title)}," +
                          $"{EscapeCsv(card.Description)}," +
                          $"{EscapeCsv(card.Priority)}," +
                          $"{EscapeCsv(string.Join(";", card.Tags))}," +
                          $"{EscapeCsv(string.Join(";", card.AssignedTo))}," +
                          $"{card.DueDate?.ToString("yyyy-MM-dd") ?? ""}," +
                          $"{card.CreatedAt:yyyy-MM-dd}," +
                          $"{card.CompletedAt?.ToString("yyyy-MM-dd") ?? ""}";
                lines.Add(line);
            }
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
