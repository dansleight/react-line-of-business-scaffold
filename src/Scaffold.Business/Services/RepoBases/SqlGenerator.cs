using System.Reflection;

namespace Scaffold.Business.Services.RepoBases;

public interface ISqlGenerator
{
    string GetSelectByKeys();
    string GetSelect(object? whereConditions, object? whereNotConditions, bool applyDefaultFilters);
    string GetListPagedSql(int pageNumber, int rowsPerPage, string orderby, object? whereConditions, object? whereNotConditions, bool applyDefaultFilters);
    string GetSelectRecordCount(object? whereConditions, object? whereNotConditions, bool applyDefaultFilters);
    string GetInsertStatement();
    string GetUpdateStatement(params PropertyInfo[] ignoredProperties);
    string GetDeleteByKeyStatement();
    string GetDeleteStatement();
    string? WhereClause(object? whereConditions, object? whereNotConditions, bool applyDefaultFilters);
    string GetSaveStatement();
    string GetHistorySelectByKeys();
}

public class SqlGenerator<T> : ISqlGenerator where T : class
{
    private readonly TableBinding<T> _tableBinding;
    private string TableName => $"[{_tableBinding.TableName}]";
    private string HistoryTableName => $"[{_tableBinding.HistoryTableName}]";
    private string Schema => $"[{_tableBinding.Schema ?? "dbo"}]";

    public SqlGenerator(TableBinding<T> tableBinding)
    {
        _tableBinding = tableBinding;
    }

    public string GetSelect(object? whereConditions, object? whereNotConditions, bool applyDefaultFilters)
    {
        string? whereClause = WhereClause(whereConditions, whereNotConditions, applyDefaultFilters);

        if (!string.IsNullOrEmpty(whereClause))
        {
            return $"""
                SELECT
                {_tableBinding.SelectColumns}
                FROM {Schema}.{TableName}
                WHERE {whereClause}
                """;
        }
        return $"""
            SELECT
            {_tableBinding.SelectColumns}
            FROM {Schema}.{TableName}
            """;
    }

    public string GetSelectByKeys()
    {
        return $"""
            SELECT
            {_tableBinding.SelectColumns}
            FROM {Schema}.{TableName}
            WHERE {_tableBinding.KeyColumnsWhereClause}
            """;
    }

    public string GetHistorySelectByKeys()
    {
        return $"""
            SELECT
                HistoryId,
                HistoryOn,
                HistoryAction,
                HistoryPersonId,
            {_tableBinding.SelectColumns}
            FROM {Schema}.{HistoryTableName}
            WHERE {_tableBinding.KeyColumnsWhereClause}
            ORDER BY HistoryOn DESC, HistoryId DESC
            """;
    }

    public string GetInsertStatement()
    {
        string selectByKeys;
        if (_tableBinding.KeyColumns.Length == 1 && _tableBinding.KeyColumns[0].IsIdentity)
        {
            string keyColumnName = _tableBinding.KeyColumns[0].Name;

            selectByKeys = $"""
                    DECLARE @NewID decimal(38, 0) = SCOPE_IDENTITY();

                    SELECT
                    {_tableBinding.SelectColumns}
                    FROM {Schema}.{TableName}
                    WHERE {keyColumnName} = @NewID;
                """;
        }
        else
        {
            selectByKeys = GetSelectByKeys();
        }

        return $"""
                INSERT INTO {Schema}.{TableName} (
                {_tableBinding.InsertColumns}
                )
                VALUES (
                {_tableBinding.InsertColumnParameters}
                );

                {selectByKeys}
            """;
    }

    public string GetSaveStatement()
    {
        if (_tableBinding.KeyColumns.Length <= 1)
            throw new InvalidOperationException($"This method is only for tables with a composite key. {_tableBinding.TableName} has {_tableBinding.KeyColumns.Length} keys.");

        Column[] columns = _tableBinding.Columns.Where(c => c.IncludeInInsertStatement).ToArray();
        string propertyVariables = "\t" + string.Join(",\n\t\t", columns.Select(c => $"@{c.PropertyName}"));
        string columnNames = "\t" + string.Join("\n\t, ", columns.Select(c => $"{c.Name}"));
        string targetMatch = "\t" + string.Join("\n\tAND ", _tableBinding.KeyColumns.Select(c => $"target.{c.Name} = source.{c.Name}"));
        IEnumerable<Column> columnsForUpdate = _tableBinding.GetColumnsForUpdate(null);
        string matched = "";
        if (columnsForUpdate.Any())
        {
            matched = $"""

                        WHEN MATCHED THEN
                        UPDATE SET
                            {string.Join(",\n\t", columnsForUpdate.Select(c => $"target.{c.Name} = source.{c.Name}"))}
                      """;
        }
        string insertValues = "\t" + string.Join("\n , ", columns.Select(c => $"source.{c.Name}"));

        string selectByKeys = GetSelectByKeys();

        return $"""
                MERGE INTO {Schema}.{TableName} AS target
                USING (
                    VALUES (
                    {propertyVariables}
                    )
                ) AS source (
                    {columnNames}
                )
                ON (
                {targetMatch}
                ){matched}
                WHEN NOT MATCHED THEN
                    INSERT (
                    {columnNames}
                    )
                    VALUES (
                    {insertValues}
                    );
                
                {selectByKeys}
            """;
    }

    public string GetDeleteByKeyStatement()
    {
        return $"""
            DELETE FROM {Schema}.{TableName}
            WHERE {_tableBinding.KeyColumnsWhereClause}
        """;
    }

    public string GetDeleteStatement()
    {
        if (_tableBinding.DeletedOn != null)
            return GetSoftDeleteStatement();
        if (_tableBinding.Active != null)
            return GetDeleteOrDeactivateStatement();
        return GetHardDeleteStatement();
    }

    private string GetHardDeleteStatement()
    {
        return $"""
            SET NOCOUNT ON;
            DELETE FROM {Schema}.{TableName}
            WHERE {_tableBinding.KeyColumnsWhereClause};
            IF @@ROWCOUNT = 0
                SELECT N'NotFound';
            ELSE
                SELECT N'Deleted';
            SET NOCOUNT OFF;
            """;
    }

    private string GetSoftDeleteStatement()
    {
        List<string> setClauses = [$"{_tableBinding.DeletedOn!.Name} = GETDATE()"];

        if (_tableBinding.DeletedPersonId != null)
        {
            setClauses.Add($"{_tableBinding.DeletedPersonId.Name} = @personId");
        }
        else
        {
            if (_tableBinding.UpdatedOn != null)
                setClauses.Add($"{_tableBinding.UpdatedOn.Name} = GETDATE()");
            if (_tableBinding.UpdatedPersonId != null)
                setClauses.Add($"{_tableBinding.UpdatedPersonId.Name} = @personId");
        }

        return $"""
            SET NOCOUNT ON;
            UPDATE {Schema}.{TableName}
            SET {string.Join(",\n    ", setClauses)}
            WHERE {_tableBinding.KeyColumnsWhereClause};
            IF @@ROWCOUNT = 0
                SELECT N'NotFound';
            ELSE
                SELECT N'Deleted';
            SET NOCOUNT OFF;
            """;
    }

    private string GetDeleteOrDeactivateStatement()
    {
        List<string> deactivateSet = [$"{_tableBinding.Active!.Name} = 0"];
        if (_tableBinding.UpdatedOn != null)
            deactivateSet.Add($"{_tableBinding.UpdatedOn.Name} = GETDATE()");
        if (_tableBinding.UpdatedPersonId != null)
            deactivateSet.Add($"{_tableBinding.UpdatedPersonId.Name} = @personId");

        return $"""
            SET NOCOUNT ON;
            BEGIN TRY
                DELETE FROM {Schema}.{TableName}
                WHERE {_tableBinding.KeyColumnsWhereClause};
                IF @@ROWCOUNT = 0
                    SELECT N'NotFound';
                ELSE
                    SELECT N'Deleted';
            END TRY
            BEGIN CATCH
                IF ERROR_NUMBER() <> 547
                BEGIN
                    SET NOCOUNT OFF;
                    THROW;
                END
                UPDATE {Schema}.{TableName}
                SET {string.Join(",\n        ", deactivateSet)}
                WHERE {_tableBinding.KeyColumnsWhereClause};
                IF @@ROWCOUNT = 0
                    SELECT N'NotFound';
                ELSE
                    SELECT N'Deactivated';
            END CATCH
            SET NOCOUNT OFF;
            """;
    }

    public string GetListPagedSql(int pageNumber, int rowsPerPage, string orderby, object? whereConditions, object? whereNotConditions, bool applyDefaultFilters)
    {
        if (pageNumber < 1) throw new InvalidOperationException("Page must be greater than 0");
        if (rowsPerPage < 1) throw new InvalidOperationException("Rows per page must be greater than 0");

        string orderByClause = NormalizeOrderBy(orderby);
        string? whereClause = WhereClause(whereConditions, whereNotConditions, applyDefaultFilters);

        return !string.IsNullOrWhiteSpace(whereClause) ?
            $"""
             SELECT
             {_tableBinding.SelectColumns}
             FROM {Schema}.{TableName}
             WHERE {whereClause}
             ORDER BY {orderByClause}
             OFFSET ({pageNumber} - 1) * {rowsPerPage} ROWS
             FETCH NEXT {rowsPerPage} ROWS ONLY;
            """
            :
            $"""
             SELECT
             {_tableBinding.SelectColumns}
             FROM {Schema}.{TableName}
             ORDER BY {orderByClause}
             OFFSET ({pageNumber} - 1) * {rowsPerPage} ROWS
             FETCH NEXT {rowsPerPage} ROWS ONLY;
            """;
    }

    public string GetSelectRecordCount(object? whereConditions, object? whereNotConditions, bool applyDefaultFilters)
    {
        string? whereClause = WhereClause(whereConditions, whereNotConditions, applyDefaultFilters);
        return !string.IsNullOrWhiteSpace(whereClause) ?
            $"""
             SELECT COUNT(1)
             FROM {Schema}.{TableName}
             WHERE {whereClause}
            """
            :
            $"""
             SELECT COUNT(1)
             FROM {Schema}.{TableName}
            """;
    }

    public string GetUpdateStatement(params PropertyInfo[] ignoredProperties)
    {
        return $"""
                UPDATE  {Schema}.{TableName}
                SET     {string.Join(",\n", _tableBinding.GetColumnsForUpdate(ignoredProperties).Select(c => $"{c.Name} = @{c.PropertyName}"))}
                WHERE   {_tableBinding.KeyColumnsWhereClause}
        """;
    }

    public string? WhereClause(object? whereConditions, object? whereNotConditions, bool applyDefaultFilters)
    {
        Dictionary<Column, object?>? whereDictionary = _tableBinding.GetColumnDictionaryFromWhereConditions(whereConditions);
        Dictionary<Column, object?>? whereNotDictionary = _tableBinding.GetColumnDictionaryFromWhereConditions(whereNotConditions);

        return WhereClause(whereDictionary, whereNotDictionary, applyDefaultFilters);
    }

    private string? WhereClause(Dictionary<Column, object?>? whereDictionary, Dictionary<Column, object?>? whereNotDictionary, bool applyDefaultFilters)
    {
        List<string> columnstrings = [];

        if (whereDictionary != null)
        {
            columnstrings.AddRange(whereDictionary.Select(keyValuePair =>
            {
                Column column = keyValuePair.Key;
                object? value = StaticHelpers.ConvertValueDapperDbCompatibleInt(column.PropertyInfo, keyValuePair.Value);

                if (value == null || value == DBNull.Value) return $"{column.Name} IS NULL";

                if (value.GetType().IsArray) return $"{column.Name} IN @{column.PropertyName}";

                return $"{column.Name} = @{column.PropertyName}";
            }));
        }

        if (whereNotDictionary != null)
        {
            columnstrings.AddRange(whereNotDictionary.Select(keyValuePair =>
            {
                Column column = keyValuePair.Key;
                object? value = StaticHelpers.ConvertValueDapperDbCompatibleInt(column.PropertyInfo, keyValuePair.Value);

                if (value == null || value == DBNull.Value) return $"{column.Name} IS NOT NULL";

                if (value.GetType().IsArray) return $"{column.Name} NOT IN @{column.PropertyName}";

                return $"{column.Name} <> @{column.PropertyName}";
            }));
        }

        if (applyDefaultFilters)
        {
            if (_tableBinding.DeletedOn != null)
                columnstrings.Add($"{_tableBinding.DeletedOn.Name} IS NULL");
            if (_tableBinding.Active != null)
                columnstrings.Add($"{_tableBinding.Active.Name} = 1");
        }

        return columnstrings.Count == 0 ? null : string.Join("\nAND ", columnstrings);
    }

    internal string NormalizeOrderBy(string? orderby)
    {
        if (string.IsNullOrWhiteSpace(orderby))
            return string.Join(", ", _tableBinding.KeyColumns.Select(c => c.Name));

        string[] parts = orderby.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        List<string> normalized = [];

        foreach (string part in parts)
        {
            string[] tokens = part.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries);
            if (tokens.Length is < 1 or > 2)
                throw new InvalidOperationException($"Invalid ORDER BY fragment '{part}'.");

            string ident = tokens[0].Trim('[', ']');
            Column column = _tableBinding.Columns.FirstOrDefault(c =>
                c.Name.Equals(ident, StringComparison.OrdinalIgnoreCase)
                || c.PropertyName.Equals(ident, StringComparison.OrdinalIgnoreCase))
                ?? throw new InvalidOperationException($"ORDER BY column '{ident}' is not a mapped column of {_tableBinding.TableName}.");

            string dir = "ASC";
            if (tokens.Length == 2)
            {
                if (tokens[1].Equals("ASC", StringComparison.OrdinalIgnoreCase)) dir = "ASC";
                else if (tokens[1].Equals("DESC", StringComparison.OrdinalIgnoreCase)) dir = "DESC";
                else throw new InvalidOperationException($"Invalid ORDER BY direction '{tokens[1]}'.");
            }

            normalized.Add($"{column.Name} {dir}");
        }

        return string.Join(", ", normalized);
    }
}
