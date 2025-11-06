using Arc.Application.DTOs.Google;

namespace Arc.Application.Interfaces;

public interface IGoogleIntegrationService
{
    // Configuração da integração
    Task<GoogleIntegrationConfigDto> ConfigureIntegrationAsync(GoogleIntegrationConfigDto config);
    Task<GoogleIntegrationConfigDto?> GetIntegrationConfigAsync(Guid userId);
    Task DisableIntegrationAsync(Guid userId);

    // Google Calendar
    Task<List<GoogleCalendarListDto>> GetAvailableCalendarsAsync(Guid userId);
    Task<GoogleCalendarEventDto> CreateCalendarEventAsync(Guid userId, GoogleCalendarEventDto eventDto);
    Task<GoogleCalendarEventDto> UpdateCalendarEventAsync(Guid userId, string eventId, GoogleCalendarEventDto eventDto);
    Task DeleteCalendarEventAsync(Guid userId, string eventId, string calendarId);
    Task<List<GoogleCalendarEventDto>> GetCalendarEventsAsync(Guid userId, DateTime? startDate = null, DateTime? endDate = null);

    // Google Tasks
    Task<List<GoogleTaskListDto>> GetAvailableTaskListsAsync(Guid userId);
    Task<GoogleTaskDto> CreateTaskAsync(Guid userId, GoogleTaskDto taskDto);
    Task<GoogleTaskDto> UpdateTaskAsync(Guid userId, string taskId, GoogleTaskDto taskDto);
    Task DeleteTaskAsync(Guid userId, string taskId, string taskListId);
    Task<List<GoogleTaskDto>> GetTasksAsync(Guid userId, string? taskListId = null);

    // Sincronização
    Task<SyncStatusDto> SyncWithGoogleAsync(Guid userId);
    Task<SyncStatusDto> GetSyncStatusAsync(Guid userId);

    // Webhooks/Push notifications do Google
    Task HandleGoogleWebhookAsync(string channelId, string resourceId, string resourceState);
}
