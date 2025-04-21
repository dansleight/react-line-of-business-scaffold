using System.Dynamic;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Scaffold.Business.Models.Config;

namespace Scaffold.Business.Services;

public class WidgetService
{
    private readonly ILogger<WidgetService> _logger;
    private readonly WidgetRepository _repo;

    public WidgetService(
        ILogger<WidgetService> logger,
        WidgetRepository repo
    )
    {
        _logger = logger;
        _repo = repo;
    }

    public Task<IEnumerable<WidgetObject>> GetAsync() => _repo.GetAsnyc();

    public Task<WidgetObject?> GetById(int collectionId) => _repo.GetByIdAsync(collectionId);
    public Task<IEnumerable<WidgetObject>> GetByNameAsync(string name) => _repo.GetByNameAsync(name);
    public async Task<WidgetObject> AddAsync(WidgetObject widget)
    {
        var res = await _repo.AddAsync(widget);
        _repo.SaveChanges();
        return res.Entity;
    }
}

public partial class WidgetRepository : EfRepositoryBase<WidgetObject>
{
    private readonly DataAccessSettings _settings;
    private readonly string _connectionString;
    private readonly ILogger<WidgetRepository> _logger;

    public WidgetRepository(
        IOptions<DataAccessSettings> config,
        ILogger<WidgetRepository> logger) : base(config)
    {
        _settings = config.Value;
        _connectionString = _settings.ConnectionStrings!.Single(x => x.Key == "DefaultConnection").Value;
        _logger = logger;
    }

    public async Task<IEnumerable<WidgetObject>> GetByNameAsync(string name)
    {
        await Task.FromResult(0);
        IDictionary<string, object?> expandoObject = new ExpandoObject();
        expandoObject[nameof(WidgetObject.Name)] = name;
        var res = Get((ExpandoObject)expandoObject).OrderBy(x => x.Name);
        return res;
    }
}