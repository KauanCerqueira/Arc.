using Arc.Application.DTOs.GitHub;
using Arc.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace Arc.Application.Services;

public class GitHubIntegrationService : IGitHubIntegrationService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GitHubIntegrationService> _logger;
    private const string GitHubApiBase = "https://api.github.com";

    // Armazenamento temporário (substitua por banco de dados)
    private static readonly Dictionary<Guid, GitHubIntegrationConfigDto> _integrationConfigs = new();
    private static readonly Dictionary<Guid, GitHubSyncStatusDto> _syncStatuses = new();

    public GitHubIntegrationService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<GitHubIntegrationService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    #region Configuration

    public async Task<GitHubIntegrationConfigDto> ConfigureIntegrationAsync(GitHubIntegrationConfigDto config)
    {
        _logger.LogInformation("Configurando integração GitHub para usuário {UserId}", config.UserId);

        // Validar token
        var isValid = await ValidateTokenAsync(config.AccessToken);
        if (!isValid)
        {
            throw new InvalidOperationException("Token de acesso GitHub inválido");
        }

        _integrationConfigs[config.UserId] = config;
        return config;
    }

    public Task<GitHubIntegrationConfigDto?> GetIntegrationConfigAsync(Guid userId)
    {
        _integrationConfigs.TryGetValue(userId, out var config);
        return Task.FromResult(config);
    }

    public Task DisableIntegrationAsync(Guid userId)
    {
        _integrationConfigs.Remove(userId);
        _syncStatuses.Remove(userId);
        _logger.LogInformation("Integração GitHub desabilitada para usuário {UserId}", userId);
        return Task.CompletedTask;
    }

    #endregion

    #region Repositories

    public async Task<List<GitHubRepositoryDto>> GetUserRepositoriesAsync(Guid userId)
    {
        var config = await GetConfigOrThrowAsync(userId);
        var client = CreateAuthenticatedClient(config.AccessToken);

        var response = await client.GetAsync($"{GitHubApiBase}/user/repos?sort=updated&per_page=100");
        response.EnsureSuccessStatusCode();

        var repos = await response.Content.ReadFromJsonAsync<List<GitHubRepoResponse>>();

        return repos?.Select(r => new GitHubRepositoryDto
        {
            Id = r.Id,
            Name = r.Name,
            FullName = r.FullName,
            Description = r.Description,
            HtmlUrl = r.HtmlUrl,
            Private = r.Private,
            Language = r.Language,
            StargazersCount = r.StargazersCount,
            ForksCount = r.ForksCount,
            OpenIssuesCount = r.OpenIssuesCount,
            CreatedAt = r.CreatedAt,
            UpdatedAt = r.UpdatedAt
        }).ToList() ?? new List<GitHubRepositoryDto>();
    }

    public async Task<GitHubRepositoryDto> GetRepositoryAsync(Guid userId, string owner, string repo)
    {
        var config = await GetConfigOrThrowAsync(userId);
        var client = CreateAuthenticatedClient(config.AccessToken);

        var response = await client.GetAsync($"{GitHubApiBase}/repos/{owner}/{repo}");
        response.EnsureSuccessStatusCode();

        var r = await response.Content.ReadFromJsonAsync<GitHubRepoResponse>();

        return new GitHubRepositoryDto
        {
            Id = r!.Id,
            Name = r.Name,
            FullName = r.FullName,
            Description = r.Description,
            HtmlUrl = r.HtmlUrl,
            Private = r.Private,
            Language = r.Language,
            StargazersCount = r.StargazersCount,
            ForksCount = r.ForksCount,
            OpenIssuesCount = r.OpenIssuesCount,
            CreatedAt = r.CreatedAt,
            UpdatedAt = r.UpdatedAt
        };
    }

    #endregion

    #region Issues

    public async Task<List<GitHubIssueDto>> GetRepositoryIssuesAsync(Guid userId, string owner, string repo, string state = "open")
    {
        var config = await GetConfigOrThrowAsync(userId);
        var client = CreateAuthenticatedClient(config.AccessToken);

        var response = await client.GetAsync($"{GitHubApiBase}/repos/{owner}/{repo}/issues?state={state}&per_page=100");
        response.EnsureSuccessStatusCode();

        var issues = await response.Content.ReadFromJsonAsync<List<GitHubIssueResponse>>();

        return issues?.Select(MapIssueResponseToDto).ToList() ?? new List<GitHubIssueDto>();
    }

    public async Task<GitHubIssueDto> GetIssueAsync(Guid userId, string owner, string repo, int issueNumber)
    {
        var config = await GetConfigOrThrowAsync(userId);
        var client = CreateAuthenticatedClient(config.AccessToken);

        var response = await client.GetAsync($"{GitHubApiBase}/repos/{owner}/{repo}/issues/{issueNumber}");
        response.EnsureSuccessStatusCode();

        var issue = await response.Content.ReadFromJsonAsync<GitHubIssueResponse>();
        return MapIssueResponseToDto(issue!);
    }

    public async Task<GitHubIssueDto> CreateIssueAsync(Guid userId, CreateGitHubIssueDto issueDto)
    {
        var config = await GetConfigOrThrowAsync(userId);
        var client = CreateAuthenticatedClient(config.AccessToken);

        var parts = issueDto.Repository.Split('/');
        if (parts.Length != 2) throw new ArgumentException("Repository deve estar no formato 'owner/repo'");

        var owner = parts[0];
        var repo = parts[1];

        var requestBody = new
        {
            title = issueDto.Title,
            body = issueDto.Body,
            labels = issueDto.Labels,
            assignees = issueDto.Assignees
        };

        var response = await client.PostAsJsonAsync($"{GitHubApiBase}/repos/{owner}/{repo}/issues", requestBody);
        response.EnsureSuccessStatusCode();

        var createdIssue = await response.Content.ReadFromJsonAsync<GitHubIssueResponse>();

        _logger.LogInformation("Issue criada no GitHub: {Owner}/{Repo}#{Number}", owner, repo, createdIssue!.Number);

        return MapIssueResponseToDto(createdIssue);
    }

    public async Task<GitHubIssueDto> UpdateIssueAsync(Guid userId, string owner, string repo, int issueNumber, CreateGitHubIssueDto issueDto)
    {
        var config = await GetConfigOrThrowAsync(userId);
        var client = CreateAuthenticatedClient(config.AccessToken);

        var requestBody = new
        {
            title = issueDto.Title,
            body = issueDto.Body,
            labels = issueDto.Labels
        };

        var response = await client.PatchAsJsonAsync($"{GitHubApiBase}/repos/{owner}/{repo}/issues/{issueNumber}", requestBody);
        response.EnsureSuccessStatusCode();

        var updatedIssue = await response.Content.ReadFromJsonAsync<GitHubIssueResponse>();

        _logger.LogInformation("Issue atualizada no GitHub: {Owner}/{Repo}#{Number}", owner, repo, issueNumber);

        return MapIssueResponseToDto(updatedIssue!);
    }

    public async Task CloseIssueAsync(Guid userId, string owner, string repo, int issueNumber)
    {
        var config = await GetConfigOrThrowAsync(userId);
        var client = CreateAuthenticatedClient(config.AccessToken);

        var requestBody = new { state = "closed" };

        var response = await client.PatchAsJsonAsync($"{GitHubApiBase}/repos/{owner}/{repo}/issues/{issueNumber}", requestBody);
        response.EnsureSuccessStatusCode();

        _logger.LogInformation("Issue fechada no GitHub: {Owner}/{Repo}#{Number}", owner, repo, issueNumber);
    }

    #endregion

    #region Pull Requests

    public async Task<List<GitHubPullRequestDto>> GetRepositoryPullRequestsAsync(Guid userId, string owner, string repo, string state = "open")
    {
        var config = await GetConfigOrThrowAsync(userId);
        var client = CreateAuthenticatedClient(config.AccessToken);

        var response = await client.GetAsync($"{GitHubApiBase}/repos/{owner}/{repo}/pulls?state={state}&per_page=100");
        response.EnsureSuccessStatusCode();

        var prs = await response.Content.ReadFromJsonAsync<List<GitHubPRResponse>>();

        return prs?.Select(MapPRResponseToDto).ToList() ?? new List<GitHubPullRequestDto>();
    }

    public async Task<GitHubPullRequestDto> GetPullRequestAsync(Guid userId, string owner, string repo, int prNumber)
    {
        var config = await GetConfigOrThrowAsync(userId);
        var client = CreateAuthenticatedClient(config.AccessToken);

        var response = await client.GetAsync($"{GitHubApiBase}/repos/{owner}/{repo}/pulls/{prNumber}");
        response.EnsureSuccessStatusCode();

        var pr = await response.Content.ReadFromJsonAsync<GitHubPRResponse>();
        return MapPRResponseToDto(pr!);
    }

    public async Task<GitHubPullRequestDto> CreatePullRequestAsync(Guid userId, CreateGitHubPullRequestDto prDto)
    {
        var config = await GetConfigOrThrowAsync(userId);
        var client = CreateAuthenticatedClient(config.AccessToken);

        var parts = prDto.Repository.Split('/');
        var owner = parts[0];
        var repo = parts[1];

        var requestBody = new
        {
            title = prDto.Title,
            head = prDto.Head,
            @base = prDto.Base,
            body = prDto.Body
        };

        var response = await client.PostAsJsonAsync($"{GitHubApiBase}/repos/{owner}/{repo}/pulls", requestBody);
        response.EnsureSuccessStatusCode();

        var createdPR = await response.Content.ReadFromJsonAsync<GitHubPRResponse>();

        _logger.LogInformation("Pull Request criado no GitHub: {Owner}/{Repo}#{Number}", owner, repo, createdPR!.Number);

        return MapPRResponseToDto(createdPR);
    }

    #endregion

    #region Comments

    public async Task<List<GitHubCommentDto>> GetIssueCommentsAsync(Guid userId, string owner, string repo, int issueNumber)
    {
        var config = await GetConfigOrThrowAsync(userId);
        var client = CreateAuthenticatedClient(config.AccessToken);

        var response = await client.GetAsync($"{GitHubApiBase}/repos/{owner}/{repo}/issues/{issueNumber}/comments");
        response.EnsureSuccessStatusCode();

        var comments = await response.Content.ReadFromJsonAsync<List<GitHubCommentResponse>>();

        return comments?.Select(c => new GitHubCommentDto
        {
            Id = c.Id,
            Body = c.Body,
            User = MapUserResponseToDto(c.User),
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt
        }).ToList() ?? new List<GitHubCommentDto>();
    }

    public async Task<GitHubCommentDto> CreateCommentAsync(Guid userId, string owner, string repo, int issueNumber, string body)
    {
        var config = await GetConfigOrThrowAsync(userId);
        var client = CreateAuthenticatedClient(config.AccessToken);

        var requestBody = new { body };

        var response = await client.PostAsJsonAsync($"{GitHubApiBase}/repos/{owner}/{repo}/issues/{issueNumber}/comments", requestBody);
        response.EnsureSuccessStatusCode();

        var comment = await response.Content.ReadFromJsonAsync<GitHubCommentResponse>();

        return new GitHubCommentDto
        {
            Id = comment!.Id,
            Body = comment.Body,
            User = MapUserResponseToDto(comment.User),
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt
        };
    }

    #endregion

    #region Branches & Commits

    public async Task<List<GitHubBranchDto>> GetRepositoryBranchesAsync(Guid userId, string owner, string repo)
    {
        var config = await GetConfigOrThrowAsync(userId);
        var client = CreateAuthenticatedClient(config.AccessToken);

        var response = await client.GetAsync($"{GitHubApiBase}/repos/{owner}/{repo}/branches");
        response.EnsureSuccessStatusCode();

        var branches = await response.Content.ReadFromJsonAsync<List<GitHubBranchResponse>>();

        return branches?.Select(b => new GitHubBranchDto
        {
            Name = b.Name,
            Sha = b.Commit.Sha,
            Protected = b.Protected
        }).ToList() ?? new List<GitHubBranchDto>();
    }

    public async Task<List<GitHubCommitDto>> GetRepositoryCommitsAsync(Guid userId, string owner, string repo, string? branch = null)
    {
        var config = await GetConfigOrThrowAsync(userId);
        var client = CreateAuthenticatedClient(config.AccessToken);

        var url = $"{GitHubApiBase}/repos/{owner}/{repo}/commits";
        if (!string.IsNullOrEmpty(branch))
        {
            url += $"?sha={branch}";
        }

        var response = await client.GetAsync(url);
        response.EnsureSuccessStatusCode();

        var commits = await response.Content.ReadFromJsonAsync<List<GitHubCommitFullResponse>>();

        return commits?.Select(c => new GitHubCommitDto
        {
            Sha = c.Sha,
            Message = c.Commit.Message,
            Author = c.Author != null ? MapUserResponseToDto(c.Author) : null,
            Date = c.Commit.Author.Date,
            HtmlUrl = c.HtmlUrl
        }).ToList() ?? new List<GitHubCommitDto>();
    }

    #endregion

    #region Sync

    public async Task<GitHubSyncStatusDto> SyncWithGitHubAsync(Guid userId)
    {
        var status = new GitHubSyncStatusDto
        {
            UserId = userId,
            Status = "syncing",
            LastSyncAt = DateTime.UtcNow
        };

        _syncStatuses[userId] = status;

        try
        {
            _logger.LogInformation("Iniciando sincronização GitHub para usuário {UserId}", userId);

            var config = await GetConfigOrThrowAsync(userId);
            int issuesSynced = 0;
            int prsSynced = 0;

            if (config.SyncIssues && config.SelectedRepositories != null)
            {
                foreach (var repoFullName in config.SelectedRepositories)
                {
                    var parts = repoFullName.Split('/');
                    if (parts.Length == 2)
                    {
                        var issues = await GetRepositoryIssuesAsync(userId, parts[0], parts[1]);
                        issuesSynced += issues.Count;
                    }
                }
            }

            if (config.SyncPullRequests && config.SelectedRepositories != null)
            {
                foreach (var repoFullName in config.SelectedRepositories)
                {
                    var parts = repoFullName.Split('/');
                    if (parts.Length == 2)
                    {
                        var prs = await GetRepositoryPullRequestsAsync(userId, parts[0], parts[1]);
                        prsSynced += prs.Count;
                    }
                }
            }

            status.Status = "idle";
            status.IssuesSynced = issuesSynced;
            status.PullRequestsSynced = prsSynced;
            _syncStatuses[userId] = status;

            _logger.LogInformation("Sincronização GitHub concluída. Issues: {Issues}, PRs: {PRs}", issuesSynced, prsSynced);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao sincronizar GitHub");
            status.Status = "error";
            status.ErrorMessage = ex.Message;
            _syncStatuses[userId] = status;
        }

        return status;
    }

    public Task<GitHubSyncStatusDto> GetSyncStatusAsync(Guid userId)
    {
        if (!_syncStatuses.TryGetValue(userId, out var status))
        {
            status = new GitHubSyncStatusDto { UserId = userId, Status = "idle" };
        }

        return Task.FromResult(status);
    }

    #endregion

    #region Webhooks & User

    public Task HandleGitHubWebhookAsync(GitHubWebhookDto webhook)
    {
        _logger.LogInformation("Webhook GitHub recebido: Event={Event}, Action={Action}",
            webhook.Event, webhook.Action);

        // Implementar lógica de sincronização automática baseada em webhooks
        return Task.CompletedTask;
    }

    public async Task<GitHubUserDto> GetAuthenticatedUserAsync(Guid userId)
    {
        var config = await GetConfigOrThrowAsync(userId);
        var client = CreateAuthenticatedClient(config.AccessToken);

        var response = await client.GetAsync($"{GitHubApiBase}/user");
        response.EnsureSuccessStatusCode();

        var user = await response.Content.ReadFromJsonAsync<GitHubUserResponse>();

        return MapUserResponseToDto(user!);
    }

    #endregion

    #region Helpers

    private HttpClient CreateAuthenticatedClient(string accessToken)
    {
        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        client.DefaultRequestHeaders.UserAgent.ParseAdd("Arc-Projectly/1.0");
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.github.v3+json"));
        return client;
    }

    private async Task<GitHubIntegrationConfigDto> GetConfigOrThrowAsync(Guid userId)
    {
        var config = await GetIntegrationConfigAsync(userId);
        if (config == null)
        {
            throw new InvalidOperationException("Integração com GitHub não configurada");
        }
        return config;
    }

    private async Task<bool> ValidateTokenAsync(string accessToken)
    {
        try
        {
            var client = CreateAuthenticatedClient(accessToken);
            var response = await client.GetAsync($"{GitHubApiBase}/user");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    private static GitHubIssueDto MapIssueResponseToDto(GitHubIssueResponse issue)
    {
        return new GitHubIssueDto
        {
            Id = issue.Id,
            Number = issue.Number,
            Title = issue.Title,
            Body = issue.Body,
            State = issue.State,
            HtmlUrl = issue.HtmlUrl,
            CreatedAt = issue.CreatedAt,
            UpdatedAt = issue.UpdatedAt,
            ClosedAt = issue.ClosedAt,
            Labels = issue.Labels?.Select(l => new GitHubLabelDto
            {
                Id = l.Id,
                Name = l.Name,
                Color = l.Color,
                Description = l.Description
            }).ToList(),
            Assignee = issue.Assignee != null ? MapUserResponseToDto(issue.Assignee) : null,
            Assignees = issue.Assignees?.Select(MapUserResponseToDto).ToList()
        };
    }

    private static GitHubPullRequestDto MapPRResponseToDto(GitHubPRResponse pr)
    {
        return new GitHubPullRequestDto
        {
            Id = pr.Id,
            Number = pr.Number,
            Title = pr.Title,
            Body = pr.Body,
            State = pr.State,
            HtmlUrl = pr.HtmlUrl,
            CreatedAt = pr.CreatedAt,
            UpdatedAt = pr.UpdatedAt,
            MergedAt = pr.MergedAt,
            ClosedAt = pr.ClosedAt,
            User = pr.User != null ? MapUserResponseToDto(pr.User) : null,
            HeadRef = pr.Head?.Ref ?? "",
            BaseRef = pr.Base?.Ref ?? ""
        };
    }

    private static GitHubUserDto MapUserResponseToDto(GitHubUserResponse user)
    {
        return new GitHubUserDto
        {
            Id = user.Id,
            Login = user.Login,
            Name = user.Name,
            Email = user.Email,
            AvatarUrl = user.AvatarUrl,
            HtmlUrl = user.HtmlUrl
        };
    }

    #endregion

    #region Response Models

    private class GitHubRepoResponse
    {
        public long Id { get; set; }
        public string Name { get; set; } = "";
        public string FullName { get; set; } = "";
        public string? Description { get; set; }
        public string HtmlUrl { get; set; } = "";
        public bool Private { get; set; }
        public string? Language { get; set; }
        public int StargazersCount { get; set; }
        public int ForksCount { get; set; }
        public int OpenIssuesCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    private class GitHubIssueResponse
    {
        public long Id { get; set; }
        public int Number { get; set; }
        public string Title { get; set; } = "";
        public string? Body { get; set; }
        public string State { get; set; } = "";
        public string HtmlUrl { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ClosedAt { get; set; }
        public List<GitHubLabelResponse>? Labels { get; set; }
        public GitHubUserResponse? Assignee { get; set; }
        public List<GitHubUserResponse>? Assignees { get; set; }
    }

    private class GitHubPRResponse
    {
        public long Id { get; set; }
        public int Number { get; set; }
        public string Title { get; set; } = "";
        public string? Body { get; set; }
        public string State { get; set; } = "";
        public string HtmlUrl { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? MergedAt { get; set; }
        public DateTime? ClosedAt { get; set; }
        public GitHubUserResponse? User { get; set; }
        public GitHubBranchRefResponse? Head { get; set; }
        public GitHubBranchRefResponse? Base { get; set; }
    }

    private class GitHubUserResponse
    {
        public long Id { get; set; }
        public string Login { get; set; } = "";
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string AvatarUrl { get; set; } = "";
        public string HtmlUrl { get; set; } = "";
    }

    private class GitHubLabelResponse
    {
        public long Id { get; set; }
        public string Name { get; set; } = "";
        public string Color { get; set; } = "";
        public string? Description { get; set; }
    }

    private class GitHubCommentResponse
    {
        public long Id { get; set; }
        public string Body { get; set; } = "";
        public GitHubUserResponse User { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    private class GitHubBranchResponse
    {
        public string Name { get; set; } = "";
        public GitHubCommitRefResponse Commit { get; set; } = new();
        public bool Protected { get; set; }
    }

    private class GitHubCommitRefResponse
    {
        public string Sha { get; set; } = "";
    }

    private class GitHubBranchRefResponse
    {
        public string Ref { get; set; } = "";
    }

    private class GitHubCommitFullResponse
    {
        public string Sha { get; set; } = "";
        public GitHubCommitDataResponse Commit { get; set; } = new();
        public GitHubUserResponse? Author { get; set; }
        public string HtmlUrl { get; set; } = "";
    }

    private class GitHubCommitDataResponse
    {
        public string Message { get; set; } = "";
        public GitHubCommitAuthorResponse Author { get; set; } = new();
    }

    private class GitHubCommitAuthorResponse
    {
        public DateTime Date { get; set; }
    }

    #endregion
}
