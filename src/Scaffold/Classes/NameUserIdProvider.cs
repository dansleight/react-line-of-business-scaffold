using Microsoft.AspNetCore.SignalR;

namespace Scaffold;

public class NameUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection) =>
        connection.User.FindPersonId() ?? connection.User?.Identity?.Name;
}
