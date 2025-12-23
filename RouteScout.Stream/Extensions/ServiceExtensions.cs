using Microsoft.Extensions.DependencyInjection;
using RouteScout.Stream.Services;

namespace RouteScout.Stream.Extensions
{
    public static class ServiceExtensions
    {
        // Registers StreamService as a singleton for publishing SSE events
        public static IServiceCollection AddStream(this IServiceCollection services)
        {
            services.AddSingleton<StreamService>();
            return services;
        }
    }
}
