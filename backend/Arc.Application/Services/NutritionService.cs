using System.Text.Json;
using Arc.Application.DTOs.Nutrition;
using Arc.Application.Interfaces;
using Arc.Domain.Interfaces;

namespace Arc.Application.Services;

public class NutritionService : INutritionService
{
    private readonly IPageRepository _pageRepository;

    public NutritionService(IPageRepository pageRepository)
    {
        _pageRepository = pageRepository;
    }

    public async Task<NutritionDataDto> GetAsync(Guid pageId, Guid userId)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<NutritionDataDto>(page.Data) ?? new NutritionDataDto();
        Recalc(data);
        return data;
    }

    public async Task<MealEntryDto> AddAsync(Guid pageId, Guid userId, MealEntryDto entry)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<NutritionDataDto>(page.Data) ?? new NutritionDataDto();

        entry.Id = string.IsNullOrWhiteSpace(entry.Id) ? Guid.NewGuid().ToString() : entry.Id;
        data.Meals.Add(entry);
        Recalc(data);

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
        return entry;
    }

    public async Task<MealEntryDto> UpdateAsync(Guid pageId, Guid userId, string entryId, MealEntryDto updated)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<NutritionDataDto>(page.Data) ?? new NutritionDataDto();
        var entry = data.Meals.FirstOrDefault(e => e.Id == entryId) ?? throw new InvalidOperationException("Refeição não encontrada");

        entry.Type = updated.Type;
        entry.Date = updated.Date;
        entry.Calories = updated.Calories;
        entry.Protein = updated.Protein;
        entry.Carbs = updated.Carbs;
        entry.Fat = updated.Fat;
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
        var data = JsonSerializer.Deserialize<NutritionDataDto>(page.Data) ?? new NutritionDataDto();
        data.Meals = data.Meals.Where(e => e.Id != entryId).ToList();
        Recalc(data);
        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
    }

    private static void Recalc(NutritionDataDto data)
    {
        data.TotalCalories = data.Meals.Sum(m => m.Calories);
        data.TotalProtein = data.Meals.Sum(m => m.Protein);
        data.TotalCarbs = data.Meals.Sum(m => m.Carbs);
        data.TotalFat = data.Meals.Sum(m => m.Fat);
    }

    private async Task EnsureAccessAsync(Guid pageId, Guid userId)
    {
        var group = await _pageRepository.GetGroupByPageIdAsync(pageId) ?? throw new InvalidOperationException("Grupo não encontrado para a página");
        var has = await HasAccessToWorkspace(group.WorkspaceId, userId);
        if (!has) throw new UnauthorizedAccessException("Acesso negado");
    }

    private Task<bool> HasAccessToWorkspace(Guid workspaceId, Guid userId) => Task.FromResult(true);
}

