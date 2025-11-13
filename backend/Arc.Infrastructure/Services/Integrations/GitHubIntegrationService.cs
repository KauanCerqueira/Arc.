using Arc.Application.Interfaces;
using Arc.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace Arc.Infrastructure.Services.Integrations;

/// <summary>
/// Serviço de integração com GitHub (OAuth 2.0 + criptografia)
/// </summary>
public class GitHubIntegrationService : IExternalIntegrationService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GitHubIntegrationService> _logger;
    private readonly IIntegrationTokenService _tokenService;
    private readonly IIntegrationSyncService _syncService;
    private readonly IAuditLogService _auditLog;

    private const string GitHubOAuthTokenUrl = "https://github.com/login/oauth/access_token";
    private const string GitHubApiBase = "https://api.github.com";

    public string IntegrationType => "GitHub";

    public GitHubIntegrationService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<GitHubIntegrationService> logger,
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
        _logger.LogInformation("Iniciando autorização GitHub para usuário {UserId}", userId);

        try
        {
            var clientId = _configuration["OAuth:GitHub:ClientId"];
            var clientSecret = _configuration["OAuth:GitHub:ClientSecret"];

            var client = _httpClientFactory.CreateClient();
            var requestBody = new Dictionary<string, string>
            {
                { "client_id", clientId! },
                { "client_secret", clientSecret! },
                { "code", authorizationCode },
                { "redirect_uri", redirectUri }
            };

            var request = new HttpRequestMessage(HttpMethod.Post, GitHubOAuthTokenUrl)
            {
                Content = new FormUrlEncodedContent(requestBody)
            };
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var response = await client.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var tokenResponse = await response.Content.ReadFromJsonAsync<GitHubTokenResponse>();
            if (tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
            {
                throw new InvalidOperationException("Resposta de token inválida do GitHub");
            }

            // Obter informações do usuário
            var userInfoClient = CreateAuthenticatedClient(tokenResponse.AccessToken);
            var userInfoResponse = await userInfoClient.GetAsync($"{GitHubApiBase}/user");
            userInfoResponse.EnsureSuccessStatusCode();
            var userInfo = await userInfoResponse.Content.ReadFromJsonAsync<GitHubUserInfo>();

            // Criptografar token
            var encryptedAccessToken = _tokenService.EncryptAccessToken(tokenResponse.AccessToken);

            // Revogar tokens antigos
            await RevokeAsync(userId);

            // Criar novo token (GitHub não usa refresh tokens)
            var token = new IntegrationToken
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                IntegrationType = IntegrationType,
                EncryptedAccessToken = encryptedAccessToken,
                EncryptedRefreshToken = null, // GitHub não fornece refresh tokens
                Scopes = tokenResponse.Scope,
                ExpiresAt = null, // GitHub tokens não expiram automaticamente
                ExternalUserId = userInfo?.Id.ToString(),
                ExternalEmail = userInfo?.Email,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _tokenService.SaveTokenAsync(token);

            await _auditLog.LogAsync(
                userId: userId,
                action: "GitHubIntegrationAuthorized",
                details: $"Login: {userInfo?.Login}, Email: {userInfo?.Email}",
                result: "Success",
                category: "Integration",
                severity: "Info"
            );

            _logger.LogInformation("Autorização GitHub concluída para {Login}", userInfo?.Login);

            return token;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao autorizar integração GitHub");
            await _auditLog.LogAsync(
                userId: userId,
                action: "GitHubIntegrationAuthorizationFailed",
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
        _logger.LogInformation("Revogando integração GitHub para usuário {UserId}", userId);

        var result = await _tokenService.RevokeTokenAsync(userId, IntegrationType);

        if (result)
        {
            await _auditLog.LogAsync(
                userId: userId,
                action: "GitHubIntegrationRevoked",
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
        return token != null && token.IsActive;
    }

    public async Task<string> GetValidAccessTokenAsync(Guid userId)
    {
        var token = await _tokenService.GetTokenAsync(userId, IntegrationType);
        if (token == null || !token.IsActive)
        {
            throw new InvalidOperationException("Nenhuma integração GitHub ativa encontrada");
        }

        // GitHub tokens não expiram automaticamente, então apenas descriptografar e retornar
        token.LastUsedAt = DateTime.UtcNow;
        await _tokenService.UpdateTokenAsync(token);

        return _tokenService.DecryptAccessToken(token.EncryptedAccessToken);
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
                case "issues":
                    itemsSynced = await SyncIssuesAsync(userId, accessToken, cancellationToken);
                    break;
                case "pull_requests":
                    itemsSynced = await SyncPullRequestsAsync(userId, accessToken, cancellationToken);
                    break;
                case "repositories":
                    itemsSynced = await SyncRepositoriesAsync(userId, accessToken, cancellationToken);
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

            _logger.LogInformation("Sincronização GitHub {Resource} concluída: {Count} items", resourceType, itemsSynced);

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
        // Recursos disponíveis na integração GitHub
        return await Task.FromResult(new List<string>
        {
            "repositories",
            "issues",
            "pull_requests",
            "commits",
            "branches"
        });
    }

    #endregion

    #region Private Helpers

    private HttpClient CreateAuthenticatedClient(string accessToken)
    {
        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        client.DefaultRequestHeaders.UserAgent.ParseAdd("Arc-Projectly/1.0");
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.github.v3+json"));
        return client;
    }

    private async Task<int> SyncIssuesAsync(Guid userId, string accessToken, CancellationToken cancellationToken)
    {
        var client = CreateAuthenticatedClient(accessToken);

        // Obter repositórios do usuário
        var reposResponse = await client.GetAsync($"{GitHubApiBase}/user/repos?per_page=50", cancellationToken);
        reposResponse.EnsureSuccessStatusCode();

        var repos = await reposResponse.Content.ReadFromJsonAsync<List<GitHubRepoResponse>>(cancellationToken: cancellationToken);
        if (repos == null) return 0;

        int totalIssues = 0;

        // Para cada repositório, buscar issues (limitado aos 10 primeiros repos para performance)
        foreach (var repo in repos.Take(10))
        {
            var issuesResponse = await client.GetAsync(
                $"{GitHubApiBase}/repos/{repo.FullName}/issues?state=open&per_page=100",
                cancellationToken
            );

            if (issuesResponse.IsSuccessStatusCode)
            {
                var issues = await issuesResponse.Content.ReadFromJsonAsync<List<GitHubIssueResponse>>(cancellationToken: cancellationToken);
                totalIssues += issues?.Count ?? 0;
            }
        }

        return totalIssues;
    }

    private async Task<int> SyncPullRequestsAsync(Guid userId, string accessToken, CancellationToken cancellationToken)
    {
        var client = CreateAuthenticatedClient(accessToken);

        // Obter repositórios do usuário
        var reposResponse = await client.GetAsync($"{GitHubApiBase}/user/repos?per_page=50", cancellationToken);
        reposResponse.EnsureSuccessStatusCode();

        var repos = await reposResponse.Content.ReadFromJsonAsync<List<GitHubRepoResponse>>(cancellationToken: cancellationToken);
        if (repos == null) return 0;

        int totalPRs = 0;

        // Para cada repositório, buscar PRs (limitado aos 10 primeiros repos para performance)
        foreach (var repo in repos.Take(10))
        {
            var prsResponse = await client.GetAsync(
                $"{GitHubApiBase}/repos/{repo.FullName}/pulls?state=open&per_page=100",
                cancellationToken
            );

            if (prsResponse.IsSuccessStatusCode)
            {
                var prs = await prsResponse.Content.ReadFromJsonAsync<List<GitHubPRResponse>>(cancellationToken: cancellationToken);
                totalPRs += prs?.Count ?? 0;
            }
        }

        return totalPRs;
    }

    private async Task<int> SyncRepositoriesAsync(Guid userId, string accessToken, CancellationToken cancellationToken)
    {
        var client = CreateAuthenticatedClient(accessToken);

        var response = await client.GetAsync($"{GitHubApiBase}/user/repos?per_page=100", cancellationToken);
        response.EnsureSuccessStatusCode();

        var repos = await response.Content.ReadFromJsonAsync<List<GitHubRepoResponse>>(cancellationToken: cancellationToken);

        // Aqui você implementaria a lógica para salvar repositórios no banco
        return repos?.Count ?? 0;
    }

    #endregion

    #region Response Models

    private class GitHubTokenResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public string? Scope { get; set; }
        public string? TokenType { get; set; }
    }

    private class GitHubUserInfo
    {
        public long Id { get; set; }
        public string Login { get; set; } = string.Empty;
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? AvatarUrl { get; set; }
    }

    private class GitHubRepoResponse
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
    }

    private class GitHubIssueResponse
    {
        public long Id { get; set; }
        public int Number { get; set; }
        public string Title { get; set; } = string.Empty;
    }

    private class GitHubPRResponse
    {
        public long Id { get; set; }
        public int Number { get; set; }
        public string Title { get; set; } = string.Empty;
    }

    #endregion
}
