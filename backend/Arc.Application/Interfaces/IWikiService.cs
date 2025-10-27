using Arc.Application.DTOs.Wiki;

namespace Arc.Application.Interfaces;

public interface IWikiService
{
    Task<WikiStatisticsDto> GetStatisticsAsync(Guid pageId, Guid userId);
    Task<byte[]> ExportWikiAsync(Guid pageId, Guid userId, string format);
}
