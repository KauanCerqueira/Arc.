using System.Text.Json;
using Arc.Application.DTOs.Templates;
using Arc.Application.Interfaces;
using Arc.Domain.Interfaces;

namespace Arc.Application.Services;

public class TableService : ITableService
{
    private readonly IPageRepository _pageRepository;

    public TableService(IPageRepository pageRepository)
    {
        _pageRepository = pageRepository;
    }

    public async Task<TableDataDto> GetAsync(Guid pageId, Guid userId)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        return JsonSerializer.Deserialize<TableDataDto>(page.Data) ?? new TableDataDto();
    }

    public async Task<TableColumnDto> AddColumnAsync(Guid pageId, Guid userId, TableColumnDto column)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        var data = JsonSerializer.Deserialize<TableDataDto>(page.Data) ?? new TableDataDto();

        column.Id = string.IsNullOrWhiteSpace(column.Id) ? Guid.NewGuid().ToString() : column.Id;
        data.Columns.Add(column);

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);

        return column;
    }

    public async Task<TableRowDto> AddRowAsync(Guid pageId, Guid userId, TableRowDto row)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        var data = JsonSerializer.Deserialize<TableDataDto>(page.Data) ?? new TableDataDto();

        row.Id = string.IsNullOrWhiteSpace(row.Id) ? Guid.NewGuid().ToString() : row.Id;
        data.Rows.Add(row);

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);

        return row;
    }

    public async Task<TableRowDto> UpdateRowAsync(Guid pageId, Guid userId, string rowId, TableRowDto updatedRow)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        var data = JsonSerializer.Deserialize<TableDataDto>(page.Data) ?? new TableDataDto();
        var row = data.Rows.FirstOrDefault(r => r.Id == rowId)
                  ?? throw new InvalidOperationException("Linha não encontrada");

        row.Cells = updatedRow.Cells;

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);

        return row;
    }

    public async Task DeleteColumnAsync(Guid pageId, Guid userId, string columnId)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        var data = JsonSerializer.Deserialize<TableDataDto>(page.Data) ?? new TableDataDto();

        data.Columns = data.Columns.Where(c => c.Id != columnId).ToList();
        foreach (var row in data.Rows)
        {
            row.Cells.Remove(columnId);
        }

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
    }

    public async Task DeleteRowAsync(Guid pageId, Guid userId, string rowId)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        var data = JsonSerializer.Deserialize<TableDataDto>(page.Data) ?? new TableDataDto();
        data.Rows = data.Rows.Where(r => r.Id != rowId).ToList();

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
    }

    private async Task EnsureAccessAsync(Guid pageId, Guid userId)
    {
        var group = await _pageRepository.GetGroupByPageIdAsync(pageId);
        if (group == null)
            throw new InvalidOperationException("Grupo não encontrado para a página");

        var hasAccess = await HasAccessToWorkspace(group.WorkspaceId, userId);
        if (!hasAccess)
            throw new UnauthorizedAccessException("Acesso negado");
    }

    private Task<bool> HasAccessToWorkspace(Guid workspaceId, Guid userId)
    {
        // TODO: Implementar verificação real de acesso
        return Task.FromResult(true);
    }
}

