using System;
using System.Collections.Generic;

namespace Arc.Application.DTOs.Budget
{
    // Request DTOs
    public class CreateBudgetDto
    {
        public Guid WorkspaceId { get; set; }
        public Guid PageId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string ClientEmail { get; set; } = string.Empty;
        public string ClientCompany { get; set; } = string.Empty;
        public string ProjectName { get; set; } = string.Empty;
        public string ProjectDescription { get; set; } = string.Empty;
        public string CalculationType { get; set; } = "ByFeatures";
        public string Currency { get; set; } = "BRL";
        public int ValidityDays { get; set; } = 30;
        public decimal DiscountPercentage { get; set; }
        public string Notes { get; set; } = string.Empty;
        public string TermsAndConditions { get; set; } = string.Empty;
        public List<CreateBudgetItemDto> Items { get; set; } = new();
        public List<CreateBudgetPhaseDto> Phases { get; set; } = new();
    }

    public class CreateBudgetItemDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; }
        public int EstimatedHours { get; set; }
        public decimal HourlyRate { get; set; }
        public string Complexity { get; set; } = "Medium";
    }

    public class CreateBudgetPhaseDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int DurationDays { get; set; }
        public decimal Amount { get; set; }
    }

    public class UpdateBudgetDto
    {
        public string? ClientName { get; set; }
        public string? ClientEmail { get; set; }
        public string? ClientCompany { get; set; }
        public string? ProjectName { get; set; }
        public string? ProjectDescription { get; set; }
        public string? Status { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public string? Notes { get; set; }
        public string? TermsAndConditions { get; set; }
        public List<CreateBudgetItemDto>? Items { get; set; }
        public List<CreateBudgetPhaseDto>? Phases { get; set; }
    }

    // Response DTOs
    public class BudgetResponseDto
    {
        public Guid Id { get; set; }
        public Guid WorkspaceId { get; set; }
        public Guid PageId { get; set; }
        public string BudgetNumber { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public string ClientEmail { get; set; } = string.Empty;
        public string ClientCompany { get; set; } = string.Empty;
        public string ProjectName { get; set; } = string.Empty;
        public string ProjectDescription { get; set; } = string.Empty;
        public string CalculationType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal FinalAmount { get; set; }
        public string Currency { get; set; } = "BRL";
        public int ValidityDays { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? SentAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public string Notes { get; set; } = string.Empty;
        public string TermsAndConditions { get; set; } = string.Empty;
        public List<BudgetItemResponseDto> Items { get; set; } = new();
        public List<BudgetPhaseResponseDto> Phases { get; set; } = new();
        public BudgetSummaryDto Summary { get; set; } = new();
    }

    public class BudgetItemResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public int EstimatedHours { get; set; }
        public decimal HourlyRate { get; set; }
        public string Complexity { get; set; } = string.Empty;
        public int Order { get; set; }
    }

    public class BudgetPhaseResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int DurationDays { get; set; }
        public decimal Amount { get; set; }
        public int Order { get; set; }
    }

    public class BudgetSummaryDto
    {
        public int TotalItems { get; set; }
        public int TotalHours { get; set; }
        public decimal AverageHourlyRate { get; set; }
        public int TotalDuration { get; set; }
        public Dictionary<string, decimal> ByCategory { get; set; } = new();
        public Dictionary<string, int> ByComplexity { get; set; } = new();
    }

    // Quick Calculation DTOs
    public class QuickCalculationDto
    {
        public string CalculationType { get; set; } = "ByFeatures";
        public List<QuickFeatureDto>? Features { get; set; }
        public QuickHoursDto? Hours { get; set; }
        public string? PackageType { get; set; }
        public decimal HourlyRate { get; set; } = 150;
    }

    public class QuickFeatureDto
    {
        public string Name { get; set; } = string.Empty;
        public string Complexity { get; set; } = "Medium";
        public int EstimatedHours { get; set; }
    }

    public class QuickHoursDto
    {
        public int FrontendHours { get; set; }
        public int BackendHours { get; set; }
        public int DesignHours { get; set; }
        public int TestingHours { get; set; }
        public int ProjectManagementHours { get; set; }
    }

    public class QuickCalculationResultDto
    {
        public decimal TotalAmount { get; set; }
        public int TotalHours { get; set; }
        public Dictionary<string, decimal> Breakdown { get; set; } = new();
        public List<string> Recommendations { get; set; } = new();
    }

    // Template DTOs
    public class BudgetTemplateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string CalculationType { get; set; } = string.Empty;
        public List<CreateBudgetItemDto> DefaultItems { get; set; } = new();
        public List<CreateBudgetPhaseDto> DefaultPhases { get; set; } = new();
        public string DefaultTerms { get; set; } = string.Empty;
    }

    // PDF Generation DTO
    public class GeneratePdfDto
    {
        public bool IncludeLogo { get; set; } = true;
        public bool IncludeItemDetails { get; set; } = true;
        public bool IncludePhases { get; set; } = true;
        public bool IncludeTerms { get; set; } = true;
        public bool IncludePaymentSchedule { get; set; } = true;
        public bool IncludeTaxBreakdown { get; set; } = true;
        public string Language { get; set; } = "pt-BR";
        public string ColorScheme { get; set; } = "professional";
        public string CompanyName { get; set; } = "Arc.";
        public string CompanyLogoUrl { get; set; } = string.Empty;
        public string CompanyAddress { get; set; } = string.Empty;
        public string CompanyPhone { get; set; } = string.Empty;
        public string CompanyEmail { get; set; } = string.Empty;
        public string CompanyWebsite { get; set; } = string.Empty;
        public string CompanyCNPJ { get; set; } = string.Empty;
    }

    // Advanced Calculation DTOs
    public class TaxConfigurationDto
    {
        public decimal ISSPercentage { get; set; }
        public decimal IRPFPercentage { get; set; }
        public decimal CSLLPercentage { get; set; }
        public decimal PISPercentage { get; set; }
        public decimal COFINSPercentage { get; set; }
        public decimal TotalTaxPercentage { get; set; }
    }

    public class PaymentScheduleDto
    {
        public int NumberOfInstallments { get; set; } = 1;
        public List<PaymentInstallmentDto> Installments { get; set; } = new();
    }

    public class PaymentInstallmentDto
    {
        public int InstallmentNumber { get; set; }
        public decimal Amount { get; set; }
        public decimal Percentage { get; set; }
        public string Description { get; set; } = string.Empty;
        public int DaysFromStart { get; set; }
    }

    public class ResourceCostDto
    {
        public string ResourceType { get; set; } = string.Empty; // Developer, Designer, etc.
        public string SeniorityLevel { get; set; } = string.Empty; // Junior, Pleno, Senior
        public decimal HourlyRate { get; set; }
        public int AllocatedHours { get; set; }
        public decimal TotalCost { get; set; }
    }

    // Package Calculation DTOs
    public class PackageOptionDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public List<string> IncludedFeatures { get; set; } = new();
        public int EstimatedDays { get; set; }
    }

    public class ComplexityMatrixDto
    {
        public string FeatureType { get; set; } = string.Empty;
        public int LowComplexityHours { get; set; }
        public int MediumComplexityHours { get; set; }
        public int HighComplexityHours { get; set; }
        public int VeryHighComplexityHours { get; set; }
    }

    // Analytics and Reporting
    public class BudgetComparisonDto
    {
        public Guid Budget1Id { get; set; }
        public Guid Budget2Id { get; set; }
        public decimal PriceDifference { get; set; }
        public decimal PercentageDifference { get; set; }
        public int HoursDifference { get; set; }
        public Dictionary<string, object> Differences { get; set; } = new();
    }
}
