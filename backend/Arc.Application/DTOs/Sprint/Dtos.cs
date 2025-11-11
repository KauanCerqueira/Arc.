namespace Arc.Application.DTOs.Sprint;

public class SprintDataDto
{
    public SprintInfoDto SprintInfo { get; set; } = new();
    public List<SprintTaskDto> Tasks { get; set; } = new();
    public List<string> TeamMembers { get; set; } = new();
}

public class SprintInfoDto
{
    public string Name { get; set; } = string.Empty;
    public string Goal { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalStoryPoints { get; set; }
    public int CommittedStoryPoints { get; set; }
    public string Status { get; set; } = "planned"; // planned, active, completed, cancelled
}

public class SprintTaskDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "todo"; // todo, in_progress, review, done
    public string Type { get; set; } = "story"; // story, bug, task, epic
    public int StoryPoints { get; set; } = 0;
    public string Priority { get; set; } = "medium"; // low, medium, high, critical
    public string AssignedTo { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new();
    public DateTime? CompletedAt { get; set; }
    public List<SprintTaskCommentDto> Comments { get; set; } = new();
}

public class SprintTaskCommentDto
{
    public string Id { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class SprintStatisticsDto
{
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int InProgressTasks { get; set; }
    public int TodoTasks { get; set; }
    public int TotalStoryPoints { get; set; }
    public int CompletedStoryPoints { get; set; }
    public double CompletionPercentage { get; set; }
    public double VelocityPerDay { get; set; }
    public int DaysRemaining { get; set; }
    public int DaysElapsed { get; set; }
    public Dictionary<string, int> TasksByType { get; set; } = new();
    public Dictionary<string, int> TasksByStatus { get; set; } = new();
    public Dictionary<string, int> TasksByAssignee { get; set; } = new();
    public List<BurndownPointDto> BurndownData { get; set; } = new();
}

public class BurndownPointDto
{
    public DateTime Date { get; set; }
    public int IdealRemaining { get; set; }
    public int ActualRemaining { get; set; }
}

public class SprintVelocityDto
{
    public double AverageVelocity { get; set; }
    public int TotalSprints { get; set; }
    public List<SprintVelocityPointDto> SprintHistory { get; set; } = new();
}

public class SprintVelocityPointDto
{
    public string SprintName { get; set; } = string.Empty;
    public int CommittedPoints { get; set; }
    public int CompletedPoints { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

// DTOs for CRUD operations
public class CreateSprintDto
{
    public Guid WorkspaceId { get; set; }
    public Guid PageId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Goal { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public class UpdateSprintDto
{
    public string Name { get; set; } = string.Empty;
    public string Goal { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class CreateSprintTaskDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int StoryPoints { get; set; }
    public string Status { get; set; } = "backlog";
    public string Priority { get; set; } = "medium";
    public string Type { get; set; } = "task";
    public Guid? AssignedTo { get; set; }
    public List<string> Tags { get; set; } = new();
}

public class UpdateSprintTaskDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public int? StoryPoints { get; set; }
    public string? Status { get; set; }
    public string? Priority { get; set; }
    public string? Type { get; set; }
    public Guid? AssignedTo { get; set; }
    public List<string>? Tags { get; set; }
}

public class SprintResponseDto
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public Guid PageId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Goal { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalStoryPoints { get; set; }
    public int CommittedStoryPoints { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<SprintTaskResponseDto> Tasks { get; set; } = new();
}

public class SprintTaskResponseDto
{
    public Guid Id { get; set; }
    public Guid SprintId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int StoryPoints { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public Guid? AssignedTo { get; set; }
    public string? AssignedUserName { get; set; }
    public List<string> Tags { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int Order { get; set; }
}
