# HTTP

Two projects. `Scaffold/` is the host: middleware, authentication, controllers, SignalR, Swagger, and the SPA models the browser sees. `Scaffold.Business/` is objects, repositories, services, lookups, and cache. Lamar is the container. `Program.ConfigureContainer` registers the host. Business services are registered beside the repositories they use.

Controllers stay thin. They authorize, call a service, and return. Route tokens are slugified (`SlugifyParameterTransformer`), so an action named `GetById` is published in kebab case.

## Settings

`GET /api/settings` is anonymous. `SettingsController` returns `GlobalSettingsModel`, including `msalSettings` (`clientId`, `authority`, `apiScope`) read from the same `EntraId` section the API uses to validate tokens. Empty `msalSettings` means `TenantId`, `ClientId`, or `WebApiScope` did not load.

That payload is the whole Entra contract the SPA is allowed to see. Do not add the client secret to it.

## Errors

`ApiExceptionHandler` turns an exception into `ApiError`. Field failures are `ValidationException`:

```csharp
throw ValidationException.ForField(
    "name",
    "A widget with this name already exists.",
    "The inputs supplied to the API are invalid.");
```

`ForField` stores the key and the message. The key matches the SPA form field name (`name`, not `Name`). The SPA client throws `ApiError`, and `applyApiFieldErrors` copies those keys onto the inputs. A new error shape will not show up on the form.

Put the check on the service, next to the repository call:

```csharp
public async Task<WidgetObject> AddAsync(WidgetObject widget, string personId)
{
    await EnsureNameIsUniqueAsync(widget.Name, null);
    return await _repo.InsertAsync(widget, personId);
}
```

## What else the host owns

| Piece | Role |
|---|---|
| `Classes/AuthenticationStartupExtensions.cs` | JWT bearer events, Swagger's authorize button |
| `Classes/RoleMapping.cs` | Entra groups to app roles. See [authentication.md](authentication.md) |
| `Classes/ApiExceptionHandler.cs` | Exception to `ApiError` |
| `Hubs/NotificationsHub.cs` | SignalR at `/hub` |
| `SpaModels/` | Types that exist for the browser: settings, user info, `ApiError` |
| `ClientApp/dist` | The published SPA. The SPA production build writes it |

`ApplicationMode` in Development should be `"Development"`. CORS, Swagger, and exception detail follow that flag, not only `ASPNETCORE_ENVIRONMENT`.
