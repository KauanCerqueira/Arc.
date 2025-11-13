using Arc.Application.DTOs.Roadmap;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers.Templates;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RoadmapController : ControllerBase
{
    private readonly IRoadmapService _roadmapService;
    private readonly ILogger<RoadmapController> _logger;

    public RoadmapController(IRoadmapService roadmapService, ILogger<RoadmapController> logger)
    {
        _roadmapService = roadmapService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    /// <summary>
    /// Obtém todos os dados do roadmap (itens e estatísticas)
    /// </summary>
    [HttpGet("{pageId}")]
    public async Task<ActionResult<RoadmapDataDto>> GetRoadmapData(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var data = await _roadmapService.GetRoadmapDataAsync(pageId, userId);
            return Ok(data);
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
            _logger.LogError(ex, "Erro ao obter dados do roadmap");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Obtém estatísticas do roadmap
    /// </summary>
    [HttpGet("{pageId}/statistics")]
    public async Task<ActionResult<RoadmapStatisticsDto>> GetStatistics(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var statistics = await _roadmapService.GetStatisticsAsync(pageId, userId);
            return Ok(statistics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter estatísticas do roadmap");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Adiciona um item ao roadmap
    /// </summary>
    [HttpPost("{pageId}/items")]
    public async Task<ActionResult<RoadmapItemDto>> AddItem(Guid pageId, [FromBody] RoadmapItemDto item)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = GetUserId();
            var newItem = await _roadmapService.AddItemAsync(pageId, userId, item);
            return CreatedAtAction(nameof(GetRoadmapData), new { pageId }, newItem);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao adicionar item ao roadmap");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Atualiza um item do roadmap
    /// </summary>
    [HttpPut("{pageId}/items/{itemId}")]
    public async Task<ActionResult<RoadmapItemDto>> UpdateItem(Guid pageId, string itemId, [FromBody] RoadmapItemDto item)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = GetUserId();
            var updatedItem = await _roadmapService.UpdateItemAsync(pageId, userId, itemId, item);
            return Ok(updatedItem);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar item do roadmap");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Deleta um item do roadmap
    /// </summary>
    [HttpDelete("{pageId}/items/{itemId}")]
    public async Task<IActionResult> DeleteItem(Guid pageId, string itemId)
    {
        try
        {
            var userId = GetUserId();
            await _roadmapService.DeleteItemAsync(pageId, userId, itemId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar item do roadmap");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Filtra itens do roadmap
    /// </summary>
    [HttpPost("{pageId}/filter")]
    public async Task<ActionResult<List<RoadmapItemDto>>> FilterItems(Guid pageId, [FromBody] FilterRoadmapRequestDto filter)
    {
        try
        {
            var userId = GetUserId();
            var items = await _roadmapService.FilterItemsAsync(pageId, userId, filter);
            return Ok(items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao filtrar itens do roadmap");
            return BadRequest(new { message = ex.Message });
        }
    }
}
