using Arc.Application.DTOs.Timeline;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers.Templates;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TimelineController : ControllerBase
{
    private readonly ITimelineService _timelineService;
    private readonly ILogger<TimelineController> _logger;

    public TimelineController(ITimelineService timelineService, ILogger<TimelineController> logger)
    {
        _timelineService = timelineService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    [HttpGet("{pageId}")]
    public async Task<ActionResult<TimelineDataDto>> GetTimeline(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var data = await _timelineService.GetAsync(pageId, userId);
            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter timeline");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{pageId}")]
    public async Task<ActionResult<TimelineItemDto>> AddItem(Guid pageId, [FromBody] TimelineItemDto item)
    {
        try
        {
            var userId = GetUserId();
            var created = await _timelineService.AddAsync(pageId, userId, item);
            return CreatedAtAction(nameof(GetTimeline), new { pageId }, created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao adicionar item");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{pageId}/{itemId}")]
    public async Task<ActionResult<TimelineItemDto>> UpdateItem(Guid pageId, string itemId, [FromBody] TimelineItemDto updated)
    {
        try
        {
            var userId = GetUserId();
            var item = await _timelineService.UpdateAsync(pageId, userId, itemId, updated);
            return Ok(item);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar item");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{pageId}/{itemId}")]
    public async Task<IActionResult> DeleteItem(Guid pageId, string itemId)
    {
        try
        {
            var userId = GetUserId();
            await _timelineService.DeleteAsync(pageId, userId, itemId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar item");
            return BadRequest(new { message = ex.Message });
        }
    }
}

