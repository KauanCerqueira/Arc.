namespace Arc.Application.DTOs;

public class TeamMemberDto
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string? UserIcon { get; set; }
    public string Role { get; set; } = string.Empty;
    public string? CustomTitle { get; set; }

    // Permissões
    public bool CanInviteMembers { get; set; }
    public bool CanRemoveMembers { get; set; }
    public bool CanManageProjects { get; set; }
    public bool CanDeleteProjects { get; set; }
    public bool CanManageIntegrations { get; set; }
    public bool CanExportData { get; set; }

    public DateTime InvitedAt { get; set; }
    public DateTime? JoinedAt { get; set; }
    public bool IsActive { get; set; }
    public string Status => IsActive ? "Ativo" : "Pendente";
}

public class InviteTeamMemberDto
{
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "MEMBER"; // OWNER, ADMIN, MEMBER, VIEWER
    public string? CustomTitle { get; set; }
}

public class UpdateTeamMemberDto
{
    public string? Role { get; set; }
    public string? CustomTitle { get; set; }
    public bool? CanInviteMembers { get; set; }
    public bool? CanRemoveMembers { get; set; }
    public bool? CanManageProjects { get; set; }
    public bool? CanDeleteProjects { get; set; }
    public bool? CanManageIntegrations { get; set; }
    public bool? CanExportData { get; set; }
}

public class TeamInviteResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public TeamMemberDto? TeamMember { get; set; }
}
