using Arc.Application.DTOs.Google;
using Arc.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace Arc.Application.Services;

public class GoogleIntegrationService : IGoogleIntegrationService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GoogleIntegrationService> _logger;
    private const string GoogleCalendarApiBase = "https://www.googleapis.com/calendar/v3";
    private const string GoogleTasksApiBase = "https://www.googleapis.com/tasks/v1";

    // Armazenamento temporário de configurações (substitua por banco de dados)
    private static readonly Dictionary<Guid, GoogleIntegrationConfigDto> _integrationConfigs = new();
    private static readonly Dictionary<Guid, SyncStatusDto> _syncStatuses = new();
    private static readonly List<SyncMappingDto> _syncMappings = new();

    public GoogleIntegrationService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<GoogleIntegrationService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    #region Configuration

    public async Task<GoogleIntegrationConfigDto> ConfigureIntegrationAsync(GoogleIntegrationConfigDto config)
    {
        _logger.LogInformation("Configurando integração Google para usuário {UserId}", config.UserId);

        // Validar tokens fazendo uma chamada de teste
        var isValid = await ValidateTokensAsync(config.AccessToken);
        if (!isValid)
        {
            throw new InvalidOperationException("Token de acesso inválido");
        }

        _integrationConfigs[config.UserId] = config;

        return config;
    }

    public Task<GoogleIntegrationConfigDto?> GetIntegrationConfigAsync(Guid userId)
    {
        _integrationConfigs.TryGetValue(userId, out var config);
        return Task.FromResult(config);
    }

    public Task DisableIntegrationAsync(Guid userId)
    {
        _integrationConfigs.Remove(userId);
        _syncStatuses.Remove(userId);
        _logger.LogInformation("Integração Google desabilitada para usuário {UserId}", userId);
        return Task.CompletedTask;
    }

    #endregion

    #region Google Calendar

    public async Task<List<GoogleCalendarListDto>> GetAvailableCalendarsAsync(Guid userId)
    {
        var config = await GetConfigOrThrowAsync(userId);
        var client = CreateAuthenticatedClient(config.AccessToken);

        var response = await client.GetAsync($"{GoogleCalendarApiBase}/users/me/calendarList");
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<GoogleCalendarListResponse>();

        return result?.Items?.Select(item => new GoogleCalendarListDto
        {
            Id = item.Id,
            Summary = item.Summary,
            Description = item.Description,
            TimeZone = item.TimeZone,
            Primary = item.Primary
        }).ToList() ?? new List<GoogleCalendarListDto>();
    }

    public async Task<GoogleCalendarEventDto> CreateCalendarEventAsync(Guid userId, GoogleCalendarEventDto eventDto)
    {
        var config = await GetConfigOrThrowAsync(userId);
        var client = CreateAuthenticatedClient(config.AccessToken);

        var calendarId = eventDto.CalendarId ?? "primary";
        var requestBody = new
        {
            summary = eventDto.Summary,
            description = eventDto.Description,
            location = eventDto.Location,
            start = new { dateTime = eventDto.Start.ToString("yyyy-MM-ddTHH:mm:ss"), timeZone = "UTC" },
            end = new { dateTime = eventDto.End.ToString("yyyy-MM-ddTHH:mm:ss"), timeZone = "UTC" },
            attendees = eventDto.Attendees?.Select(email => new { email }).ToArray()
        };

        var response = await client.PostAsJsonAsync(
            $"{GoogleCalendarApiBase}/calendars/{calendarId}/events",
            requestBody
        );
        response.EnsureSuccessStatusCode();

        var createdEvent = await response.Content.ReadFromJsonAsync<GoogleEventResponse>();

        // Criar mapeamento
        if (!string.IsNullOrEmpty(eventDto.ArcEventId) && createdEvent != null)
        {
            _syncMappings.Add(new SyncMappingDto
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ArcItemType = "calendar",
                ArcItemId = eventDto.ArcEventId,
                GoogleItemType = "event",
                GoogleItemId = createdEvent.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        _logger.LogInformation("Evento criado no Google Calendar: {EventId}", createdEvent?.Id);

        return new GoogleCalendarEventDto
        {
            Id = createdEvent?.Id,
            Summary = createdEvent?.Summary ?? eventDto.Summary,
            Description = createdEvent?.Description,
            Start = eventDto.Start,
            End = eventDto.End
        };
    }

    public async Task<GoogleCalendarEventDto> UpdateCalendarEventAsync(Guid userId, string eventId, GoogleCalendarEventDto eventDto)
    {
        var config = await GetConfigOrThrowAsync(userId);
        var client = CreateAuthenticatedClient(config.AccessToken);

        var calendarId = eventDto.CalendarId ?? "primary";
        var requestBody = new
        {
            summary = eventDto.Summary,
            description = eventDto.Description,
            location = eventDto.Location,
            start = new { dateTime = eventDto.Start.ToString("yyyy-MM-ddTHH:mm:ss"), timeZone = "UTC" },
            end = new { dateTime = eventDto.End.ToString("yyyy-MM-ddTHH:mm:ss"), timeZone = "UTC" }
        };

        var response = await client.PutAsJsonAsync(
            $"{GoogleCalendarApiBase}/calendars/{calendarId}/events/{eventId}",
            requestBody
        );
        response.EnsureSuccessStatusCode();

        _logger.LogInformation("Evento atualizado no Google Calendar: {EventId}", eventId);

        return eventDto;
    }

    public async Task DeleteCalendarEventAsync(Guid userId, string eventId, string calendarId)
    {
        var config = await GetConfigOrThrowAsync(userId);
        var client = CreateAuthenticatedClient(config.AccessToken);

        var response = await client.DeleteAsync(
            $"{GoogleCalendarApiBase}/calendars/{calendarId}/events/{eventId}"
        );
        response.EnsureSuccessStatusCode();

        // Remover mapeamento
        var mapping = _syncMappings.FirstOrDefault(m =>
            m.UserId == userId && m.GoogleItemId == eventId);
        if (mapping != null)
        {
            _syncMappings.Remove(mapping);
        }

        _logger.LogInformation("Evento deletado do Google Calendar: {EventId}", eventId);
    }

    public async Task<List<GoogleCalendarEventDto>> GetCalendarEventsAsync(Guid userId, DateTime? startDate = null, DateTime? endDate = null)
    {
        var config = await GetConfigOrThrowAsync(userId);
        var client = CreateAuthenticatedClient(config.AccessToken);

        var start = (startDate ?? DateTime.UtcNow.AddMonths(-1)).ToString("yyyy-MM-ddTHH:mm:ssZ");
        var end = (endDate ?? DateTime.UtcNow.AddMonths(1)).ToString("yyyy-MM-ddTHH:mm:ssZ");

        var response = await client.GetAsync(
            $"{GoogleCalendarApiBase}/calendars/primary/events?timeMin={start}&timeMax={end}&singleEvents=true&orderBy=startTime"
        );
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<GoogleEventsListResponse>();

        return result?.Items?.Select(item => new GoogleCalendarEventDto
        {
            Id = item.Id,
            Summary = item.Summary,
            Description = item.Description,
            Start = DateTime.Parse(item.Start?.DateTime ?? DateTime.UtcNow.ToString()),
            End = DateTime.Parse(item.End?.DateTime ?? DateTime.UtcNow.ToString())
        }).ToList() ?? new List<GoogleCalendarEventDto>();
    }

    #endregion

    #region Google Tasks

    public async Task<List<GoogleTaskListDto>> GetAvailableTaskListsAsync(Guid userId)
    {
        var config = await GetConfigOrThrowAsync(userId);
        var client = CreateAuthenticatedClient(config.AccessToken);

        var response = await client.GetAsync($"{GoogleTasksApiBase}/users/@me/lists");
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<GoogleTaskListsResponse>();

        return result?.Items?.Select(item => new GoogleTaskListDto
        {
            Id = item.Id,
            Title = item.Title,
            Updated = item.Updated.HasValue ? DateTime.Parse(item.Updated.Value.ToString()) : null
        }).ToList() ?? new List<GoogleTaskListDto>();
    }

    public async Task<GoogleTaskDto> CreateTaskAsync(Guid userId, GoogleTaskDto taskDto)
    {
        var config = await GetConfigOrThrowAsync(userId);
        var client = CreateAuthenticatedClient(config.AccessToken);

        var taskListId = taskDto.TaskListId ?? "@default";
        var requestBody = new
        {
            title = taskDto.Title,
            notes = taskDto.Notes,
            due = taskDto.Due?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
            status = taskDto.Status
        };

        var response = await client.PostAsJsonAsync(
            $"{GoogleTasksApiBase}/lists/{taskListId}/tasks",
            requestBody
        );
        response.EnsureSuccessStatusCode();

        var createdTask = await response.Content.ReadFromJsonAsync<GoogleTaskResponse>();

        // Criar mapeamento
        if (!string.IsNullOrEmpty(taskDto.ArcTaskId) && createdTask != null)
        {
            _syncMappings.Add(new SyncMappingDto
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ArcItemType = "task",
                ArcItemId = taskDto.ArcTaskId,
                GoogleItemType = "task",
                GoogleItemId = createdTask.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        _logger.LogInformation("Tarefa criada no Google Tasks: {TaskId}", createdTask?.Id);

        return new GoogleTaskDto
        {
            Id = createdTask?.Id,
            Title = createdTask?.Title ?? taskDto.Title,
            Notes = createdTask?.Notes,
            Status = createdTask?.Status ?? "needsAction"
        };
    }

    public async Task<GoogleTaskDto> UpdateTaskAsync(Guid userId, string taskId, GoogleTaskDto taskDto)
    {
        var config = await GetConfigOrThrowAsync(userId);
        var client = CreateAuthenticatedClient(config.AccessToken);

        var taskListId = taskDto.TaskListId ?? "@default";
        var requestBody = new
        {
            title = taskDto.Title,
            notes = taskDto.Notes,
            due = taskDto.Due?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
            status = taskDto.Status
        };

        var response = await client.PutAsJsonAsync(
            $"{GoogleTasksApiBase}/lists/{taskListId}/tasks/{taskId}",
            requestBody
        );
        response.EnsureSuccessStatusCode();

        _logger.LogInformation("Tarefa atualizada no Google Tasks: {TaskId}", taskId);

        return taskDto;
    }

    public async Task DeleteTaskAsync(Guid userId, string taskId, string taskListId)
    {
        var config = await GetConfigOrThrowAsync(userId);
        var client = CreateAuthenticatedClient(config.AccessToken);

        var response = await client.DeleteAsync(
            $"{GoogleTasksApiBase}/lists/{taskListId}/tasks/{taskId}"
        );
        response.EnsureSuccessStatusCode();

        // Remover mapeamento
        var mapping = _syncMappings.FirstOrDefault(m =>
            m.UserId == userId && m.GoogleItemId == taskId);
        if (mapping != null)
        {
            _syncMappings.Remove(mapping);
        }

        _logger.LogInformation("Tarefa deletada do Google Tasks: {TaskId}", taskId);
    }

    public async Task<List<GoogleTaskDto>> GetTasksAsync(Guid userId, string? taskListId = null)
    {
        var config = await GetConfigOrThrowAsync(userId);
        var client = CreateAuthenticatedClient(config.AccessToken);

        var listId = taskListId ?? "@default";
        var response = await client.GetAsync($"{GoogleTasksApiBase}/lists/{listId}/tasks");
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<GoogleTasksListResponse>();

        return result?.Items?.Select(item => new GoogleTaskDto
        {
            Id = item.Id,
            Title = item.Title,
            Notes = item.Notes,
            Status = item.Status,
            Due = item.Due.HasValue ? DateTime.Parse(item.Due.Value.ToString()) : null
        }).ToList() ?? new List<GoogleTaskDto>();
    }

    #endregion

    #region Sync

    public async Task<SyncStatusDto> SyncWithGoogleAsync(Guid userId)
    {
        var status = new SyncStatusDto
        {
            UserId = userId,
            Status = "syncing",
            LastSyncAt = DateTime.UtcNow
        };

        _syncStatuses[userId] = status;

        try
        {
            _logger.LogInformation("Iniciando sincronização para usuário {UserId}", userId);

            var config = await GetConfigOrThrowAsync(userId);
            int itemsSynced = 0;

            // Sincronizar calendário
            if (config.SyncCalendar)
            {
                var events = await GetCalendarEventsAsync(userId);
                itemsSynced += events.Count;
                // Aqui você implementaria a lógica para sincronizar com o banco de dados do Arc
            }

            // Sincronizar tarefas
            if (config.SyncTasks)
            {
                var tasks = await GetTasksAsync(userId);
                itemsSynced += tasks.Count;
                // Aqui você implementaria a lógica para sincronizar com o banco de dados do Arc
            }

            status.Status = "idle";
            status.ItemsSynced = itemsSynced;
            _syncStatuses[userId] = status;

            _logger.LogInformation("Sincronização concluída para usuário {UserId}. Items sincronizados: {Count}", userId, itemsSynced);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao sincronizar para usuário {UserId}", userId);
            status.Status = "error";
            status.ErrorMessage = ex.Message;
            _syncStatuses[userId] = status;
        }

        return status;
    }

    public Task<SyncStatusDto> GetSyncStatusAsync(Guid userId)
    {
        if (!_syncStatuses.TryGetValue(userId, out var status))
        {
            status = new SyncStatusDto
            {
                UserId = userId,
                Status = "idle"
            };
        }

        return Task.FromResult(status);
    }

    public Task HandleGoogleWebhookAsync(string channelId, string resourceId, string resourceState)
    {
        // Implementar lógica para processar notificações push do Google
        _logger.LogInformation("Webhook recebido: Channel={ChannelId}, Resource={ResourceId}, State={State}",
            channelId, resourceId, resourceState);

        // Aqui você dispararia uma sincronização para o usuário correspondente
        return Task.CompletedTask;
    }

    #endregion

    #region Helpers

    private HttpClient CreateAuthenticatedClient(string accessToken)
    {
        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        return client;
    }

    private async Task<GoogleIntegrationConfigDto> GetConfigOrThrowAsync(Guid userId)
    {
        var config = await GetIntegrationConfigAsync(userId);
        if (config == null)
        {
            throw new InvalidOperationException("Integração com Google não configurada para este usuário");
        }
        return config;
    }

    private async Task<bool> ValidateTokensAsync(string accessToken)
    {
        try
        {
            var client = CreateAuthenticatedClient(accessToken);
            var response = await client.GetAsync("https://www.googleapis.com/oauth2/v1/userinfo");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    #endregion

    #region Response Models

    private class GoogleCalendarListResponse
    {
        public List<GoogleCalendarItem>? Items { get; set; }
    }

    private class GoogleCalendarItem
    {
        public string Id { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? TimeZone { get; set; }
        public bool Primary { get; set; }
    }

    private class GoogleEventsListResponse
    {
        public List<GoogleEventResponse>? Items { get; set; }
    }

    private class GoogleEventResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string? Description { get; set; }
        public EventDateTime? Start { get; set; }
        public EventDateTime? End { get; set; }
    }

    private class EventDateTime
    {
        public string? DateTime { get; set; }
        public string? TimeZone { get; set; }
    }

    private class GoogleTaskListsResponse
    {
        public List<GoogleTaskListItem>? Items { get; set; }
    }

    private class GoogleTaskListItem
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public DateTime? Updated { get; set; }
    }

    private class GoogleTasksListResponse
    {
        public List<GoogleTaskResponse>? Items { get; set; }
    }

    private class GoogleTaskResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string Status { get; set; } = "needsAction";
        public DateTime? Due { get; set; }
    }

    #endregion
}
