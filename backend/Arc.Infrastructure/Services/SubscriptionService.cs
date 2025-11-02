using Arc.Application.DTOs;
using Arc.Domain.Entities;
using Arc.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Arc.Infrastructure.Services;

public interface ISubscriptionService
{
    Task<SubscriptionDto?> GetUserSubscriptionAsync(Guid userId);
    Task<SubscriptionDto> CreateSubscriptionAsync(Guid userId, CreateSubscriptionDto dto);
    Task<SubscriptionDto> UpdateSubscriptionAsync(Guid userId, UpdateSubscriptionDto dto);
    Task<bool> CancelSubscriptionAsync(Guid userId, bool immediate = false);
    Task<SubscriptionUsageDto> GetSubscriptionUsageAsync(Guid userId);
    Task<bool> CanPerformActionAsync(Guid userId, string action);
    Task<PlanLimitsDto> GetPlanLimitsAsync(Guid userId);
}

public class SubscriptionService : ISubscriptionService
{
    private readonly AppDbContext _context;

    public SubscriptionService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SubscriptionDto?> GetUserSubscriptionAsync(Guid userId)
    {
        var subscription = await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (subscription == null)
        {
            // Retornar plano FREE por padrão
            return CreateFreePlanDto(userId);
        }

        return MapToDto(subscription);
    }

    public async Task<SubscriptionDto> CreateSubscriptionAsync(Guid userId, CreateSubscriptionDto dto)
    {
        // Verificar se já tem subscription
        var existing = await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (existing != null)
        {
            throw new InvalidOperationException("User already has a subscription");
        }

        if (!Enum.TryParse<PlanType>(dto.PlanType, out var planType))
        {
            throw new ArgumentException("Invalid plan type");
        }

        if (!Enum.TryParse<BillingInterval>(dto.BillingInterval, out var billingInterval))
        {
            throw new ArgumentException("Invalid billing interval");
        }

        var subscription = new Subscription
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            PlanType = planType,
            Status = SubscriptionStatus.ACTIVE,
            BillingInterval = billingInterval,
            CurrentPeriodStart = DateTime.UtcNow,
            CurrentPeriodEnd = billingInterval == BillingInterval.MONTHLY
                ? DateTime.UtcNow.AddMonths(1)
                : DateTime.UtcNow.AddYears(1),
            CancelAtPeriodEnd = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Aqui seria integrado com Stripe para processar pagamento
        // subscription.StripeCustomerId = await CreateStripeCustomer(userId);
        // subscription.StripeSubscriptionId = await CreateStripeSubscription(subscription);

        _context.Subscriptions.Add(subscription);

        // Atualizar User com SubscriptionId
        var user = await _context.Users.FindAsync(userId);
        if (user != null)
        {
            user.SubscriptionId = subscription.Id;
        }

        await _context.SaveChangesAsync();

        return MapToDto(subscription);
    }

    public async Task<SubscriptionDto> UpdateSubscriptionAsync(Guid userId, UpdateSubscriptionDto dto)
    {
        var subscription = await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (subscription == null)
        {
            throw new InvalidOperationException("Subscription not found");
        }

        if (dto.PlanType != null && Enum.TryParse<PlanType>(dto.PlanType, out var planType))
        {
            subscription.PlanType = planType;
        }

        if (dto.BillingInterval != null && Enum.TryParse<BillingInterval>(dto.BillingInterval, out var billingInterval))
        {
            subscription.BillingInterval = billingInterval;
        }

        if (dto.CancelAtPeriodEnd.HasValue)
        {
            subscription.CancelAtPeriodEnd = dto.CancelAtPeriodEnd.Value;
        }

        subscription.UpdatedAt = DateTime.UtcNow;

        // Aqui seria integrado com Stripe para atualizar subscription
        // await UpdateStripeSubscription(subscription);

        await _context.SaveChangesAsync();

        return MapToDto(subscription);
    }

    public async Task<bool> CancelSubscriptionAsync(Guid userId, bool immediate = false)
    {
        var subscription = await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (subscription == null)
        {
            return false;
        }

        if (immediate)
        {
            subscription.Status = SubscriptionStatus.CANCELED;
            subscription.CurrentPeriodEnd = DateTime.UtcNow;
        }
        else
        {
            subscription.CancelAtPeriodEnd = true;
        }

        subscription.UpdatedAt = DateTime.UtcNow;

        // Aqui seria integrado com Stripe para cancelar subscription
        // await CancelStripeSubscription(subscription.StripeSubscriptionId, immediate);

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<SubscriptionUsageDto> GetSubscriptionUsageAsync(Guid userId)
    {
        var subscription = await GetUserSubscriptionAsync(userId);
        if (subscription == null)
        {
            subscription = CreateFreePlanDto(userId);
        }

        // Contar uso atual (isso seria feito nas tabelas reais)
        // Por enquanto, retornando valores mock
        return new SubscriptionUsageDto
        {
            CurrentWorkspaces = 0,
            MaxWorkspaces = subscription.Limits.MaxWorkspaces,
            CurrentProjects = 0,
            MaxProjects = subscription.Limits.MaxProjects,
            CurrentTeamMembers = 0,
            MaxTeamMembers = subscription.Limits.MaxTeamMembers,
            CurrentStorageMB = 0,
            MaxStorageMB = subscription.Limits.MaxStorageMB
        };
    }

    public async Task<bool> CanPerformActionAsync(Guid userId, string action)
    {
        var subscription = await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.UserId == userId);

        var planType = subscription?.PlanType ?? PlanType.FREE;
        var limits = PlanLimits.GetLimitsForPlan(planType);

        return action switch
        {
            "advanced_analytics" => limits.HasAdvancedAnalytics,
            "custom_branding" => limits.HasCustomBranding,
            "priority_support" => limits.HasPrioritySupport,
            "api_access" => limits.HasApiAccess,
            "custom_domain" => limits.HasCustomDomain,
            _ => false
        };
    }

    public async Task<PlanLimitsDto> GetPlanLimitsAsync(Guid userId)
    {
        var subscription = await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.UserId == userId);

        var planType = subscription?.PlanType ?? PlanType.FREE;
        var limits = PlanLimits.GetLimitsForPlan(planType);

        return MapLimitsToDto(limits);
    }

    private SubscriptionDto MapToDto(Subscription subscription)
    {
        var limits = PlanLimits.GetLimitsForPlan(subscription.PlanType);

        return new SubscriptionDto
        {
            Id = subscription.Id,
            PlanType = subscription.PlanType.ToString(),
            Status = subscription.Status.ToString(),
            BillingInterval = subscription.BillingInterval.ToString(),
            CurrentPeriodStart = subscription.CurrentPeriodStart,
            CurrentPeriodEnd = subscription.CurrentPeriodEnd,
            CancelAtPeriodEnd = subscription.CancelAtPeriodEnd,
            Limits = MapLimitsToDto(limits)
        };
    }

    private PlanLimitsDto MapLimitsToDto(PlanLimits limits)
    {
        return new PlanLimitsDto
        {
            MaxWorkspaces = limits.MaxWorkspaces,
            MaxProjects = limits.MaxProjects,
            MaxTeamMembers = limits.MaxTeamMembers,
            MaxStorageMB = limits.MaxStorageMB,
            MaxFileUploadMB = limits.MaxFileUploadMB,
            MaxIntegrations = limits.MaxIntegrations,
            HasAdvancedAnalytics = limits.HasAdvancedAnalytics,
            HasCustomBranding = limits.HasCustomBranding,
            HasPrioritySupport = limits.HasPrioritySupport,
            HasApiAccess = limits.HasApiAccess,
            HasCustomDomain = limits.HasCustomDomain
        };
    }

    private SubscriptionDto CreateFreePlanDto(Guid userId)
    {
        var limits = PlanLimits.GetLimitsForPlan(PlanType.FREE);

        return new SubscriptionDto
        {
            Id = Guid.Empty,
            PlanType = PlanType.FREE.ToString(),
            Status = SubscriptionStatus.ACTIVE.ToString(),
            BillingInterval = BillingInterval.MONTHLY.ToString(),
            CurrentPeriodStart = DateTime.UtcNow,
            CurrentPeriodEnd = DateTime.UtcNow.AddYears(100),
            CancelAtPeriodEnd = false,
            Limits = MapLimitsToDto(limits)
        };
    }
}
