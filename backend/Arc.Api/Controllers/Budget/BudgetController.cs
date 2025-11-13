using Arc.Application.DTOs.Budget;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers.Budget;

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
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }
        return Guid.Parse(userIdClaim);
    }

    /// <summary>
    /// Create a new budget
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<BudgetResponseDto>> CreateBudget([FromBody] CreateBudgetDto dto)
    {
        try
        {
            var userId = GetUserId();
            var budget = await _budgetService.CreateBudgetAsync(dto, userId);
            return CreatedAtAction(nameof(GetBudget), new { id = budget.Id }, budget);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating budget");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get budget by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<BudgetResponseDto>> GetBudget(Guid id)
    {
        try
        {
            var userId = GetUserId();
            var budget = await _budgetService.GetBudgetByIdAsync(id, userId);
            return Ok(budget);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Budget not found: {BudgetId}", id);
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting budget {BudgetId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get all budgets for a workspace
    /// </summary>
    [HttpGet("workspace/{workspaceId}")]
    public async Task<ActionResult<List<BudgetResponseDto>>> GetWorkspaceBudgets(Guid workspaceId)
    {
        try
        {
            var userId = GetUserId();
            var budgets = await _budgetService.GetBudgetsByWorkspaceAsync(workspaceId, userId);
            return Ok(budgets);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting workspace budgets");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get all budgets for a page
    /// </summary>
    [HttpGet("page/{pageId}")]
    public async Task<ActionResult<List<BudgetResponseDto>>> GetPageBudgets(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var budgets = await _budgetService.GetBudgetsByPageAsync(pageId, userId);
            return Ok(budgets);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting page budgets");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing budget
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<BudgetResponseDto>> UpdateBudget(Guid id, [FromBody] UpdateBudgetDto dto)
    {
        try
        {
            var userId = GetUserId();
            var budget = await _budgetService.UpdateBudgetAsync(id, dto, userId);
            return Ok(budget);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Budget not found: {BudgetId}", id);
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating budget {BudgetId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete a budget (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBudget(Guid id)
    {
        try
        {
            var userId = GetUserId();
            await _budgetService.DeleteBudgetAsync(id, userId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Budget not found: {BudgetId}", id);
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting budget {BudgetId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Send budget to client
    /// </summary>
    [HttpPost("{id}/send")]
    public async Task<ActionResult<BudgetResponseDto>> SendBudget(Guid id)
    {
        try
        {
            var userId = GetUserId();
            var budget = await _budgetService.SendBudgetAsync(id, userId);
            return Ok(budget);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Budget not found: {BudgetId}", id);
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending budget {BudgetId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Approve budget
    /// </summary>
    [HttpPost("{id}/approve")]
    public async Task<ActionResult<BudgetResponseDto>> ApproveBudget(Guid id)
    {
        try
        {
            var userId = GetUserId();
            var budget = await _budgetService.ApproveBudgetAsync(id, userId);
            return Ok(budget);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Budget not found: {BudgetId}", id);
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving budget {BudgetId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Reject budget
    /// </summary>
    [HttpPost("{id}/reject")]
    public async Task<ActionResult<BudgetResponseDto>> RejectBudget(Guid id)
    {
        try
        {
            var userId = GetUserId();
            var budget = await _budgetService.RejectBudgetAsync(id, userId);
            return Ok(budget);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Budget not found: {BudgetId}", id);
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting budget {BudgetId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Quick calculation for budget estimation
    /// </summary>
    [HttpPost("quick-calculate")]
    public async Task<ActionResult<QuickCalculationResultDto>> QuickCalculate([FromBody] QuickCalculationDto dto)
    {
        try
        {
            var result = await _budgetService.QuickCalculateAsync(dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in quick calculation");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Recalculate budget totals
    /// </summary>
    [HttpPost("{id}/recalculate")]
    public async Task<ActionResult<BudgetResponseDto>> RecalculateBudget(Guid id)
    {
        try
        {
            var userId = GetUserId();
            var budget = await _budgetService.RecalculateBudgetAsync(id, userId);
            return Ok(budget);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Budget not found: {BudgetId}", id);
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error recalculating budget {BudgetId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get available budget templates
    /// </summary>
    [HttpGet("templates")]
    public async Task<ActionResult<List<BudgetTemplateDto>>> GetTemplates()
    {
        try
        {
            var templates = await _budgetService.GetTemplatesAsync();
            return Ok(templates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting templates");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Create budget from template
    /// </summary>
    [HttpPost("from-template")]
    public async Task<ActionResult<BudgetResponseDto>> CreateFromTemplate(
        [FromQuery] string templateName,
        [FromQuery] Guid workspaceId,
        [FromQuery] Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var budget = await _budgetService.CreateFromTemplateAsync(templateName, workspaceId, pageId, userId);
            return CreatedAtAction(nameof(GetBudget), new { id = budget.Id }, budget);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Template not found: {TemplateName}", templateName);
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating budget from template");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Generate PDF for budget
    /// </summary>
    [HttpPost("{id}/generate-pdf")]
    public async Task<ActionResult> GeneratePdf(Guid id, [FromBody] GeneratePdfDto? dto)
    {
        try
        {
            var userId = GetUserId();
            // Fallback para opcoes default caso nao venha no body
            dto ??= new GeneratePdfDto
            {
                IncludeLogo = true,
                IncludeItemDetails = true,
                IncludePhases = true,
                IncludeTerms = true,
                IncludePaymentSchedule = true,
                IncludeTaxBreakdown = true,
                Language = "pt-BR",
                ColorScheme = "professional",
                CompanyName = "Arc."
            };
            var pdfBytes = await _budgetService.GeneratePdfAsync(id, dto, userId);
            return File(pdfBytes, "application/pdf", $"budget-{id}.pdf");
        }
        catch (NotImplementedException)
        {
            return StatusCode(501, new { message = "PDF generation not implemented yet" });
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Budget not found: {BudgetId}", id);
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating PDF for budget {BudgetId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get budget analytics for workspace
    /// </summary>
    [HttpGet("analytics/{workspaceId}")]
    public async Task<ActionResult<Dictionary<string, object>>> GetAnalytics(Guid workspaceId)
    {
        try
        {
            var userId = GetUserId();
            var analytics = await _budgetService.GetBudgetAnalyticsAsync(workspaceId, userId);
            return Ok(analytics);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting budget analytics");
            return BadRequest(new { message = ex.Message });
        }
    }
}
