namespace Scaffold.Business.Services.RepoBases;

public interface IMappedTableChangeHandler
{
    Task HandleAsync(MappedTableChange change, CancellationToken cancellationToken = default);
}
