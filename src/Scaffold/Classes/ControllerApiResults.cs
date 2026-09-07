using Microsoft.AspNetCore.Mvc;
using Scaffold.SpaModels;

namespace Scaffold;

public static class ControllerApiResults
{
    public static NotFoundObjectResult ApiNotFound(this ControllerBase controller, string? userMessage = null) =>
        controller.NotFound(ApiError.NotFound(controller.HttpContext, userMessage));

    public static BadRequestObjectResult ApiBadRequest(this ControllerBase controller, string userMessage, string? message = null) =>
        controller.BadRequest(ApiError.BadRequest(controller.HttpContext, userMessage, message));

    public static UnauthorizedObjectResult ApiUnauthorized(this ControllerBase controller, string? userMessage = null) =>
        controller.Unauthorized(ApiError.Unauthorized(controller.HttpContext, userMessage));
}
