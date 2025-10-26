using Arc.Application.DTOs.Group;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GroupController : ControllerBase
{
    private readonly IGroupService _groupService;
    private readonly ILogger<GroupController> _logger;

    public GroupController(IGroupService groupService, ILogger<GroupController> logger)
    {
        _groupService = groupService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GroupDto>>> GetAll()
    {
        try
        {
            var userId = GetUserId();
            var groups = await _groupService.GetAllByUserAsync(userId);
            return Ok(groups);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GroupDto>> GetById(Guid id)
    {
        try
        {
            var userId = GetUserId();
            var group = await _groupService.GetByIdAsync(id, userId);
            return Ok(group);
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

    [HttpGet("{id}/with-pages")]
    public async Task<ActionResult<GroupWithPagesDto>> GetWithPages(Guid id)
    {
        try
        {
            var userId = GetUserId();
            var group = await _groupService.GetWithPagesAsync(id, userId);
            return Ok(group);
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

    [HttpPost]
    public async Task<ActionResult<GroupDto>> Create([FromBody] CreateGroupRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = GetUserId();
            var group = await _groupService.CreateAsync(userId, request);
            return CreatedAtAction(nameof(GetById), new { id = group.Id }, group);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("from-preset")]
    public async Task<ActionResult<GroupWithPagesDto>> CreateFromPreset([FromBody] CreateGroupFromPresetRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = GetUserId();
            var group = await _groupService.CreateFromPresetAsync(userId, request);
            return CreatedAtAction(nameof(GetById), new { id = group.Id }, group);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<GroupDto>> Update(Guid id, [FromBody] UpdateGroupRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = GetUserId();
            var group = await _groupService.UpdateAsync(id, userId, request);
            return Ok(group);
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

    [HttpPut("{id}/expand")]
    public async Task<ActionResult<GroupDto>> ToggleExpanded(Guid id, [FromBody] ToggleGroupExpandedRequestDto request)
    {
        try
        {
            var userId = GetUserId();
            var group = await _groupService.ToggleExpandedAsync(id, userId, request.Expandido);
            return Ok(group);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}/favorite")]
    public async Task<ActionResult<GroupDto>> ToggleFavorite(Guid id, [FromBody] ToggleGroupFavoriteRequestDto request)
    {
        try
        {
            var userId = GetUserId();
            var group = await _groupService.ToggleFavoriteAsync(id, userId, request.Favorito);
            return Ok(group);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("reorder")]
    public async Task<ActionResult> Reorder([FromBody] ReorderGroupsRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = GetUserId();
            await _groupService.ReorderAsync(userId, request);
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
            await _groupService.DeleteAsync(id, userId);
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
