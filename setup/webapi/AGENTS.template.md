# ${ns}

You are in the ${title} application. An agent runs from this root. A person uses two editors: this root for the API, and a second editor opened on `spa-src/` for screens. The API and the SPA meet over HTTP.

| | |
|---|---|
| Namespace | `${ns}` |
| Database | `${dbName}` |
| API | `http://localhost:${apiPort}` |
| SPA | `http://localhost:${spaPort}` |

The database is the source of truth. Change SQL, run the generator, then regenerate the SPA client. Do not invent an entity, an enum, a lookup, or a controller and back-fill a table. Do not spend a completion writing those types. The CLI writes them.

## Order of work

1. Edit `assets/DbScripts/SqlServer/` and apply it to `${dbName}`. Prefixes decide the output: `dat_` object and service, `lu_` lookup, `enum_` enum, `br_` an `*Ids` list on its primary table. `hist_` is history the repository writes.
2. Mark primary tables, then generate. Commands are below.
3. A rule that is not a column goes in the generated service. Throw `ValidationException.ForField`.
4. Run the API. From `spa-src/`, `pnpm generate-api` rewrites `spa-src/src/apiClient/` from Swagger.
5. A screen is a `lazyPage` in `spa-src/src/routes.tsx` plus a matching item in `spa-src/src/menusConfig.ts`. Read [spa-src/AGENTS.md](spa-src/AGENTS.md) before editing the SPA.

Secrets stay on the server. The SPA learns `clientId`, `authority`, and `apiScope` from `GET /api/settings`.

## Generator

Run these from `assets/generator/`. The tool finds the solution and the connection string. The database has to be reachable. `status` prints every table with `object=` and `service=`. A schema error means the connection or the SQL is wrong.

The table names in the examples are the shape of the command. Use the names from `status` and the primary tables the person named.

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
- Skip `dat_Config`, `dat_ConfigUser`, `dat_User`, `dat_UserAvatar`, `dat_Log`, and `dat_SerilogLogs`. Skip `br_*`, `enum_*`, and `hist_*` for `generate` and `controller`.
- `replace --table` overwrites that table's object and service. Do not use it on a service you have edited.
- Extra repository queries go in another partial of the generated repository, beside that file.

Flags are in [assets/generator/README.md](assets/generator/README.md). Prefixes and audit columns are in [src/docs/database.md](src/docs/database.md).

## Leave these alone

Change one of these only when the task is the platform itself.

- `src/${ns}.Business/Services/RepoBases/` — `MappedTableBinder`, `DapperRepositoryBase`, `MappedTableRepository`, `SqlGenerator`, and the rest of that folder. Lamar already registers a new repository. Do not add it to `Program.cs`.
- The host pipeline: `src/${ns}/Program.cs`, `AuthenticationStartupExtensions`, `ApiExceptionHandler`, `IdentityExtensions`, `NormalizeAuthorizationHeaderMiddleware`.
- `spa-src/src/contexts/` and the silent-iframe check in `spa-src/src/main.tsx`. The one-second wait in `IdentityContext` stays. Login loops start when it is removed.
- `spa-src/src/apiClient/`. Regenerate it.
- Generated object files. Edit the service.

| Task | Read |
|---|---|
| How to run the app | [ReadMe.md](ReadMe.md) |
| SQL, repositories, HTTP, server Entra | [src/AGENTS.md](src/AGENTS.md) |
| Screens, forms, menus, theme, browser Entra | [spa-src/AGENTS.md](spa-src/AGENTS.md) |
