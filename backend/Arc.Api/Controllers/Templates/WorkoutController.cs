using Arc.Application.DTOs.Workout;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers.Templates;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WorkoutController : ControllerBase
{
    private readonly IWorkoutService _workoutService;
    private readonly ILogger<WorkoutController> _logger;

    public WorkoutController(IWorkoutService workoutService, ILogger<WorkoutController> logger)
    {
        _workoutService = workoutService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    [HttpGet("{pageId}")]
    public async Task<ActionResult<WorkoutDataDto>> GetWorkouts(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var data = await _workoutService.GetAsync(pageId, userId);
            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter workouts");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{pageId}")]
    public async Task<ActionResult<WorkoutEntryDto>> AddEntry(Guid pageId, [FromBody] WorkoutEntryDto entry)
    {
        try
        {
            var userId = GetUserId();
            var created = await _workoutService.AddAsync(pageId, userId, entry);
            return CreatedAtAction(nameof(GetWorkouts), new { pageId }, created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao adicionar entrada");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{pageId}/{entryId}")]
    public async Task<ActionResult<WorkoutEntryDto>> UpdateEntry(Guid pageId, string entryId, [FromBody] WorkoutEntryDto updated)
    {
        try
        {
            var userId = GetUserId();
            var entry = await _workoutService.UpdateAsync(pageId, userId, entryId, updated);
            return Ok(entry);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar entrada");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{pageId}/{entryId}")]
    public async Task<IActionResult> DeleteEntry(Guid pageId, string entryId)
    {
        try
        {
            var userId = GetUserId();
            await _workoutService.DeleteAsync(pageId, userId, entryId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar entrada");
            return BadRequest(new { message = ex.Message });
        }
    }
}

