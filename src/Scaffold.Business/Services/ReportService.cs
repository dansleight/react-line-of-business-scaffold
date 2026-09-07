using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Scaffold.Business.Models.Config;
using Scaffold.Business.Services.RepoBases;

namespace Scaffold.Business;

public class ReportService
{
    private readonly ReportRepository _repo;

    public ReportService(ReportRepository repo)
    {
        _repo = repo;
    }

}

public class ReportRepository : DapperRepositoryBase
{
    public ReportRepository(
        ILogger<ReportRepository> logger,
        IOptions<DataAccessSettings> config
        ) : base(logger, config)
    {
    }

    // public async Task<ReportResultModel> WidgetsAsync()
    // {
    //     string sql = """
    //         SELECT  *
    //         FROM    dat_Widget
    //         """;
    //     return new ReportResultModel(await QueryAsync(sql), new ReportConfigModel("Widgets"));
    // }
}