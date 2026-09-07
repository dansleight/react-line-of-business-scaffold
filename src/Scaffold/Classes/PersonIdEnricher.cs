using Serilog.Core;
using Serilog.Events;

namespace Scaffold;

public sealed class PersonIdEnricher : ILogEventEnricher
{
    public const string PropertyName = "Username";

    private readonly IHttpContextAccessor _httpContextAccessor;

    public PersonIdEnricher(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
    {
        string? personId = _httpContextAccessor.HttpContext?.User.FindPersonId();
        if (string.IsNullOrEmpty(personId))
            return;

        logEvent.AddPropertyIfAbsent(propertyFactory.CreateProperty(PropertyName, personId));
    }
}