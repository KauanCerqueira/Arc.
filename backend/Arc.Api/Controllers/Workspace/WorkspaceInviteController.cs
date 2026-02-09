using Arc.Application.DTOs.Workspace;
using Arc.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers.Workspace;

[ApiController]
[Route("api")]
public class WorkspaceInviteController : ControllerBase
{
    private readonly WorkspaceInviteService _inviteService;
    private readonly ILogger<WorkspaceInviteController> _logger;

    public WorkspaceInviteController(
        WorkspaceInviteService inviteService,
        ILogger<WorkspaceInviteController> logger)
    {
        _inviteService = inviteService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            throw new UnauthorizedAccessException("User ID not found in token");
        return Guid.Parse(userIdClaim);
    }

    // ============================================
    // WORKSPACE INVITE MANAGEMENT (AUTHENTICATED)
    // ============================================

    /// <summary>
    /// Create a new workspace invite link
    /// POST /api/workspaces/{workspaceId}/invites
    /// </summary>
    [HttpPost("workspaces/{workspaceId}/invites")]
    [Authorize]
    public async Task<ActionResult<CreateInviteResponseDto>> CreateInvite(
        Guid workspaceId,
        [FromBody] CreateInviteRequestDto request)
    {
        try
        {
            var userId = GetUserId();
            var result = await _inviteService.CreateInviteAsync(userId, workspaceId, request);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating workspace invite");
            return StatusCode(500, new { message = "Erro ao criar convite" });
        }
    }

    /// <summary>
    /// List all active invites for a workspace
    /// GET /api/workspaces/{workspaceId}/invites
    /// </summary>
    [HttpGet("workspaces/{workspaceId}/invites")]
    [Authorize]
    public async Task<ActionResult<List<WorkspaceInviteDto>>> GetInvites(Guid workspaceId)
    {
        try
        {
            var userId = GetUserId();
            var invites = await _inviteService.GetInvitesAsync(userId, workspaceId);
            return Ok(invites);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting workspace invites");
            return StatusCode(500, new { message = "Erro ao buscar convites" });
        }
    }

    /// <summary>
    /// Revoke (deactivate) an invite
    /// DELETE /api/workspaces/{workspaceId}/invites/{inviteId}
    /// </summary>
    [HttpDelete("workspaces/{workspaceId}/invites/{inviteId}")]
    [Authorize]
    public async Task<ActionResult> RevokeInvite(Guid workspaceId, Guid inviteId)
    {
        try
        {
            var userId = GetUserId();
            await _inviteService.RevokeInviteAsync(userId, workspaceId, inviteId);
            return Ok(new { message = "Convite revogado com sucesso" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error revoking workspace invite");
            return StatusCode(500, new { message = "Erro ao revogar convite" });
        }
    }

    /// <summary>
    /// Get all members of a workspace
    /// GET /api/workspaces/{workspaceId}/members
    /// </summary>
    [HttpGet("workspaces/{workspaceId}/members")]
    [Authorize]
    public async Task<ActionResult<List<WorkspaceMemberDto>>> GetMembers(Guid workspaceId)
    {
        try
        {
            var userId = GetUserId();
            var members = await _inviteService.GetMembersAsync(userId, workspaceId);
            return Ok(members);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting workspace members");
            return StatusCode(500, new { message = "Erro ao buscar membros" });
        }
    }

    // ============================================
    // PUBLIC INVITE ENDPOINTS (NO AUTH REQUIRED)
    // ============================================

    /// <summary>
    /// Validate an invite token (public endpoint)
    /// GET /api/invites/{token}/validate
    /// </summary>
    [HttpGet("invites/{token}/validate")]
    [AllowAnonymous]
    public async Task<ActionResult<ValidateInviteResponseDto>> ValidateInvite(string token)
    {
        try
        {
            var result = await _inviteService.ValidateInviteAsync(token);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating invite");
            return StatusCode(500, new { message = "Erro ao validar convite" });
        }
    }

    /// <summary>
    /// Accept an invite and join workspace (requires authentication)
    /// POST /api/invites/{token}/accept
    /// </summary>
    [HttpPost("invites/{token}/accept")]
    [Authorize]
    public async Task<ActionResult<AcceptInviteResponseDto>> AcceptInvite(string token)
    {
        try
        {
            var userId = GetUserId();
            var result = await _inviteService.AcceptInviteAsync(userId, token);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error accepting invite");
            return StatusCode(500, new { message = "Erro ao aceitar convite" });
        }
    }
}
