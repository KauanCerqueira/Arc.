using System.ComponentModel.DataAnnotations;

namespace Arc.Application.DTOs.Roadmap;

// ===== REQUEST DTOs =====

public class RoadmapItemDto
{
    public required string Id { get; set; }

    [Required]
    [StringLength(200)]
    public required string Title { get; set; }

    [StringLength(1000)]
    public string? Description { get; set; }

    [Required]
    public required string Status { get; set; } // "planned", "in-progress", "completed"

    [Required]
    [StringLength(20)]
    public required string Quarter { get; set; } // "Q1 2025", etc

    [Required]
    public required string Priority { get; set; } // "low", "medium", "high"
}

public class CreateRoadmapItemRequestDto
{
    [Required]
    public required Guid PageId { get; set; }

    [Required]
    public required RoadmapItemDto Item { get; set; }
}

public class UpdateRoadmapItemRequestDto
{
    [Required]
    public required Guid PageId { get; set; }

    [Required]
    public required string ItemId { get; set; }

    [Required]
    public required RoadmapItemDto Item { get; set; }
}

public class DeleteRoadmapItemRequestDto
{
    [Required]
    public required Guid PageId { get; set; }

    [Required]
    public required string ItemId { get; set; }
}

public class FilterRoadmapRequestDto
{
    public string? Status { get; set; }
    public string? Quarter { get; set; }
    public string? Priority { get; set; }
}

// ===== RESPONSE DTOs =====

public class RoadmapStatisticsDto
{
    public int TotalItems { get; set; }
    public int PlannedItems { get; set; }
    public int InProgressItems { get; set; }
    public int CompletedItems { get; set; }
    public int HighPriorityItems { get; set; }
    public int MediumPriorityItems { get; set; }
    public int LowPriorityItems { get; set; }
    public double CompletionPercentage { get; set; }
    public Dictionary<string, int> ItemsByQuarter { get; set; } = new();
}

public class RoadmapDataDto
{
    public List<RoadmapItemDto> Items { get; set; } = new();
    public RoadmapStatisticsDto? Statistics { get; set; }
}
