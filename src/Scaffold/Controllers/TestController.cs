using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Scaffold.SpaModels;

namespace Scaffold.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
[ProducesResponseType(typeof(ApiError), 400)]
[ProducesResponseType(typeof(ApiError), 401)]
[ProducesResponseType(typeof(ApiError), 404)]
[ProducesResponseType(typeof(ApiError), 500)]
public class TestController : ControllerBase
{
    private readonly ILogger<TestController> _logger;

    public TestController(ILogger<TestController> logger)
    {
        _logger = logger;
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(GoodModel), 200)]
    public ActionResult Get(int id)
    {
        if (id == -1)
            throw new InvalidOperationException("this error was intentionally thrown by specifying '-1' as the id value.");
        if (id < -1)
            throw new KeyNotFoundException();
        if (id == 0)
            return this.ApiBadRequest(
                "The value of '0' that was requested is not available to this user.",
                "Bad request triggered by id of 0");
        return Ok(new GoodModel(id));
    }
}
