using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

namespace Scaffold.Business.Services.Caching;

public static class AppCacheServiceCollectionExtensions
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddAppCache(IConfiguration configuration)
        {
            var cacheConfig = configuration.Get<AppCacheConfig>();

            if (cacheConfig == null)
                throw new InvalidOperationException("Unable to populate cache config from given configuration section");

            return services.AddAppCache(cacheConfig);
        }

        public IServiceCollection AddAppCache(AppCacheConfig configuration)
        {
            services.AddSingleton(configuration);
            services.AddSingleton<IAppCache, MemoryAppCache>();
            return services;
        }
    }
}
