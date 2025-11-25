namespace RouteScout.StreetCatalog.Domain;

public class Segment
{
    public Guid Id { get; set; }
    public Guid StreetId { get; set; }
    public int StartNumber { get; set; }
    public int EndNumber { get; set; }
    public int Direction { get; set; } // 1 ascending, -1 descending
    public int SortOrder { get; set; }
}
