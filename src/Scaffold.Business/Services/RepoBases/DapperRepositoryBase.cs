using System.Collections;
using System.Data;
using System.Data.Common;
using System.Reflection;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Scaffold.Business.Models.Config;

namespace Scaffold.Business.Services.RepoBases;

public abstract class DapperRepositoryBase
{
    private readonly string _connectionString;

    protected DapperRepositoryBase(
        ILogger<DapperRepositoryBase> logger,
        IOptions<DataAccessSettings> config)
    {
        _ = logger;
        _connectionString = config.Value.ConnectionStrings!.Single(x => x.Key == "DefaultConnection").Value;
    }

    #region Map Dapper Methods

    protected int Execute(string query, object? parameters = null) =>
        WithConnection(c => c.Execute(query, AsDapperParams(parameters)));

    protected T? ExecuteScalar<T>(string query, object? parameters = null) =>
        WithConnection(c => c.ExecuteScalar<T>(query, AsDapperParams(parameters)));

    protected IEnumerable<dynamic> Query(string query, object? parameters = null) =>
        WithConnection(c => c.Query(query, AsDapperParams(parameters)));

    protected IEnumerable<T> Query<T>(string query, object? parameters = null) =>
        WithConnection(c => c.Query<T>(query, AsDapperParams(parameters)));

    protected IEnumerable<TReturn> Query<TFirst, TSecond, TReturn>(string query, Func<TFirst, TSecond, TReturn> map, object? parameters = null, IDbTransaction? transaction = null, bool buffered = true, string splitOn = "Id", int? commandTimeout = null, CommandType? commandType = null)
        => WithConnection(c => c.Query(query, map, AsDapperParams(parameters), transaction, buffered, splitOn, commandTimeout, commandType));

    protected IEnumerable<TReturn> Query<TFirst, TSecond, TThird, TReturn>(string query, Func<TFirst, TSecond, TThird, TReturn> map, object? parameters = null, IDbTransaction? transaction = null, bool buffered = true, string splitOn = "Id", int? commandTimeout = null, CommandType? commandType = null)
        => WithConnection(c => c.Query(query, map, AsDapperParams(parameters), transaction, buffered, splitOn, commandTimeout, commandType));

    protected IEnumerable<TReturn> Query<TFirst, TSecond, TThird, TFourth, TReturn>(string query, Func<TFirst, TSecond, TThird, TFourth, TReturn> map, object? parameters = null, IDbTransaction? transaction = null, bool buffered = true, string splitOn = "Id", int? commandTimeout = null, CommandType? commandType = null)
        => WithConnection(c => c.Query(query, map, AsDapperParams(parameters), transaction, buffered, splitOn, commandTimeout, commandType));

    protected T QueryFirst<T>(string query, object? parameters = null) =>
        WithConnection(c => c.QueryFirst<T>(query, AsDapperParams(parameters)));

    protected T? QueryFirstOrDefault<T>(string query, object? parameters = null) =>
        WithConnection(c => c.QueryFirstOrDefault<T>(query, AsDapperParams(parameters)));

    protected T QuerySingle<T>(string query, object? parameters = null) =>
        WithConnection(c => c.QuerySingle<T>(query, AsDapperParams(parameters)));

    protected T? QuerySingleOrDefault<T>(string query, object? parameters = null) =>
        WithConnection(c => c.QuerySingleOrDefault<T>(query, AsDapperParams(parameters)));

    protected Task<int> ExecuteAsync(string query, object? parameters = null) =>
        WithConnectionAsync(c => c.ExecuteAsync(query, AsDapperParams(parameters)));

    protected Task<T?> ExecuteScalarAsync<T>(string query, object? parameters = null) =>
        WithConnectionAsync(c => c.ExecuteScalarAsync<T>(query, AsDapperParams(parameters)));

    protected Task<IEnumerable<dynamic>> QueryAsync(string query, object? parameters = null) =>
        WithConnectionAsync(c => c.QueryAsync(query, AsDapperParams(parameters)));

    protected Task<IEnumerable<T>> QueryAsync<T>(string query, object? parameters = null) =>
        WithConnectionAsync(c => c.QueryAsync<T>(query, AsDapperParams(parameters)));

    protected Task<IEnumerable<TReturn>> QueryAsync<TFirst, TSecond, TReturn>(string query, Func<TFirst, TSecond, TReturn> map, object? parameters = null, IDbTransaction? transaction = null, bool buffered = true, string splitOn = "Id", int? commandTimeout = null, CommandType? commandType = null)
        => WithConnectionAsync(c => c.QueryAsync(query, map, AsDapperParams(parameters), transaction, buffered, splitOn, commandTimeout, commandType));

    protected Task<IEnumerable<TReturn>> QueryAsync<TFirst, TSecond, TThird, TReturn>(string query, Func<TFirst, TSecond, TThird, TReturn> map, object? parameters = null, IDbTransaction? transaction = null, bool buffered = true, string splitOn = "Id", int? commandTimeout = null, CommandType? commandType = null)
        => WithConnectionAsync(c => c.QueryAsync(query, map, AsDapperParams(parameters), transaction, buffered, splitOn, commandTimeout, commandType));

    protected Task<IEnumerable<TReturn>> QueryAsync<TFirst, TSecond, TThird, TFourth, TReturn>(string query, Func<TFirst, TSecond, TThird, TFourth, TReturn> map, object? parameters = null, IDbTransaction? transaction = null, bool buffered = true, string splitOn = "Id", int? commandTimeout = null, CommandType? commandType = null)
        => WithConnectionAsync(c => c.QueryAsync(query, map, AsDapperParams(parameters), transaction, buffered, splitOn, commandTimeout, commandType));

    protected Task<T> QueryFirstAsync<T>(string query, object? parameters = null) =>
        WithConnectionAsync(c => c.QueryFirstAsync<T>(query, AsDapperParams(parameters)));

    protected Task<T?> QueryFirstOrDefaultAsync<T>(string query, object? parameters = null) =>
        WithConnectionAsync(c => c.QueryFirstOrDefaultAsync<T>(query, AsDapperParams(parameters)));

    protected Task<T> QuerySingleAsync<T>(string query, object? parameters = null) =>
        WithConnectionAsync(c => c.QuerySingleAsync<T>(query, AsDapperParams(parameters)));

    protected Task<T?> QuerySingleOrDefaultAsync<T>(string query, object? parameters = null) =>
        WithConnectionAsync(c => c.QuerySingleOrDefaultAsync<T>(query, AsDapperParams(parameters)));

    /// <summary>
    /// Caller must dispose the session (which disposes the grid reader and the connection).
    /// </summary>
    protected async Task<GridReaderSession> QueryMultipleAsync(string query, object? parameters = null)
    {
        DbConnection connection = CreateConnection();
        try
        {
            SqlMapper.GridReader reader = await connection.QueryMultipleAsync(query, AsDapperParams(parameters));
            return new GridReaderSession(connection, reader);
        }
        catch
        {
            await connection.DisposeAsync();
            throw;
        }
    }

    #endregion

    #region Helpers

    protected DbConnection CreateConnection() => new SqlConnection(_connectionString);

    private T WithConnection<T>(Func<DbConnection, T> action)
    {
        using DbConnection connection = CreateConnection();
        return action(connection);
    }

    private async Task<T> WithConnectionAsync<T>(Func<DbConnection, Task<T>> action)
    {
        await using DbConnection connection = CreateConnection();
        return await action(connection);
    }

    public object? AsDapperParams(object? o)
    {
        switch (o)
        {
            case null:
                return null;
            case DynamicParameters:
                return o;
            case IDictionary<string, object> or IDictionary<string, object?>:
                return o;
            case string:
                return o;
        }

        // Dapper multi-execute takes IEnumerable of row objects. Flattening that
        // to a property dictionary is what made ExecuteAsync(sql, rows) fail.
        if (IsDapperMultiExecute(o))
        {
            List<object?> rows = [];
            foreach (object? item in (IEnumerable)o)
                rows.Add(AsDapperParams(item));
            return rows;
        }

        var properties = o.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance).Where(c => c.CanRead).ToArray();

        return properties
            .Select(c => new { Key = c.Name, Value = c.GetValue(o), Type = c.PropertyType })
            .ToDictionary(
                c => c.Key,
                c => (c.Type.IsEnum || Nullable.GetUnderlyingType(c.Type)
                    ?.IsEnum == true) ? c.Value?.ToString() : c.Value);
    }

    private static bool IsDapperMultiExecute(object value)
    {
        if (value is not IEnumerable) return false;

        Type? element = GetEnumerableElementType(value.GetType());
        if (element == null) return false;
        element = Nullable.GetUnderlyingType(element) ?? element;
        if (element.IsPrimitive || element.IsEnum) return false;
        if (element == typeof(string) || element == typeof(decimal) || element == typeof(Guid)
            || element == typeof(DateTime) || element == typeof(DateTimeOffset)
            || element == typeof(TimeSpan) || element == typeof(byte[]))
        {
            return false;
        }

        return true;
    }

    private static Type? GetEnumerableElementType(Type type)
    {
        if (type.IsArray) return type.GetElementType();
        foreach (Type iface in type.GetInterfaces())
        {
            if (iface.IsGenericType && iface.GetGenericTypeDefinition() == typeof(IEnumerable<>))
                return iface.GetGenericArguments()[0];
        }

        if (type.IsGenericType && type.GetGenericTypeDefinition() == typeof(IEnumerable<>))
            return type.GetGenericArguments()[0];
        return null;
    }

    #endregion
}

public sealed class GridReaderSession : IDisposable, IAsyncDisposable
{
    private readonly DbConnection _connection;

    public GridReaderSession(DbConnection connection, SqlMapper.GridReader reader)
    {
        _connection = connection;
        Reader = reader;
    }

    public SqlMapper.GridReader Reader { get; }

    public bool IsConsumed => Reader.IsConsumed;

    public IEnumerable<dynamic> Read() => Reader.Read();

    public IEnumerable<T> Read<T>() => Reader.Read<T>();

    public T ReadFirst<T>() => Reader.ReadFirst<T>();

    public T? ReadFirstOrDefault<T>() => Reader.ReadFirstOrDefault<T>();

    public T ReadSingle<T>() => Reader.ReadSingle<T>();

    public T? ReadSingleOrDefault<T>() => Reader.ReadSingleOrDefault<T>();

    public Task<IEnumerable<dynamic>> ReadAsync() => Reader.ReadAsync();

    public Task<IEnumerable<T>> ReadAsync<T>() => Reader.ReadAsync<T>();

    public Task<T> ReadFirstAsync<T>() => Reader.ReadFirstAsync<T>();

    public Task<T?> ReadFirstOrDefaultAsync<T>() => Reader.ReadFirstOrDefaultAsync<T>();

    public Task<T> ReadSingleAsync<T>() => Reader.ReadSingleAsync<T>();

    public Task<T?> ReadSingleOrDefaultAsync<T>() => Reader.ReadSingleOrDefaultAsync<T>();

    public void Dispose()
    {
        Reader.Dispose();
        _connection.Dispose();
    }

    public async ValueTask DisposeAsync()
    {
        Reader.Dispose();
        await _connection.DisposeAsync();
    }
}
