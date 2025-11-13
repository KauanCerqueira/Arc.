namespace Arc.Domain.Entities;

/// <summary>
/// Entidade para armazenar configurações de automações do usuário
/// </summary>
public class AutomationConfiguration
{
    public Guid Id { get; set; }

    /// <summary>
    /// Usuário proprietário da automação
    /// </summary>
    public Guid UserId { get; set; }
    public User? User { get; set; }

    /// <summary>
    /// Workspace onde a automação está ativa (null = global para o usuário)
    /// </summary>
    public Guid? WorkspaceId { get; set; }
    public Workspace? Workspace { get; set; }

    /// <summary>
    /// Tipo de automação (tasks-to-calendar, github-to-tasks, etc.)
    /// </summary>
    public required string AutomationType { get; set; }

    /// <summary>
    /// Se a automação está ativada
    /// </summary>
    public bool IsEnabled { get; set; } = false;

    /// <summary>
    /// Configurações específicas da automação em formato JSON
    /// Exemplo para tasks-to-calendar:
    /// {
    ///   "includePages": ["page-id-1", "page-id-2"],
    ///   "taskStatuses": ["todo", "in_progress"],
    ///   "priority": ["high", "medium"],
    ///   "syncInterval": "realtime"
    /// }
    /// </summary>
    public string? Settings { get; set; }

    /// <summary>
    /// Última vez que a automação foi executada
    /// </summary>
    public DateTime? LastRunAt { get; set; }

    /// <summary>
    /// Próxima execução agendada (para automações com intervalo)
    /// </summary>
    public DateTime? NextRunAt { get; set; }

    /// <summary>
    /// Número de itens processados na última execução
    /// </summary>
    public int ItemsProcessed { get; set; }

    /// <summary>
    /// Mensagem de erro (se houver)
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Status da última execução
    /// </summary>
    public AutomationStatus Status { get; set; } = AutomationStatus.Idle;

    /// <summary>
    /// Metadados adicionais (JSON)
    /// </summary>
    public string? Metadata { get; set; }

    /// <summary>
    /// Quando a configuração foi criada
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Última atualização da configuração
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Status da automação
/// </summary>
public enum AutomationStatus
{
    /// <summary>
    /// Automação está ociosa, aguardando próxima execução
    /// </summary>
    Idle,

    /// <summary>
    /// Automação está sendo executada
    /// </summary>
    Running,

    /// <summary>
    /// Última execução foi bem-sucedida
    /// </summary>
    Success,

    /// <summary>
    /// Última execução falhou
    /// </summary>
    Failed,

    /// <summary>
    /// Automação está pausada pelo usuário
    /// </summary>
    Paused
}
