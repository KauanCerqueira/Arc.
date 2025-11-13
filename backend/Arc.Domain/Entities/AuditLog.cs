namespace Arc.Domain.Entities;

/// <summary>
/// Entidade para logs de auditoria criptografados
/// Armazena todas as ações sensíveis no sistema para compliance e segurança
/// </summary>
public class AuditLog
{
    public Guid Id { get; set; }

    /// <summary>
    /// ID do usuário que executou a ação
    /// </summary>
    public Guid? UserId { get; set; }

    /// <summary>
    /// Usuário associado (se existir)
    /// </summary>
    public User? User { get; set; }

    /// <summary>
    /// Tipo de ação executada (Login, Logout, DataAccess, DataModification, etc.)
    /// </summary>
    public required string Action { get; set; }

    /// <summary>
    /// Entidade afetada (User, Workspace, Integration, etc.)
    /// </summary>
    public string? EntityType { get; set; }

    /// <summary>
    /// ID da entidade afetada
    /// </summary>
    public string? EntityId { get; set; }

    /// <summary>
    /// Detalhes da ação (CRIPTOGRAFADO)
    /// Formato: {keyId}:{nonce}:{ciphertext}:{tag}
    /// </summary>
    public string? EncryptedDetails { get; set; }

    /// <summary>
    /// IP do usuário
    /// </summary>
    public string? IpAddress { get; set; }

    /// <summary>
    /// User Agent do navegador/cliente
    /// </summary>
    public string? UserAgent { get; set; }

    /// <summary>
    /// Resultado da ação (Success, Failure, Unauthorized, etc.)
    /// </summary>
    public required string Result { get; set; }

    /// <summary>
    /// Mensagem de erro (se houver)
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Timestamp da ação
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Severidade do log (Info, Warning, Error, Critical)
    /// </summary>
    public string Severity { get; set; } = "Info";

    /// <summary>
    /// Categoria do log para filtros (Authentication, Authorization, DataAccess, Integration, etc.)
    /// </summary>
    public string? Category { get; set; }
}
