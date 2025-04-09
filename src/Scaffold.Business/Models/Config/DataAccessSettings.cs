using System;

namespace Scaffold.Business.Models.Config;

public class DataAccessSettings
{
    public Dictionary<string, string>? ConnectionStrings { get; set; }
}
