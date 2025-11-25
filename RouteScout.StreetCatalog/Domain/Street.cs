namespace RouteScout.StreetCatalog.Domain;

public class Street
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int ZipCode { get; set; }
    public int SortOrder { get; set; }
    public Guid AreaId { get; set; }
}
