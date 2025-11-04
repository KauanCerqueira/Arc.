using Arc.Application.DTOs.Nutrition;

namespace Arc.Application.Interfaces;

public interface INutritionService
{
    Task<NutritionDataDto> GetAsync(Guid pageId, Guid userId);
    Task<MealEntryDto> AddAsync(Guid pageId, Guid userId, MealEntryDto entry);
    Task<MealEntryDto> UpdateAsync(Guid pageId, Guid userId, string entryId, MealEntryDto updated);
    Task DeleteAsync(Guid pageId, Guid userId, string entryId);
}

