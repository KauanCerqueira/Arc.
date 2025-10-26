using System.ComponentModel.DataAnnotations;

namespace Arc.Application.DTOs.Flowchart;

// ===== REQUEST DTOs =====

public class FlowchartNodeDto
{
    public required string Id { get; set; }
    public required string Type { get; set; }
    public required FlowchartNodeDataDto Data { get; set; }
    public required FlowchartPositionDto Position { get; set; }
}

public class FlowchartNodeDataDto
{
    public required string Label { get; set; }
    public string? Type { get; set; }
    public string? Color { get; set; }
}

public class FlowchartPositionDto
{
    public double X { get; set; }
    public double Y { get; set; }
}

public class FlowchartEdgeDto
{
    public required string Id { get; set; }
    public required string Source { get; set; }
    public required string Target { get; set; }
    public string? Type { get; set; }
    public bool Animated { get; set; }
    public FlowchartEdgeStyleDto? Style { get; set; }
}

public class FlowchartEdgeStyleDto
{
    public string? Stroke { get; set; }
    public double? StrokeWidth { get; set; }
}

public class FlowchartDataDto
{
    public List<FlowchartNodeDto> Nodes { get; set; } = new();
    public List<FlowchartEdgeDto> Edges { get; set; } = new();
}

public class ValidateFlowchartRequestDto
{
    [Required]
    public required FlowchartDataDto Flowchart { get; set; }
}

public class ExportFlowchartRequestDto
{
    [Required]
    public required Guid PageId { get; set; }

    [Required]
    [StringLength(10)]
    public required string Format { get; set; } // "json", "svg", "png"
}

// ===== RESPONSE DTOs =====

public class FlowchartValidationResultDto
{
    public bool IsValid { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public FlowchartStatisticsDto? Statistics { get; set; }
}

public class FlowchartStatisticsDto
{
    public int TotalNodes { get; set; }
    public int TotalEdges { get; set; }
    public int StartNodes { get; set; }
    public int EndNodes { get; set; }
    public int DecisionNodes { get; set; }
    public int ProcessNodes { get; set; }
    public int DisconnectedNodes { get; set; }
    public bool HasCycles { get; set; }
}
