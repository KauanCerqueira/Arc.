using System.Text.Json;
using Arc.Application.DTOs.Dashboard;
using Arc.Application.Interfaces;
using Arc.Domain.Interfaces;

namespace Arc.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IPageRepository _pageRepository;

    public DashboardService(IPageRepository pageRepository)
    {
        _pageRepository = pageRepository;
    }

    public async Task<DashboardDataDto> GetAsync(Guid pageId, Guid userId)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        await EnsureAccessAsync(pageId, userId);

        var data = JsonSerializer.Deserialize<DashboardDataDto>(page.Data)
                   ?? new DashboardDataDto();

        return data;
    }

    public async Task<DashboardWidgetDto> AddWidgetAsync(Guid pageId, Guid userId, DashboardWidgetDto widget)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        await EnsureAccessAsync(pageId, userId);

        var data = JsonSerializer.Deserialize<DashboardDataDto>(page.Data)
                   ?? new DashboardDataDto();

        // Garante ID
        widget.Id = string.IsNullOrWhiteSpace(widget.Id) ? Guid.NewGuid().ToString() : widget.Id;

        data.Widgets.Add(widget);

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;

        await _pageRepository.UpdateAsync(page);

        return widget;
    }

    public async Task<DashboardDataDto> UpdateAsync(Guid pageId, Guid userId, DashboardDataDto data)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        await EnsureAccessAsync(pageId, userId);

        // Normaliza widgets com IDs
        foreach (var w in data.Widgets)
        {
            if (string.IsNullOrWhiteSpace(w.Id))
            {
                w.Id = Guid.NewGuid().ToString();
            }
        }

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;

        await _pageRepository.UpdateAsync(page);

        return data;
    }

    public async Task DeleteWidgetAsync(Guid pageId, Guid userId, string widgetId)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        await EnsureAccessAsync(pageId, userId);

        var data = JsonSerializer.Deserialize<DashboardDataDto>(page.Data)
                   ?? new DashboardDataDto();

        var exists = data.Widgets.Any(w => w.Id == widgetId);
        if (!exists)
        {
            // Nada a fazer se não existe; idempotente
            return;
        }

        data.Widgets = data.Widgets.Where(w => w.Id != widgetId).ToList();

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;

        await _pageRepository.UpdateAsync(page);
    }

    public async Task ResetAsync(Guid pageId, Guid userId)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        await EnsureAccessAsync(pageId, userId);

        var empty = new DashboardDataDto();
        page.Data = JsonSerializer.Serialize(empty);
        page.AtualizadoEm = DateTime.UtcNow;

        await _pageRepository.UpdateAsync(page);
    }

    private async Task EnsureAccessAsync(Guid pageId, Guid userId)
    {
        // Verifica se o usuário tem acesso ao workspace da página
        var group = await _pageRepository.GetGroupByPageIdAsync(pageId);
        if (group == null)
        {
            throw new InvalidOperationException("Grupo não encontrado para a página");
        }

        var hasAccess = await HasAccessToWorkspace(group.WorkspaceId, userId);
        if (!hasAccess)
        {
            throw new UnauthorizedAccessException("Acesso negado");
        }
    }

    private Task<bool> HasAccessToWorkspace(Guid workspaceId, Guid userId)
    {
        // TODO: Implementar verificação real de acesso
        return Task.FromResult(true);
    }
}

