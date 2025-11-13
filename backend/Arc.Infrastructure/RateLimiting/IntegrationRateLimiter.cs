using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace Arc.Infrastructure.RateLimiting;

/// <summary>
/// Rate limiter adaptativo para integrações externas
/// Previne excesso de chamadas às APIs do Google, GitHub, etc.
/// </summary>
public class IntegrationRateLimiter : IIntegrationRateLimiter
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<IntegrationRateLimiter> _logger;

    // Configurações de rate limit por integração (por usuário)
    private readonly Dictionary<string, RateLimitConfig> _rateLimits = new()
    {
        ["Google"] = new RateLimitConfig
        {
            MaxRequestsPerHour = 1000,      // Google Calendar API: ~10k/day, safe hourly limit
            MaxRequestsPerDay = 10000,       // Google Calendar API daily quota
            MaxRequestsPerMinute = 60,       // Burst protection
            WindowSizeSeconds = 60
        },
        ["GitHub"] = new RateLimitConfig
        {
            MaxRequestsPerHour = 5000,       // GitHub API hourly limit
            MaxRequestsPerDay = 120000,      // 5000 * 24 (theoretical max)
            MaxRequestsPerMinute = 100,      // Burst protection
            WindowSizeSeconds = 60
        }
    };

    public IntegrationRateLimiter(IMemoryCache cache, ILogger<IntegrationRateLimiter> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public async Task<RateLimitResult> CheckRateLimitAsync(Guid userId, string integrationType)
    {
        if (!_rateLimits.TryGetValue(integrationType, out var config))
        {
            // Sem limite configurado, permitir
            return new RateLimitResult { Allowed = true };
        }

        var now = DateTime.UtcNow;

        // Verificar limite por minuto
        var minuteKey = $"ratelimit:{integrationType}:{userId}:minute:{now:yyyyMMddHHmm}";
        var minuteCount = _cache.GetOrCreate(minuteKey, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(2);
            return 0;
        });

        if (minuteCount >= config.MaxRequestsPerMinute)
        {
            _logger.LogWarning("Rate limit por minuto excedido para {UserId} - {Integration}: {Count}/{Max}",
                userId, integrationType, minuteCount, config.MaxRequestsPerMinute);

            return new RateLimitResult
            {
                Allowed = false,
                RetryAfterSeconds = 60 - now.Second,
                Reason = $"Limite de {config.MaxRequestsPerMinute} requisições por minuto atingido"
            };
        }

        // Verificar limite por hora
        var hourKey = $"ratelimit:{integrationType}:{userId}:hour:{now:yyyyMMddHH}";
        var hourCount = _cache.GetOrCreate(hourKey, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(2);
            return 0;
        });

        if (hourCount >= config.MaxRequestsPerHour)
        {
            _logger.LogWarning("Rate limit por hora excedido para {UserId} - {Integration}: {Count}/{Max}",
                userId, integrationType, hourCount, config.MaxRequestsPerHour);

            var minutesUntilNextHour = 60 - now.Minute;
            return new RateLimitResult
            {
                Allowed = false,
                RetryAfterSeconds = minutesUntilNextHour * 60,
                Reason = $"Limite de {config.MaxRequestsPerHour} requisições por hora atingido"
            };
        }

        // Verificar limite diário
        var dayKey = $"ratelimit:{integrationType}:{userId}:day:{now:yyyyMMdd}";
        var dayCount = _cache.GetOrCreate(dayKey, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(26);
            return 0;
        });

        if (dayCount >= config.MaxRequestsPerDay)
        {
            _logger.LogWarning("Rate limit diário excedido para {UserId} - {Integration}: {Count}/{Max}",
                userId, integrationType, dayCount, config.MaxRequestsPerDay);

            var hoursUntilMidnight = 24 - now.Hour;
            return new RateLimitResult
            {
                Allowed = false,
                RetryAfterSeconds = hoursUntilMidnight * 3600,
                Reason = $"Limite diário de {config.MaxRequestsPerDay} requisições atingido"
            };
        }

        // Permitir requisição
        return await Task.FromResult(new RateLimitResult { Allowed = true });
    }

    public async Task IncrementRequestCountAsync(Guid userId, string integrationType)
    {
        var now = DateTime.UtcNow;

        // Incrementar contador por minuto
        var minuteKey = $"ratelimit:{integrationType}:{userId}:minute:{now:yyyyMMddHHmm}";
        var minuteCount = _cache.GetOrCreate(minuteKey, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(2);
            return 0;
        });
        _cache.Set(minuteKey, minuteCount + 1);

        // Incrementar contador por hora
        var hourKey = $"ratelimit:{integrationType}:{userId}:hour:{now:yyyyMMddHH}";
        var hourCount = _cache.GetOrCreate(hourKey, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(2);
            return 0;
        });
        _cache.Set(hourKey, hourCount + 1);

        // Incrementar contador diário
        var dayKey = $"ratelimit:{integrationType}:{userId}:day:{now:yyyyMMdd}";
        var dayCount = _cache.GetOrCreate(dayKey, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(26);
            return 0;
        });
        _cache.Set(dayKey, dayCount + 1);

        await Task.CompletedTask;
    }

    public async Task<RateLimitStatus> GetRateLimitStatusAsync(Guid userId, string integrationType)
    {
        if (!_rateLimits.TryGetValue(integrationType, out var config))
        {
            return new RateLimitStatus
            {
                IntegrationType = integrationType,
                RequestsRemainingMinute = int.MaxValue,
                RequestsRemainingHour = int.MaxValue,
                RequestsRemainingDay = int.MaxValue
            };
        }

        var now = DateTime.UtcNow;

        var minuteKey = $"ratelimit:{integrationType}:{userId}:minute:{now:yyyyMMddHHmm}";
        var minuteCount = _cache.Get<int>(minuteKey);

        var hourKey = $"ratelimit:{integrationType}:{userId}:hour:{now:yyyyMMddHH}";
        var hourCount = _cache.Get<int>(hourKey);

        var dayKey = $"ratelimit:{integrationType}:{userId}:day:{now:yyyyMMdd}";
        var dayCount = _cache.Get<int>(dayKey);

        return await Task.FromResult(new RateLimitStatus
        {
            IntegrationType = integrationType,
            RequestsRemainingMinute = Math.Max(0, config.MaxRequestsPerMinute - minuteCount),
            RequestsRemainingHour = Math.Max(0, config.MaxRequestsPerHour - hourCount),
            RequestsRemainingDay = Math.Max(0, config.MaxRequestsPerDay - dayCount),
            MaxRequestsPerMinute = config.MaxRequestsPerMinute,
            MaxRequestsPerHour = config.MaxRequestsPerHour,
            MaxRequestsPerDay = config.MaxRequestsPerDay,
            CurrentMinuteCount = minuteCount,
            CurrentHourCount = hourCount,
            CurrentDayCount = dayCount
        });
    }
}

public interface IIntegrationRateLimiter
{
    Task<RateLimitResult> CheckRateLimitAsync(Guid userId, string integrationType);
    Task IncrementRequestCountAsync(Guid userId, string integrationType);
    Task<RateLimitStatus> GetRateLimitStatusAsync(Guid userId, string integrationType);
}

public class RateLimitResult
{
    public bool Allowed { get; set; }
    public int? RetryAfterSeconds { get; set; }
    public string? Reason { get; set; }
}

public class RateLimitStatus
{
    public string IntegrationType { get; set; } = string.Empty;
    public int RequestsRemainingMinute { get; set; }
    public int RequestsRemainingHour { get; set; }
    public int RequestsRemainingDay { get; set; }
    public int MaxRequestsPerMinute { get; set; }
    public int MaxRequestsPerHour { get; set; }
    public int MaxRequestsPerDay { get; set; }
    public int CurrentMinuteCount { get; set; }
    public int CurrentHourCount { get; set; }
    public int CurrentDayCount { get; set; }
}

public class RateLimitConfig
{
    public int MaxRequestsPerMinute { get; set; }
    public int MaxRequestsPerHour { get; set; }
    public int MaxRequestsPerDay { get; set; }
    public int WindowSizeSeconds { get; set; }
}
