using Arc.Domain.Entities;

namespace Arc.Application.DTOs;

public class SubscriptionDto
{
    public Guid Id { get; set; }
    public string PlanType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string BillingInterval { get; set; } = string.Empty;
    public DateTime CurrentPeriodStart { get; set; }
    public DateTime CurrentPeriodEnd { get; set; }
    public bool CancelAtPeriodEnd { get; set; }
    public PlanLimitsDto Limits { get; set; } = new();
}

public class PlanLimitsDto
{
    public int MaxWorkspaces { get; set; }
    public int MaxProjects { get; set; }
    public int MaxTeamMembers { get; set; }
    public int MaxStorageMB { get; set; }
    public int MaxFileUploadMB { get; set; }
    public int MaxIntegrations { get; set; }
    public bool HasAdvancedAnalytics { get; set; }
    public bool HasCustomBranding { get; set; }
    public bool HasPrioritySupport { get; set; }
    public bool HasApiAccess { get; set; }
    public bool HasCustomDomain { get; set; }
}

public class CreateSubscriptionDto
{
    public string PlanType { get; set; } = string.Empty;
    public string BillingInterval { get; set; } = "MONTHLY";
    public string? PaymentMethodId { get; set; }
}

public class UpdateSubscriptionDto
{
    public string? PlanType { get; set; }
    public string? BillingInterval { get; set; }
    public bool? CancelAtPeriodEnd { get; set; }
}

public class SubscriptionUsageDto
{
    public int CurrentWorkspaces { get; set; }
    public int MaxWorkspaces { get; set; }
    public int CurrentProjects { get; set; }
    public int MaxProjects { get; set; }
    public int CurrentTeamMembers { get; set; }
    public int MaxTeamMembers { get; set; }
    public int CurrentStorageMB { get; set; }
    public int MaxStorageMB { get; set; }

    public bool IsWorkspaceLimit => MaxWorkspaces > 0 && CurrentWorkspaces >= MaxWorkspaces;
    public bool IsProjectLimit => MaxProjects > 0 && CurrentProjects >= MaxProjects;
    public bool IsTeamMemberLimit => MaxTeamMembers > 0 && CurrentTeamMembers >= MaxTeamMembers;
    public bool IsStorageLimit => CurrentStorageMB >= MaxStorageMB;
}
