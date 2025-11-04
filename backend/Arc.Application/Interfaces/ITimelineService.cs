using Arc.Application.DTOs.Timeline;

namespace Arc.Application.Interfaces;

public interface ITimelineService
{
    Task<TimelineDataDto> GetAsync(Guid pageId, Guid userId);
    Task<TimelineItemDto> AddAsync(Guid pageId, Guid userId, TimelineItemDto item);
    Task<TimelineItemDto> UpdateAsync(Guid pageId, Guid userId, string itemId, TimelineItemDto updated);
    Task DeleteAsync(Guid pageId, Guid userId, string itemId);
}

