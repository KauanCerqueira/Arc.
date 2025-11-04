using System.ComponentModel.DataAnnotations;

namespace Arc.Application.DTOs.Timeline;

public class TimelineItemDto
{
    [Required]
    public required string Id { get; set; }

    [Required]
    [StringLength(200)]
    public required string Title { get; set; }

    public DateTime Date { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; }
    public string? Color { get; set; }
}

public class TimelineDataDto
{
    public List<TimelineItemDto> Items { get; set; } = new();
}

