using Arc.Application.DTOs.GitHub;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers.Integrations;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GitHubIntegrationController : ControllerBase
{
    private readonly IGitHubIntegrationService _gitHubService;
    private readonly ILogger<GitHubIntegrationController> _logger;

    public GitHubIntegrationController(
        IGitHubIntegrationService gitHubService,
        ILogger<GitHubIntegrationController> logger)
    {
        _gitHubService = gitHubService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : throw new UnauthorizedAccessException();
    }

    #region Configuration

    /// <summary>
    /// Configura a integração com GitHub
    /// </summary>
    [HttpPost("configure")]
    [ProducesResponseType(typeof(GitHubIntegrationConfigDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<GitHubIntegrationConfigDto>> ConfigureIntegration(
        [FromBody] GitHubIntegrationConfigDto config)
    {
        var userId = GetUserId();
        config.UserId = userId;

        _logger.LogInformation("Configurando integração GitHub para usuário {UserId}", userId);

        try
        {
            var result = await _gitHubService.ConfigureIntegrationAsync(config);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao configurar integração GitHub");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Retorna a configuração atual da integração
    /// </summary>
    [HttpGet("config")]
    [ProducesResponseType(typeof(GitHubIntegrationConfigDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GitHubIntegrationConfigDto>> GetConfig()
    {
        var userId = GetUserId();
        var config = await _gitHubService.GetIntegrationConfigAsync(userId);

        if (config == null)
        {
            return NotFound(new { message = "Integração não configurada" });
        }

        return Ok(config);
    }

    /// <summary>
    /// Desabilita a integração com GitHub
    /// </summary>
    [HttpDelete("disable")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> DisableIntegration()
    {
        var userId = GetUserId();
        await _gitHubService.DisableIntegrationAsync(userId);

        return Ok(new { message = "Integração desabilitada com sucesso" });
    }

    #endregion

    #region Repositories

    /// <summary>
    /// Lista todos os repositórios do usuário
    /// </summary>
    [HttpGet("repositories")]
    [ProducesResponseType(typeof(List<GitHubRepositoryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<GitHubRepositoryDto>>> GetRepositories()
    {
        var userId = GetUserId();
        var repositories = await _gitHubService.GetUserRepositoriesAsync(userId);
        return Ok(repositories);
    }

    #endregion

    #region Sync

    /// <summary>
    /// Sincroniza dados com GitHub
    /// </summary>
    [HttpPost("sync")]
    [ProducesResponseType(typeof(GitHubSyncStatusDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<GitHubSyncStatusDto>> Sync()
    {
        var userId = GetUserId();
        _logger.LogInformation("Iniciando sincronização manual GitHub para usuário {UserId}", userId);

        var status = await _gitHubService.SyncWithGitHubAsync(userId);
        return Ok(status);
    }

    /// <summary>
    /// Retorna o status da sincronização
    /// </summary>
    [HttpGet("sync/status")]
    [ProducesResponseType(typeof(GitHubSyncStatusDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<GitHubSyncStatusDto>> GetSyncStatus()
    {
        var userId = GetUserId();
        var status = await _gitHubService.GetSyncStatusAsync(userId);
        return Ok(status);
    }

    /// <summary>
    /// Webhook para receber notificações do GitHub
    /// </summary>
    [HttpPost("webhook")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> HandleWebhook([FromBody] GitHubWebhookDto webhook)
    {
        _logger.LogInformation("Webhook recebido do GitHub");

        await _gitHubService.HandleGitHubWebhookAsync(webhook);

        return Ok();
    }

    #endregion
}
