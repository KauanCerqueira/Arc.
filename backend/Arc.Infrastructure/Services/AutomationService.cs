using Arc.Application.DTOs.Automation;
using Arc.Application.Interfaces;
using Arc.Domain.Entities;
using Arc.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace Arc.Infrastructure.Services;

public class AutomationService : IAutomationService
{
    private readonly AppDbContext _context;
    private readonly ILogger<AutomationService> _logger;

    public AutomationService(AppDbContext context, ILogger<AutomationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    #region Catálogo de Automações

    public List<AutomationDefinitionDto> GetAvailableAutomations(Guid userId)
    {
        // Define o catálogo de automações disponíveis
        return new List<AutomationDefinitionDto>
        {
            new AutomationDefinitionDto
            {
                Type = "tasks-to-calendar",
                Name = "Tarefas no Calendário",
                Description = "Adiciona automaticamente tarefas com prazo ao calendário",
                Icon = "Calendar",
                Category = "productivity",
                RequiresIntegration = false,
                IsAvailable = true,
                SettingsSchema = new List<AutomationSettingDefinitionDto>
                {
                    new AutomationSettingDefinitionDto
                    {
                        Key = "taskStatuses",
                        Label = "Status das tarefas",
                        Description = "Quais status de tarefas incluir no calendário",
                        Type = "multiselect",
                        Required = true,
                        DefaultValue = new List<string> { "todo", "in_progress" },
                        Options = new List<AutomationSettingOptionDto>
                        {
                            new AutomationSettingOptionDto { Value = "todo", Label = "A Fazer" },
                            new AutomationSettingOptionDto { Value = "in_progress", Label = "Em Progresso" },
                            new AutomationSettingOptionDto { Value = "done", Label = "Concluído" }
                        }
                    },
                    new AutomationSettingDefinitionDto
                    {
                        Key = "addAsAllDayEvents",
                        Label = "Eventos de dia inteiro",
                        Description = "Adicionar tarefas como eventos de dia inteiro",
                        Type = "boolean",
                        Required = false,
                        DefaultValue = true
                    },
                    new AutomationSettingDefinitionDto
                    {
                        Key = "defaultCategory",
                        Label = "Categoria padrão",
                        Description = "Categoria para os eventos criados",
                        Type = "select",
                        Required = false,
                        DefaultValue = "task",
                        Options = new List<AutomationSettingOptionDto>
                        {
                            new AutomationSettingOptionDto { Value = "task", Label = "Tarefa" },
                            new AutomationSettingOptionDto { Value = "deadline", Label = "Prazo" },
                            new AutomationSettingOptionDto { Value = "personal", Label = "Pessoal" }
                        }
                    }
                }
            },
            // Futuras automações (exemplo)
            new AutomationDefinitionDto
            {
                Type = "github-to-tasks",
                Name = "GitHub Issues para Tarefas",
                Description = "Sincroniza issues do GitHub como tarefas",
                Icon = "GitHub",
                Category = "integration",
                RequiresIntegration = true,
                RequiredIntegrations = new List<string> { "github" },
                IsAvailable = false, // Ainda não implementado
                SettingsSchema = new List<AutomationSettingDefinitionDto>()
            }
        };
    }

    #endregion

    #region CRUD de Automações

    public async Task<List<AutomationDto>> GetUserAutomationsAsync(Guid userId, Guid? workspaceId = null)
    {
        var query = _context.AutomationConfigurations
            .Where(a => a.UserId == userId);

        if (workspaceId.HasValue)
        {
            query = query.Where(a => a.WorkspaceId == workspaceId.Value);
        }

        var automations = await query.ToListAsync();

        return automations.Select(MapToDto).ToList();
    }

    public async Task<AutomationDto?> GetAutomationAsync(Guid userId, Guid automationId)
    {
        var automation = await _context.AutomationConfigurations
            .FirstOrDefaultAsync(a => a.Id == automationId && a.UserId == userId);

        return automation == null ? null : MapToDto(automation);
    }

    public async Task<AutomationDto> CreateAutomationAsync(CreateAutomationDto createDto)
    {
        // Verifica se já existe automação do mesmo tipo para o usuário/workspace
        var existingAutomation = await _context.AutomationConfigurations
            .FirstOrDefaultAsync(a =>
                a.UserId == createDto.UserId &&
                a.WorkspaceId == createDto.WorkspaceId &&
                a.AutomationType == createDto.AutomationType);

        if (existingAutomation != null)
        {
            throw new InvalidOperationException("Já existe uma automação deste tipo configurada para este workspace");
        }

        var automation = new AutomationConfiguration
        {
            Id = Guid.NewGuid(),
            UserId = createDto.UserId,
            WorkspaceId = createDto.WorkspaceId,
            AutomationType = createDto.AutomationType,
            IsEnabled = createDto.IsEnabled,
            Settings = createDto.Settings,
            Status = AutomationStatus.Idle,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.AutomationConfigurations.Add(automation);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Automação {Type} criada com sucesso para usuário {UserId}",
            automation.AutomationType, automation.UserId);

        return MapToDto(automation);
    }

    public async Task<AutomationDto?> UpdateAutomationAsync(Guid userId, Guid automationId, UpdateAutomationDto updateDto)
    {
        var automation = await _context.AutomationConfigurations
            .FirstOrDefaultAsync(a => a.Id == automationId && a.UserId == userId);

        if (automation == null)
        {
            return null;
        }

        if (updateDto.IsEnabled.HasValue)
        {
            automation.IsEnabled = updateDto.IsEnabled.Value;
        }

        if (updateDto.Settings != null)
        {
            automation.Settings = updateDto.Settings;
        }

        automation.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Automação {Id} atualizada com sucesso", automationId);

        return MapToDto(automation);
    }

    public async Task<bool> DeleteAutomationAsync(Guid userId, Guid automationId)
    {
        var automation = await _context.AutomationConfigurations
            .FirstOrDefaultAsync(a => a.Id == automationId && a.UserId == userId);

        if (automation == null)
        {
            return false;
        }

        _context.AutomationConfigurations.Remove(automation);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Automação {Id} deletada com sucesso", automationId);

        return true;
    }

    public async Task<AutomationDto?> ToggleAutomationAsync(Guid userId, Guid automationId, bool isEnabled)
    {
        var automation = await _context.AutomationConfigurations
            .FirstOrDefaultAsync(a => a.Id == automationId && a.UserId == userId);

        if (automation == null)
        {
            return null;
        }

        automation.IsEnabled = isEnabled;
        automation.UpdatedAt = DateTime.UtcNow;

        if (!isEnabled)
        {
            automation.Status = AutomationStatus.Paused;
        }
        else if (automation.Status == AutomationStatus.Paused)
        {
            automation.Status = AutomationStatus.Idle;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Automação {Id} {Status}", automationId, isEnabled ? "ativada" : "desativada");

        return MapToDto(automation);
    }

    #endregion

    #region Execução de Automações

    public async Task<AutomationRunResultDto?> RunAutomationAsync(Guid userId, Guid automationId, bool dryRun = false)
    {
        var automation = await _context.AutomationConfigurations
            .FirstOrDefaultAsync(a => a.Id == automationId && a.UserId == userId);

        if (automation == null)
        {
            return null;
        }

        var result = new AutomationRunResultDto
        {
            AutomationId = automationId,
            StartedAt = DateTime.UtcNow,
            Success = true,
            Logs = new List<string>()
        };

        try
        {
            result.Logs.Add($"Iniciando execução da automação {automation.AutomationType}");

            if (!dryRun)
            {
                automation.Status = AutomationStatus.Running;
                await _context.SaveChangesAsync();
            }

            // Executa a automação específica
            switch (automation.AutomationType)
            {
                case "tasks-to-calendar":
                    result.ItemsProcessed = await ExecuteTasksToCalendarAsync(automation, result.Logs, dryRun);
                    break;

                default:
                    throw new NotImplementedException($"Automação {automation.AutomationType} não implementada");
            }

            result.Success = true;
            result.Logs.Add($"Automação executada com sucesso. {result.ItemsProcessed} itens processados");

            if (!dryRun)
            {
                automation.Status = AutomationStatus.Success;
                automation.LastRunAt = DateTime.UtcNow;
                automation.ItemsProcessed = result.ItemsProcessed;
                automation.ErrorMessage = null;
            }
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.ErrorMessage = ex.Message;
            result.Logs.Add($"Erro: {ex.Message}");

            _logger.LogError(ex, "Erro ao executar automação {Id}", automationId);

            if (!dryRun)
            {
                automation.Status = AutomationStatus.Failed;
                automation.ErrorMessage = ex.Message;
            }
        }
        finally
        {
            result.CompletedAt = DateTime.UtcNow;
            result.Duration = result.CompletedAt - result.StartedAt;

            if (!dryRun)
            {
                await _context.SaveChangesAsync();
            }
        }

        return result;
    }

    public async Task RunTasksToCalendarAutomationAsync(Guid automationId)
    {
        var automation = await _context.AutomationConfigurations
            .FindAsync(automationId);

        if (automation == null || !automation.IsEnabled)
        {
            return;
        }

        await RunAutomationAsync(automation.UserId, automationId, false);
    }

    #endregion

    #region Estatísticas

    public async Task<AutomationStatsDto> GetStatisticsAsync(Guid userId, Guid? workspaceId = null)
    {
        var query = _context.AutomationConfigurations
            .Where(a => a.UserId == userId);

        if (workspaceId.HasValue)
        {
            query = query.Where(a => a.WorkspaceId == workspaceId.Value);
        }

        var automations = await query.ToListAsync();

        var stats = new AutomationStatsDto
        {
            TotalAutomations = automations.Count,
            EnabledAutomations = automations.Count(a => a.IsEnabled),
            RunningAutomations = automations.Count(a => a.Status == AutomationStatus.Running),
            FailedAutomations = automations.Count(a => a.Status == AutomationStatus.Failed),
            TotalItemsProcessed = automations.Sum(a => a.ItemsProcessed),
            LastSuccessfulRun = automations
                .Where(a => a.Status == AutomationStatus.Success && a.LastRunAt.HasValue)
                .Max(a => (DateTime?)a.LastRunAt),
            ByType = automations
                .GroupBy(a => a.AutomationType)
                .Select(g => new AutomationTypeStatsDto
                {
                    AutomationType = g.Key,
                    Count = g.Count(),
                    EnabledCount = g.Count(a => a.IsEnabled),
                    TotalItemsProcessed = g.Sum(a => a.ItemsProcessed)
                })
                .ToList()
        };

        return stats;
    }

    #endregion

    #region Executores Específicos

    private async Task<int> ExecuteTasksToCalendarAsync(AutomationConfiguration automation, List<string> logs, bool dryRun)
    {
        logs.Add("Executando automação Tasks to Calendar");

        // Parse das configurações
        var settings = string.IsNullOrEmpty(automation.Settings)
            ? new TasksToCalendarSettingsDto()
            : JsonSerializer.Deserialize<TasksToCalendarSettingsDto>(automation.Settings) ?? new TasksToCalendarSettingsDto();

        logs.Add($"Settings: Statuses={string.Join(",", settings.TaskStatuses)}, AllDay={settings.AddAsAllDayEvents}");

        // Buscar páginas do workspace
        var pagesQuery = _context.Pages
            .Include(p => p.Group)
            .Where(p => p.Group.Workspace.Id == automation.WorkspaceId);

        if (settings.IncludePageIds != null && settings.IncludePageIds.Any())
        {
            pagesQuery = pagesQuery.Where(p => settings.IncludePageIds.Contains(p.Id));
        }

        var pages = await pagesQuery.ToListAsync();
        logs.Add($"Encontradas {pages.Count} páginas para processar");

        int itemsProcessed = 0;

        foreach (var page in pages)
        {
            // Parse do JSON da página para encontrar tarefas
            if (string.IsNullOrEmpty(page.Data))
            {
                continue;
            }

            try
            {
                using var doc = JsonDocument.Parse(page.Data);
                var root = doc.RootElement;

                // Verifica se é uma página de tarefas
                if (root.TryGetProperty("tasks", out var tasksElement))
                {
                    // TODO: Implementar lógica de extração de tarefas e adição ao calendário
                    // Por enquanto, apenas conta as tarefas encontradas
                    logs.Add($"Página {page.Nome}: tarefas encontradas");
                    itemsProcessed++;
                }
            }
            catch (JsonException ex)
            {
                logs.Add($"Erro ao parsear página {page.Nome}: {ex.Message}");
            }
        }

        logs.Add($"Total de itens processados: {itemsProcessed}");

        return itemsProcessed;
    }

    #endregion

    #region Helpers

    private static AutomationDto MapToDto(AutomationConfiguration automation)
    {
        return new AutomationDto
        {
            Id = automation.Id,
            UserId = automation.UserId,
            WorkspaceId = automation.WorkspaceId,
            AutomationType = automation.AutomationType,
            IsEnabled = automation.IsEnabled,
            Settings = automation.Settings,
            LastRunAt = automation.LastRunAt,
            NextRunAt = automation.NextRunAt,
            ItemsProcessed = automation.ItemsProcessed,
            ErrorMessage = automation.ErrorMessage,
            Status = automation.Status,
            Metadata = automation.Metadata,
            CreatedAt = automation.CreatedAt,
            UpdatedAt = automation.UpdatedAt
        };
    }

    #endregion
}
