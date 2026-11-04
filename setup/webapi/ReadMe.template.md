# ${title}

This is the ${ns} application. It was produced from the line-of-business scaffold. Work in this repository. The scaffold clone was only the template, and you are done with it.

| | |
|---|---|
| Namespace | `${ns}` |
| Database | `${dbName}` |
| API | `http://localhost:${apiPort}` |
| SPA | `http://localhost:${spaPort}` |

The database is the source of truth. The API and the SPA meet over HTTP. Use two editors: this folder for the API, and a second editor opened on `spa-src/` for screens. An agent runs from this root. [AGENTS.md](AGENTS.md) has the generator commands.

## First time

1. Provision SQL Server and run the scripts in `assets/DbScripts/SqlServer/`. Names, the login, and the connection string are in [src/ReadMe.md](src/ReadMe.md).
2. Put the Entra values in user secrets or environment variables. The client secret stays on the server. Same file.
3. From `src/`, build and run the Web API. Swagger listens on port ${apiPort}.
4. From `spa-src/`, `pnpm i` and `pnpm dev`. The SPA listens on port ${spaPort} and proxies `/api` and `/hub` to the API.
5. Confirm `GET /api/settings` returns `msalSettings` with `clientId`, `authority`, and `apiScope`.
6. When the tables exist, generate business objects with [assets/generator/README.md](assets/generator/README.md). The workflow is in [src/docs/generator.md](src/docs/generator.md).

## Where to work

| Task | Editor | Read first |
|---|---|---|
| Schema, API, repositories, Entra on the server | This folder (the repository root) | [AGENTS.md](AGENTS.md) |
| Screens, forms, menus, theme | A second editor opened on `spa-src/` | [spa-src/AGENTS.md](spa-src/AGENTS.md) |
| Emit C# from tables | `assets/generator/`, via the CLI | [AGENTS.md](AGENTS.md) |

Agent rules for this app are in [AGENTS.md](AGENTS.md).

## Licensing

The app ships free Font Awesome icons. For a production internal app, license the full kit for the team.
