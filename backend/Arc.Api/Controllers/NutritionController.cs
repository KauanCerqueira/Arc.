using Arc.Application.DTOs.Nutrition;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NutritionController : ControllerBase
{
    private readonly INutritionService _nutritionService;
    private readonly ILogger<NutritionController> _logger;

    public NutritionController(INutritionService nutritionService, ILogger<NutritionController> logger)
    {
        _nutritionService = nutritionService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    [HttpGet("{pageId}")]
    public async Task<ActionResult<NutritionDataDto>> GetMeals(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var data = await _nutritionService.GetAsync(pageId, userId);
            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter refeições");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{pageId}")]
    public async Task<ActionResult<MealEntryDto>> AddMeal(Guid pageId, [FromBody] MealEntryDto entry)
    {
        try
        {
            var userId = GetUserId();
            var created = await _nutritionService.AddAsync(pageId, userId, entry);
            return CreatedAtAction(nameof(GetMeals), new { pageId }, created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao adicionar refeição");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{pageId}/{entryId}")]
    public async Task<ActionResult<MealEntryDto>> UpdateMeal(Guid pageId, string entryId, [FromBody] MealEntryDto updated)
    {
        try
        {
            var userId = GetUserId();
            var entry = await _nutritionService.UpdateAsync(pageId, userId, entryId, updated);
            return Ok(entry);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar refeição");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{pageId}/{entryId}")]
    public async Task<IActionResult> DeleteMeal(Guid pageId, string entryId)
    {
        try
        {
            var userId = GetUserId();
            await _nutritionService.DeleteAsync(pageId, userId, entryId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar refeição");
            return BadRequest(new { message = ex.Message });
        }
    }
}

