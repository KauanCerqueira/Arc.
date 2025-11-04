using System.ComponentModel.DataAnnotations;

namespace Arc.Application.DTOs.PersonalBudget;

public class PersonalTransactionDto
{
    [Required]
    public required string Id { get; set; }

    [Required]
    [RegularExpression("^(income|expense)$")]
    public required string Type { get; set; }

    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal Amount { get; set; }

    public string? Category { get; set; }
    public DateTime Date { get; set; }
}

public class PersonalBudgetDataDto
{
    public List<PersonalTransactionDto> Transactions { get; set; } = new();
    public decimal TotalIncome { get; set; }
    public decimal TotalExpense { get; set; }
    public decimal Balance { get; set; }
}

