using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Scaffold.Business.Models.Config;
using Scaffold.Business.Services.Caching;
using Scaffold.Business.Services.RepoBases;

namespace Scaffold.Business;

public class UserAvatarService
{
    private readonly ILogger<UserAvatarService> _logger;
    private readonly UserAvatarRepository _repo;

    public UserAvatarService(
        ILogger<UserAvatarService> logger,
        UserAvatarRepository repo)
    {
        _logger = logger;
        _repo = repo;
    }

    public Task<UserAvatarObject?> GetByPersonIdAsync(string personId) =>
        _repo.GetByKeyAsync(personId);

    public async Task<UserAvatarObject> SaveAsync(UserAvatarObject avatar)
    {
        UserAvatarObject? existing = await _repo.GetByKeyAsync(avatar.PersonId);
        if (existing is null)
            return await _repo.InsertAsync(avatar);

        await _repo.UpdateAsync(avatar);
        return avatar;
    }
}

public partial class UserAvatarRepository : MappedTableRepository<UserAvatarObject>
{
    public UserAvatarRepository(
        ILogger<UserAvatarRepository> logger,
        IOptions<DataAccessSettings> config,
        MappedTableBinder tableBinder,
        IAppCache appCache,
        MappedTableChangeBus changeBus) : base(logger, config, appCache, tableBinder, changeBus)
    {
    }
}
