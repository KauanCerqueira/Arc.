using Arc.Application.DTOs.Dashboard;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers.Templates;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(IDashboardService dashboardService, ILogger<DashboardController> logger)
    {
        _dashboardService = dashboardService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    [HttpGet("{pageId}")]
    public async Task<ActionResult<DashboardDataDto>> Get(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var data = await _dashboardService.GetAsync(pageId, userId);
            return Ok(data);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter dashboard");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{pageId}/widgets")]
    public async Task<ActionResult<DashboardWidgetDto>> AddWidget(Guid pageId, [FromBody] DashboardWidgetDto widget)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = GetUserId();
            var created = await _dashboardService.AddWidgetAsync(pageId, userId, widget);
            return CreatedAtAction(nameof(Get), new { pageId }, created);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao adicionar widget");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{pageId}")]
    public async Task<ActionResult<DashboardDataDto>> Update(Guid pageId, [FromBody] DashboardDataDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = GetUserId();
            var updated = await _dashboardService.UpdateAsync(pageId, userId, request);
            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar dashboard");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{pageId}/widgets/{widgetId}")]
    public async Task<IActionResult> DeleteWidget(Guid pageId, string widgetId)
    {
        try
        {
            var userId = GetUserId();
            await _dashboardService.DeleteWidgetAsync(pageId, userId, widgetId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar widget do dashboard");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{pageId}")]
    public async Task<IActionResult> Reset(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            await _dashboardService.ResetAsync(pageId, userId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao resetar dashboard");
            return BadRequest(new { message = ex.Message });
        }
    }
}

