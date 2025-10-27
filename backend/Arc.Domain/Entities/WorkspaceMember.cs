using Arc.Domain.Enums;

namespace Arc.Domain.Entities;

public class WorkspaceMember
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public Guid UserId { get; set; }
    public TeamRole Role { get; set; }
    public DateTime JoinedAt { get; set; }
    public DateTime? LastAccessAt { get; set; }
    public bool IsActive { get; set; }

    // Navigation properties
    public Workspace? Workspace { get; set; }
    public User? User { get; set; }

    public WorkspaceMember()
    {
        Id = Guid.NewGuid();
        JoinedAt = DateTime.UtcNow;
        IsActive = true;
        Role = TeamRole.Member;
    }
}
