namespace RouteScout.AddressWashing.Services;

using RouteScout.AddressWashing.Domain;
using Microsoft.Extensions.Logging;
using RouteScout.AddressWashing.Services.Dto;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

public class DanishAddressWashingService : IAddressWashingService
{
    private readonly IHttpClientFactory _httpFactory;
    private readonly ILogger<DanishAddressWashingService> _logger;

    public DanishAddressWashingService(IHttpClientFactory httpFactory, ILogger<DanishAddressWashingService> logger)
    {
        _httpFactory = httpFactory;
        _logger = logger;
    }

    public async Task<WashResult> WashAddressAsync(string rawAddress)
    {
        var client = _httpFactory.CreateClient("DataForsyningen");
        var urlSafe = Uri.EscapeDataString(rawAddress);
        var endpoint = $"datavask/adgangsadresser?betegnelse={urlSafe},%208600%20Silkeborg";

        var response = await client.GetFromJsonAsync<WashResponseDto>(endpoint);
        if (response is null)
        {
            return new WashResult("C", new List<WashedAddress>());
        }

        var kategori = response.Category ?? "C";
        var washed = new List<WashedAddress>();

        if (response.Results is not null)
        {
            foreach (var r in response.Results)
            {
                if (!string.IsNullOrEmpty(r.Address.Href))
                {
                    // generate a stable id for the candidate using hash of href or index
                    var detailedAddress = await GetWashedAddressDetailsAsync(r.Address.Href);

                    if (detailedAddress is not null)
                        washed.Add(detailedAddress);
                }
            }
        }

        return new WashResult(kategori, washed);
    }

    public async Task<WashedAddress?> GetWashedAddressDetailsAsync(string href)
    {
        var client = _httpFactory.CreateClient("DataForsyningen");
        // href is typically an absolute path; remove base if present
        var uri = href.StartsWith("http") ? href : new Uri(client.BaseAddress!, href).ToString();

        try
        {
            var details = await client.GetFromJsonAsync<AddressDetailDto>(uri);
            if (details == null)
                return null;

            double? lat = null;
            double? lon = null;
            if (details.AccessPoint?.Coordinates != null)
            {
                lat = details.AccessPoint.Coordinates[0];
                lon = details.AccessPoint.Coordinates[1];
            }

            return new WashedAddress(details.Id, uri, details.NamedStreet.Id, details.StreetSection.Name, details.HouseNumber, details.PostalCode.Number, details.PostalCode.Name, lat, lon);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed loading detail for {Href}", href);
            return null;
        }
    }
}
