using Arc.Application.DTOs.Templates;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectsService _projectsService;
    private readonly ILogger<ProjectsController> _logger;

    public ProjectsController(IProjectsService projectsService, ILogger<ProjectsController> logger)
    {
        _projectsService = projectsService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    [HttpGet("{pageId}")]
    public async Task<ActionResult<ProjectsDataDto>> GetProjectsData(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var data = await _projectsService.GetAsync(pageId, userId);
            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter dados dos projetos");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{pageId}")]
    public async Task<ActionResult<ProjectDto>> AddProject(Guid pageId, [FromBody] ProjectDto project)
    {
        try
        {
            var userId = GetUserId();
            var created = await _projectsService.AddAsync(pageId, userId, project);
            return CreatedAtAction(nameof(GetProjectsData), new { pageId }, created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao adicionar projeto");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{pageId}/{projectId}")]
    public async Task<ActionResult<ProjectDto>> UpdateProject(Guid pageId, string projectId, [FromBody] ProjectDto updatedProject)
    {
        try
        {
            var userId = GetUserId();
            var project = await _projectsService.UpdateAsync(pageId, userId, projectId, updatedProject);
            return Ok(project);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar projeto");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{pageId}/{projectId}")]
    public async Task<IActionResult> DeleteProject(Guid pageId, string projectId)
    {
        try
        {
            var userId = GetUserId();
            await _projectsService.DeleteAsync(pageId, userId, projectId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar projeto");
            return BadRequest(new { message = ex.Message });
        }
    }
}

