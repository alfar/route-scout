using RouteScout.Issues.Services;

namespace RouteScout.Issues.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddIssues(this IServiceCollection services)
    {
        services.AddSingleton<IssueStreamService>();
        services.AddScoped<IIssueService, IssueService>();
        return services;
    }
}
