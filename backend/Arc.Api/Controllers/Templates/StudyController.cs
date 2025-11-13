using Arc.Application.DTOs.Templates;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers.Templates;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StudyController : ControllerBase
{
    private readonly IStudyService _studyService;
    private readonly ILogger<StudyController> _logger;

    public StudyController(IStudyService studyService, ILogger<StudyController> logger)
    {
        _studyService = studyService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    [HttpGet("{pageId}")]
    public async Task<ActionResult<StudyDataDto>> GetStudyData(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var data = await _studyService.GetAsync(pageId, userId);
            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter dados de estudo");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{pageId}")]
    public async Task<ActionResult<StudyTopicDto>> AddTopic(Guid pageId, [FromBody] StudyTopicDto topic)
    {
        try
        {
            var userId = GetUserId();
            var created = await _studyService.AddAsync(pageId, userId, topic);
            return CreatedAtAction(nameof(GetStudyData), new { pageId }, created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao adicionar tópico");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{pageId}/{topicId}")]
    public async Task<ActionResult<StudyTopicDto>> UpdateTopic(Guid pageId, string topicId, [FromBody] StudyTopicDto updatedTopic)
    {
        try
        {
            var userId = GetUserId();
            var topic = await _studyService.UpdateAsync(pageId, userId, topicId, updatedTopic);
            return Ok(topic);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar tópico");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{pageId}/{topicId}")]
    public async Task<IActionResult> DeleteTopic(Guid pageId, string topicId)
    {
        try
        {
            var userId = GetUserId();
            await _studyService.DeleteAsync(pageId, userId, topicId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar tópico");
            return BadRequest(new { message = ex.Message });
        }
    }
}

