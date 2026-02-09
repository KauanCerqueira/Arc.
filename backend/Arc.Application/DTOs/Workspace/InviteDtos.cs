using System.ComponentModel.DataAnnotations;
using Arc.Domain.Enums;

namespace Arc.Application.DTOs.Workspace;

// ============================================
// REQUEST DTOs
// ============================================

public class CreateInviteRequestDto
{
    [Required(ErrorMessage = "Role é obrigatório")]
    public TeamRole Role { get; set; } = TeamRole.Member;

    [Range(1, 365, ErrorMessage = "Expiração deve estar entre 1 e 365 dias")]
    public int? ExpiresInDays { get; set; } = 7;

    [Range(1, int.MaxValue, ErrorMessage = "MaxUses deve ser maior que 0")]
    public int? MaxUses { get; set; }
}

public class AcceptInviteRequestDto
{
    [Required(ErrorMessage = "Token é obrigatório")]
    public string Token { get; set; } = string.Empty;
}

// ============================================
// RESPONSE DTOs
// ============================================

public class WorkspaceInviteDto
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public string WorkspaceName { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public TeamRole Role { get; set; }
    public Guid CreatedById { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public DateTime? ExpiresAt { get; set; }
    public int? MaxUses { get; set; }
    public int CurrentUses { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateInviteResponseDto
{
    public WorkspaceInviteDto Invite { get; set; } = new();
    public string InviteUrl { get; set; } = string.Empty;
}

public class ValidateInviteResponseDto
{
    public bool IsValid { get; set; }
    public WorkspaceInviteDto? Invite { get; set; }
    public string? Error { get; set; }
}

public class AcceptInviteResponseDto
{
    public bool Success { get; set; }
    public Guid WorkspaceId { get; set; }
    public string WorkspaceName { get; set; } = string.Empty;
    public string? Message { get; set; }
}

public class WorkspaceMemberDto
{
    public Guid UserId { get; set; }
    public Guid WorkspaceId { get; set; }
    public TeamRole Role { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string? UserIcon { get; set; }
    public DateTime JoinedAt { get; set; }
}
