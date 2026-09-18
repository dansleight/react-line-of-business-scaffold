# Line-of-business scaffold

A React SPA plus either a C# ASP.NET Core Web API or a Python FastAPI, meant as a **canvas** for internal line-of-business apps — not a framework you stay inside of. After you instantiate a copy, change whatever you need.

The C# path is the one this repo is built around (Dapper, Entra, generator, form kit). FastAPI is present and usable, but less complete.

## Setup

`setup/` is a one-shot wizard. It copies this template into an **empty** directory (or empty git repo), names the projects, picks ports, and removes the backend you did not choose.

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

The wizard copies `src/` or `python-src/` (as `src/`), `spa-src/`, SQL scripts, and — for C# — the generator. It rewrites names, connection-string placeholders, and launch/proxy ports. It also strips any `UserSecretsId` from the copied `.csproj` files so you start clean.

When it finishes, work in **that new folder**, not this template. You can delete `setup/` from the new app before the first commit; it has no runtime role.

Details of the prompts live in [setup/ReadMe.md](setup/ReadMe.md).

## After setup

1. Provision SQL Server and run the scripts under `assets/DbScripts/SqlServer/`. See [src/ReadMe.md](src/ReadMe.md).
2. Put Entra (and the client secret) in user secrets or environment variables. Same file.
3. Run the API, then the SPA. SPA notes, layouts, and config files: [spa-src/README.md](spa-src/README.md).
4. C# only: generate business objects from tables with [assets/generator/README.md](assets/generator/README.md).

## Licensing

The template ships free Font Awesome icons. For a production internal app, license the full kit for the team. The same idea will apply if AG Grid is added later.

## Requirements

- Node 18+ (20+ is more comfortable) and **pnpm** 10.30+
- For C#: **.NET 10** SDK
- SQL Server (local Docker is fine)
- An Entra ID (Azure AD) app registration if you want real sign-in
