using Arc.Application.DTOs.Templates;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace Arc.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FocusController : ControllerBase
{
    private readonly IPageService _pageService;
    private readonly ILogger<FocusController> _logger;

    public FocusController(IPageService pageService, ILogger<FocusController> logger)
    {
        _pageService = pageService;
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
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<FocusDataDto>(jsonData) ?? new FocusDataDto();

            // Recalcular totais
            data.TotalSessions = data.Sessions.Count;
            data.TotalMinutes = data.Sessions.Sum(s => s.Duration);

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
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<FocusDataDto>(jsonData) ?? new FocusDataDto();

            session.Id = Guid.NewGuid().ToString();
            session.StartTime = DateTime.UtcNow;
            data.Sessions.Add(session);

            data.TotalSessions = data.Sessions.Count;
            data.TotalMinutes = data.Sessions.Sum(s => s.Duration);

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return CreatedAtAction(nameof(GetFocusData), new { pageId }, session);
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
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<FocusDataDto>(jsonData) ?? new FocusDataDto();

            var session = data.Sessions.FirstOrDefault(s => s.Id == sessionId);
            if (session == null)
                return NotFound(new { message = "Sessão não encontrada" });

            session.Completed = true;
            session.EndTime = DateTime.UtcNow;

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return Ok(new { message = "Sessão completada" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao completar sessão");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{pageId}/statistics")]
    public async Task<ActionResult<object>> GetStatistics(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<FocusDataDto>(jsonData) ?? new FocusDataDto();

            var completedSessions = data.Sessions.Count(s => s.Completed);
            var totalMinutes = data.Sessions.Sum(s => s.Duration);

            var stats = new
            {
                TotalSessions = data.Sessions.Count,
                CompletedSessions = completedSessions,
                TotalMinutes = totalMinutes,
                TotalHours = Math.Round(totalMinutes / 60.0, 2)
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter estatísticas");
            return BadRequest(new { message = ex.Message });
        }
    }
}
