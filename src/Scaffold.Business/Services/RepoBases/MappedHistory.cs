namespace Scaffold.Business.Services.RepoBases;

public class MappedHistory<T> where T : class
{
    public int HistoryId { get; set; }

    public DateTime HistoryOn { get; set; }

    public string HistoryAction { get; set; } = "";

    public string? HistoryPersonId { get; set; }

    public T Data { get; set; } = null!;
}
