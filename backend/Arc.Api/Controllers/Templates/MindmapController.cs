using Arc.Application.DTOs.MindMap;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace Arc.API.Controllers.Templates;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MindmapController : ControllerBase
{
    private readonly IPageService _pageService;
    private readonly IMindMapService _mindMapService;
    private readonly ILogger<MindmapController> _logger;

    public MindmapController(IPageService pageService, IMindMapService mindMapService, ILogger<MindmapController> logger)
    {
        _pageService = pageService;
        _mindMapService = mindMapService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    [HttpGet("{pageId}")]
    public async Task<ActionResult<MindMapDataDto>> Get(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);
            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<MindMapDataDto>(jsonData) ?? new MindMapDataDto();
            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter mindmap");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{pageId}")]
    public async Task<ActionResult<MindMapDataDto>> Create(Guid pageId, [FromBody] MindMapDataDto mindmap)
    {
        try
        {
            var userId = GetUserId();
            // Overwrite page data with provided mindmap
            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(mindmap)
            };
            await _pageService.UpdateDataAsync(pageId, userId, updateDto);
            return CreatedAtAction(nameof(Get), new { pageId }, mindmap);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar mindmap");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{pageId}")]
    public async Task<ActionResult<MindMapDataDto>> Update(Guid pageId, [FromBody] MindMapDataDto mindmap)
    {
        try
        {
            var userId = GetUserId();
            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(mindmap)
            };
            await _pageService.UpdateDataAsync(pageId, userId, updateDto);
            return Ok(mindmap);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar mindmap");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{pageId}")]
    public async Task<IActionResult> Delete(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var empty = new MindMapDataDto();
            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(empty)
            };
            await _pageService.UpdateDataAsync(pageId, userId, updateDto);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar mindmap");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{pageId}/statistics")]
    public async Task<ActionResult<MindMapStatisticsDto>> GetStatistics(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var stats = await _mindMapService.GetStatisticsAsync(pageId, userId);
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter estatísticas do mindmap");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{pageId}/export/{format}")]
    public async Task<IActionResult> Export(Guid pageId, string format)
    {
        try
        {
            var userId = GetUserId();
            var bytes = await _mindMapService.ExportMindMapAsync(pageId, userId, format);
            var contentType = format.ToLower() switch
            {
                "json" => "application/json",
                "md" => "text/markdown",
                "txt" => "text/plain",
                _ => "application/octet-stream"
            };
            var fileName = $"mindmap-{pageId}.{format}";
            return File(bytes, contentType, fileName);
        }
        catch (NotSupportedException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao exportar mindmap");
            return BadRequest(new { message = ex.Message });
        }
    }
}

