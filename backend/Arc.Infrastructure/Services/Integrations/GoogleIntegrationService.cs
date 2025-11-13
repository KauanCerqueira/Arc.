using Arc.Application.Interfaces;
using Arc.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace Arc.Infrastructure.Services.Integrations;

/// <summary>
/// Serviço de integração com Google Workspace (OAuth 2.0 + criptografia)
/// </summary>
public class GoogleIntegrationService : IExternalIntegrationService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GoogleIntegrationService> _logger;
    private readonly IIntegrationTokenService _tokenService;
    private readonly IIntegrationSyncService _syncService;
    private readonly IAuditLogService _auditLog;

    private const string GoogleOAuthTokenUrl = "https://oauth2.googleapis.com/token";
    private const string GoogleCalendarApiBase = "https://www.googleapis.com/calendar/v3";
    private const string GoogleTasksApiBase = "https://www.googleapis.com/tasks/v1";
    private const string GoogleUserInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";

    public string IntegrationType => "Google";

    public GoogleIntegrationService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<GoogleIntegrationService> logger,
        IIntegrationTokenService tokenService,
        IIntegrationSyncService syncService,
        IAuditLogService auditLog)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
        _tokenService = tokenService;
        _syncService = syncService;
        _auditLog = auditLog;
    }

    #region IExternalIntegrationService Implementation

    public async Task<IntegrationToken> AuthorizeAsync(Guid userId, string authorizationCode, string redirectUri)
    {
        _logger.LogInformation("Iniciando autorização Google para usuário {UserId}", userId);

        try
        {
            var clientId = _configuration["OAuth:Google:ClientId"];
            var clientSecret = _configuration["OAuth:Google:ClientSecret"];

            var client = _httpClientFactory.CreateClient();
            var requestBody = new Dictionary<string, string>
            {
                { "code", authorizationCode },
                { "client_id", clientId! },
                { "client_secret", clientSecret! },
                { "redirect_uri", redirectUri },
                { "grant_type", "authorization_code" }
            };

            var response = await client.PostAsync(GoogleOAuthTokenUrl, new FormUrlEncodedContent(requestBody));
            response.EnsureSuccessStatusCode();

            var tokenResponse = await response.Content.ReadFromJsonAsync<GoogleTokenResponse>();
            if (tokenResponse == null)
            {
                throw new InvalidOperationException("Resposta de token inválida do Google");
            }

            // Obter informações do usuário
            var userInfoClient = CreateAuthenticatedClient(tokenResponse.AccessToken);
            var userInfoResponse = await userInfoClient.GetAsync(GoogleUserInfoUrl);
            userInfoResponse.EnsureSuccessStatusCode();
            var userInfo = await userInfoResponse.Content.ReadFromJsonAsync<GoogleUserInfo>();

            // Criptografar tokens
            var encryptedAccessToken = _tokenService.EncryptAccessToken(tokenResponse.AccessToken);
            var encryptedRefreshToken = tokenResponse.RefreshToken != null
                ? _tokenService.EncryptRefreshToken(tokenResponse.RefreshToken)
                : null;

            // Revogar tokens antigos
            await RevokeAsync(userId);

            // Criar novo token
            var token = new IntegrationToken
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                IntegrationType = IntegrationType,
                EncryptedAccessToken = encryptedAccessToken,
                EncryptedRefreshToken = encryptedRefreshToken,
                Scopes = string.Join(",", _configuration.GetSection("OAuth:Google:Scopes").Get<string[]>() ?? Array.Empty<string>()),
                ExpiresAt = DateTime.UtcNow.AddSeconds(tokenResponse.ExpiresIn),
                ExternalUserId = userInfo?.Id,
                ExternalEmail = userInfo?.Email,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _tokenService.SaveTokenAsync(token);

            await _auditLog.LogAsync(
                userId: userId,
                action: "GoogleIntegrationAuthorized",
                details: $"Email: {userInfo?.Email}",
                result: "Success",
                category: "Integration",
                severity: "Info"
            );

            _logger.LogInformation("Autorização Google concluída para {Email}", userInfo?.Email);

            return token;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao autorizar integração Google");
            await _auditLog.LogAsync(
                userId: userId,
                action: "GoogleIntegrationAuthorizationFailed",
                details: ex.Message,
                result: "Failed",
                category: "Integration",
                severity: "Error"
            );
            throw;
        }
    }

    public async Task<bool> RevokeAsync(Guid userId)
    {
        _logger.LogInformation("Revogando integração Google para usuário {UserId}", userId);

        var result = await _tokenService.RevokeTokenAsync(userId, IntegrationType);

        if (result)
        {
            await _auditLog.LogAsync(
                userId: userId,
                action: "GoogleIntegrationRevoked",
                details: "Integração revogada com sucesso",
                result: "Success",
                category: "Integration",
                severity: "Info"
            );
        }

        return result;
    }

    public async Task<bool> IsAuthorizedAsync(Guid userId)
    {
        var token = await _tokenService.GetTokenAsync(userId, IntegrationType);
        if (token == null || !token.IsActive)
        {
            return false;
        }

        var isExpired = await _tokenService.IsTokenExpiredAsync(token);
        return !isExpired || token.EncryptedRefreshToken != null;
    }

    public async Task<string> GetValidAccessTokenAsync(Guid userId)
    {
        var token = await _tokenService.GetTokenAsync(userId, IntegrationType);
        if (token == null)
        {
            throw new InvalidOperationException("Nenhuma integração Google ativa encontrada");
        }

        var isExpired = await _tokenService.IsTokenExpiredAsync(token);

        if (!isExpired)
        {
            // Token ainda válido, atualizar LastUsedAt
            token.LastUsedAt = DateTime.UtcNow;
            await _tokenService.UpdateTokenAsync(token);
            return _tokenService.DecryptAccessToken(token.EncryptedAccessToken);
        }

        // Token expirado, fazer refresh
        if (string.IsNullOrEmpty(token.EncryptedRefreshToken))
        {
            throw new InvalidOperationException("Token expirado e sem refresh token disponível");
        }

        _logger.LogInformation("Renovando access token Google para usuário {UserId}", userId);

        var refreshToken = _tokenService.DecryptRefreshToken(token.EncryptedRefreshToken);
        var newAccessToken = await RefreshAccessTokenAsync(refreshToken);

        // Atualizar token no banco
        token.EncryptedAccessToken = _tokenService.EncryptAccessToken(newAccessToken.AccessToken);
        token.ExpiresAt = DateTime.UtcNow.AddSeconds(newAccessToken.ExpiresIn);
        token.UpdatedAt = DateTime.UtcNow;
        token.LastUsedAt = DateTime.UtcNow;

        await _tokenService.UpdateTokenAsync(token);

        return newAccessToken.AccessToken;
    }

    public async Task<IntegrationSync> SyncAsync(Guid userId, string resourceType, CancellationToken cancellationToken = default)
    {
        var sync = await _syncService.CreateSyncAsync(userId, IntegrationType, resourceType);

        try
        {
            sync.Status = IntegrationSyncStatus.InProgress;
            await _syncService.UpdateSyncAsync(sync);

            var accessToken = await GetValidAccessTokenAsync(userId);
            int itemsSynced = 0;

            switch (resourceType.ToLower())
            {
                case "calendar":
                    itemsSynced = await SyncCalendarAsync(userId, accessToken, cancellationToken);
                    break;
                case "tasks":
                    itemsSynced = await SyncTasksAsync(userId, accessToken, cancellationToken);
                    break;
                default:
                    throw new ArgumentException($"Tipo de recurso não suportado: {resourceType}");
            }

            sync.Status = IntegrationSyncStatus.Success;
            sync.LastSyncAt = DateTime.UtcNow;
            sync.ItemsSynced = itemsSynced;
            sync.FailureCount = 0;
            sync.ErrorMessage = null;

            await _syncService.UpdateSyncAsync(sync);

            _logger.LogInformation("Sincronização Google {Resource} concluída: {Count} items", resourceType, itemsSynced);

            return sync;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao sincronizar {Resource}", resourceType);

            sync.Status = IntegrationSyncStatus.Failed;
            sync.ErrorMessage = ex.Message;
            sync.FailureCount++;

            await _syncService.UpdateSyncAsync(sync);

            throw;
        }
    }

    public async Task<IntegrationSync?> GetLastSyncStatusAsync(Guid userId, string resourceType)
    {
        return await _syncService.GetLastSyncAsync(userId, IntegrationType, resourceType);
    }

    public async Task<List<string>> GetAvailableResourcesAsync(Guid userId)
    {
        // Recursos disponíveis na integração Google
        return await Task.FromResult(new List<string>
        {
            "calendar",
            "tasks",
            "drive",
            "contacts"
        });
    }

    #endregion

    #region Private Helpers

    private HttpClient CreateAuthenticatedClient(string accessToken)
    {
        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        return client;
    }

    private async Task<GoogleTokenResponse> RefreshAccessTokenAsync(string refreshToken)
    {
        var clientId = _configuration["OAuth:Google:ClientId"];
        var clientSecret = _configuration["OAuth:Google:ClientSecret"];

        var client = _httpClientFactory.CreateClient();
        var requestBody = new Dictionary<string, string>
        {
            { "refresh_token", refreshToken },
            { "client_id", clientId! },
            { "client_secret", clientSecret! },
            { "grant_type", "refresh_token" }
        };

        var response = await client.PostAsync(GoogleOAuthTokenUrl, new FormUrlEncodedContent(requestBody));
        response.EnsureSuccessStatusCode();

        var tokenResponse = await response.Content.ReadFromJsonAsync<GoogleTokenResponse>();
        if (tokenResponse == null)
        {
            throw new InvalidOperationException("Falha ao renovar access token");
        }

        return tokenResponse;
    }

    private async Task<int> SyncCalendarAsync(Guid userId, string accessToken, CancellationToken cancellationToken)
    {
        var client = CreateAuthenticatedClient(accessToken);

        var start = DateTime.UtcNow.AddMonths(-1).ToString("yyyy-MM-ddTHH:mm:ssZ");
        var end = DateTime.UtcNow.AddMonths(1).ToString("yyyy-MM-ddTHH:mm:ssZ");

        var response = await client.GetAsync(
            $"{GoogleCalendarApiBase}/calendars/primary/events?timeMin={start}&timeMax={end}&singleEvents=true&orderBy=startTime",
            cancellationToken
        );
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<GoogleEventsListResponse>(cancellationToken: cancellationToken);

        // Aqui você implementaria a lógica para salvar eventos no banco
        return result?.Items?.Count ?? 0;
    }

    private async Task<int> SyncTasksAsync(Guid userId, string accessToken, CancellationToken cancellationToken)
    {
        var client = CreateAuthenticatedClient(accessToken);

        var response = await client.GetAsync($"{GoogleTasksApiBase}/users/@me/lists/@default/tasks", cancellationToken);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<GoogleTasksListResponse>(cancellationToken: cancellationToken);

        // Aqui você implementaria a lógica para salvar tarefas no banco
        return result?.Items?.Count ?? 0;
    }

    #endregion

    #region Response Models

    private class GoogleTokenResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public int ExpiresIn { get; set; }
        public string? RefreshToken { get; set; }
        public string? Scope { get; set; }
        public string? TokenType { get; set; }
    }

    private class GoogleUserInfo
    {
        public string? Id { get; set; }
        public string? Email { get; set; }
        public bool? VerifiedEmail { get; set; }
        public string? Name { get; set; }
        public string? Picture { get; set; }
    }

    private class GoogleEventsListResponse
    {
        public List<GoogleEventItem>? Items { get; set; }
    }

    private class GoogleEventItem
    {
        public string Id { get; set; } = string.Empty;
        public string? Summary { get; set; }
    }

    private class GoogleTasksListResponse
    {
        public List<GoogleTaskItem>? Items { get; set; }
    }

    private class GoogleTaskItem
    {
        public string Id { get; set; } = string.Empty;
        public string? Title { get; set; }
    }

    #endregion
}
