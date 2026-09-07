namespace Scaffold.Business.Services.RepoBases;

public enum MappedTableChangeKind
{
    Insert,
    Update,
    Delete,
    Deactivate
}

public sealed class MappedTableChange
{
    public required Type EntityType { get; init; }

    public required string TableName { get; init; }

    public required MappedTableChangeKind Kind { get; init; }

    public string EntityTypeName => EntityType.Name;
}
