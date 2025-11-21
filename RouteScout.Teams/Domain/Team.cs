using RouteScout.Teams.Domain.Events;

namespace RouteScout.Teams.Domain;

public class Team
{
    public Guid Id { get; set; }
    public string TrailerSize { get; set; } = string.Empty; // Small, Large, Boogie
    public string LeaderName { get; set; } = string.Empty;
    public string LeaderPhone { get; set; } = string.Empty;
    public List<string> Members { get; set; } = new();

    public void Apply(TeamCreated e)
    {
        Id = e.TeamId;
        TrailerSize = e.TrailerSize;
        LeaderName = e.LeaderName;
        LeaderPhone = e.LeaderPhone;
        Members = e.Members.ToList();
    }

    public void Apply(TeamUpdated e)
    {
        TrailerSize = e.TrailerSize;
        LeaderName = e.LeaderName;
        LeaderPhone = e.LeaderPhone;
        Members = e.Members.ToList();
    }
}
