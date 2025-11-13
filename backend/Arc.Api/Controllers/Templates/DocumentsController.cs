using Arc.Application.DTOs.Documents;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers.Templates;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentsService _documentsService;
    private readonly ILogger<DocumentsController> _logger;

    public DocumentsController(IDocumentsService documentsService, ILogger<DocumentsController> logger)
    {
        _documentsService = documentsService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    /// <summary>
    /// Obtém todos os documentos e pastas
    /// </summary>
    [HttpGet("{pageId}")]
    public async Task<ActionResult<DocumentsDataDto>> GetDocumentsData(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var data = await _documentsService.GetDocumentsDataAsync(pageId, userId);
            return Ok(data);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter documentos");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Obtém estatísticas dos documentos
    /// </summary>
    [HttpGet("{pageId}/statistics")]
    public async Task<ActionResult<DocumentsStatisticsDto>> GetStatistics(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var statistics = await _documentsService.GetStatisticsAsync(pageId, userId);
            return Ok(statistics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter estatísticas dos documentos");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Cria uma nova pasta
    /// </summary>
    [HttpPost("{pageId}/folders")]
    public async Task<ActionResult<FolderDto>> CreateFolder(Guid pageId, [FromBody] CreateFolderRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = GetUserId();
            var folder = await _documentsService.CreateFolderAsync(
                pageId,
                userId,
                request.Name,
                request.Parent,
                request.Color
            );

            return CreatedAtAction(nameof(GetDocumentsData), new { pageId }, folder);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar pasta");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Faz upload de um documento
    /// </summary>
    [HttpPost("{pageId}/upload")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<UploadDocumentResponseDto>> UploadDocument(
        Guid pageId,
        IFormFile file,
        [FromQuery] string folder = "root",
        [FromQuery] string? tags = null)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Arquivo inválido" });

        try
        {
            var userId = GetUserId();
            var tagsList = string.IsNullOrEmpty(tags)
                ? new List<string>()
                : tags.Split(',').Select(t => t.Trim()).ToList();

            var document = await _documentsService.UploadDocumentAsync(
                pageId,
                userId,
                file,
                folder,
                tagsList
            );

            var response = new UploadDocumentResponseDto
            {
                Document = document,
                Message = "Documento enviado com sucesso"
            };

            return CreatedAtAction(nameof(GetDocumentsData), new { pageId }, response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao fazer upload do documento");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Atualiza um documento
    /// </summary>
    [HttpPut("{pageId}/documents/{documentId}")]
    public async Task<ActionResult<DocumentDto>> UpdateDocument(
        Guid pageId,
        string documentId,
        [FromBody] UpdateDocumentRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = GetUserId();
            var document = await _documentsService.UpdateDocumentAsync(pageId, userId, documentId, request);
            return Ok(document);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar documento");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Deleta um documento
    /// </summary>
    [HttpDelete("{pageId}/documents/{documentId}")]
    public async Task<IActionResult> DeleteDocument(Guid pageId, string documentId)
    {
        try
        {
            var userId = GetUserId();
            await _documentsService.DeleteDocumentAsync(pageId, userId, documentId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar documento");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Faz download de um documento
    /// </summary>
    [HttpGet("{pageId}/documents/{documentId}/download")]
    public async Task<IActionResult> DownloadDocument(Guid pageId, string documentId)
    {
        try
        {
            var userId = GetUserId();
            var fileBytes = await _documentsService.DownloadDocumentAsync(pageId, userId, documentId);

            // Buscar nome do arquivo
            var data = await _documentsService.GetDocumentsDataAsync(pageId, userId);
            var document = data.Documents.FirstOrDefault(d => d.Id == documentId);

            var fileName = document?.Name ?? $"document-{documentId}";

            return File(fileBytes, "application/octet-stream", fileName);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (FileNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao fazer download do documento");
            return BadRequest(new { message = ex.Message });
        }
    }
}
