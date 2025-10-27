using Arc.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers;

[ApiController]
[Route("api/master")]
[Authorize]
public class MasterController : ControllerBase
{
    private readonly IUserRepository _userRepository;

    public MasterController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    private async Task<bool> IsMasterUser()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return false;
        }

        var user = await _userRepository.GetByIdAsync(userId);
        return user?.IsMaster ?? false;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        try
        {
            if (!await IsMasterUser())
            {
                return Forbid();
            }

            var users = await _userRepository.GetAllAsync();
            var userDtos = users.Select(u => new
            {
                userId = u.Id,
                nome = u.Nome,
                sobrenome = u.Sobrenome,
                email = u.Email,
                bio = u.Bio,
                icone = u.Icone,
                profissao = u.Profissao,
                comoConheceu = u.ComoConheceu,
                isMaster = u.IsMaster,
                ativo = u.Ativo,
                criadoEm = u.CriadoEm
            });

            return Ok(userDtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro ao buscar usuários", details = ex.Message });
        }
    }

    [HttpPut("users/{userId}/status")]
    public async Task<IActionResult> UpdateUserStatus(Guid userId, [FromBody] UpdateUserStatusRequest request)
    {
        try
        {
            if (!await IsMasterUser())
            {
                return Forbid();
            }

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "Usuário não encontrado" });
            }

            // Não permitir desativar a si mesmo
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(currentUserIdClaim, out var currentUserId) && currentUserId == userId)
            {
                return BadRequest(new { message = "Você não pode desativar sua própria conta" });
            }

            user.Ativo = request.Ativo;
            await _userRepository.UpdateAsync(user);

            return Ok(new
            {
                userId = user.Id,
                nome = user.Nome,
                sobrenome = user.Sobrenome,
                email = user.Email,
                bio = user.Bio,
                icone = user.Icone,
                profissao = user.Profissao,
                comoConheceu = user.ComoConheceu,
                isMaster = user.IsMaster,
                ativo = user.Ativo,
                criadoEm = user.CriadoEm
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro ao atualizar status do usuário", details = ex.Message });
        }
    }

    [HttpPut("users/{userId}/master")]
    public async Task<IActionResult> UpdateUserMaster(Guid userId, [FromBody] UpdateUserMasterRequest request)
    {
        try
        {
            if (!await IsMasterUser())
            {
                return Forbid();
            }

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "Usuário não encontrado" });
            }

            // Não permitir remover master de si mesmo
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(currentUserIdClaim, out var currentUserId) && currentUserId == userId && !request.IsMaster)
            {
                return BadRequest(new { message = "Você não pode remover seus próprios privilégios master" });
            }

            user.IsMaster = request.IsMaster;
            await _userRepository.UpdateAsync(user);

            return Ok(new
            {
                userId = user.Id,
                nome = user.Nome,
                sobrenome = user.Sobrenome,
                email = user.Email,
                bio = user.Bio,
                icone = user.Icone,
                profissao = user.Profissao,
                comoConheceu = user.ComoConheceu,
                isMaster = user.IsMaster,
                ativo = user.Ativo,
                criadoEm = user.CriadoEm
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro ao atualizar privilégios master", details = ex.Message });
        }
    }

    [HttpDelete("users/{userId}")]
    public async Task<IActionResult> DeleteUser(Guid userId)
    {
        try
        {
            if (!await IsMasterUser())
            {
                return Forbid();
            }

            // Não permitir deletar a si mesmo
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(currentUserIdClaim, out var currentUserId) && currentUserId == userId)
            {
                return BadRequest(new { message = "Você não pode deletar sua própria conta" });
            }

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "Usuário não encontrado" });
            }

            await _userRepository.DeleteAsync(userId);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro ao deletar usuário", details = ex.Message });
        }
    }
}

public class UpdateUserStatusRequest
{
    public bool Ativo { get; set; }
}

public class UpdateUserMasterRequest
{
    public bool IsMaster { get; set; }
}
