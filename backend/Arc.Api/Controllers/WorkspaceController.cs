using Arc.Application.DTOs.Workspace;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WorkspaceController : ControllerBase
{
    private readonly IWorkspaceService _workspaceService;
    private readonly ILogger<WorkspaceController> _logger;

    public WorkspaceController(IWorkspaceService workspaceService, ILogger<WorkspaceController> logger)
    {
        _workspaceService = workspaceService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    [HttpGet]
    public async Task<ActionResult<WorkspaceDto>> GetWorkspace()
    {
        try
        {
            var userId = GetUserId();
            var workspace = await _workspaceService.GetByUserIdAsync(userId);
            return Ok(workspace);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("all")]
    public async Task<ActionResult<List<WorkspaceDto>>> GetAllWorkspaces()
    {
        try
        {
            var userId = GetUserId();
            var workspaces = await _workspaceService.GetAllByUserIdAsync(userId);
            return Ok(workspaces);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all workspaces");
            return StatusCode(500, new { message = "Erro ao buscar workspaces" });
        }
    }

    [HttpGet("{workspaceId}")]
    public async Task<ActionResult<WorkspaceDto>> GetWorkspaceById(Guid workspaceId)
    {
        try
        {
            var userId = GetUserId();
            var workspace = await _workspaceService.GetByIdAsync(userId, workspaceId);
            return Ok(workspace);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("{workspaceId}/full")]
    public async Task<ActionResult<WorkspaceWithGroupsDto>> GetWorkspaceFull(Guid workspaceId)
    {
        try
        {
            var userId = GetUserId();
            var workspace = await _workspaceService.GetWithGroupsAndPagesAsync(userId, workspaceId);
            return Ok(workspace);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<WorkspaceDto>> CreateWorkspace([FromBody] CreateWorkspaceRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = GetUserId();
            var workspace = await _workspaceService.CreateAsync(userId, request);
            return CreatedAtAction(nameof(GetWorkspace), workspace);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{workspaceId}")]
    public async Task<ActionResult<WorkspaceDto>> UpdateWorkspace(Guid workspaceId, [FromBody] UpdateWorkspaceRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = GetUserId();
            var workspace = await _workspaceService.UpdateAsync(userId, workspaceId, request);
            return Ok(workspace);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{workspaceId}")]
    public async Task<ActionResult> DeleteWorkspace(Guid workspaceId)
    {
        try
        {
            var userId = GetUserId();
            await _workspaceService.DeleteAsync(userId, workspaceId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPut("settings")]
    public async Task<ActionResult<WorkspaceSettingsDto>> UpdateSettings([FromBody] UpdateWorkspaceSettingsRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = GetUserId();
            var settings = await _workspaceService.UpdateSettingsAsync(userId, request);
            return Ok(settings);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
