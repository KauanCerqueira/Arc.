using System.Text.Json;
using Arc.Application.DTOs.Workout;
using Arc.Application.Interfaces;
using Arc.Domain.Interfaces;

namespace Arc.Application.Services;

public class WorkoutService : IWorkoutService
{
    private readonly IPageRepository _pageRepository;

    public WorkoutService(IPageRepository pageRepository)
    {
        _pageRepository = pageRepository;
    }

    public async Task<WorkoutDataDto> GetAsync(Guid pageId, Guid userId)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<WorkoutDataDto>(page.Data) ?? new WorkoutDataDto();
        Recalc(data);
        return data;
    }

    public async Task<WorkoutEntryDto> AddAsync(Guid pageId, Guid userId, WorkoutEntryDto entry)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<WorkoutDataDto>(page.Data) ?? new WorkoutDataDto();

        entry.Id = string.IsNullOrWhiteSpace(entry.Id) ? Guid.NewGuid().ToString() : entry.Id;
        data.Entries.Add(entry);
        Recalc(data);

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
        return entry;
    }

    public async Task<WorkoutEntryDto> UpdateAsync(Guid pageId, Guid userId, string entryId, WorkoutEntryDto updated)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<WorkoutDataDto>(page.Data) ?? new WorkoutDataDto();
        var entry = data.Entries.FirstOrDefault(e => e.Id == entryId) ?? throw new InvalidOperationException("Entrada não encontrada");

        entry.Type = updated.Type;
        entry.Date = updated.Date;
        entry.DurationMinutes = updated.DurationMinutes;
        entry.Calories = updated.Calories;
        entry.Notes = updated.Notes;

        Recalc(data);
        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
        return entry;
    }

    public async Task DeleteAsync(Guid pageId, Guid userId, string entryId)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<WorkoutDataDto>(page.Data) ?? new WorkoutDataDto();
        data.Entries = data.Entries.Where(e => e.Id != entryId).ToList();
        Recalc(data);
        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
    }

    private static void Recalc(WorkoutDataDto data)
    {
        data.TotalWorkouts = data.Entries.Count;
        data.TotalMinutes = data.Entries.Sum(e => e.DurationMinutes);
        data.TotalCalories = data.Entries.Sum(e => e.Calories);
    }

    private async Task EnsureAccessAsync(Guid pageId, Guid userId)
    {
        var group = await _pageRepository.GetGroupByPageIdAsync(pageId) ?? throw new InvalidOperationException("Grupo não encontrado para a página");
        var has = await HasAccessToWorkspace(group.WorkspaceId, userId);
        if (!has) throw new UnauthorizedAccessException("Acesso negado");
    }

    private Task<bool> HasAccessToWorkspace(Guid workspaceId, Guid userId) => Task.FromResult(true);
}

