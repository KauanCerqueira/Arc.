using System.ComponentModel.DataAnnotations;

namespace Arc.Application.DTOs.Workout;

public class WorkoutEntryDto
{
    [Required]
    public required string Id { get; set; }

    [Required]
    [StringLength(100)]
    public required string Type { get; set; } // run, bike, gym, etc

    public DateTime Date { get; set; }
    public int DurationMinutes { get; set; }
    public int Calories { get; set; }
    public string? Notes { get; set; }
}

public class WorkoutDataDto
{
    public List<WorkoutEntryDto> Entries { get; set; } = new();
    public int TotalWorkouts { get; set; }
    public int TotalMinutes { get; set; }
    public int TotalCalories { get; set; }
}

