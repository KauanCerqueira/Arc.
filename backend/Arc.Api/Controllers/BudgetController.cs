using Arc.Application.DTOs.Templates;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BudgetController : ControllerBase
{
    private readonly IBudgetService _budgetService;
    private readonly ILogger<BudgetController> _logger;

    public BudgetController(IBudgetService budgetService, ILogger<BudgetController> logger)
    {
        _budgetService = budgetService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    [HttpGet("{pageId}")]
    public async Task<ActionResult<BudgetDataDto>> GetBudgetData(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var data = await _budgetService.GetAsync(pageId, userId);
            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter dados do budget");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{pageId}")]
    public async Task<ActionResult<BudgetItemDto>> AddItem(Guid pageId, [FromBody] BudgetItemDto item)
    {
        try
        {
            var userId = GetUserId();
            var created = await _budgetService.AddItemAsync(pageId, userId, item);
            return CreatedAtAction(nameof(GetBudgetData), new { pageId }, created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao adicionar item");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{pageId}/{itemId}")]
    public async Task<IActionResult> DeleteItem(Guid pageId, string itemId)
    {
        try
        {
            var userId = GetUserId();
            await _budgetService.DeleteItemAsync(pageId, userId, itemId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar item");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{pageId}/statistics")]
    public async Task<ActionResult<BudgetStatisticsDto>> GetStatistics(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var stats = await _budgetService.GetStatisticsAsync(pageId, userId);
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter estatísticas");
            return BadRequest(new { message = ex.Message });
        }
    }
}

