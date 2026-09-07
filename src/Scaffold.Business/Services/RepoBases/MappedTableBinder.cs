using System.Collections.Concurrent;
using System.ComponentModel.DataAnnotations.Schema;
using System.Reflection;

namespace Scaffold.Business.Services.RepoBases;

public class MappedTableBinder
{
    private readonly ConcurrentDictionary<Type, ITableBinding> _tableBindings = new();

    public MappedTableBinder(Assembly[] assemblies)
    {
        PopulateTableBindings(assemblies);
    }

    private void PopulateTableBindings(IEnumerable<Assembly> assemblies)
    {
        IEnumerable<Type> tableTypes = GetTypesWithTableAttribute(assemblies);

        foreach (Type tableType in tableTypes)
            SetTableBindingForType(tableType);
    }

    private void SetTableBindingForType(Type tableType)
    {
        IEnumerable<Column> columns = from propertyInfo in tableType.GetProperties()
                                      let columnAttribute = propertyInfo.GetCustomAttributes(typeof(ColumnAttribute), false).Cast<ColumnAttribute>().SingleOrDefault()
                                      where columnAttribute != null
                                      select new Column(propertyInfo, new ColumnAttributes(columnAttribute, propertyInfo));

        Type tableBindingType = typeof(TableBinding<>).MakeGenericType(tableType);
        var tableBinding = (ITableBinding)Activator.CreateInstance(tableBindingType, columns)!;
        _tableBindings[tableType] = tableBinding;
    }

    public TableBinding<T> GetTableBinding<T>() where T : class
    {
        if (typeof(T).GetCustomAttributes(typeof(TableAttribute), false).Cast<TableAttribute>().SingleOrDefault() == null)
            throw new InvalidOperationException($"The given type {typeof(T)} does not have a {nameof(TableAttribute)} and cannot be used with this method.");

        if (!_tableBindings.TryGetValue(typeof(T), out ITableBinding? binding))
            throw new InvalidOperationException($"No table binding for {typeof(T).Name}. Ensure the type has [Table] and its assembly was passed to {nameof(MappedTableBinder)}.");

        return (TableBinding<T>)binding;
    }

    private static IEnumerable<Type> GetTypesWithTableAttribute(IEnumerable<Assembly> assemblies) =>
        TypeMapping.GetExportedTypes(assemblies.ToArray()).typesFound.Where(type => type.IsDefined(typeof(TableAttribute), false));
}
