# ${ns}

You are in the ${title} application, on the FastAPI backend. An agent runs from this root. A person uses two editors: this root for the API, and a second editor opened on `spa-src/` for screens. The API and the SPA meet over HTTP.

| | |
|---|---|
| Namespace | `${ns}` |
| Database | `${dbName}` |
| API | `http://localhost:${apiPort}` |
| SPA | `http://localhost:${spaPort}` |

The database is the source of truth. Change SQL in `assets/DbScripts/SqlServer/` and apply it to `${dbName}` before you change Python. This backend has no table generator. Do not invent a C# tree here to catch up, and do not port `MappedTableRepository` unless that is the task.

- A screen is a `lazyPage` in `spa-src/src/routes.tsx` plus a matching item in `spa-src/src/menusConfig.ts`. Read [spa-src/AGENTS.md](spa-src/AGENTS.md) before editing the SPA.
- `pnpm generate-api` in `spa-src/` rewrites `spa-src/src/apiClient/` from Swagger. Do not hand-edit that folder.
- Secrets stay on the server. The SPA learns `clientId`, `authority`, and `apiScope` from `GET /api/settings`.
- Leave `spa-src/src/contexts/` and the silent-iframe check in `spa-src/src/main.tsx` alone. The one-second wait in `IdentityContext` stays.

| Task | Read |
|---|---|
| How to run the app | [ReadMe.md](ReadMe.md) |
| API | [src/AGENTS.md](src/AGENTS.md) |
| Screens, forms, menus, theme, browser Entra | [spa-src/AGENTS.md](spa-src/AGENTS.md) |
