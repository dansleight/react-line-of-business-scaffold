using System.Reflection;
using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace Scaffold.Business;

public class ReportResultModel
{
    public IEnumerable<dynamic> Data { get; set; }

    public ReportConfigModel Config { get; set; }

    #region Derived Properties

    public Dictionary<string, string>? Types => GetPropertyTypes(Data);

    #endregion

    #region Constructor

    public ReportResultModel(IEnumerable<dynamic> data, ReportConfigModel config)
    {
        Data = data;
        Config = config;
    }

    public ReportResultModel(IEnumerable<dynamic> data)
    {
        Data = data;
        Config = new();
    }

    #endregion

    #region Helpers

    internal static Dictionary<string, string> GetPropertyTypes(IEnumerable<dynamic> objs)
    {
        var result = new Dictionary<string, string>();

        if (objs is null || objs.Count() == 0) return result;

        if (objs.First() is not IDictionary<string, object> expando)
            throw new InvalidDataException("Expected expando, got 'real' object.");

        foreach (var kvp in expando) result[kvp.Key] = string.Empty;

        foreach (var obj in objs)
        {
            if (obj is IDictionary<string, object> objExpando) // should always be true at this point
            {
                foreach (var kvp in objExpando)
                {
                    if (result[kvp.Key] == string.Empty && kvp.Value is not null)
                        result[kvp.Key] = TypescriptMappedType(kvp.Value.GetType());
                }
            }

            if (!result.Any(r => r.Value == string.Empty))
                break;
        }
        foreach (var key in result.Keys)
        {
            if (result[key] == string.Empty) result[key] = "any";
        }

        return result;
    }

    internal static string TypescriptMappedType(Type type)
    {
        var maps = new Dictionary<Type, string>
        {
            { typeof(int), "number" },
            { typeof(long), "number" },
            { typeof(short), "number" },
            { typeof(byte), "number" },
            { typeof(float), "number" },
            { typeof(double), "number" },
            { typeof(decimal), "number" },
            { typeof(bool), "boolean" },
            { typeof(string), "string" },
            { typeof(char), "string" },
            { typeof(Guid), "string" },
            { typeof(DateTime), "date" },
            { typeof(object), "any" }
        };
        if (maps.TryGetValue(type, out string? tsType)) return tsType!;
        return "any";
    }

    #endregion
}

public class ReportConfigModel
{
    [JsonProperty("name"), JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonProperty("headings_map"), JsonPropertyName("headings_map")]
    public Dictionary<string, string> HeadingsMap { get; set; } = [];

    [JsonProperty("hide_columns"), JsonPropertyName("hide_columns")]
    public List<string> HideColumns { get; set; } = [];

    [JsonProperty("page_size"), JsonPropertyName("page_size")]
    public int PageSize { get; set; } = 0;

    #region Constructor

    public ReportConfigModel() { }

    public ReportConfigModel(string name)
    {
        Name = name;
    }

    #endregion
}