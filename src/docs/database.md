# Database

SQL Server is the source of truth. The scripts live in `assets/DbScripts/SqlServer/`, one level above this `src/` folder. Setup substitutes the database name into them. The template name is `Scaff_DB`.

Run them in order:

1. `1 - Init.sql` creates the database, the platform tables, and seed rows.
2. `2 - WebAPI logs.sql` creates the Serilog table. FastAPI setup swaps in its own log script.
3. `3 - DB User.sql` creates the login and user `user_Scaff_DB`. The password in the script is a placeholder. Change it, and keep it in user secrets or the environment.

Connection string shape, Entra setup, and a local Docker example are in [../ReadMe.md](../ReadMe.md).

## Prefixes

The prefix is the kind. The generator and the repositories both trust it.

| Prefix | Kind | What it becomes |
|---|---|---|
| `dat_` | Data | A `*Object` and, unless the table is ignored, a service and a repository |
| `lu_` | Lookup | A static lookup. The generator also rewrites `LookupType` and `LookupController` |
| `enum_` | Enum | A C# enum. No service |
| `br_` | Bridge | Not its own object. Hung off the primary `dat_` table as an `*Ids` list |
| `hist_` | History | Written by `MappedTableRepository<T>`. You do not author this table by hand for a generated entity. The name is `hist_` plus the data table name |

A `dat_` table that owns a `br_` many-to-many is marked primary in `src/generator.json`. Insert and update then persist the `*Ids` list. Bridges are not generated as their own services.

Singular names drop the prefix: `dat_Widget` becomes `WidgetObject` and `WidgetService`.

## Audit columns

| Column | Role |
|---|---|
| `CreatedOn`, `CreatedPersonId` | Stamped on insert |
| `UpdatedOn`, `UpdatedPersonId` | Stamped on update |
| `DeletedOn`, `DeletedPersonId` | Soft delete. `GetAsync` hides these rows |
| `Active` | When there is no `DeletedOn`, delete deactivates the row instead of removing it. `GetAsync` hides inactive rows |

`personId` is the caller, passed into `InsertAsync`, `UpdateAsync`, and `DeleteAsync`. It is the signed-in name from the API, not a column the client invents.

## Tables the generator will not emit

These already have a hand-written home, or they are infrastructure:

- `dat_Config`
- `dat_ConfigUser`
- `dat_User`
- `dat_UserAvatar`
- `dat_Log`
- `dat_SerilogLogs`

Add a product table with a new script under `assets/DbScripts/SqlServer/`, then run the generator. Do not start from a C# class.
