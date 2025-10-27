using Arc.Application.DTOs.MindMap;

namespace Arc.Application.Interfaces;

public interface IMindMapService
{
    Task<MindMapStatisticsDto> GetStatisticsAsync(Guid pageId, Guid userId);
    Task<byte[]> ExportMindMapAsync(Guid pageId, Guid userId, string format);
}
