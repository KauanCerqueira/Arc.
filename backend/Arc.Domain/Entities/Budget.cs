using System;
using System.Collections.Generic;

namespace Arc.Domain.Entities
{
    public enum BudgetStatus
    {
        Draft = 0,
        Sent = 1,
        Approved = 2,
        Rejected = 3,
        Expired = 4
    }

    public enum CalculationType
    {
        ByFeatures = 0,      // Cálculo por features/funcionalidades
        ByHours = 1,         // Cálculo por horas
        ByPackage = 2,       // Pacotes pré-definidos
        ByComplexity = 3,    // Por complexidade (baixa, média, alta)
        Hybrid = 4           // Híbrido (combina vários métodos)
    }

    public enum ProjectComplexity
    {
        Low = 0,
        Medium = 1,
        High = 2,
        VeryHigh = 3
    }

    public class Budget
    {
        public Guid Id { get; set; }
        public Guid WorkspaceId { get; set; }
        public Guid PageId { get; set; }
        public string BudgetNumber { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public string ClientEmail { get; set; } = string.Empty;
        public string ClientCompany { get; set; } = string.Empty;
        public string ClientDocument { get; set; } = string.Empty; // CPF/CNPJ
        public string ClientPhone { get; set; } = string.Empty;
        public string ClientAddress { get; set; } = string.Empty;
        public string ProjectName { get; set; } = string.Empty;
        public string ProjectDescription { get; set; } = string.Empty;
        public CalculationType CalculationType { get; set; }
        public BudgetStatus Status { get; set; }

        // Financial Information
        public decimal TotalAmount { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal SubtotalAfterDiscount { get; set; }

        // Tax Information
        public decimal TaxPercentage { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal ISSPercentage { get; set; }
        public decimal ISSAmount { get; set; }
        public decimal IRPFPercentage { get; set; }
        public decimal IRPFAmount { get; set; }
        public decimal PISPercentage { get; set; }
        public decimal PISAmount { get; set; }
        public decimal COFINSPercentage { get; set; }
        public decimal COFINSAmount { get; set; }

        public decimal FinalAmount { get; set; }
        public string Currency { get; set; } = "BRL";
        public int ValidityDays { get; set; } = 30;

        // Payment Information
        public int NumberOfInstallments { get; set; } = 1;
        public string PaymentMethod { get; set; } = string.Empty;
        public string PaymentTerms { get; set; } = string.Empty;

        // Company Information (for PDF)
        public string CompanyName { get; set; } = "Arc.";
        public string CompanyAddress { get; set; } = string.Empty;
        public string CompanyPhone { get; set; } = string.Empty;
        public string CompanyEmail { get; set; } = string.Empty;
        public string CompanyWebsite { get; set; } = string.Empty;
        public string CompanyCNPJ { get; set; } = string.Empty;
        public string CompanyLogoUrl { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? SentAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public string Notes { get; set; } = string.Empty;
        public string TermsAndConditions { get; set; } = string.Empty;
        public bool IsActive { get; set; }

        // Navigation Properties
        public Workspace? Workspace { get; set; }
        public ICollection<BudgetItem> Items { get; set; } = new List<BudgetItem>();
        public ICollection<BudgetPhase> Phases { get; set; } = new List<BudgetPhase>();
        public ICollection<BudgetPaymentInstallment> PaymentInstallments { get; set; } = new List<BudgetPaymentInstallment>();
    }

    public class BudgetItem
    {
        public Guid Id { get; set; }
        public Guid BudgetId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public int EstimatedHours { get; set; }
        public decimal HourlyRate { get; set; }
        public ProjectComplexity Complexity { get; set; }
        public int Order { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation Properties
        public Budget? Budget { get; set; }
    }

    public class BudgetPhase
    {
        public Guid Id { get; set; }
        public Guid BudgetId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int DurationDays { get; set; }
        public decimal Amount { get; set; }
        public int Order { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation Properties
        public Budget? Budget { get; set; }
    }

    public class BudgetPaymentInstallment
    {
        public Guid Id { get; set; }
        public Guid BudgetId { get; set; }
        public int InstallmentNumber { get; set; }
        public decimal Amount { get; set; }
        public decimal Percentage { get; set; }
        public string Description { get; set; } = string.Empty;
        public int DaysFromStart { get; set; }
        public DateTime DueDate { get; set; }
        public bool IsPaid { get; set; }
        public DateTime? PaidAt { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation Properties
        public Budget? Budget { get; set; }
    }
}
