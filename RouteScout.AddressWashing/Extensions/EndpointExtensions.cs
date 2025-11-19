using RouteScout.AddressWashing.Controllers;

namespace RouteScout.AddressWashing.Extensions;

public static class EndpointExtensions
{
    public static IEndpointRouteBuilder MapAddressWashingEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/address-candidates", AddressWashingController.AddAddressTextAsync);
        app.MapGet("/address-candidates", AddressWashingController.GetCandidatesAsync);
        app.MapPost("/address-candidates/{id:guid}/wash", AddressWashingController.WashCandidateAsync);
        app.MapPost("/address-candidates/{id:guid}/select/{addressId:guid}", AddressWashingController.ManualSelectAsync);
        app.MapPost("/address-candidates/{id:guid}/reject", AddressWashingController.RejectAsync);
        app.MapPost("/address-candidates/{id:guid}/confirm", AddressWashingController.ConfirmAsync);

        return app;
    }
}
