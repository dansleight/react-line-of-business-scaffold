# Backend

This directory is the API. The person's backend editor is the repository root. The frontend editor is a second window opened on `spa-src/`. An agent whose working directory is `src/` stays on the API. Do not edit `spa-src/` to finish a backend task. You meet over HTTP.

Stack: .NET 10, Lamar, Dapper, Entra JWT bearer, Serilog, Swagger. The host project is `Scaffold/`. The business library is `Scaffold.Business/`.

From this folder:

```bash
dotnet build
dotnet run --project Scaffold/Scaffold.csproj
```

The template listens on `http://localhost:5011`. Setup rewrites that port.

## Database first

Change `assets/DbScripts/SqlServer/` and apply it before you change C#. Prefixes decide what the generator emits: `dat_` object and service, `lu_` lookup, `enum_` enum, `br_` an `*Ids` list on its primary table. `hist_` is history the repository writes. Do not invent an entity, an enum, a lookup, or a controller and back-fill a table.

Never generate `dat_Config`, `dat_ConfigUser`, `dat_User`, `dat_UserAvatar`, `dat_Log`, or `dat_SerilogLogs`.

## Generate with the CLI

Run these from `assets/generator/` at the repository root. The tool finds `src/Scaffold.sln` and the connection string. The database has to be reachable. Do not write the C# yourself.

`status` prints every table with `object=` and `service=`. The names in the examples are the shape of the command. Use the names from `status` and the primary tables the person named.

```bash
pnpm i
pnpm generator status
pnpm generator primary --table dat_Account --on
pnpm generator enums --fix
pnpm generator generate --table lu_Industry
pnpm generator generate --table dat_Account
pnpm generator lookups --fix
pnpm generator controller --table dat_Account
```

- Mark every primary `dat_` table before you generate it. Primary means that table owns its `br_` rows as `*Ids` lists. Only `dat_` tables can be primary.
- `enums --fix` writes every `enum_*` that is missing or drifted. Enums have no service and no controller.
- `generate --table` writes the object and the service for one `dat_*` or `lu_*` table. Repeat it for each product table `status` shows as missing. It leaves an existing file alone.
- `lookups --fix` rewrites `LookupType` and `LookupController`. It does not write the lookup object. Generate each `lu_*` table, then run this once.
- `controller --table` writes the controller for a `dat_*` table you generated. Leave `--properties` and `--methods` off. That binds the object and emits every action the table supports. `LookupController` serves `lu_*`. Do not add a controller per lookup.
- Skip `br_*`, `enum_*`, and `hist_*` for `generate` and `controller`.
- `replace --table` overwrites that table's object and service. Do not use it on a service you have edited.
- A rule that is not a column goes in the generated service. Throw `ValidationException.ForField`. That is the only field-error shape. The next `replace` erases that edit.
- Extra repository queries go in another partial of the generated repository, beside that file.
- When the API is running, `pnpm generate-api` in `spa-src/` rewrites the TypeScript client from Swagger. Do not hand-edit `spa-src/src/apiClient/`.

A schema error from `status` means the connection or the SQL is wrong. Fix that. Do not invent the classes to get past it.

## Leave these alone

Change one of these only when the task is the platform itself.

- `Scaffold.Business/Services/RepoBases/` — `MappedTableBinder`, `DapperRepositoryBase`, `MappedTableRepository`, `SqlGenerator`, and the rest of that folder. Lamar already registers a new repository. Do not add it to `Program.cs`.
- The host pipeline: `Scaffold/Program.cs`, `AuthenticationStartupExtensions`, `ApiExceptionHandler`, `IdentityExtensions`, `NormalizeAuthorizationHeaderMiddleware`.
- `GET /api/settings` stays anonymous. The client secret stays in user secrets or the environment. The SPA sees `clientId`, `authority`, and `apiScope` from that endpoint.
- A direct `PackageReference` to `System.Security.Cryptography.Pkcs` lifts a vulnerable transitive floor. The build warns when that reference can be deleted. Do not add another pin unless it carries the same warning.

## Read before you change it

| Area | Doc |
|---|---|
| Run, SQL scripts, Entra portal values | [ReadMe.md](ReadMe.md) |
| Prefixes, audit columns, ignored tables | [docs/database.md](docs/database.md) |
| `DapperRepositoryBase` and `MappedTableRepository<T>` | [docs/repositories.md](docs/repositories.md) |
| Host, controllers, errors, the settings contract | [docs/http.md](docs/http.md) |
| Token validation, roles, Graph, SignalR | [docs/authentication.md](docs/authentication.md) |
| What the generator writes | [docs/generator.md](docs/generator.md) |

Flags for the CLI are in `assets/generator/README.md`. The tool's own rules, for when you are changing the generator, are in `assets/generator/AGENTS.md`.
