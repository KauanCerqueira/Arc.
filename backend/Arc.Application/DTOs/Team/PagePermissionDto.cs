namespace Arc.Application.DTOs.Team;

public class PagePermissionDto
{
    public Guid Id { get; set; }
    public Guid PageId { get; set; }
    public string PageTitle { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string? UserIcon { get; set; }
    public bool CanView { get; set; }
    public bool CanEdit { get; set; }
    public bool CanComment { get; set; }
    public bool CanDelete { get; set; }
    public bool CanShare { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class SetPagePermissionDto
{
    public Guid PageId { get; set; }
    public Guid UserId { get; set; }
    public bool CanView { get; set; }
    public bool CanEdit { get; set; }
    public bool CanComment { get; set; }
    public bool CanDelete { get; set; }
    public bool CanShare { get; set; }
}
