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
public class CalendarController : ControllerBase
{
    private readonly IPageService _pageService;
    private readonly ILogger<CalendarController> _logger;

    public CalendarController(IPageService pageService, ILogger<CalendarController> logger)
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
    public async Task<ActionResult<CalendarDataDto>> GetCalendarData(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<CalendarDataDto>(jsonData) ?? new CalendarDataDto();

            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter dados do calendário");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{pageId}")]
    public async Task<ActionResult<CalendarEventDto>> AddEvent(Guid pageId, [FromBody] CalendarEventDto eventDto)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<CalendarDataDto>(jsonData) ?? new CalendarDataDto();

            eventDto.Id = Guid.NewGuid().ToString();
            data.Events.Add(eventDto);

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return CreatedAtAction(nameof(GetCalendarData), new { pageId }, eventDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao adicionar evento");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{pageId}/{eventId}")]
    public async Task<ActionResult<CalendarEventDto>> UpdateEvent(Guid pageId, string eventId, [FromBody] CalendarEventDto updatedEvent)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<CalendarDataDto>(jsonData) ?? new CalendarDataDto();

            var eventDto = data.Events.FirstOrDefault(e => e.Id == eventId);
            if (eventDto == null)
                return NotFound(new { message = "Evento não encontrado" });

            eventDto.Title = updatedEvent.Title;
            eventDto.Description = updatedEvent.Description;
            eventDto.Start = updatedEvent.Start;
            eventDto.End = updatedEvent.End;
            eventDto.AllDay = updatedEvent.AllDay;
            eventDto.Color = updatedEvent.Color;

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return Ok(eventDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar evento");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{pageId}/{eventId}")]
    public async Task<IActionResult> DeleteEvent(Guid pageId, string eventId)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<CalendarDataDto>(jsonData) ?? new CalendarDataDto();

            var eventDto = data.Events.FirstOrDefault(e => e.Id == eventId);
            if (eventDto == null)
                return NotFound(new { message = "Evento não encontrado" });

            data.Events.Remove(eventDto);

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar evento");
            return BadRequest(new { message = ex.Message });
        }
    }
}
