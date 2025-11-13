using Arc.Application.DTOs.Templates;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers.Templates;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TableController : ControllerBase
{
    private readonly ITableService _tableService;
    private readonly ILogger<TableController> _logger;

    public TableController(ITableService tableService, ILogger<TableController> logger)
    {
        _tableService = tableService;
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
            var data = await _tableService.GetAsync(pageId, userId);
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
            var created = await _tableService.AddColumnAsync(pageId, userId, column);
            return CreatedAtAction(nameof(GetTableData), new { pageId }, created);
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
            var created = await _tableService.AddRowAsync(pageId, userId, row);
            return CreatedAtAction(nameof(GetTableData), new { pageId }, created);
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
            var row = await _tableService.UpdateRowAsync(pageId, userId, rowId, updatedRow);
            return Ok(row);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
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
            await _tableService.DeleteColumnAsync(pageId, userId, columnId);
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
            await _tableService.DeleteRowAsync(pageId, userId, rowId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar linha");
            return BadRequest(new { message = ex.Message });
        }
    }
}

