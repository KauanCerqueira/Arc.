using Arc.Application.DTOs.Templates;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace Arc.API.Controllers.Templates;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class KanbanController : ControllerBase
{
    private readonly IPageService _pageService;
    private readonly ILogger<KanbanController> _logger;

    public KanbanController(IPageService pageService, ILogger<KanbanController> logger)
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
    public async Task<ActionResult<KanbanDataDto>> GetKanbanData(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<KanbanDataDto>(jsonData) ?? new KanbanDataDto();

            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter dados do Kanban");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{pageId}/columns")]
    public async Task<ActionResult<KanbanColumnDto>> AddColumn(Guid pageId, [FromBody] KanbanColumnDto column)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<KanbanDataDto>(jsonData) ?? new KanbanDataDto();

            column.Id = Guid.NewGuid().ToString();
            data.Columns.Add(column);

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return CreatedAtAction(nameof(GetKanbanData), new { pageId }, column);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao adicionar coluna");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{pageId}/columns/{columnId}/cards")]
    public async Task<ActionResult<KanbanCardDto>> AddCard(Guid pageId, string columnId, [FromBody] KanbanCardDto card)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<KanbanDataDto>(jsonData) ?? new KanbanDataDto();

            var column = data.Columns.FirstOrDefault(c => c.Id == columnId);
            if (column == null)
                return NotFound(new { message = "Coluna não encontrada" });

            card.Id = Guid.NewGuid().ToString();
            card.CreatedAt = DateTime.UtcNow;
            column.Cards.Add(card);

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return CreatedAtAction(nameof(GetKanbanData), new { pageId }, card);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao adicionar card");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{pageId}/cards/{cardId}/move")]
    public async Task<IActionResult> MoveCard(Guid pageId, string cardId, [FromBody] MoveCardDto request)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<KanbanDataDto>(jsonData) ?? new KanbanDataDto();

            KanbanCardDto? cardToMove = null;
            foreach (var column in data.Columns)
            {
                var card = column.Cards.FirstOrDefault(c => c.Id == cardId);
                if (card != null)
                {
                    cardToMove = card;
                    column.Cards.Remove(card);
                    break;
                }
            }

            if (cardToMove == null)
                return NotFound(new { message = "Card não encontrado" });

            var targetColumn = data.Columns.FirstOrDefault(c => c.Id == request.TargetColumnId);
            if (targetColumn == null)
                return NotFound(new { message = "Coluna de destino não encontrada" });

            targetColumn.Cards.Add(cardToMove);

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return Ok(new { message = "Card movido com sucesso" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao mover card");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{pageId}/cards/{cardId}")]
    public async Task<IActionResult> DeleteCard(Guid pageId, string cardId)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<KanbanDataDto>(jsonData) ?? new KanbanDataDto();

            foreach (var column in data.Columns)
            {
                var card = column.Cards.FirstOrDefault(c => c.Id == cardId);
                if (card != null)
                {
                    column.Cards.Remove(card);

                    var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
                    {
                        Data = JsonSerializer.Serialize(data)
                    };

                    await _pageService.UpdateDataAsync(pageId, userId, updateDto);
                    return NoContent();
                }
            }

            return NotFound(new { message = "Card não encontrado" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar card");
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class MoveCardDto
{
    public required string TargetColumnId { get; set; }
}
