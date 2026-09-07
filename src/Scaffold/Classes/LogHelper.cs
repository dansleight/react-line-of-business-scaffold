using System.Diagnostics;
using System.Runtime.InteropServices;
using Microsoft.Extensions.DependencyInjection;
using Serilog;
using Serilog.Debugging;
using Serilog.Events;

namespace Scaffold;

public static class LogHelper
{
    public static void UseSerilogBootstrapLogger()
    {
        var loggerConfiguration = new LoggerConfiguration();
        if (Debugger.IsAttached)
        {
            loggerConfiguration.WriteTo.Debug();
        }
        loggerConfiguration.Enrich.FromLogContext();
        loggerConfiguration.WriteTo.Console();
        AddWindowsEventLog(loggerConfiguration, "Scaffold");
        Log.Logger = loggerConfiguration.CreateBootstrapLogger();
    }

    public static IHostBuilder UseSerilogLogging(this IHostBuilder builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        return builder.UseSerilog((context, services, configuration) =>
        {
            LoggerConfiguration loggerConfiguration = configuration
                .ReadFrom.Services(services)
                .ReadFrom.Configuration(context.Configuration);

            PersonIdEnricher? personIdEnricher = services.GetService<PersonIdEnricher>();
            if (personIdEnricher != null)
                loggerConfiguration.Enrich.With(personIdEnricher);

            AddWindowsEventLog(loggerConfiguration, context.HostingEnvironment.ApplicationName);

            if (Debugger.IsAttached)
            {
                loggerConfiguration.WriteTo.Debug();
                SelfLog.Enable(msg => Debug.WriteLine(msg));
            }
            else
            {
                SelfLog.Enable(Console.Out);
            }
        });
    }

    private static void AddWindowsEventLog(LoggerConfiguration loggerConfiguration, string applicationName)
    {
        if (!RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            return;

        try
        {
            loggerConfiguration.WriteTo.EventLog(
                source: applicationName,
                logName: "Application",
                restrictedToMinimumLevel: LogEventLevel.Error);
        }
        catch (Exception ex)
        {
            SelfLog.WriteLine("Windows Event Log sink was not added: {0}", ex);
        }
    }
}
