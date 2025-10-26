using Arc.Application.DTOs.Roadmap;

namespace Arc.Application.Interfaces;

public interface IRoadmapService
{
    Task<RoadmapDataDto> GetRoadmapDataAsync(Guid pageId, Guid userId);
    Task<RoadmapStatisticsDto> GetStatisticsAsync(Guid pageId, Guid userId);
    Task<RoadmapItemDto> AddItemAsync(Guid pageId, Guid userId, RoadmapItemDto item);
    Task<RoadmapItemDto> UpdateItemAsync(Guid pageId, Guid userId, string itemId, RoadmapItemDto item);
    Task DeleteItemAsync(Guid pageId, Guid userId, string itemId);
    Task<List<RoadmapItemDto>> FilterItemsAsync(Guid pageId, Guid userId, FilterRoadmapRequestDto filter);
}
