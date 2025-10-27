using Arc.Application.Interfaces;
using Arc.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;
    private readonly IUserRepository _userRepository;

    public AnalyticsController(
        IAnalyticsService analyticsService,
        IUserRepository userRepository)
    {
        _analyticsService = analyticsService;
        _userRepository = userRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAnalytics()
    {
        try
        {
            // Get current user ID from JWT token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Token inválido" });
            }

            // Check if user is master
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null || !user.IsMaster)
            {
                return Forbid();
            }

            var analytics = await _analyticsService.GetAnalyticsAsync();
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro ao buscar analytics", details = ex.Message });
        }
    }
}
