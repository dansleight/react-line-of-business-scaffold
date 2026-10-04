using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Scaffold.Business;
using Scaffold.SpaModels;

namespace Scaffold.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
[ProducesResponseType(typeof(ApiError), 400)]
[ProducesResponseType(typeof(ApiError), 401)]
[ProducesResponseType(typeof(ApiError), 404)]
[ProducesResponseType(typeof(ApiError), 500)]
public class LookupController : ControllerBase
{
    private readonly ILogger<LookupController> _logger;

    public LookupController(
        ILogger<LookupController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<LookupModel>), 200)]
    public async Task<ActionResult> All()
    {
        await Task.CompletedTask;
        List<LookupModel> models = [];
        return Ok(models);
    }

    [HttpGet("type/{lookupType}")]
    [ProducesResponseType(typeof(LookupModel), 200)]
    public async Task<ActionResult> Type(LookupType lookupType)
    {
        await Task.CompletedTask;
        switch (lookupType)
        {
            case LookupType.Unknown:
            default:
                return BadRequest("Unknown Lookup Type provided.");
        }
    }
}
