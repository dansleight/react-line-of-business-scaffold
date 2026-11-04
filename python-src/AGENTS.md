# FastAPI backend

This tree is the FastAPI twin of the C# API. Setup copies it to `src/` when the chosen backend is Python.

The person's backend editor is the repository root. The frontend editor is a second window opened on `spa-src/`. An agent whose working directory is this tree stays on the API. Do not edit `spa-src/` to finish an API task.

- The database is the source of truth. Change `assets/DbScripts/SqlServer/` and apply it before you change Python. There is no C# generator in this tree. Do not add one, and do not port `MappedTableRepository` or Lamar unless that is the task.
- Keep the HTTP contract the SPA already depends on. `GET /api/settings` stays anonymous and still returns `clientId`, `authority`, and `apiScope`. The client secret stays in the environment.
- `pnpm generate-api` in `spa-src/` rewrites `spa-src/src/apiClient/` from Swagger. Do not hand-edit that folder.
- Leave `spa-src/src/contexts/` and the silent-iframe check in `spa-src/src/main.tsx` alone.

How to create the virtualenv and run the process is in [ReadMe.md](ReadMe.md).
