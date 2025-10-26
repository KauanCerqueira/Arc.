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
public class ProjectsController : ControllerBase
{
    private readonly IPageService _pageService;
    private readonly ILogger<ProjectsController> _logger;

    public ProjectsController(IPageService pageService, ILogger<ProjectsController> logger)
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
    public async Task<ActionResult<ProjectsDataDto>> GetProjectsData(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<ProjectsDataDto>(jsonData) ?? new ProjectsDataDto();

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
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<ProjectsDataDto>(jsonData) ?? new ProjectsDataDto();

            project.Id = Guid.NewGuid().ToString();
            data.Projects.Add(project);

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return CreatedAtAction(nameof(GetProjectsData), new { pageId }, project);
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
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<ProjectsDataDto>(jsonData) ?? new ProjectsDataDto();

            var project = data.Projects.FirstOrDefault(p => p.Id == projectId);
            if (project == null)
                return NotFound(new { message = "Projeto não encontrado" });

            project.Name = updatedProject.Name;
            project.Description = updatedProject.Description;
            project.Status = updatedProject.Status;
            project.Progress = updatedProject.Progress;
            project.Deadline = updatedProject.Deadline;
            project.Tags = updatedProject.Tags;

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return Ok(project);
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
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<ProjectsDataDto>(jsonData) ?? new ProjectsDataDto();

            var project = data.Projects.FirstOrDefault(p => p.Id == projectId);
            if (project == null)
                return NotFound(new { message = "Projeto não encontrado" });

            data.Projects.Remove(project);

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar projeto");
            return BadRequest(new { message = ex.Message });
        }
    }
}
