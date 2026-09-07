using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Scaffold.Business.Models.Config;

namespace Scaffold.SpaModels;

public class ApiError
{
    public int Status { get; set; }

    public string Code { get; set; } = "unhandled";

    public string UserMessage { get; set; } = "";

    [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
    public string? Message { get; set; }

    public string TraceId { get; set; } = "";

    [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
    public Dictionary<string, string[]>? Errors { get; set; }

    [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
    public ApiErrorException? Exception { get; set; }

    public static ApiError FromException(Exception exception, HttpContext httpContext, ApplicationMode mode)
    {
        string traceId = httpContext.TraceIdentifier;
        (int status, string code, string userMessage) = Map(exception, traceId);

        var error = new ApiError
        {
            Status = status,
            Code = code,
            UserMessage = userMessage,
            Message = $"{exception.GetType().Name}: {exception.Message}",
            TraceId = traceId
        };

        if (mode == ApplicationMode.Development)
            error.Exception = ApiErrorException.From(exception);

        return error;
    }

    public static ApiError FromModelState(ActionContext context)
    {
        var errors = new Dictionary<string, string[]>();
        foreach (var pair in context.ModelState)
        {
            string[] messages = pair.Value.Errors
                .Select(e => string.IsNullOrEmpty(e.ErrorMessage)
                    ? "The input was not valid."
                    : Regex.Replace(e.ErrorMessage, "<[a-zA-Z/].*?>", string.Empty))
                .ToArray();
            if (messages.Length > 0)
                errors[pair.Key] = messages;
        }

        return new ApiError
        {
            Status = StatusCodes.Status400BadRequest,
            Code = "validation",
            UserMessage = "The inputs supplied to the API are invalid.",
            Message = "Invalid arguments to the API",
            TraceId = context.HttpContext.TraceIdentifier,
            Errors = errors.Count > 0 ? errors : null
        };
    }

    public static ApiError NotFound(HttpContext httpContext, string? userMessage = null) =>
        new()
        {
            Status = StatusCodes.Status404NotFound,
            Code = "not_found",
            UserMessage = userMessage ?? "The requested resource was not found.",
            TraceId = httpContext.TraceIdentifier
        };

    public static ApiError BadRequest(HttpContext httpContext, string userMessage, string? message = null) =>
        new()
        {
            Status = StatusCodes.Status400BadRequest,
            Code = "invalid",
            UserMessage = userMessage,
            Message = message,
            TraceId = httpContext.TraceIdentifier
        };

    public static ApiError Unauthorized(HttpContext httpContext, string? userMessage = null) =>
        new()
        {
            Status = StatusCodes.Status401Unauthorized,
            Code = "unauthorized",
            UserMessage = userMessage ?? "You are not authorized to perform this action.",
            TraceId = httpContext.TraceIdentifier
        };

    private static (int Status, string Code, string UserMessage) Map(Exception exception, string traceId) =>
        exception switch
        {
            KeyNotFoundException => (StatusCodes.Status404NotFound, "not_found", "The requested resource was not found."),
            UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, "unauthorized", "You are not authorized to perform this action."),
            ArgumentException => (StatusCodes.Status400BadRequest, "invalid", "The request is invalid."),
            _ => (StatusCodes.Status500InternalServerError, "unhandled", $"Something went wrong. Reference {traceId}.")
        };
}

public class ApiErrorException
{
    public string Type { get; set; } = "";

    [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
    public string? Message { get; set; }

    [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
    public string? StackTrace { get; set; }

    [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
    public ApiErrorException? Inner { get; set; }

    public static ApiErrorException From(Exception exception) =>
        new()
        {
            Type = exception.GetType().FullName ?? exception.GetType().Name,
            Message = exception.Message,
            StackTrace = exception.StackTrace,
            Inner = exception.InnerException is null ? null : From(exception.InnerException)
        };
}
