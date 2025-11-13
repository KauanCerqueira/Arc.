using Arc.Application.DTOs.PersonalBudget;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers.Budget;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PersonalBudgetController : ControllerBase
{
    private readonly IPersonalBudgetService _personalBudgetService;
    private readonly ILogger<PersonalBudgetController> _logger;

    public PersonalBudgetController(IPersonalBudgetService personalBudgetService, ILogger<PersonalBudgetController> logger)
    {
        _personalBudgetService = personalBudgetService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    [HttpGet("{pageId}")]
    public async Task<ActionResult<PersonalBudgetDataDto>> GetBudget(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var data = await _personalBudgetService.GetAsync(pageId, userId);
            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter orçamento pessoal");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{pageId}")]
    public async Task<ActionResult<PersonalTransactionDto>> AddTransaction(Guid pageId, [FromBody] PersonalTransactionDto tx)
    {
        try
        {
            var userId = GetUserId();
            var created = await _personalBudgetService.AddAsync(pageId, userId, tx);
            return CreatedAtAction(nameof(GetBudget), new { pageId }, created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao adicionar transação");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{pageId}/{txId}")]
    public async Task<ActionResult<PersonalTransactionDto>> UpdateTransaction(Guid pageId, string txId, [FromBody] PersonalTransactionDto updated)
    {
        try
        {
            var userId = GetUserId();
            var tx = await _personalBudgetService.UpdateAsync(pageId, userId, txId, updated);
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
            await _personalBudgetService.DeleteAsync(pageId, userId, txId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar transação");
            return BadRequest(new { message = ex.Message });
        }
    }
}

