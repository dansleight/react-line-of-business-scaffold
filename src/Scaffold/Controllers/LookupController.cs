using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Scaffold.Business;
using Scaffold.SpaModels;

namespace Scaffold.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
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
        List<LookupModel> models = [];
        return Ok(models);
    }
}

