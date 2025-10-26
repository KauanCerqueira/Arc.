using Arc.Application.DTOs.Flowchart;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FlowchartController : ControllerBase
{
    private readonly IFlowchartService _flowchartService;
    private readonly ILogger<FlowchartController> _logger;

    public FlowchartController(IFlowchartService flowchartService, ILogger<FlowchartController> logger)
    {
        _flowchartService = flowchartService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    /// <summary>
    /// Valida um fluxograma e retorna estatísticas
    /// </summary>
    [HttpPost("validate")]
    public async Task<ActionResult<FlowchartValidationResultDto>> ValidateFlowchart([FromBody] ValidateFlowchartRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var result = await _flowchartService.ValidateFlowchartAsync(request.Flowchart);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao validar fluxograma");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Obtém estatísticas de um fluxograma
    /// </summary>
    [HttpGet("{pageId}/statistics")]
    public async Task<ActionResult<FlowchartStatisticsDto>> GetStatistics(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var statistics = await _flowchartService.GetStatisticsAsync(pageId, userId);
            return Ok(statistics);
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
            _logger.LogError(ex, "Erro ao obter estatísticas do fluxograma");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Exporta um fluxograma em formato JSON, SVG ou PNG
    /// </summary>
    [HttpGet("{pageId}/export/{format}")]
    public async Task<IActionResult> ExportFlowchart(Guid pageId, string format)
    {
        try
        {
            var userId = GetUserId();
            var data = await _flowchartService.ExportFlowchartAsync(pageId, userId, format);

            var contentType = format.ToLower() switch
            {
                "json" => "application/json",
                "svg" => "image/svg+xml",
                "png" => "image/png",
                _ => "application/octet-stream"
            };

            var fileName = $"flowchart-{pageId}.{format.ToLower()}";

            return File(data, contentType, fileName);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (NotSupportedException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao exportar fluxograma");
            return BadRequest(new { message = ex.Message });
        }
    }
}
