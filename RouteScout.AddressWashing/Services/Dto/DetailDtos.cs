using System.Text.Json.Serialization;

namespace RouteScout.AddressWashing.Services.Dto
{
    public class AddressDetailDto
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; }
        [JsonPropertyName("vejstykke")]
        public StreetSectionDto? StreetSection { get; set; }
        [JsonPropertyName("husnr")]
        public string? HouseNumber { get; set; }
        [JsonPropertyName("navngivenvej")]
        public NamedStreetDto? NamedStreet { get; set; }
        [JsonPropertyName("postnummer")]
        public PostalCodeDto? PostalCode { get; set; }
        [JsonPropertyName("adgangspunkt")]
        public AccessPointDto? AccessPoint { get; set; }
    }

    public class StreetSectionDto
    {
        [JsonPropertyName("navn")]
        public string? Name { get; set; }
    }

    public class NamedStreetDto
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; }
    }

    public class PostalCodeDto
    {
        [JsonPropertyName("nr")]
        public string? Number { get; set; }
        [JsonPropertyName("navn")]
        public string? Name { get; set; }
    }

    public class AccessPointDto
    {
        [JsonPropertyName("koordinater")]
        public List<double>? Coordinates { get; set; }
    }
}
