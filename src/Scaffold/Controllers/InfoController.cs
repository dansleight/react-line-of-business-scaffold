
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Scaffold.Business;
using Scaffold.Services;
using Scaffold.SpaModels;
using Swashbuckle.AspNetCore.Annotations;

[Authorize]
[Route("api/[controller]")]
[ApiController]
[ProducesResponseType(typeof(ApiError), 500)]
public class InfoController : ControllerBase
{
    private readonly ILogger<InfoController> _logger;
    private readonly IConfiguration _configuration;
    private readonly AvatarService _avatarService;

    public InfoController(
        ILogger<InfoController> logger,
        IConfiguration configuration,
        AvatarService avatarService)
    {
        _logger = logger;
        _configuration = configuration;
        _avatarService = avatarService;
    }

    [HttpGet]
    [SwaggerOperation(OperationId = "getUserInfo")]
    [ProducesResponseType(typeof(UserInfoModel), 200)]
    public ActionResult GetUserInfoModel()
    {
        UserInfoModel userInfo = new UserInfoModel(User, _configuration);
        return Ok(userInfo);
    }

    /// <summary>
    /// Gets the current user's avatar (Graph, then Gravatar, then initials). Cached for seven days.
    /// </summary>
    [HttpGet("avatar")]
    [SwaggerOperation(OperationId = "getUserAvatar")]
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
    [HttpPost("avatar/refresh")]
    [SwaggerOperation(OperationId = "refreshUserAvatar")]
    [ProducesResponseType(typeof(FileContentResult), 200)]
    [ProducesResponseType(typeof(ApiError), 401)]
    public async Task<IActionResult> RefreshAvatar()
    {
        UserAvatarObject avatar = await _avatarService.GetAsync(User, forceRefresh: true);
        return File(avatar.Content, avatar.ContentType);
    }
}