using Arc.Application.DTOs.Google;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GoogleIntegrationController : ControllerBase
{
    private readonly IGoogleIntegrationService _googleService;
    private readonly ILogger<GoogleIntegrationController> _logger;

    public GoogleIntegrationController(
        IGoogleIntegrationService googleService,
        ILogger<GoogleIntegrationController> logger)
    {
        _googleService = googleService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : throw new UnauthorizedAccessException();
    }

    #region Configuration

    /// <summary>
    /// Configura a integração com Google Workspace
    /// </summary>
    [HttpPost("configure")]
    [ProducesResponseType(typeof(GoogleIntegrationConfigDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<GoogleIntegrationConfigDto>> ConfigureIntegration(
        [FromBody] GoogleIntegrationConfigDto config)
    {
        var userId = GetUserId();
        config.UserId = userId;

        _logger.LogInformation("Configurando integração Google para usuário {UserId}", userId);

        try
        {
            var result = await _googleService.ConfigureIntegrationAsync(config);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao configurar integração Google");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Retorna a configuração atual da integração
    /// </summary>
    [HttpGet("config")]
    [ProducesResponseType(typeof(GoogleIntegrationConfigDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GoogleIntegrationConfigDto>> GetConfig()
    {
        var userId = GetUserId();
        var config = await _googleService.GetIntegrationConfigAsync(userId);

        if (config == null)
        {
            return NotFound(new { message = "Integração não configurada" });
        }

        return Ok(config);
    }

    /// <summary>
    /// Desabilita a integração com Google
    /// </summary>
    [HttpDelete("disable")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> DisableIntegration()
    {
        var userId = GetUserId();
        await _googleService.DisableIntegrationAsync(userId);

        return Ok(new { message = "Integração desabilitada com sucesso" });
    }

    #endregion

    #region Google Calendar

    /// <summary>
    /// Lista todos os calendários disponíveis do usuário
    /// </summary>
    [HttpGet("calendars")]
    [ProducesResponseType(typeof(List<GoogleCalendarListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<GoogleCalendarListDto>>> GetCalendars()
    {
        var userId = GetUserId();
        var calendars = await _googleService.GetAvailableCalendarsAsync(userId);
        return Ok(calendars);
    }

    /// <summary>
    /// Cria um evento no Google Calendar
    /// </summary>
    [HttpPost("calendar/events")]
    [ProducesResponseType(typeof(GoogleCalendarEventDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<GoogleCalendarEventDto>> CreateCalendarEvent(
        [FromBody] GoogleCalendarEventDto eventDto)
    {
        var userId = GetUserId();
        var createdEvent = await _googleService.CreateCalendarEventAsync(userId, eventDto);
        return CreatedAtAction(nameof(CreateCalendarEvent), new { id = createdEvent.Id }, createdEvent);
    }

    /// <summary>
    /// Atualiza um evento no Google Calendar
    /// </summary>
    [HttpPut("calendar/events/{eventId}")]
    [ProducesResponseType(typeof(GoogleCalendarEventDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<GoogleCalendarEventDto>> UpdateCalendarEvent(
        string eventId,
        [FromBody] GoogleCalendarEventDto eventDto)
    {
        var userId = GetUserId();
        var updatedEvent = await _googleService.UpdateCalendarEventAsync(userId, eventId, eventDto);
        return Ok(updatedEvent);
    }

    /// <summary>
    /// Deleta um evento do Google Calendar
    /// </summary>
    [HttpDelete("calendar/events/{eventId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteCalendarEvent(string eventId, [FromQuery] string calendarId = "primary")
    {
        var userId = GetUserId();
        await _googleService.DeleteCalendarEventAsync(userId, eventId, calendarId);
        return NoContent();
    }

    /// <summary>
    /// Lista eventos do Google Calendar
    /// </summary>
    [HttpGet("calendar/events")]
    [ProducesResponseType(typeof(List<GoogleCalendarEventDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<GoogleCalendarEventDto>>> GetCalendarEvents(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var userId = GetUserId();
        var events = await _googleService.GetCalendarEventsAsync(userId, startDate, endDate);
        return Ok(events);
    }

    #endregion

    #region Google Tasks

    /// <summary>
    /// Lista todas as listas de tarefas disponíveis
    /// </summary>
    [HttpGet("task-lists")]
    [ProducesResponseType(typeof(List<GoogleTaskListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<GoogleTaskListDto>>> GetTaskLists()
    {
        var userId = GetUserId();
        var taskLists = await _googleService.GetAvailableTaskListsAsync(userId);
        return Ok(taskLists);
    }

    /// <summary>
    /// Cria uma tarefa no Google Tasks
    /// </summary>
    [HttpPost("tasks")]
    [ProducesResponseType(typeof(GoogleTaskDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<GoogleTaskDto>> CreateTask([FromBody] GoogleTaskDto taskDto)
    {
        var userId = GetUserId();
        var createdTask = await _googleService.CreateTaskAsync(userId, taskDto);
        return CreatedAtAction(nameof(CreateTask), new { id = createdTask.Id }, createdTask);
    }

    /// <summary>
    /// Atualiza uma tarefa no Google Tasks
    /// </summary>
    [HttpPut("tasks/{taskId}")]
    [ProducesResponseType(typeof(GoogleTaskDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<GoogleTaskDto>> UpdateTask(string taskId, [FromBody] GoogleTaskDto taskDto)
    {
        var userId = GetUserId();
        var updatedTask = await _googleService.UpdateTaskAsync(userId, taskId, taskDto);
        return Ok(updatedTask);
    }

    /// <summary>
    /// Deleta uma tarefa do Google Tasks
    /// </summary>
    [HttpDelete("tasks/{taskId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteTask(string taskId, [FromQuery] string taskListId = "@default")
    {
        var userId = GetUserId();
        await _googleService.DeleteTaskAsync(userId, taskId, taskListId);
        return NoContent();
    }

    /// <summary>
    /// Lista tarefas do Google Tasks
    /// </summary>
    [HttpGet("tasks")]
    [ProducesResponseType(typeof(List<GoogleTaskDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<GoogleTaskDto>>> GetTasks([FromQuery] string? taskListId = null)
    {
        var userId = GetUserId();
        var tasks = await _googleService.GetTasksAsync(userId, taskListId);
        return Ok(tasks);
    }

    #endregion

    #region Sync

    /// <summary>
    /// Sincroniza dados com Google Workspace
    /// </summary>
    [HttpPost("sync")]
    [ProducesResponseType(typeof(SyncStatusDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SyncStatusDto>> Sync()
    {
        var userId = GetUserId();
        _logger.LogInformation("Iniciando sincronização manual para usuário {UserId}", userId);

        var status = await _googleService.SyncWithGoogleAsync(userId);
        return Ok(status);
    }

    /// <summary>
    /// Retorna o status da sincronização
    /// </summary>
    [HttpGet("sync/status")]
    [ProducesResponseType(typeof(SyncStatusDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SyncStatusDto>> GetSyncStatus()
    {
        var userId = GetUserId();
        var status = await _googleService.GetSyncStatusAsync(userId);
        return Ok(status);
    }

    /// <summary>
    /// Webhook para receber notificações do Google
    /// </summary>
    [HttpPost("webhook")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> HandleWebhook(
        [FromHeader(Name = "X-Goog-Channel-ID")] string channelId,
        [FromHeader(Name = "X-Goog-Resource-ID")] string resourceId,
        [FromHeader(Name = "X-Goog-Resource-State")] string resourceState)
    {
        _logger.LogInformation("Webhook recebido do Google: {ChannelId}", channelId);

        await _googleService.HandleGoogleWebhookAsync(channelId, resourceId, resourceState);

        return Ok();
    }

    #endregion
}
