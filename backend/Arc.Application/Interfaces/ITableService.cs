using Arc.Application.DTOs.Templates;

namespace Arc.Application.Interfaces;

public interface ITableService
{
    Task<TableDataDto> GetAsync(Guid pageId, Guid userId);
    Task<TableColumnDto> AddColumnAsync(Guid pageId, Guid userId, TableColumnDto column);
    Task<TableRowDto> AddRowAsync(Guid pageId, Guid userId, TableRowDto row);
    Task<TableRowDto> UpdateRowAsync(Guid pageId, Guid userId, string rowId, TableRowDto updatedRow);
    Task DeleteColumnAsync(Guid pageId, Guid userId, string columnId);
    Task DeleteRowAsync(Guid pageId, Guid userId, string rowId);
}

