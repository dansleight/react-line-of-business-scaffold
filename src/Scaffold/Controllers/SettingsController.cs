using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Scaffold.Business.Models.Config;
using Scaffold.SpaModels;
using Swashbuckle.AspNetCore.Annotations;

namespace Scaffold.Controllers;

[Route("api/[controller]")]
[ApiController]
[ProducesResponseType(typeof(ApiError), 500)]
public class SettingsController : ControllerBase
{
    private readonly ILogger<SettingsController> _logger;
    private readonly IOptions<AppSettingsBase> _appSettings;
    private readonly IConfiguration _configuration;

    public SettingsController(
        ILogger<SettingsController> logger,
        IOptions<AppSettingsBase> appSettings,
        IConfiguration configuration)
    {
        _logger = logger;
        _appSettings = appSettings;
        _configuration = configuration;
    }

    /// <summary>
    /// Gets the global settings necessary for the SPA to start, including MSAL settings for Authentication
    /// </summary>
    [HttpGet]
    [SwaggerOperation(OperationId = "GetSettings")]
    [ProducesResponseType(typeof(GlobalSettingsModel), 200)]
    public ActionResult Get()
    {
        string applicationMode = _appSettings.Value.ApplicationMode.ToString();
        var model = new GlobalSettingsModel(applicationMode, _configuration);
        return Ok(model);
    }
}
