using Arc.Application.DTOs.Team;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers.Team;

[ApiController]
[Route("api/workspaces/{workspaceId}/team")]
[Authorize]
public class TeamController : ControllerBase
{
    private readonly ITeamService _teamService;

    public TeamController(ITeamService teamService)
    {
        _teamService = teamService;
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Usuário não autenticado");
        }
        return userId;
    }

    /// <summary>
    /// Obtém as informações do time do workspace
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetTeam(Guid workspaceId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var team = await _teamService.GetTeamAsync(workspaceId, userId);
            return Ok(team);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Adiciona um membro ao workspace
    /// </summary>
    [HttpPost("members")]
    public async Task<IActionResult> AddMember(Guid workspaceId, [FromBody] AddMemberDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var member = await _teamService.AddMemberAsync(workspaceId, userId, dto);
            return Ok(member);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Remove um membro do workspace
    /// </summary>
    [HttpDelete("members/{memberId}")]
    public async Task<IActionResult> RemoveMember(Guid workspaceId, Guid memberId)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _teamService.RemoveMemberAsync(workspaceId, userId, memberId);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Atualiza a função de um membro
    /// </summary>
    [HttpPut("members/{memberId}/role")]
    public async Task<IActionResult> UpdateMemberRole(Guid workspaceId, Guid memberId, [FromBody] UpdateMemberRoleDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var member = await _teamService.UpdateMemberRoleAsync(workspaceId, userId, memberId, dto);
            return Ok(member);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Envia um convite para o workspace
    /// </summary>
    [HttpPost("invitations")]
    public async Task<IActionResult> InviteMember(Guid workspaceId, [FromBody] InviteMemberDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var invitation = await _teamService.InviteMemberAsync(workspaceId, userId, dto);
            return Ok(invitation);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Cancela um convite pendente
    /// </summary>
    [HttpDelete("invitations/{invitationId}")]
    public async Task<IActionResult> CancelInvitation(Guid workspaceId, Guid invitationId)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _teamService.CancelInvitationAsync(workspaceId, userId, invitationId);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Faz upgrade do workspace (aumenta limite de membros)
    /// </summary>
    [HttpPost("upgrade")]
    public async Task<IActionResult> UpgradeWorkspace(Guid workspaceId, [FromBody] UpgradeWorkspaceRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _teamService.UpgradeWorkspaceAsync(workspaceId, userId, request.MaxMembers);
            return Ok(new { message = "Workspace atualizado com sucesso" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Define permissões de um membro em um grupo
    /// </summary>
    [HttpPost("permissions")]
    public async Task<IActionResult> SetGroupPermission(Guid workspaceId, [FromBody] SetGroupPermissionDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var permission = await _teamService.SetGroupPermissionAsync(workspaceId, userId, dto);
            return Ok(permission);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Obtém permissões de um grupo
    /// </summary>
    [HttpGet("groups/{groupId}/permissions")]
    public async Task<IActionResult> GetGroupPermissions(Guid workspaceId, Guid groupId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var permissions = await _teamService.GetGroupPermissionsAsync(groupId, userId);
            return Ok(permissions);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Remove uma permissão de grupo
    /// </summary>
    [HttpDelete("permissions/{permissionId}")]
    public async Task<IActionResult> RemoveGroupPermission(Guid workspaceId, Guid permissionId)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _teamService.RemoveGroupPermissionAsync(workspaceId, userId, permissionId);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Define permissões de um membro em uma página
    /// </summary>
    [HttpPost("page-permissions")]
    public async Task<IActionResult> SetPagePermission(Guid workspaceId, [FromBody] SetPagePermissionDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var permission = await _teamService.SetPagePermissionAsync(workspaceId, userId, dto);
            return Ok(permission);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Obtém permissões de uma página
    /// </summary>
    [HttpGet("pages/{pageId}/permissions")]
    public async Task<IActionResult> GetPagePermissions(Guid workspaceId, Guid pageId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var permissions = await _teamService.GetPagePermissionsAsync(pageId, userId);
            return Ok(permissions);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Remove uma permissão de página
    /// </summary>
    [HttpDelete("page-permissions/{permissionId}")]
    public async Task<IActionResult> RemovePagePermission(Guid workspaceId, Guid permissionId)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _teamService.RemovePagePermissionAsync(workspaceId, userId, permissionId);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

/// <summary>
/// Controller para operações de convites (sem workspace)
/// </summary>
[ApiController]
[Route("api/invitations")]
[Authorize]
public class InvitationsController : ControllerBase
{
    private readonly ITeamService _teamService;

    public InvitationsController(ITeamService teamService)
    {
        _teamService = teamService;
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Usuário não autenticado");
        }
        return userId;
    }

    private string GetCurrentUserEmail()
    {
        return User.FindFirst(ClaimTypes.Email)?.Value ?? "";
    }

    /// <summary>
    /// Obtém convites pendentes do usuário
    /// </summary>
    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingInvitations()
    {
        try
        {
            var email = GetCurrentUserEmail();
            var invitations = await _teamService.GetPendingInvitationsAsync(email);
            return Ok(invitations);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Aceita um convite
    /// </summary>
    [HttpPost("{invitationToken}/accept")]
    public async Task<IActionResult> AcceptInvitation(string invitationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            var member = await _teamService.AcceptInvitationAsync(userId, invitationToken);
            return Ok(member);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Recusa um convite
    /// </summary>
    [HttpPost("{invitationToken}/decline")]
    public async Task<IActionResult> DeclineInvitation(string invitationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _teamService.DeclineInvitationAsync(userId, invitationToken);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class UpgradeWorkspaceRequest
{
    public int MaxMembers { get; set; }
}
