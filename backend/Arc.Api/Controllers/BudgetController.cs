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
public class BudgetController : ControllerBase
{
    private readonly IPageService _pageService;
    private readonly ILogger<BudgetController> _logger;

    public BudgetController(IPageService pageService, ILogger<BudgetController> logger)
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
    public async Task<ActionResult<BudgetDataDto>> GetBudgetData(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<BudgetDataDto>(jsonData) ?? new BudgetDataDto();

            // Recalcular totais
            data.TotalIncome = data.Items.Where(i => i.Type == "income").Sum(i => i.Amount);
            data.TotalExpense = data.Items.Where(i => i.Type == "expense").Sum(i => i.Amount);
            data.Balance = data.TotalIncome - data.TotalExpense;

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
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<BudgetDataDto>(jsonData) ?? new BudgetDataDto();

            item.Id = Guid.NewGuid().ToString();
            data.Items.Add(item);

            // Recalcular totais
            data.TotalIncome = data.Items.Where(i => i.Type == "income").Sum(i => i.Amount);
            data.TotalExpense = data.Items.Where(i => i.Type == "expense").Sum(i => i.Amount);
            data.Balance = data.TotalIncome - data.TotalExpense;

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return CreatedAtAction(nameof(GetBudgetData), new { pageId }, item);
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
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<BudgetDataDto>(jsonData) ?? new BudgetDataDto();

            var item = data.Items.FirstOrDefault(i => i.Id == itemId);
            if (item == null)
                return NotFound(new { message = "Item não encontrado" });

            data.Items.Remove(item);

            // Recalcular totais
            data.TotalIncome = data.Items.Where(i => i.Type == "income").Sum(i => i.Amount);
            data.TotalExpense = data.Items.Where(i => i.Type == "expense").Sum(i => i.Amount);
            data.Balance = data.TotalIncome - data.TotalExpense;

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar item");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{pageId}/statistics")]
    public async Task<ActionResult<object>> GetStatistics(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<BudgetDataDto>(jsonData) ?? new BudgetDataDto();

            var totalIncome = data.Items.Where(i => i.Type == "income").Sum(i => i.Amount);
            var totalExpense = data.Items.Where(i => i.Type == "expense").Sum(i => i.Amount);

            var stats = new
            {
                TotalIncome = totalIncome,
                TotalExpense = totalExpense,
                Balance = totalIncome - totalExpense,
                ItemCount = data.Items.Count
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
