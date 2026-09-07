using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Scaffold.Business.Services.RepoBases;

public sealed class MappedTableChangeBus
{
    private readonly IServiceProvider _services;
    private readonly ILogger<MappedTableChangeBus> _logger;

    public MappedTableChangeBus(IServiceProvider services, ILogger<MappedTableChangeBus> logger)
    {
        _services = services;
        _logger = logger;
    }

    public async Task PublishAsync(MappedTableChange change, CancellationToken cancellationToken = default)
    {
        foreach (IMappedTableChangeHandler handler in _services.GetServices<IMappedTableChangeHandler>())
        {
            try
            {
                await handler.HandleAsync(change, cancellationToken).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Mapped table change handler {Handler} failed for {EntityType} {Kind}",
                    handler.GetType().Name, change.EntityTypeName, change.Kind);
            }
        }
    }
}

internal sealed class DelegateMappedTableChangeHandler : IMappedTableChangeHandler
{
    private readonly Func<MappedTableChange, CancellationToken, Task> _handler;

    public DelegateMappedTableChangeHandler(Func<MappedTableChange, CancellationToken, Task> handler)
    {
        _handler = handler;
    }

    public Task HandleAsync(MappedTableChange change, CancellationToken cancellationToken = default) =>
        _handler(change, cancellationToken);
}
