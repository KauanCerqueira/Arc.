using Arc.Application.DTOs.Automation;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers.Automation;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AutomationController : ControllerBase
{
    private readonly IAutomationService _automationService;
    private readonly ILogger<AutomationController> _logger;

    public AutomationController(
        IAutomationService automationService,
        ILogger<AutomationController> logger)
    {
        _automationService = automationService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : throw new UnauthorizedAccessException();
    }

    #region Automation Management

    /// <summary>
    /// Lista todas as automações disponíveis (catálogo)
    /// </summary>
    [HttpGet("available")]
    [ProducesResponseType(typeof(List<AutomationDefinitionDto>), StatusCodes.Status200OK)]
    public ActionResult<List<AutomationDefinitionDto>> GetAvailableAutomations()
    {
        var userId = GetUserId();
        _logger.LogInformation("Buscando automações disponíveis para usuário {UserId}", userId);

        var automations = _automationService.GetAvailableAutomations(userId);
        return Ok(automations);
    }

    /// <summary>
    /// Lista as automações configuradas do usuário
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<AutomationDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<AutomationDto>>> GetUserAutomations([FromQuery] Guid? workspaceId = null)
    {
        var userId = GetUserId();
        _logger.LogInformation("Buscando automações do usuário {UserId}", userId);

        var automations = await _automationService.GetUserAutomationsAsync(userId, workspaceId);
        return Ok(automations);
    }

    /// <summary>
    /// Retorna uma automação específica
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(AutomationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AutomationDto>> GetAutomation(Guid id)
    {
        var userId = GetUserId();
        var automation = await _automationService.GetAutomationAsync(userId, id);

        if (automation == null)
        {
            return NotFound(new { message = "Automação não encontrada" });
        }

        return Ok(automation);
    }

    /// <summary>
    /// Cria uma nova automação
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(AutomationDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AutomationDto>> CreateAutomation(
        [FromBody] CreateAutomationDto createDto)
    {
        var userId = GetUserId();
        createDto.UserId = userId;

        _logger.LogInformation("Criando automação {Type} para usuário {UserId}",
            createDto.AutomationType, userId);

        try
        {
            var automation = await _automationService.CreateAutomationAsync(createDto);
            return CreatedAtAction(nameof(GetAutomation), new { id = automation.Id }, automation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar automação");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Atualiza uma automação existente
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(AutomationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AutomationDto>> UpdateAutomation(
        Guid id,
        [FromBody] UpdateAutomationDto updateDto)
    {
        var userId = GetUserId();
        _logger.LogInformation("Atualizando automação {Id} para usuário {UserId}", id, userId);

        try
        {
            var automation = await _automationService.UpdateAutomationAsync(userId, id, updateDto);

            if (automation == null)
            {
                return NotFound(new { message = "Automação não encontrada" });
            }

            return Ok(automation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar automação");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Deleta uma automação
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAutomation(Guid id)
    {
        var userId = GetUserId();
        _logger.LogInformation("Deletando automação {Id} para usuário {UserId}", id, userId);

        var success = await _automationService.DeleteAutomationAsync(userId, id);

        if (!success)
        {
            return NotFound(new { message = "Automação não encontrada" });
        }

        return NoContent();
    }

    /// <summary>
    /// Ativa ou desativa uma automação
    /// </summary>
    [HttpPatch("{id}/toggle")]
    [ProducesResponseType(typeof(AutomationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AutomationDto>> ToggleAutomation(Guid id, [FromBody] bool isEnabled)
    {
        var userId = GetUserId();
        _logger.LogInformation("Alternando automação {Id} para {Status}", id, isEnabled ? "ativada" : "desativada");

        try
        {
            var automation = await _automationService.ToggleAutomationAsync(userId, id, isEnabled);

            if (automation == null)
            {
                return NotFound(new { message = "Automação não encontrada" });
            }

            return Ok(automation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao alternar automação");
            return BadRequest(new { message = ex.Message });
        }
    }

    #endregion

    #region Execution

    /// <summary>
    /// Executa uma automação manualmente
    /// </summary>
    [HttpPost("{id}/run")]
    [ProducesResponseType(typeof(AutomationRunResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AutomationRunResultDto>> RunAutomation(
        Guid id,
        [FromQuery] bool dryRun = false)
    {
        var userId = GetUserId();
        _logger.LogInformation("Executando automação {Id} manualmente (dryRun: {DryRun})", id, dryRun);

        try
        {
            var result = await _automationService.RunAutomationAsync(userId, id, dryRun);

            if (result == null)
            {
                return NotFound(new { message = "Automação não encontrada" });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao executar automação");
            return BadRequest(new { message = ex.Message });
        }
    }

    #endregion

    #region Statistics

    /// <summary>
    /// Retorna estatísticas das automações do usuário
    /// </summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(AutomationStatsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<AutomationStatsDto>> GetStatistics([FromQuery] Guid? workspaceId = null)
    {
        var userId = GetUserId();
        _logger.LogInformation("Buscando estatísticas de automações para usuário {UserId}", userId);

        var stats = await _automationService.GetStatisticsAsync(userId, workspaceId);
        return Ok(stats);
    }

    #endregion
}
