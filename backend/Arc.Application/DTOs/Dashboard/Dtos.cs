using System.ComponentModel.DataAnnotations;

namespace Arc.Application.DTOs.Dashboard;

public class DashboardWidgetDto
{
    [Required]
    public required string Id { get; set; }

    [Required]
    [RegularExpression("^(stats|chart|progress|metric)$", ErrorMessage = "Tipo inválido de widget")] 
    public required string Type { get; set; } // "stats" | "chart" | "progress" | "metric"

    [Required]
    [StringLength(100)]
    public required string Title { get; set; }

    public string? Value { get; set; }

    // Config específico por tipo (e.g., dataset de chart, meta de progress, etc.)
    public object? Config { get; set; }
}

public class DashboardDataDto
{
    public List<DashboardWidgetDto> Widgets { get; set; } = new();

    [RegularExpression("^(grid|flexible)$", ErrorMessage = "Layout inválido")] 
    public string Layout { get; set; } = "grid"; // "grid" | "flexible"
}

