using System.ComponentModel.DataAnnotations;

namespace Arc.Application.DTOs.BusinessBudget;

public class BusinessTransactionDto
{
    [Required]
    public required string Id { get; set; }

    [Required]
    [RegularExpression("^(revenue|expense)$")]
    public required string Type { get; set; }

    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal Amount { get; set; }

    public string? Category { get; set; }
    public string? ProjectId { get; set; }
    public DateTime Date { get; set; }
}

public class BusinessBudgetDataDto
{
    public List<BusinessTransactionDto> Transactions { get; set; } = new();
    public List<string> Projects { get; set; } = new();
    public decimal MRR { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal TotalExpense { get; set; }
    public decimal Balance { get; set; }
}

