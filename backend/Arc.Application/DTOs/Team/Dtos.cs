using Arc.Domain.Enums;

namespace Arc.Application.DTOs.Team;

public class WorkspaceTeamDto
{
    public Guid WorkspaceId { get; set; }
    public string WorkspaceName { get; set; } = string.Empty;
    public WorkspaceType Type { get; set; }
    public int MaxMembers { get; set; }
    public int CurrentMembers { get; set; }
    public List<WorkspaceMemberDto> Members { get; set; } = new();
    public List<WorkspaceInvitationDto> PendingInvitations { get; set; } = new();
}

public class WorkspaceMemberDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string? UserIcon { get; set; }
    public TeamRole Role { get; set; }
    public DateTime JoinedAt { get; set; }
    public DateTime? LastAccessAt { get; set; }
    public bool IsActive { get; set; }
}

public class WorkspaceInvitationDto
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public string WorkspaceName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string InvitedByUserName { get; set; } = string.Empty;
    public TeamRole Role { get; set; }
    public InvitationStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public string? InvitationToken { get; set; }
}

public class AddMemberDto
{
    public Guid UserId { get; set; }
    public TeamRole Role { get; set; }
}

public class UpdateMemberRoleDto
{
    public TeamRole Role { get; set; }
}

public class InviteMemberDto
{
    public string Email { get; set; } = string.Empty;
    public TeamRole Role { get; set; }
}

public class GroupPermissionDto
{
    public Guid Id { get; set; }
    public Guid GroupId { get; set; }
    public string GroupName { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public bool CanView { get; set; }
    public bool CanEdit { get; set; }
    public bool CanDelete { get; set; }
    public bool CanManagePages { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class SetGroupPermissionDto
{
    public Guid GroupId { get; set; }
    public Guid UserId { get; set; }
    public bool CanView { get; set; }
    public bool CanEdit { get; set; }
    public bool CanDelete { get; set; }
    public bool CanManagePages { get; set; }
}
