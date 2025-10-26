using Arc.Application.DTOs.Templates;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace Arc.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BugsController : ControllerBase
{
    private readonly IPageService _pageService;
    private readonly ILogger<BugsController> _logger;

    public BugsController(IPageService pageService, ILogger<BugsController> logger)
    {
        _pageService = pageService;
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
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<BugsDataDto>(jsonData) ?? new BugsDataDto();

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
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<BugsDataDto>(jsonData) ?? new BugsDataDto();

            bug.Id = Guid.NewGuid().ToString();
            bug.CreatedAt = DateTime.UtcNow;
            data.Bugs.Add(bug);

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return CreatedAtAction(nameof(GetBugsData), new { pageId }, bug);
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
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<BugsDataDto>(jsonData) ?? new BugsDataDto();

            var bug = data.Bugs.FirstOrDefault(b => b.Id == bugId);
            if (bug == null)
                return NotFound(new { message = "Bug não encontrado" });

            bug.Title = updatedBug.Title;
            bug.Description = updatedBug.Description;
            bug.Status = updatedBug.Status;
            bug.Priority = updatedBug.Priority;
            bug.AssignedTo = updatedBug.AssignedTo;

            if (updatedBug.Status == "resolved" && bug.ResolvedAt == null)
                bug.ResolvedAt = DateTime.UtcNow;

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return Ok(bug);
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
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<BugsDataDto>(jsonData) ?? new BugsDataDto();

            var bug = data.Bugs.FirstOrDefault(b => b.Id == bugId);
            if (bug == null)
                return NotFound(new { message = "Bug não encontrado" });

            data.Bugs.Remove(bug);

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar bug");
            return BadRequest(new { message = ex.Message });
        }
    }
}
