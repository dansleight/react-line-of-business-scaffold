using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Scaffold.Business;
using Scaffold.Business.Models.Config;
using Scaffold.Services;
using Scaffold.SpaModels;

namespace Scaffold.Controllers;

[Route("api/[controller]")]
[ApiController]
[ProducesResponseType(typeof(ApiError), 500)]
public class SettingsController : ControllerBase
{
    private readonly ILogger<SettingsController> _logger;
    private readonly IOptions<AppSettingsBase> _appSettings;
    private readonly IConfiguration _configuration;
    private readonly AvatarService _avatarService;

    public SettingsController(
        ILogger<SettingsController> logger,
        IOptions<AppSettingsBase> appSettings,
        IConfiguration configuration,
        AvatarService avatarService)
    {
        _logger = logger;
        _appSettings = appSettings;
        _configuration = configuration;
        _avatarService = avatarService;
    }

    /// <summary>
    /// Gets the global settings necessary for the SPA to start, including MSAL settings for Authentication
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(GlobalSettingsModel), 200)]
    public ActionResult Get()
    {
        string applicationMode = _appSettings.Value.ApplicationMode.ToString();
        var model = new GlobalSettingsModel(applicationMode, _configuration);
        return Ok(model);
    }

    /// <summary>
    /// Gets the current user's avatar (Graph, then Gravatar, then initials). Cached for seven days.
    /// </summary>
    [Authorize]
    [HttpGet("avatar")]
    [ProducesResponseType(typeof(FileContentResult), 200)]
    [ProducesResponseType(typeof(ApiError), 401)]
    public async Task<IActionResult> Avatar()
    {
        UserAvatarObject avatar = await _avatarService.GetAsync(User);
        return File(avatar.Content, avatar.ContentType);
    }

    /// <summary>
    /// Forces a refresh of the current user's avatar from Graph / Gravatar / initials.
    /// </summary>
    [Authorize]
    [HttpPost("avatar/refresh")]
    [ProducesResponseType(typeof(FileContentResult), 200)]
    [ProducesResponseType(typeof(ApiError), 401)]
    public async Task<IActionResult> RefreshAvatar()
    {
        UserAvatarObject avatar = await _avatarService.GetAsync(User, forceRefresh: true);
        return File(avatar.Content, avatar.ContentType);
    }
}
