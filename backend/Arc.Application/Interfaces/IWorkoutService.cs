using Arc.Application.DTOs.Workout;

namespace Arc.Application.Interfaces;

public interface IWorkoutService
{
    Task<WorkoutDataDto> GetAsync(Guid pageId, Guid userId);
    Task<WorkoutEntryDto> AddAsync(Guid pageId, Guid userId, WorkoutEntryDto entry);
    Task<WorkoutEntryDto> UpdateAsync(Guid pageId, Guid userId, string entryId, WorkoutEntryDto updated);
    Task DeleteAsync(Guid pageId, Guid userId, string entryId);
}

