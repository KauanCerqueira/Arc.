using System.Text.Json;
using Arc.Application.DTOs.Flowchart;
using Arc.Application.Interfaces;
using Arc.Domain.Interfaces;

namespace Arc.Application.Services;

public class FlowchartService : IFlowchartService
{
    private readonly IPageRepository _pageRepository;

    public FlowchartService(IPageRepository pageRepository)
    {
        _pageRepository = pageRepository;
    }

    public async Task<FlowchartValidationResultDto> ValidateFlowchartAsync(FlowchartDataDto flowchart)
    {
        var result = new FlowchartValidationResultDto
        {
            IsValid = true,
            Errors = new List<string>(),
            Warnings = new List<string>()
        };

        // Validar nós
        if (flowchart.Nodes.Count == 0)
        {
            result.Errors.Add("O fluxograma não possui nós");
            result.IsValid = false;
        }

        // Verificar IDs duplicados
        var nodeIds = flowchart.Nodes.Select(n => n.Id).ToList();
        var duplicateNodeIds = nodeIds.GroupBy(x => x).Where(g => g.Count() > 1).Select(g => g.Key).ToList();
        if (duplicateNodeIds.Any())
        {
            result.Errors.Add($"IDs de nós duplicados: {string.Join(", ", duplicateNodeIds)}");
            result.IsValid = false;
        }

        // Verificar conexões
        foreach (var edge in flowchart.Edges)
        {
            if (!nodeIds.Contains(edge.Source))
            {
                result.Errors.Add($"Conexão inválida: nó de origem '{edge.Source}' não existe");
                result.IsValid = false;
            }

            if (!nodeIds.Contains(edge.Target))
            {
                result.Errors.Add($"Conexão inválida: nó de destino '{edge.Target}' não existe");
                result.IsValid = false;
            }
        }

        // Verificar nós desconectados
        var connectedNodes = new HashSet<string>();
        foreach (var edge in flowchart.Edges)
        {
            connectedNodes.Add(edge.Source);
            connectedNodes.Add(edge.Target);
        }

        var disconnectedNodes = nodeIds.Except(connectedNodes).ToList();
        if (disconnectedNodes.Any() && flowchart.Nodes.Count > 1)
        {
            result.Warnings.Add($"Nós desconectados: {disconnectedNodes.Count}");
        }

        // Gerar estatísticas
        result.Statistics = GenerateStatistics(flowchart, disconnectedNodes.Count);

        return await Task.FromResult(result);
    }

    public async Task<FlowchartStatisticsDto> GetStatisticsAsync(Guid pageId, Guid userId)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        // Verificar se o usuário tem acesso
        var group = await _pageRepository.GetGroupByPageIdAsync(pageId);
        if (group == null || !await HasAccessToWorkspace(group.WorkspaceId, userId))
        {
            throw new UnauthorizedAccessException("Acesso negado");
        }

        var flowchart = JsonSerializer.Deserialize<FlowchartDataDto>(page.Data)
            ?? new FlowchartDataDto();

        var nodeIds = flowchart.Nodes.Select(n => n.Id).ToHashSet();
        var connectedNodes = new HashSet<string>();
        foreach (var edge in flowchart.Edges)
        {
            connectedNodes.Add(edge.Source);
            connectedNodes.Add(edge.Target);
        }

        var disconnectedCount = nodeIds.Except(connectedNodes).Count();

        return GenerateStatistics(flowchart, disconnectedCount);
    }

    public async Task<byte[]> ExportFlowchartAsync(Guid pageId, Guid userId, string format)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        // Verificar se o usuário tem acesso
        var group = await _pageRepository.GetGroupByPageIdAsync(pageId);
        if (group == null || !await HasAccessToWorkspace(group.WorkspaceId, userId))
        {
            throw new UnauthorizedAccessException("Acesso negado");
        }

        var flowchart = JsonSerializer.Deserialize<FlowchartDataDto>(page.Data)
            ?? new FlowchartDataDto();

        return format.ToLower() switch
        {
            "json" => System.Text.Encoding.UTF8.GetBytes(JsonSerializer.Serialize(flowchart, new JsonSerializerOptions
            {
                WriteIndented = true
            })),
            _ => throw new NotSupportedException($"Formato '{format}' não suportado")
        };
    }

    private FlowchartStatisticsDto GenerateStatistics(FlowchartDataDto flowchart, int disconnectedCount)
    {
        var stats = new FlowchartStatisticsDto
        {
            TotalNodes = flowchart.Nodes.Count,
            TotalEdges = flowchart.Edges.Count,
            DisconnectedNodes = disconnectedCount,
            StartNodes = flowchart.Nodes.Count(n => n.Data.Type == "start"),
            EndNodes = flowchart.Nodes.Count(n => n.Data.Type == "end"),
            DecisionNodes = flowchart.Nodes.Count(n => n.Data.Type == "decision"),
            ProcessNodes = flowchart.Nodes.Count(n => n.Data.Type == "default" || string.IsNullOrEmpty(n.Data.Type))
        };

        // Detectar ciclos (simplificado)
        stats.HasCycles = DetectCycles(flowchart);

        return stats;
    }

    private bool DetectCycles(FlowchartDataDto flowchart)
    {
        // Implementação simplificada de detecção de ciclos usando DFS
        var graph = new Dictionary<string, List<string>>();

        foreach (var node in flowchart.Nodes)
        {
            graph[node.Id] = new List<string>();
        }

        foreach (var edge in flowchart.Edges)
        {
            if (graph.ContainsKey(edge.Source))
            {
                graph[edge.Source].Add(edge.Target);
            }
        }

        var visited = new HashSet<string>();
        var recStack = new HashSet<string>();

        foreach (var nodeId in graph.Keys)
        {
            if (HasCycleDFS(nodeId, graph, visited, recStack))
            {
                return true;
            }
        }

        return false;
    }

    private bool HasCycleDFS(string nodeId, Dictionary<string, List<string>> graph,
        HashSet<string> visited, HashSet<string> recStack)
    {
        if (recStack.Contains(nodeId))
            return true;

        if (visited.Contains(nodeId))
            return false;

        visited.Add(nodeId);
        recStack.Add(nodeId);

        if (graph.ContainsKey(nodeId))
        {
            foreach (var neighbor in graph[nodeId])
            {
                if (HasCycleDFS(neighbor, graph, visited, recStack))
                    return true;
            }
        }

        recStack.Remove(nodeId);
        return false;
    }

    private async Task<bool> HasAccessToWorkspace(Guid workspaceId, Guid userId)
    {
        // Implementar verificação de acesso ao workspace
        // Por enquanto retorna true
        return await Task.FromResult(true);
    }
}
