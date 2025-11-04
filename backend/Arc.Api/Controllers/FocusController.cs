using Arc.Application.DTOs.Templates;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FocusController : ControllerBase
{
    private readonly IFocusService _focusService;
    private readonly ILogger<FocusController> _logger;

    public FocusController(IFocusService focusService, ILogger<FocusController> logger)
    {
        _focusService = focusService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    [HttpGet("{pageId}")]
    public async Task<ActionResult<FocusDataDto>> GetFocusData(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var data = await _focusService.GetAsync(pageId, userId);
            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter dados de foco");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{pageId}/sessions")]
    public async Task<ActionResult<PomodoroSessionDto>> StartSession(Guid pageId, [FromBody] PomodoroSessionDto session)
    {
        try
        {
            var userId = GetUserId();
            var created = await _focusService.StartSessionAsync(pageId, userId, session);
            return CreatedAtAction(nameof(GetFocusData), new { pageId }, created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao iniciar sessão");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{pageId}/sessions/{sessionId}/complete")]
    public async Task<IActionResult> CompleteSession(Guid pageId, string sessionId)
    {
        try
        {
            var userId = GetUserId();
            await _focusService.CompleteSessionAsync(pageId, userId, sessionId);
            return Ok(new { message = "Sessão completada" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao completar sessão");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{pageId}/statistics")]
    public async Task<ActionResult<FocusStatisticsDto>> GetStatistics(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var stats = await _focusService.GetStatisticsAsync(pageId, userId);
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter estatísticas");
            return BadRequest(new { message = ex.Message });
        }
    }
}

