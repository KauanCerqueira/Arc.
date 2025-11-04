using Arc.Application.DTOs.Dashboard;

namespace Arc.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardDataDto> GetAsync(Guid pageId, Guid userId);
    Task<DashboardWidgetDto> AddWidgetAsync(Guid pageId, Guid userId, DashboardWidgetDto widget);
    Task<DashboardDataDto> UpdateAsync(Guid pageId, Guid userId, DashboardDataDto data);
    Task DeleteWidgetAsync(Guid pageId, Guid userId, string widgetId);
    Task ResetAsync(Guid pageId, Guid userId);
}

