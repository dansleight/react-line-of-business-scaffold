using Microsoft.AspNetCore.Diagnostics;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using Scaffold.Business.Models.Config;
using Scaffold.SpaModels;

namespace Scaffold;

public sealed class ApiExceptionHandler : IExceptionHandler
{
    private static readonly JsonSerializerSettings SerializerSettings = new()
    {
        ContractResolver = new CamelCasePropertyNamesContractResolver(),
        NullValueHandling = NullValueHandling.Ignore,
        Converters = { new StringEnumConverter() }
    };

    private readonly ILogger<ApiExceptionHandler> _logger;
    private readonly IOptions<AppSettingsBase> _appSettings;

    public ApiExceptionHandler(ILogger<ApiExceptionHandler> logger, IOptions<AppSettingsBase> appSettings)
    {
        _logger = logger;
        _appSettings = appSettings;
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        ApiError error = ApiError.FromException(exception, httpContext, _appSettings.Value.ApplicationMode);

        if (error.Status >= StatusCodes.Status500InternalServerError)
            _logger.LogError(exception, "Unhandled exception {TraceId}", error.TraceId);
        else
            _logger.LogWarning(exception, "Request failed {Code} {TraceId}", error.Code, error.TraceId);

        httpContext.Response.StatusCode = error.Status;
        httpContext.Response.ContentType = "application/json; charset=utf-8";
        await httpContext.Response.WriteAsync(JsonConvert.SerializeObject(error, SerializerSettings), cancellationToken);
        return true;
    }
}
