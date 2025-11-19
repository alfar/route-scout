using RouteScout.AddressWashing.Domain;

namespace RouteScout.AddressWashing.Services;

public interface IAddressWashingService
{
    Task<WashResult> WashAddressAsync(string rawAddress);
    Task<WashedAddress?> GetWashedAddressDetailsAsync(string href);
}

