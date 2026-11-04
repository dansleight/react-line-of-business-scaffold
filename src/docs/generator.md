# Generator

`assets/generator/` reads the SQL Server schema and writes C# into `Scaffold.Business/` and the host. CLI flags and the dev-server port are in [../../assets/generator/README.md](../../assets/generator/README.md). This file is the workflow. The tool's own rules are in [../../assets/generator/AGENTS.md](../../assets/generator/AGENTS.md).

## Order

Run the CLI from `assets/generator/`. The command sequence an agent should follow is in [../AGENTS.md](../AGENTS.md) and in [../../assets/generator/AGENTS.md](../../assets/generator/AGENTS.md). In short:

1. The table exists in SQL. Prefixes and audit columns are in [database.md](database.md).
2. `pnpm generator status` shows what the schema would produce.
3. `pnpm generator primary --table <dat_table> --on` for each primary table, before generate.
4. `pnpm generator enums --fix` writes drifted `enum_*` tables.
5. `pnpm generator generate --table <name>` writes one `dat_*` or `lu_*` object and service. Repeat per table. It leaves an existing file alone.
6. `pnpm generator lookups --fix` rewrites `LookupType` and `LookupController`.
7. `pnpm generator controller --table <dat_table>` writes the controller. Leave `--properties` and `--methods` off.
8. Run the API, then `pnpm generate-api` in `spa-src/` so the browser client matches Swagger.

`pnpm generator replace --table <name>` overwrites that table's object and service. Do not use it on a service you have edited.

The UI (`pnpm dev`, port 3199) and the CLI call the same core. An agent uses the CLI.

## What each kind becomes

| Table | Output |
|---|---|
| `dat_*` | `*Object`, repository, service. Role is secondary unless the table is listed as primary |
| `dat_*` marked primary | Same, and it owns related `br_*` tables as `*Ids` lists on insert and update |
| `lu_*` | Object implements `IStaticLookupItem`. `LookupType` gains a member. `LookupController` `All()` and `Type(LookupType)` are rewritten |
| `enum_*` | A C# enum. No service |
| `br_*` | No object of its own |

Primary tables are the `primaryTables` array in `src/generator.json`. Mark a `dat_*` table primary when a `br_*` table's life is "the ids on this parent."

Ignored tables are listed in [database.md](database.md). The generator will not emit them.

## What you edit afterward

Services are the place for rules that are not column mapping. A unique-name check throws `ValidationException.ForField` and then calls the repository. See [http.md](http.md). `generate` leaves that service alone once it exists. `replace` overwrites it.

Extra repository queries go in another partial of the generated repository, beside the service file. Do not edit `Services/RepoBases/` to add them.
