using Arc.Application.DTOs;
using Arc.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubscriptionController : ControllerBase
{
    private readonly ISubscriptionService _subscriptionService;
    private readonly ILogger<SubscriptionController> _logger;

    public SubscriptionController(
        ISubscriptionService subscriptionService,
        ILogger<SubscriptionController> logger)
    {
        _subscriptionService = subscriptionService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Usuário não autenticado");
        }
        return userId;
    }

    /// <summary>
    /// Obtém a assinatura do usuário atual
    /// </summary>
    /// <returns>Dados da assinatura</returns>
    /// <response code="200">Assinatura encontrada</response>
    /// <response code="401">Não autenticado</response>
    [HttpGet]
    [ProducesResponseType(typeof(SubscriptionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<SubscriptionDto>> GetSubscription()
    {
        try
        {
            var userId = GetUserId();
            _logger.LogInformation("Obtendo assinatura para usuário: {UserId}", userId);

            var subscription = await _subscriptionService.GetUserSubscriptionAsync(userId);
            return Ok(subscription);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Tentativa de acesso não autorizado");
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter assinatura");
            return StatusCode(500, new { message = "Erro ao obter assinatura" });
        }
    }

    /// <summary>
    /// Cria uma nova assinatura para o usuário
    /// </summary>
    /// <param name="dto">Dados da assinatura</param>
    /// <returns>Assinatura criada</returns>
    /// <response code="201">Assinatura criada com sucesso</response>
    /// <response code="400">Dados inválidos ou usuário já possui assinatura</response>
    /// <response code="401">Não autenticado</response>
    [HttpPost]
    [ProducesResponseType(typeof(SubscriptionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<SubscriptionDto>> CreateSubscription([FromBody] CreateSubscriptionDto dto)
    {
        try
        {
            var userId = GetUserId();
            _logger.LogInformation("Criando assinatura {PlanType} para usuário: {UserId}", dto.PlanType, userId);

            var subscription = await _subscriptionService.CreateSubscriptionAsync(userId, dto);
            _logger.LogInformation("Assinatura criada com sucesso. ID: {SubscriptionId}", subscription.Id);

            return CreatedAtAction(nameof(GetSubscription), new { id = subscription.Id }, subscription);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Tentativa de acesso não autorizado");
            return Unauthorized(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Operação inválida ao criar assinatura");
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Argumentos inválidos ao criar assinatura");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar assinatura");
            return StatusCode(500, new { message = "Erro ao criar assinatura" });
        }
    }

    /// <summary>
    /// Atualiza a assinatura do usuário
    /// </summary>
    /// <param name="dto">Dados para atualização</param>
    /// <returns>Assinatura atualizada</returns>
    /// <response code="200">Assinatura atualizada com sucesso</response>
    /// <response code="400">Dados inválidos</response>
    /// <response code="401">Não autenticado</response>
    /// <response code="404">Assinatura não encontrada</response>
    [HttpPut]
    [ProducesResponseType(typeof(SubscriptionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SubscriptionDto>> UpdateSubscription([FromBody] UpdateSubscriptionDto dto)
    {
        try
        {
            var userId = GetUserId();
            _logger.LogInformation("Atualizando assinatura para usuário: {UserId}", userId);

            var subscription = await _subscriptionService.UpdateSubscriptionAsync(userId, dto);
            _logger.LogInformation("Assinatura atualizada com sucesso. ID: {SubscriptionId}", subscription.Id);

            return Ok(subscription);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Tentativa de acesso não autorizado");
            return Unauthorized(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Assinatura não encontrada");
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar assinatura");
            return StatusCode(500, new { message = "Erro ao atualizar assinatura" });
        }
    }

    /// <summary>
    /// Cancela a assinatura do usuário
    /// </summary>
    /// <param name="immediate">Se true, cancela imediatamente. Se false, cancela no fim do período</param>
    /// <returns>Resultado do cancelamento</returns>
    /// <response code="200">Assinatura cancelada com sucesso</response>
    /// <response code="401">Não autenticado</response>
    /// <response code="404">Assinatura não encontrada</response>
    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> CancelSubscription([FromQuery] bool immediate = false)
    {
        try
        {
            var userId = GetUserId();
            _logger.LogInformation("Cancelando assinatura para usuário: {UserId} (imediato: {Immediate})", userId, immediate);

            var result = await _subscriptionService.CancelSubscriptionAsync(userId, immediate);
            if (!result)
            {
                return NotFound(new { message = "Assinatura não encontrada" });
            }

            _logger.LogInformation("Assinatura cancelada com sucesso para usuário: {UserId}", userId);
            return Ok(new { message = immediate ? "Assinatura cancelada imediatamente" : "Assinatura será cancelada no fim do período" });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Tentativa de acesso não autorizado");
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao cancelar assinatura");
            return StatusCode(500, new { message = "Erro ao cancelar assinatura" });
        }
    }

    /// <summary>
    /// Obtém o uso atual da assinatura do usuário
    /// </summary>
    /// <returns>Dados de uso</returns>
    /// <response code="200">Uso obtido com sucesso</response>
    /// <response code="401">Não autenticado</response>
    [HttpGet("usage")]
    [ProducesResponseType(typeof(SubscriptionUsageDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<SubscriptionUsageDto>> GetUsage()
    {
        try
        {
            var userId = GetUserId();
            _logger.LogInformation("Obtendo uso de assinatura para usuário: {UserId}", userId);

            var usage = await _subscriptionService.GetSubscriptionUsageAsync(userId);
            return Ok(usage);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Tentativa de acesso não autorizado");
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter uso de assinatura");
            return StatusCode(500, new { message = "Erro ao obter uso de assinatura" });
        }
    }

    /// <summary>
    /// Verifica se o usuário pode realizar uma ação específica
    /// </summary>
    /// <param name="action">Nome da ação (advanced_analytics, custom_branding, etc.)</param>
    /// <returns>True se pode realizar a ação</returns>
    /// <response code="200">Verificação realizada</response>
    /// <response code="401">Não autenticado</response>
    [HttpGet("can-perform/{action}")]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<bool>> CanPerformAction(string action)
    {
        try
        {
            var userId = GetUserId();
            _logger.LogInformation("Verificando permissão de '{Action}' para usuário: {UserId}", action, userId);

            var canPerform = await _subscriptionService.CanPerformActionAsync(userId, action);
            return Ok(canPerform);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Tentativa de acesso não autorizado");
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao verificar permissão");
            return StatusCode(500, new { message = "Erro ao verificar permissão" });
        }
    }

    /// <summary>
    /// Obtém os limites do plano do usuário
    /// </summary>
    /// <returns>Limites do plano</returns>
    /// <response code="200">Limites obtidos com sucesso</response>
    /// <response code="401">Não autenticado</response>
    [HttpGet("limits")]
    [ProducesResponseType(typeof(PlanLimitsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<PlanLimitsDto>> GetLimits()
    {
        try
        {
            var userId = GetUserId();
            _logger.LogInformation("Obtendo limites do plano para usuário: {UserId}", userId);

            var limits = await _subscriptionService.GetPlanLimitsAsync(userId);
            return Ok(limits);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Tentativa de acesso não autorizado");
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter limites do plano");
            return StatusCode(500, new { message = "Erro ao obter limites do plano" });
        }
    }
}
