using RouteScout.Route;

namespace RouteScout.Routes.Extensions
{
    public static class ServiceExtensions
    {
        public static IServiceCollection AddRoutes(this IServiceCollection services)
        {
            services.AddScoped<IStopService, StopService>();
            return services;
        }
    }
}
