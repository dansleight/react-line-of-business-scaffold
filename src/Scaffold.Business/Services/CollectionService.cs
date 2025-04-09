using System;
using System.Dynamic;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Scaffold.Business.Models.Config;

namespace Scaffold.Business.Services;

public class CollectionService
{
    private readonly ILogger<CollectionService> _logger;
    private readonly CollectionRepository _repo;

    public CollectionService(
        ILogger<CollectionService> logger,
        CollectionRepository repo
    )
    {
        _logger = logger;
        _repo = repo;
    }

    public Task<IEnumerable<CollectionObject>> GetAsync() => _repo.GetAsnyc();

    public Task<CollectionObject?> GetById(int collectionId) => _repo.GetByIdAsync(collectionId);
    public Task<IEnumerable<CollectionObject>> GetByCollectionTypeAsync(CollectionType collectionType) => _repo.GetByCollectionTypeAsync(collectionType);
}

public partial class CollectionRepository : EfRepositoryBase<CollectionObject>
{
    private readonly DataAccessSettings _settings;
    private readonly string _connectionString;
    private readonly ILogger<CollectionRepository> _logger;

    public CollectionRepository(
        IOptions<DataAccessSettings> config,
        ILogger<CollectionRepository> logger) : base(config)
    {
        _settings = config.Value;
        _connectionString = _settings.ConnectionStrings!.Single(x => x.Key == "DefaultConnection").Value;
        _logger = logger;
    }

    public async Task<IEnumerable<CollectionObject>> GetByCollectionTypeAsync(CollectionType collectionType)
    {
        await Task.FromResult(0);
        IDictionary<string, object?> expandoObject = new ExpandoObject();
        expandoObject[nameof(CollectionObject.CollectionType)] = collectionType;
        var res = Get((ExpandoObject)expandoObject).OrderBy(x => x.Name);
        return res;
    }
}
