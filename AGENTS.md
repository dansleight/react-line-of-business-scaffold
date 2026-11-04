# Scaffold template

You are in the template repository, not in an application.

A clean clone exists to run `setup/` and then be left behind. The wizard writes a new folder with its own `ReadMe.md` and `AGENTS.md`. Product work happens there. The generated `AGENTS.md` tells an agent how to run the generator. Do not generate a product into this clone.

- To start an app, do not add tables, screens, or business objects here. Point the user at [ReadMe.md](ReadMe.md) and continue in the generated folder.
- To improve the canvas, edit it here. `src/` and `spa-src/` are what setup copies. An agent may run from this root.
- A person uses two editors on a generated app: the repository root for the API, and a second editor opened on `spa-src/` for screens. The same split applies while you work on the canvas.
- The database is the source of truth. Table prefixes decide what the generator emits. Change SQL, run the generator CLI, then regenerate the SPA client. Do not invent an entity in C# or TypeScript and back-fill SQL.
- The API and the SPA meet only over HTTP. Secrets stay on the server. The SPA learns `clientId`, `authority`, and `apiScope` from `GET /api/settings`.
- C# is the backend this canvas is built around. `python-src/` is the thinner FastAPI twin. Do not extend it to match C# unless that is the task.
- Leave the platform alone unless the task is the platform: `src/Scaffold.Business/Services/RepoBases/` (`MappedTableBinder`, `DapperRepositoryBase`, `MappedTableRepository`, `SqlGenerator`), the host pipeline in `src/Scaffold/Program.cs`, and `spa-src/src/contexts/` plus the silent-iframe check in `spa-src/src/main.tsx`.
- `pnpm generate-api` writes `spa-src/src/apiClient/`. A hand edit there is overwritten on the next run.

The command sequence for the generator is in [src/AGENTS.md](src/AGENTS.md) and [assets/generator/AGENTS.md](assets/generator/AGENTS.md).

| Tree | Start here |
|---|---|
| How a human runs setup | [ReadMe.md](ReadMe.md) |
| API | [src/AGENTS.md](src/AGENTS.md) |
| SPA | [spa-src/AGENTS.md](spa-src/AGENTS.md) |
| Table generator | [assets/generator/AGENTS.md](assets/generator/AGENTS.md) |
| FastAPI twin | [python-src/AGENTS.md](python-src/AGENTS.md) |
