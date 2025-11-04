using Arc.Application.DTOs.BusinessBudget;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BusinessBudgetController : ControllerBase
{
    private readonly IBusinessBudgetService _businessBudgetService;
    private readonly ILogger<BusinessBudgetController> _logger;

    public BusinessBudgetController(IBusinessBudgetService businessBudgetService, ILogger<BusinessBudgetController> logger)
    {
        _businessBudgetService = businessBudgetService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    [HttpGet("{pageId}")]
    public async Task<ActionResult<BusinessBudgetDataDto>> GetBudget(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var data = await _businessBudgetService.GetAsync(pageId, userId);
            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter orçamento empresarial");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{pageId}")]
    public async Task<ActionResult<BusinessTransactionDto>> AddTransaction(Guid pageId, [FromBody] BusinessTransactionDto tx)
    {
        try
        {
            var userId = GetUserId();
            var created = await _businessBudgetService.AddAsync(pageId, userId, tx);
            return CreatedAtAction(nameof(GetBudget), new { pageId }, created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao adicionar transação");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{pageId}/{txId}")]
    public async Task<ActionResult<BusinessTransactionDto>> UpdateTransaction(Guid pageId, string txId, [FromBody] BusinessTransactionDto updated)
    {
        try
        {
            var userId = GetUserId();
            var tx = await _businessBudgetService.UpdateAsync(pageId, userId, txId, updated);
            return Ok(tx);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar transação");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{pageId}/{txId}")]
    public async Task<IActionResult> DeleteTransaction(Guid pageId, string txId)
    {
        try
        {
            var userId = GetUserId();
            await _businessBudgetService.DeleteAsync(pageId, userId, txId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar transação");
            return BadRequest(new { message = ex.Message });
        }
    }
}

