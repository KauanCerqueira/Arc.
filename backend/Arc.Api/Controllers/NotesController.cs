using Arc.Application.DTOs.Notes;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotesController : ControllerBase
{
    private readonly INotesService _notesService;
    private readonly ILogger<NotesController> _logger;

    public NotesController(INotesService notesService, ILogger<NotesController> logger)
    {
        _notesService = notesService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    [HttpGet("{pageId}")]
    public async Task<ActionResult<NotesDataDto>> GetNotes(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var data = await _notesService.GetAsync(pageId, userId);
            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter notas");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{pageId}")]
    public async Task<ActionResult<NoteDto>> AddNote(Guid pageId, [FromBody] NoteDto note)
    {
        try
        {
            var userId = GetUserId();
            var created = await _notesService.AddAsync(pageId, userId, note);
            return CreatedAtAction(nameof(GetNotes), new { pageId }, created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao adicionar nota");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{pageId}/{noteId}")]
    public async Task<ActionResult<NoteDto>> UpdateNote(Guid pageId, string noteId, [FromBody] NoteDto updated)
    {
        try
        {
            var userId = GetUserId();
            var note = await _notesService.UpdateAsync(pageId, userId, noteId, updated);
            return Ok(note);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar nota");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{pageId}/{noteId}")]
    public async Task<IActionResult> DeleteNote(Guid pageId, string noteId)
    {
        try
        {
            var userId = GetUserId();
            await _notesService.DeleteAsync(pageId, userId, noteId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar nota");
            return BadRequest(new { message = ex.Message });
        }
    }
}

