using Arc.Domain.Events;
using Arc.Application.Interfaces;
using MediatR;

namespace Arc.Application.EventHandlers;

public class TaskCreatedHandler : INotificationHandler<TaskCreatedEvent>
{
    private readonly IRealTimeService _realTimeService;

    public TaskCreatedHandler(IRealTimeService realTimeService)
    {
        _realTimeService = realTimeService;
    }

    public async Task Handle(TaskCreatedEvent notification, CancellationToken cancellationToken)
    {
        // Notificar clientes via SignalR
        await _realTimeService.NotifyGroupAsync(
            $"Workspace-{notification.WorkspaceId}", 
            "TaskCreated", 
            notification.Task
        );
    }
}
