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
public class TableController : ControllerBase
{
    private readonly IPageService _pageService;
    private readonly ILogger<TableController> _logger;

    public TableController(IPageService pageService, ILogger<TableController> logger)
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
    public async Task<ActionResult<TableDataDto>> GetTableData(Guid pageId)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<TableDataDto>(jsonData) ?? new TableDataDto();

            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter dados da tabela");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{pageId}/columns")]
    public async Task<ActionResult<TableColumnDto>> AddColumn(Guid pageId, [FromBody] TableColumnDto column)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<TableDataDto>(jsonData) ?? new TableDataDto();

            column.Id = Guid.NewGuid().ToString();
            data.Columns.Add(column);

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return CreatedAtAction(nameof(GetTableData), new { pageId }, column);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao adicionar coluna");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{pageId}/rows")]
    public async Task<ActionResult<TableRowDto>> AddRow(Guid pageId, [FromBody] TableRowDto row)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<TableDataDto>(jsonData) ?? new TableDataDto();

            row.Id = Guid.NewGuid().ToString();
            data.Rows.Add(row);

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return CreatedAtAction(nameof(GetTableData), new { pageId }, row);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao adicionar linha");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{pageId}/rows/{rowId}")]
    public async Task<ActionResult<TableRowDto>> UpdateRow(Guid pageId, string rowId, [FromBody] TableRowDto updatedRow)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<TableDataDto>(jsonData) ?? new TableDataDto();

            var row = data.Rows.FirstOrDefault(r => r.Id == rowId);
            if (row == null)
                return NotFound(new { message = "Linha não encontrada" });

            row.Cells = updatedRow.Cells;

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return Ok(row);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar linha");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{pageId}/columns/{columnId}")]
    public async Task<IActionResult> DeleteColumn(Guid pageId, string columnId)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<TableDataDto>(jsonData) ?? new TableDataDto();

            var column = data.Columns.FirstOrDefault(c => c.Id == columnId);
            if (column == null)
                return NotFound(new { message = "Coluna não encontrada" });

            data.Columns.Remove(column);

            // Remover dados da coluna de todas as linhas
            foreach (var row in data.Rows)
            {
                row.Cells.Remove(columnId);
            }

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar coluna");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{pageId}/rows/{rowId}")]
    public async Task<IActionResult> DeleteRow(Guid pageId, string rowId)
    {
        try
        {
            var userId = GetUserId();
            var page = await _pageService.GetByIdAsync(pageId, userId);

            string jsonData = page.Data?.ToString() ?? "{}";
            var data = JsonSerializer.Deserialize<TableDataDto>(jsonData) ?? new TableDataDto();

            var row = data.Rows.FirstOrDefault(r => r.Id == rowId);
            if (row == null)
                return NotFound(new { message = "Linha não encontrada" });

            data.Rows.Remove(row);

            var updateDto = new Application.DTOs.Page.UpdatePageDataRequestDto
            {
                Data = JsonSerializer.Serialize(data)
            };

            await _pageService.UpdateDataAsync(pageId, userId, updateDto);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar linha");
            return BadRequest(new { message = ex.Message });
        }
    }
}
