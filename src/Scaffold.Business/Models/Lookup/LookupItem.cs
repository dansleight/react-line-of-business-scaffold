namespace Scaffold.Business;

public class LookupItem : ILookupItem
{
    public int Id { get; set; }
    public int? ParentId { get; set; }
    public string Name { get; set; } = null!;
    public bool Active { get; set; }

    public static LookupItem From(ILookupItem item) =>
        new()
        {
            Id = item.Id,
            ParentId = item.ParentId,
            Name = item.Name,
            Active = item.Active,
        };
}
