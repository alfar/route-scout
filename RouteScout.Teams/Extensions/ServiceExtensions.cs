using RouteScout.Teams.Services;

namespace RouteScout.Teams.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddTeams(this IServiceCollection services)
    {
        services.AddScoped<ITeamService, TeamService>();
        return services;
    }
}
