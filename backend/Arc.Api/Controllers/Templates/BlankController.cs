using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace Arc.API.Controllers.Templates;

/// <summary>
/// Controller para páginas em branco que armazenam dados JSON genéricos
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BlankController : ControllerBase
{
    private readonly IPageService _pageService;
    private readonly ILogger<BlankController> _logger;

    public BlankController(IPageService pageService, ILogger<BlankController> logger)
    {
        _pageService = pageService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    /// <summary>
    /// Obtém os dados de uma página em branco
    /// </summary>
    [HttpGet("{pageId}")]
    public async Task<ActionResult<object>> GetBlankData(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            if (page == null)
                return NotFound(new { message = "Página não encontrada" });

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<JsonElement>(jsonData);

            return Ok(data);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter dados da página em branco");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Atualiza os dados de uma página em branco
    /// </summary>
    [HttpPut("{pageId}")]
    public async Task<IActionResult> UpdateBlankData(Guid pageId, [FromBody] JsonElement data)
    {
        try
        {
            var userId = GetUserId();

            var jsonData = JsonSerializer.Serialize(data);

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = jsonData
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return Ok(new { message = "Dados atualizados com sucesso" });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar dados da página em branco");
            return BadRequest(new { message = ex.Message });
        }
    }
}
