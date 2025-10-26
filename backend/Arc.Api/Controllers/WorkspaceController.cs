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

    [HttpGet("full")]
    public async Task<ActionResult<WorkspaceWithGroupsDto>> GetWorkspaceFull()
    {
        try
        {
            var userId = GetUserId();
            var workspace = await _workspaceService.GetWithGroupsAndPagesAsync(userId);
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

    [HttpPut]
    public async Task<ActionResult<WorkspaceDto>> UpdateWorkspace([FromBody] UpdateWorkspaceRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = GetUserId();
            var workspace = await _workspaceService.UpdateAsync(userId, request);
            return Ok(workspace);
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
