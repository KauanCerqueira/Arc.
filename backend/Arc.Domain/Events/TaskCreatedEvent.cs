using Arc.Domain.Entities;

namespace Arc.Domain.Events;

public class TaskCreatedEvent : IDomainEvent
{
    public SprintTask Task { get; }
    public Guid WorkspaceId { get; }
    public DateTime OccurredOn { get; }

    public TaskCreatedEvent(SprintTask task, Guid workspaceId)
    {
        Task = task;
        WorkspaceId = workspaceId;
        OccurredOn = DateTime.UtcNow;
    }
}
