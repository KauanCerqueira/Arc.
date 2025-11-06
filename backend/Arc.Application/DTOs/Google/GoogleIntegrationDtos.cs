using System.ComponentModel.DataAnnotations;

namespace Arc.Application.DTOs.Google;

// DTOs para Google Calendar
public class GoogleCalendarEventDto
{
    public string? Id { get; set; }
    public string Summary { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Location { get; set; }
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
    public List<string>? Attendees { get; set; }
    public string? CalendarId { get; set; }
    public string? ArcPageId { get; set; } // ID da página no Arc que criou o evento
    public string? ArcEventId { get; set; } // ID do evento no Arc
}

// DTOs para Google Tasks
public class GoogleTaskDto
{
    public string? Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime? Due { get; set; }
    public string Status { get; set; } = "needsAction"; // needsAction | completed
    public string? TaskListId { get; set; }
    public string? ArcPageId { get; set; } // ID da página no Arc que criou a tarefa
    public string? ArcTaskId { get; set; } // ID da tarefa no Arc
}

// DTO para configurar integração
public class GoogleIntegrationConfigDto
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    public string AccessToken { get; set; } = string.Empty;

    public string? RefreshToken { get; set; }

    public DateTime? TokenExpiresAt { get; set; }

    // Configurações de sincronização
    public bool SyncCalendar { get; set; } = true;
    public bool SyncTasks { get; set; } = true;
    public bool AutoSync { get; set; } = true; // Sincronização automática
    public int SyncIntervalMinutes { get; set; } = 15; // Intervalo de sincronização

    // Calendários selecionados para sincronização
    public List<string>? SelectedCalendarIds { get; set; }

    // Task lists selecionadas para sincronização
    public List<string>? SelectedTaskListIds { get; set; }
}

// DTO para status de sincronização
public class SyncStatusDto
{
    public Guid UserId { get; set; }
    public DateTime? LastSyncAt { get; set; }
    public string Status { get; set; } = "idle"; // idle | syncing | error
    public string? ErrorMessage { get; set; }
    public int ItemsSynced { get; set; }
}

// DTO para mapear items entre Arc e Google
public class SyncMappingDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string ArcItemType { get; set; } = string.Empty; // calendar | task
    public string ArcItemId { get; set; } = string.Empty;
    public string GoogleItemType { get; set; } = string.Empty; // event | task
    public string GoogleItemId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

// DTO para listar calendários disponíveis
public class GoogleCalendarListDto
{
    public string Id { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? TimeZone { get; set; }
    public bool Primary { get; set; }
}

// DTO para listar task lists disponíveis
public class GoogleTaskListDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public DateTime? Updated { get; set; }
}
