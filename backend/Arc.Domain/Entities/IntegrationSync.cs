namespace Arc.Domain.Entities;

/// <summary>
/// Entidade para rastreamento de sincronizações de integrações externas
/// </summary>
public class IntegrationSync
{
    public Guid Id { get; set; }

    /// <summary>
    /// Usuário que possui a integração
    /// </summary>
    public Guid UserId { get; set; }
    public User? User { get; set; }

    /// <summary>
    /// Tipo de integração (Google, GitHub, Slack, etc.)
    /// </summary>
    public required string IntegrationType { get; set; }

    /// <summary>
    /// Recurso específico sendo sincronizado (Calendar, Drive, Issues, etc.)
    /// </summary>
    public required string ResourceType { get; set; }

    /// <summary>
    /// Status da sincronização
    /// </summary>
    public IntegrationSyncStatus Status { get; set; }

    /// <summary>
    /// Última sincronização bem-sucedida
    /// </summary>
    public DateTime? LastSyncAt { get; set; }

    /// <summary>
    /// Próxima sincronização agendada
    /// </summary>
    public DateTime? NextSyncAt { get; set; }

    /// <summary>
    /// Número de itens sincronizados na última execução
    /// </summary>
    public int ItemsSynced { get; set; }

    /// <summary>
    /// Mensagem de erro (se houver)
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Número de tentativas falhadas consecutivas
    /// </summary>
    public int FailureCount { get; set; }

    /// <summary>
    /// Metadados adicionais (JSON) - pode conter cursor de paginação, etc.
    /// </summary>
    public string? Metadata { get; set; }

    /// <summary>
    /// Quando a integração foi criada
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Última atualização
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Status da sincronização
/// </summary>
public enum IntegrationSyncStatus
{
    Pending,
    InProgress,
    Success,
    Failed,
    Paused,
    Cancelled
}
