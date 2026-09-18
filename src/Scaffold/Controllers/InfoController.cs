
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Scaffold.SpaModels;

[Authorize]
[Route("api/[controller]")]
[ApiController]
[ProducesResponseType(typeof(ApiError), 500)]
public class InfoController : ControllerBase
{
    private readonly ILogger<InfoController> _logger;
    private readonly IConfiguration _configuration;

    public InfoController(
        ILogger<InfoController> logger,
        IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    [HttpGet]
    [ProducesResponseType(typeof(UserInfoModel), 200)]
    public ActionResult GetUserInfoModel()
    {
        UserInfoModel userInfo = new UserInfoModel(User, _configuration);
        return Ok(userInfo);
    }
}