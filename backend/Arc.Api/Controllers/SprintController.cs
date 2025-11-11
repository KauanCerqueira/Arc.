using Arc.Application.DTOs.Sprint;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SprintController : ControllerBase
{
    private readonly ISprintService _sprintService;
    private readonly ILogger<SprintController> _logger;

    public SprintController(ISprintService sprintService, ILogger<SprintController> logger)
    {
        _sprintService = sprintService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    #region Sprint Endpoints

    /// <summary>
    /// Cria um novo sprint
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<SprintResponseDto>> CreateSprint([FromBody] CreateSprintDto dto)
    {
        try
        {
            var userId = GetUserId();
            var sprint = await _sprintService.CreateSprintAsync(dto, userId);
            return CreatedAtAction(nameof(GetSprintById), new { sprintId = sprint.Id }, sprint);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Acesso não autorizado ao criar sprint");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar sprint");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Obtém um sprint pelo ID
    /// </summary>
    [HttpGet("{sprintId}")]
    public async Task<ActionResult<SprintResponseDto>> GetSprintById(Guid sprintId)
    {
        try
        {
            var userId = GetUserId();
            var sprint = await _sprintService.GetSprintByIdAsync(sprintId, userId);
            return Ok(sprint);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Acesso não autorizado ao obter sprint");
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter sprint");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Obtém um sprint pelo Page ID
    /// </summary>
    [HttpGet("page/{pageId}")]
    public async Task<ActionResult<SprintResponseDto>> GetSprintByPageId(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var sprint = await _sprintService.GetSprintByPageIdAsync(pageId, userId);
            return Ok(sprint);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Acesso não autorizado ao obter sprint por página");
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter sprint por página");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Obtém todos os sprints de um workspace
    /// </summary>
    [HttpGet("workspace/{workspaceId}")]
    public async Task<ActionResult<List<SprintResponseDto>>> GetSprintsByWorkspace(Guid workspaceId)
    {
        try
        {
            var userId = GetUserId();
            var sprints = await _sprintService.GetSprintsByWorkspaceIdAsync(workspaceId, userId);
            return Ok(sprints);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Acesso não autorizado ao listar sprints");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao listar sprints");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Atualiza um sprint
    /// </summary>
    [HttpPut("{sprintId}")]
    public async Task<ActionResult<SprintResponseDto>> UpdateSprint(Guid sprintId, [FromBody] UpdateSprintDto dto)
    {
        try
        {
            var userId = GetUserId();
            var sprint = await _sprintService.UpdateSprintAsync(sprintId, dto, userId);
            return Ok(sprint);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Acesso não autorizado ao atualizar sprint");
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar sprint");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Deleta um sprint
    /// </summary>
    [HttpDelete("{sprintId}")]
    public async Task<IActionResult> DeleteSprint(Guid sprintId)
    {
        try
        {
            var userId = GetUserId();
            await _sprintService.DeleteSprintAsync(sprintId, userId);
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Acesso não autorizado ao deletar sprint");
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar sprint");
            return BadRequest(new { message = ex.Message });
        }
    }

    #endregion

    #region Sprint Task Endpoints

    /// <summary>
    /// Cria uma nova tarefa no sprint
    /// </summary>
    [HttpPost("{sprintId}/tasks")]
    public async Task<ActionResult<SprintTaskResponseDto>> CreateTask(Guid sprintId, [FromBody] CreateSprintTaskDto dto)
    {
        try
        {
            var userId = GetUserId();
            var task = await _sprintService.CreateTaskAsync(sprintId, dto, userId);
            return CreatedAtAction(nameof(GetTaskById), new { taskId = task.Id }, task);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Acesso não autorizado ao criar tarefa");
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar tarefa");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Obtém uma tarefa pelo ID
    /// </summary>
    [HttpGet("tasks/{taskId}")]
    public async Task<ActionResult<SprintTaskResponseDto>> GetTaskById(Guid taskId)
    {
        try
        {
            var userId = GetUserId();
            var task = await _sprintService.GetTaskByIdAsync(taskId, userId);
            return Ok(task);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Acesso não autorizado ao obter tarefa");
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter tarefa");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Obtém todas as tarefas de um sprint
    /// </summary>
    [HttpGet("{sprintId}/tasks")]
    public async Task<ActionResult<List<SprintTaskResponseDto>>> GetTasksBySprint(Guid sprintId)
    {
        try
        {
            var userId = GetUserId();
            var tasks = await _sprintService.GetTasksBySprintIdAsync(sprintId, userId);
            return Ok(tasks);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Acesso não autorizado ao listar tarefas");
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao listar tarefas");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Atualiza uma tarefa
    /// </summary>
    [HttpPatch("tasks/{taskId}")]
    public async Task<ActionResult<SprintTaskResponseDto>> UpdateTask(Guid taskId, [FromBody] UpdateSprintTaskDto dto)
    {
        try
        {
            var userId = GetUserId();
            var task = await _sprintService.UpdateTaskAsync(taskId, dto, userId);
            return Ok(task);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Acesso não autorizado ao atualizar tarefa");
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar tarefa");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Deleta uma tarefa
    /// </summary>
    [HttpDelete("tasks/{taskId}")]
    public async Task<IActionResult> DeleteTask(Guid taskId)
    {
        try
        {
            var userId = GetUserId();
            await _sprintService.DeleteTaskAsync(taskId, userId);
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Acesso não autorizado ao deletar tarefa");
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar tarefa");
            return BadRequest(new { message = ex.Message });
        }
    }

    #endregion

    #region Analytics Endpoints

    /// <summary>
    /// Obtém estatísticas de um sprint
    /// </summary>
    [HttpGet("{sprintId}/statistics")]
    public async Task<ActionResult<SprintStatisticsDto>> GetStatistics(Guid sprintId)
    {
        try
        {
            var userId = GetUserId();
            var stats = await _sprintService.GetStatisticsAsync(sprintId, userId);
            return Ok(stats);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Acesso não autorizado ao obter estatísticas");
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter estatísticas");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Obtém velocity de um workspace
    /// </summary>
    [HttpGet("workspace/{workspaceId}/velocity")]
    public async Task<ActionResult<SprintVelocityDto>> GetVelocity(Guid workspaceId)
    {
        try
        {
            var userId = GetUserId();
            var velocity = await _sprintService.GetVelocityAsync(workspaceId, userId);
            return Ok(velocity);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Acesso não autorizado ao obter velocity");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter velocity");
            return BadRequest(new { message = ex.Message });
        }
    }

    #endregion

    #region Export Endpoints

    /// <summary>
    /// Exporta um sprint em formato específico
    /// </summary>
    [HttpGet("{sprintId}/export/{format}")]
    public async Task<IActionResult> ExportSprint(Guid sprintId, string format)
    {
        try
        {
            var userId = GetUserId();
            var data = await _sprintService.ExportSprintAsync(sprintId, userId, format);

            var contentType = format.ToLower() switch
            {
                "json" => "application/json",
                "csv" => "text/csv",
                "md" => "text/markdown",
                _ => "application/octet-stream"
            };

            var fileName = $"sprint_{sprintId}_{DateTime.UtcNow:yyyyMMdd}.{format.ToLower()}";
            return File(data, contentType, fileName);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Acesso não autorizado ao exportar sprint");
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (NotSupportedException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao exportar sprint");
            return BadRequest(new { message = ex.Message });
        }
    }

    #endregion
}
