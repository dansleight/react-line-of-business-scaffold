using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Scaffold.Hubs;

[Authorize]
public class NotificationsHub : Hub
{
    private readonly ILogger<NotificationsHub> _logger;

    public NotificationsHub(ILogger<NotificationsHub> logger)
    {
        _logger = logger;
    }

    public override Task OnConnectedAsync()
    {
        _logger.LogInformation("Notifications hub connected for {PersonId}", Context.User.FindPersonId() ?? "(unknown)");
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        if (exception is null)
            _logger.LogInformation("Notifications hub disconnected for {PersonId}", Context.User.FindPersonId() ?? "(unknown)");
        else
            _logger.LogWarning(exception, "Notifications hub disconnected for {PersonId}", Context.User.FindPersonId() ?? "(unknown)");

        return base.OnDisconnectedAsync(exception);
    }
}
