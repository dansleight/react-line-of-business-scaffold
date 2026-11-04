# Repositories

Both types live in `Scaffold.Business/Services/RepoBases/`. There is no `MappedTableRepositoryBase`. The mapped type is `MappedTableRepository<T>`, and it extends `DapperRepositoryBase`.

Use `DapperRepositoryBase` when you are writing the SQL. Use `MappedTableRepository<T>` when the table is one entity and the generator already described it.

## DapperRepositoryBase

Opens the `DefaultConnection` connection and wraps Dapper. The methods you call from a subclass are protected: `Query`, `QueryAsync`, `Execute`, `ExecuteAsync`, the multi-map `Query` overloads, and `QueryMultipleAsync` (a `GridReaderSession` you dispose). `AsDapperParams` turns an anonymous object into parameters.

`ReportRepository` in `ReportService.cs` is the pattern for SQL you own: a small class that extends the base and runs a statement.

Do not put mapped-table CRUD here. You would skip history, audit stamps, and the default filters.

## MappedTableRepository of T

One class, one table. `MappedTableBinder` reads `[Table]`, `[Column]`, and `[Key]` on `T` and builds a `TableBinding<T>`. `[NotMapped]` stays off the SQL. The generator writes those attributes. The history table name is `hist_` plus the table name.

`SqlGenerator<T>` writes the statements. You rarely call it yourself.

### Reads

| Method | Behavior |
|---|---|
| `GetAsync` | Select with the default filters |
| `GetAllAsync` | Select without those filters |
| `GetByIdAsync` | Single int key. Throws if the key is not an int |
| `GetByKeyAsync` | Single string key |
| `GetListPagedAsync` | Page, page size, and an `ORDER BY` |
| `RecordCountAsync` | Count with the default filters |
| `GetHistoryAsync` | Rows from the history table |
| `CachedGetAsync`, `CachedGetAllAsync`, `CachedGetByIdAsync` | Same reads through `IAppCache` |

Default filters drop rows with a non-null `DeletedOn`, and rows whose `Active` is not true, when those columns exist. `GetAllAsync` is how you see the hidden ones.

`CacheRemove` and `CacheRemoveAll` run after a write. A write also publishes a `MappedTableChange` on `MappedTableChangeBus`.

### Writes

All of them take `personId` when the table has person audit columns. Omit it and the repository throws.

| Method | Behavior |
|---|---|
| `InsertAsync` | Stamps created (and updated) audit, inserts, returns the row |
| `UpdateAsync` | Stamps updated audit, returns the row count |
| `SaveAsync` | Insert when the key is empty, otherwise update |
| `DeleteAsync`, `DeleteByIdAsync`, `DeleteByKeyAsync` | Returns `DeleteAction` |

Delete chooses one path:

- `DeletedOn` is mapped: stamp it and return `Deleted`.
- Otherwise `Active` is mapped: deactivate and return `Deactivated`.
- Otherwise remove the row and return `Deleted`.

`NotFound` from the statement becomes `KeyNotFoundException`.

## Where a rule goes

A unique-name check, a status transition, or anything that is not a column mapping belongs on the service that calls the repository. Report it with `ValidationException.ForField` so the SPA can attach the message to the input. The shape is in [http.md](http.md).
