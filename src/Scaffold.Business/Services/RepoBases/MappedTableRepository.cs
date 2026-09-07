using Dapper;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Scaffold.Business.Models.Config;
using Scaffold.Business.Services.Caching;

namespace Scaffold.Business.Services.RepoBases;

public abstract class MappedTableRepository<T> : DapperRepositoryBase, IMappedTableRepository<T> where T : class
{
    private readonly SqlGenerator<T> _sqlGenerator;
    private readonly MappedTableChangeBus _changeBus;
    protected readonly IAppCache _cache;

    public MappedTableRepository(
        ILogger<DapperRepositoryBase> logger,
        IOptions<DataAccessSettings> config,
        IAppCache cache,
        MappedTableBinder tableBinder,
        MappedTableChangeBus changeBus
    ) : base(logger, config)
    {
        TableBinding = tableBinder.GetTableBinding<T>();
        _sqlGenerator = new SqlGenerator<T>(TableBinding);
        _cache = cache;
        _changeBus = changeBus;
    }

    protected string CacheKeyPrefix { get; set; } = typeof(T).Name.ToLower();
    protected string CacheKeyAllRecords => $"{CacheKeyPrefix}_all";

    protected TableBinding<T> TableBinding { get; }

    public virtual Task<IEnumerable<T>> CachedGetAllAsync() =>
        _cache.GetOrAddAsync(CacheKeyAllRecords, () => GetAllAsync());

    public virtual async Task<IEnumerable<T>> CachedGetAsync() =>
        ApplyDefaultFilters(await CachedGetAllAsync());

    public virtual async Task<T?> CachedGetByIdAsync(int id)
    {
        Column keyColumn = GetSingleKeyColumn();

        if (keyColumn.UnderlyingType != typeof(int))
            throw new InvalidOperationException("This table's primary key column is not an integer. Please use the appropriate method.");

        IEnumerable<T> all = await CachedGetAllAsync();
        return all.SingleOrDefault(e => Equals(Convert.ToInt32(keyColumn.PropertyInfo.GetValue(e) ?? 0), id));
    }

    protected IEnumerable<T> ApplyDefaultFilters(IEnumerable<T> items)
    {
        IEnumerable<T> result = items;
        if (TableBinding.DeletedOn != null)
        {
            Column column = TableBinding.DeletedOn;
            result = result.Where(e => column.PropertyInfo.GetValue(e) is null);
        }
        if (TableBinding.Active != null)
        {
            Column column = TableBinding.Active;
            result = result.Where(e => column.PropertyInfo.GetValue(e) is true);
        }
        return result;
    }

    #region Get by Key

    public virtual Task<T?> GetByIdAsync(int id)
    {
        Column keyColumn = GetSingleKeyColumn();

        if (keyColumn.UnderlyingType != typeof(int))
            throw new InvalidOperationException("This table's primary key column is not an integer. Please use the appropriate method.");

        string sql = _sqlGenerator.GetSelectByKeys();
        return QuerySingleOrDefaultAsync<T>(sql, new Dictionary<string, object> { { keyColumn.PropertyName, id } });
    }

    public virtual Task<T?> GetByKeyAsync(string key)
    {
        Column keyColumn = GetSingleKeyColumn();

        if (keyColumn.UnderlyingType != typeof(string))
            throw new InvalidOperationException("This table's primary key column is not a string. Please use the appropriate method.");

        string sql = _sqlGenerator.GetSelectByKeys();
        return QuerySingleOrDefaultAsync<T>(sql, new Dictionary<string, object> { { keyColumn.PropertyName, key } });
    }

    #endregion

    #region Get

    public virtual Task<IEnumerable<T>> GetAsync() => GetAsync(null, null);

    public virtual Task<IEnumerable<T>> GetAsync(object? whereConditions, object? whereNotConditions = null) =>
        QueryFilteredAsync(whereConditions, whereNotConditions, applyDefaultFilters: true);

    public virtual Task<IEnumerable<T>> GetAllAsync() => GetAllAsync(null, null);

    public virtual Task<IEnumerable<T>> GetAllAsync(object? whereConditions, object? whereNotConditions = null) =>
        QueryFilteredAsync(whereConditions, whereNotConditions, applyDefaultFilters: false);

    private Task<IEnumerable<T>> QueryFilteredAsync(object? whereConditions, object? whereNotConditions, bool applyDefaultFilters)
    {
        string sql = _sqlGenerator.GetSelect(whereConditions, whereNotConditions, applyDefaultFilters);
        DynamicParameters? dynamicParameters = TableBinding.GetDynamicParameters(whereConditions, whereNotConditions);
        return QueryAsync<T>(sql, dynamicParameters);
    }

    #endregion

    #region Record count

    public virtual Task<int> RecordCountAsync(object? whereConditions = null, object? whereNotConditions = null)
    {
        string sql = _sqlGenerator.GetSelectRecordCount(whereConditions, whereNotConditions, applyDefaultFilters: true);
        DynamicParameters? dynamicParameters = TableBinding.GetDynamicParameters(whereConditions, whereNotConditions);
        return ExecuteScalarAsync<int>(sql, dynamicParameters);
    }

    #endregion

    #region Get paged

    public virtual Task<IEnumerable<T>> GetListPagedAsync(int pageNumber, int rowsPerPage, string orderBy, object? whereConditions = null, object? whereNotConditions = null)
    {
        string sql = _sqlGenerator.GetListPagedSql(pageNumber, rowsPerPage, orderBy, whereConditions, whereNotConditions, applyDefaultFilters: true);
        DynamicParameters? dynamicParameters = TableBinding.GetDynamicParameters(whereConditions, whereNotConditions);
        return QueryAsync<T>(sql, dynamicParameters);
    }

    #endregion

    #region History

    public virtual Task<IEnumerable<MappedHistory<T>>> GetHistoryAsync(int id)
    {
        Column keyColumn = GetSingleKeyColumn();

        if (keyColumn.UnderlyingType != typeof(int))
            throw new InvalidOperationException("This table's primary key column is not an integer. Please use the appropriate method.");

        return GetHistoryAsync(new Dictionary<string, object> { { keyColumn.PropertyName, id } });
    }

    public virtual Task<IEnumerable<MappedHistory<T>>> GetHistoryAsync(T keyEntity) =>
        GetHistoryAsync((object)keyEntity);

    private async Task<IEnumerable<MappedHistory<T>>> GetHistoryAsync(object keyParameters)
    {
        string sql = _sqlGenerator.GetHistorySelectByKeys();
        IEnumerable<dynamic> rows = await QueryAsync(sql, keyParameters);
        return rows.Select(MapHistoryRow).ToList();
    }

    private MappedHistory<T> MapHistoryRow(dynamic row)
    {
        var dict = (IDictionary<string, object>)row;
        T data = (T)Activator.CreateInstance(typeof(T), nonPublic: true)!;

        foreach (Column column in TableBinding.Columns)
        {
            object? value = GetRowValue(dict, column.Name) ?? GetRowValue(dict, column.PropertyName);
            if (value is DBNull) value = null;
            column.PropertyInfo.SetValue(data, Coerce(column, value));
        }

        return new MappedHistory<T>
        {
            HistoryId = Convert.ToInt32(GetRowValue(dict, "HistoryId") ?? 0),
            HistoryOn = Convert.ToDateTime(GetRowValue(dict, "HistoryOn") ?? DateTime.MinValue),
            HistoryAction = GetRowValue(dict, "HistoryAction")?.ToString() ?? "",
            HistoryPersonId = GetRowValue(dict, "HistoryPersonId")?.ToString(),
            Data = data
        };
    }

    private static object? GetRowValue(IDictionary<string, object> row, string name)
    {
        foreach (KeyValuePair<string, object> pair in row)
        {
            if (pair.Key.Equals(name, StringComparison.OrdinalIgnoreCase))
                return pair.Value is DBNull ? null : pair.Value;
        }
        return null;
    }

    private static object? Coerce(Column column, object? value)
    {
        if (value == null) return null;

        Type underlying = column.UnderlyingType;
        if (underlying.IsEnum)
        {
            if (value is string s) return Enum.Parse(underlying, s, ignoreCase: true);
            return Enum.ToObject(underlying, value);
        }

        Type dest = Nullable.GetUnderlyingType(column.Type) ?? column.Type;
        if (dest.IsInstanceOfType(value)) return value;
        return Convert.ChangeType(value, dest);
    }

    #endregion

    #region Cache Removal

    public virtual void CacheRemoveAll() =>
        _cache.RemoveAllStartingWithKey(CacheKeyPrefix);

    public virtual void CacheRemove(int id)
    {
        _cache.Remove(CacheKeyAllRecords);
        _cache.Remove($"{CacheKeyPrefix}_{id}");
    }

    #endregion

    #region Save

    public virtual async Task<T> SaveAsync(T entity, string? personId = null)
    {
        if (TableBinding.KeyColumns.Length == 1)
        {
            if (IsIdentityValueSet(entity, TableBinding.KeyColumns[0]))
            {
                await UpdateAsync(entity, personId);
                return entity;
            }

            return await InsertAsync(entity, personId);
        }

        T? existing = await QuerySingleOrDefaultAsync<T>(_sqlGenerator.GetSelectByKeys(), entity);
        if (existing is null)
            TableBinding.ApplyInsertAudit(entity, personId);
        else
            TableBinding.ApplyUpdateAudit(entity, personId);

        string sql = _sqlGenerator.GetSaveStatement();
        entity = await QuerySingleAsync<T>(sql, entity);
        CacheRemoveAll();
        await NotifyChangedAsync(existing is null ? MappedTableChangeKind.Insert : MappedTableChangeKind.Update);
        return entity;
    }

    #endregion

    #region Insert

    public virtual async Task<T> InsertAsync(T entity, string? personId = null)
    {
        TableBinding.ApplyInsertAudit(entity, personId);
        EnsureEntityIsValid(entity, true);
        string sql = _sqlGenerator.GetInsertStatement();
        T inserted = await QuerySingleAsync<T>(sql, entity);
        CacheRemoveAll();
        await NotifyChangedAsync(MappedTableChangeKind.Insert);
        return inserted;
    }

    #endregion

    #region Update

    public virtual async Task<int> UpdateAsync(T entity, string? personId = null)
    {
        TableBinding.ApplyUpdateAudit(entity, personId);
        EnsureEntityIsValid(entity);
        string sql = _sqlGenerator.GetUpdateStatement();
        int returnValue = await ExecuteAsync(sql, entity);
        CacheRemoveAll();
        await NotifyChangedAsync(MappedTableChangeKind.Update);
        return returnValue;
    }

    #endregion

    #region Delete

    public virtual async Task<DeleteAction> DeleteAsync(T entity, string? personId = null)
    {
        DeleteAction action = await ExecuteDeleteAsync(entity, personId);
        if (action == DeleteAction.Deactivated)
            TableBinding.Deactivate(entity);
        else if (TableBinding.DeletedOn != null)
            TableBinding.ApplySoftDeleteAudit(entity, personId);
        return action;
    }

    public virtual Task<DeleteAction> DeleteByIdAsync(int id, string? personId = null)
    {
        Column keyColumn = GetSingleKeyColumn();

        if (keyColumn.UnderlyingType != typeof(int))
            throw new InvalidOperationException("This table's primary key column is not an integer. Please use the appropriate method.");

        return ExecuteDeleteAsync(new Dictionary<string, object?> { { keyColumn.PropertyName, id } }, personId);
    }

    public virtual Task<DeleteAction> DeleteByKeyAsync(string key, string? personId = null)
    {
        Column keyColumn = GetSingleKeyColumn();

        if (keyColumn.UnderlyingType != typeof(string))
            throw new InvalidOperationException("This table's primary key column is not a string. Please use the appropriate method.");

        return ExecuteDeleteAsync(new Dictionary<string, object?> { { keyColumn.PropertyName, key } }, personId);
    }

    private async Task<DeleteAction> ExecuteDeleteAsync(object keyParameters, string? personId)
    {
        if (TableBinding.RequiresPersonIdForDeleteAction && string.IsNullOrWhiteSpace(personId))
            throw new ArgumentException($"A personId is required for delete on {typeof(T).Name} because person audit columns are mapped.", nameof(personId));

        DynamicParameters parameters = TableBinding.GetDynamicParameters(keyParameters) ?? new DynamicParameters();
        parameters.Add("personId", personId);

        string? result = await QuerySingleAsync<string>(_sqlGenerator.GetDeleteStatement(), parameters);
        DeleteAction action = ParseDeleteAction(result);
        CacheRemoveAll();
        await NotifyChangedAsync(action == DeleteAction.Deactivated
            ? MappedTableChangeKind.Deactivate
            : MappedTableChangeKind.Delete);
        return action;
    }

    protected Task NotifyChangedAsync(MappedTableChangeKind kind) =>
        _changeBus.PublishAsync(new MappedTableChange
        {
            EntityType = typeof(T),
            TableName = TableBinding.TableName,
            Kind = kind
        });

    private static DeleteAction ParseDeleteAction(string? result)
    {
        if (string.Equals(result, "NotFound", StringComparison.OrdinalIgnoreCase))
            throw new KeyNotFoundException();
        if (string.Equals(result, "Deleted", StringComparison.OrdinalIgnoreCase))
            return DeleteAction.Deleted;
        if (string.Equals(result, "Deactivated", StringComparison.OrdinalIgnoreCase))
            return DeleteAction.Deactivated;
        throw new InvalidOperationException($"Unexpected delete result '{result}'.");
    }

    #endregion

    #region Helper Methods

    protected Column GetSingleKeyColumn()
    {
        if (TableBinding.KeyColumns.Length != 1)
            throw new InvalidOperationException($"This method is only available for tables with 1 primary key. Type {typeof(T).Name} for table {TableBinding.TableName} has {TableBinding.KeyColumns.Length} keys");

        return TableBinding.KeyColumns[0];
    }

    private static bool IsIdentityValueSet(T entity, Column keyColumn)
    {
        object? key = keyColumn.PropertyInfo.GetValue(entity);

        if (key == null) return false;

        switch (key)
        {
            case int x1 when x1 != 0:
            case long x2 when x2 != 0:
            case short x3 when x3 != 0:
            case string x4 when x4 != string.Empty:
                return true;
            case int:
            case long:
            case short:
            case string:
                return false;
            default:
                throw new NotImplementedException($"This type of property is not supported for a key column. You must add the appropriate case. {keyColumn.PropertyName} {keyColumn.PropertyInfo.PropertyType}");
        }
    }

    protected virtual void EnsureEntityIsValid(T entity, bool isInsert = false, List<string>? errors = null)
    {
        bool throwIfInvalid = false;

        if (errors == null)
        {
            throwIfInvalid = true;
            errors = new List<string>();
        }

        foreach (Column column in TableBinding.Columns)
        {
            if (column.ColumnAttributes.StringLengthAttribute != null && !column.ColumnAttributes.StringLengthAttribute.IsValid(StaticHelpers.GetValueDapperDbCompatible(column.PropertyInfo, entity)))
            {
                errors.Add(column.ColumnAttributes.StringLengthAttribute.FormatErrorMessage(column.PropertyName));
            }
        }

        if (isInsert)
        {
            foreach (Column keyColumn in TableBinding.KeyColumns)
            {
                if (keyColumn.IsIdentity)
                    ValidateGeneratedIdentityForInsert(entity, errors, keyColumn);
                else if (!IsIdentityValueSet(entity, keyColumn))
                    errors.Add($"The key property ({keyColumn.PropertyName}) must be set on insert.");
            }
        }

        if (throwIfInvalid && errors.Count > 0)
        {
            throw new ArgumentException(string.Join("\n", errors), nameof(entity));
        }
    }

    private static void ValidateGeneratedIdentityForInsert(T entity, ICollection<string> errors, Column keyColumn)
    {
        object? key = keyColumn.PropertyInfo.GetValue(entity);

        if (keyColumn.IsNullable)
        {
            if (key != null)
                errors.Add($"The key property ({keyColumn.PropertyName}) must be null");
            return;
        }

        switch (key)
        {
            case int x1 when x1 != 0:
            case long x2 when x2 != 0:
            case short x3 when x3 != 0:
                errors.Add($"The key property ({keyColumn.PropertyName}) must be 0 or be set as a nullable int with a value of null");
                break;
            case string x when x != string.Empty:
                errors.Add($"The key property ({keyColumn.PropertyName}) must be an empty string or be set as a nullable string with a value of null");
                break;
            case int:
            case long:
            case short:
            case string:
            case null:
                break;
            default:
                throw new NotImplementedException($"This type of property is not supported for a key column. You must add the appropriate case. {keyColumn.PropertyName} {keyColumn.PropertyInfo.PropertyType}");
        }
    }

    #endregion
}
