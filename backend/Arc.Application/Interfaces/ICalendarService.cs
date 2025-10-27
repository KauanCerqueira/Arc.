using Arc.Application.DTOs.Calendar;

namespace Arc.Application.Interfaces;

public interface ICalendarService
{
    Task<CalendarStatisticsDto> GetStatisticsAsync(Guid pageId, Guid userId);
    Task<byte[]> ExportCalendarAsync(Guid pageId, Guid userId, string format);
}
