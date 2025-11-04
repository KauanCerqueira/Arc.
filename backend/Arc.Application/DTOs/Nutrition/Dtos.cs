using System.ComponentModel.DataAnnotations;

namespace Arc.Application.DTOs.Nutrition;

public class MealEntryDto
{
    [Required]
    public required string Id { get; set; }

    [Required]
    [RegularExpression("^(breakfast|lunch|dinner|snack)$")]
    public required string Type { get; set; }

    public DateTime Date { get; set; }
    public int Calories { get; set; }
    public int Protein { get; set; }
    public int Carbs { get; set; }
    public int Fat { get; set; }
    public string? Notes { get; set; }
}

public class NutritionDataDto
{
    public List<MealEntryDto> Meals { get; set; } = new();
    public int TotalCalories { get; set; }
    public int TotalProtein { get; set; }
    public int TotalCarbs { get; set; }
    public int TotalFat { get; set; }
}

