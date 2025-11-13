using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers;

/// <summary>
/// Controller base com autenticação para todas as rotas protegidas
/// </summary>
[ApiController]
[Authorize]
public abstract class BaseAuthController : ControllerBase
{
    /// <summary>
    /// Obtém o ID do usuário autenticado do token JWT
    /// </summary>
    protected Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Usuário não autenticado ou token inválido");
        }

        return userId;
    }

    /// <summary>
    /// Obtém o email do usuário autenticado do token JWT
    /// </summary>
    protected string GetUserEmail()
    {
        var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value;

        if (string.IsNullOrEmpty(emailClaim))
        {
            throw new UnauthorizedAccessException("Email do usuário não encontrado no token");
        }

        return emailClaim;
    }

    /// <summary>
    /// Obtém o nome do usuário autenticado do token JWT
    /// </summary>
    protected string? GetUserName()
    {
        return User.FindFirst(ClaimTypes.Name)?.Value;
    }

    /// <summary>
    /// Verifica se o usuário tem uma claim específica
    /// </summary>
    protected bool HasClaim(string claimType, string claimValue)
    {
        return User.HasClaim(claimType, claimValue);
    }
}
