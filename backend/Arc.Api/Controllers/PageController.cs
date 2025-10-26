using Arc.Application.DTOs.Page;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PageController : ControllerBase
{
    private readonly IPageService _pageService;
    private readonly ILogger<PageController> _logger;

    public PageController(IPageService pageService, ILogger<PageController> logger)
    {
        _pageService = pageService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PageDto>> GetById(Guid id)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(id, userId);
            return Ok(page);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpGet("group/{groupId}")]
    public async Task<ActionResult<IEnumerable<PageDto>>> GetByGroupId(Guid groupId)
    {
        try
        {
            var userId = GetUserId();
            var pages = await _pageService.GetByGroupIdAsync(groupId, userId);
            return Ok(pages);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("favorites")]
    public async Task<ActionResult<IEnumerable<PageWithGroupDto>>> GetFavorites()
    {
        try
        {
            var userId = GetUserId();
            var pages = await _pageService.GetFavoritesByUserAsync(userId);
            return Ok(pages);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("group/{groupId}")]
    public async Task<ActionResult<PageDto>> Create(Guid groupId, [FromBody] CreatePageRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = GetUserId();
            var page = await _pageService.CreateAsync(groupId, userId, request);
            return CreatedAtAction(nameof(GetById), new { id = page.Id }, page);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<PageDto>> Update(Guid id, [FromBody] UpdatePageRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = GetUserId();
            var page = await _pageService.UpdateAsync(id, userId, request);
            return Ok(page);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPut("{id}/data")]
    public async Task<ActionResult<PageDto>> UpdateData(Guid id, [FromBody] UpdatePageDataRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = GetUserId();
            var page = await _pageService.UpdateDataAsync(id, userId, request);
            return Ok(page);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPut("{id}/favorite")]
    public async Task<ActionResult<PageDto>> ToggleFavorite(Guid id, [FromBody] TogglePageFavoriteRequestDto request)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.ToggleFavoriteAsync(id, userId, request.Favorito);
            return Ok(page);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}/move")]
    public async Task<ActionResult<PageDto>> Move(Guid id, [FromBody] MovePageRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = GetUserId();
            var page = await _pageService.MoveToGroupAsync(id, userId, request);
            return Ok(page);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("group/{groupId}/reorder")]
    public async Task<ActionResult> Reorder(Guid groupId, [FromBody] ReorderPagesRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = GetUserId();
            await _pageService.ReorderAsync(groupId, userId, request);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        try
        {
            var userId = GetUserId();
            await _pageService.DeleteAsync(id, userId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }
}
