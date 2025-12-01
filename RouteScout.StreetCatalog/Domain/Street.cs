namespace RouteScout.StreetCatalog.Domain;

public class Street
{
    public Guid Id { get; set; }
    public string StreetCode { get; set; } = string.Empty; // optional external code
    public string Name { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty; // change to string for flexibility
    public int SortOrder { get; set; }
    public Guid AreaId { get; set; }
}
