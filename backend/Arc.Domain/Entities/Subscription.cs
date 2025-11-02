using System;

namespace Arc.Domain.Entities
{
    public enum PlanType
    {
        FREE = 0,
        BASIC = 1,
        PRO = 2,
        ENTERPRISE = 3
    }

    public enum SubscriptionStatus
    {
        ACTIVE = 0,
        CANCELED = 1,
        PAST_DUE = 2,
        TRIALING = 3,
        INCOMPLETE = 4
    }

    public enum BillingInterval
    {
        MONTHLY = 0,
        YEARLY = 1
    }

    public class Subscription
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public PlanType PlanType { get; set; }
        public SubscriptionStatus Status { get; set; }
        public BillingInterval BillingInterval { get; set; }

        public DateTime CurrentPeriodStart { get; set; }
        public DateTime CurrentPeriodEnd { get; set; }
        public bool CancelAtPeriodEnd { get; set; }

        // Stripe integration
        public string? StripeCustomerId { get; set; }
        public string? StripeSubscriptionId { get; set; }
        public string? StripePaymentMethodId { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class PlanLimits
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

        public static PlanLimits GetLimitsForPlan(PlanType planType)
        {
            return planType switch
            {
                PlanType.FREE => new PlanLimits
                {
                    MaxWorkspaces = 1,
                    MaxProjects = 3,
                    MaxTeamMembers = 1,
                    MaxStorageMB = 100,
                    MaxFileUploadMB = 5,
                    MaxIntegrations = 0,
                    HasAdvancedAnalytics = false,
                    HasCustomBranding = false,
                    HasPrioritySupport = false,
                    HasApiAccess = false,
                    HasCustomDomain = false
                },
                PlanType.BASIC => new PlanLimits
                {
                    MaxWorkspaces = 3,
                    MaxProjects = 20,
                    MaxTeamMembers = 3,
                    MaxStorageMB = 1000,
                    MaxFileUploadMB = 25,
                    MaxIntegrations = 3,
                    HasAdvancedAnalytics = false,
                    HasCustomBranding = false,
                    HasPrioritySupport = false,
                    HasApiAccess = false,
                    HasCustomDomain = false
                },
                PlanType.PRO => new PlanLimits
                {
                    MaxWorkspaces = 10,
                    MaxProjects = 100,
                    MaxTeamMembers = 15,
                    MaxStorageMB = 10000,
                    MaxFileUploadMB = 100,
                    MaxIntegrations = 10,
                    HasAdvancedAnalytics = true,
                    HasCustomBranding = true,
                    HasPrioritySupport = true,
                    HasApiAccess = true,
                    HasCustomDomain = false
                },
                PlanType.ENTERPRISE => new PlanLimits
                {
                    MaxWorkspaces = -1, // unlimited
                    MaxProjects = -1,
                    MaxTeamMembers = -1,
                    MaxStorageMB = 100000,
                    MaxFileUploadMB = 500,
                    MaxIntegrations = -1,
                    HasAdvancedAnalytics = true,
                    HasCustomBranding = true,
                    HasPrioritySupport = true,
                    HasApiAccess = true,
                    HasCustomDomain = true
                },
                _ => throw new ArgumentException("Invalid plan type")
            };
        }
    }
}
