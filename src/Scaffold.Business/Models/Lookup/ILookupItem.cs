namespace Scaffold.Business;

public interface ILookupItem
{
    int Id { get; }
    int? ParentId { get; }
    string Name { get; }
    bool Active { get; }
}

public interface IStaticLookupItem : ILookupItem
{
    static abstract LookupType LookupType { get; }
    static abstract LookupType? ParentLookupType { get; }
}