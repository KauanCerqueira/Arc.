using Arc.Application.DTOs.Templates;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITasksService _tasksService;
    private readonly ILogger<TasksController> _logger;

    public TasksController(ITasksService tasksService, ILogger<TasksController> logger)
    {
        _tasksService = tasksService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    /// <summary>
    /// Obtém todos os dados de tarefas
    /// </summary>
    [HttpGet("{pageId}")]
    public async Task<ActionResult<TasksDataDto>> GetTasksData(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var data = await _tasksService.GetAsync(pageId, userId);
            return Ok(data);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter dados de tarefas");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Adiciona uma nova tarefa
    /// </summary>
    [HttpPost("{pageId}")]
    public async Task<ActionResult<TaskItemDto>> AddTask(Guid pageId, [FromBody] TaskItemDto task)
    {
        try
        {
            var userId = GetUserId();
            var created = await _tasksService.AddAsync(pageId, userId, task);
            return CreatedAtAction(nameof(GetTasksData), new { pageId }, created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao adicionar tarefa");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Atualiza uma tarefa
    /// </summary>
    [HttpPut("{pageId}/{taskId}")]
    public async Task<ActionResult<TaskItemDto>> UpdateTask(Guid pageId, string taskId, [FromBody] TaskItemDto updatedTask)
    {
        try
        {
            var userId = GetUserId();
            var task = await _tasksService.UpdateAsync(pageId, userId, taskId, updatedTask);
            return Ok(task);
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
    /// Marca uma tarefa como completa/incompleta
    /// </summary>
    [HttpPatch("{pageId}/{taskId}/toggle")]
    public async Task<IActionResult> ToggleTask(Guid pageId, string taskId)
    {
        try
        {
            var userId = GetUserId();
            await _tasksService.ToggleAsync(pageId, userId, taskId);
            return Ok(new { message = "Tarefa atualizada" });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao alternar tarefa");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Deleta uma tarefa
    /// </summary>
    [HttpDelete("{pageId}/{taskId}")]
    public async Task<IActionResult> DeleteTask(Guid pageId, string taskId)
    {
        try
        {
            var userId = GetUserId();
            await _tasksService.DeleteAsync(pageId, userId, taskId);
            return NoContent();
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

    /// <summary>
    /// Obtém estatísticas de tarefas
    /// </summary>
    [HttpGet("{pageId}/statistics")]
    public async Task<ActionResult<TasksStatisticsDto>> GetStatistics(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var stats = await _tasksService.GetStatisticsAsync(pageId, userId);
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter estatísticas");
            return BadRequest(new { message = ex.Message });
        }
    }
}

