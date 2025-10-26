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
public class StudyController : ControllerBase
{
    private readonly IPageService _pageService;
    private readonly ILogger<StudyController> _logger;

    public StudyController(IPageService pageService, ILogger<StudyController> logger)
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
    public async Task<ActionResult<StudyDataDto>> GetStudyData(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<StudyDataDto>(jsonData) ?? new StudyDataDto();

            // Recalcular total de tempo
            data.TotalTimeSpent = data.Topics.Sum(t => t.TimeSpent);

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
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<StudyDataDto>(jsonData) ?? new StudyDataDto();

            topic.Id = Guid.NewGuid().ToString();
            data.Topics.Add(topic);
            data.TotalTimeSpent = data.Topics.Sum(t => t.TimeSpent);

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return CreatedAtAction(nameof(GetStudyData), new { pageId }, topic);
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
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<StudyDataDto>(jsonData) ?? new StudyDataDto();

            var topic = data.Topics.FirstOrDefault(t => t.Id == topicId);
            if (topic == null)
                return NotFound(new { message = "Tópico não encontrado" });

            topic.Topic = updatedTopic.Topic;
            topic.Notes = updatedTopic.Notes;
            topic.Progress = updatedTopic.Progress;
            topic.StudyDate = updatedTopic.StudyDate;
            topic.TimeSpent = updatedTopic.TimeSpent;

            data.TotalTimeSpent = data.Topics.Sum(t => t.TimeSpent);

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return Ok(topic);
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
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<StudyDataDto>(jsonData) ?? new StudyDataDto();

            var topic = data.Topics.FirstOrDefault(t => t.Id == topicId);
            if (topic == null)
                return NotFound(new { message = "Tópico não encontrado" });

            data.Topics.Remove(topic);
            data.TotalTimeSpent = data.Topics.Sum(t => t.TimeSpent);

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar tópico");
            return BadRequest(new { message = ex.Message });
        }
    }
}
