using Arc.Application.DTOs.GitHub;

namespace Arc.Application.Interfaces;

public interface IGitHubIntegrationService
{
    // Configuração
    Task<GitHubIntegrationConfigDto> ConfigureIntegrationAsync(GitHubIntegrationConfigDto config);
    Task<GitHubIntegrationConfigDto?> GetIntegrationConfigAsync(Guid userId);
    Task DisableIntegrationAsync(Guid userId);

    // Repositórios
    Task<List<GitHubRepositoryDto>> GetUserRepositoriesAsync(Guid userId);
    Task<GitHubRepositoryDto> GetRepositoryAsync(Guid userId, string owner, string repo);

    // Issues
    Task<List<GitHubIssueDto>> GetRepositoryIssuesAsync(Guid userId, string owner, string repo, string state = "open");
    Task<GitHubIssueDto> GetIssueAsync(Guid userId, string owner, string repo, int issueNumber);
    Task<GitHubIssueDto> CreateIssueAsync(Guid userId, CreateGitHubIssueDto issueDto);
    Task<GitHubIssueDto> UpdateIssueAsync(Guid userId, string owner, string repo, int issueNumber, CreateGitHubIssueDto issueDto);
    Task CloseIssueAsync(Guid userId, string owner, string repo, int issueNumber);

    // Pull Requests
    Task<List<GitHubPullRequestDto>> GetRepositoryPullRequestsAsync(Guid userId, string owner, string repo, string state = "open");
    Task<GitHubPullRequestDto> GetPullRequestAsync(Guid userId, string owner, string repo, int prNumber);
    Task<GitHubPullRequestDto> CreatePullRequestAsync(Guid userId, CreateGitHubPullRequestDto prDto);

    // Comentários
    Task<List<GitHubCommentDto>> GetIssueCommentsAsync(Guid userId, string owner, string repo, int issueNumber);
    Task<GitHubCommentDto> CreateCommentAsync(Guid userId, string owner, string repo, int issueNumber, string body);

    // Branches
    Task<List<GitHubBranchDto>> GetRepositoryBranchesAsync(Guid userId, string owner, string repo);

    // Commits
    Task<List<GitHubCommitDto>> GetRepositoryCommitsAsync(Guid userId, string owner, string repo, string? branch = null);

    // Sincronização
    Task<GitHubSyncStatusDto> SyncWithGitHubAsync(Guid userId);
    Task<GitHubSyncStatusDto> GetSyncStatusAsync(Guid userId);

    // Webhooks
    Task HandleGitHubWebhookAsync(GitHubWebhookDto webhook);

    // User info
    Task<GitHubUserDto> GetAuthenticatedUserAsync(Guid userId);
}
