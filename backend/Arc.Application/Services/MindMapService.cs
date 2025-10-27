using System.Text.Json;
using Arc.Application.DTOs.MindMap;
using Arc.Application.Interfaces;
using Arc.Domain.Interfaces;

namespace Arc.Application.Services;

public class MindMapService : IMindMapService
{
    private readonly IPageRepository _pageRepository;

    public MindMapService(IPageRepository pageRepository)
    {
        _pageRepository = pageRepository;
    }

    public async Task<MindMapStatisticsDto> GetStatisticsAsync(Guid pageId, Guid userId)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        var mindMap = JsonSerializer.Deserialize<MindMapDataDto>(page.Data)
            ?? new MindMapDataDto();

        var stats = new MindMapStatisticsDto
        {
            NodesByDepth = new Dictionary<int, int>()
        };

        AnalyzeNode(mindMap.RootNode, 0, stats);

        // Encontrar nível mais largo
        if (stats.NodesByDepth.Any())
        {
            var widest = stats.NodesByDepth.OrderByDescending(kvp => kvp.Value).First();
            stats.WidestLevel = widest.Key;
            stats.WidestLevelNodeCount = widest.Value;
        }

        return stats;
    }

    private void AnalyzeNode(MindMapNodeDto node, int depth, MindMapStatisticsDto stats)
    {
        stats.TotalNodes++;

        if (depth > stats.MaxDepth)
        {
            stats.MaxDepth = depth;
        }

        if (!stats.NodesByDepth.ContainsKey(depth))
        {
            stats.NodesByDepth[depth] = 0;
        }
        stats.NodesByDepth[depth]++;

        if (node.Children == null || node.Children.Count == 0)
        {
            stats.LeafNodes++;
        }
        else
        {
            stats.BranchNodes++;
            foreach (var child in node.Children)
            {
                AnalyzeNode(child, depth + 1, stats);
            }
        }
    }

    public async Task<byte[]> ExportMindMapAsync(Guid pageId, Guid userId, string format)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        var mindMap = JsonSerializer.Deserialize<MindMapDataDto>(page.Data)
            ?? new MindMapDataDto();

        return format.ToLower() switch
        {
            "json" => System.Text.Encoding.UTF8.GetBytes(JsonSerializer.Serialize(mindMap, new JsonSerializerOptions
            {
                WriteIndented = true
            })),
            "md" => ExportToMarkdown(mindMap),
            "txt" => ExportToText(mindMap),
            _ => throw new NotSupportedException($"Formato '{format}' não suportado")
        };
    }

    private byte[] ExportToMarkdown(MindMapDataDto mindMap)
    {
        var lines = new List<string>
        {
            $"# {mindMap.RootNode.Label}",
            ""
        };

        if (!string.IsNullOrEmpty(mindMap.RootNode.Description))
        {
            lines.Add(mindMap.RootNode.Description);
            lines.Add("");
        }

        ExportNodeToMarkdown(mindMap.RootNode.Children, lines, 1);

        return System.Text.Encoding.UTF8.GetBytes(string.Join("\n", lines));
    }

    private void ExportNodeToMarkdown(List<MindMapNodeDto> nodes, List<string> lines, int level)
    {
        foreach (var node in nodes)
        {
            var prefix = new string('#', level + 1);
            lines.Add($"{prefix} {node.Label}");

            if (!string.IsNullOrEmpty(node.Description))
            {
                lines.Add("");
                lines.Add(node.Description);
            }

            lines.Add("");

            if (node.Children != null && node.Children.Any())
            {
                ExportNodeToMarkdown(node.Children, lines, level + 1);
            }
        }
    }

    private byte[] ExportToText(MindMapDataDto mindMap)
    {
        var lines = new List<string>
        {
            mindMap.RootNode.Label,
            new string('=', mindMap.RootNode.Label.Length),
            ""
        };

        if (!string.IsNullOrEmpty(mindMap.RootNode.Description))
        {
            lines.Add(mindMap.RootNode.Description);
            lines.Add("");
        }

        ExportNodeToText(mindMap.RootNode.Children, lines, 0);

        return System.Text.Encoding.UTF8.GetBytes(string.Join("\n", lines));
    }

    private void ExportNodeToText(List<MindMapNodeDto> nodes, List<string> lines, int level)
    {
        foreach (var node in nodes)
        {
            var indent = new string(' ', level * 2);
            lines.Add($"{indent}- {node.Label}");

            if (!string.IsNullOrEmpty(node.Description))
            {
                lines.Add($"{indent}  {node.Description}");
            }

            if (node.Children != null && node.Children.Any())
            {
                ExportNodeToText(node.Children, lines, level + 1);
            }
        }
    }
}
