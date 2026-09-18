namespace Scaffold.SpaModels;

public class GlobalSettingsModel
{
    #region Properties

    public string ApplicationMode { get; }
    public MsalSettingsModel? MsalSettings { get; }
    public string? BuildNumber { get; }

    #endregion

    #region Constructor

    public GlobalSettingsModel(string applicationMode, IConfiguration configuration)
    {
        ApplicationMode = applicationMode;
        MsalSettings = MsalSettingsModel.GetMsalSettings(configuration);
        string? buildNumber = configuration.GetValue<string>("ReleaseInformation:BuildNumber");
        if (buildNumber is not null && !buildNumber.StartsWith("#"))
            BuildNumber = buildNumber;
    }

    #endregion

}
