namespace Scaffold.Business.Services.Caching;

public interface IAppCache
{
    void Clear();

    TItem? Get<TItem>(string cacheKey);

    bool TryGetValue<TItem>(string cacheKey, out TItem? value);

    Task<TItem> GetOrAddAsync<TItem>(
        string cacheKey,
        Func<Task<TItem>> populationMethod,
        bool autoRefresh = false,
        TimeSpan? slidingTimeSpan = null,
        TimeSpan? absoluteTimeSpan = null,
        TimeSpan? semaphoreWaitTimeout = null,
        CancellationToken token = default);

    TItem GetOrAdd<TItem>(
        string cacheKey,
        Func<TItem> populationMethod,
        bool autoRefresh = false,
        TimeSpan? slidingTimeSpan = null,
        TimeSpan? absoluteTimeSpan = null,
        TimeSpan? semaphoreWaitTimeout = null,
        CancellationToken token = default);

    Task AddAsync<TItem>(
        string cacheKey,
        TItem item,
        TimeSpan? slidingTimeSpan = null,
        TimeSpan? absoluteTimeSpan = null,
        TimeSpan? semaphoreWaitTimeout = null,
        CancellationToken token = default);

    void Add<TItem>(
        string cacheKey,
        TItem item,
        TimeSpan? slidingTimeSpan = null,
        TimeSpan? absoluteTimeSpan = null,
        TimeSpan? semaphoreWaitTimeout = null,
        CancellationToken token = default);

    Task<bool> ContainsAsync(string cacheKey, TimeSpan? semaphoreWaitTimeout = null, CancellationToken token = default);

    Task RemoveAsync(string cacheKey, TimeSpan? semaphoreWaitTimeout = null, CancellationToken token = default);

    void Remove(string cacheKey, TimeSpan? semaphoreWaitTimeout = null, CancellationToken token = default);

    Task RemoveAllStartingWithKeyAsync(string key, TimeSpan? semaphoreWaitTimeout = null, CancellationToken token = default);

    void RemoveAllStartingWithKey(string key, TimeSpan? semaphoreWaitTimeout = null, CancellationToken token = default);
}
