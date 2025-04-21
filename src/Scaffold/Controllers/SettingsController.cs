using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Scaffold.SpaModels;

namespace Scaffold.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SettingsController : ControllerBase
{
    private readonly ILogger<SettingsController> _logger;
    private readonly IConfiguration _configuration;

    public SettingsController(
        ILogger<SettingsController> logger,
        IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    /// <summary>
    /// Gets the global settings necessary for the SPA to start, including MSAL settings for Authentication
    /// </summary>
    /// <returns></returns>
    [HttpGet]
    [ProducesResponseType(typeof(GlobalSettingsModel), 200)]
    public ActionResult Get()
    {
        try
        {
            string applicationMode = "Development";
            var model = new GlobalSettingsModel(applicationMode, _configuration);
            return Ok(model);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "");
            return StatusCode(500, ex);
        }
    }
}

