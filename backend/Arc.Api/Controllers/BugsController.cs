using Arc.Application.DTOs.Templates;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BugsController : ControllerBase
{
    private readonly IBugsService _bugsService;
    private readonly ILogger<BugsController> _logger;

    public BugsController(IBugsService bugsService, ILogger<BugsController> logger)
    {
        _bugsService = bugsService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    [HttpGet("{pageId}")]
    public async Task<ActionResult<BugsDataDto>> GetBugsData(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var data = await _bugsService.GetAsync(pageId, userId);
            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter dados dos bugs");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{pageId}")]
    public async Task<ActionResult<BugDto>> AddBug(Guid pageId, [FromBody] BugDto bug)
    {
        try
        {
            var userId = GetUserId();
            var created = await _bugsService.AddAsync(pageId, userId, bug);
            return CreatedAtAction(nameof(GetBugsData), new { pageId }, created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao adicionar bug");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{pageId}/{bugId}")]
    public async Task<ActionResult<BugDto>> UpdateBug(Guid pageId, string bugId, [FromBody] BugDto updatedBug)
    {
        try
        {
            var userId = GetUserId();
            var bug = await _bugsService.UpdateAsync(pageId, userId, bugId, updatedBug);
            return Ok(bug);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar bug");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{pageId}/{bugId}")]
    public async Task<IActionResult> DeleteBug(Guid pageId, string bugId)
    {
        try
        {
            var userId = GetUserId();
            await _bugsService.DeleteAsync(pageId, userId, bugId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar bug");
            return BadRequest(new { message = ex.Message });
        }
    }
}

