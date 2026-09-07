namespace Scaffold.Business.Services.Caching;

public class AppCacheConfig
{
    public TimeSpan DefaultSlidingTimespan => TimeSpan.FromMinutes(DefaultSlidingTimespanMinutes);
    public TimeSpan DefaultAbsoluteTimespan => TimeSpan.FromMinutes(DefaultAbsoluteTimespanMinutes);
    public TimeSpan SemaphoreWaitTimeout => TimeSpan.FromSeconds(SemaphoreWaitTimeoutSeconds);

    public double DefaultSlidingTimespanMinutes { get; set; }
    public double DefaultAbsoluteTimespanMinutes { get; set; }
    public double SemaphoreWaitTimeoutSeconds { get; set; }

    public int DefaultCachingRecordLimit { get; set; } = 1000;
}
