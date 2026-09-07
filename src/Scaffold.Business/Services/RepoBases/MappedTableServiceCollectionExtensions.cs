using System.Reflection;
using Microsoft.Extensions.DependencyInjection;

namespace Scaffold.Business.Services.RepoBases;

public static class MappedTableServiceCollectionExtensions
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddMappedTableBinder(params Assembly[] assemblies)
        {
            services.AddSingleton(assemblies);
            services.AddSingleton<MappedTableChangeBus>();
            services.AddSingleton<MappedTableBinder>();
            return services;
        }

        public IServiceCollection AddMappedTableChangeHandler(Func<MappedTableChange, CancellationToken, Task> handler)
        {
            services.AddSingleton<IMappedTableChangeHandler>(new DelegateMappedTableChangeHandler(handler));
            return services;
        }

        public IServiceCollection AddMappedTableChangeHandler<THandler>()
            where THandler : class, IMappedTableChangeHandler
        {
            services.AddSingleton<IMappedTableChangeHandler, THandler>();
            return services;
        }
    }
}
