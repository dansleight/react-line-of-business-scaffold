using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Reflection;
using Dapper;

namespace Scaffold.Business.Services.RepoBases;

public interface ITableBinding { }

public class TableBinding<T> : ITableBinding where T : class
{
    private static readonly Type[] ValidKeyColumnTypes = [typeof(string), typeof(int), typeof(long), typeof(short)];
    private static readonly Type[] IntegerKeyTypes = [typeof(int), typeof(long), typeof(short)];

    private IReadOnlyList<Column>? _columnsForUpdate;
    private string? _keyColumnsWhereClause;
    private string? _selectColumns;
    private string? _insertColumns;
    private string? _insertColumnParameters;

    public TableBinding(IEnumerable<Column> columns)
    {
        Table = typeof(T).GetCustomAttributes(typeof(TableAttribute), false).Cast<TableAttribute>().Single();

        Columns = columns.ToArray();
        KeyColumns = Columns.Where(c => c.IsKeyColumn).ToArray();

        if (Columns.Length == 0)
            throw new ArgumentException($"Class {typeof(T).Name} with the {nameof(TableAttribute)} must have at least one property marked with {nameof(ColumnAttribute)}");

        if (KeyColumns.Length == 0)
            throw new ArgumentException($"Class {typeof(T).Name} with the {nameof(TableAttribute)} must have at least one property with a {nameof(ColumnAttribute)} also marked with {nameof(KeyAttribute)}");

        List<string> errors = (
            from keyColumn in KeyColumns
            where !ValidKeyColumnTypes.Contains(keyColumn.UnderlyingType)
            select $"Property {keyColumn.PropertyName} has the key attribute and is of type {keyColumn.Type} which is not supported as a valid key type").ToList();

        if (errors.Count > 0)
        {
            string validColumnTypes = string.Join(", ", (IEnumerable<Type>)ValidKeyColumnTypes);
            throw new InvalidOperationException($"The bound table type {typeof(T).Name} is invalid.\nKey columns must be of type {validColumnTypes}. May be nullable.\n{string.Join("\n", errors)}");
        }

        AssignIdentityFlags();
        ResolveAuditColumns();
        ValidateAuditColumns();
    }

    private TableAttribute Table { get; }
    public Column[] Columns { get; }
    public Column[] KeyColumns { get; }
    public string SelectColumns => _selectColumns ??= "    " + string.Join("\n    , ", Columns.Select(c => c.Name));
    public string InsertColumns => _insertColumns ??= "    " + string.Join("\n    , ", Columns.Where(c => c.IncludeInInsertStatement).Select(c => c.Name));
    public string InsertColumnParameters => _insertColumnParameters ??= "    @" + string.Join("\n  , @", Columns.Where(c => c.IncludeInInsertStatement).Select(c => c.PropertyName));
    public string KeyColumnsWhereClause => _keyColumnsWhereClause ??= string.Join("\nAND ", KeyColumns.Select(c => $"{c.Name} = @{c.PropertyName}"));

    public string TableName => Table.Name;

    public string? Schema => Table.Schema;

    public string HistoryTableName => $"hist_{TableName}";

    public Column? CreatedOn { get; private set; }
    public Column? CreatedPersonId { get; private set; }
    public Column? UpdatedOn { get; private set; }
    public Column? UpdatedPersonId { get; private set; }
    public Column? DeletedOn { get; private set; }
    public Column? DeletedPersonId { get; private set; }
    public Column? Active { get; private set; }

    public bool RequiresPersonIdForInsert => CreatedPersonId != null || UpdatedPersonId != null;
    public bool RequiresPersonIdForUpdate => UpdatedPersonId != null;
    public bool RequiresPersonIdForDelete =>
        DeletedPersonId != null
        || (DeletedOn != null && UpdatedPersonId != null);

    /// <summary>
    /// Person id is required for the generated delete batch: soft-delete person columns,
    /// or lookup deactivate which may stamp UpdatedPersonId.
    /// </summary>
    public bool RequiresPersonIdForDeleteAction =>
        DeletedOn != null
            ? RequiresPersonIdForDelete
            : Active != null && RequiresPersonIdForUpdate;

    internal IEnumerable<Column> GetColumnsForUpdate(PropertyInfo[]? ignoredProperties)
    {
        IReadOnlyList<Column> columns = _columnsForUpdate ??= Columns.Where(c => c.IncludeInUpdateStatement).ToList();

        return ignoredProperties == null || ignoredProperties.Length == 0 ? columns : columns.Where(c => !ignoredProperties.Contains(c.PropertyInfo));
    }

    internal Dictionary<Column, object?>? GetColumnDictionaryFromWhereConditions(object? whereConditions)
    {
        if (whereConditions == null) return null;

        IDictionary<string, object?> whereDictionary = whereConditions as IDictionary<string, object?>
            ?? whereConditions.GetType().GetProperties().ToDictionary(x => x.Name, x => x.GetValue(whereConditions))!;

        ICollection<string> properties = whereDictionary.Keys;

        var columns = new Dictionary<Column, object?>(properties.Count);

        var conditionErrors = new List<string>();

        foreach (string propertyName in properties)
        {
            var column = Columns.SingleOrDefault(c => c.PropertyName.Equals(propertyName));
            if (column != null)
            {
                object? value = whereDictionary[propertyName];

                if (value != null)
                {
                    Type conditionType = value.GetType();
                    if (column.PropertyInfo.PropertyType.GetUnderlyingType() != conditionType)
                    {
                        if (conditionType.IsArray) conditionType = conditionType.GetElementType()!;
                        else if (conditionType.GetInterface(nameof(System.Collections.IEnumerable)) != null && conditionType.GenericTypeArguments.Length == 1)
                            conditionType = conditionType.GenericTypeArguments[0];

                        if (column.PropertyInfo.PropertyType.GetUnderlyingType() != conditionType)
                            conditionErrors.Add($"invalid where condition type. Property {propertyName} type is {column.PropertyInfo.PropertyType.GetUnderlyingType()}. Condition type was {conditionType}");
                    }
                }

                columns.Add(column, value);
            }
            else
            {
                conditionErrors.Add($"invalid property: {propertyName}");
            }
        }

        if (conditionErrors.Count > 0)
            throw new ArgumentException($"{nameof(whereConditions)} contains the following errors: {string.Join(", ", conditionErrors.OrderBy(s => s))}", nameof(whereConditions));

        return columns;
    }

    internal DynamicParameters? GetDynamicParameters(params object?[] parametersArray)
    {
        if (parametersArray.All(p => p == null)) return null;

        DynamicParameters dynamicParameters = new DynamicParameters();
        List<string> parameterErrors = [];

        foreach (object? parameters in parametersArray)
        {
            if (parameters == null) continue;
            switch (parameters)
            {
                case ICollection<KeyValuePair<string, object?>> keyValuePairsNullable:
                    {
                        foreach (KeyValuePair<string, object?> keyValuePair in keyValuePairsNullable)
                        {
                            object? value = keyValuePair.Value;
                            if (value != null)
                            {
                                var column = Columns.SingleOrDefault(c => c.PropertyName.Equals(keyValuePair.Key));
                                if (column != null) value = StaticHelpers.ConvertValueDapperDbCompatible(column.PropertyInfo, value);
                                else parameterErrors.Add($"invalid property: {keyValuePair.Key}");
                            }
                            dynamicParameters.Add(keyValuePair.Key, value);
                        }
                        break;
                    }
                case ICollection<KeyValuePair<string, string>> stringValuePairs:
                    {
                        foreach (KeyValuePair<string, string> keyValuePair in stringValuePairs)
                        {
                            dynamicParameters.Add(keyValuePair.Key, keyValuePair.Value);
                        }
                        break;
                    }
                default:
                    {
                        PropertyInfo[] properties = parameters.GetType().GetProperties();

                        foreach (PropertyInfo property in properties)
                        {
                            dynamicParameters.Add(property.Name, StaticHelpers.GetValueDapperDbCompatible(property, parameters));
                        }
                        break;
                    }
            }
        }

        if (parameterErrors.Count > 0)
            throw new ArgumentException($"{nameof(parametersArray)} contains the following errors: {string.Join(", ", parameterErrors.OrderBy(s => s))}", nameof(parametersArray));

        return dynamicParameters;
    }

    internal void ApplyInsertAudit(T entity, string? personId)
    {
        EnsurePersonId(RequiresPersonIdForInsert, personId, "insert");
        DateTime now = DateTime.Now;
        SetDate(CreatedOn, entity, now);
        SetPerson(CreatedPersonId, entity, personId);
        SetDate(UpdatedOn, entity, now);
        SetPerson(UpdatedPersonId, entity, personId);
    }

    internal void ApplyUpdateAudit(T entity, string? personId)
    {
        if (UpdatedOn == null && UpdatedPersonId == null) return;
        EnsurePersonId(RequiresPersonIdForUpdate, personId, "update");
        DateTime now = DateTime.Now;
        SetDate(UpdatedOn, entity, now);
        SetPerson(UpdatedPersonId, entity, personId);
    }

    internal void ApplySoftDeleteAudit(T entity, string? personId)
    {
        if (DeletedOn == null)
            throw new InvalidOperationException($"{typeof(T).Name} does not map a DeletedOn column.");

        EnsurePersonId(RequiresPersonIdForDelete, personId, "delete");
        DateTime now = DateTime.Now;
        SetDate(DeletedOn, entity, now);

        if (DeletedPersonId != null)
        {
            SetPerson(DeletedPersonId, entity, personId);
            return;
        }

        SetDate(UpdatedOn, entity, now);
        SetPerson(UpdatedPersonId, entity, personId);
    }

    internal void Deactivate(T entity)
    {
        if (Active == null)
            throw new InvalidOperationException($"{typeof(T).Name} does not map an Active column.");

        Active.PropertyInfo.SetValue(entity, false);
    }

    private void AssignIdentityFlags()
    {
        foreach (Column column in Columns)
        {
            var option = column.ColumnAttributes.DatabaseGeneratedAttribute?.DatabaseGeneratedOption;
            if (option == DatabaseGeneratedOption.Identity)
            {
                column.IsIdentity = true;
            }
            else if (option == DatabaseGeneratedOption.None)
            {
                column.IsIdentity = false;
            }
            else if (column.IsKeyColumn
                && KeyColumns.Length == 1
                && IntegerKeyTypes.Contains(column.UnderlyingType)
                && option is null)
            {
                column.IsIdentity = true;
            }
            else
            {
                column.IsIdentity = false;
            }
        }
    }

    private void ResolveAuditColumns()
    {
        CreatedOn = FindColumn("CreatedOn");
        CreatedPersonId = FindColumn("CreatedPersonId");
        UpdatedOn = FindColumn("UpdatedOn");
        UpdatedPersonId = FindColumn("UpdatedPersonId");
        DeletedOn = FindColumn("DeletedOn");
        DeletedPersonId = FindColumn("DeletedPersonId");
        Active = FindColumn("Active");
    }

    private void ValidateAuditColumns()
    {
        List<string> auditErrors = [];

        ExpectType(CreatedOn, typeof(DateTime), auditErrors);
        ExpectType(UpdatedOn, typeof(DateTime), auditErrors);
        ExpectType(DeletedOn, typeof(DateTime), auditErrors);
        ExpectType(CreatedPersonId, typeof(string), auditErrors);
        ExpectType(UpdatedPersonId, typeof(string), auditErrors);
        ExpectType(DeletedPersonId, typeof(string), auditErrors);
        ExpectType(Active, typeof(bool), auditErrors);

        bool anyPerson = CreatedPersonId != null || UpdatedPersonId != null || DeletedPersonId != null;

        if (CreatedPersonId != null && CreatedOn == null)
            auditErrors.Add("CreatedPersonId is mapped without CreatedOn.");
        if (UpdatedPersonId != null && UpdatedOn == null)
            auditErrors.Add("UpdatedPersonId is mapped without UpdatedOn.");
        if (DeletedPersonId != null && DeletedOn == null)
            auditErrors.Add("DeletedPersonId is mapped without DeletedOn.");

        if (anyPerson)
        {
            if (CreatedOn != null && CreatedPersonId == null)
                auditErrors.Add("CreatedOn is mapped; CreatedPersonId is required because other *PersonId columns exist.");
            if (UpdatedOn != null && UpdatedPersonId == null)
                auditErrors.Add("UpdatedOn is mapped; UpdatedPersonId is required because other *PersonId columns exist.");
            if (DeletedOn != null && DeletedPersonId == null && UpdatedPersonId == null)
                auditErrors.Add("DeletedOn is mapped without DeletedPersonId. That is only allowed when UpdatedPersonId exists (soft-delete stamps UpdatedOn / UpdatedPersonId).");
        }

        if (auditErrors.Count > 0)
            throw new InvalidOperationException($"The bound table type {typeof(T).Name} has invalid audit columns.\n{string.Join("\n", auditErrors)}");
    }

    private Column? FindColumn(string name) =>
        Columns.FirstOrDefault(c =>
            c.PropertyName.Equals(name, StringComparison.OrdinalIgnoreCase)
            || c.Name.Equals(name, StringComparison.OrdinalIgnoreCase));

    private static void ExpectType(Column? column, Type expected, List<string> errors)
    {
        if (column != null && column.UnderlyingType != expected)
            errors.Add($"{column.PropertyName} must be {expected.Name}, not {column.Type}.");
    }

    private static void EnsurePersonId(bool required, string? personId, string action)
    {
        if (required && string.IsNullOrWhiteSpace(personId))
            throw new ArgumentException($"A personId is required for {action} on {typeof(T).Name} because person audit columns are mapped.", nameof(personId));
    }

    private static void SetDate(Column? column, T entity, DateTime value)
    {
        column?.PropertyInfo.SetValue(entity, value);
    }

    private static void SetPerson(Column? column, T entity, string? personId)
    {
        if (column == null) return;
        column.PropertyInfo.SetValue(entity, personId);
    }
}
