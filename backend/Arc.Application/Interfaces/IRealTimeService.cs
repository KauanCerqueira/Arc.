namespace Arc.Application.Interfaces;

public interface IRealTimeService
{
    Task NotifyGroupAsync(string groupName, string method, object data);
    Task NotifyUserAsync(string userId, string method, object data);
}
