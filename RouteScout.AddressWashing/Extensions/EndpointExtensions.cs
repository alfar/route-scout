using RouteScout.AddressWashing.Controllers;

namespace RouteScout.AddressWashing.Extensions;

public static class EndpointExtensions
{
    public static IEndpointRouteBuilder MapAddressWashingEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/address-candidates").WithTags("AddressWashing");

        group.MapPost("", AddressWashingController.AddAddressTextAsync);
        group.MapGet("", AddressWashingController.GetCandidatesAsync);
        group.MapPost("/{id:guid}/wash", AddressWashingController.WashCandidateAsync);
        group.MapPost("/{id:guid}/select/{addressId:guid}", AddressWashingController.ManualSelectAsync);
        group.MapPost("/{id:guid}/reject", AddressWashingController.RejectAsync);
        group.MapPost("/{id:guid}/confirm", AddressWashingController.ConfirmAsync);

        return app;
    }
}
