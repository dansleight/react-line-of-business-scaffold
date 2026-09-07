using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace Scaffold.Business.Services.Caching;

public class MemoryAppCache : IAppCache
{
    private readonly AppCacheConfig _config;

    internal readonly MemoryCache MemoryCache;

    public MemoryAppCache(AppCacheConfig config, ILogger<MemoryAppCache> logger)
    {
        _config = config;
        _ = logger;

        MemoryCache = new MemoryCache(new MemoryCacheOptions());
    }

    public void Clear() => MemoryCache.Clear();

    public Task<bool> ContainsAsync(string cacheKey, TimeSpan? semaphoreWaitTimeout = null, CancellationToken token = default) =>
        Task.FromResult(MemoryCache.TryGetValue(cacheKey, out _));

    public Task RemoveAsync(string cacheKey, TimeSpan? semaphoreWaitTimeout = null, CancellationToken token = default)
    {
        MemoryCache.Remove(cacheKey);
        return Task.CompletedTask;
    }

    public void Remove(string cacheKey, TimeSpan? semaphoreWaitTimeout = null, CancellationToken token = default) =>
        MemoryCache.Remove(cacheKey);

    public Task RemoveAllStartingWithKeyAsync(string key, TimeSpan? semaphoreWaitTimeout = null, CancellationToken token = default)
    {
        RemoveAllStartingWithKey(key, semaphoreWaitTimeout, token);
        return Task.CompletedTask;
    }

    public void RemoveAllStartingWithKey(string key, TimeSpan? semaphoreWaitTimeout = null, CancellationToken token = default)
    {
        var matching = MemoryCache.Keys.Where(k => k.ToString()!.StartsWith(key));
        matching.ToList().ForEach(k => MemoryCache.Remove(k));
    }

    public void Add<TItem>(string cacheKey, TItem item, TimeSpan? slidingTimeSpan = null, TimeSpan? absoluteTimeSpan = null, TimeSpan? semaphoreWaitTimeout = null, CancellationToken token = default) =>
        MemoryCache.Set(cacheKey, item, CreateEntryOptions(slidingTimeSpan, absoluteTimeSpan));

    public Task AddAsync<TItem>(string cacheKey, TItem item, TimeSpan? slidingTimeSpan = null, TimeSpan? absoluteTimeSpan = null, TimeSpan? semaphoreWaitTimeout = null, CancellationToken token = default)
    {
        Add(cacheKey, item, slidingTimeSpan, absoluteTimeSpan, semaphoreWaitTimeout, token);
        return Task.CompletedTask;
    }

    public TItem? Get<TItem>(string cacheKey) =>
        MemoryCache.Get<TItem>(cacheKey);

    public TItem GetOrAdd<TItem>(string cacheKey, Func<TItem> populationMethod, bool autoRefresh = false, TimeSpan? slidingTimeSpan = null, TimeSpan? absoluteTimeSpan = null, TimeSpan? semaphoreWaitTimeout = null, CancellationToken token = default)
    {
        if (MemoryCache.TryGetValue(cacheKey, out TItem? item))
            return item!;

        item = populationMethod();
        MemoryCache.Set(cacheKey, item, CreateEntryOptions(slidingTimeSpan, absoluteTimeSpan));
        return item;
    }

    public async Task<TItem> GetOrAddAsync<TItem>(string cacheKey, Func<Task<TItem>> populationMethod, bool autoRefresh = false, TimeSpan? slidingTimeSpan = null, TimeSpan? absoluteTimeSpan = null, TimeSpan? semaphoreWaitTimeout = null, CancellationToken token = default)
    {
        if (MemoryCache.TryGetValue(cacheKey, out TItem? item))
            return item!;

        item = await populationMethod().ConfigureAwait(false);
        MemoryCache.Set(cacheKey, item, CreateEntryOptions(slidingTimeSpan, absoluteTimeSpan));
        return item;
    }

    public bool TryGetValue<TItem>(string cacheKey, out TItem? value) =>
        MemoryCache.TryGetValue(cacheKey, out value);

    private MemoryCacheEntryOptions CreateEntryOptions(TimeSpan? slidingTimeSpan, TimeSpan? absoluteTimeSpan)
    {
        var options = new MemoryCacheEntryOptions();
        TimeSpan sliding = slidingTimeSpan ?? _config.DefaultSlidingTimespan;
        TimeSpan absolute = absoluteTimeSpan ?? _config.DefaultAbsoluteTimespan;
        if (sliding > TimeSpan.Zero)
            options.SetSlidingExpiration(sliding);
        if (absolute > TimeSpan.Zero)
            options.SetAbsoluteExpiration(absolute);
        return options;
    }
}
