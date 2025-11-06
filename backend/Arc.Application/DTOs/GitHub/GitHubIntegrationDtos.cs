using System.ComponentModel.DataAnnotations;

namespace Arc.Application.DTOs.GitHub;

// DTO para configuração da integração
public class GitHubIntegrationConfigDto
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    public string AccessToken { get; set; } = string.Empty;

    public string? RefreshToken { get; set; }
    public DateTime? TokenExpiresAt { get; set; }

    // Configurações
    public bool SyncIssues { get; set; } = true;
    public bool SyncPullRequests { get; set; } = true;
    public bool AutoSync { get; set; } = true;
    public int SyncIntervalMinutes { get; set; } = 15;

    // Repositórios selecionados para sincronização
    public List<string>? SelectedRepositories { get; set; }
}

// DTO para repositórios
public class GitHubRepositoryDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string HtmlUrl { get; set; } = string.Empty;
    public bool Private { get; set; }
    public string? Language { get; set; }
    public int StargazersCount { get; set; }
    public int ForksCount { get; set; }
    public int OpenIssuesCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

// DTO para Issues
public class GitHubIssueDto
{
    public long Id { get; set; }
    public int Number { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Body { get; set; }
    public string State { get; set; } = "open"; // open | closed
    public string HtmlUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public List<GitHubLabelDto>? Labels { get; set; }
    public GitHubUserDto? Assignee { get; set; }
    public List<GitHubUserDto>? Assignees { get; set; }

    // Mapeamento Arc
    public string? ArcPageId { get; set; }
    public string? ArcTaskId { get; set; }
}

// DTO para Pull Requests
public class GitHubPullRequestDto
{
    public long Id { get; set; }
    public int Number { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Body { get; set; }
    public string State { get; set; } = "open"; // open | closed | merged
    public string HtmlUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? MergedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public GitHubUserDto? User { get; set; }
    public List<GitHubLabelDto>? Labels { get; set; }

    // Branch info
    public string HeadRef { get; set; } = string.Empty; // Branch de origem
    public string BaseRef { get; set; } = string.Empty; // Branch de destino

    // Mapeamento Arc
    public string? ArcPageId { get; set; }
    public string? ArcTaskId { get; set; }
}

// DTO para usuários GitHub
public class GitHubUserDto
{
    public long Id { get; set; }
    public string Login { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string AvatarUrl { get; set; } = string.Empty;
    public string HtmlUrl { get; set; } = string.Empty;
}

// DTO para labels
public class GitHubLabelDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string? Description { get; set; }
}

// DTO para criar issue
public class CreateGitHubIssueDto
{
    [Required]
    public string Repository { get; set; } = string.Empty; // formato: "owner/repo"

    [Required]
    public string Title { get; set; } = string.Empty;

    public string? Body { get; set; }
    public List<string>? Labels { get; set; }
    public List<string>? Assignees { get; set; }

    public string? ArcTaskId { get; set; }
    public string? ArcPageId { get; set; }
}

// DTO para criar PR
public class CreateGitHubPullRequestDto
{
    [Required]
    public string Repository { get; set; } = string.Empty;

    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Head { get; set; } = string.Empty; // Branch de origem

    [Required]
    public string Base { get; set; } = string.Empty; // Branch de destino

    public string? Body { get; set; }
}

// DTO para comentários
public class GitHubCommentDto
{
    public long Id { get; set; }
    public string Body { get; set; } = string.Empty;
    public GitHubUserDto? User { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

// DTO para branches
public class GitHubBranchDto
{
    public string Name { get; set; } = string.Empty;
    public string Sha { get; set; } = string.Empty;
    public bool Protected { get; set; }
}

// DTO para commits
public class GitHubCommitDto
{
    public string Sha { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public GitHubUserDto? Author { get; set; }
    public DateTime Date { get; set; }
    public string HtmlUrl { get; set; } = string.Empty;
}

// DTO para webhooks
public class GitHubWebhookDto
{
    public string Event { get; set; } = string.Empty; // issues | pull_request | push
    public string Action { get; set; } = string.Empty; // opened | closed | synchronize
    public GitHubRepositoryDto? Repository { get; set; }
    public GitHubIssueDto? Issue { get; set; }
    public GitHubPullRequestDto? PullRequest { get; set; }
}

// DTO para atualizar issue
public class UpdateGitHubIssueDto
{
    public string? Title { get; set; }
    public string? Body { get; set; }
    public string? State { get; set; } // open | closed
    public List<string>? Labels { get; set; }
    public List<string>? Assignees { get; set; }
}

// DTO para requisição de sincronização
public class GitHubSyncRequestDto
{
    public List<string>? Repositories { get; set; }
    public bool SyncIssues { get; set; } = true;
    public bool SyncPullRequests { get; set; } = true;
    public bool SyncCommits { get; set; } = false;
}

// DTO para status de sincronização
public class GitHubSyncStatusDto
{
    public Guid UserId { get; set; }
    public DateTime? LastSyncAt { get; set; }
    public string Status { get; set; } = "idle"; // idle | syncing | error
    public string? ErrorMessage { get; set; }
    public int IssuesSynced { get; set; }
    public int PullRequestsSynced { get; set; }
}
