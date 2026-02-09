using Arc.Application.Interfaces;
using Arc.Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Arc.Infrastructure.Services;

public class SignalRRealTimeService : IRealTimeService
{
    private readonly IHubContext<ArcHub> _hubContext;

    public SignalRRealTimeService(IHubContext<ArcHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyGroupAsync(string groupName, string method, object data)
    {
        await _hubContext.Clients.Group(groupName).SendAsync(method, data);
    }

    public async Task NotifyUserAsync(string userId, string method, object data)
    {
        await _hubContext.Clients.User(userId).SendAsync(method, data);
    }
}
