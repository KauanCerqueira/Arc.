using Arc.Application.DTOs.Flowchart;

namespace Arc.Application.Interfaces;

public interface IFlowchartService
{
    Task<FlowchartValidationResultDto> ValidateFlowchartAsync(FlowchartDataDto flowchart);
    Task<FlowchartStatisticsDto> GetStatisticsAsync(Guid pageId, Guid userId);
    Task<byte[]> ExportFlowchartAsync(Guid pageId, Guid userId, string format);
}
