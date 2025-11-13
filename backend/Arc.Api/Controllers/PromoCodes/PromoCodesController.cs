using Arc.Domain.Entities;
using Arc.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers.PromoCodes;

[ApiController]
[Route("api/master/promo-codes")]
[Authorize]
public class PromoCodesController : ControllerBase
{
    private readonly IPromoCodeRepository _promoCodeRepository;
    private readonly IUserRepository _userRepository;

    public PromoCodesController(
        IPromoCodeRepository promoCodeRepository,
        IUserRepository userRepository)
    {
        _promoCodeRepository = promoCodeRepository;
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

    [HttpGet]
    public async Task<IActionResult> GetAllPromoCodes()
    {
        try
        {
            if (!await IsMasterUser())
            {
                return Forbid();
            }

            var promoCodes = await _promoCodeRepository.GetAllAsync();
            var promoCodeDtos = promoCodes.Select(p => new
            {
                id = p.Id,
                code = p.Code,
                description = p.Description,
                discountPercentage = p.DiscountPercentage,
                maxUses = p.MaxUses,
                currentUses = p.CurrentUses,
                expiresAt = p.ExpiresAt,
                isActive = p.IsActive,
                createdAt = p.CreatedAt
            });

            return Ok(promoCodeDtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro ao buscar códigos promocionais", details = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreatePromoCode([FromBody] CreatePromoCodeRequest request)
    {
        try
        {
            if (!await IsMasterUser())
            {
                return Forbid();
            }

            // Verificar se o código já existe
            var existingCode = await _promoCodeRepository.GetByCodeAsync(request.Code);
            if (existingCode != null)
            {
                return BadRequest(new { message = "Este código promocional já existe" });
            }

            var promoCode = new PromoCode
            {
                Code = request.Code,
                Description = request.Description,
                DiscountPercentage = request.DiscountPercentage,
                MaxUses = request.MaxUses,
                ExpiresAt = request.ExpiresAt,
                IsActive = true
            };

            var created = await _promoCodeRepository.CreateAsync(promoCode);

            return Ok(new
            {
                id = created.Id,
                code = created.Code,
                description = created.Description,
                discountPercentage = created.DiscountPercentage,
                maxUses = created.MaxUses,
                currentUses = created.CurrentUses,
                expiresAt = created.ExpiresAt,
                isActive = created.IsActive,
                createdAt = created.CreatedAt
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro ao criar código promocional", details = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePromoCode(Guid id, [FromBody] UpdatePromoCodeRequest request)
    {
        try
        {
            if (!await IsMasterUser())
            {
                return Forbid();
            }

            var promoCode = await _promoCodeRepository.GetByIdAsync(id);
            if (promoCode == null)
            {
                return NotFound(new { message = "Código promocional não encontrado" });
            }

            if (request.Description != null)
            {
                promoCode.Description = request.Description;
            }

            if (request.IsActive.HasValue)
            {
                promoCode.IsActive = request.IsActive.Value;
            }

            await _promoCodeRepository.UpdateAsync(promoCode);

            return Ok(new
            {
                id = promoCode.Id,
                code = promoCode.Code,
                description = promoCode.Description,
                discountPercentage = promoCode.DiscountPercentage,
                maxUses = promoCode.MaxUses,
                currentUses = promoCode.CurrentUses,
                expiresAt = promoCode.ExpiresAt,
                isActive = promoCode.IsActive,
                createdAt = promoCode.CreatedAt
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro ao atualizar código promocional", details = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePromoCode(Guid id)
    {
        try
        {
            if (!await IsMasterUser())
            {
                return Forbid();
            }

            var promoCode = await _promoCodeRepository.GetByIdAsync(id);
            if (promoCode == null)
            {
                return NotFound(new { message = "Código promocional não encontrado" });
            }

            await _promoCodeRepository.DeleteAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro ao deletar código promocional", details = ex.Message });
        }
    }
}

public class CreatePromoCodeRequest
{
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int DiscountPercentage { get; set; }
    public int MaxUses { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class UpdatePromoCodeRequest
{
    public string? Description { get; set; }
    public bool? IsActive { get; set; }
}
