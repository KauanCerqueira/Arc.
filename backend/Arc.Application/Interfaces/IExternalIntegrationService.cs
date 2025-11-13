using Arc.Domain.Entities;

namespace Arc.Application.Interfaces;

/// <summary>
/// Interface genérica para serviços de integração externa
/// Permite adicionar novas integrações (Slack, Notion, etc.) facilmente
/// </summary>
public interface IExternalIntegrationService
{
    /// <summary>
    /// Tipo de integração (Google, GitHub, Slack, etc.)
    /// </summary>
    string IntegrationType { get; }

    /// <summary>
    /// Autoriza a integração e armazena tokens criptografados
    /// </summary>
    Task<IntegrationToken> AuthorizeAsync(Guid userId, string authorizationCode, string redirectUri);

    /// <summary>
    /// Revoga a integração e remove tokens
    /// </summary>
    Task<bool> RevokeAsync(Guid userId);

    /// <summary>
    /// Verifica se o usuário tem integração ativa
    /// </summary>
    Task<bool> IsAuthorizedAsync(Guid userId);

    /// <summary>
    /// Obtém token de acesso válido (refresh automático se necessário)
    /// </summary>
    Task<string> GetValidAccessTokenAsync(Guid userId);

    /// <summary>
    /// Executa sincronização de dados
    /// </summary>
    Task<IntegrationSync> SyncAsync(Guid userId, string resourceType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Obtém status da última sincronização
    /// </summary>
    Task<IntegrationSync?> GetLastSyncStatusAsync(Guid userId, string resourceType);

    /// <summary>
    /// Lista recursos disponíveis para sincronização
    /// </summary>
    Task<List<string>> GetAvailableResourcesAsync(Guid userId);
}

/// <summary>
/// Interface para gerenciamento de tokens de integração
/// </summary>
public interface IIntegrationTokenService
{
    Task<IntegrationToken?> GetTokenAsync(Guid userId, string integrationType);
    Task<IntegrationToken> SaveTokenAsync(IntegrationToken token);
    Task<bool> UpdateTokenAsync(IntegrationToken token);
    Task<bool> RevokeTokenAsync(Guid userId, string integrationType);
    Task<List<IntegrationToken>> GetUserTokensAsync(Guid userId);
    Task<bool> IsTokenExpiredAsync(IntegrationToken token);

    // Encryption/Decryption methods
    string EncryptAccessToken(string accessToken);
    string DecryptAccessToken(string encryptedAccessToken);
    string EncryptRefreshToken(string refreshToken);
    string DecryptRefreshToken(string encryptedRefreshToken);
}

/// <summary>
/// Interface para gerenciamento de sincronizações
/// </summary>
public interface IIntegrationSyncService
{
    Task<IntegrationSync> CreateSyncAsync(Guid userId, string integrationType, string resourceType);
    Task<IntegrationSync> UpdateSyncAsync(IntegrationSync sync);
    Task<IntegrationSync?> GetLastSyncAsync(Guid userId, string integrationType, string resourceType);
    Task<List<IntegrationSync>> GetUserSyncsAsync(Guid userId);
    Task<List<IntegrationSync>> GetPendingSyncsAsync();
}
