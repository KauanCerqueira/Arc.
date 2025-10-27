using Arc.Application.DTOs.Analytics;

namespace Arc.Application.Interfaces;

public interface IAnalyticsService
{
    Task<AnalyticsDto> GetAnalyticsAsync();
}
