using RouteScout.Teams.Domain.Events;

namespace RouteScout.Teams.Domain;

public class Team
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty; // Team name
    public string TrailerSize { get; set; } = string.Empty; // Small, Large, Boogie
    public string LeaderName { get; set; } = string.Empty;
    public string LeaderPhone { get; set; } = string.Empty;
    public List<string> Members { get; set; } = new();

    public void Apply(TeamCreated e)
    {
        Id = e.TeamId;
        Name = e.TeamName;
        TrailerSize = e.TrailerSize;
        LeaderName = e.LeaderName;
        LeaderPhone = e.LeaderPhone;
    }

    public void Apply(TeamUpdated e)
    {
        Name = e.TeamName;
        TrailerSize = e.TrailerSize;
        LeaderName = e.LeaderName;
        LeaderPhone = e.LeaderPhone;
    }

    public void Apply(TeamMemberAdded e)
    {
        if (!Members.Contains(e.Member)) Members.Add(e.Member);
    }

    public void Apply(TeamMemberRemoved e)
    {
        Members.Remove(e.Member);
    }
}
