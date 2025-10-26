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
public class TasksController : ControllerBase
{
    private readonly IPageService _pageService;
    private readonly ILogger<TasksController> _logger;

    public TasksController(IPageService pageService, ILogger<TasksController> logger)
    {
        _pageService = pageService;
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
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<TasksDataDto>(jsonData) ?? new TasksDataDto();

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
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<TasksDataDto>(jsonData) ?? new TasksDataDto();

            task.Id = Guid.NewGuid().ToString();
            task.CreatedAt = DateTime.UtcNow;
            data.Tasks.Add(task);

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return CreatedAtAction(nameof(GetTasksData), new { pageId }, task);
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
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<TasksDataDto>(jsonData) ?? new TasksDataDto();

            var task = data.Tasks.FirstOrDefault(t => t.Id == taskId);
            if (task == null)
                return NotFound(new { message = "Tarefa não encontrada" });

            task.Text = updatedTask.Text;
            task.Priority = updatedTask.Priority;
            task.Category = updatedTask.Category;
            task.Completed = updatedTask.Completed;
            if (updatedTask.Completed && task.CompletedAt == null)
                task.CompletedAt = DateTime.UtcNow;

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return Ok(task);
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
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<TasksDataDto>(jsonData) ?? new TasksDataDto();

            var task = data.Tasks.FirstOrDefault(t => t.Id == taskId);
            if (task == null)
                return NotFound(new { message = "Tarefa não encontrada" });

            task.Completed = !task.Completed;
            task.CompletedAt = task.Completed ? DateTime.UtcNow : null;

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return Ok(new { message = "Tarefa atualizada" });
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
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<TasksDataDto>(jsonData) ?? new TasksDataDto();

            var task = data.Tasks.FirstOrDefault(t => t.Id == taskId);
            if (task == null)
                return NotFound(new { message = "Tarefa não encontrada" });

            data.Tasks.Remove(task);

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return NoContent();
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
    public async Task<ActionResult<object>> GetStatistics(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<TasksDataDto>(jsonData) ?? new TasksDataDto();

            var stats = new
            {
                Total = data.Tasks.Count,
                Completed = data.Tasks.Count(t => t.Completed),
                Pending = data.Tasks.Count(t => !t.Completed),
                CompletionRate = data.Tasks.Count > 0
                    ? Math.Round((double)data.Tasks.Count(t => t.Completed) / data.Tasks.Count * 100, 2)
                    : 0
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
