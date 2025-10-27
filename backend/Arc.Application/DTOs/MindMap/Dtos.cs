namespace Arc.Application.DTOs.MindMap;

public class MindMapDataDto
{
    public MindMapNodeDto RootNode { get; set; } = new();
    public MindMapStyleSettings StyleSettings { get; set; } = new();
}

public class MindMapNodeDto
{
    public string Id { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Color { get; set; } = "#3B82F6";
    public string Shape { get; set; } = "rectangle"; // rectangle, circle, diamond
    public string Icon { get; set; } = string.Empty;
    public List<MindMapNodeDto> Children { get; set; } = new();
    public Dictionary<string, string> Metadata { get; set; } = new();
    public bool Collapsed { get; set; } = false;
}

public class MindMapStyleSettings
{
    public string Theme { get; set; } = "default";
    public string Layout { get; set; } = "tree"; // tree, radial, org-chart
    public bool ShowIcons { get; set; } = true;
    public bool AnimateOnLoad { get; set; } = true;
}

public class MindMapStatisticsDto
{
    public int TotalNodes { get; set; }
    public int MaxDepth { get; set; }
    public int LeafNodes { get; set; }
    public int BranchNodes { get; set; }
    public Dictionary<int, int> NodesByDepth { get; set; } = new();
    public int WidestLevel { get; set; }
    public int WidestLevelNodeCount { get; set; }
}

public class SearchMindMapRequestDto
{
    public string Query { get; set; } = string.Empty;
    public bool CaseSensitive { get; set; } = false;
    public bool SearchMetadata { get; set; } = false;
}

public class MindMapPathDto
{
    public List<string> NodeIds { get; set; } = new();
    public List<string> NodeLabels { get; set; } = new();
}
