using MediatR;

namespace Arc.Domain.Events;

public interface IDomainEvent : INotification
{
    DateTime OccurredOn { get; }
}
