using System.ComponentModel.DataAnnotations;

namespace Arc.Application.DTOs.Templates;

// ===== GENERIC TEMPLATE DTO =====
// Usado para templates que apenas armazenam dados JSON genéricos

public class TemplateDataDto
{
    public required object Data { get; set; }
}

public class UpdateTemplateDataRequestDto
{
    [Required]
    public required Guid PageId { get; set; }

    [Required]
    public required object Data { get; set; }
}

// ===== TASKS TEMPLATE =====

public class TaskItemDto
{
    public required string Id { get; set; }

    [Required]
    [StringLength(500)]
    public required string Text { get; set; }

    public bool Completed { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? Priority { get; set; } // "low", "medium", "high"
    public string? Category { get; set; }
}

public class TasksDataDto
{
    public List<TaskItemDto> Tasks { get; set; } = new();
}

// ===== KANBAN TEMPLATE =====

public class KanbanCardDto
{
    public required string Id { get; set; }

    [Required]
    [StringLength(500)]
    public required string Title { get; set; }

    public string? Description { get; set; }
    public string? Priority { get; set; }
    public List<string> Tags { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class KanbanColumnDto
{
    public required string Id { get; set; }

    [Required]
    [StringLength(100)]
    public required string Title { get; set; }

    public List<KanbanCardDto> Cards { get; set; } = new();
}

public class KanbanDataDto
{
    public List<KanbanColumnDto> Columns { get; set; } = new();
}

// ===== TABLE TEMPLATE =====

public class TableRowDto
{
    public required string Id { get; set; }
    public Dictionary<string, string> Cells { get; set; } = new();
}

public class TableColumnDto
{
    public required string Id { get; set; }

    [Required]
    [StringLength(100)]
    public required string Name { get; set; }

    public string Type { get; set; } = "text"; // "text", "number", "date", "select"
}

public class TableDataDto
{
    public List<TableColumnDto> Columns { get; set; } = new();
    public List<TableRowDto> Rows { get; set; } = new();
}

// ===== CALENDAR TEMPLATE =====

public class CalendarEventDto
{
    public required string Id { get; set; }

    [Required]
    [StringLength(200)]
    public required string Title { get; set; }

    public string? Description { get; set; }
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
    public bool AllDay { get; set; }
    public string? Color { get; set; }
}

public class CalendarDataDto
{
    public List<CalendarEventDto> Events { get; set; } = new();
}

// ===== PROJECTS TEMPLATE =====

public class ProjectDto
{
    public required string Id { get; set; }

    [Required]
    [StringLength(200)]
    public required string Name { get; set; }

    public string? Description { get; set; }
    public string Status { get; set; } = "active"; // "active", "completed", "on-hold"
    public int Progress { get; set; } = 0;
    public DateTime? Deadline { get; set; }
    public List<string> Tags { get; set; } = new();
}

public class ProjectsDataDto
{
    public List<ProjectDto> Projects { get; set; } = new();
}

// ===== BUGS TEMPLATE =====

public class BugDto
{
    public required string Id { get; set; }

    [Required]
    [StringLength(300)]
    public required string Title { get; set; }

    public string? Description { get; set; }
    public string Status { get; set; } = "open"; // "open", "in-progress", "resolved", "closed"
    public string Priority { get; set; } = "medium"; // "low", "medium", "high", "critical"
    public string? AssignedTo { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
}

public class BugsDataDto
{
    public List<BugDto> Bugs { get; set; } = new();
}

// ===== STUDY TEMPLATE =====

public class StudyTopicDto
{
    public required string Id { get; set; }

    [Required]
    [StringLength(200)]
    public required string Topic { get; set; }

    public string? Notes { get; set; }
    public int Progress { get; set; } = 0; // 0-100
    public DateTime? StudyDate { get; set; }
    public int TimeSpent { get; set; } = 0; // minutes
}

public class StudyDataDto
{
    public List<StudyTopicDto> Topics { get; set; } = new();
    public int TotalTimeSpent { get; set; } = 0;
}

// ===== BUDGET TEMPLATE =====

public class BudgetItemDto
{
    public required string Id { get; set; }

    [Required]
    [StringLength(200)]
    public required string Description { get; set; }

    public decimal Amount { get; set; }
    public string Type { get; set; } = "expense"; // "expense", "income"
    public string? Category { get; set; }
    public DateTime Date { get; set; }
}

public class BudgetDataDto
{
    public List<BudgetItemDto> Items { get; set; } = new();
    public decimal TotalIncome { get; set; }
    public decimal TotalExpense { get; set; }
    public decimal Balance { get; set; }
}

// ===== SPRINT TEMPLATE =====

public class SprintTaskDto
{
    public required string Id { get; set; }

    [Required]
    [StringLength(300)]
    public required string Title { get; set; }

    public string? Description { get; set; }
    public string Status { get; set; } = "todo"; // "todo", "in-progress", "done"
    public int Points { get; set; } = 0;
    public string? AssignedTo { get; set; }
}

public class SprintDataDto
{
    [StringLength(100)]
    public string? SprintName { get; set; }

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<SprintTaskDto> Tasks { get; set; } = new();
    public int TotalPoints { get; set; }
    public int CompletedPoints { get; set; }
}

// ===== FOCUS/POMODORO TEMPLATE =====

public class PomodoroSessionDto
{
    public required string Id { get; set; }

    [StringLength(200)]
    public string? Task { get; set; }

    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public int Duration { get; set; } = 25; // minutes
    public bool Completed { get; set; }
}

public class FocusDataDto
{
    public List<PomodoroSessionDto> Sessions { get; set; } = new();
    public int TotalSessions { get; set; }
    public int TotalMinutes { get; set; }
}
