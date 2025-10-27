namespace Arc.Application.DTOs.Kanban;

public class KanbanDataDto
{
    public List<KanbanColumnDto> Columns { get; set; } = new();
}

public class KanbanColumnDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int Position { get; set; }
    public string Color { get; set; } = "#6B7280";
    public int WipLimit { get; set; } = 0; // Work In Progress limit (0 = sem limite)
    public List<KanbanCardDto> Cards { get; set; } = new();
}

public class KanbanCardDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Position { get; set; }
    public string Priority { get; set; } = "medium"; // low, medium, high, urgent
    public List<string> Tags { get; set; } = new();
    public List<string> AssignedTo { get; set; } = new();
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class KanbanStatisticsDto
{
    public int TotalColumns { get; set; }
    public int TotalCards { get; set; }
    public int CompletedCards { get; set; }
    public int OverdueCards { get; set; }
    public int HighPriorityCards { get; set; }
    public Dictionary<string, int> CardsByColumn { get; set; } = new();
    public Dictionary<string, int> CardsByPriority { get; set; } = new();
    public List<string> ColumnsOverWipLimit { get; set; } = new();
}

public class MoveCardRequestDto
{
    public string CardId { get; set; } = string.Empty;
    public string FromColumnId { get; set; } = string.Empty;
    public string ToColumnId { get; set; } = string.Empty;
    public int NewPosition { get; set; }
}
