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
public class SprintController : ControllerBase
{
    private readonly IPageService _pageService;
    private readonly ILogger<SprintController> _logger;

    public SprintController(IPageService pageService, ILogger<SprintController> logger)
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
    public async Task<ActionResult<SprintDataDto>> GetSprintData(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<SprintDataDto>(jsonData) ?? new SprintDataDto();

            // Recalcular pontos
            data.TotalPoints = data.Tasks.Sum(t => t.Points);
            data.CompletedPoints = data.Tasks.Where(t => t.Status == "done").Sum(t => t.Points);

            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter dados do sprint");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{pageId}/tasks")]
    public async Task<ActionResult<SprintTaskDto>> AddTask(Guid pageId, [FromBody] SprintTaskDto task)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<SprintDataDto>(jsonData) ?? new SprintDataDto();

            task.Id = Guid.NewGuid().ToString();
            data.Tasks.Add(task);

            data.TotalPoints = data.Tasks.Sum(t => t.Points);
            data.CompletedPoints = data.Tasks.Where(t => t.Status == "done").Sum(t => t.Points);

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return CreatedAtAction(nameof(GetSprintData), new { pageId }, task);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao adicionar tarefa");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{pageId}/tasks/{taskId}")]
    public async Task<ActionResult<SprintTaskDto>> UpdateTask(Guid pageId, string taskId, [FromBody] SprintTaskDto updatedTask)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<SprintDataDto>(jsonData) ?? new SprintDataDto();

            var task = data.Tasks.FirstOrDefault(t => t.Id == taskId);
            if (task == null)
                return NotFound(new { message = "Tarefa não encontrada" });

            task.Title = updatedTask.Title;
            task.Description = updatedTask.Description;
            task.Status = updatedTask.Status;
            task.Points = updatedTask.Points;
            task.AssignedTo = updatedTask.AssignedTo;

            data.TotalPoints = data.Tasks.Sum(t => t.Points);
            data.CompletedPoints = data.Tasks.Where(t => t.Status == "done").Sum(t => t.Points);

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

    [HttpPut("{pageId}/info")]
    public async Task<IActionResult> UpdateSprintInfo(Guid pageId, [FromBody] UpdateSprintInfoDto info)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<SprintDataDto>(jsonData) ?? new SprintDataDto();

            data.SprintName = info.SprintName;
            data.StartDate = info.StartDate;
            data.EndDate = info.EndDate;

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return Ok(new { message = "Informações do sprint atualizadas" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar sprint");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{pageId}/tasks/{taskId}")]
    public async Task<IActionResult> DeleteTask(Guid pageId, string taskId)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<SprintDataDto>(jsonData) ?? new SprintDataDto();

            var task = data.Tasks.FirstOrDefault(t => t.Id == taskId);
            if (task == null)
                return NotFound(new { message = "Tarefa não encontrada" });

            data.Tasks.Remove(task);

            data.TotalPoints = data.Tasks.Sum(t => t.Points);
            data.CompletedPoints = data.Tasks.Where(t => t.Status == "done").Sum(t => t.Points);

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
}

public class UpdateSprintInfoDto
{
    public string? SprintName { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
