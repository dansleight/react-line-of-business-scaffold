using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Scaffold.Business;
using Scaffold.Business.Services;
using Scaffold.SpaModels;

namespace Scaffold.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class WidgetController : ControllerBase
{
    private readonly ILogger<WidgetController> _logger;
    private readonly WidgetService _widgetService;

    public WidgetController(
        ILogger<WidgetController> logger,
        WidgetService widgetService
    )
    {
        _logger = logger;
        _widgetService = widgetService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<WidgetObject>), 200)]
    public async Task<ActionResult> Get()
    {
        try
        {
            IEnumerable<WidgetObject> widgets = await _widgetService.GetAsync();
            return Ok(widgets);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "");
            return StatusCode(500, e);
        }
    }

    [HttpPost]
    [ProducesResponseType(typeof(WidgetObject), 200)]
    public async Task<ActionResult> Add(AddWidgetModel model)
    {
        try
        {
            var res = await _widgetService.AddAsync(model.ToWidgetObject());
            return Ok(res);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "");
            return StatusCode(500, e);
        }
    }
}