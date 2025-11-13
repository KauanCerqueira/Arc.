using Arc.Infrastructure.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace Arc.API.Attributes;

/// <summary>
/// Atributo para aplicar rate limiting adaptativo em endpoints de integração
/// Uso: [IntegrationRateLimit("Google")] ou [IntegrationRateLimit("GitHub")]
/// </summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false)]
public class IntegrationRateLimitAttribute : ActionFilterAttribute
{
    private readonly string _integrationType;

    public IntegrationRateLimitAttribute(string integrationType)
    {
        _integrationType = integrationType;
    }

    public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var rateLimiter = context.HttpContext.RequestServices.GetService<IIntegrationRateLimiter>();
        if (rateLimiter == null)
        {
            await next();
            return;
        }

        // Obter userId do token JWT
        var userIdClaim = context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            context.Result = new UnauthorizedObjectResult(new { error = "Usuário não autenticado" });
            return;
        }

        // Verificar rate limit
        var result = await rateLimiter.CheckRateLimitAsync(userId, _integrationType);

        if (!result.Allowed)
        {
            context.HttpContext.Response.Headers["Retry-After"] = result.RetryAfterSeconds.ToString();
            context.HttpContext.Response.Headers["X-RateLimit-Reason"] = result.Reason;

            context.Result = new ObjectResult(new
            {
                error = "Rate limit exceeded",
                message = result.Reason,
                retryAfterSeconds = result.RetryAfterSeconds,
                integrationType = _integrationType
            })
            {
                StatusCode = 429 // Too Many Requests
            };
            return;
        }

        // Incrementar contador
        await rateLimiter.IncrementRequestCountAsync(userId, _integrationType);

        // Adicionar headers de rate limit na resposta
        var status = await rateLimiter.GetRateLimitStatusAsync(userId, _integrationType);
        context.HttpContext.Response.OnStarting(() =>
        {
            context.HttpContext.Response.Headers["X-RateLimit-Remaining-Minute"] = status.RequestsRemainingMinute.ToString();
            context.HttpContext.Response.Headers["X-RateLimit-Remaining-Hour"] = status.RequestsRemainingHour.ToString();
            context.HttpContext.Response.Headers["X-RateLimit-Remaining-Day"] = status.RequestsRemainingDay.ToString();
            context.HttpContext.Response.Headers["X-RateLimit-Limit-Minute"] = status.MaxRequestsPerMinute.ToString();
            context.HttpContext.Response.Headers["X-RateLimit-Limit-Hour"] = status.MaxRequestsPerHour.ToString();
            context.HttpContext.Response.Headers["X-RateLimit-Limit-Day"] = status.MaxRequestsPerDay.ToString();
            return Task.CompletedTask;
        });

        await next();
    }
}
