using System.ComponentModel.DataAnnotations.Schema;
using System.Reflection;

namespace Scaffold.Business.Services.RepoBases;

public class Column
{
    internal Column(PropertyInfo propertyInfo, ColumnAttributes columnAttributes)
    {
        PropertyInfo = propertyInfo;
        ColumnAttributes = columnAttributes;
    }

    internal PropertyInfo PropertyInfo { get; }

    internal ColumnAttributes ColumnAttributes { get; }

    internal Type UnderlyingType => PropertyInfo.PropertyType.GetUnderlyingType();

    internal Type Type => PropertyInfo.PropertyType;

    internal bool IsNullable => Nullable.GetUnderlyingType(Type) != null;

    public string Name => ColumnAttributes.ColumnAttribute.Name ?? PropertyInfo.Name;

    public string PropertyName => PropertyInfo.Name;

    internal bool IsKeyColumn => ColumnAttributes.KeyAttribute != null;

    /// <summary>
    /// Identity columns are omitted from INSERT. Assigned keys (composite, string) are included.
    /// </summary>
    internal bool IsIdentity { get; set; }

    internal bool IncludeInInsertStatement =>
        !IsIdentity
        && ColumnAttributes.NotMappedAttribute == null
        && ColumnAttributes.ReadOnlyAttribute is not { IsReadOnly: true }
        && ColumnAttributes.DatabaseGeneratedAttribute is not { DatabaseGeneratedOption: DatabaseGeneratedOption.Computed };

    internal bool IncludeInUpdateStatement =>
        !IsKeyColumn
        && !IsIdentity
        && ColumnAttributes.NotMappedAttribute == null
        && ColumnAttributes.ReadOnlyAttribute is not { IsReadOnly: true }
        && ColumnAttributes.DatabaseGeneratedAttribute is not { DatabaseGeneratedOption: DatabaseGeneratedOption.Computed };
}
