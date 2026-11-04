# Generator

This folder is the tool that writes C# from SQL Server. Schema in, files out. An agent uses the CLI. The UI on port 3199 is the same core, for a person.

From this folder the solution is `../../src/Scaffold.sln`. The tool finds it, and the connection string, without `--sln`. The database has to be reachable.

The names in the examples are the shape of the command. Use the names from `status` and the primary tables the person named. Do not write the C# yourself.

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

- Mark every primary `dat_` table before `generate`. Primary means the table owns its `br_` rows as `*Ids` lists.
- `enums --fix` writes every drifted `enum_*`. No service, no controller.
- `generate --table` writes the object and the service for one `dat_*` or `lu_*`. Repeat per missing product table. It leaves an existing file alone.
- `lookups --fix` rewrites `LookupType` and `LookupController`. Generate each `lu_*` first. Do not add a controller per lookup.
- `controller --table` writes the `dat_*` controller. Leave `--properties` and `--methods` off.
- Skip `dat_Config`, `dat_ConfigUser`, `dat_User`, `dat_UserAvatar`, `dat_Log`, `dat_SerilogLogs`, `br_*`, `enum_*`, and `hist_*`.
- `replace --table` overwrites that table's object and service. Do not use it on a service you have edited.
- A business rule goes in the generated service. Extra repository queries go in another partial of the generated repository.

Prefixes live in `shared/conventions.ts` and in `src/docs/database.md`. Change them together. Flags are in [README.md](README.md). The workflow narrative is in [../../src/docs/generator.md](../../src/docs/generator.md).

When the task is to change this tool, edit it here. When the task is to add a product table, run the CLI.
