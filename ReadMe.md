# Line-of-business scaffold

This repository is the template. A clean clone is where you run setup. When setup finishes, leave this repository and work in the folder it created. That folder has its own `ReadMe.md` and `AGENTS.md`, filled in with the name, database, and ports you chose.

Do not build the product in this clone. Tables, screens, and business objects belong in the generated app. Change this repository only when you are improving the canvas that setup copies.

The C# path is the one this canvas is built around (Dapper, Entra, the generator, the form kit). FastAPI is present and usable, and it is less complete.

## Setup

`setup/` is a one-shot wizard. It copies this template into an empty directory (or an empty git repo), names the projects, picks ports, and keeps only the backend you chose.

From this repository:

```bash
cd setup
pnpm i
pnpm setup
```

You will be asked:

| Prompt | What it is |
|---|---|
| Backend | **C# WebAPI** or **Python FastAPI** |
| Namespace | One identifier, letters and digits only, no dots. First letter is capitalized. Becomes the C# namespace, project names, and (by default) the database name. |
| Database name | SQL Server database. Defaults to the namespace. |
| Application title | Shown in the SPA chrome. |
| WebAPI port | `5000–5099`. The SPA port is this value minus `2000` (API `5069` → SPA `3069`). |
| Repository root | Empty folder that will receive the new app. |

The wizard copies `src/` or `python-src/` (as `src/`), `spa-src/`, and the SQL scripts. For C# it also copies the generator. It rewrites names, connection-string placeholders, and launch and proxy ports, and it strips any `UserSecretsId` from the copied `.csproj` files. It then writes `ReadMe.md` and `AGENTS.md` into the new folder. `setup/` itself is not copied.

Details of the prompts live in [setup/ReadMe.md](setup/ReadMe.md).

## Requirements

- Node 18+ (20+ is more comfortable) and **pnpm** 10.30+
- For C#: **.NET 10** SDK
- SQL Server (local Docker is fine)
- An Entra ID app registration if you want real sign-in

## Licensing

The template ships free Font Awesome icons. For a production internal app, license the full kit for the team. The same idea will apply if AG Grid is added later.
