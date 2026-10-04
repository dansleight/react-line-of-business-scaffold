namespace Scaffold.Business;

public class LookupModel
{
    #region Properties

    public DateTime LoadTime { get; set; } = DateTime.Now;
    public LookupType LookupType { get; set; }
    public LookupType? ParentLookupType { get; set; }
    public IEnumerable<ILookupItem> Items { get; set; } = [];

    #endregion

    #region Factory

    public LookupModel() { }

    public static LookupModel Create<T>(IEnumerable<T> items) where T : IStaticLookupItem
    {
        return new LookupModel
        {
            LookupType = T.LookupType,
            ParentLookupType = T.ParentLookupType,
            Items = items.Select(item => LookupItem.From(item))
        };
    }

    #endregion
}