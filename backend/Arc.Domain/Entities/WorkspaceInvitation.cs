using Arc.Domain.Enums;

namespace Arc.Domain.Entities;

public class WorkspaceInvitation
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public string Email { get; set; } = string.Empty;
    public Guid InvitedByUserId { get; set; }
    public TeamRole Role { get; set; }
    public InvitationStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? RespondedAt { get; set; }
    public string? InvitationToken { get; set; }

    // Navigation properties
    public Workspace? Workspace { get; set; }
    public User? InvitedByUser { get; set; }

    public WorkspaceInvitation()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
        ExpiresAt = DateTime.UtcNow.AddDays(7);
        Status = InvitationStatus.Pending;
        InvitationToken = Guid.NewGuid().ToString("N");
    }
}
