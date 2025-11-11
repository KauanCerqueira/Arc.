using Arc.Domain.Entities;

namespace Arc.Domain.Interfaces;

public interface ISprintTaskRepository
{
    Task<SprintTask?> GetByIdAsync(Guid id);
    Task<List<SprintTask>> GetBySprintIdAsync(Guid sprintId);
    Task<SprintTask> CreateAsync(SprintTask task);
    Task<SprintTask> UpdateAsync(SprintTask task);
    Task DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task<int> GetMaxOrderBySprintIdAsync(Guid sprintId);
}
