using System.ComponentModel.DataAnnotations;
using Arc.Domain.Entities;

namespace Arc.Application.DTOs.Automation;

/// <summary>
/// DTO para criar uma nova automação
/// </summary>
public class CreateAutomationDto
{
    [Required]
    public Guid UserId { get; set; }

    public Guid? WorkspaceId { get; set; }

    [Required]
    [MaxLength(100)]
    public string AutomationType { get; set; } = string.Empty;

    public bool IsEnabled { get; set; } = false;

    /// <summary>
    /// Configurações específicas da automação em JSON
    /// </summary>
    public string? Settings { get; set; }
}

/// <summary>
/// DTO para atualizar uma automação existente
/// </summary>
public class UpdateAutomationDto
{
    public bool? IsEnabled { get; set; }

    /// <summary>
    /// Configurações específicas da automação em JSON
    /// </summary>
    public string? Settings { get; set; }
}

/// <summary>
/// DTO de resposta para automação
/// </summary>
public class AutomationDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? WorkspaceId { get; set; }
    public string AutomationType { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public string? Settings { get; set; }
    public DateTime? LastRunAt { get; set; }
    public DateTime? NextRunAt { get; set; }
    public int ItemsProcessed { get; set; }
    public string? ErrorMessage { get; set; }
    public AutomationStatus Status { get; set; }
    public string? Metadata { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// DTO para estatísticas de automação
/// </summary>
public class AutomationStatsDto
{
    public int TotalAutomations { get; set; }
    public int EnabledAutomations { get; set; }
    public int RunningAutomations { get; set; }
    public int FailedAutomations { get; set; }
    public int TotalItemsProcessed { get; set; }
    public DateTime? LastSuccessfulRun { get; set; }
    public List<AutomationTypeStatsDto> ByType { get; set; } = new();
}

/// <summary>
/// DTO para estatísticas por tipo de automação
/// </summary>
public class AutomationTypeStatsDto
{
    public string AutomationType { get; set; } = string.Empty;
    public int Count { get; set; }
    public int EnabledCount { get; set; }
    public int TotalItemsProcessed { get; set; }
}

/// <summary>
/// DTO para definição de automações disponíveis (catálogo)
/// </summary>
public class AutomationDefinitionDto
{
    public string Type { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // productivity, integration, workflow, etc.
    public bool RequiresIntegration { get; set; }
    public List<string>? RequiredIntegrations { get; set; }
    public List<AutomationSettingDefinitionDto> SettingsSchema { get; set; } = new();
    public bool IsAvailable { get; set; } = true;
}

/// <summary>
/// DTO para definição de uma configuração de automação
/// </summary>
public class AutomationSettingDefinitionDto
{
    public string Key { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // boolean, string, number, select, multiselect
    public bool Required { get; set; }
    public object? DefaultValue { get; set; }
    public List<AutomationSettingOptionDto>? Options { get; set; } // Para select/multiselect
}

/// <summary>
/// DTO para opções de configuração
/// </summary>
public class AutomationSettingOptionDto
{
    public string Value { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
}

/// <summary>
/// DTO específico para configuração da automação Tasks to Calendar
/// </summary>
public class TasksToCalendarSettingsDto
{
    /// <summary>
    /// IDs das páginas para incluir (null = todas)
    /// </summary>
    public List<Guid>? IncludePageIds { get; set; }

    /// <summary>
    /// Status de tarefas para incluir
    /// </summary>
    public List<string> TaskStatuses { get; set; } = new() { "todo", "in_progress" };

    /// <summary>
    /// Prioridades para incluir
    /// </summary>
    public List<string>? Priorities { get; set; }

    /// <summary>
    /// Sincronização em tempo real ou agendada
    /// </summary>
    public string SyncMode { get; set; } = "realtime"; // realtime | scheduled

    /// <summary>
    /// Intervalo de sincronização em minutos (se scheduled)
    /// </summary>
    public int? SyncIntervalMinutes { get; set; }

    /// <summary>
    /// Adicionar tarefas como eventos de dia inteiro
    /// </summary>
    public bool AddAsAllDayEvents { get; set; } = true;

    /// <summary>
    /// Categoria padrão para eventos criados
    /// </summary>
    public string DefaultCategory { get; set; } = "task";
}

/// <summary>
/// DTO para executar uma automação manualmente
/// </summary>
public class RunAutomationDto
{
    public Guid AutomationId { get; set; }

    /// <summary>
    /// Executar em modo de teste (não persiste alterações)
    /// </summary>
    public bool DryRun { get; set; } = false;
}

/// <summary>
/// DTO para resultado de execução de automação
/// </summary>
public class AutomationRunResultDto
{
    public Guid AutomationId { get; set; }
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public int ItemsProcessed { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime CompletedAt { get; set; }
    public TimeSpan Duration { get; set; }
    public List<string> Logs { get; set; } = new();
}
