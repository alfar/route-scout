using RouteScout.Payments.Application;

namespace RouteScout.Payments.Extensions
{
    public static class ServiceExtensions
    {
        public static IServiceCollection AddPayments(this IServiceCollection services)
        {
            services.AddScoped<PaymentService>();

            return services;
        }
    }
}
