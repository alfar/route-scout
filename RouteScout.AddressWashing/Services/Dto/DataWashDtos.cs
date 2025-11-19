using System.Text.Json.Serialization;

namespace RouteScout.AddressWashing.Services.Dto;

public class WashResponseDto
{
    [JsonPropertyName("kategori")]
    public string? Category { get; set; }
    [JsonPropertyName("resultater")]
    public List<WashResultDto>? Results { get; set; }
}

public class WashResultDto
{
    [JsonPropertyName("adresse")]
    public AddressDto? Address { get; set; }
}

public class AddressDto
{
    [JsonPropertyName("href")]
    public string? Href { get; set; }
}
