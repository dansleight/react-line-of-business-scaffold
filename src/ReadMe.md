# Backend (C# Web API)

This folder is the ASP.NET Core host (`{Namespace}/`) and the business library (`{Namespace}.Business/`). After `setup`, names match the namespace you typed.

The API is a JWT bearer resource. The SPA does not put Entra values in its own env files: it calls **`GET /api/settings`** (anonymous) and receives `clientId`, `authority`, and `apiScope`. Those values are read from the **same** `EntraId` section the API uses to validate tokens. Keep that section correct and both sides line up.

## SQL Server

The API expects a database and a SQL login. Scripts are in `assets/DbScripts/SqlServer/` (paths relative to the app root, one level above this folder):

1. `1 - Init.sql` — database, tables, seed data
2. `2 - WebAPI logs.sql` — Serilog table
3. `3 - DB User.sql` — login/user `user_{Database}` (default password in the script is a placeholder; change it)

`setup` substitutes your database name into these scripts and into `appsettings.Development.json`.

A local Docker SQL Server is enough. Azure SQL Edge example:

```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=ChooseAStrongPassword" \
  -p 1433:1433 --name sql \
  -v "$HOME/SqlServer/data:/var/opt/mssql/data" \
  --restart unless-stopped \
  -d mcr.microsoft.com/azure-sql-edge
```

Create the host data directory first. On Windows, use `C:\SqlServer\data` (or similar) instead of `$HOME/...`.

Connection string (Development default shape):

```
Server=localhost;Initial Catalog={Database};User Id=user_{Database};Password=...;Encrypt=Yes;TrustServerCertificate=Yes;
```

Treat the password like the Entra secret: user secrets or environment variables in anything past a private machine.

## Entra ID

You need an app registration in the Microsoft Entra admin center (Azure AD). This template is shaped for **one registration** that is both the SPA public client and the API. You can split SPA and API later; today there is a single `EntraId:ClientId`.

### Values to collect

| Setting | Where it comes from |
|---|---|
| `TenantId` | Entra → Overview → **Directory (tenant) ID** |
| `ClientId` | App registration → Overview → **Application (client) ID** |
| `ClientSecret` | App registration → Certificates & secrets → **New client secret**. Used for Graph (avatars) via on-behalf-of. Not sent to the SPA. |
| `WebApiScope` | App registration → Expose an API → Application ID URI + scope name, e.g. `api://{client-id}/access_as_user` |
| `Instance` | Leave `https://login.microsoftonline.com/` unless you use a national cloud |

### Register the app

1. **New registration.** Accounts in this organizational directory is the usual LOB choice.
2. **Authentication → Add a platform → Single-page application.** Redirect URI is the SPA origin, e.g. `http://localhost:3011` (use the SPA port `setup` printed). Add production URLs later. Implicit grant is not required for MSAL.js 2+.
3. **Expose an API.** Set the Application ID URI if prompted. Add a scope (for example `access_as_user`) that admins can consent. `WebApiScope` is `api://{client-id}/{scope}`.
4. **API permissions.** Add Microsoft Graph `User.Read` (delegated) if you want Graph avatars. Grant admin consent in a locked-down tenant.
5. **Certificates & secrets.** Create a client secret if you want Graph photos. Without it, avatar code skips Graph and falls through to Gravatar / initials.

Optional: **App roles** or **groups** feed `RoleMappings` in `appsettings.json` (`Role` in the app, `Groups` as Entra group names/ids). That mapping is independent of the four EntraId fields.

### Where to put the values

**Do not commit `ClientSecret`.** `appsettings.json` uses deploy-time tokens (`#tenantid#`, `#clientsecret#`, …). `appsettings.Development.json` may hold non-secret ids on a private box; still keep the secret out of git.

`setup` removes `UserSecretsId` from the copied web project. Init secrets once in the Web API project folder (`src/{Namespace}/`):

```bash
dotnet user-secrets init
dotnet user-secrets set "EntraId:TenantId" "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
dotnet user-secrets set "EntraId:ClientId" "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
dotnet user-secrets set "EntraId:WebApiScope" "api://xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/access_as_user"
dotnet user-secrets set "EntraId:ClientSecret" "the-secret-value"
```

Or one JSON blob (`dotnet user-secrets set` per key, or edit the secrets file from Visual Studio: right-click the web project → Manage User Secrets):

```json
{
  "EntraId": {
    "TenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "ClientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "ClientSecret": "the-secret-value",
    "WebApiScope": "api://xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/access_as_user"
  }
}
```

Environment variables work the same in Development, containers, and production. ASP.NET Core maps `__` to nested keys:

```bash
export EntraId__TenantId="..."
export EntraId__ClientId="..."
export EntraId__ClientSecret="..."
export EntraId__WebApiScope="api://.../access_as_user"
export ConnectionStrings__DefaultConnection="Server=...;..."
```

On Azure App Service / Container Apps, add the same names as application settings. Production `appsettings.json` can keep `ApplicationMode` and Serilog; overlay Entra and the connection string from the host.

Precedence is the usual ASP.NET Core chain: `appsettings.json` → `appsettings.{Environment}.json` → user secrets (Development) → environment variables. A secret in the environment wins over a value in the JSON file.

`ApplicationMode` in Development should be `"Development"` (not only `ASPNETCORE_ENVIRONMENT`). CORS, Swagger, and exception detail follow that flag.

## Run

From `src/`:

```bash
dotnet build
dotnet run --project {Namespace}/{Namespace}.csproj
```

Or open `{Namespace}.sln` and run the Web API project. The `http` profile listens on the port `setup` chose (template default `http://localhost:5011`) and opens Swagger.

Confirm `GET /api/settings` returns `msalSettings` with `clientId`, `authority`, and `apiScope`. Empty `msalSettings` means TenantId, ClientId, or WebApiScope did not load.

Then start the SPA (`spa-src/`) as described in that README. The Vite proxy targets this API port.

## Generator

With the database up, `assets/generator/` can emit Business objects, repositories, and services from tables. See that project's README. Mark `dat_*` tables **primary** when they own a `br_*` many-to-many; insert/update will persist `*Ids` lists.
