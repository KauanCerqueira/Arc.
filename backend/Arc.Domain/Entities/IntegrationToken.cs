namespace Arc.Domain.Entities;

/// <summary>
/// Entidade para armazenar tokens de integração OAuth criptografados
/// </summary>
public class IntegrationToken
{
    public Guid Id { get; set; }

    /// <summary>
    /// Usuário proprietário do token
    /// </summary>
    public Guid UserId { get; set; }
    public User? User { get; set; }

    /// <summary>
    /// Tipo de integração (Google, GitHub, etc.)
    /// </summary>
    public required string IntegrationType { get; set; }

    /// <summary>
    /// Access Token criptografado (AES-256-GCM)
    /// Formato: {keyId}:{nonce}:{ciphertext}:{tag}
    /// </summary>
    public required string EncryptedAccessToken { get; set; }

    /// <summary>
    /// Refresh Token criptografado (AES-256-GCM)
    /// </summary>
    public string? EncryptedRefreshToken { get; set; }

    /// <summary>
    /// Escopos/permissões concedidas
    /// </summary>
    public string? Scopes { get; set; }

    /// <summary>
    /// Quando o access token expira
    /// </summary>
    public DateTime? ExpiresAt { get; set; }

    /// <summary>
    /// Identificador externo do usuário na plataforma
    /// </summary>
    public string? ExternalUserId { get; set; }

    /// <summary>
    /// Email do usuário na plataforma externa
    /// </summary>
    public string? ExternalEmail { get; set; }

    /// <summary>
    /// Se a integração está ativa
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Quando o token foi criado
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Última atualização do token
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Último uso do token
    /// </summary>
    public DateTime? LastUsedAt { get; set; }

    /// <summary>
    /// Quando o token foi revogado (se aplicável)
    /// </summary>
    public DateTime? RevokedAt { get; set; }
}
