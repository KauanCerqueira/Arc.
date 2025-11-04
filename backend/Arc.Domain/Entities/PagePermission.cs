namespace Arc.Domain.Entities;

public class PagePermission
{
    public Guid Id { get; set; }
    public Guid PageId { get; set; }
    public Guid UserId { get; set; }
    public bool CanView { get; set; }
    public bool CanEdit { get; set; }
    public bool CanComment { get; set; }
    public bool CanDelete { get; set; }
    public bool CanShare { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Page? Page { get; set; }
    public User? User { get; set; }

    public PagePermission()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
        CanView = true;
        CanEdit = false;
        CanComment = true;
        CanDelete = false;
        CanShare = false;
    }

    public static PagePermission CreateDefault(Guid pageId, Guid userId, bool canEdit = false)
    {
        return new PagePermission
        {
            PageId = pageId,
            UserId = userId,
            CanView = true,
            CanEdit = canEdit,
            CanComment = true,
            CanDelete = false,
            CanShare = false
        };
    }

    public static PagePermission CreateFullAccess(Guid pageId, Guid userId)
    {
        return new PagePermission
        {
            PageId = pageId,
            UserId = userId,
            CanView = true,
            CanEdit = true,
            CanComment = true,
            CanDelete = true,
            CanShare = true
        };
    }
}
