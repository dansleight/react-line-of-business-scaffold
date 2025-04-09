using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Scaffold.Business;
using Scaffold.Business.Services;
using Scaffold.SpaModels;

namespace Scaffold.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProfileController : ControllerBase
{
    private readonly ILogger<ProfileController> _logger;
    private readonly CollectionService _collectionService;

    public ProfileController(
        ILogger<ProfileController> logger,
        CollectionService collectionService
    )
    {
        _logger = logger;
        _collectionService = collectionService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<CollectionObject>), 200)]
    [ProducesResponseType(typeof(string), 500)]
    public async Task<ActionResult> Get()
    {
        // IEnumerable<CollectionObject> test = await _collectionService.GetAsync();
        IEnumerable<CollectionObject> test = await _collectionService.GetByCollectionTypeAsync(CollectionType.Default);
        return Ok(test);
        // try
        // {
        // }
        // catch (Exception e)
        // {
        //     _logger.LogError(e, "");
        //     return StatusCode(500, e.Message);
        // }
    }
}