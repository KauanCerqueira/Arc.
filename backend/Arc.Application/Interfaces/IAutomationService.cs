using Arc.Application.DTOs.Automation;

namespace Arc.Application.Interfaces;

public interface IAutomationService
{
    // Catálogo de automações disponíveis
    List<AutomationDefinitionDto> GetAvailableAutomations(Guid userId);

    // Gerenciamento de automações
    Task<List<AutomationDto>> GetUserAutomationsAsync(Guid userId, Guid? workspaceId = null);
    Task<AutomationDto?> GetAutomationAsync(Guid userId, Guid automationId);
    Task<AutomationDto> CreateAutomationAsync(CreateAutomationDto createDto);
    Task<AutomationDto?> UpdateAutomationAsync(Guid userId, Guid automationId, UpdateAutomationDto updateDto);
    Task<bool> DeleteAutomationAsync(Guid userId, Guid automationId);
    Task<AutomationDto?> ToggleAutomationAsync(Guid userId, Guid automationId, bool isEnabled);

    // Execução de automações
    Task<AutomationRunResultDto?> RunAutomationAsync(Guid userId, Guid automationId, bool dryRun = false);

    // Estatísticas
    Task<AutomationStatsDto> GetStatisticsAsync(Guid userId, Guid? workspaceId = null);

    // Executores específicos de automações (chamados internamente)
    Task RunTasksToCalendarAutomationAsync(Guid automationId);
}
