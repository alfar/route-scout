using Microsoft.AspNetCore.Http.Json;
using RouteScout.AddressWashing.Services;
using System.Text.Json.Serialization;
using System.Threading.Channels;

namespace RouteScout.AddressWashing.Extensions;
public static class ServiceExtensions
{
    public static IServiceCollection AddAddressWashing(this IServiceCollection services)
    {
        services.AddHttpClient("DataForsyningen", client =>
        {
            client.BaseAddress = new Uri("https://api.dataforsyningen.dk/");
            client.DefaultRequestHeaders.Add("Accept", "application/json");
        });

        services.AddScoped<IAddressCandidateService, AddressCandidateService>();
        services.AddSingleton<IAddressWashingService, DanishAddressWashingService>();

        // Register the Background Service
        services.AddSingleton(Channel.CreateUnbounded<(Guid Id, string RawAddress)>());
        services.AddHostedService<BackgroundAddressWashingService>();

        services.Configure<JsonOptions>(opts =>
        {
            opts.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
        });

        return services;
    }
}
